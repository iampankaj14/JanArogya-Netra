import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import Divider from '@/components/ui/layout/Divider';
import Dropdown from '@/components/ui/inputs/Dropdown';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import BarChart from '@/components/ui/charts/BarChart';
import AreaChart from '@/components/ui/charts/AreaChart';
import FilterChips from '@/components/ui/inputs/FilterChips';
import Badge from '@/components/ui/badges/Badge';

export default function ScenarioSimulatorScreen() {
  const router = useRouter();
  
  const [scenario, setScenario] = useState('DENGUE');
  const [severity, setSeverity] = useState('HIGH');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scenarioOptions = [
    { label: 'Dengue Outbreak Surge', value: 'DENGUE' },
    { label: 'Seasonal Heatwave Crisis', value: 'HEATWAVE' },
    { label: 'Flood-induced Diarrheal Surge', value: 'FLOOD' },
    { label: 'Staff Absences Crisis (MO Leave)', value: 'STAFF' },
  ];

  const severityOptions = ['LOW', 'MED', 'HIGH'];

  const handleRunSimulation = () => {
    setSimulating(true);
    setResult(null);
    
    // Simulate Gemini processing lag
    setTimeout(() => {
      setSimulating(false);
      setResult({
        medicineDemandMultiplier: severity === 'HIGH' ? 2.5 : severity === 'MED' ? 1.8 : 1.2,
        estimatedBedsNeeded: severity === 'HIGH' ? 12 : severity === 'MED' ? 8 : 4,
        confidence: 88,
        reasoning: `Based on regional trends and local climate indexes, a ${severity.toLowerCase()} severity ${scenario.toLowerCase()} scenario will trigger a spike in patient admissions. Immediate redistribution of ORS sachets and Dengue kits is recommended to prevent stock depletion in 72 hours.`,
      });
    }, 1800);
  };

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
        <Text className="text-white font-black text-lg">Scenario Simulator</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Simulator controls */}
        <View className="bg-slate-900 border border-slate-800 p-6 rounded-3xl mb-6">
          <Text className="text-white text-base font-bold mb-4">Simulation Parameters</Text>
          
          <View className="space-y-4">
            <Dropdown
              label="Hypothetical Risk Scenario"
              placeholder="Select scenario"
              options={scenarioOptions}
              selectedValue={scenario}
              onValueChange={setScenario}
            />

            <View>
              <Text className="text-slate-400 text-xs font-bold mb-2">Severity Level</Text>
              <FilterChips
                options={severityOptions}
                selectedOption={severity}
                onSelectOption={setSeverity}
              />
            </View>

            <View className="pt-2">
              <PrimaryButton
                title="Run Gemini Simulator Drill"
                loading={simulating}
                onPress={handleRunSimulation}
              />
            </View>
          </View>
        </View>

        {/* Results output view */}
        {simulating && (
          <View className="items-center justify-center py-10 bg-slate-900/20 border border-slate-800 rounded-3xl p-5 mb-6">
            <ActivityIndicator size="large" color="#3B82F6" className="mb-4" />
            <Text className="text-slate-400 text-xs font-bold tracking-wider">Netra is compiling historical weather logs and inventory metrics...</Text>
          </View>
        )}

        {result && (
          <View>
            {/* Simulation diagnosis brief */}
            <SectionHeader title="Simulation Analysis Summary" />
            <View className="bg-blue-950/20 border border-blue-900/30 rounded-3xl p-5 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Feather name="eye" size={18} color="#60A5FA" className="mr-2" />
                  <Text className="text-blue-400 font-extrabold text-xs uppercase tracking-wider">Estimated Impact</Text>
                </View>
                <Badge label={`Confidence: ${result.confidence}%`} variant="success" />
              </View>
              <Text className="text-slate-200 text-xs leading-relaxed mb-4">
                {result.reasoning}
              </Text>
              <Divider />
              <View className="flex-row justify-between pt-2">
                <View>
                  <Text className="text-slate-500 text-[9px] uppercase font-bold">Inpatient Beds Required</Text>
                  <Text className="text-red-400 text-lg font-black mt-0.5">{result.estimatedBedsNeeded} units</Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-[9px] uppercase font-bold">Drug Demand Surge</Text>
                  <Text className="text-yellow-400 text-lg font-black mt-0.5">+{Math.round((result.medicineDemandMultiplier - 1) * 100)}%</Text>
                </View>
              </View>
            </View>

            {/* Simulated charts demand projection */}
            <SectionHeader title="Projected Resource Demand Surge" />
            <View className="mb-6">
              <AreaChart title="Estimated daily drug usage spike" />
            </View>
            <View className="mb-6">
              <BarChart title="Inpatient bed occupancy demand" />
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
