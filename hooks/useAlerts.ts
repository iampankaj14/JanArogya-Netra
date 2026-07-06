import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsRepository } from '../services/repositories/alertsRepository';
import { useAuth } from '../context/AuthContext';
import { AlertItem } from '@/shared/types/alert';

export function useAlerts() {
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Subscribe to real-time alerts
  useEffect(() => {
    const unsubscribe = alertsRepository.subscribeAlerts((data) => {
      setAlerts(data);
      setAlertsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch AI recommendations
  const { data: recommendations = [], isLoading: recsLoading, refetch: refetchRecs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => alertsRepository.getAIRecommendations(),
  });

  const approveMutation = useMutation({
    mutationFn: (recommendationId: string) =>
      alertsRepository.approveMission(recommendationId, authState?.uid || 'system'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['phcs'] });
      refetchRecs();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ recommendationId, reason }: { recommendationId: string; reason?: string }) =>
      alertsRepository.rejectMission(recommendationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      refetchRecs();
    },
  });

  const approveAlert = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  const rejectAlert = async (id: string, reason?: string) => {
    await rejectMutation.mutateAsync({ recommendationId: id, reason });
  };

  return {
    alerts,
    loading: alertsLoading || recsLoading || approveMutation.isPending || rejectMutation.isPending,
    recommendations,
    approveAlert,
    rejectAlert,
  };
}
