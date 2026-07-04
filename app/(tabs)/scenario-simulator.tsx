import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { Dropdown } from '@/components/ui/inputs/Dropdown';
import geminiService from '@/services/ai/geminiService';
import { ScenarioSimulationResult } from '@/shared/types/ai';

export default function ScenarioSimulatorScreen() {
  const router = useRouter();
  
  const [scenario, setScenario] = useState('Dengue Outbreak Surge');
  const [severity, setSeverity] = useState('High');
  const [region, setRegion] = useState('Gautam Budh Nagar');
  const [timeWindow, setTimeWindow] = useState('Next 7 Days');
  
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);

  const handleRunSimulation = async () => {
    setSimulating(true);
    setResult(null);
    
    try {
      const simResult = await geminiService.simulateScenario(scenario, { severity, region, timeWindow });
      setResult(simResult);
    } catch (error) {
      console.error('Simulation failed', error);
      alert('Failed to run simulation. Please try again.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6 px-1">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm shadow-black/5 items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#000" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">Scenario Simulator</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">AI-powered health risk simulation & recommendations</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Promo Banner */}
        <View className="bg-blue-50/80 border border-blue-100 rounded-3xl p-5 mb-6 flex-row items-center justify-between overflow-hidden relative">
          <View className="flex-1 pr-4 z-10">
            <Text className="text-brand-navy font-black text-[15px] mb-2 leading-tight">Simulate. Predict.{'\n'}Prepare. Prevent.</Text>
            <Text className="text-slate-500 text-[9px] font-semibold leading-4 mb-4">Use AI insights to simulate health scenarios and get actionable recommendations.</Text>
            
            <View className="bg-white border border-blue-100 rounded-full px-2.5 py-1.5 flex-row items-center self-start">
              <Feather name="aperture" size={10} color="#3B82F6" className="mr-1" />
              <Text className="text-blue-600 font-bold text-[8px] uppercase tracking-wider">Powered by Gemini AI</Text>
            </View>
          </View>
          
          {/* Dashboard / Shield Illustration built with Views */}
          <View className="w-28 h-24 bg-blue-100/50 rounded-xl justify-center items-center relative z-10 border-2 border-white shadow-sm mr-2">
            <View className="w-24 h-16 bg-blue-400 rounded-lg overflow-hidden border border-blue-300 relative">
               <View className="flex-row p-1 h-full">
                  <View className="w-1/2 h-full bg-white/20 rounded pl-1 pt-1 border border-white/30 mr-1">
                     <View className="w-full flex-row items-end h-8 space-x-1 pl-1">
                       <View className="w-1.5 h-3 bg-white rounded-t-sm" />
                       <View className="w-1.5 h-5 bg-white rounded-t-sm" />
                       <View className="w-1.5 h-7 bg-white rounded-t-sm" />
                     </View>
                  </View>
                  <View className="w-1/2 space-y-1">
                    <View className="flex-1 bg-white/20 rounded border border-white/30 items-center justify-center">
                       <View className="w-3 h-3 bg-white rounded-full items-center justify-center">
                         <View className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                       </View>
                    </View>
                    <View className="flex-1 bg-white/20 rounded border border-white/30 items-center justify-center">
                       <View className="w-4 h-4 rounded-full border-2 border-white items-center justify-center" />
                    </View>
                  </View>
               </View>
            </View>
            {/* Monitor Stand */}
            <View className="w-8 h-2 bg-blue-300" />
            <View className="w-16 h-1 bg-blue-300 rounded-full" />

            {/* Overlapping Shield */}
            <View className="absolute -left-3 -bottom-2 w-14 h-16 bg-blue-500 rounded-xl items-center justify-center shadow-lg border-2 border-white" style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
               <Feather name="plus" size={24} color="#FFF" />
            </View>
          </View>
        </View>

        {/* Simulation Parameters */}
        <View className="bg-white border border-slate-100 shadow-sm p-5 rounded-3xl mb-6">
          <View className="flex-row items-center mb-5">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2 border border-blue-100">
              <Feather name="sliders" size={14} color="#3B82F6" />
            </View>
            <Text className="text-brand-navy text-[15px] font-black">Simulation Parameters</Text>
          </View>
          
          <View>
            
            {/* Scenario */}
            <View className="mb-6">
              <Dropdown
                label="1. Select Hypothetical Risk Scenario"
                selectedValue={scenario}
                onValueChange={setScenario}
                options={[
                  { label: 'Dengue Outbreak Surge', value: 'Dengue Outbreak Surge' },
                  { label: 'Severe Heatwave', value: 'Severe Heatwave' },
                  { label: 'Monsoon Flooding', value: 'Monsoon Flooding' },
                  { label: 'Viral Fever Epidemic', value: 'Viral Fever Epidemic' }
                ]}
              />
            </View>

            {/* Severity */}
            <View className="mb-6">
              <Text className="text-brand-navy text-[11px] font-extrabold mb-2">2. Severity Level</Text>
              <View className="flex-row space-x-2">
                
                {/* Low */}
                <Pressable onPress={() => setSeverity('Low')} className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${severity === 'Low' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                  <View className="w-3 h-3 rounded-full bg-emerald-100 items-center justify-center mr-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </View>
                  <Text className={`font-bold text-[11px] ${severity === 'Low' ? 'text-emerald-700' : 'text-slate-600'}`}>Low</Text>
                </Pressable>

                {/* Medium */}
                <Pressable onPress={() => setSeverity('Medium')} className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${severity === 'Medium' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                  <View className="w-3 h-3 rounded-full bg-orange-100 items-center justify-center mr-2">
                    <View className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  </View>
                  <Text className={`font-bold text-[11px] ${severity === 'Medium' ? 'text-orange-700' : 'text-slate-600'}`}>Medium</Text>
                </Pressable>

                {/* High */}
                <Pressable onPress={() => setSeverity('High')} className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl border ${severity === 'High' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}>
                  <View className="w-4 h-4 rounded-full bg-red-100 items-center justify-center mr-1">
                    <Feather name="bar-chart-2" size={10} color="#EF4444" />
                  </View>
                  <Text className={`font-bold text-[11px] ${severity === 'High' ? 'text-red-600' : 'text-slate-600'}`}>High</Text>
                </Pressable>

              </View>
            </View>

            {/* Region */}
            <View className="mb-6 mt-1">
              <Dropdown
                label="3. Region / Area"
                selectedValue={region}
                onValueChange={setRegion}
                options={[
                  { label: 'Gautam Budh Nagar', value: 'Gautam Budh Nagar' },
                  { label: 'Noida City Zone', value: 'Noida City Zone' },
                  { label: 'Dadri Rural', value: 'Dadri Rural' },
                  { label: 'Jewar Block', value: 'Jewar Block' }
                ]}
              />
            </View>

            {/* Time Window */}
            <View className="mb-8 mt-1">
              <Dropdown
                label="4. Simulation Time Window"
                selectedValue={timeWindow}
                onValueChange={setTimeWindow}
                options={[
                  { label: 'Next 7 Days', value: 'Next 7 Days' },
                  { label: 'Next 14 Days', value: 'Next 14 Days' },
                  { label: 'Next 30 Days', value: 'Next 30 Days' }
                ]}
              />
            </View>

            {/* Action Button */}
            <Pressable 
              onPress={handleRunSimulation}
              className="w-full rounded-2xl py-3.5 flex-row justify-center items-center bg-[#9370DB] shadow-md shadow-purple-500/30"
              style={{ elevation: 3 }}
            >
              {simulating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="aperture" size={16} color="#FFF" className="mr-2" />
                  <Text className="text-white font-extrabold text-[13px]">Run AI Simulation</Text>
                </>
              )}
            </Pressable>

          </View>
        </View>

        {/* Results output view */}
        {result && (
          <View className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 mb-6">
            
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2 border border-blue-100">
                  <Feather name="aperture" size={14} color="#3B82F6" />
                </View>
                <Text className="text-brand-navy text-[15px] font-black">Simulation Analysis Summary</Text>
              </View>
              <View className="bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 flex-row items-center">
                <Feather name="check-circle" size={10} color="#10B981" className="mr-1" />
                <Text className="text-emerald-700 font-bold text-[9px]">Confidence: 88%</Text>
              </View>
            </View>

            {/* AI Impact Assessment Box */}
            <View className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-md bg-emerald-100 items-center justify-center mr-2">
                    <Feather name="shield" size={12} color="#10B981" />
                  </View>
                  <Text className="text-emerald-800 font-extrabold text-[13px]">AI Impact Assessment</Text>
                </View>
              <View className="bg-emerald-100/50 rounded-full px-2 py-1">
                  <Text className="text-emerald-700 font-extrabold text-[9px]">High Risk Detected</Text>
                </View>
              </View>
              <Text className="text-slate-600 font-semibold text-[10px] leading-relaxed">
                {result.suggestedTransfers.length > 0 
                  ? result.suggestedTransfers[0].reasoning 
                  : "Based on regional trends, climate indices, and current case patterns, a high severity scenario may cause a sharp rise in patient admissions within 72 hours. Immediate action is recommended to prevent resource strain."}
              </Text>
            </View>

            {/* 3 Stat Cards Row */}
            <View className="flex-row justify-between mb-4 space-x-2">
              
              {/* Card 1: Red */}
              <View className="flex-1 bg-red-50/50 border border-red-50 rounded-2xl p-3 items-center">
                <View className="w-8 h-8 rounded-full bg-red-100/50 items-center justify-center mb-1">
                  <MaterialCommunityIcons name="bed-empty" size={16} color="#EF4444" />
                </View>
                <Text className="text-slate-700 font-bold text-[8px] text-center mb-0.5" numberOfLines={1}>Inpatient Beds Required</Text>
                <Text className="text-red-500 font-black text-lg mb-1">{result.estimatedBedRequirement} units</Text>
                <View className="bg-red-100/60 rounded-full px-2 py-0.5">
                  <Text className="text-red-600 font-bold text-[7px]">High Demand</Text>
                </View>
              </View>

              {/* Card 2: Orange */}
              <View className="flex-1 bg-orange-50/50 border border-orange-50 rounded-2xl p-3 items-center">
                <View className="w-8 h-8 rounded-full bg-orange-100/50 items-center justify-center mb-1">
                  <MaterialCommunityIcons name="pill" size={16} color="#F97316" />
                </View>
                <Text className="text-slate-700 font-bold text-[8px] text-center mb-0.5" numberOfLines={1}>Drug Demand Surge</Text>
                <Text className="text-orange-500 font-black text-lg mb-1">
                  {Object.values(result.estimatedMedicineDemand).reduce((a, b) => a + b, 0)} units
                </Text>
                <View className="bg-orange-100/60 rounded-full px-2 py-0.5">
                  <Text className="text-orange-600 font-bold text-[7px]">Very High</Text>
                </View>
              </View>

              {/* Card 3: Purple */}
              <View className="flex-1 bg-purple-50/50 border border-purple-50 rounded-2xl p-3 items-center">
                <View className="w-8 h-8 rounded-full bg-purple-100/50 items-center justify-center mb-1">
                  <Feather name="users" size={14} color="#8B5CF6" />
                </View>
                <Text className="text-slate-700 font-bold text-[8px] text-center mb-0.5" numberOfLines={1}>Additional Staff</Text>
                <Text className="text-purple-600 font-black text-lg mb-1">+{result.estimatedStaffRequirement}</Text>
                <View className="bg-purple-100/60 rounded-full px-2 py-0.5">
                  <Text className="text-purple-600 font-bold text-[7px]">In 7 Days</Text>
                </View>
              </View>

            </View>

            {/* AI Recommended Actions */}
            <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-row justify-between items-center overflow-hidden relative">
              <View className="flex-1 pr-16 z-10">
                <View className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mr-2">
                    <Feather name="aperture" size={10} color="#2563EB" />
                  </View>
                  <Text className="text-blue-700 font-extrabold text-[11px]">AI Recommended Actions</Text>
                </View>

                <View className="space-y-2">
                  {result.suggestedTransfers.slice(0, 3).map((rec, i) => (
                    <View key={rec.id || i} className="flex-row items-start">
                      <Feather name="check-circle" size={10} color="#3B82F6" className="mt-0.5 mr-2" />
                      <Text className="text-brand-navy font-semibold text-[9px] leading-3 flex-1">{rec.title || `Transfer ${rec.quantity} ${rec.item}`}</Text>
                    </View>
                  ))}
                  {result.suggestedTransfers.length === 0 && (
                    <View className="flex-row items-start">
                      <Feather name="check-circle" size={10} color="#3B82F6" className="mt-0.5 mr-2" />
                      <Text className="text-brand-navy font-semibold text-[9px] leading-3 flex-1">Ensure resources are properly stocked based on regular schedules.</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Clipboard Illustration */}
              <View className="absolute -right-2 -bottom-2 w-24 h-24 bg-blue-200/40 rounded-xl justify-center items-center z-0 border border-white">
                 <View className="w-14 h-16 bg-white rounded-lg border border-blue-200 items-center py-2 shadow-sm relative">
                   {/* Clip */}
                   <View className="w-6 h-2 bg-slate-300 rounded-full absolute -top-1" />
                   
                   {/* Lines */}
                   <View className="w-full px-2 mt-2 space-y-1.5">
                     <View className="flex-row items-center">
                       <Feather name="check-square" size={8} color="#3B82F6" />
                       <View className="flex-1 h-1 bg-slate-200 rounded-full ml-1" />
                     </View>
                     <View className="flex-row items-center">
                       <Feather name="check-square" size={8} color="#3B82F6" />
                       <View className="flex-1 h-1 bg-slate-200 rounded-full ml-1" />
                     </View>
                     <View className="flex-row items-center">
                       <Feather name="square" size={8} color="#CBD5E1" />
                       <View className="flex-1 h-1 bg-slate-200 rounded-full ml-1" />
                     </View>
                   </View>

                   {/* Check Shield Overlap */}
                   <View className="absolute -bottom-3 -right-3 w-10 h-10 bg-blue-500 rounded-xl items-center justify-center shadow-lg border-2 border-white" style={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                     <Feather name="check" size={18} color="#FFF" />
                   </View>
                 </View>
              </View>

            </View>

          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
