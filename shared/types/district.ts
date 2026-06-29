export interface DistrictSummary {
  name: string;
  totalPHCs: number;
  activeAlerts: number;
  healthIndex: number;
  supplyTransferRequestsTotal: number;
  averagePatientWaitTimeMinutes: number;
}
