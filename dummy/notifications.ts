export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const dummyNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Redistribution Approved',
    message: 'DHO Rajesh Kumar approved transfer of 50 Dengue Kits to Rampur Kalan PHC.',
    timestamp: '2026-06-29T10:30:00Z',
    read: false,
  },
  {
    id: 'n2',
    title: 'New Epidemic Alert',
    message: 'Dengue Surge Warning triggered for Rampur Kalan PHC.',
    timestamp: '2026-06-29T10:00:00Z',
    read: false,
  },
  {
    id: 'n3',
    title: 'Monthly Summary Ready',
    message: 'The AI-generated health briefing for Devgarh District is now available.',
    timestamp: '2026-06-28T09:00:00Z',
    read: true,
  },
];

export default dummyNotifications;
