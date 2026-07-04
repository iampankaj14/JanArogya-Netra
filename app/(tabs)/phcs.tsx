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
  
  const isBMO = authState?.role === 'BMO';
  const isPHC = authState?.role === 'PHC';
  const assignedFacilityId = authState?.facilityId;

  // 1. Role-based Base Filtering
  const roleFilteredPHCs = dummyPHCs.filter((phc) => {
    if (isBMO && phc.block !== assignedFacilityId) return false;
    if (isPHC && phc.id !== assignedFacilityId) return false;
    return true;
  });

  // Calculate dynamic metrics
  const totalCount = roleFilteredPHCs.length;
  const operationalCount = roleFilteredPHCs.filter(p => p.healthScore >= 90).length;
  const attentionCount = roleFilteredPHCs.filter(p => p.healthScore >= 70 && p.healthScore < 90).length;
  const criticalCount = roleFilteredPHCs.filter(p => p.healthScore < 70).length;

  type MetricFilter = 'total' | 'operational' | 'attention' | 'critical';
  const [activeMetricFilter, setActiveMetricFilter] = useState<MetricFilter>('total');

  // Filtering Logic for List
  const filteredPHCs = roleFilteredPHCs.filter((phc) => {
    // 2. Text Search Filtering (Robust multi-word search)
    const searchTerms = searchQuery.toLowerCase().trim().split(/\\s+/);
    const targetString = `${phc.name} ${phc.block}`.toLowerCase();
    const matchesSearch = searchTerms.every(term => targetString.includes(term));

    // 3. Metric Card Filtering
    let matchesMetric = true;
    if (activeMetricFilter === 'operational') {
      matchesMetric = phc.healthScore >= 90;
    } else if (activeMetricFilter === 'attention') {
      matchesMetric = phc.healthScore >= 70 && phc.healthScore < 90;
    } else if (activeMetricFilter === 'critical') {
      matchesMetric = phc.healthScore < 70;
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
                <Text className="text-2xl font-black text-slate-800 leading-none">{totalCount}</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total PHCs</Text>
                <Text className="text-[8px] text-slate-400">{isBMO ? 'Your Block' : isPHC ? 'Your Facility' : 'All Blocks'}</Text>
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
                <Text className="text-2xl font-black text-slate-800 leading-none">{operationalCount}</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Operational</Text>
                <Text className="text-[8px] text-slate-400">{totalCount > 0 ? Math.round((operationalCount/totalCount)*100) : 0}% of total</Text>
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
                <Text className="text-2xl font-black text-slate-800 leading-none">{attentionCount}</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Need Attention</Text>
                <Text className="text-[8px] text-slate-400">{totalCount > 0 ? Math.round((attentionCount/totalCount)*100) : 0}% of total</Text>
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
                <Text className="text-2xl font-black text-slate-800 leading-none">{criticalCount}</Text>
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Critical</Text>
                <Text className="text-[8px] text-slate-400">{totalCount > 0 ? Math.round((criticalCount/totalCount)*100) : 0}% of total</Text>
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
                  staffPresent={item.staffPresent}
                  staffTotal={item.staffTotal}
                  weeklyFootfall={item.weeklyFootfall}
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
