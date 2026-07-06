// services/repositories/alertsRepository.ts (Integrated with Firebase Firestore)
import { collection, doc, getDocs, getDoc, updateDoc, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { AlertItem } from '@/shared/types/alert';
import { AlertType, AlertPriority } from '@/constants/alertTypes';
import { AIRecommendation } from '@/shared/types/ai';
import {
  localAlerts,
  localRecommendations,
  removeLocalRecommendation,
  addLocalTransfer,
  TransferOrder,
  localPHCs,
  addLocalNotification,
} from './localDb';
import { phcRepository } from './phcRepository';
import { notificationsRepository } from './notificationsRepository';

// Simple pub-sub for local mock notifications
let localAlertListeners: ((alerts: AlertItem[]) => void)[] = [];

// Firestore alert docs use a legacy shape (type: "stock"/"staff", severity, date, read)
// that doesn't match the app's canonical AlertItem contract. Normalize at the boundary
// so the rest of the app can keep using type/priority/timestamp/resolved everywhere.
const ALERT_TYPE_MAP: Record<string, AlertType> = {
  stock: 'SHORTAGE',
  staff: 'ABSENCE',
  outbreak: 'OUTBREAK',
  shortage: 'SHORTAGE',
  absence: 'ABSENCE',
  supply_chain: 'SUPPLY_CHAIN',
  weather: 'WEATHER',
  facility: 'FACILITY',
};

const CANONICAL_ALERT_TYPES: AlertType[] = ['OUTBREAK', 'SHORTAGE', 'ABSENCE', 'SUPPLY_CHAIN', 'WEATHER', 'FACILITY'];

const normalizeAlertType = (rawType: unknown): AlertType => {
  const raw = String(rawType ?? '');
  if (CANONICAL_ALERT_TYPES.includes(raw as AlertType)) return raw as AlertType;
  return ALERT_TYPE_MAP[raw.toLowerCase()] ?? 'FACILITY';
};

const normalizeAlertPriority = (rawPriority: unknown): AlertPriority => {
  const key = String(rawPriority ?? '').toUpperCase();
  return (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).includes(key as AlertPriority)
    ? (key as AlertPriority)
    : 'MEDIUM';
};

const normalizeAlert = (id: string, data: any, facilityNameById: Record<string, string>): AlertItem => ({
  id,
  title: data.title ?? '',
  type: normalizeAlertType(data.type),
  priority: normalizeAlertPriority(data.priority ?? data.severity),
  facilityId: data.facilityId,
  facilityName: data.facilityName ?? facilityNameById[data.facilityId] ?? data.facilityId,
  description: data.description ?? '',
  timestamp: data.timestamp ?? data.date ?? '',
  resolved: data.resolved ?? data.read === true,
});

const getFacilityNameMap = async (): Promise<Record<string, string>> => {
  try {
    const phcs = await phcRepository.getAllPHCs();
    return Object.fromEntries(phcs.map((p) => [p.id, p.name]));
  } catch {
    return {};
  }
};

export const alertsRepository = {
  getAlerts: async (): Promise<AlertItem[]> => {
    if (!isFirebaseConfigured) {
      return localAlerts;
    }
    try {
      const facilityNameById = await getFacilityNameMap();
      const q = query(collection(db, 'alerts'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => normalizeAlert(doc.id, doc.data(), facilityNameById));
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  getActiveAlerts: async (): Promise<AlertItem[]> => {
    if (!isFirebaseConfigured) {
      return localAlerts.filter((a) => !a.resolved);
    }
    try {
      const all = await alertsRepository.getAlerts();
      return all.filter((a) => !a.resolved);
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  subscribeAlerts: (callback: (alerts: AlertItem[]) => void): (() => void) => {
    if (!isFirebaseConfigured) {
      localAlertListeners.push(callback);
      callback([...localAlerts]);
      return () => {
        localAlertListeners = localAlertListeners.filter((l) => l !== callback);
      };
    }

    let unsubscribed = false;
    let facilityNameById: Record<string, string> = {};
    getFacilityNameMap().then((map) => {
      facilityNameById = map;
    });

    const q = query(collection(db, 'alerts'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (unsubscribed) return;
        const list = snapshot.docs.map((doc) => normalizeAlert(doc.id, doc.data(), facilityNameById));
        callback(list);
      },
      (error) => {
        console.error('Firestore subscribe alerts error', error);
      }
    );
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  },

  // Notify local listeners when in mock mode
  _notifyListeners: () => {
    localAlertListeners.forEach((cb) => cb([...localAlerts]));
  },

  getAIRecommendations: async (): Promise<AIRecommendation[]> => {
    if (!isFirebaseConfigured) {
      return localRecommendations;
    }
    try {
      const q = query(collection(db, 'recommendations'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AIRecommendation[];
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  approveMission: async (recommendationId: string, approvedByUserId: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      const rec = localRecommendations.find((r) => r.id === recommendationId);
      if (!rec) {
        throw new Error('REDISTRIBUTION/NOT_FOUND');
      }

      const sourcePhc = localPHCs.find((p) => p.name === rec.sourceFacility || p.id === rec.sourceFacility);
      const targetPhc = localPHCs.find((p) => p.name === rec.targetFacility || p.id === rec.targetFacility);

      // Create a transfer order
      const order: TransferOrder = {
        id: 'trans_' + Date.now(),
        recommendationId,
        sourceFacilityId: sourcePhc?.id || rec.sourceFacility,
        targetFacilityId: targetPhc?.id || rec.targetFacility,
        medicineId: rec.item,
        medicineName: rec.item,
        quantity: rec.quantity,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      };
      addLocalTransfer(order);

      // Remove from recommendations
      removeLocalRecommendation(recommendationId);

      // Resolve matching alerts
      const matchingAlerts = localAlerts.filter(
        (a) => a.facilityId === (sourcePhc?.id || rec.sourceFacility) || a.facilityId === (targetPhc?.id || rec.targetFacility)
      );
      matchingAlerts.forEach((a) => {
        a.resolved = true;
      });
      alertsRepository._notifyListeners();

      // Add a notification for operations log
      addLocalNotification({
        id: 'notif_' + Date.now(),
        title: 'Redistribution Approved',
        message: `DHO approved transfer of ${rec.quantity} units of ${rec.item} from ${rec.sourceFacility} to ${rec.targetFacility}.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      notificationsRepository._notifyListeners();

      return true;
    }

    try {
      const recRef = doc(db, 'recommendations', recommendationId);
      const recSnap = await getDoc(recRef);
      if (!recSnap.exists()) {
        throw new Error('REDISTRIBUTION/NOT_FOUND');
      }
      const recData = recSnap.data() as AIRecommendation;

      // Create a transfer order in Firestore
      await addDoc(collection(db, 'transfers'), {
        recommendationId,
        sourceFacilityId: recData.sourceFacility,
        targetFacilityId: recData.targetFacility,
        medicineId: recData.item,
        medicineName: recData.item,
        quantity: recData.quantity,
        status: 'PENDING',
        approvedBy: approvedByUserId,
        timestamp: new Date().toISOString(),
      });

      // Update recommendation status
      await updateDoc(recRef, { resolved: true });

      // Add a notification for the operations log (previously only written in local/offline mode)
      await addDoc(collection(db, 'notifications'), {
        title: 'Redistribution Approved',
        message: `Transfer of ${recData.quantity} units of ${recData.item} from ${recData.sourceFacility} to ${recData.targetFacility} was approved.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'update',
      });

      return true;
    } catch (error: any) {
      if (error.message === 'REDISTRIBUTION/NOT_FOUND') throw error;
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  rejectMission: async (recommendationId: string, reason?: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      const rec = localRecommendations.find((r) => r.id === recommendationId);
      if (!rec) {
        throw new Error('REDISTRIBUTION/NOT_FOUND');
      }
      removeLocalRecommendation(recommendationId);
      return true;
    }

    try {
      const recRef = doc(db, 'recommendations', recommendationId);
      const recSnap = await getDoc(recRef);
      if (!recSnap.exists()) {
        throw new Error('REDISTRIBUTION/NOT_FOUND');
      }
      await updateDoc(recRef, { rejected: true, rejectReason: reason || '' });
      return true;
    } catch (error: any) {
      if (error.message === 'REDISTRIBUTION/NOT_FOUND') throw error;
      throw new Error('DB/MUTATION_FAILED');
    }
  },
};
