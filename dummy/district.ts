export interface DistrictSummary {
  name: string;
  totalPHCs: number;
  activeAlerts: number;
  healthIndex: number;
  supplyTransferRequestsTotal: number;
  averagePatientWaitTimeMinutes: number;
}

export const dummyDistrict: DistrictSummary = {
  name: 'Devgarh District',
  totalPHCs: 14,
  activeAlerts: 3,
  healthIndex: 68,
  supplyTransferRequestsTotal: 5,
  averagePatientWaitTimeMinutes: 24,
};

export default dummyDistrict;
