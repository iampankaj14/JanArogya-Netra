import { AttendanceRecord } from '@/shared/types/attendance';


export const dummyAttendance: AttendanceRecord[] = [
  {
    id: 'att1',
    date: '2026-06-29',
    facilityId: 'phc_barola',
    staffName: 'Dr. Vikram Patel',
    role: 'PHC_MO',
    present: true,
    timeIn: '09:05 AM',
  },
  {
    id: 'att2',
    date: '2026-06-29',
    facilityId: 'phc_badalpur',
    staffName: 'Dr. Sarita Varma',
    role: 'PHC_MO',
    present: false,
  },
  {
    id: 'att3',
    date: '2026-06-29',
    facilityId: 'phc_mandi_shyam_nagar',
    staffName: 'Dr. Vikram Patel',
    role: 'PHC_MO',
    present: true,
    timeIn: '08:55 AM',
  },
];

export default dummyAttendance;
