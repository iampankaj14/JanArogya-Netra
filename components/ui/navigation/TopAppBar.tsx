import React from 'react';
import { View, Text } from 'react-native';
import ProfileAvatar from './ProfileAvatar';
import NotificationBell from './NotificationBell';

interface TopAppBarProps {
  title: string;
  userName: string;
  userAvatarUrl?: string;
  unreadNotificationsCount?: number;
  onNotificationsPress: () => void;
  onProfilePress: () => void;
}

export function TopAppBar({
  title,
  userName,
  userAvatarUrl,
  unreadNotificationsCount = 0,
  onNotificationsPress,
  onProfilePress,
}: TopAppBarProps) {
  return (
    <View className="w-full flex-row items-center justify-between py-3 px-4 bg-slate-900 border-b border-slate-800">
      {/* Title */}
      <View className="flex-1 mr-4">
        <Text className="text-white text-lg font-bold tracking-tight" numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-3">
        <NotificationBell
          badgeCount={unreadNotificationsCount}
          onPress={onNotificationsPress}
        />
        <ProfileAvatar
          name={userName}
          imageUrl={userAvatarUrl}
          size="sm"
          onPress={onProfilePress}
        />
      </View>
    </View>
  );
}

export default TopAppBar;
