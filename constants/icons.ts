export const icons = {
  alert: 'alert-triangle',
  map: 'map',
  hospital: 'activity',
  bell: 'bell',
  user: 'user',
  settings: 'settings',
  search: 'search',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
  chevronDown: 'chevron-down',
  plus: 'plus',
  check: 'check',
  x: 'x',
  info: 'info',
  success: 'check-circle',
  warning: 'alert-circle',
  critical: 'alert-octagon',
  arrowLeft: 'arrow-left',
  calendar: 'calendar',
  lock: 'lock',
  email: 'mail',
  refresh: 'rotate-cw',
  filter: 'filter',
  wifiOff: 'wifi-off',
  eye: 'eye',
  eyeOff: 'eye-off',
  loading: 'loader',
} as const;

export type AppIconName = keyof typeof icons;

export default icons;
