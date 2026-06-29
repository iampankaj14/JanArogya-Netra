import { UserRole } from '@/constants/roles';

export interface AttendanceRecord {
  id: string;
  date: string;
  facilityId: string;
  staffName: string;
  role: UserRole;
  present: boolean;
  timeIn?: string;
}
