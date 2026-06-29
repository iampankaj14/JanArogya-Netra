import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import TextInput from '@/components/ui/inputs/TextInput';
import Dropdown from '@/components/ui/inputs/Dropdown';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { dummyPHCs } from '@/dummy/phcs';

export default function ResourceRedistributionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Selected default target facility from parameters
  const defaultTarget = dummyPHCs.find(p => p.id === id)?.id || '';

  const [sourceId, setSourceId] = useState('phc_dharampur'); // Dharampur PHC has surplus
  const [targetId, setTargetId] = useState(defaultTarget || 'phc_kalan');
  const [medicineId, setMedicineId] = useState('m2'); // Dengue NS1 antigen kits
  const [qty, setQty] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  const phcOptions = dummyPHCs.map(p => ({ label: p.name, value: p.id }));
  
  const medicineOptions = [
    { label: 'Dengue NS1 Antigen Test Kit', value: 'm2' },
    { label: 'Paracetamol 500mg', value: 'm1' },
    { label: 'Amoxicillin 250mg', value: 'm3' },
    { label: 'Oral Rehydration Salts (ORS)', value: 'm4' },
  ];

  const handleSubmit = () => {
    if (!qty || isNaN(Number(qty)) || Number(qty) <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }
    if (sourceId === targetId) {
      alert('Source and target facilities cannot be the same.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert('Transfer order submitted successfully! Cargo dispatch V1 created.');
      router.replace('/(tabs)/situation-room');
    }, 1500);
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
        <Text className="text-white font-black text-lg">Draft Transfer Dispatch</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <Text className="text-white text-base font-bold mb-5">Stock Allocation Request</Text>

          <View className="space-y-5">
            <Dropdown
              label="Source Facility (Surplus)"
              placeholder="Select donor PHC"
              options={phcOptions}
              selectedValue={sourceId}
              onValueChange={setSourceId}
            />

            <Dropdown
              label="Target Facility (Shortage)"
              placeholder="Select receiving PHC"
              options={phcOptions}
              selectedValue={targetId}
              onValueChange={setTargetId}
            />

            <Dropdown
              label="Requested Medicine / Resource"
              placeholder="Select supply item"
              options={medicineOptions}
              selectedValue={medicineId}
              onValueChange={setMedicineId}
            />

            <TextInput
              label="Reallocation Quantity (Units)"
              placeholder="e.g. 50"
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
            />

            <View className="pt-3">
              <PrimaryButton
                title="Initiate Redistribution Cargo"
                loading={submitting}
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
