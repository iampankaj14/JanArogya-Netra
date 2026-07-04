import { NotificationItem } from '@/shared/types/notification';


export const dummyNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Redistribution Approved',
    message: 'DHO Rajesh Kumar approved transfer of 50 Dengue Kits to PHC Badalpur.',
    timestamp: '2026-06-29T16:09:00Z',
    read: false,
    type: 'all',
    category: 'Stock Redistribution',
  },
  {
    id: 'n2',
    title: 'New Epidemic Alert',
    message: 'Dengue Surge Warning triggered for PHC Badalpur.',
    timestamp: '2026-06-29T15:30:00Z',
    read: false,
    type: 'alert',
    category: 'Epidemic Alert',
    isNew: true,
  },
  {
    id: 'n3',
    title: 'Monthly Summary Ready',
    message: 'The AI-generated health briefing for Gautam Budh Nagar is now available.',
    timestamp: '2026-06-28T14:30:00Z',
    read: false,
    type: 'report',
    category: 'Monthly Report',
  },
  {
    id: 'n4',
    title: 'Low Stock Alert',
    message: '8 medicines are running low in stock across 3 PHCs.',
    timestamp: '2026-06-28T11:15:00Z',
    read: false, // Orange dot
    type: 'alert',
    category: 'Stock Alert',
    isNew: true,
  },
  {
    id: 'n5',
    title: 'System Update Completed',
    message: 'System maintenance completed successfully at 10:00 AM.',
    timestamp: '2026-06-27T10:05:00Z',
    read: true, // Green dot
    type: 'update',
    category: 'System Update',
  },
];

export default dummyNotifications;
