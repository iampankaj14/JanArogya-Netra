import { collection, getDocs, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { ReportItem } from '@/shared/types/report';
import { localReports } from './localDb';

export const reportsRepository = {
  getReports: async (): Promise<ReportItem[]> => {
    if (!isFirebaseConfigured) {
      return localReports;
    }
    try {
      const q = query(collection(db, 'reports'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReportItem[];
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },
};
