import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface NoInternetProps {
  onCheckConnection?: () => void;
}

export function NoInternet({
  onCheckConnection,
}: NoInternetProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-slate-50">
      <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
        <Feather name="wifi-off" size={28} color="#6B7280" />
      </View>
      <Text className="text-slate-800 font-bold text-lg text-center mb-1">No Connection</Text>
      <Text className="text-slate-400 text-xs text-center max-w-[260px] leading-4 mb-6">
        Please check your internet settings. You can still access cached healthcare intelligence offline.
      </Text>
      {onCheckConnection && (
        <Pressable
          onPress={onCheckConnection}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          className="bg-blue-900 px-6 py-3 rounded-lg active:bg-blue-950"
        >
          <Text className="text-white font-bold text-sm">Retry Connection</Text>
        </Pressable>
      )}
    </View>
  );
}

export default NoInternet;
