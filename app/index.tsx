import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to Login after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-900">
      <Text className="text-white text-3xl font-bold">JanArogya Netra</Text>
      <Text className="text-blue-200 mt-2 font-medium">Splash Screen</Text>
    </View>
  );
}
