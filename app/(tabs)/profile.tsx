import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import PageHeader from '@/components/ui/layout/PageHeader';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import CardContainer from '@/components/ui/layout/CardContainer';
import Divider from '@/components/ui/layout/Divider';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { dummyUsers } from '@/dummy/users';

export default function ProfileScreen() {
  const router = useRouter();
  const dhoUser = dummyUsers[0]; // Dr. Rajesh Kumar (DHO)

  const [darkMode, setDarkMode] = useState(true);
  const [hindiLang, setHindiLang] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleLogout = () => {
    alert('Session cleared. Logging out...');
    router.replace('/login');
  };

  return (
    <ScreenContainer>
      <PageHeader 
        title="Command Profile" 
        subtitle="Identity settings and console configurations"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Card */}
        <CardContainer className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 items-center">
          <Image
            source={{ uri: dhoUser.avatarUrl }}
            className="w-20 h-20 rounded-full border-2 border-blue-500 mb-4"
          />
          <Text className="text-white text-xl font-extrabold">{dhoUser.name}</Text>
          <View className="bg-blue-900/30 border border-blue-500/30 rounded-full px-3.5 py-1 mt-2">
            <Text className="text-blue-400 text-xs font-bold tracking-widest uppercase">{dhoUser.role}</Text>
          </View>
          <Text className="text-slate-400 text-xs font-semibold mt-3">{dhoUser.email}</Text>
        </CardContainer>

        {/* Console Settings */}
        <SectionHeader title="Console Preferences" />
        <CardContainer className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="moon" size={16} color="#60A5FA" />
              </View>
              <Text className="text-white font-bold text-xs">Console Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={darkMode ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <Divider />

          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="globe" size={16} color="#60A5FA" />
              </View>
              <Text className="text-white font-bold text-xs">Translate Console (Hindi)</Text>
            </View>
            <Switch
              value={hindiLang}
              onValueChange={setHindiLang}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={hindiLang ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <Divider />

          <View className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="bell" size={16} color="#60A5FA" />
              </View>
              <Text className="text-white font-bold text-xs">Outbreak Push Alarms</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
              thumbColor={pushNotifs ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </CardContainer>

        {/* Directory links */}
        <SectionHeader title="System Support & Diagnostics" />
        <CardContainer className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <Pressable 
            onPress={() => router.push('/notifications')}
            className="flex-row items-center justify-between py-2.5 active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="inbox" size={16} color="#94A3B8" />
              </View>
              <Text className="text-white font-bold text-xs">View Notifications Inbox</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#64748B" />
          </Pressable>

          <Divider />

          <Pressable 
            onPress={() => router.push('/settings')}
            className="flex-row items-center justify-between py-2.5 active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="settings" size={16} color="#94A3B8" />
              </View>
              <Text className="text-white font-bold text-xs">System Settings</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#64748B" />
          </Pressable>

          <Divider />

          <Pressable 
            onPress={() => alert('Netra User Manual is loading...')}
            className="flex-row items-center justify-between py-2.5 active:opacity-70"
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="help-circle" size={16} color="#94A3B8" />
              </View>
              <Text className="text-white font-bold text-xs">Help Desk & Guides</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#64748B" />
          </Pressable>

          <Divider />

          <View className="flex-row items-center justify-between py-2.5">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center mr-3">
                <Feather name="info" size={16} color="#94A3B8" />
              </View>
              <Text className="text-white font-bold text-xs">Console Version</Text>
            </View>
            <Text className="text-slate-500 text-[11px] font-bold">v1.2.0 (Stable)</Text>
          </View>
        </CardContainer>

        {/* Log Out */}
        <View className="mt-2">
          <PrimaryButton
            title="Terminate Console Session"
            onPress={handleLogout}
            style={{ backgroundColor: '#EF4444' }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
