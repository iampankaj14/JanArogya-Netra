import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phcRepository } from '../services/repositories/phcRepository';
import { transfersRepository } from '../services/repositories/transfersRepository';

export function useInventory(facilityId?: string) {
  const queryClient = useQueryClient();

  const { data: stocks = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['inventory', facilityId],
    queryFn: () => (facilityId ? phcRepository.getInventory(facilityId) : Promise.resolve([])),
    enabled: !!facilityId,
  });

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
      queryClient.invalidateQueries({ queryKey: ['inventory', facilityId] });
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
      refetch();
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
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
      refetch();
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
