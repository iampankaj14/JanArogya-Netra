import { useQuery } from '@tanstack/react-query';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { DistrictSummary } from '@/shared/types/district';
import { localDistrict, localAlerts, localPHCs, localTransfers } from '../services/repositories/localDb';

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
        const docRef = doc(db, 'district', 'summary');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as DistrictSummary;
        }
        throw new Error('DB/FETCH_ERROR');
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
