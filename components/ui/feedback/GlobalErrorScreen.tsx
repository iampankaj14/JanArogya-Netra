import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface GlobalErrorScreenProps {
  error: Error;
  resetError: () => void;
}

export function GlobalErrorScreen({ error, resetError }: GlobalErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 p-6">
      <View className="items-center bg-white p-6 rounded-2xl shadow-sm max-w-sm w-full border border-slate-100">
        <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
          <Feather name="alert-octagon" size={32} color="#EF4444" />
        </View>
        <Text className="text-xl font-bold text-slate-800 text-center mb-2">Something went wrong</Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          {error.message || 'An unexpected application error occurred.'}
        </Text>
        <Pressable
          onPress={resetError}
          className="w-full bg-blue-600 active:bg-blue-700 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
}
export default GlobalErrorScreen;
