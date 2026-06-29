import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface AIRecommendationCardProps {
  title: string;
  sourceFacility: string;
  targetFacility: string;
  item: string;
  quantity: number;
  confidence: number;
  reasoning: string;
  onApprove?: () => void;
  onDecline?: () => void;
  loading?: boolean;
}

export function AIRecommendationCard({
  title,
  sourceFacility,
  targetFacility,
  item,
  quantity,
  confidence,
  reasoning,
  onApprove,
  onDecline,
  loading = false,
}: AIRecommendationCardProps) {
  if (loading) {
    return (
      <View className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 items-center justify-center min-h-[120px]">
        <ActivityIndicator color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View className="bg-blue-50/30 rounded-xl border border-blue-100 shadow-sm p-4">
      {/* Header with AI indicator */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-2">
            <Feather name="cpu" size={14} color="#1E3A8A" />
          </View>
          <Text className="font-bold text-slate-800 text-sm">AI Recommendation</Text>
        </View>
        <View className="px-2 py-0.5 rounded-full bg-blue-100">
          <Text className="text-blue-900 text-xs font-bold">{Math.round(confidence * 100)}% Conf.</Text>
        </View>
      </View>

      <Text className="font-bold text-slate-800 text-base mb-2">{title}</Text>

      {/* Redistribution Details */}
      <View className="bg-white p-3 rounded-lg border border-slate-100 mb-3 flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-xs text-slate-400">Source Facility</Text>
          <Text className="text-slate-800 font-semibold text-sm" numberOfLines={1}>
            {sourceFacility}
          </Text>
        </View>
        <Feather name="arrow-right" size={16} color="#6B7280" style={{ marginHorizontal: 8 }} />
        <View className="flex-1 ml-2">
          <Text className="text-xs text-slate-400">Target Facility</Text>
          <Text className="text-slate-800 font-semibold text-sm" numberOfLines={1}>
            {targetFacility}
          </Text>
        </View>
      </View>

      {/* Item info */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-slate-600 text-sm font-semibold">Transfer qty: {quantity} units</Text>
        <Text className="text-slate-500 text-xs font-medium">{item}</Text>
      </View>

      {/* Reasoning explanation */}
      <View className="bg-slate-50 p-2.5 rounded-lg mb-4 border border-slate-100">
        <Text className="text-xs text-slate-400 mb-0.5 font-bold uppercase">Reasoning</Text>
        <Text className="text-slate-600 text-xs leading-4">{reasoning}</Text>
      </View>

      {/* Actions */}
      {(onApprove || onDecline) && (
        <View className="flex-row justify-between gap-3">
          {onDecline && (
            <Pressable
              onPress={onDecline}
              style={({ pressed }) => [pressed && { opacity: 0.8 }]}
              className="flex-1 py-2 border border-slate-200 rounded-lg items-center bg-white"
            >
              <Text className="text-slate-600 font-bold text-sm">Decline</Text>
            </Pressable>
          )}
          {onApprove && (
            <Pressable
              onPress={onApprove}
              style={({ pressed }) => [pressed && { opacity: 0.9 }]}
              className="flex-1 py-2 bg-blue-900 rounded-lg items-center"
            >
              <Text className="text-white font-bold text-sm">Approve Action</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default AIRecommendationCard;
