import { UserRole } from '@/constants/roles';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  facilityId?: string;
  avatarUrl?: string;
}
