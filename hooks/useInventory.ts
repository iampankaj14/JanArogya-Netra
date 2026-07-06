import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { phcRepository } from '../services/repositories/phcRepository';
import { transfersRepository } from '../services/repositories/transfersRepository';
import { MedicineStock } from '@/shared/types/medicine';

export function useInventory(facilityId?: string) {
  const queryClient = useQueryClient();
  const [stocks, setStocks] = useState<MedicineStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId) {
      setStocks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = phcRepository.subscribeInventory(facilityId, (data) => {
      setStocks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [facilityId]);

  const updateStockMutation = useMutation({
    mutationFn: ({
      facilityId,
      medicineId,
      newStockCount,
    }: {
      facilityId: string;
      medicineId: string;
      newStockCount: number;
    }) => phcRepository.updateMedicineStock(facilityId, medicineId, newStockCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
    },
  });

  const transferMutation = useMutation({
    mutationFn: ({
      sourceId,
      targetId,
      medicineId,
      qty,
    }: {
      sourceId: string;
      targetId: string;
      medicineId: string;
      qty: number;
    }) => transfersRepository.transferMedicine(sourceId, targetId, medicineId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
    },
  });

  const updateMedicineStock = async (facId: string, medId: string, count: number) => {
    await updateStockMutation.mutateAsync({ facilityId: facId, medicineId: medId, newStockCount: count });
  };

  const transferMedicine = async (sourceId: string, targetId: string, medicineId: string, qty: number) => {
    return transferMutation.mutateAsync({ sourceId, targetId, medicineId, qty });
  };

  return {
    stocks,
    loading: loading || updateStockMutation.isPending || transferMutation.isPending,
    updateMedicineStock,
    transferMedicine,
  };
}
