export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type?: 'alert' | 'update' | 'report' | 'all';
  category?: string;
  isNew?: boolean;
  // Targeting: notifications with no target fields are broadcast to everyone.
  // Otherwise delivered only to the matching uid, role, or facility.
  targetUid?: string;
  targetRole?: 'DHO' | 'BMO' | 'PHC';
  targetFacilityId?: string;
}
