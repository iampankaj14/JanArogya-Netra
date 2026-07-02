import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ProfileAvatar from './ProfileAvatar';
import NotificationBell from './NotificationBell';

interface TopAppBarProps {
  onHamburgerPress: () => void;
  unreadNotificationsCount?: number;
  onNotificationsPress: () => void;
  onProfilePress: () => void;
}

export function TopAppBar({
  onHamburgerPress,
  unreadNotificationsCount = 0,
  onNotificationsPress,
  onProfilePress,
}: TopAppBarProps) {
  return (
    <View className="pt-4 pb-2 z-50">
      <View className="flex-row bg-white border border-slate-100/50 py-1.5 px-2 justify-between items-center rounded-[32px] mx-6 shadow-xl">
        {/* Left: Hamburger menu */}
        <Pressable 
          onPress={onHamburgerPress}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-slate-50"
      >
        <Feather name="menu" size={19} color="#0B1D3A" />
      </Pressable>

      {/* Center: Brand logo */}
      <View className="flex-row items-center justify-center flex-1">
        <Image 
          source={require('../../../assets/images/janarogya_logo_text.png')}
          style={{ width: 170, height: 38 }}
          resizeMode="contain"
        />
      </View>

      {/* Right: Actions */}
      <View className="flex-row items-center gap-2">
        <NotificationBell
          badgeCount={unreadNotificationsCount}
          onPress={onNotificationsPress}
        />
        <ProfileAvatar
          name="DHO Rajesh"
          size="sm"
          onPress={onProfilePress}
        />
      </View>
      </View>
    </View>
  );
}

export default TopAppBar;
