import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getHealthScoreColor } from '../../../utils/formatters';

interface PHCCardProps {
  name: string;
  block: string;
  healthScore: number;
  doctorAvailable: boolean;
  stockStatus: 'adequate' | 'warning' | 'critical';
  activeAlertsCount: number;
  onPress?: () => void;
  loading?: boolean;
}

export function PHCCard({
  name,
  block,
  healthScore,
  doctorAvailable,
  stockStatus,
  activeAlertsCount,
  onPress,
  loading = false,
}: PHCCardProps) {
  const healthColor = getHealthScoreColor(healthScore);

  if (loading) {
    return (
      <View className="bg-white p-4 rounded-xl border border-slate-100 items-center justify-center min-h-[120px]">
        <ActivityIndicator color="#1E3A8A" />
      </View>
    );
  }

  const getStockStatusColor = () => {
    switch (stockStatus) {
      case 'critical':
        return 'text-red-500 bg-red-50 border-red-100';
      case 'warning':
        return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'adequate':
      default:
        return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
    >
      {/* Title & Score */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-slate-850 font-bold text-base" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-slate-400 text-xs">{block} Block</Text>
        </View>
        <View
          style={{ backgroundColor: healthColor }}
          className="w-9 h-9 rounded-full justify-center items-center"
        >
          <Text className="text-white font-bold text-sm">{healthScore}</Text>
        </View>
      </View>

      {/* Grid status parameters */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {/* Doctor presence */}
        <View className={`flex-row items-center border px-2 py-1 rounded-md ${
          doctorAvailable ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-red-500 bg-red-50 border-red-100'
        }`}>
          <Feather
            name={doctorAvailable ? 'user-check' : 'user-x'}
            size={12}
            color={doctorAvailable ? '#10B981' : '#EF4444'}
          />
          <Text className={`text-[10px] font-bold ml-1 ${
            doctorAvailable ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {doctorAvailable ? 'MO Present' : 'MO Absent'}
          </Text>
        </View>

        {/* Stock status */}
        <View className={`flex-row items-center border px-2 py-1 rounded-md ${getStockStatusColor()}`}>
          <Feather name="package" size={12} color={stockStatus === 'adequate' ? '#10B981' : stockStatus === 'warning' ? '#F59E0B' : '#EF4444'} />
          <Text className="text-[10px] font-bold ml-1 capitalize">{stockStatus} Stock</Text>
        </View>

        {/* Alerts count */}
        {activeAlertsCount > 0 && (
          <View className="flex-row items-center border border-red-100 bg-red-50 px-2 py-1 rounded-md">
            <Feather name="alert-circle" size={12} color="#EF4444" />
            <Text className="text-[10px] font-bold ml-1 text-red-700">
              {activeAlertsCount} Active {activeAlertsCount === 1 ? 'Alert' : 'Alerts'}
            </Text>
          </View>
        )}
      </View>

      {/* Card Action footer */}
      {onPress && (
        <View className="flex-row justify-between items-center border-t border-slate-50 pt-3">
          <Text className="text-slate-400 text-xs">View Facility Profile</Text>
          <Feather name="arrow-right" size={14} color="#1E3A8A" />
        </View>
      )}
    </Pressable>
  );
}

export default PHCCard;
