// services/repositories/notificationsRepository.ts (Integrated with Firebase Firestore)
import { collection, doc, getDocs, updateDoc, deleteDoc, onSnapshot, query, writeBatch, addDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { NotificationItem } from '@/shared/types/notification';
import { LoginRole } from '@/context/AuthContext';
import {
  localNotifications,
  addLocalNotification,
  markAllLocalNotificationsRead,
  clearLocalNotifications,
} from './localDb';

export interface NotificationTarget {
  uid?: string | null;
  role?: LoginRole | null;
  facilityId?: string;
}

// A notification with no target fields is a broadcast, visible to everyone.
// Otherwise it's only visible to the matching uid, role, or facility.
const matchesTarget = (n: NotificationItem, target: NotificationTarget): boolean => {
  if (!n.targetUid && !n.targetRole && !n.targetFacilityId) return true;
  if (n.targetUid && n.targetUid === target.uid) return true;
  if (n.targetRole && n.targetRole === target.role) return true;
  if (n.targetFacilityId && n.targetFacilityId === target.facilityId) return true;
  return false;
};

// Simple pub-sub for local mock notifications
let localNotificationListeners: (() => void)[] = [];

const notifyLocalListeners = () => {
  localNotificationListeners.forEach((cb) => cb());
};

export const notificationsRepository = {
  // Create a targeted (or broadcast, if no target fields set) notification.
  createNotification: async (
    input: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & { read?: boolean }
  ): Promise<void> => {
    if (!isFirebaseConfigured) {
      addLocalNotification({
        id: 'notif_' + Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...input,
      });
      notifyLocalListeners();
      return;
    }
    try {
      await addDoc(collection(db, 'notifications'), {
        timestamp: new Date().toISOString(),
        read: false,
        ...input,
      });
    } catch (e) {
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  getNotifications: async (target: NotificationTarget): Promise<NotificationItem[]> => {
    if (!isFirebaseConfigured) {
      return localNotifications.filter((n) => matchesTarget(n, target));
    }
    try {
      const q = query(collection(db, 'notifications'));
      const querySnapshot = await getDocs(q);
      const all = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as NotificationItem[];
      return all.filter((n) => matchesTarget(n, target));
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  subscribeNotifications: (target: NotificationTarget, callback: (notifications: NotificationItem[]) => void): (() => void) => {
    if (!isFirebaseConfigured) {
      const emit = () => callback(localNotifications.filter((n) => matchesTarget(n, target)));
      localNotificationListeners.push(emit);
      emit();
      return () => {
        localNotificationListeners = localNotificationListeners.filter((l) => l !== emit);
      };
    }

    let unsubscribed = false;
    const q = query(collection(db, 'notifications'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (unsubscribed) return;
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as NotificationItem[];
        callback(all.filter((n) => matchesTarget(n, target)));
      },
      (error) => {
        console.error('Firestore subscribe notifications error', error);
      }
    );
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  },

  markAsRead: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured) {
      const found = localNotifications.find((n) => n.id === id);
      if (found) {
        found.read = true;
        notifyLocalListeners();
      }
      return;
    }
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (e) {
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  markAllAsRead: async (target: NotificationTarget): Promise<void> => {
    if (!isFirebaseConfigured) {
      markAllLocalNotificationsRead();
      notifyLocalListeners();
      return;
    }
    try {
      const q = query(collection(db, 'notifications'));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() } as NotificationItem;
        if (matchesTarget(data, target) && !data.read) {
          batch.update(d.ref, { read: true });
        }
      });
      await batch.commit();
    } catch (e) {
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  clearAll: async (target: NotificationTarget): Promise<void> => {
    if (!isFirebaseConfigured) {
      clearLocalNotifications();
      notifyLocalListeners();
      return;
    }
    try {
      const q = query(collection(db, 'notifications'));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() } as NotificationItem;
        if (matchesTarget(data, target)) {
          batch.delete(d.ref);
        }
      });
      await batch.commit();
    } catch (e) {
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  // Notify local listeners when a notification is added elsewhere in mock mode
  _notifyListeners: () => {
    notifyLocalListeners();
  },
};
