import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PHCHomeDashboard() {
  const { authState } = useAuth();
  
  return (
    <ScrollView className="flex-1 bg-[#F5F8FC]" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Welcome Banner */}
      <View className="px-4 mt-6">
        <Text className="text-2xl font-black text-brand-navy">Welcome, {authState?.email?.split('@')[0] || 'Dr. Sharma'}</Text>
        <Text className="text-slate-500 text-sm mt-1">Facility Operations Dashboard</Text>
      </View>

      {/* Quick Stats Grid */}
      <View className="px-4 mt-6 flex-row flex-wrap justify-between">
        {/* Today's OPD */}
        <View className="w-[48%] bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
              <Feather name="users" size={16} color="#0E62CC" />
            </View>
            <Text className="text-xs font-bold text-emerald-600">+12%</Text>
          </View>
          <Text className="text-3xl font-black text-slate-800">142</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Today's OPD</Text>
        </View>

        {/* Critical Medicines */}
        <View className="w-[48%] bg-white rounded-2xl p-4 shadow-sm border border-red-50 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
              <MaterialCommunityIcons name="pill" size={18} color="#EF4444" />
            </View>
            <Text className="text-xs font-bold text-red-500">Urgent</Text>
          </View>
          <Text className="text-3xl font-black text-slate-800">3</Text>
          <Text className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Low Stock Items</Text>
        </View>
      </View>

      {/* Local Disease Alerts */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-bold text-slate-800 uppercase tracking-widest">Local Alerts (2km Radius)</Text>
          <Feather name="alert-circle" size={16} color="#94A3B8" />
        </View>

        <LinearGradient
          colors={['#FFF5F5', '#FFFFFF']}
          className="rounded-2xl p-4 border border-red-100"
        >
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3 mt-1">
              <MaterialCommunityIcons name="virus" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center">
                <Text className="font-bold text-slate-800">Dengue Cluster Detected</Text>
                <Text className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">HIGH</Text>
              </View>
              <Text className="text-xs text-slate-600 mt-1">
                5 new cases reported in Village Rampur within the last 24 hours. Prepare IV fluids and testing kits.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View className="px-4 mt-8">
        <Text className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Quick Actions</Text>
        
        <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <View className="flex-row items-center p-4 border-b border-slate-50">
            <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center mr-4">
              <Feather name="edit-3" size={18} color="#4F46E5" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Add Patient Entry</Text>
              <Text className="text-xs text-slate-500">Record new OPD or IPD case</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#CBD5E1" />
          </View>
          
          <View className="flex-row items-center p-4 border-b border-slate-50">
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-4">
              <Feather name="file-plus" size={18} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-800">Request Indent</Text>
              <Text className="text-xs text-slate-500">Order medicines from BMO</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#CBD5E1" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
