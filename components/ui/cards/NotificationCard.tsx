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
      <View className="bg-white p-4 rounded-xl border border-slate-100 items-center justify-center min-h-[80px]">
        <ActivityIndicator color="#1E3A8A" />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
      className={`rounded-xl border border-slate-100 p-4 shadow-xs flex-row ${
        read ? 'bg-white' : 'bg-blue-50/20 border-blue-50'
      }`}
    >
      {/* Unread Indicator circle */}
      {!read && (
        <View className="w-2.5 h-2.5 bg-blue-600 rounded-full absolute top-4 left-4" />
      )}

      {/* Content wrapper */}
      <View className={`flex-1 ${read ? 'pl-0' : 'pl-4'}`}>
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className={`text-slate-800 text-sm ${read ? 'font-semibold' : 'font-bold'}`} numberOfLines={1}>
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
