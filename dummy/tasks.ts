export interface TaskItem {
  id: number;
  facilityId: string;
  title: string;
  titleHi?: string;
  desc: string;
  descHi?: string;
  time: string;
  completed: boolean;
}

export const dummyTasks: TaskItem[] = [
  { id: 1, facilityId: 'phc_barola', title: 'Morning OPD Rounds', titleHi: 'सुबह के ओपीडी राउंड', desc: 'General OPD Consultation', descHi: 'सामान्य ओपीडी परामर्श', time: '09:00 AM', completed: true },
  { id: 2, facilityId: 'phc_barola', title: 'Dengue Surveillance Report', titleHi: 'डेंगू निगरानी रिपोर्ट', desc: 'Daily Reporting', descHi: 'दैनिक रिपोर्टिंग', time: '11:00 AM', completed: false },
  { id: 3, facilityId: 'phc_barola', title: 'Vaccine Session', titleHi: 'टीकाकरण सत्र', desc: 'Immunization Drive', descHi: 'टीकाकरण अभियान', time: '01:00 PM', completed: false },
  { id: 4, facilityId: 'phc_barola', title: 'Inventory Verification', titleHi: 'इन्वेंटरी सत्यापन', desc: 'Stock Check', descHi: 'स्टॉक चेक', time: '03:00 PM', completed: false },
  { id: 5, facilityId: 'phc_badalpur', title: 'Staff Meeting', titleHi: 'स्टाफ मीटिंग', desc: 'Weekly Sync', descHi: 'साप्ताहिक सिंक', time: '10:00 AM', completed: false },
  { id: 6, facilityId: 'phc_badalpur', title: 'OPD Rounds', titleHi: 'ओपीडी राउंड', desc: 'General OPD', descHi: 'सामान्य ओपीडी', time: '09:00 AM', completed: true },
];
