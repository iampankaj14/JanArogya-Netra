import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [dataSync, setDataSync] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [alertSounds, setAlertSounds] = useState(true);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-2 mb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center active:bg-slate-800"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </Pressable>
        <Text className="text-white font-black text-lg">System Settings</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Safety configurations */}
        <SectionHeader title="Operational Security" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="shield" size={16} color="#60A5FA" />
              </View>
              <Text className="text-white font-bold text-xs">Biometric Authentication</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={biometrics ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Sync telemetry parameters */}
        <SectionHeader title="Telemetry Sync" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="refresh-cw" size={16} color="#60A5FA" />
              </View>
              <Text className="text-white font-bold text-xs">Background Firestore Sync</Text>
            </View>
            <Switch
              value={dataSync}
              onValueChange={setDataSync}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={dataSync ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Sound settings */}
        <SectionHeader title="Auditory Indicators" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="volume-2" size={16} color="#60A5FA" />
              </View>
              <Text className="text-white font-bold text-xs">Critical Outbreak Alarms</Text>
            </View>
            <Switch
              value={alertSounds}
              onValueChange={setAlertSounds}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={alertSounds ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Save button */}
        <PrimaryButton
          title="Save Configurations"
          onPress={() => {
            alert('Preferences stored locally.');
            router.back();
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
