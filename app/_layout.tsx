import { AuthProvider } from '@/context/AuthContext';
import { hydrateLocalDb } from '@/services/repositories/localDb';
import '@/services/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import '../global.css';

// Ignore all log notifications on the device screen (warnings will still appear in the terminal)
LogBox.ignoreAllLogs();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

import { Stack } from 'expo-router';

// Initialize React Query client for future API/Firestore management
const queryClient = new QueryClient();

// Configure Reanimated Logger to suppress strict mode warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      await hydrateLocalDb();
      if (loaded || fontError) {
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <View className="flex-1 bg-brand-navy">
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="settings" />
            </Stack>
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
