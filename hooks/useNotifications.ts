import { useEffect, useState } from 'react';
import { notificationsRepository } from '../services/repositories/notificationsRepository';
import { useAuth } from '../context/AuthContext';
import { NotificationItem } from '@/shared/types/notification';

export function useNotifications() {
  const { authState } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const target = { uid: authState?.uid, role: authState?.role, facilityId: authState?.facilityId };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = notificationsRepository.subscribeNotifications(target, (data) => {
      setNotifications(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [authState?.uid, authState?.role, authState?.facilityId]);

  const markAsRead = async (id: string) => {
    await notificationsRepository.markAsRead(id);
  };

  const markAllAsRead = async () => {
    await notificationsRepository.markAllAsRead(target);
  };

  const clearAll = async () => {
    await notificationsRepository.clearAll(target);
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
