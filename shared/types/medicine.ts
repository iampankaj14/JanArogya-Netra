import { MedicineType } from '@/constants/medicineTypes';

export interface MedicineStock {
  id: string;
  name: string;
  nameHi?: string;
  type: MedicineType;
  currentStock: number;
  minRequiredStock: number;
  unit: string;
  facilityId: string;
}
