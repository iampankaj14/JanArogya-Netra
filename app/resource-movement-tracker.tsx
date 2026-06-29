import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import Divider from '@/components/ui/layout/Divider';
import Badge from '@/components/ui/badges/Badge';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function ResourceMovementTrackerScreen() {
  const router = useRouter();

  // Transit steps
  const steps = [
    { name: 'Cargo Dispatched (Dharampur PHC)', time: '10:15 AM', done: true },
    { name: 'Departed Dharampur Block Border', time: '10:45 AM', done: true },
    { name: 'En Route (Devgarh Highway)', time: '11:15 AM', done: true },
    { name: 'Arrival at Rampur Kalan PHC', time: '12:30 PM (Est.)', done: false },
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
        <Text className="text-white font-black text-lg">Cargo Route Tracker</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Active tracking banner */}
        <View className="bg-slate-900 border border-slate-800 p-5 rounded-3xl mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-slate-400 text-[9px] uppercase font-bold">Logistics Tracking ID</Text>
              <Text className="text-white text-base font-black mt-0.5">CARGO-V1-NETRA</Text>
            </View>
            <Badge label="IN TRANSIT (65%)" variant="info" />
          </View>

          <Divider />

          <View className="space-y-2.5">
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">Item Carried:</Text>
              <Text className="text-white font-bold text-xs">Dengue NS1 Antigen Kits</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">Quantity:</Text>
              <Text className="text-white font-bold text-xs">50 Kits</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-400 text-xs">Estimated ETA:</Text>
              <Text className="text-yellow-400 font-bold text-xs">45 minutes</Text>
            </View>
          </View>
        </View>

        {/* Route map canvas simulator */}
        <SectionHeader title="Transit Map Simulator" />
        <View className="bg-slate-950 border border-slate-800 rounded-3xl h-48 mb-6 items-center justify-center relative overflow-hidden">
          {/* Simulated highway path line */}
          <View className="absolute w-[80%] h-1 border-t-2 border-dashed border-blue-500/30" />
          <View className="absolute left-[10%] w-4 h-4 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
            <View className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          </View>
          <View className="absolute right-[10%] w-4 h-4 rounded-full bg-slate-800 border border-slate-700 items-center justify-center">
            <View className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          </View>

          {/* Running vehicle */}
          <View className="absolute left-[55%] bg-blue-600 border border-blue-400 rounded-full p-2.5 shadow-lg flex-row items-center">
            <Feather name="truck" size={14} color="white" />
          </View>
          
          <Text className="text-slate-500 text-[10px] absolute bottom-3">Highway NH-12, Route Mile 14.5</Text>
        </View>

        {/* Timeline steps */}
        <SectionHeader title="Logs Timeline" />
        <View className="bg-slate-900/40 border border-slate-800/40 rounded-3xl p-5 mb-6">
          {steps.map((step, index) => (
            <View key={step.name} className="flex-row items-start mb-5 relative">
              {/* Line connector */}
              {index < steps.length - 1 && (
                <View className="absolute left-2.5 top-6 bottom-[-20px] w-0.5 bg-slate-800" />
              )}
              <View className={`w-5 h-5 rounded-full items-center justify-center mr-3 z-10 ${
                step.done ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
              }`}>
                {step.done ? (
                  <Feather name="check" size={12} color="white" />
                ) : (
                  <View className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-xs ${step.done ? 'text-white' : 'text-slate-500'}`}>
                  {step.name}
                </Text>
                <Text className="text-slate-400 text-[10px] mt-0.5">{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <PrimaryButton 
          title="Contact Logistics Dispatcher"
          onPress={() => alert('Dialing logistics carrier at 1800-HEALTH-SYNC...')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
