import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between items-center my-3">
      <Text className="text-slate-800 font-bold text-base uppercase tracking-wide">
        {title}
      </Text>
      {actionLabel && onActionPress && (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Text className="text-blue-900 font-bold text-sm">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default SectionHeader;
