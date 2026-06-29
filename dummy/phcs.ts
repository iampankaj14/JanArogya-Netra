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

export const dummyPHCs: PHC[] = [
  {
    id: 'phc_dharampur',
    name: 'Dharampur PHC',
    block: 'Dharampur',
    healthScore: 82,
    doctorAvailable: true,
    stockStatus: 'adequate',
    activeAlertsCount: 0,
    bedsTotal: 10,
    bedsOccupied: 4,
    latitude: 28.6139,
    longitude: 77.2090,
  },
  {
    id: 'phc_kalan',
    name: 'Rampur Kalan PHC',
    block: 'Rampur',
    healthScore: 48,
    doctorAvailable: false,
    stockStatus: 'critical',
    activeAlertsCount: 2,
    bedsTotal: 8,
    bedsOccupied: 7,
    latitude: 28.6250,
    longitude: 77.2200,
  },
  {
    id: 'phc_sewapur',
    name: 'Sewapur PHC',
    block: 'Sewapur',
    healthScore: 65,
    doctorAvailable: true,
    stockStatus: 'warning',
    activeAlertsCount: 1,
    bedsTotal: 12,
    bedsOccupied: 9,
    latitude: 28.6012,
    longitude: 77.1950,
  },
  {
    id: 'phc_kheri',
    name: 'Kheri PHC',
    block: 'Sewapur',
    healthScore: 78,
    doctorAvailable: true,
    stockStatus: 'adequate',
    activeAlertsCount: 0,
    bedsTotal: 6,
    bedsOccupied: 2,
    latitude: 28.5950,
    longitude: 77.1850,
  },
];

export default dummyPHCs;
