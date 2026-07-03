import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [backgroundSync, setBackgroundSync] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6 px-1">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#0F172A" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">Console Settings</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">Manage your console preferences</Text>
          </View>
        </View>
        <Pressable className="w-11 h-11 rounded-full bg-white border border-slate-100 items-center justify-center active:bg-slate-50 shadow-sm">
          <Feather name="settings" size={18} color="#3B82F6" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Promotional Banner */}
        <View className="bg-[#E0E7FF] rounded-[24px] p-5 mb-6 flex-row items-center justify-between overflow-hidden relative border border-indigo-100 shadow-sm">
          <View className="flex-1 z-10 mr-2 ml-16">
            <Text className="text-brand-navy font-black text-[15px] mb-2 leading-tight">Optimize. Monitor.{'\n'}Protect.</Text>
            <Text className="text-slate-500 text-[9px] font-semibold leading-3">
              Configure console behavior, alerts and performance to keep your health system running at its best.
            </Text>
          </View>

          {/* Left Shield Graphic */}
          <View className="absolute left-2 w-16 h-20 items-center justify-center z-10">
            <View className="w-14 h-16 bg-blue-500 rounded-lg items-center justify-center border-2 border-white shadow-sm" style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
               <Feather name="settings" size={24} color="#FFF" />
            </View>
            {/* Small leaves */}
            <View className="absolute -bottom-2 -left-2 rotate-45">
               <Feather name="feather" size={16} color="#10B981" />
            </View>
          </View>

          {/* Right Monitor Graphic */}
          <View className="w-24 h-24 bg-white/40 rounded-xl relative border-2 border-white/50 justify-center items-center">
             <View className="w-20 h-14 bg-blue-500 rounded-md border-2 border-white shadow-sm overflow-hidden flex-row">
               <View className="w-6 h-full bg-blue-600 items-center pt-2">
                 <Feather name="settings" size={8} color="#FFF" className="mb-1" />
                 <Feather name="list" size={8} color="#FFF" />
               </View>
               <View className="flex-1 bg-white p-1">
                 <View className="flex-row items-center mb-1">
                   <Feather name="check" size={6} color="#3B82F6" className="mr-1" />
                   <View className="w-6 h-1 bg-slate-200 rounded-full" />
                 </View>
                 <View className="flex-row items-center mb-1">
                   <Feather name="check" size={6} color="#3B82F6" className="mr-1" />
                   <View className="w-4 h-1 bg-slate-200 rounded-full" />
                 </View>
                 <View className="flex-row items-center">
                   <Feather name="check" size={6} color="#3B82F6" className="mr-1" />
                   <View className="w-5 h-1 bg-slate-200 rounded-full" />
                 </View>
               </View>
             </View>
             <View className="w-4 h-3 bg-blue-400" />
             <View className="w-12 h-1 bg-blue-400 rounded-full" />
             
             {/* Small floating gear */}
             <View className="absolute bottom-1 left-0 w-8 h-8 bg-purple-500 rounded-full items-center justify-center border-2 border-white shadow-sm">
               <Feather name="settings" size={12} color="#FFF" />
             </View>
          </View>
        </View>

        {/* Settings Options Card */}
        <View className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 mb-6 space-y-4">
          
          {/* Background Sync */}
          <View className="flex-row items-center justify-between border-b border-slate-50 pb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 items-center justify-center mr-4">
                <Feather name="refresh-cw" size={18} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">Background Sync</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">Sync data in background for real-time updates.</Text>
              </View>
            </View>
            <Switch
              value={backgroundSync}
              onValueChange={setBackgroundSync}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* Critical Outbreak Alerts */}
          <View className="flex-row items-center justify-between border-b border-slate-50 pb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-full bg-red-50 border border-red-100 items-center justify-center mr-4">
                <Feather name="bell" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">Critical Outbreak Alerts</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">Get notified instantly for critical outbreaks.</Text>
              </View>
            </View>
            <Switch
              value={criticalAlerts}
              onValueChange={setCriticalAlerts}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* AI Recommendation Auto Refresh */}
          <View className="flex-row items-center justify-between border-b border-slate-50 pb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 items-center justify-center mr-4">
                <MaterialCommunityIcons name="robot-outline" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">AI Recommendation Auto Refresh</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">Automatically refresh AI insights and recommendations.</Text>
              </View>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {/* Offline Mode */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 items-center justify-center mr-4">
                <Feather name="cloud-download" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">Offline Mode</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">Cache latest PHC & medicine data for offline access.</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

        </View>

        {/* Console Status Box */}
        <View className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 mb-6 flex-row items-center">
          
          {/* Huge Shield */}
          <View className="w-20 h-24 bg-emerald-500 rounded-xl items-center justify-center border-4 border-white shadow-sm mr-4" style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
             <Feather name="check" size={32} color="#FFF" />
          </View>

          {/* Status Grid */}
          <View className="flex-1">
            <Text className="text-emerald-700 font-black text-[13px] mb-3">Console Status</Text>
            
            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="cloud" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">AI Engine</Text>
                  <View className="flex-row items-center">
                    <Text className="text-emerald-600 font-extrabold text-[10px] mr-1">Connected</Text>
                    <Feather name="check-circle" size={10} color="#10B981" />
                  </View>
                </View>
              </View>
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="aperture" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">Gemini API</Text>
                  <View className="flex-row items-center">
                    <Text className="text-emerald-600 font-extrabold text-[10px] mr-1">Active</Text>
                    <Feather name="check-circle" size={10} color="#10B981" />
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="database" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">Firebase</Text>
                  <View className="flex-row items-center">
                    <Text className="text-emerald-600 font-extrabold text-[10px] mr-1">Synced</Text>
                    <Feather name="check-circle" size={10} color="#10B981" />
                  </View>
                </View>
              </View>
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="clock" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">Last Sync</Text>
                  <Text className="text-emerald-600 font-extrabold text-[10px]">2 min ago</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        {/* Action Button */}
        <Pressable 
          onPress={() => router.back()}
          className="w-full rounded-2xl py-4 flex-row justify-center items-center bg-[#7C3AED] shadow-md shadow-purple-500/30 mb-3"
          style={{ elevation: 3 }}
        >
          <Feather name="save" size={16} color="#FFF" className="mr-2" />
          <Text className="text-white font-extrabold text-[14px]">Save Console Configuration</Text>
        </Pressable>
        
        {/* Helper Footer text */}
        <View className="flex-row justify-center items-center">
          <Feather name="shield" size={10} color="#64748B" className="mr-1.5" />
          <Text className="text-slate-500 font-bold text-[10px]">Changes will be applied immediately</Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
