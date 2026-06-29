import { User } from '@/shared/types/user';


export const dummyUsers: User[] = [
  {
    id: 'u1',
    name: 'Dr. Rajesh Kumar',
    role: 'DHO',
    email: 'rajesh.kumar@health.gov.in',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'u2',
    name: 'Dr. Ananya Sharma',
    role: 'BMO',
    email: 'ananya.sharma@health.gov.in',
    facilityId: 'f1', // Dharampur Block
  },
  {
    id: 'u3',
    name: 'Dr. Vikram Patel',
    role: 'PHC_MO',
    email: 'vikram.patel@phc.org',
    facilityId: 'phc_dharampur', // Dharampur PHC
  },
  {
    id: 'u4',
    name: 'Sunita Devi',
    role: 'ASHA',
    email: 'sunita.devi@asha.org',
    facilityId: 'phc_dharampur',
  },
  {
    id: 'u5',
    name: 'Amit Singh',
    role: 'DEO',
    email: 'amit.singh@deo.phc.org',
    facilityId: 'phc_dharampur',
  },
];

export default dummyUsers;
