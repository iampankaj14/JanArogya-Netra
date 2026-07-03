export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'alert' | 'update' | 'report' | 'all';
  category?: string;
  isNew?: boolean;
}
