import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { dummyPHCs } from '@/dummy/phcs';
import { dummyMedicines } from '@/dummy/medicines';
import { dummyAttendance } from '@/dummy/attendance';
import BarChart from '@/components/ui/charts/BarChart';

export default function PHCDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find target facility
  const phc = dummyPHCs.find(p => p.id === id) || dummyPHCs[0];

  // Filter stocks and staff logs
  const stocks = dummyMedicines.filter(m => m.facilityId === phc.id);
  const attendance = dummyAttendance.filter(a => a.facilityId === phc.id);

  const presentCount = attendance.filter(a => a.present).length;
  const totalMO = attendance.length;

  return (
    <ScreenContainer>
      {/* Header Navigation */}
      <View className="flex-row items-center justify-between mt-2 mb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center active:bg-slate-800"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </Pressable>
        <Text className="text-white font-black text-lg">Facility Profile</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Nandgaon Profile Header Title */}
        <View className="mb-4">
          <Text className="text-white text-3xl font-black tracking-tight">{phc.name}</Text>
          <Text className="text-slate-400 text-xs mt-1">{phc.block} Block • Gautam Buddh Nagar</Text>
        </View>

        {/* High-Contrast Health Score Gauge Card */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Netra Health Index</Text>
            <Text className="text-white text-xs mt-1 font-bold">Facility status: Warning</Text>
          </View>
          
          <View className="flex-row items-center space-x-4">
            {/* Circular Gauge Ring */}
            <View className="w-16 h-16 rounded-full border-4 border-red-500/25 border-t-red-500 items-center justify-center relative">
              <Text className="text-white font-extrabold text-sm">{phc.healthScore}%</Text>
            </View>

            <Pressable
              onPress={() => router.push({
                pathname: '/explainable-ai',
                params: { id: phc.id }
              })}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center active:bg-slate-700"
            >
              <Feather name="arrow-up-right" size={18} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Two-Column Details Matrix Layout */}
        <View className="flex-row -mx-2 mb-6">
          
          {/* Left Column: Inventory Stock Levels */}
          <View className="w-1/2 px-2">
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-[280px]">
              <Text className="text-white font-extrabold text-xs mb-3">Stock Reserves</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
                {stocks.map((item) => {
                  const isShortage = item.currentStock < item.minRequiredStock;
                  const pct = Math.min(100, Math.round((item.currentStock / item.minRequiredStock) * 100));
                  return (
                    <View key={item.id} className="mb-2.5">
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-slate-300 text-[10px] font-bold flex-1" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className={`text-[9px] font-bold ${isShortage ? 'text-red-400' : 'text-slate-400'}`}>
                          {item.currentStock}
                        </Text>
                      </View>
                      <View className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <View 
                          className={`h-full ${isShortage ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Right Column: Attendance Donut + Patient Traffic Chart */}
          <View className="w-1/2 px-2 flex-col justify-between">
            {/* Donut Attendance Box */}
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-[130px] mb-4 items-center justify-center">
              <Text className="text-slate-400 text-[9px] uppercase font-extrabold tracking-wider mb-2">MO Duty Roster</Text>
              <View className="flex-row items-center space-x-3">
                <View className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-400 items-center justify-center">
                  <Text className="text-white font-extrabold text-xs">{presentCount}/{totalMO}</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-[10px]">Medical Officers</Text>
                  <Text className="text-slate-400 text-[8px] mt-0.5">{totalMO - presentCount} absent today</Text>
                </View>
              </View>
            </View>

            {/* Patients Traffic Chart Card */}
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-3 h-[135px] items-center justify-center overflow-hidden">
              <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-1 self-start">Traffic (Mon-Fri)</Text>
              <View className="h-[90px] w-full">
                <BarChart title="" />
              </View>
            </View>

          </View>
        </View>

        {/* AI Recommendations Card at Bottom */}
        <View className="bg-blue-950/20 border border-blue-900/30 rounded-3xl p-5 mb-6">
          <View className="flex-row items-center mb-3">
            <Feather name="cpu" size={18} color="#60A5FA" className="mr-2" />
            <Text className="text-blue-400 font-extrabold text-xs uppercase tracking-wider">AI Redistribution recommendation</Text>
          </View>
          <Text className="text-slate-300 text-xs leading-relaxed mb-4">
            Dengue cases at {phc.name} are surging. Dharampur PHC currently holds 200 excess NS1 Kits with low local disease prevalence. Recommend transferring 50 kits.
          </Text>
          <PrimaryButton
            title="Execute Stock Transfer"
            onPress={() => router.push({
              pathname: '/resource-redistribution',
              params: { id: phc.id }
            })}
          />
        </View>

        {/* Floating Quick Action Row */}
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <OutlineButton
              title="Explain Risk Score"
              leftIcon="info"
              onPress={() => router.push({
                pathname: '/explainable-ai',
                params: { id: phc.id }
              })}
            />
          </View>
          <View className="flex-1">
            <OutlineButton
              title="Duty Roster Logs"
              leftIcon="user"
              onPress={() => alert('Opening full duty log archives.')}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
