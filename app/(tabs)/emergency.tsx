import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { addLocalNotification } from '@/services/repositories/localDb';
import { AlertItem } from '@/shared/types/alert';

export default function EmergencyScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { alerts } = useDashboard();
  
  const [escalated, setEscalated] = useState(false);

  // Filter for critical/high unresolved alerts for current PHC
  const criticalAlerts = alerts.filter(
    (a: AlertItem) => a.facilityId === authState?.facilityId && !a.resolved && (a.priority === 'CRITICAL' || a.priority === 'HIGH')
  );

  const handleEscalate = (value: boolean) => {
    setEscalated(value);
    if (value) {
      // Dispatch notification to BMO
      addLocalNotification({
        id: `n_esc_${Date.now()}`,
        title: 'Emergency Escalation from PHC',
        message: `${authState?.name || 'PHC Staff'} escalated an emergency from ${authState?.facilityId}. Immediate attention required.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'alert',
        category: 'Epidemic Alert',
        isNew: true,
      });
      alert('Emergency escalated to Block Medical Officer successfully.');
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6 px-1">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm shadow-black/5 items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#000" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">Emergency Protocol</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">Active Crisis Management</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Promo Banner (Red/Orange Theme) */}
        <View className="bg-red-50/80 border border-red-100 rounded-3xl p-5 mb-6 flex-row items-center justify-between overflow-hidden relative">
          <View className="flex-1 pr-4 z-10">
            <Text className="text-red-900 font-black text-[15px] mb-2 leading-tight">CRITICAL ALERT{'\n'}MODE ACTIVE.</Text>
            <Text className="text-red-700/80 text-[9px] font-semibold leading-4 mb-4">You are viewing highest-priority incidents requiring immediate mitigation or escalation.</Text>
            
            <View className="bg-white border border-red-100 rounded-full px-2.5 py-1.5 flex-row items-center self-start">
              <Feather name="alert-triangle" size={10} color="#EF4444" className="mr-1" />
              <Text className="text-red-600 font-bold text-[8px] uppercase tracking-wider">Priority Attention</Text>
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
        <View className="bg-white border border-slate-100 shadow-sm p-5 rounded-3xl mb-6 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-1">
              <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-2">
                <Feather name="radio" size={12} color="#F97316" />
              </View>
              <Text className="text-brand-navy font-black text-[15px]">Escalate to BMO</Text>
            </View>
            <Text className="text-slate-500 text-[10px] font-semibold leading-relaxed">
              Notify the Block Medical Officer immediately. This bypasses normal reporting intervals. (DHO will not be directly pinged).
            </Text>
          </View>
          <Switch
            value={escalated}
            onValueChange={handleEscalate}
            trackColor={{ false: '#E2E8F0', true: '#EF4444' }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor="#E2E8F0"
          />
        </View>

        {/* Critical Alerts List */}
        <Text className="text-brand-navy font-extrabold text-[15px] mb-4 ml-1">Current Critical Incidents</Text>
        
        {criticalAlerts.length > 0 ? (
          criticalAlerts.map((alert: AlertItem) => (
            <View key={alert.id} className="bg-white border border-red-100 shadow-sm p-4 rounded-2xl mb-4 relative overflow-hidden">
              <View className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-4 -mt-4" />
              
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                  <Text className="text-red-700 font-extrabold text-[9px] uppercase">{alert.type}</Text>
                </View>
                <Text className="text-slate-400 font-bold text-[10px]">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <Text className="text-brand-navy font-black text-sm mb-1.5 pr-6">{alert.title}</Text>
              <Text className="text-slate-600 font-medium text-[11px] leading-4">{alert.description}</Text>
            </View>
          ))
        ) : (
          <View className="bg-slate-50 border border-slate-100 p-8 rounded-3xl items-center justify-center">
            <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center mb-3">
              <Feather name="check" size={20} color="#94A3B8" />
            </View>
            <Text className="text-brand-navy font-bold text-center">No critical incidents</Text>
            <Text className="text-slate-500 text-[11px] text-center mt-1">All active alerts are medium/low priority.</Text>
          </View>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}
