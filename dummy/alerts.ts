import { AlertItem } from '@/shared/types/alert';


export const dummyAlerts: AlertItem[] = [
  {
    id: 'a1',
    title: 'Dengue Surge Warning',
    type: 'OUTBREAK',
    priority: 'CRITICAL',
    facilityId: 'phc_kalan',
    facilityName: 'Rampur Kalan PHC',
    description: 'Dengue cases have increased by 150% in the last 7 days. Urgent medical supply distribution needed.',
    timestamp: '2026-06-29T10:00:00Z',
    resolved: false,
  },
  {
    id: 'a2',
    title: 'Paracetamol Shortage',
    type: 'SHORTAGE',
    priority: 'HIGH',
    facilityId: 'phc_kalan',
    facilityName: 'Rampur Kalan PHC',
    description: 'Paracetamol stock is below critical reserve. Estimated depletion within 48 hours.',
    timestamp: '2026-06-29T08:30:00Z',
    resolved: false,
  },
  {
    id: 'a3',
    title: 'MO Medical Leave Absence',
    type: 'ABSENCE',
    priority: 'MEDIUM',
    facilityId: 'phc_sewapur',
    facilityName: 'Sewapur PHC',
    description: 'Medical Officer on scheduled leave for 3 days. Alternate coverage has been requested.',
    timestamp: '2026-06-28T14:00:00Z',
    resolved: false,
  },
];

export default dummyAlerts;
