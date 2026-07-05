export interface PHC {
  id: string;
  name: string;
  nameHi?: string;
  block: string;
  blockHi?: string;
  healthScore: number;
  doctorAvailable: boolean;
  stockStatus: 'adequate' | 'warning' | 'critical';
  activeAlertsCount: number;
  bedsTotal: number;
  bedsOccupied: number;
  latitude: number;
  longitude: number;
  establishedYear: number;
  phcCode: string;
  consultRooms: number;
  ambulances: number;
  o2Cylinders: number;
  staffTotal: number;
  staffPresent: number;
  moName: string;
  weeklyFootfall: number[];
}
