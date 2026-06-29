import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: AppIconName;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = 'hospital',
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-10 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mb-4">
        <Feather name={icons[icon] as any} size={22} color="#6B7280" />
      </View>
      <Text className="text-slate-800 font-bold text-base text-center mb-1">{title}</Text>
      <Text className="text-slate-400 text-xs text-center max-w-[240px] leading-4 mb-5">
        {description}
      </Text>
      {actionLabel && onActionPress && (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          className="bg-blue-900 px-5 py-2.5 rounded-lg active:bg-blue-950"
        >
          <Text className="text-white font-bold text-sm">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default EmptyState;
