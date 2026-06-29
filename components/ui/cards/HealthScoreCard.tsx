import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getHealthScoreColor, getHealthScoreStatus } from '../../../utils/formatters';

interface HealthScoreCardProps {
  name: string;
  score: number;
  loading?: boolean;
  compact?: boolean;
}

export function HealthScoreCard({
  name,
  score,
  loading = false,
  compact = false,
}: HealthScoreCardProps) {
  const healthColor = getHealthScoreColor(score);
  const status = getHealthScoreStatus(score);

  if (loading) {
    return (
      <View className="bg-white p-4 rounded-xl border border-slate-100 items-center justify-center min-h-[90px]">
        <ActivityIndicator color="#1E3A8A" />
      </View>
    );
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'critical':
        return 'Critical Attention';
      case 'warning':
        return 'Moderate Risk';
      case 'good':
      default:
        return 'Stable Condition';
    }
  };

  if (compact) {
    return (
      <View className="bg-white rounded-xl border border-slate-100 p-3 flex-row items-center justify-between">
        <Text className="text-slate-800 font-semibold text-sm flex-1 mr-2" numberOfLines={1}>
          {name}
        </Text>
        <View style={{ backgroundColor: healthColor }} className="px-2.5 py-1 rounded-full">
          <Text className="text-white font-bold text-xs">{score}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <Text className="text-slate-400 text-xs font-semibold mb-0.5">HEALTH INDEX</Text>
        <Text className="text-slate-800 text-lg font-bold mb-1" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center">
          <View style={{ backgroundColor: healthColor }} className="w-2.5 h-2.5 rounded-full mr-2" />
          <Text className="text-slate-500 text-sm font-semibold">{getStatusLabel()}</Text>
        </View>
      </View>

      <View
        style={{ borderColor: healthColor }}
        className="w-16 h-16 rounded-full border-4 items-center justify-center bg-slate-50"
      >
        <Text style={{ color: healthColor }} className="text-xl font-bold">
          {score}
        </Text>
      </View>
    </View>
  );
}

export default HealthScoreCard;
