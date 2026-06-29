import { AlertType, AlertPriority } from '@/constants/alertTypes';

export interface AlertItem {
  id: string;
  title: string;
  type: AlertType;
  priority: AlertPriority;
  facilityId: string;
  facilityName: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}
