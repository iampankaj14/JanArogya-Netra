import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: AppIconName;
  change?: string | number;
  isPositiveChange?: boolean;
  loading?: boolean;
  color?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  change,
  isPositiveChange = true,
  loading = false,
  color = '#1E3A8A',
}: MetricCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-xl border border-slate-100 items-center justify-center min-h-[90px] flex-1">
        <ActivityIndicator color={color} size="small" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex-1 min-w-[140px]">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-slate-400 text-xs font-semibold" numberOfLines={1}>
          {title}
        </Text>
        <View className="w-7 h-7 bg-slate-50 rounded-full justify-center items-center">
          <Feather name={icons[icon] as any} size={14} color={color} />
        </View>
      </View>

      <Text className="text-slate-800 text-2xl font-bold mb-1">
        {value}
      </Text>

      {change !== undefined && (
        <View className="flex-row items-center">
          <Feather
            name={isPositiveChange ? 'arrow-up-right' : 'arrow-down-left'}
            size={12}
            color={isPositiveChange ? '#10B981' : '#EF4444'}
          />
          <Text
            className={`text-xxs font-bold ml-0.5 text-[10px] ${
              isPositiveChange ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {change}
          </Text>
        </View>
      )}
    </View>
  );
}

export default MetricCard;
