import { useQuery } from '@tanstack/react-query';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import { DistrictSummary } from '@/shared/types/district';
import { localDistrict, localAlerts, localPHCs, localTransfers } from '../services/repositories/localDb';
import { phcRepository } from '../services/repositories/phcRepository';
import { alertsRepository } from '../services/repositories/alertsRepository';
import { transfersRepository } from '../services/repositories/transfersRepository';

export function useDistrict() {
  const { data: district, isLoading: loading, refetch } = useQuery<DistrictSummary>({
    queryKey: ['districtSummary'],
    queryFn: async () => {
      if (!isFirebaseConfigured) {
        // Return computed telemetry based on active localDb values
        const activeAlerts = localAlerts.filter((a) => !a.resolved).length;
        const totalPHCs = localPHCs.length;

        // Calculate average health index
        const totalScore = localPHCs.reduce((acc, p) => acc + p.healthScore, 0);
        const healthIndex = totalPHCs > 0 ? Math.round(totalScore / totalPHCs) : 0;

        return {
          name: localDistrict.name,
          totalPHCs,
          activeAlerts,
          healthIndex,
          supplyTransferRequestsTotal: localTransfers.length + 5, // base mock count
          averagePatientWaitTimeMinutes: localDistrict.averagePatientWaitTimeMinutes,
        };
      }

      try {
        // No 'district' collection is documented in firebase_data_reference.md, so aggregate
        // the summary from the same phcs/alerts/transfers collections the rest of the app reads,
        // instead of depending on an undocumented static district/summary document.
        const [phcs, activeAlertItems, transfers] = await Promise.all([
          phcRepository.getAllPHCs(),
          alertsRepository.getActiveAlerts(),
          transfersRepository.getTransfers(),
        ]);

        const totalPHCs = phcs.length;
        const totalScore = phcs.reduce((acc, p) => acc + p.healthScore, 0);
        const healthIndex = totalPHCs > 0 ? Math.round(totalScore / totalPHCs) : 0;

        return {
          name: localDistrict.name,
          totalPHCs,
          activeAlerts: activeAlertItems.length,
          healthIndex,
          supplyTransferRequestsTotal: transfers.length,
          averagePatientWaitTimeMinutes: localDistrict.averagePatientWaitTimeMinutes,
        };
      } catch (e) {
        throw new Error('DB/FETCH_ERROR');
      }
    },
  });

  return {
    district,
    loading,
    refetch,
  };
}
