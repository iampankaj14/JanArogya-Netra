import { colors } from '../constants/colors';
import { AlertPriority } from '../constants/alertTypes';

/**
 * Format date to standard string (e.g. DD MMM YYYY)
 */
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date to include time (e.g. DD MMM YYYY, HH:MM AM/PM)
 */
export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format numbers with Indian standard locale (comma separators)
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0';
  return num.toLocaleString('en-IN');
};

/**
 * Format decimal to percentage string
 */
export const formatPercentage = (num: number, decimals: number = 0): string => {
  if (num === undefined || num === null) return '0%';
  return `${num.toFixed(decimals)}%`;
};

/**
 * Maps a numeric health score to a semantic range status
 */
export const getHealthScoreStatus = (score: number): 'critical' | 'warning' | 'good' => {
  if (score <= 50) return 'critical';
  if (score <= 75) return 'warning';
  return 'good';
};

/**
 * Get color code corresponding to a numeric health score
 */
export const getHealthScoreColor = (score: number): string => {
  const status = getHealthScoreStatus(score);
  return colors.health[status];
};

/**
 * Maps alert priorities to corresponding color representations
 */
export const getAlertPriorityColor = (priority: AlertPriority): string => {
  switch (priority) {
    case 'CRITICAL':
      return colors.priority.critical;
    case 'HIGH':
      return colors.priority.high;
    case 'MEDIUM':
      return colors.priority.medium;
    case 'LOW':
    default:
      return colors.priority.low;
  }
};

/**
 * Format raw snake_case or SCREAMING_SNAKE_CASE to Title Case
 */
export const formatStatus = (status: string): string => {
  if (!status) return '';
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
