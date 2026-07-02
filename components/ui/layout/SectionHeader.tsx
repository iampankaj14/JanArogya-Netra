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
    <View className="flex-row justify-between items-center mt-12 mb-5">
      <Text className="text-brand-navy font-black text-[14px]">
        {title}
      </Text>
      {actionLabel && onActionPress && (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        >
          <Text className="text-[#0E62CC] font-bold text-[12px]">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default SectionHeader;
