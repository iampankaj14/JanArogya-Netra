import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.replace('/(tabs)/situation-room');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-2xl font-bold mb-2 text-slate-800">JanArogya Netra</Text>
      <Text className="text-gray-500 mb-8 font-medium">Login Screen</Text>
      
      <Pressable 
        onPress={handleLogin}
        className="w-full bg-blue-600 py-3 rounded-lg items-center active:bg-blue-700"
      >
        <Text className="text-white font-semibold text-lg">Go to Situation Room</Text>
      </Pressable>
    </View>
  );
}
