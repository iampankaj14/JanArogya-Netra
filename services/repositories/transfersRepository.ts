// services/repositories/transfersRepository.ts (Integrated with Firebase Firestore)
import { collection, doc, getDocs, getDoc, updateDoc, addDoc, query, runTransaction } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import {
  localTransfers,
  localMedicines,
  addLocalTransfer,
  updateLocalMedicine,
  addLocalNotification,
  TransferOrder,
  localPHCs,
} from './localDb';
import { notificationsRepository } from './notificationsRepository';
import { phcRepository } from './phcRepository';

// Firestore transfer docs may use the legacy shape (sourceId/targetId/date) instead of
// the app's canonical TransferOrder shape (sourceFacilityId/targetFacilityId/timestamp).
// Normalize at the boundary so the rest of the app only ever sees the canonical fields.
const normalizeTransfer = (id: string, data: any): TransferOrder => ({
  id,
  recommendationId: data.recommendationId,
  sourceFacilityId: data.sourceFacilityId ?? data.sourceId,
  targetFacilityId: data.targetFacilityId ?? data.targetId,
  medicineId: data.medicineId,
  medicineName: data.medicineName,
  quantity: data.quantity,
  status: data.status,
  timestamp: data.timestamp ?? data.date,
});

export const transfersRepository = {
  getTransfers: async (): Promise<TransferOrder[]> => {
    if (!isFirebaseConfigured) {
      return localTransfers;
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'transfers'));
      return querySnapshot.docs.map((doc) => normalizeTransfer(doc.id, doc.data()));
    } catch (e) {
      throw new Error('DB/FETCH_ERROR');
    }
  },

  createOrder: async (order: Omit<TransferOrder, 'id' | 'status' | 'timestamp'>): Promise<string> => {
    if (!isFirebaseConfigured) {
      const id = 'trans_' + Date.now();
      const newOrder: TransferOrder = {
        ...order,
        id,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      };
      addLocalTransfer(newOrder);

      // Perform stock changes locally
      const sourceStock = localMedicines.find(
        (m) => m.facilityId === order.sourceFacilityId && (m.id === order.medicineId || m.name === order.medicineId)
      );
      if (sourceStock) {
        if (sourceStock.currentStock < order.quantity) {
          throw new Error('INSUFFICIENT_STOCK');
        }
        updateLocalMedicine({ ...sourceStock, currentStock: sourceStock.currentStock - order.quantity });
      }

      const targetStock = localMedicines.find(
        (m) => m.facilityId === order.targetFacilityId && (m.id === order.medicineId || m.name === order.medicineId)
      );
      if (targetStock) {
        updateLocalMedicine({ ...targetStock, currentStock: targetStock.currentStock + order.quantity });
      }
      phcRepository._notifyInventoryListeners();

      addLocalNotification({
        id: 'notif_' + Date.now(),
        title: 'Transfer Dispatched',
        message: `Transfer of ${order.quantity} units of ${order.medicineName} has been initialized.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      notificationsRepository._notifyListeners();

      return id;
    }

    try {
      const id = await runTransaction(db, async (transaction) => {
        // Find source stock doc
        const srcQuery = query(collection(db, 'inventory'));
        const srcSnap = await getDocs(srcQuery);
        const sourceDoc = srcSnap.docs.find(
          (d) => d.data().facilityId === order.sourceFacilityId && d.data().name === order.medicineName
        );

        if (!sourceDoc) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        const sourceData = sourceDoc.data();
        if (sourceData.currentStock < order.quantity) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        // Find target stock doc
        const targetDoc = srcSnap.docs.find(
          (d) => d.data().facilityId === order.targetFacilityId && d.data().name === order.medicineName
        );

        // Deduct from source
        transaction.update(doc(db, 'inventory', sourceDoc.id), {
          currentStock: sourceData.currentStock - order.quantity,
        });

        // Add to target
        if (targetDoc) {
          transaction.update(doc(db, 'inventory', targetDoc.id), {
            currentStock: targetDoc.data().currentStock + order.quantity,
          });
        }

        // Add transfer order doc
        const transferRef = doc(collection(db, 'transfers'));
        transaction.set(transferRef, {
          sourceFacilityId: order.sourceFacilityId,
          targetFacilityId: order.targetFacilityId,
          medicineId: order.medicineId,
          medicineName: order.medicineName,
          quantity: order.quantity,
          status: 'PENDING',
          timestamp: new Date().toISOString(),
        });

        const notificationRef = doc(collection(db, 'notifications'));
        transaction.set(notificationRef, {
          title: 'Transfer Dispatched',
          message: `Transfer of ${order.quantity} units of ${order.medicineName} has been initialized.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'update',
        });

        return transferRef.id;
      });

      return id;
    } catch (e: any) {
      if (e.message === 'INSUFFICIENT_STOCK') {
        throw e;
      }
      throw new Error('DB/MUTATION_FAILED');
    }
  },

  transferMedicine: async (
    sourceFacilityId: string,
    targetFacilityId: string,
    medicineId: string,
    quantity: number
  ): Promise<string> => {
    let medicineName = medicineId;
    if (!isFirebaseConfigured) {
      const med = localMedicines.find((m) => m.id === medicineId || m.name === medicineId);
      if (med) medicineName = med.name;
    }
    return transfersRepository.createOrder({
      sourceFacilityId,
      targetFacilityId,
      medicineId,
      medicineName,
      quantity,
    });
  },
};
