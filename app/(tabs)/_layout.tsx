import { Tabs } from 'expo-router';
import { colors } from '../../theme/colors';

export default function TabLayout() {
  const activeColor = colors.primary.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: true,
        tabBarStyle: {
          borderTopWidth: 1,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="situation-room"
        options={{
          title: 'Situation Room',
        }}
      />
      <Tabs.Screen
        name="district-map"
        options={{
          title: 'District Map',
        }}
      />
      <Tabs.Screen
        name="phcs"
        options={{
          title: 'PHCs',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
