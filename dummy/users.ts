import { User } from '@/shared/types/user';

export const dummyUsers: User[] = [
  {
    id: 'u1',
    name: 'Dr. Rajesh Kumar',
    role: 'DHO',
    email: 'rajesh.kumar@health.gov.in',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'u2',
    name: 'Dr. Ananya Sharma',
    role: 'BMO',
    email: 'ananya.sharma@health.gov.in',
    facilityId: 'Bisrakh', // Bisrakh Block
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'u3',
    name: 'Dr. Vikram Patel',
    role: 'PHC_MO',
    email: 'vikram.patel@phc.org',
    facilityId: 'phc_barola', // PHC Barola (in Bisrakh)
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'u4',
    name: 'Sunita Devi',
    role: 'ASHA',
    email: 'sunita.devi@asha.org',
    facilityId: 'phc_barola',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'u5',
    name: 'Amit Singh',
    role: 'DEO',
    email: 'amit.singh@deo.phc.org',
    facilityId: 'phc_barola',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  },
];

export default dummyUsers;
