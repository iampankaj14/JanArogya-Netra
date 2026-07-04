import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { dummyPHCs } from '@/dummy/phcs';
import { localMedicines } from '@/services/repositories/localDb';

export default function ResourceRedistributionScreen() {
  const router = useRouter();
  const { source, target, medicine, amount } = useLocalSearchParams();
  
  const [qty, setQty] = useState((amount as string) || '50');
  const [submitting, setSubmitting] = useState(false);

  // Dynamic values
  const sourcePhc = dummyPHCs.find(p => p.id === source) || dummyPHCs[0];
  const targetPhc = dummyPHCs.find(p => p.id === target) || dummyPHCs[1];
  const medicineObj = localMedicines.find(m => m.id === medicine) || localMedicines[0];
  
  const sourceName = sourcePhc?.name || 'PHC Barola';
  const targetName = targetPhc?.name || 'PHC Badalpur';
  const medicineName = medicineObj?.name || 'Dengue NS1 Antigen Test Kit';
  const availableStock = medicineObj?.currentStock || 120;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert('Transfer dispatched successfully!');
      router.back();
    }, 1500);
  };

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
            <Text className="text-brand-navy font-black text-[22px] tracking-tight">Draft Transfer Dispatch</Text>
            <Text className="text-slate-500 text-[11px] font-semibold mt-0.5">Move stock. Meet demand. Save lives.</Text>
          </View>
        </View>
        <Pressable className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 items-center justify-center active:bg-blue-100 shadow-sm">
          <Feather name="truck" size={18} color="#2563EB" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Promo Banner */}
        <View className="bg-blue-50/80 border border-blue-100 rounded-[28px] p-5 mb-6 flex-row items-center justify-between overflow-hidden relative shadow-sm">
          <View className="flex-1 pr-6 z-10">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-white shadow-sm border border-blue-100 items-center justify-center mr-3">
                <Feather name="package" size={20} color="#3B82F6" />
              </View>
              <Text className="text-blue-600 font-black text-[20px] tracking-tight">Stock Transfer</Text>
            </View>
            <Text className="text-slate-500 text-[10px] font-semibold leading-4">
              Allocate medicines & resources from surplus facilities to where they're needed most.
            </Text>
          </View>
          
          {/* Illustration built with Views */}
          <View className="w-28 h-20 bg-blue-100/50 rounded-xl justify-center items-center relative z-10 mr-1 shadow-sm border-2 border-white">
             {/* Map pin */}
             <View className="absolute top-2 right-2 items-center">
               <View className="w-6 h-6 rounded-full bg-purple-100 items-center justify-center border-2 border-white shadow-sm">
                 <Feather name="map-pin" size={10} color="#9333EA" />
               </View>
             </View>
             
             {/* Clipboard / boxes */}
             <View className="w-16 h-20 bg-blue-50 absolute right-4 -bottom-4 rounded-t-lg border-t-2 border-l-2 border-r-2 border-white overflow-hidden p-2">
                <View className="w-full h-2 bg-blue-200 rounded-full mb-2" />
                <View className="space-y-1.5">
                  <View className="w-full h-1 bg-blue-100 rounded-full" />
                  <View className="w-full h-1 bg-blue-100 rounded-full" />
                  <View className="w-3/4 h-1 bg-blue-100 rounded-full" />
                </View>
             </View>
             
             {/* Little truck overlapping */}
             <View className="absolute -bottom-1 -left-2 w-12 h-8 bg-blue-500 rounded-lg flex-row items-end pb-1 px-1 border-2 border-white shadow-sm">
                <View className="w-3 h-3 bg-blue-300 rounded-full mr-1 border-2 border-white" />
                <View className="w-3 h-3 bg-blue-300 rounded-full border-2 border-white" />
             </View>
          </View>
        </View>

        {/* Main Form Container */}
        <View className="bg-white border border-slate-100 shadow-sm p-5 rounded-3xl mb-6">
          <View className="flex-row items-center mb-6">
            <View className="w-8 h-8 rounded-md bg-blue-50 items-center justify-center mr-3 border border-blue-100">
              <Feather name="package" size={16} color="#3B82F6" />
            </View>
            <Text className="text-brand-navy text-[17px] font-black tracking-tight">Stock Allocation Request</Text>
          </View>
          
          <View>
            
            {/* 1. Source Facility */}
            <View className="mb-6">
              <Text className="text-brand-navy text-[11px] font-extrabold mb-2">1. Source Facility (Surplus)</Text>
              <View className="bg-emerald-50/30 border border-emerald-400 rounded-2xl px-4 py-3.5 flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center">
                   <View className="w-7 h-7 rounded-md bg-emerald-100 items-center justify-center mr-3">
                     <Feather name="activity" size={14} color="#10B981" />
                   </View>
                   <Text className="text-brand-navy font-bold text-[13px]">{sourceName}</Text>
                </View>
                <Feather name="chevron-down" size={16} color="#475569" />
              </View>
              <View className="flex-row items-center ml-1">
                <Feather name="check-circle" size={10} color="#10B981" className="mr-1.5" />
                <Text className="text-emerald-600 font-bold text-[9px]">Facility has {availableStock} units available</Text>
              </View>
            </View>

            {/* 2. Target Facility */}
            <View className="mb-6">
              <Text className="text-brand-navy text-[11px] font-extrabold mb-2">2. Target Facility (Shortage)</Text>
              <View className="bg-orange-50/30 border border-orange-400 rounded-2xl px-4 py-3.5 flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center">
                   <View className="w-7 h-7 rounded-md bg-orange-100 items-center justify-center mr-3">
                     <Feather name="home" size={14} color="#F97316" />
                   </View>
                   <Text className="text-brand-navy font-bold text-[13px]">{targetName}</Text>
                </View>
                <Feather name="chevron-down" size={16} color="#475569" />
              </View>
              <View className="flex-row items-center ml-1">
                <Feather name="alert-triangle" size={10} color="#F97316" className="mr-1.5" />
                <Text className="text-orange-500 font-bold text-[9px]">Facility needs immediate stock</Text>
              </View>
            </View>

            {/* 3. Requested Medicine */}
            <View className="mb-6">
              <Text className="text-brand-navy text-[11px] font-extrabold mb-2">3. Requested Medicine / Resource</Text>
              <View className="bg-purple-50/30 border border-purple-300 rounded-2xl px-4 py-3.5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                   <View className="w-7 h-7 rounded-md bg-purple-100 items-center justify-center mr-3">
                     <Feather name="briefcase" size={14} color="#9333EA" />
                   </View>
                   <Text className="text-brand-navy font-bold text-[13px]">{medicineName}</Text>
                </View>
                <Feather name="chevron-down" size={16} color="#475569" />
              </View>
            </View>

            {/* 4. Quantity */}
            <View className="mb-8">
              <Text className="text-brand-navy text-[11px] font-extrabold mb-2">4. Reallocation Quantity (Units)</Text>
              <View className="bg-blue-50/30 border border-blue-300 rounded-2xl px-4 py-2.5 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                   <View className="w-7 h-7 rounded-md bg-blue-100 items-center justify-center mr-3">
                     <Feather name="package" size={14} color="#3B82F6" />
                   </View>
                   <TextInput 
                     value={qty}
                     onChangeText={setQty}
                     keyboardType="numeric"
                     className="flex-1 font-bold text-[15px] text-brand-navy py-1"
                     placeholder="Enter quantity"
                     placeholderTextColor="#94A3B8"
                   />
                </View>
                <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                  <Text className="text-blue-600 font-bold text-[11px]">Units</Text>
                </View>
              </View>
            </View>
            
            {/* Summary Banner */}
            <View className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex-row items-center">
              <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mr-2">
                <Feather name="info" size={10} color="#3B82F6" />
              </View>
              <Text className="text-blue-700 font-semibold text-[9px] flex-1">
                You are transferring <Text className="font-black">{qty || '0'} units</Text> of <Text className="font-black">{medicineName}</Text> from <Text className="font-black">{sourceName}</Text> to <Text className="font-black">{targetName}</Text>.
              </Text>
            </View>

            {/* Action Button */}
            <Pressable 
              onPress={handleSubmit}
              className="w-full rounded-2xl py-4 flex-row justify-center items-center bg-[#8B5CF6] shadow-md shadow-purple-500/30"
              style={{ elevation: 3 }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#FFF" className="mr-2" />
                  <Text className="text-white font-extrabold text-[14px]">Review & Draft Dispatch</Text>
                </>
              )}
            </Pressable>

          </View>
        </View>

        {/* Secure & Trackable Footer */}
        <View className="bg-emerald-50/80 border border-emerald-100 rounded-[28px] p-4 flex-row items-center justify-between overflow-hidden relative shadow-sm">
          <View className="flex-row items-center flex-1 z-10 pr-4">
            <View className="w-10 h-10 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30 items-center justify-center mr-3">
              <Feather name="shield" size={18} color="#FFF" />
            </View>
            <View>
              <Text className="text-emerald-700 font-black text-[13px] mb-0.5">Secure & Trackable</Text>
              <Text className="text-emerald-600/80 font-bold text-[9px] leading-3">All transfers are logged and tracked for transparency.</Text>
            </View>
          </View>

          {/* Graphic on right */}
          <View className="w-14 h-16 bg-white border border-emerald-100 rounded-lg justify-center p-2 shadow-sm relative z-10 mr-1 rotate-12">
            <View className="w-6 h-1.5 bg-slate-200 rounded-full absolute -top-1 left-4" />
            <View className="space-y-1.5 mt-2">
              <View className="flex-row items-center space-x-1"><Feather name="check-square" size={8} color="#10B981" /><View className="w-4 h-1 bg-slate-200 rounded-full"/></View>
              <View className="flex-row items-center space-x-1"><Feather name="check-square" size={8} color="#10B981" /><View className="w-4 h-1 bg-slate-200 rounded-full"/></View>
              <View className="flex-row items-center space-x-1"><Feather name="check-square" size={8} color="#10B981" /><View className="w-4 h-1 bg-slate-200 rounded-full"/></View>
            </View>
            <View className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full items-center justify-center border-2 border-white shadow-sm">
              <Feather name="check" size={12} color="#FFF" />
            </View>
          </View>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
