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
  color = '#0B1D3A',
}: MetricCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-3xl border border-slate-100/50 items-center justify-center min-h-[90px] flex-1">
        <ActivityIndicator color={color} size="small" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-3xl border border-slate-100/50 p-4 shadow-sm flex-1 min-w-[140px] relative overflow-hidden pb-8">
      <View className="flex-row items-start">
        {/* Large colored icon circle */}
        <View 
          className="w-12 h-12 rounded-full justify-center items-center mr-3 shadow-sm shadow-black/10" 
          style={{ backgroundColor: color }}
        >
          <Feather name={icons[icon] as any} size={22} color="white" />
        </View>
        
        {/* Text Details */}
        <View className="flex-1">
          <Text className="text-slate-600 font-bold text-[10px] mb-1 tracking-wide">{title}</Text>
          <Text className="text-brand-navy font-black text-3xl leading-8 tracking-tighter mb-1">
            {value}
          </Text>
          
          {change !== undefined && (
            <View className="flex-row items-center">
              <Feather
                name={isPositiveChange ? 'arrow-up-right' : 'arrow-down-right'}
                size={12}
                color={isPositiveChange ? '#10B981' : '#EF4444'}
              />
              <Text
                className={`text-xxs font-bold ml-1 text-[11px] ${
                  isPositiveChange ? 'text-[#10B981]' : 'text-red-500'
                }`}
              >
                {change}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Decorative sparkline replacement (since no react-native-svg) */}
      <View className="absolute bottom-0 left-0 right-0 h-6 overflow-hidden items-end justify-end opacity-50">
         <View className="w-full h-1" style={{ backgroundColor: color, opacity: 0.2 }} />
         <View className="absolute bottom-0 right-4 w-2 h-2 rounded-full border border-white z-10" style={{ backgroundColor: color }} />
      </View>
    </View>
  );
}

export default MetricCard;
