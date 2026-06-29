import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  label?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  label = 'Loading data...',
  overlay = false,
}: LoadingSpinnerProps) {
  const containerClass = overlay
    ? 'absolute top-0 bottom-0 left-0 right-0 bg-black/30 justify-center items-center z-50'
    : 'flex-1 justify-center items-center py-6';

  const textClass = overlay ? 'text-white' : 'text-slate-500';

  return (
    <View className={containerClass}>
      <View className={overlay ? 'bg-slate-900/95 p-5 rounded-2xl items-center shadow-lg border border-slate-800' : 'items-center'}>
        <ActivityIndicator size="large" color={overlay ? '#FFFFFF' : '#1E3A8A'} />
        {label && (
          <Text className={`font-semibold text-sm mt-3 ${textClass}`}>{label}</Text>
        )}
      </View>
    </View>
  );
}

export default LoadingSpinner;
