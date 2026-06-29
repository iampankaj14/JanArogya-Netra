import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { NetraAIAssistant } from '../components/common/NetraAIAssistant';
import '../global.css';

// Initialize React Query client for future API/Firestore management
const queryClient = new QueryClient();

export default function RootLayout() {
  const [showNetra, setShowNetra] = useState(false);
  const pathname = usePathname();

  // Hide the floating AI button on Splash and Login views
  const hideFloatingButton = pathname === '/' || pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View className="flex-1 bg-slate-950">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
          </Stack>

          {/* Global Floating Netra AI Trigger Button */}
          {!hideFloatingButton && (
            <Pressable
              onPress={() => setShowNetra(true)}
              className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-2xl active:bg-blue-700 border border-blue-400/20"
              style={{ elevation: 10 }}
            >
              <Feather name="eye" size={24} color="white" />
            </Pressable>
          )}

          {/* Netra AI Chat Interface Modal Overlay */}
          <NetraAIAssistant
            visible={showNetra}
            onClose={() => setShowNetra(false)}
          />
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
