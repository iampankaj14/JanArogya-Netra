import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NotificationBellProps {
  badgeCount?: number;
  onPress: () => void;
}

export function NotificationBell({
  badgeCount = 0,
  onPress,
}: NotificationBellProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      className="w-10 h-10 rounded-full justify-center items-center bg-white border border-slate-100 shadow-sm relative active:bg-slate-50"
    >
      <Feather name="bell" size={20} color="#0B1D3A" />
      {badgeCount > 0 && (
        <View className="absolute top-1.5 right-1.5 bg-red-500 min-w-[16px] h-[16px] px-1 rounded-full items-center justify-center border border-white">
          <Text className="text-white text-[9px] font-bold">
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default NotificationBell;
