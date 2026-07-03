// services/repositories/alertsRepository.ts (Integrated with Firebase Firestore)
import { collection, doc, getDocs, getDoc, updateDoc, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { AlertItem } from '@/shared/types/alert';
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

// Simple pub-sub for local mock notifications
let localAlertListeners: ((alerts: AlertItem[]) => void)[] = [];

export const alertsRepository = {
  getAlerts: async (): Promise<AlertItem[]> => {
    if (!isFirebaseConfigured) {
      return localAlerts;
    }
    try {
      const q = query(collection(db, 'alerts'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AlertItem[];
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  getActiveAlerts: async (): Promise<AlertItem[]> => {
    if (!isFirebaseConfigured) {
      return localAlerts.filter((a) => !a.resolved);
    }
    try {
      const q = query(collection(db, 'alerts'), where('resolved', '==', false));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AlertItem[];
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

    const q = query(collection(db, 'alerts'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AlertItem[];
        callback(list);
      },
      (error) => {
        console.error('Firestore subscribe alerts error', error);
      }
    );
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
