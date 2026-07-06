import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useTranslation } from '@/hooks/useTranslation';
import { notificationsRepository } from '@/services/repositories/notificationsRepository';
import { phcRepository } from '@/services/repositories/phcRepository';
import { AlertItem } from '@/shared/types/alert';
import { alertEventBus } from '@/utils/eventBus';
import { Toggle } from '../../components/ui/inputs/Toggle';

export default function EmergencyScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { alerts } = useDashboard();
  const { t, language } = useTranslation();

  const [escalated, setEscalated] = useState(false);

  // Filter for critical/high unresolved alerts for current PHC
  const criticalAlerts = alerts.filter(
    (a: AlertItem) => a.facilityId === authState?.facilityId && !a.resolved && (a.priority === 'CRITICAL' || a.priority === 'HIGH')
  );

  const handleEscalate = async (value: boolean) => {
    setEscalated(value);
    if (value) {
      try {
        // Route to the BMO overseeing this PHC's block, and flag DHO/Admin as well.
        const phc = authState?.facilityId ? await phcRepository.getPHC(authState.facilityId) : null;
        await notificationsRepository.createNotification({
          title: t('emergencyEscalationNotifTitle'),
          message: `${authState?.name || t('emergencyStaffFallbackName')} ${t('emergencyEscalationNotifMessage')} ${authState?.facilityId}. ${t('emergencyEscalationNotifRequiresAttention')}`,
          type: 'alert',
          category: t('emergencyEscalationNotifCategory'),
          isNew: true,
          targetRole: 'BMO',
          targetFacilityId: phc?.block,
        });

        // Emit real-time pop-up event across tabs
        alertEventBus.emit({
          type: 'CRITICAL_ALERT',
          facilityId: authState?.facilityId || 'phc_barola',
          title: language === 'hi' ? 'पीएचसी द्वारा आपातकालीन एस्केलेशन' : 'Emergency Escalation by PHC',
          message: `${authState?.name || 'Staff'} ${language === 'hi' ? 'ने तत्काल ध्यान देने के लिए एक अलर्ट बढ़ाया है।' : 'has escalated an alert for immediate attention.'}`
        });

      } catch (err) {
        console.error('Failed to dispatch escalation notification', err);
      }
      Alert.alert(t('emergencyEscalateAlertTitle'), t('emergencyEscalateAlertMessage'));
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6 px-1">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => { if (router.canGoBack()) { if (router.canGoBack()) { router.back(); } else { router.push('/'); } } else { router.push('/'); } }}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm shadow-black/5 items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#000" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">{t('emergencyHeaderTitle')}</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">{t('emergencyHeaderSubtitle')}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Promo Banner (Red/Orange Theme) */}
        <View className="bg-red-50/80 border-2 border-red-200 rounded-3xl p-5 mb-6 flex-row items-center justify-between overflow-hidden relative">
          <View className="flex-1 pr-4 z-10">
            <Text className="text-red-900 font-black text-[15px] mb-2 leading-tight">{t('emergencyBannerTitle')}</Text>
            <Text className="text-red-700/80 text-[9px] font-semibold leading-4 mb-4">{t('emergencyBannerDesc')}</Text>
            
            <View className="bg-white border-2 border-red-200 rounded-full px-2.5 py-1.5 flex-row items-center self-start">
              <Feather name="alert-triangle" size={10} color="#EF4444" className="mr-1" />
              <Text className="text-red-600 font-bold text-[8px] uppercase tracking-wider">{t('emergencyPriorityBadge')}</Text>
            </View>
          </View>
          
          {/* Shield Illustration */}
          <View className="w-28 h-24 bg-red-100/50 rounded-xl justify-center items-center relative z-10 border-2 border-white shadow-sm mr-2">
            <View className="w-24 h-16 bg-red-400 rounded-lg overflow-hidden border border-red-300 relative items-center justify-center">
               <MaterialCommunityIcons name="alert-decagram" size={36} color="#FFF" />
            </View>
            <View className="w-8 h-2 bg-red-300" />
            <View className="w-16 h-1 bg-red-300 rounded-full" />

            {/* Overlapping Badge */}
            <View className="absolute -left-3 -bottom-2 w-14 h-16 bg-red-500 rounded-xl items-center justify-center shadow-lg border-2 border-white" style={{ borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
               <Feather name="shield" size={24} color="#FFF" />
            </View>
          </View>
        </View>

        {/* Escalation Toggle */}
        <View className="bg-yellow-50/50 border-2 border-yellow-300 shadow-sm p-5 rounded-3xl mb-6 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1">
              <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-2">
                <Feather name="radio" size={12} color="#F97316" />
              </View>
              <Text className="text-brand-navy font-black text-[15px]">{t('emergencyEscalateTitle')}</Text>
            </View>
            <Text className="text-slate-500 text-[10px] font-semibold leading-relaxed">
              {t('emergencyEscalateDesc')}
            </Text>
          </View>
          <Toggle value={escalated} onValueChange={handleEscalate} />
        </View>

        {/* Critical Alerts List */}
        <Text className="text-brand-navy font-extrabold text-[15px] mb-4 ml-1">{t('emergencyCurrentIncidentsTitle')}</Text>
        
        {criticalAlerts.length > 0 ? (
          criticalAlerts.map((alert: AlertItem) => (
            <View key={alert.id} className="bg-white border-2 border-red-200 shadow-sm p-4 rounded-2xl mb-4 relative overflow-hidden">
              <View className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-4 -mt-4" />
              
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                  <Text className="text-red-700 font-extrabold text-[9px] uppercase">{alert.type === 'OUTBREAK' ? t('phcsMetricOutbreakLabel') : alert.type === 'SHORTAGE' ? t('phcsMetricShortageLabel') : alert.type}</Text>
                </View>
                <Text className="text-slate-400 font-bold text-[10px]">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
                <Text className="text-brand-navy font-black text-sm mb-1.5 pr-6">{language === 'hi' && alert.titleHi ? alert.titleHi : alert.title}</Text>
              <Text className="text-slate-600 font-medium text-[11px] leading-4">{language === 'hi' && alert.descriptionHi ? alert.descriptionHi : alert.description}</Text>
            </View>
          ))
        ) : (
          <View className="bg-slate-50 border-2 border-slate-200 p-8 rounded-3xl items-center justify-center">
            <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center mb-3">
              <Feather name="check" size={20} color="#94A3B8" />
            </View>
            <Text className="text-brand-navy font-bold text-center">{t('emergencyNoCriticalTitle')}</Text>
            <Text className="text-slate-500 text-[11px] text-center mt-1">{t('emergencyNoCriticalDesc')}</Text>
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}
