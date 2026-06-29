export interface PHC {
  id: string;
  name: string;
  block: string;
  healthScore: number;
  doctorAvailable: boolean;
  stockStatus: 'adequate' | 'warning' | 'critical';
  activeAlertsCount: number;
  bedsTotal: number;
  bedsOccupied: number;
  latitude: number;
  longitude: number;
}
