export const medicineTypes = {
  ANTIBIOTICS: 'Antibiotics',
  ANALGESICS: 'Analgesics / Antipyretics',
  ANTIVIRALS: 'Antivirals',
  IV_FLUIDS: 'IV Fluids',
  VACCINES: 'Vaccines',
  CHRONIC_CARE: 'Chronic Care (Insulin, BP, etc.)',
  EMERGENCY: 'Emergency Medicines',
  EQUIPMENT: 'Medical Equipment',
  CONSUMABLES: 'Consumables & Disposables',
} as const;

export type MedicineType = keyof typeof medicineTypes;

export default medicineTypes;
