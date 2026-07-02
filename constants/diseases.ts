export const HIGH_PRIORITY_DISEASES = [
  'Dengue',
  'Malaria',
  'Chikungunya',
  'Acute Diarrheal Disease (ADD)',
  'Typhoid',
  'Cholera',
] as const;

export const SEASONAL_INFECTIOUS_DISEASES = [
  'Seasonal Influenza (Flu)',
  'Viral Fever',
  'Acute Respiratory Infection (ARI)',
  'Pneumonia',
] as const;

export type HighPriorityDisease = typeof HIGH_PRIORITY_DISEASES[number];
export type SeasonalInfectiousDisease = typeof SEASONAL_INFECTIOUS_DISEASES[number];

export type Disease = HighPriorityDisease | SeasonalInfectiousDisease;

export const ALL_DISEASES = [...HIGH_PRIORITY_DISEASES, ...SEASONAL_INFECTIOUS_DISEASES];

export const getDiseaseSeverity = (disease: string) => {
  if (HIGH_PRIORITY_DISEASES.includes(disease as HighPriorityDisease)) {
    return 'HIGH_PRIORITY';
  }
  if (SEASONAL_INFECTIOUS_DISEASES.includes(disease as SeasonalInfectiousDisease)) {
    return 'SEASONAL';
  }
  return 'UNKNOWN';
};
