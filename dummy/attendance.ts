import { AttendanceRecord } from '@/shared/types/attendance';


export const dummyAttendance: AttendanceRecord[] = [
  {
    id: 'att1',
    date: '2026-06-29',
    facilityId: 'phc_dharampur',
    staffName: 'Dr. Vikram Patel',
    role: 'PHC_MO',
    present: true,
    timeIn: '09:05 AM',
  },
  {
    id: 'att2',
    date: '2026-06-29',
    facilityId: 'phc_kalan',
    staffName: 'Dr. Sarita Varma',
    role: 'PHC_MO',
    present: false,
  },
  {
    id: 'att3',
    date: '2026-06-29',
    facilityId: 'phc_sewapur',
    staffName: 'Dr. Vikram Patel',
    role: 'PHC_MO',
    present: true,
    timeIn: '08:55 AM',
  },
];

export default dummyAttendance;
