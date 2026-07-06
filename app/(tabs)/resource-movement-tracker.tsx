import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { useTranslation } from '@/hooks/useTranslation';
import { transfersRepository } from '@/services/repositories/transfersRepository';
import { TransferOrder } from '@/services/repositories/localDb';

export default function ResourceMovementTrackerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trackingId, setTrackingId] = useState('');
  const [shipments, setShipments] = useState<TransferOrder[]>([]);
  const [searchedShipment, setSearchedShipment] = useState<TransferOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const data = await transfersRepository.getTransfers();
        setShipments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  // Fetch recent shipments from logistics that are in transit or pending
  const recentShipments = shipments.filter(l => l.status === 'EN_ROUTE' || l.status === 'PENDING').slice(0, 3);

  const handleSearch = () => {
    if (trackingId.trim()) {
      const found = shipments.find(s => s.id === trackingId.trim());
      if (found) {
        setSearchedShipment(found);
      } else {
        Alert.alert(t('movementTrackerAlertNoticeTitle'), t('movementTrackerAlertNotFound').replace('{trackingId}', trackingId));
        setSearchedShipment(null);
      }
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6 px-1">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => { if (router.canGoBack()) { router.back(); } else { router.push('/'); } }}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#0F172A" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[24px] tracking-tight mb-1">{t('movementTrackerTitle')}</Text>
            <Text className="text-slate-500 text-[13px] font-semibold">{t('movementTrackerSubtitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Track Your Shipment Banner */}
        <View className="bg-slate-50 border border-slate-100 shadow-sm rounded-3xl p-5 mb-6 overflow-hidden relative">
          
          {/* Top text and illustration */}
          <View className="flex-row justify-between z-10 relative">
            <View className="flex-1 pr-4 pt-1">
              <Text className="text-brand-navy font-black text-xl mb-2">{t('movementTrackerBannerTitle')}</Text>
              <Text className="text-slate-500 text-[13px] font-semibold leading-relaxed">
                {t('movementTrackerBannerDesc')}
              </Text>
            </View>
            
            {/* Truck and Map Illustration (built with Views) */}
            <View className="w-32 h-24 relative mt-2 mr-2">
              {/* Buildings background */}
              <View className="absolute bottom-4 left-0 flex-row items-end space-x-1 opacity-20">
                <View className="w-4 h-12 bg-indigo-400 rounded-t-sm" />
                <View className="w-5 h-16 bg-indigo-500 rounded-t-sm" />
                <View className="w-6 h-10 bg-indigo-400 rounded-t-sm" />
                <View className="w-5 h-14 bg-indigo-600 rounded-t-sm" />
              </View>

              {/* Map pin */}
              <View className="absolute -top-3 right-6 items-center z-10">
                <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center border-2 border-white shadow-sm" style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 16, borderTopRightRadius: 2 }}>
                  <View className="w-2.5 h-2.5 rounded-full bg-white" />
                </View>
                <View className="w-1 h-2 bg-purple-500" />
              </View>

              {/* Truck */}
              <View className="absolute bottom-2 right-0 w-24 h-12 bg-blue-500 rounded-xl flex-row items-end pb-1.5 px-2 border border-blue-400 shadow-md">
                 <View className="w-5 h-5 bg-blue-800 rounded-full absolute -bottom-2 left-2 border-2 border-white shadow-sm" />
                 <View className="w-5 h-5 bg-blue-800 rounded-full absolute -bottom-2 right-3 border-2 border-white shadow-sm" />
                 {/* Cabin window */}
                 <View className="w-4 h-4 bg-blue-300 rounded-sm absolute top-2 right-2 border border-blue-400" />
              </View>
              
              {/* Boxes */}
              <View className="absolute bottom-2 left-2 flex-row items-end z-20">
                <View className="w-6 h-6 bg-orange-300 border border-orange-400 rounded-sm" />
                <View className="w-6 h-8 bg-orange-400 border border-orange-500 rounded-sm -ml-2 mb-1" />
              </View>

              {/* Floor shadow */}
              <View className="absolute -bottom-1 left-4 w-28 h-2 bg-blue-100 rounded-full" />
            </View>
          </View>

          {/* Search Input */}
          <View className="bg-white border border-slate-200 rounded-2xl flex-row items-center pl-4 pr-1.5 py-1.5 mt-5 shadow-sm shadow-black/5 z-10 relative">
            <Feather name="search" size={16} color="#3B82F6" className="mr-2" />
            <TextInput
              value={trackingId}
              onChangeText={setTrackingId}
              placeholder={t('movementTrackerSearchPlaceholder')}
              placeholderTextColor="#94A3B8"
              className="flex-1 text-brand-navy font-bold text-[14px] h-10"
            />
            <Pressable onPress={handleSearch} className="bg-blue-600 rounded-xl px-5 h-10 items-center justify-center active:bg-blue-700 shadow-sm shadow-blue-500/20">
              <Text className="text-white font-extrabold text-[14px]">{t('movementTrackerTrackNow')}</Text>
            </Pressable>
          </View>
          
          <View className="flex-row items-center mt-4 mb-1 pl-2">
            <Feather name="shield" size={10} color="#10B981" className="mr-2" />
            <Text className="text-slate-500 font-bold text-[11px]">{t('movementTrackerSecureNotice')}</Text>
          </View>
        </View>

        
        {/* Searched Shipment Result */}
        {searchedShipment && (
          <View className="mb-6">
            <Text className="text-brand-navy font-black text-xl mb-4 px-1">{t('movementTrackerTrackedShipmentTitle')}</Text>
            <View className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm flex-row items-center mb-3">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${searchedShipment.status === 'EN_ROUTE' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                <Feather name={searchedShipment.status === 'EN_ROUTE' ? 'truck' : 'check'} size={18} color={searchedShipment.status === 'EN_ROUTE' ? '#3B82F6' : '#10B981'} />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-extrabold text-[15px] mb-0.5">{searchedShipment.id}: {searchedShipment.medicineName}</Text>
                <Text className="text-slate-500 font-semibold text-[12px]" numberOfLines={1}>
                  {searchedShipment.sourceFacilityId.replace('phc_', '').replace('chc_', '')} <Feather name="arrow-right" size={10} /> {searchedShipment.targetFacilityId.replace('phc_', '').replace('chc_', '')} ({searchedShipment.quantity} units)
                </Text>
              </View>
              <View className={`px-2 py-1 rounded-md ${searchedShipment.status === 'EN_ROUTE' ? 'bg-blue-50 border border-blue-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                <Text className={`font-bold text-[11px] ${searchedShipment.status === 'EN_ROUTE' ? 'text-blue-600' : 'text-emerald-600'}`}>
                  {searchedShipment.status === 'EN_ROUTE' ? t('movementTrackerInTransit') : t('movementTrackerDelivered')}
                </Text>
              </View>
            </View>
          </View>
        )}

{/* Recent Shipments */}
        <View className="mb-6">
          <Text className="text-brand-navy font-black text-xl mb-4 px-1">{t('movementTrackerRecentShipmentsTitle')}</Text>
          
          {loading ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-slate-400 font-semibold text-[12px] mt-2">{t('movementTrackerLoadingShipments')}</Text>
            </View>
          ) : recentShipments.length > 0 ? (
            <View className="space-y-3">
              {recentShipments.map((shipment) => (
                <View key={shipment.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex-row items-center mb-3">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${shipment.status === 'EN_ROUTE' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    <Feather name={shipment.status === 'EN_ROUTE' ? 'truck' : 'clock'} size={18} color={shipment.status === 'EN_ROUTE' ? '#3B82F6' : '#F97316'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-brand-navy font-extrabold text-[15px] mb-0.5">{shipment.id}: {shipment.medicineName}</Text>
                    <Text className="text-slate-500 font-semibold text-[12px]" numberOfLines={1}>
                      {shipment.sourceFacilityId.replace('phc_', '').replace('chc_', '')} <Feather name="arrow-right" size={10} /> {shipment.targetFacilityId.replace('phc_', '').replace('chc_', '')} ({shipment.quantity} units)
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-md ${shipment.status === 'EN_ROUTE' ? 'bg-blue-50 border border-blue-100' : 'bg-orange-50 border border-orange-100'}`}>
                    <Text className={`font-bold text-[11px] ${shipment.status === 'EN_ROUTE' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {shipment.status === 'EN_ROUTE' ? t('movementTrackerInTransit') : t('movementTrackerPending')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-slate-50 border border-slate-100 rounded-3xl p-8 items-center justify-center shadow-sm">
              <View className="w-12 h-12 rounded-full bg-white border border-slate-200 items-center justify-center mb-4 shadow-sm shadow-black/5">
                <Feather name="package" size={20} color="#CBD5E1" />
              </View>
              <Text className="text-slate-500 font-bold text-[14px] mb-1">{t('movementTrackerNoShipments')}</Text>
              <Text className="text-slate-400 font-semibold text-[12px]">{t('movementTrackerEnterIdPrompt')}</Text>
            </View>
          )}
        </View>

      {/* How It Works Section */}
        <View className="mb-8">
          <Text className="text-brand-navy font-black text-xl mb-5 px-1">{t('movementTrackerHowItWorksTitle')}</Text>
          <View className="flex-row justify-between items-start">
            
            {/* Step 1 */}
            <View className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-purple-50 items-center justify-center border border-purple-100 mb-3 shadow-sm">
                <Feather name="box" size={20} color="#A855F7" />
              </View>
              <Text className="text-brand-navy font-black text-[12px] text-center mb-1">{t('movementTrackerStep1Title')}</Text>
              <Text className="text-slate-500 text-[11px] font-semibold text-center leading-3 px-1">{t('movementTrackerStep1Desc')}</Text>
            </View>
            <Feather name="chevron-right" size={12} color="#CBD5E1" className="mt-5" />

            {/* Step 2 */}
            <View className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center border border-blue-100 mb-3 shadow-sm">
                <Feather name="file-text" size={20} color="#3B82F6" />
                <View className="absolute bottom-3 right-3 bg-white rounded-full">
                  <Feather name="search" size={10} color="#3B82F6" />
                </View>
              </View>
              <Text className="text-brand-navy font-black text-[12px] text-center mb-1">{t('movementTrackerStep2Title')}</Text>
              <Text className="text-slate-500 text-[11px] font-semibold text-center leading-3 px-1">{t('movementTrackerStep2Desc')}</Text>
            </View>
            <Feather name="chevron-right" size={12} color="#CBD5E1" className="mt-5" />

            {/* Step 3 */}
            <View className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-emerald-50 items-center justify-center border border-emerald-100 mb-3 shadow-sm">
                <Feather name="truck" size={20} color="#10B981" />
                <View className="absolute -top-1 -right-1">
                  <Feather name="map-pin" size={12} color="#10B981" />
                </View>
              </View>
              <Text className="text-brand-navy font-black text-[12px] text-center mb-1">{t('movementTrackerStep3Title')}</Text>
              <Text className="text-slate-500 text-[11px] font-semibold text-center leading-3 px-1">{t('movementTrackerStep3Desc')}</Text>
            </View>
            <Feather name="chevron-right" size={12} color="#CBD5E1" className="mt-5" />

            {/* Step 4 */}
            <View className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-orange-50 items-center justify-center border border-orange-100 mb-3 shadow-sm">
                <Feather name="package" size={20} color="#F97316" />
                <View className="absolute bottom-3 right-3 bg-white rounded-full">
                  <Feather name="check-circle" size={10} color="#F97316" />
                </View>
              </View>
              <Text className="text-brand-navy font-black text-[12px] text-center mb-1">{t('movementTrackerStep4Title')}</Text>
              <Text className="text-slate-500 text-[11px] font-semibold text-center leading-3 px-1">{t('movementTrackerStep4Desc')}</Text>
            </View>

          </View>
        </View>

        {/* What You Can Track Section */}
        <View className="mb-8">
          <Text className="text-brand-navy font-black text-xl mb-4 px-1">{t('movementTrackerWhatYouCanTrackTitle')}</Text>
          <View className="flex-row flex-wrap justify-between">
            
            <View className="w-[48%] bg-purple-50/50 border border-purple-100 rounded-2xl p-3 flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-2">
                <Feather name="box" size={16} color="#9333EA" />
              </View>
              <View className="flex-1">
                <Text className="text-purple-800 font-extrabold text-[12px] mb-0.5">{t('movementTrackerMedicalSupplies')}</Text>
                <Text className="text-purple-600/70 font-bold text-[10px] leading-3">{t('movementTrackerMedicalSuppliesDesc')}</Text>
              </View>
            </View>

            <View className="w-[48%] bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-2">
                <Feather name="map" size={16} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-700 font-extrabold text-[12px] mb-0.5">{t('movementTrackerLiveLocation')}</Text>
                <Text className="text-blue-600/70 font-bold text-[10px] leading-3">{t('movementTrackerLiveLocationDesc')}</Text>
              </View>
            </View>

            <View className="w-[48%] bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-emerald-100 items-center justify-center mr-2">
                <Feather name="clock" size={16} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-700 font-extrabold text-[12px] mb-0.5">{t('movementTrackerEtaUpdates')}</Text>
                <Text className="text-emerald-600/70 font-bold text-[10px] leading-3">{t('movementTrackerEtaUpdatesDesc')}</Text>
              </View>
            </View>

            <View className="w-[48%] bg-orange-50/50 border border-orange-100 rounded-2xl p-3 flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center mr-2">
                <Feather name="bell" size={16} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="text-orange-700 font-extrabold text-[12px] mb-0.5">{t('movementTrackerStatusAlerts')}</Text>
                <Text className="text-orange-600/70 font-bold text-[10px] leading-3">{t('movementTrackerStatusAlertsDesc')}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Promo Banner */}
        <View className="bg-blue-50/60 border border-blue-100 rounded-[28px] p-5 flex-row items-center overflow-hidden relative shadow-sm mb-8">
          <View className="flex-1 pr-14 z-10">
            <Text className="text-brand-navy font-black text-lg mb-3 tracking-tight">{t('movementTrackerPromoTitle')}</Text>
            <Text className="text-slate-500 font-semibold text-[12px] leading-4 mb-4">
              {t('movementTrackerPromoDesc')}
            </Text>
            
            <View className="border border-blue-200 rounded-full px-3 py-1.5 flex-row items-center self-start">
              <Feather name="info" size={10} color="#3B82F6" className="mr-1.5" />
              <Text className="text-blue-600 font-bold text-[12px]">{t('movementTrackerLearnMore')}</Text>
            </View>
          </View>

          {/* Large Clipboard Illustration */}
          <View className="absolute right-0 bottom-0 w-32 h-40 items-end justify-end">
            <View className="w-24 h-32 bg-blue-400 rounded-t-xl rounded-bl-xl border-t-2 border-l-2 border-white mr-4 shadow-lg p-2 relative">
               <View className="w-full h-full bg-white rounded-lg flex items-center p-2">
                  <View className="w-12 h-2 bg-slate-200 rounded-full absolute -top-1" />
                  
                  {/* Map path on clipboard */}
                  <View className="flex-1 w-full mt-2 relative items-center">
                    <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                    <View className="w-full h-8 border-r-2 border-dashed border-blue-200 rounded-tr-lg" />
                    <View className="w-full h-8 border-l-2 border-dashed border-blue-200 rounded-bl-lg" />
                    <View className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1" />
                  </View>
               </View>

               {/* Purple Map Pin */}
               <View className="absolute top-10 -right-2 items-center z-10 shadow-sm shadow-black/10">
                 <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center border-2 border-white" style={{ borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 16, borderTopRightRadius: 2 }}>
                   <View className="w-2.5 h-2.5 rounded-full bg-white" />
                 </View>
                 <View className="w-1 h-3 bg-purple-500" />
               </View>
            </View>

            {/* Overlapping Truck */}
            <View className="absolute bottom-2 -left-4 w-20 h-10 bg-blue-600 rounded-lg flex-row items-end pb-1 px-1.5 border-2 border-white shadow-md z-20">
               <View className="w-4 h-4 bg-slate-800 rounded-full absolute -bottom-2 left-2 border-2 border-white shadow-sm" />
               <View className="w-4 h-4 bg-slate-800 rounded-full absolute -bottom-2 right-2 border-2 border-white shadow-sm" />
               <View className="w-3 h-3 bg-blue-300 rounded-sm absolute top-1.5 right-1.5 border border-blue-500" />
            </View>

            {/* Decorative Leaves/Plants */}
            <View className="absolute bottom-0 -left-6 opacity-60">
              <Feather name="feather" size={24} color="#60A5FA" />
            </View>
            <View className="absolute bottom-8 right-0 opacity-60 transform rotate-45">
              <Feather name="feather" size={20} color="#60A5FA" />
            </View>
          </View>
        </View>

        </ScrollView>
    </ScreenContainer>
  );
}
