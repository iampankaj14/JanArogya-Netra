// services/repositories/phcRepository.ts (Integrated with Firebase Firestore)
import { collection, doc, getDocs, getDoc, updateDoc, query, where, addDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { PHC } from '@/shared/types/phc';
import { MedicineStock } from '@/shared/types/medicine';
import { AttendanceRecord } from '@/shared/types/attendance';
import { UserRole } from '@/constants/roles';
import {
  localPHCs,
  localAttendance,
  localMedicines,
  updateLocalPHC,
  updateLocalMedicine,
  addLocalAttendance,
} from './localDb';

// Simple pub-sub for local mock mode so subscribePHCs/subscribePHC/subscribeInventory
// push fresh data whenever another repository mutates localPHCs/localMedicines.
let localPHCListeners: (() => void)[] = [];
let localInventoryListeners: (() => void)[] = [];
const notifyLocalPHCListeners = () => localPHCListeners.forEach((cb) => cb());
const notifyLocalInventoryListeners = () => localInventoryListeners.forEach((cb) => cb());

export const phcRepository = {
  // Fetch all clinics
  getAllPHCs: async (): Promise<PHC[]> => {
    if (!isFirebaseConfigured) {
      return localPHCs;
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'phcs'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PHC[];
    } catch (error) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  // Fetch clinics with filters
  getPHCs: async (filterBlock?: string, minScore?: number): Promise<PHC[]> => {
    if (!isFirebaseConfigured) {
      return localPHCs.filter((p) => {
        if (filterBlock && p.block !== filterBlock) return false;
        if (minScore !== undefined && p.healthScore < minScore) return false;
        return true;
      });
    }

    try {
      let q = query(collection(db, 'phcs'));
      if (filterBlock) {
        q = query(q, where('block', '==', filterBlock));
      }
      const querySnapshot = await getDocs(q);
      let list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PHC[];

      if (minScore !== undefined) {
        list = list.filter((p) => p.healthScore >= minScore);
      }
      return list;
    } catch (error) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  // Fetch a single PHC
  getPHC: async (phcId: string): Promise<PHC> => {
    if (!isFirebaseConfigured) {
      const found = localPHCs.find((p) => p.id === phcId);
      if (!found) throw new Error('FACILITY/NOT_FOUND');
      return found;
    }

    try {
      const docRef = doc(db, 'phcs', phcId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('FACILITY/NOT_FOUND');
      }
      return { id: docSnap.id, ...docSnap.data() } as PHC;
    } catch (error: any) {
      if (error.message === 'FACILITY/NOT_FOUND') throw error;
      throw new Error('DB/FETCH_ERROR');
    }
  },

  // Real-time list of clinics, optionally filtered by block
  subscribePHCs: (filterBlock: string | undefined, callback: (phcs: PHC[]) => void): (() => void) => {
    if (!isFirebaseConfigured) {
      const emit = () =>
        callback(filterBlock ? localPHCs.filter((p) => p.block === filterBlock) : [...localPHCs]);
      localPHCListeners.push(emit);
      emit();
      return () => {
        localPHCListeners = localPHCListeners.filter((l) => l !== emit);
      };
    }

    let unsubscribed = false;
    let q = query(collection(db, 'phcs'));
    if (filterBlock) {
      q = query(q, where('block', '==', filterBlock));
    }
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (unsubscribed) return;
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PHC[]);
      },
      (error) => {
        console.error('Firestore subscribe PHCs error', error);
      }
    );
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  },

  // Real-time single clinic
  subscribePHC: (phcId: string, callback: (phc: PHC | null) => void): (() => void) => {
    if (!isFirebaseConfigured) {
      const emit = () => callback(localPHCs.find((p) => p.id === phcId) ?? null);
      localPHCListeners.push(emit);
      emit();
      return () => {
        localPHCListeners = localPHCListeners.filter((l) => l !== emit);
      };
    }

    let unsubscribed = false;
    const unsubscribe = onSnapshot(
      doc(db, 'phcs', phcId),
      (snap) => {
        if (unsubscribed) return;
        callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as PHC) : null);
      },
      (error) => {
        console.error('Firestore subscribe PHC error', error);
      }
    );
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  },

  // Notify local listeners when a PHC is mutated elsewhere in mock mode
  _notifyPHCListeners: () => {
    notifyLocalPHCListeners();
  },

  // Notify local listeners when inventory is mutated elsewhere in mock mode
  _notifyInventoryListeners: () => {
    notifyLocalInventoryListeners();
  },

  // Update clinic health score
  updatePHCScore: async (phcId: string, score: number): Promise<void> => {
    if (!isFirebaseConfigured) {
      const found = localPHCs.find((p) => p.id === phcId);
      if (found) {
        updateLocalPHC({ ...found, healthScore: score });
        notifyLocalPHCListeners();
      }
      return;
    }

    try {
      const ref = doc(db, 'phcs', phcId);
      await updateDoc(ref, { healthScore: score });
    } catch (error) {
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  // Fetch inventory for a clinic
  getInventory: async (facilityId: string): Promise<MedicineStock[]> => {
    if (!isFirebaseConfigured) {
      return localMedicines.filter((m) => m.facilityId === facilityId);
    }

    try {
      const q = query(collection(db, 'inventory'), where('facilityId', '==', facilityId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicineStock[];
    } catch (error) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  // Fetch inventory across all facilities (for district/block-level reports)
  getAllInventory: async (): Promise<MedicineStock[]> => {
    if (!isFirebaseConfigured) {
      return localMedicines;
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MedicineStock[];
    } catch (error) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  // Real-time inventory for a clinic
  subscribeInventory: (facilityId: string, callback: (stocks: MedicineStock[]) => void): (() => void) => {
    if (!isFirebaseConfigured) {
      const emit = () => callback(localMedicines.filter((m) => m.facilityId === facilityId));
      localInventoryListeners.push(emit);
      emit();
      return () => {
        localInventoryListeners = localInventoryListeners.filter((l) => l !== emit);
      };
    }

    let unsubscribed = false;
    const q = query(collection(db, 'inventory'), where('facilityId', '==', facilityId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (unsubscribed) return;
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as MedicineStock[]);
      },
      (error) => {
        console.error('Firestore subscribe inventory error', error);
      }
    );
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  },

  // Update inventory count
  updateMedicineStock: async (
    facilityId: string,
    medicineId: string,
    newStockCount: number
  ): Promise<MedicineStock> => {
    if (!isFirebaseConfigured) {
      const found = localMedicines.find((m) => m.id === medicineId && m.facilityId === facilityId);
      if (!found) {
        throw new Error('FACILITY/NOT_FOUND');
      }
      const updated = { ...found, currentStock: newStockCount };
      updateLocalMedicine(updated);
      notifyLocalInventoryListeners();
      return updated;
    }

    try {
      const docRef = doc(db, 'inventory', medicineId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('FACILITY/NOT_FOUND');
      }
      await updateDoc(docRef, { currentStock: newStockCount });
      return { id: medicineId, ...docSnap.data(), currentStock: newStockCount } as MedicineStock;
    } catch (error: any) {
      if (error.message === 'FACILITY/NOT_FOUND') throw error;
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  // Add new medicine to inventory
  addMedicine: async (medicine: MedicineStock): Promise<MedicineStock> => {
    if (!isFirebaseConfigured) {
      const { addLocalMedicine } = require('./localDb');
      addLocalMedicine(medicine);
      notifyLocalInventoryListeners();
      return medicine;
    }

    try {
      const docRef = doc(db, 'inventory', medicine.id);
      await updateDoc(docRef, medicine as any); // using updateDoc or setDoc but it's new
      return medicine;
    } catch (error) {
      // If it doesn't exist we should use setDoc
      try {
        const { setDoc } = require('firebase/firestore');
        const docRef = doc(db, 'inventory', medicine.id);
        await setDoc(docRef, medicine);
        return medicine;
      } catch (err) {
         throw new Error('DB/MUTATION_FAILED');
      }
    }
  },

  // Fetch attendance records for a clinic
  getAttendance: async (facilityId: string): Promise<AttendanceRecord[]> => {
    if (!isFirebaseConfigured) {
      return localAttendance.filter((a) => a.facilityId === facilityId);
    }

    try {
      const q = query(collection(db, 'attendance'), where('facilityId', '==', facilityId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[];
    } catch (error) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  // Log doctor/staff daily attendance
  updateAttendance: async (
    facilityId: string,
    staffName: string,
    role: UserRole,
    present: boolean,
    timeIn?: string
  ): Promise<AttendanceRecord> => {
    const today = new Date().toISOString().split('T')[0];

    if (!isFirebaseConfigured) {
      const record: AttendanceRecord = {
        id: 'att_' + Date.now(),
        date: today,
        facilityId,
        staffName,
        role,
        present,
        timeIn,
      };
      addLocalAttendance(record);
      // Also update doctorAvailable status on the PHC itself
      if (role === 'PHC_MO') {
        const phc = localPHCs.find((p) => p.id === facilityId);
        if (phc) {
          updateLocalPHC({ ...phc, doctorAvailable: present });
          notifyLocalPHCListeners();
        }
      }
      return record;
    }

    try {
      const recordData = {
        date: today,
        facilityId,
        staffName,
        role,
        present,
        timeIn: timeIn || null,
      };

      const docRef = await addDoc(collection(db, 'attendance'), recordData);

      // Also update doctorAvailable status in the facilities collection
      if (role === 'PHC_MO') {
        const phcRef = doc(db, 'phcs', facilityId);
        await updateDoc(phcRef, { doctorAvailable: present });
      }

      return {
        id: docRef.id,
        ...recordData,
        timeIn: timeIn || undefined,
      } as AttendanceRecord;
    } catch (error) {
      throw new Error('DB/MUTATION_FAILED');
    }
  },
};
