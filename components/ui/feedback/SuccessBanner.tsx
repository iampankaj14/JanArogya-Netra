import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SuccessBannerProps {
  message: string;
  description?: string;
}

export function SuccessBanner({
  message,
  description,
}: SuccessBannerProps) {
  return (
    <View className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex-row items-start mb-4">
      <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-3 mt-0.5">
        <Feather name="check" size={16} color="#059669" />
      </View>
      <View className="flex-1">
        <Text className="text-emerald-800 font-bold text-sm leading-5">{message}</Text>
        {description && (
          <Text className="text-emerald-600 text-xs mt-0.5 leading-4">{description}</Text>
        )}
      </View>
    </View>
  );
}

export default SuccessBanner;
