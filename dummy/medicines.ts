import { MedicineType } from '../constants/medicineTypes';

export interface MedicineStock {
  id: string;
  name: string;
  type: MedicineType;
  currentStock: number;
  minRequiredStock: number;
  unit: string;
  facilityId: string;
}

export const dummyMedicines: MedicineStock[] = [
  {
    id: 'm1',
    name: 'Paracetamol 500mg',
    type: 'ANALGESICS',
    currentStock: 120,
    minRequiredStock: 500,
    unit: 'Tablets',
    facilityId: 'phc_kalan',
  },
  {
    id: 'm2',
    name: 'Dengue NS1 Antigen Test Kit',
    type: 'EMERGENCY',
    currentStock: 15,
    minRequiredStock: 100,
    unit: 'Kits',
    facilityId: 'phc_kalan',
  },
  {
    id: 'm3',
    name: 'Amoxicillin 250mg',
    type: 'ANTIBIOTICS',
    currentStock: 600,
    minRequiredStock: 400,
    unit: 'Tablets',
    facilityId: 'phc_dharampur',
  },
  {
    id: 'm4',
    name: 'ORAL REHYDRATION SALTS (ORS)',
    type: 'IV_FLUIDS',
    currentStock: 800,
    minRequiredStock: 300,
    unit: 'Sachets',
    facilityId: 'phc_dharampur',
  },
];

export default dummyMedicines;
