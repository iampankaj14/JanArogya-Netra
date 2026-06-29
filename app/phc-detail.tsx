import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import Divider from '@/components/ui/layout/Divider';
import Badge from '@/components/ui/badges/Badge';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import { dummyPHCs } from '@/dummy/phcs';
import { dummyMedicines } from '@/dummy/medicines';
import { dummyAttendance } from '@/dummy/attendance';

export default function PHCDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Find target facility
  const phc = dummyPHCs.find(p => p.id === id) || dummyPHCs[0];

  // Filter stocks and staff logs
  const stocks = dummyMedicines.filter(m => m.facilityId === phc.id);
  const attendance = dummyAttendance.filter(a => a.facilityId === phc.id);

  const [localAttendance, setLocalAttendance] = useState(attendance);

  const handleToggleAttendance = (recordId: string) => {
    setLocalAttendance(prev => prev.map(rec => 
      rec.id === recordId ? { ...rec, present: !rec.present, timeIn: !rec.present ? '09:00 AM' : undefined } : rec
    ));
  };

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
        <Text className="text-white font-black text-lg">Facility Command Detail</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* PHC Header Block */}
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-white text-2xl font-black">{phc.name}</Text>
              <Text className="text-slate-400 text-xs mt-1">{phc.block} Block</Text>
            </View>
            <View className="items-end">
              <Badge 
                label={phc.stockStatus.toUpperCase()} 
                variant={phc.stockStatus === 'adequate' ? 'success' : phc.stockStatus === 'warning' ? 'warning' : 'critical'} 
              />
              <Text className="text-slate-500 text-[9px] font-bold uppercase mt-1">Stock Status</Text>
            </View>
          </View>

          <Divider />

          {/* Key telemetry scores */}
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Health Index</Text>
              <Text className={`text-xl font-black ${
                phc.healthScore > 80 ? 'text-green-400' : phc.healthScore > 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>{phc.healthScore}%</Text>
            </View>
            <View className="w-[1px] bg-slate-800 h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Active Alerts</Text>
              <Text className={`text-xl font-black ${phc.activeAlertsCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                {phc.activeAlertsCount}
              </Text>
            </View>
            <View className="w-[1px] bg-slate-800 h-8 self-center" />
            <View className="items-center flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Beds Fill Rate</Text>
              <Text className="text-white text-xl font-black">
                {Math.round((phc.bedsOccupied / phc.bedsTotal) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Explain health score quick action */}
        <View className="flex-row space-x-3 mb-6">
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
              title="Redistribute Stocks"
              leftIcon="refresh"
              onPress={() => router.push({
                pathname: '/resource-redistribution',
                params: { id: phc.id }
              })}
            />
          </View>
        </View>

        {/* Bed telemetries */}
        <SectionHeader title="Bed Capacity & Inpatients" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-xs">Total Beds</Text>
            <Text className="text-white font-bold text-xs">{phc.bedsTotal} units</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400 text-xs">Occupied Beds</Text>
            <Text className="text-red-400 font-bold text-xs">{phc.bedsOccupied} occupied</Text>
          </View>
          <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <View 
              className={`h-full ${phc.bedsOccupied / phc.bedsTotal > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${(phc.bedsOccupied / phc.bedsTotal) * 100}%` }}
            />
          </View>
        </View>

        {/* Staff doctor attendance check list */}
        <SectionHeader title="Medical Officer Attendance Logs" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4 mb-6">
          {localAttendance.length > 0 ? (
            localAttendance.map((staff, index, arr) => (
              <View key={staff.id}>
                <View className="flex-row items-center justify-between py-2">
                  <View>
                    <Text className="text-white font-bold text-xs">{staff.staffName}</Text>
                    <Text className="text-slate-400 text-[10px]">{staff.role}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-[10px] mr-3">
                      {staff.present ? `Time In: ${staff.timeIn || '09:00 AM'}` : 'Absent'}
                    </Text>
                    <Switch
                      value={staff.present}
                      onValueChange={() => handleToggleAttendance(staff.id)}
                      trackColor={{ false: '#334155', true: '#10B981' }}
                      thumbColor={staff.present ? '#FFFFFF' : '#94A3B8'}
                    />
                  </View>
                </View>
                {index < arr.length - 1 && <Divider />}
              </View>
            ))
          ) : (
            <Text className="text-slate-500 text-xs font-semibold">No duty records found for today.</Text>
          )}
        </View>

        {/* Inventory Stock levels */}
        <SectionHeader title="Pharmacy & Diagnostic Stock levels" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4">
          {stocks.length > 0 ? (
            stocks.map((item, index, arr) => {
              const isShortage = item.currentStock < item.minRequiredStock;
              return (
                <View key={item.id}>
                  <View className="flex-row items-center justify-between py-2.5">
                    <View className="flex-1 mr-4">
                      <Text className="text-white font-bold text-xs">{item.name}</Text>
                      <Text className="text-slate-400 text-[10px]">{item.type}</Text>
                    </View>
                    <View className="items-end">
                      <Text className={`font-extrabold text-xs ${isShortage ? 'text-red-400' : 'text-slate-200'}`}>
                        {item.currentStock} {item.unit}
                      </Text>
                      <Text className="text-slate-500 text-[9px] mt-0.5">Min: {item.minRequiredStock}</Text>
                    </View>
                  </View>
                  {index < arr.length - 1 && <Divider />}
                </View>
              );
            })
          ) : (
            <Text className="text-slate-500 text-xs font-semibold">No stock catalog registered for this facility.</Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
