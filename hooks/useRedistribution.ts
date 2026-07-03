import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { transfersRepository } from '../services/repositories/transfersRepository';
import { TransferOrder, localTransfers, updateLocalTransferStatus } from '../services/repositories/localDb';

export function useRedistribution() {
  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading: loading, refetch } = useQuery<TransferOrder[]>({
    queryKey: ['transfers'],
    queryFn: () => transfersRepository.getTransfers(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'PENDING' | 'EN_ROUTE' | 'DELIVERED' }) => {
      if (!isFirebaseConfigured) {
        updateLocalTransferStatus(id, status);
        return;
      }
      try {
        const docRef = doc(db, 'transfers', id);
        await updateDoc(docRef, { status });
      } catch (e) {
        throw new Error('DB/MUTATION_FAILED');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
      queryClient.invalidateQueries({ queryKey: ['districtSummary'] });
      refetch();
    },
  });

  const executeTransfer = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'EN_ROUTE' });
  };

  const confirmReceipt = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'DELIVERED' });
  };

  return {
    transfers,
    loading: loading || updateStatusMutation.isPending,
    executeTransfer,
    confirmReceipt,
    refetch,
  };
}
