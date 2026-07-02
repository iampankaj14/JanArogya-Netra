import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import Divider from '@/components/ui/layout/Divider';
import AreaChart from '@/components/ui/charts/AreaChart';
import Badge from '@/components/ui/badges/Badge';

export default function DiseaseAnalyticsScreen() {
  const router = useRouter();
  const { disease } = useLocalSearchParams();
  const diseaseName = (disease as string) || 'Dengue';

  // Disease specific mock telemetry
  const isHighRisk = ['Dengue', 'Acute Diarrheal Disease'].includes(diseaseName);

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
        <Text className="text-white font-black text-lg">Disease Analytics</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Core Stats Overview */}
        <View className="bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-6">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Outbreak Profile</Text>
              <Text className="text-white text-2xl font-black mt-1">{diseaseName}</Text>
            </View>
            <Badge 
              label={isHighRisk ? 'HIGH RISK' : 'STABLE'} 
              variant={isHighRisk ? 'critical' : 'success'} 
            />
          </View>

          <Divider />

          {/* Metric Comparison rows */}
          <View className="flex-row justify-between pt-2">
            <View className="items-center flex-1">
              <Text className="text-slate-500 text-[9px] uppercase font-bold mb-1">Growth Index</Text>
              <Text className={`text-lg font-black ${isHighRisk ? 'text-red-400' : 'text-green-400'}`}>
                {isHighRisk ? '+24% YoY' : '-8% YoY'}
              </Text>
            </View>
            <View className="w-[1px] bg-slate-800 h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-slate-500 text-[9px] uppercase font-bold mb-1">Weekly Delta</Text>
              <Text className={`text-lg font-black ${isHighRisk ? 'text-red-400' : 'text-slate-300'}`}>
                {isHighRisk ? '+15 cases' : 'Nominal'}
              </Text>
            </View>
            <View className="w-[1px] bg-slate-800 h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-slate-500 text-[9px] uppercase font-bold mb-1">Model Forecast</Text>
              <Text className="text-white text-lg font-black">
                {isHighRisk ? 'Rising' : 'Deflating'}
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamic analytics graph */}
        <SectionHeader title="Weekly Incidence Progression" />
        <View className="mb-6">
          <AreaChart title={`${diseaseName} - Daily active cases (Gautam Buddh Nagar)`} />
        </View>

        {/* Comparative timelines */}
        <SectionHeader title="Outbreak Multi-comparison" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-5 mb-6">
          <View className="flex-row justify-between py-2">
            <Text className="text-slate-400 text-xs">Current Week Cases</Text>
            <Text className="text-white font-bold text-xs">{isHighRisk ? '86 cases' : '18 cases'}</Text>
          </View>
          <Divider />
          <View className="flex-row justify-between py-2">
            <Text className="text-slate-400 text-xs">Previous Week Cases</Text>
            <Text className="text-white font-bold text-xs">{isHighRisk ? '71 cases' : '22 cases'}</Text>
          </View>
          <Divider />
          <View className="flex-row justify-between py-2">
            <Text className="text-slate-400 text-xs">Historical Max Peak (2025)</Text>
            <Text className="text-slate-400 font-bold text-xs">142 cases</Text>
          </View>
        </View>

        {/* AI diagnostic brief */}
        <SectionHeader title="Netra AI Epidemiological Brief" />
        <View className="bg-blue-950/20 border border-blue-900/30 rounded-3xl p-5">
          <View className="flex-row items-center mb-3">
            <Feather name="cpu" size={18} color="#60A5FA" className="mr-2" />
            <Text className="text-blue-400 font-extrabold text-xs uppercase tracking-wider">AI Forecast Insight</Text>
          </View>
          <Text className="text-slate-300 text-xs leading-relaxed">
            "EPIDEMIOLOGICAL ALERT: {diseaseName} levels in Gautam Buddh Nagar blocks are currently analyzed with 89% modeling confidence. {isHighRisk ? 'Warm weather and recent monsoon puddling have triggered vectors. Short-term supply buffers for rapid diagnostics are highly recommended.' : 'Incidence data is currently plateauing. No immediate reallocation of supplies is required for this disease vector.'}"
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
