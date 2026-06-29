import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

interface TabItem {
  name: string;
  label: string;
  icon: AppIconName;
}

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tabName: string) => void;
}

export function BottomNavigation({
  currentTab,
  onTabChange,
}: BottomNavigationProps) {
  const tabs: TabItem[] = [
    { name: 'situation-room', label: 'Situation', icon: 'alert' },
    { name: 'district-map', label: 'Map', icon: 'map' },
    { name: 'phcs', label: 'PHCs', icon: 'hospital' },
    { name: 'notifications', label: 'Alerts', icon: 'bell' },
    { name: 'profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <View className="flex-row bg-slate-900 border-t border-slate-800 py-2.5 justify-around items-center w-full">
      {tabs.map((tab) => {
        const isActive = tab.name === currentTab;
        const color = isActive ? '#3B82F6' : '#9CA3AF'; // Blue vs Gray

        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabChange(tab.name)}
            className="items-center justify-center flex-1 py-1"
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          >
            <Feather name={icons[tab.icon] as any} size={20} color={color} />
            <Text
              style={{ color }}
              className={`text-[10px] font-bold mt-1`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default BottomNavigation;
