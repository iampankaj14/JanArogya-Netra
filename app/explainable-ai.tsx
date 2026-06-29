import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import Divider from '@/components/ui/layout/Divider';
import { dummyPHCs } from '@/dummy/phcs';

export default function ExplainableAIScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const phc = dummyPHCs.find(p => p.id === id) || dummyPHCs[0];

  // Explainable factors based on PHC status
  const factors = [
    { name: 'NS1 Test Kit Stock Depletion', impact: '-35%', type: 'negative', score: 35 },
    { name: 'Inpatient Bed Occupancy &gt; 80%', impact: '-20%', type: 'negative', score: 20 },
    { name: 'Medical Officer Absenteeism', impact: '-30%', type: 'negative', score: 30 },
    { name: 'Telemetry Sync Data Quality', impact: '+15%', type: 'positive', score: 15 },
  ];

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
        <Text className="text-white font-black text-lg">Netra Explainable AI</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Core Diagnosis Card */}
        <View className="bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-6">
          <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Facility Diagnosis</Text>
          <Text className="text-white text-xl font-extrabold mt-1">{phc.name}</Text>
          
          <View className="flex-row items-center justify-between mt-4 bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <View>
              <Text className="text-slate-500 text-[9px] uppercase font-bold">Health Score Index</Text>
              <Text className="text-slate-200 text-xs font-semibold mt-1">Classified: Warning</Text>
            </View>
            <Text className="text-red-400 text-3xl font-black">{phc.healthScore}%</Text>
          </View>
        </View>

        {/* Explainable AI weights */}
        <SectionHeader title="Score Attribution Breakdown" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          {factors.map((factor, index) => (
            <View key={factor.name} className="py-2.5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-bold text-xs max-w-[70%]">{factor.name}</Text>
                <Text className={`text-xs font-black ${factor.type === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                  {factor.impact}
                </Text>
              </View>
              <View className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <View 
                  className={`h-full ${factor.type === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${factor.score}%` }}
                />
              </View>
              {index < factors.length - 1 && <View className="mt-3"><Divider /></View>}
            </View>
          ))}
        </View>

        {/* Gemini Prompts context */}
        <SectionHeader title="Gemini Reasoning Summary" />
        <View className="bg-blue-950/20 border border-blue-900/30 rounded-3xl p-5">
          <View className="flex-row items-center mb-3">
            <Feather name="eye" size={18} color="#60A5FA" className="mr-2" />
            <Text className="text-blue-400 font-extrabold text-xs uppercase tracking-wider">AI Diagnostic Log</Text>
          </View>
          <Text className="text-slate-300 text-xs leading-relaxed">
            "The health index for Rampur Kalan dropped 12% in the last 48 hours. This is primarily attributed to a shortage of Dengue NS1 rapid test kits during an active outbreak cluster (3 cases reported in past 3 days). The absence of the primary MO further compounds patient triage delays. Supply redistribution is required immediately."
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
