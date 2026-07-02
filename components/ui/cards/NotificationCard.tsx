import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { formatDateTime } from '../../../utils/formatters';

interface NotificationCardProps {
  title: string;
  message: string;
  timestamp: string | Date;
  read: boolean;
  onPress?: () => void;
  loading?: boolean;
}

export function NotificationCard({
  title,
  message,
  timestamp,
  read,
  onPress,
  loading = false,
}: NotificationCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center justify-center min-h-[80px]">
        <ActivityIndicator color="#0B1D3A" />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
      className={`rounded-2xl border border-slate-100 p-4 shadow-xs flex-row relative ${
        read ? 'bg-white' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* Unread Indicator circle */}
      {!read && (
        <View className="w-2.5 h-2.5 bg-brand-orange rounded-full absolute top-5 left-4" />
      )}

      {/* Content wrapper */}
      <View className={`flex-1 ${read ? 'pl-0' : 'pl-4'}`}>
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className={`text-brand-navy text-sm ${read ? 'font-semibold' : 'font-extrabold'}`} numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-slate-400 text-xxs text-[10px]">{formatDateTime(timestamp)}</Text>
        </View>
        <Text className="text-slate-600 text-xs leading-4" numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Pressable>
  );
}

export default NotificationCard;
