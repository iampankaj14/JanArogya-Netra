import React, { useState } from 'react';
import { View, Text, Image, TextInput, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import PHCCard from '@/components/ui/cards/PHCCard';
import EmptyState from '@/components/ui/feedback/EmptyState';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { useRoleScopedPHCs } from '@/hooks/usePHCs';
import { useTranslation } from '@/hooks/useTranslation';

export default function PHCsScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { t, language } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');

  const isBMO = authState?.role === 'BMO';
  const isPHC = authState?.role === 'PHC';

  const { phcs: roleFilteredPHCs, loading: phcsLoading } = useRoleScopedPHCs();

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
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
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
              <Text className="text-2xl font-black text-brand-navy leading-tight tracking-tight">{t('phcsListTitle')}</Text>
              <Text className="text-slate-500 text-xs mt-1 leading-relaxed">{t('phcsListSubtitle')}</Text>
            </View>
          </View>

          {/* Hospital Illustration Absolute Positioned */}
          <View className="absolute right-[-10] top-0 z-0 opacity-90">
            <Image 
              source={require('@/data/phc/phc illustration/green1.png')} 
              className="w-36 h-28"
              style={{ width: 144, height: 112 }}
              resizeMode="contain"
            />
          </View>

          {/* Search Bar */}
          <View className="mt-4 bg-white flex-row items-center px-4 h-12 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-100 z-10">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-3 text-slate-800 font-medium text-sm"
              placeholder={t('phcsSearchPlaceholder')}
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
              <Image source={require('@/data/phc/metric icon/total_phc.png')} className="w-10 h-10 mr-3" style={{ width: 40, height: 40 }} resizeMode="contain" />
              <View>
                {phcsLoading ? <Skeleton width={40} height={24} className="mb-1" /> : <Text className="text-2xl font-black text-slate-800 leading-none">{totalCount}</Text>}
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('phcsMetricTotalLabel')}</Text>
                <Text className="text-[8px] text-slate-400">{isBMO ? t('phcsMetricYourBlock') : isPHC ? t('phcsMetricYourFacility') : t('phcsMetricAllBlocks')}</Text>
              </View>
            </TouchableOpacity>

            {/* Operational */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('operational')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'operational' ? 'border-emerald-500 bg-[#ECFDF5]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/fine.png')} className="w-10 h-10 mr-3" style={{ width: 40, height: 40 }} resizeMode="contain" />
              <View>
                {phcsLoading ? <Skeleton width={40} height={24} className="mb-1" /> : <Text className="text-2xl font-black text-slate-800 leading-none">{operationalCount}</Text>}
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('phcsMetricOperationalLabel')}</Text>
                <Text className="text-[8px] text-slate-400">{`${totalCount > 0 ? Math.round((operationalCount/totalCount)*100) : 0}${t('phcsMetricOfTotalSuffix')}`}</Text>
              </View>
            </TouchableOpacity>

            {/* Need Attention */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('attention')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'attention' ? 'border-amber-500 bg-[#FFFBEB]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/need.png')} className="w-10 h-10 mr-3" style={{ width: 40, height: 40 }} resizeMode="contain" />
              <View>
                {phcsLoading ? <Skeleton width={40} height={24} className="mb-1" /> : <Text className="text-2xl font-black text-slate-800 leading-none">{attentionCount}</Text>}
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('phcsMetricAttentionLabel')}</Text>
                <Text className="text-[8px] text-slate-400">{`${totalCount > 0 ? Math.round((attentionCount/totalCount)*100) : 0}${t('phcsMetricOfTotalSuffix')}`}</Text>
              </View>
            </TouchableOpacity>

            {/* Critical */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setActiveMetricFilter('critical')}
              className={`w-[48%] rounded-2xl p-3 shadow-sm border flex-row items-center ${activeMetricFilter === 'critical' ? 'border-red-500 bg-[#FEF2F2]' : 'border-slate-100 bg-white'}`}
            >
              <Image source={require('@/data/phc/metric icon/critical.png')} className="w-10 h-10 mr-3" style={{ width: 40, height: 40 }} resizeMode="contain" />
              <View>
                {phcsLoading ? <Skeleton width={40} height={24} className="mb-1" /> : <Text className="text-2xl font-black text-slate-800 leading-none">{criticalCount}</Text>}
                <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{t('phcsMetricCriticalLabel')}</Text>
                <Text className="text-[8px] text-slate-400">{`${totalCount > 0 ? Math.round((criticalCount/totalCount)*100) : 0}${t('phcsMetricOfTotalSuffix')}`}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* LIST SECTION */}
        <View className="px-4">
          <Text className="text-xs font-bold text-black tracking-widest uppercase mb-3 ml-1">PHCS FACILITY</Text>
          
          {phcsLoading ? (
            <View className="gap-3">
              <Skeleton width="100%" height={120} className="rounded-2xl" />
              <Skeleton width="100%" height={120} className="rounded-2xl" />
              <Skeleton width="100%" height={120} className="rounded-2xl" />
            </View>
          ) : filteredPHCs.length > 0 ? (
            filteredPHCs.map(item => (
              <View key={item.id} className="mb-4">
                <PHCCard
                  id={item.id}
                  name={language === 'hi' && item.nameHi ? item.nameHi : item.name}
                  block={language === 'hi' && item.blockHi ? item.blockHi : item.block}
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
          ) : (
            <EmptyState title={t('phcsEmptyTitle')} description={t('phcsEmptyDescription')} />
          )}
        </View>

      </ScrollView>
    </View>
  );
}
