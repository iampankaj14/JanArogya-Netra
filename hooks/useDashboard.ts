import { useDistrict } from './useDistrict';
import { useAlerts } from './useAlerts';

export function useDashboard() {
  const { district, loading: districtLoading, refetch: refetchDistrict } = useDistrict();
  const { alerts, loading: alertsLoading, recommendations } = useAlerts();

  const refetch = async () => {
    await refetchDistrict();
  };

  return {
    district,
    alerts,
    recommendations,
    loading: districtLoading || alertsLoading,
    refetch,
  };
}
export default useDashboard;
