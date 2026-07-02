import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { icons } from '@/constants/icons';
import { getAlertPriorityColor, formatDate } from '@/utils/formatters';
import { AlertPriority } from '@/constants/alertTypes';

interface AlertCardProps {
  title: string;
  type: string;
  priority: AlertPriority;
  date: string | Date;
  description: string;
  onPress?: () => void;
  loading?: boolean;
  compact?: boolean;
}

export function AlertCard({
  title,
  type,
  priority,
  date,
  description,
  onPress,
  loading = false,
  compact = false,
}: AlertCardProps) {
  const priorityColor = getAlertPriorityColor(priority);

  if (loading) {
    return (
      <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center justify-center min-h-[100px]">
        <ActivityIndicator color="#0B1D3A" />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        pressed && { opacity: 0.9 },
      ]}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <View style={{ backgroundColor: priorityColor }} className="h-1.5 w-full" />
      <View className={`p-4 ${compact ? 'p-3' : 'p-4'}`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1 mr-2">
            <Feather name={icons.alert as any} size={16} color={priorityColor} />
            <Text className="font-extrabold text-brand-navy text-base ml-1.5 flex-1" numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
            <Text style={{ color: priorityColor }} className="text-xxs font-black uppercase text-[10px]">
              {priority}
            </Text>
          </View>
        </View>

        {!compact && (
          <Text className="text-slate-500 text-xs mb-1">
            Category: {type}
          </Text>
        )}

        <Text className="text-slate-700 text-sm mb-3" numberOfLines={compact ? 2 : 3}>
          {description}
        </Text>

        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-slate-400 text-xs">{formatDate(date)}</Text>
          {onPress && (
            <View className="flex-row items-center">
              <Text className="text-brand-navy font-bold text-xs mr-1">View Detail</Text>
              <Feather name={icons.chevronRight as any} size={12} color="#0B1D3A" />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default AlertCard;
