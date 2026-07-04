export interface TaskItem {
  id: number;
  facilityId: string;
  title: string;
  desc: string;
  time: string;
  completed: boolean;
}

export const dummyTasks: TaskItem[] = [
  { id: 1, facilityId: 'phc_barola', title: 'Morning OPD Rounds', desc: 'General OPD Consultation', time: '09:00 AM', completed: true },
  { id: 2, facilityId: 'phc_barola', title: 'Dengue Surveillance Report', desc: 'Daily Reporting', time: '11:00 AM', completed: false },
  { id: 3, facilityId: 'phc_barola', title: 'Vaccine Session', desc: 'Immunization Drive', time: '01:00 PM', completed: false },
  { id: 4, facilityId: 'phc_barola', title: 'Inventory Verification', desc: 'Stock Check', time: '03:00 PM', completed: false },
  { id: 5, facilityId: 'phc_badalpur', title: 'Staff Meeting', desc: 'Weekly Sync', time: '10:00 AM', completed: false },
  { id: 6, facilityId: 'phc_badalpur', title: 'OPD Rounds', desc: 'General OPD', time: '09:00 AM', completed: true },
];
