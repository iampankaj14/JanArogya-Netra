import React, { useState } from 'react';
import { View, Text, Image, TextInput, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import PHCCard from '@/components/ui/cards/PHCCard';
import EmptyState from '@/components/ui/feedback/EmptyState';
import { dummyPHCs } from '@/dummy/phcs';

export default function PHCsScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // BMOs are restricted to their specific block (Simulating 'Rampur' as the BMO's block for demo)
  const isBMO = authState?.role === 'BMO';
  const assignedBlock = 'Rampur';

  type MetricFilter = 'total' | 'operational' | 'attention' | 'critical';
  const [activeMetricFilter, setActiveMetricFilter] = useState<MetricFilter>('total');

  // Filtering Logic
  const filteredPHCs = dummyPHCs.filter((phc) => {
    // 1. Role-based Block filtering
    if (isBMO && phc.block !== assignedBlock) return false;
    
    // 2. Text Search Filtering
    const matchesSearch =
      phc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phc.block.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Metric Card Filtering
    let matchesMetric = true;
    if (activeMetricFilter === 'operational') {
      matchesMetric = phc.stockStatus === 'adequate';
    } else if (activeMetricFilter === 'attention') {
      matchesMetric = phc.stockStatus === 'warning';
    } else if (activeMetricFilter === 'critical') {
      matchesMetric = phc.stockStatus === 'critical';
    }

    return matchesSearch && matchesMetric;
  });

  const handlePHCPress = (id: string) => {
    router.push({
      pathname: '/(tabs)/phc-detail',
      params: { id }
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* TOP HEADER SECTION */}
        <View className="pt-2 pb-2 px-4 relative">
          
          <View className="flex-row items-center justify-between z-10 mt-2">
            {/* Left Header */}
            <View className="flex-1 pr-32">
              <Text className="text-2xl font-black text-brand-navy leading-tight tracking-tight">Primary Health Centers</Text>
              <Text className="text-slate-500 text-xs mt-1 leading-relaxed">Operational directories and real-time score registries</Text>
            </View>
          </View>

          {/* Hospital Illustration Absolute Positioned */}
          <View className="absolute right-[-10] top-0 z-0 opacity-90">
            <Image 
              source={require('@/data/phc/phc illustration/green1.png')} 
              className="w-36 h-28"
              resizeMode="contain"
            />
          </View>

          {/* Search Bar */}
          <View className="mt-4 bg-white flex-row items-center px-4 h-12 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-100 z-10">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium text-sm"
              placeholder="Search by center name or block..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* METRICS ROW (Now Functional Filters) */}
        <View className="px-4 mt-2 mb-6">
          <View className="flex-row flex-wrap justify-between gap-y-3">
            
            {/* Total PHCs */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('total')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'total' ? 'border-[#153488] bg-[#EFF6FF]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/total_phc.png')} className="w-10 h-10 mr-3" resizeMode="contain" />
              <View>
                <Text className="text-2xl font-black text-slate-800 leading-none">128</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total PHCs</Text>
                <Text className="text-[8px] text-slate-400">All Blocks</Text>
              </View>
            </TouchableOpacity>

            {/* Operational */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('operational')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'operational' ? 'border-emerald-500 bg-[#ECFDF5]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/fine.png')} className="w-10 h-10 mr-3" resizeMode="contain" />
              <View>
                <Text className="text-2xl font-black text-slate-800 leading-none">92</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Operational</Text>
                <Text className="text-[8px] text-slate-400">72% of total</Text>
              </View>
            </TouchableOpacity>

            {/* Need Attention */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('attention')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'attention' ? 'border-amber-500 bg-[#FFFBEB]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/need.png')} className="w-10 h-10 mr-3" resizeMode="contain" />
              <View>
                <Text className="text-2xl font-black text-slate-800 leading-none">24</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Need Attention</Text>
                <Text className="text-[8px] text-slate-400">19% of total</Text>
              </View>
            </TouchableOpacity>

            {/* Critical */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('critical')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'critical' ? 'border-red-500 bg-[#FEF2F2]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/critical.png')} className="w-10 h-10 mr-3" resizeMode="contain" />
              <View>
                <Text className="text-2xl font-black text-slate-800 leading-none">12</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Critical</Text>
                <Text className="text-[8px] text-slate-400">9% of total</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* LIST */}
        <View className="px-4 mt-2">
          {filteredPHCs.length === 0 ? (
            <EmptyState title="No Facilities Found" description="No health centers matched your selected filters." />
          ) : (
            filteredPHCs.map((item) => (
              <View key={item.id} className="mb-4">
                <PHCCard
                  id={item.id}
                  name={item.name}
                  block={item.block}
                  healthScore={item.healthScore}
                  doctorAvailable={item.doctorAvailable}
                  stockStatus={item.stockStatus}
                  activeAlertsCount={item.activeAlertsCount}
                  onPress={() => handlePHCPress(item.id)}
                />
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}
