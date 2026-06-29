export const alertTypes = {
  OUTBREAK: 'Disease Outbreak Detected',
  SHORTAGE: 'Medicine Shortage Alert',
  ABSENCE: 'Critical Staff Absence',
  SUPPLY_CHAIN: 'Supply Chain Delay',
  WEATHER: 'Extreme Weather Hazard',
  FACILITY: 'Facility Damage / Power Outage',
} as const;

export type AlertType = keyof typeof alertTypes;

export const alertPriorities = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

export type AlertPriority = keyof typeof alertPriorities;

export default alertTypes;
