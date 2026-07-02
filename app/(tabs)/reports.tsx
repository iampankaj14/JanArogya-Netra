import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import LineChart from '@/components/ui/charts/LineChart';
import BarChart from '@/components/ui/charts/BarChart';
import AreaChart from '@/components/ui/charts/AreaChart';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';

export default function ReportsScreen() {
  const [selectedFormat, setSelectedFormat] = useState('Daily');
  const [generating, setGenerating] = useState(false);

  const formats = ['Daily', 'Weekly', 'Monthly', 'Forecast', 'Performance'];

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert('AI Report synthesized for Gautam Buddh Nagar.');
    }, 1500);
  };

  return (
    <ScreenContainer>
      {/* Upper Title */}
      <View className="mt-4 mb-4">
        <Text className="text-white text-3xl font-black tracking-tight uppercase">Reports</Text>
        <Text className="text-slate-400 text-xs mt-1">Intelligence synthesis and predictive health audits</Text>
      </View>

      {/* Horizontal scrolling format selector */}
      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
          {formats.map((fmt) => {
            const isSelected = selectedFormat === fmt;
            return (
              <Pressable
                key={fmt}
                onPress={() => setSelectedFormat(fmt)}
                className={`py-2 px-4 rounded-full border mr-2 ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-slate-900 border-slate-800 active:bg-slate-800'
                }`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {fmt} Report
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Recent AI Summary Card */}
        <View className="mb-6 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center mr-2.5 border border-blue-500/20">
              <Feather name="cpu" size={16} color="#60A5FA" />
            </View>
            <Text className="text-white font-extrabold text-xs uppercase tracking-wider">AI Executive Briefing</Text>
          </View>
          <Text className="text-slate-300 text-xs leading-relaxed">
            Data sync completeness is at <Text className="text-green-400 font-bold">98.2%</Text> across Gautam Buddh Nagar facilities. Dengue vectors are projected to climb in Dadri block over the next 10 days. Recommendation: Pre-position rapid antigen cassettes.
          </Text>
        </View>

        {/* Two-Column Chart Layout */}
        <View className="flex-row -mx-2 mb-6">
          {/* Left Column: Utilization Curve */}
          <View className="w-1/2 px-2">
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-[210px] justify-between">
              <View>
                <Text className="text-white font-extrabold text-xs">Bed Occupancy</Text>
                <Text className="text-slate-500 text-[8px] uppercase mt-0.5">Average weekly load</Text>
              </View>
              <View className="h-[130px] w-full items-center justify-center overflow-hidden">
                <LineChart />
              </View>
            </View>
          </View>

          {/* Right Column: Daily Patient Traffic */}
          <View className="w-1/2 px-2">
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-[210px] justify-between">
              <View>
                <Text className="text-white font-extrabold text-xs">OPD Traffic</Text>
                <Text className="text-slate-500 text-[8px] uppercase mt-0.5">Patients Daily</Text>
              </View>
              <View className="h-[130px] w-full items-center justify-center overflow-hidden">
                <BarChart title="" />
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Area Chart: Disease Forecast */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-6">
          <Text className="text-white font-extrabold text-xs mb-2">14-Day Vector Incidence Forecast</Text>
          <View className="h-[160px] w-full">
            <AreaChart title="" />
          </View>
        </View>

        {/* Actions Button Row */}
        <View className="space-y-3">
          <PrimaryButton
            title="Generate AI Quality Audit"
            loading={generating}
            onPress={handleGenerateReport}
          />
          
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <OutlineButton
                title="Export CSV"
                onPress={() => alert('CSV database export initiated.')}
              />
            </View>
            <View className="flex-1">
              <OutlineButton
                title="Share PDF"
                onPress={() => alert('Synthesizing PDF sharing link.')}
              />
            </View>
          </View>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
