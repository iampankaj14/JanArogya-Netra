import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toggle } from '../components/ui/inputs/Toggle';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [dataSync, setDataSync] = useState(true);
  const [alertSounds, setAlertSounds] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true); // Netra AI Audio

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const val = await AsyncStorage.getItem('netraAudioEnabled');
        if (val !== null) {
          setAudioEnabled(val !== 'false'); // defaults to true
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      if (router.canGoBack()) { router.back(); } else { router.push('/'); }
    } else {
      router.replace('/');
    }
  };

  const toggleAudio = async (value: boolean) => {
    setAudioEnabled(value);
    await AsyncStorage.setItem('netraAudioEnabled', value.toString());
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F8FC]" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center shadow-sm shadow-slate-200/50 mr-4"
          >
            <Feather name="arrow-left" size={20} color="#1E293B" />
          </Pressable>
          <View>
            <Text className="text-[#1E293B] font-black text-[22px]">Console Settings</Text>
            <Text className="text-slate-500 font-semibold text-[13px]">Manage your console preferences</Text>
          </View>
        </View>

        {/* Hero Banner */}
        <View className="mx-6 mb-6 bg-[#EEF2FF] rounded-[24px] p-5 flex-row items-center overflow-hidden border border-indigo-50 relative">
          <View className="flex-1 z-10 pr-4">
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center shadow-sm shadow-blue-500/30">
                <Feather name="settings" size={24} color="white" />
              </View>
            </View>
            <Text className="text-[#1E293B] font-black text-[18px] leading-tight mb-2">Optimize. Monitor.{'\n'}Protect.</Text>
            <Text className="text-slate-600 text-[11px] leading-relaxed font-medium">Configure console behavior, alerts and performance to keep your health system running at its best.</Text>
          </View>
          
          {/* Decorative Graphic Element mimicking the screenshot */}
          <View className="w-24 h-24 bg-white rounded-xl shadow-sm border border-indigo-100 justify-center items-center p-2 relative z-10">
            <View className="w-full h-full bg-slate-50 rounded-lg flex-row p-2">
               <View className="w-4 h-full bg-blue-500 rounded-sm mr-2 items-center pt-2">
                 <Feather name="settings" size={8} color="white" />
               </View>
               <View className="flex-1 pt-2">
                 <View className="w-full h-1.5 bg-slate-200 rounded-full mb-2" />
                 <View className="w-2/3 h-1.5 bg-slate-200 rounded-full mb-2" />
                 <View className="w-4/5 h-1.5 bg-slate-200 rounded-full" />
               </View>
            </View>
            <View className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-purple-500 items-center justify-center border-2 border-white shadow-sm">
              <Feather name="settings" size={14} color="white" />
            </View>
          </View>
        </View>

        {/* Toggles Card */}
        <View className="mx-6 mb-6 bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/40 p-2">
          
          {/* Background Sync */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-4 border border-blue-100">
                <Feather name="refresh-cw" size={18} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] font-bold text-[15px] mb-0.5">Background Sync</Text>
                <Text className="text-slate-500 text-[11px] font-medium leading-tight">Sync data in background for real-time updates.</Text>
              </View>
            </View>
            <Toggle value={dataSync} onValueChange={setDataSync} />
          </View>

          {/* Critical Outbreak Alerts */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-11 h-11 rounded-full bg-red-50 items-center justify-center mr-4 border border-red-100">
                <Feather name="bell" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] font-bold text-[15px] mb-0.5">Critical Outbreak Alerts</Text>
                <Text className="text-slate-500 text-[11px] font-medium leading-tight">Get notified instantly for critical outbreaks.</Text>
              </View>
            </View>
            <Toggle value={alertSounds} onValueChange={setAlertSounds} />
          </View>

          {/* AI Recommendation Auto Refresh */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-11 h-11 rounded-full bg-purple-50 items-center justify-center mr-4 border border-purple-100">
                <MaterialCommunityIcons name="robot-outline" size={20} color="#A855F7" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] font-bold text-[15px] mb-0.5">AI Recommendation Auto Refresh</Text>
                <Text className="text-slate-500 text-[11px] font-medium leading-tight">Automatically refresh AI insights and recommendations.</Text>
              </View>
            </View>
            <Toggle value={autoRefresh} onValueChange={setAutoRefresh} />
          </View>

          {/* Offline Mode */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-11 h-11 rounded-full bg-emerald-50 items-center justify-center mr-4 border border-emerald-100">
                <Feather name="cloud-drizzle" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] font-bold text-[15px] mb-0.5">Offline Mode</Text>
                <Text className="text-slate-500 text-[11px] font-medium leading-tight">Cache latest PHC & medicine data for offline access.</Text>
              </View>
            </View>
            <Toggle value={offlineMode} onValueChange={setOfflineMode} />
          </View>

          {/* Netra AI Audio Response (New Option) */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-11 h-11 rounded-full bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
                <Feather name="volume-2" size={18} color="#6366F1" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] font-bold text-[15px] mb-0.5">Netra AI Audio Response</Text>
                <Text className="text-slate-500 text-[11px] font-medium leading-tight">Toggle voice output for Netra AI responses.</Text>
              </View>
            </View>
            <Toggle value={audioEnabled} onValueChange={toggleAudio} />
          </View>
        </View>

        {/* Console Status Card */}
        <View className="mx-6 mb-8 bg-[#F0FDF4] rounded-[24px] border border-emerald-100 p-5 flex-row">
          <View className="w-20 h-24 bg-[#10B981] rounded-[20px] items-center justify-center shadow-sm shadow-emerald-500/20 mr-5">
            <Feather name="check" size={32} color="white" />
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-[#065F46] font-bold text-[16px] mb-3">Console Status</Text>
            
            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-3 flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="cloud" size={10} color="#059669" />
                </View>
                <View>
                  <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">AI Engine</Text>
                  <Text className="text-[#059669] text-[11px] font-black">Connected ✓</Text>
                </View>
              </View>

              <View className="w-1/2 mb-3 flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="google-circles-extended" size={12} color="#059669" />
                </View>
                <View>
                  <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Gemini API</Text>
                  <Text className="text-[#059669] text-[11px] font-black">Active ✓</Text>
                </View>
              </View>

              <View className="w-1/2 flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="database" size={10} color="#059669" />
                </View>
                <View>
                  <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Firebase</Text>
                  <Text className="text-[#059669] text-[11px] font-black">Synced ✓</Text>
                </View>
              </View>

              <View className="w-1/2 flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="clock" size={10} color="#059669" />
                </View>
                <View>
                  <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Last Sync</Text>
                  <Text className="text-[#059669] text-[11px] font-black">2 min ago</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6">
          <Pressable 
            onPress={handleBack}
            className="w-full bg-[#6366F1] rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            <Feather name="save" size={18} color="white" className="mr-2" />
            <Text className="text-white font-black text-[15px] ml-2">Save Console Configuration</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
