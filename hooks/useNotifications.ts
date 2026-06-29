import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsRepository } from '../services/repositories/notificationsRepository';
import { useAuthStore } from '../store/useAuthStore';

export function useNotifications() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: notifications = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => (user?.id ? notificationsRepository.getNotifications(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const markMutation = useMutation({
    mutationFn: (id: string) => notificationsRepository.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      refetch();
    },
  });

  const markAsRead = async (id: string) => {
    await markMutation.mutateAsync(id);
  };

  return {
    notifications,
    loading: loading || markMutation.isPending,
    markAsRead,
  };
}
