import { collection, doc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { NotificationItem } from '@/shared/types/notification';
import { localNotifications } from './localDb';

export const notificationsRepository = {
  getNotifications: async (userId: string): Promise<NotificationItem[]> => {
    if (!isFirebaseConfigured) {
      return localNotifications;
    }
    try {
      // Query notifications associated with user or general notifications
      const q = query(collection(db, 'notifications'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationItem[];
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured) {
      const found = localNotifications.find((n) => n.id === id);
      if (found) {
        found.read = true;
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
};
