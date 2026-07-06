import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { Dropdown } from '@/components/ui/inputs/Dropdown';
import { useTranslation } from '@/hooks/useTranslation';
import { phcRepository } from '@/services/repositories/phcRepository';
import { transfersRepository } from '@/services/repositories/transfersRepository';
import { PHC } from '@/shared/types/phc';
import { MedicineStock } from '@/shared/types/medicine';
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Notifications unavailable in this runtime', e);
  Notifications = null;
}

export default function ResourceRedistributionScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { source, target, medicine, amount } = useLocalSearchParams();
  
  const [sourceId, setSourceId] = useState<string>((source as string) || '');
  const [targetId, setTargetId] = useState<string>((target as string) || '');
  const [medicineId, setMedicineId] = useState<string>((medicine as string) || '');
  const [qty, setQty] = useState((amount as string) || '50');
  const [submitting, setSubmitting] = useState(false);
  
  const [allPhcs, setAllPhcs] = useState<PHC[]>([]);
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);

  useEffect(() => {
    const unsubscribe = phcRepository.subscribePHCs(undefined, (data) => {
      setAllPhcs(data);
      if (!sourceId && data.length > 0) setSourceId(data[0].id);
      if (!targetId && data.length > 1) setTargetId(data[1].id);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (sourceId) {
      const unsubscribe = phcRepository.subscribeInventory(sourceId, (data) => {
        setMedicines(data);
        if (!medicineId && data.length > 0) setMedicineId(data[0].id);
      });
      return unsubscribe;
    }
  }, [sourceId]);

  // Dynamic values
  const sourcePhc = allPhcs.find(p => p.id === sourceId);
  const targetPhc = allPhcs.find(p => p.id === targetId);
  const medicineObj = medicines.find(m => m.id === medicineId);
  
  const sourceName = sourcePhc ? (language === 'hi' && sourcePhc.nameHi ? sourcePhc.nameHi : sourcePhc.name) : t('redistributionDefaultSource');
  const targetName = targetPhc ? (language === 'hi' && targetPhc.nameHi ? targetPhc.nameHi : targetPhc.name) : t('redistributionDefaultTarget');
  const medicineName = medicineObj ? (language === 'hi' && medicineObj.nameHi ? medicineObj.nameHi : medicineObj.name) : t('redistributionDefaultMedicine');
  const availableStock = medicineObj?.currentStock || 0;

  const { authState } = useAuth();
  
  const currentBlock = authState?.role === 'BMO' 
    ? (allPhcs.find(p => p.id === authState.facilityId)?.block)
    : null;

  const allowedPHCs = currentBlock 
    ? allPhcs.filter(p => p.block === currentBlock)
    : allPhcs;

  const phcOptions = allowedPHCs.map(p => ({ label: language === 'hi' && p.nameHi ? p.nameHi : p.name, value: p.id }));
  const medicineOptions = medicines.map(m => ({ label: language === 'hi' && m.nameHi ? m.nameHi : m.name, value: m.id }));

  const handleSubmit = async () => {
    if (!sourcePhc || !targetPhc || !medicineObj) {
      Alert.alert(t('redistributionAlertErrorTitle'), t('redistributionAlertMissingDetails'));
      return;
    }
    setSubmitting(true);
    try {
      await transfersRepository.transferMedicine(
        sourcePhc.id,
        targetPhc.id,
        medicineObj.id,
        parseInt(qty, 10) || 0
      );
      
      // Fire local notification (best-effort — unavailable on Android in Expo Go SDK 53+)
      try {
        await Notifications?.scheduleNotificationAsync({
          content: {
            title: t('redistributionNotificationTitle'),
            body: t('redistributionNotificationBody')
              .replace('{qty}', qty)
              .replace('{medicineName}', medicineName)
              .replace('{targetName}', targetName),
            sound: 'default',
          },
          trigger: null,
        });
      } catch (notifError) {
        console.warn('Failed to schedule notification', notifError);
      }

      Alert.alert(t('redistributionAlertSuccessTitle'), t('redistributionAlertSuccessMsg'));
      if (router.canGoBack()) { router.back(); } else { router.push('/'); }
    } catch (e: any) {
      Alert.alert(t('redistributionAlertErrorTitle'), `${t('redistributionAlertErrorPrefix')} ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6 px-1">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => { if (router.canGoBack()) { if (router.canGoBack()) { router.back(); } else { router.push('/'); } } else { router.push('/'); } }}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#0F172A" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight">{t('redistributionHeaderTitle')}</Text>
            <Text className="text-slate-500 text-[11px] font-semibold mt-0.5">{t('redistributionHeaderSubtitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Promo Banner */}
        <View className="bg-blue-50/80 border border-blue-100 rounded-[28px] p-5 mb-6 flex-row items-center justify-between overflow-hidden relative shadow-sm">
          <View className="flex-1 pr-6 z-10">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 rounded-full bg-white shadow-sm border border-blue-100 items-center justify-center mr-3">
                <Feather name="package" size={20} color="#3B82F6" />
              </View>
              <Text className="text-blue-600 font-black text-[20px] tracking-tight">{t('redistributionPromoTitle')}</Text>
            </View>
            <Text className="text-slate-500 text-[10px] font-semibold leading-4">
              {t('redistributionPromoDesc')}
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
        <View className="bg-white border-2 border-blue-200 shadow-sm shadow-blue-500/10 p-6 rounded-[32px] mb-6">
          <View className="flex-row items-center mb-6 pb-4 border-b border-slate-100">
            <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mr-3 border border-indigo-100 shadow-sm shadow-indigo-500/10">
              <Feather name="package" size={16} color="#4F46E5" />
            </View>
            <Text className="text-brand-navy text-[16px] font-black tracking-tight">{t('redistributionFormTitle')}</Text>
          </View>
          
          <View>
            
            {/* 1. Source Facility */}
            <View className="mb-6">
              <Dropdown
                icon="home"
                label={t('redistributionSourceLabel')}
                selectedValue={sourceId}
                onValueChange={setSourceId}
                options={phcOptions}
              />
              <View className="flex-row items-center ml-1 mt-1">
                <Feather name="check-circle" size={10} color="#10B981" className="mr-1.5" />
                <Text className="text-emerald-600 font-bold text-[9px]">{t('redistributionSourceSelectedNote')}</Text>
              </View>
            </View>

            {/* 2. Target Facility */}
            <View className="mb-6 mt-1">
              <Dropdown
                icon="target"
                label={t('redistributionTargetLabel')}
                selectedValue={targetId}
                onValueChange={setTargetId}
                options={phcOptions}
              />
              <View className="flex-row items-center ml-1 mt-1">
                <Feather name="alert-triangle" size={10} color="#F97316" className="mr-1.5" />
                <Text className="text-orange-500 font-bold text-[9px]">{t('redistributionTargetReadyNote')}</Text>
              </View>
            </View>

            {/* 3. Requested Medicine */}
            <View className="mb-6 mt-1">
              <Dropdown
                icon="box"
                label={t('redistributionMedicineLabel')}
                selectedValue={medicineId}
                onValueChange={setMedicineId}
                options={medicineOptions}
              />
              <View className="flex-row items-center ml-1 mt-1">
                <Feather name="info" size={10} color="#3B82F6" className="mr-1.5" />
                <Text className="text-blue-500 font-bold text-[9px]">{t('redistributionAvailableStockNote').replace('{availableStock}', String(availableStock))}</Text>
              </View>
            </View>

            {/* 4. Quantity */}
            <View className="mb-8">
              <Text className="text-brand-navy font-extrabold text-[13px] mb-2 uppercase tracking-wide">{t('redistributionQuantityLabel')}</Text>
              <View className="bg-white border-2 border-blue-200 rounded-2xl h-14 px-4 shadow-sm shadow-blue-500/10 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                   <View className="w-8 h-8 rounded-xl bg-white shadow-sm shadow-black/5 items-center justify-center mr-3 border border-slate-100">
                     <Feather name="layers" size={14} color="#3B82F6" />
                   </View>
                   <TextInput 
                     value={qty}
                     onChangeText={setQty}
                     keyboardType="numeric"
                     className="flex-1 font-bold text-[15px] text-brand-navy py-1"
                     placeholder={t('redistributionQuantityPlaceholder')}
                     placeholderTextColor="#94A3B8"
                   />
                </View>
                <View className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                  <Text className="text-blue-600 font-bold text-[11px]">{t('redistributionUnitsBadge')}</Text>
                </View>
              </View>
            </View>
            
            {/* Summary Banner */}
            <View className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex-row items-center">
              <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mr-2">
                <Feather name="info" size={10} color="#3B82F6" />
              </View>
              <Text className="text-blue-700 font-semibold text-[9px] flex-1">
                {t('redistributionSummaryPrefix')} <Text className="font-black">{qty || '0'} {t('redistributionSummaryUnitsSuffix')}</Text> {t('reportsOccupiedOfTotalJoiner')} <Text className="font-black">{medicineName}</Text> {t('redistributionSummaryFrom')} <Text className="font-black">{sourceName}</Text> {t('redistributionSummaryTo')} <Text className="font-black">{targetName}</Text>.
              </Text>
            </View>

            {/* Action Button */}
            <Pressable 
              onPress={handleSubmit}
              className="w-full rounded-2xl py-4 flex-row justify-center items-center bg-blue-600 shadow-md shadow-blue-500/30"
              style={{ elevation: 3 }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#FFF" className="mr-2" />
                  <Text className="text-white font-extrabold text-[14px]">{t('redistributionSubmitButton')}</Text>
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
              <Text className="text-emerald-700 font-black text-[13px] mb-0.5">{t('redistributionFooterTitle')}</Text>
              <Text className="text-emerald-600/80 font-bold text-[9px] leading-3">{t('redistributionFooterDesc')}</Text>
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
