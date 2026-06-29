import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Fade in and scale up the content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to Login after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, scaleAnim]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Glow effect surrounding icon */}
        <View className="w-24 h-24 rounded-full bg-blue-900/30 items-center justify-center mb-6 border border-blue-500/20 shadow-2xl">
          <Feather name="eye" size={48} color="#60A5FA" />
        </View>

        <Text className="text-white text-4xl font-extrabold tracking-tight text-center">
          JanArogya <Text className="text-blue-400">Netra</Text>
        </Text>
        <Text className="text-slate-400 text-sm font-medium mt-3 tracking-wider text-center max-w-[280px]">
          AI-POWERED DISTRICT HEALTH INTELLIGENCE COMMAND CENTER
        </Text>
      </Animated.View>

      <View className="absolute bottom-16 items-center">
        <ActivityIndicator size="small" color="#3B82F6" className="mb-4" />
        <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase">
          Initializing Systems
        </Text>
      </View>
    </View>
  );
}
