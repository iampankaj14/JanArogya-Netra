import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { useTranslation } from '@/hooks/useTranslation';
import { Toggle } from '../../components/ui/inputs/Toggle';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
            onPress={() => { if (router.canGoBack()) { if (router.canGoBack()) { router.back(); } else { router.push('/'); } } else { router.push('/'); } }}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#0F172A" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">{t('settingsTitle')}</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">{t('settingsSubtitle')}</Text>
          </View>
        </View>
      </View>


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Promotional Banner */}
        <View className="bg-[#E0E7FF] rounded-[24px] p-5 mb-6 flex-row items-center justify-between overflow-hidden relative border border-indigo-100 shadow-sm">
          <View className="flex-1 z-10 mr-2 ml-16">
            <Text className="text-brand-navy font-black text-[15px] mb-2 leading-tight">{t('settingsBannerTitle')}</Text>
            <Text className="text-slate-500 text-[9px] font-semibold leading-3">
              {t('settingsBannerDesc')}
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
        <View className="mb-6">
          
          {/* Background Sync */}
          <View className="flex-row items-center justify-between bg-blue-50 border border-blue-200 shadow-sm shadow-blue-500/10 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-xl bg-white border border-blue-100 items-center justify-center mr-4 shadow-sm">
                <Feather name="refresh-cw" size={18} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('settingsBackgroundSyncTitle')}</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">{t('settingsBackgroundSyncDesc')}</Text>
              </View>
            </View>
            <Toggle value={backgroundSync} onValueChange={setBackgroundSync} />
          </View>

          {/* Critical Outbreak Alerts */}
          <View className="flex-row items-center justify-between bg-red-50 border border-red-200 shadow-sm shadow-red-500/10 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-xl bg-white border border-red-100 items-center justify-center mr-4 shadow-sm">
                <Feather name="bell" size={18} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('settingsCriticalAlertsTitle')}</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">{t('settingsCriticalAlertsDesc')}</Text>
              </View>
            </View>
            <Toggle value={criticalAlerts} onValueChange={setCriticalAlerts} />
          </View>

          {/* AI Recommendation Auto Refresh */}
          <View className="flex-row items-center justify-between bg-purple-50 border border-purple-200 shadow-sm shadow-purple-500/10 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-xl bg-white border border-purple-100 items-center justify-center mr-4 shadow-sm">
                <MaterialCommunityIcons name="robot-outline" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('settingsAutoRefreshTitle')}</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">{t('settingsAutoRefreshDesc')}</Text>
              </View>
            </View>
            <Toggle value={autoRefresh} onValueChange={setAutoRefresh} />
          </View>

          {/* Offline Mode */}
          <View className="flex-row items-center justify-between bg-emerald-50 border border-emerald-200 shadow-sm shadow-emerald-500/10 rounded-2xl p-4">
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 rounded-xl bg-white border border-emerald-100 items-center justify-center mr-4 shadow-sm">
                <Feather name="download-cloud" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('settingsOfflineModeTitle')}</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-3">{t('settingsOfflineModeDesc')}</Text>
              </View>
            </View>
            <Toggle value={offlineMode} onValueChange={setOfflineMode} />
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
            <Text className="text-emerald-700 font-black text-[13px] mb-3">{t('settingsStatusTitle')}</Text>
            
            <View className="flex-row justify-between mb-3">
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="cloud" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">{t('settingsStatusAiEngineLabel')}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-emerald-600 font-extrabold text-[10px] mr-1">{t('settingsStatusConnected')}</Text>
                    <Feather name="check-circle" size={10} color="#10B981" />
                  </View>
                </View>
              </View>
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="aperture" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">{t('settingsStatusGeminiLabel')}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-emerald-600 font-extrabold text-[10px] mr-1">{t('settingsStatusActive')}</Text>
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
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">{t('settingsStatusFirebaseLabel')}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-emerald-600 font-extrabold text-[10px] mr-1">{t('settingsStatusSynced')}</Text>
                    <Feather name="check-circle" size={10} color="#10B981" />
                  </View>
                </View>
              </View>
              <View className="flex-row items-start flex-1">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <Feather name="clock" size={12} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[9px] mb-0.5">{t('settingsStatusLastSyncLabel')}</Text>
                  <Text className="text-emerald-600 font-extrabold text-[10px]">{t('settingsStatusLastSyncValue')}</Text>
                </View>
              </View>
            </View>

          </View>
        </View>

        <Pressable 
          onPress={() => {
            Alert.alert(t('settingsSaveAlertTitle'), t('settingsSaveAlertMessage'));
            if (router.canGoBack()) { router.back(); } else { router.push('/'); }
          }}
          className="w-full rounded-2xl py-4 flex-row justify-center items-center bg-[#7C3AED] shadow-md shadow-purple-500/30 mb-3"
          style={{ elevation: 3 }}
        >
          <Feather name="save" size={16} color="#FFF" className="mr-2" />
          <Text className="text-white font-extrabold text-[14px]">{t('settingsSaveButton')}</Text>
        </Pressable>
        
        {/* Helper Footer text */}
        <View className="flex-row justify-center items-center">
          <Feather name="shield" size={10} color="#64748B" className="mr-1.5" />
          <Text className="text-slate-500 font-bold text-[10px]">{t('settingsFooterText')}</Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
