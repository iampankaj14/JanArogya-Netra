import { AlertType, AlertPriority } from '@/constants/alertTypes';

export interface AlertItem {
  id: string;
  title: string;
  titleHi?: string;
  type: AlertType;
  priority: AlertPriority;
  facilityId: string;
  facilityName: string;
  description: string;
  descriptionHi?: string;
  timestamp: string;
  resolved: boolean;
}
