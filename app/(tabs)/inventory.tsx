import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function InventoryScreen() {
  const { authState } = useAuth();

  return (
    <ScrollView className="flex-1 bg-[#F5F8FC] p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-brand-navy">My Inventory</Text>
        <Text className="text-slate-500 mt-1">Manage medicines and supplies for your facility.</Text>
      </View>

      <View className="bg-white p-6 rounded-2xl shadow-sm shadow-slate-200 border border-slate-100 items-center justify-center mt-10">
        <Feather name="box" size={48} color="#0E62CC" />
        <Text className="text-lg font-semibold text-slate-800 mt-4 text-center">
          Inventory module is under construction.
        </Text>
        <Text className="text-sm text-slate-500 mt-2 text-center">
          Logged in as: {authState?.role}
        </Text>
      </View>
    </ScrollView>
  );
}
