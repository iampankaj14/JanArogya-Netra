import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-10 px-6 bg-red-50/10 rounded-2xl border border-dashed border-red-100">
      <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mb-4">
        <Feather name="alert-triangle" size={22} color="#EF4444" />
      </View>
      <Text className="text-slate-800 font-bold text-base text-center mb-1">Failed to load content</Text>
      <Text className="text-slate-400 text-xs text-center max-w-[240px] leading-4 mb-5">
        {message || 'An unexpected error occurred while loading data.'}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          className="bg-red-600 px-5 py-2.5 rounded-lg"
        >
          <Text className="text-white font-bold text-sm">Retry Load</Text>
        </Pressable>
      )}
    </View>
  );
}

export default ErrorState;
