export const routes = {
  SPLASH: '/',
  LOGIN: '/login',
  SITUATION_ROOM: '/(tabs)/situation-room',
  DISTRICT_MAP: '/(tabs)/district-map',
  PHCS: '/(tabs)/phcs',
  NOTIFICATIONS: '/(tabs)/notifications',
  PROFILE: '/(tabs)/profile',
  SETTINGS: '/(tabs)/settings',
} as const;

export type AppRoute = typeof routes[keyof typeof routes];

export default routes;
