import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { alertEventBus } from '@/utils/eventBus';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { notificationsRepository } from '@/services/repositories/notificationsRepository';

interface AlertEventData {
  type: string;
  facilityId: string;
  title: string;
  message: string;
  notificationId?: string;
}

export function GlobalAlertModal() {
  const [activeAlert, setActiveAlert] = useState<AlertEventData | null>(null);
  const { authState } = useAuth();
  const router = useRouter();
  const { t, language } = useTranslation();

  useEffect(() => {
    // Only BMOs should see this global pop-up
    if (authState?.role !== 'BMO') return;

    const unsubscribeBus = alertEventBus.subscribe((data: any) => {
      if (data && data.type === 'CRITICAL_ALERT') {
        setActiveAlert(data as AlertEventData);
      }
    });

    // Also subscribe to the database notifications in case they log in after the event
    const unsubscribeDb = notificationsRepository.subscribeNotifications({ role: 'BMO' }, (notifications) => {
      // Find the first unread critical alert
      const unreadAlert = notifications.find(n => n.type === 'alert' && n.isNew && n.targetRole === 'BMO');
      if (unreadAlert && !activeAlert) {
        setActiveAlert({
          type: 'CRITICAL_ALERT',
          facilityId: unreadAlert.targetFacilityId || 'phc_barola',
          title: unreadAlert.title,
          message: unreadAlert.message,
          notificationId: unreadAlert.id
        });
      }
    });

    return () => {
      unsubscribeBus();
      unsubscribeDb();
    };
  }, [authState]);

  if (!activeAlert) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!activeAlert}
      onRequestClose={() => setActiveAlert(null)}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-4">
        <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border-2 border-red-500">
          
          {/* Header */}
          <View className="bg-red-500 py-4 px-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                <Feather name="alert-triangle" size={18} color="white" />
              </View>
              <Text className="text-white font-extrabold text-lg">{language === 'hi' ? 'महत्वपूर्ण अलर्ट' : 'Critical Alert'}</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveAlert(null)} className="p-1">
              <Feather name="x" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="p-6 items-center">
            <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
              <MaterialCommunityIcons name="bell-ring" size={32} color="#EF4444" />
            </View>
            <Text className="text-slate-900 font-black text-xl text-center mb-2 leading-tight">
              {activeAlert.title}
            </Text>
            <Text className="text-slate-600 font-medium text-center text-[13px] leading-5 mb-6">
              {activeAlert.message}
            </Text>
            
            <TouchableOpacity
              onPress={async () => {
                const fid = activeAlert.facilityId;
                if (activeAlert.notificationId) {
                  // Mark as read so it doesn't pop up again
                  await notificationsRepository.markAsRead(activeAlert.notificationId);
                }
                setActiveAlert(null);
                router.push({ pathname: '/(tabs)/phc-detail', params: { id: fid } });
              }}
              className="w-full bg-red-600 py-3.5 rounded-2xl items-center justify-center shadow-sm shadow-red-600/30 flex-row"
            >
              <Text className="text-white font-bold text-sm mr-2">{language === 'hi' ? 'अभी जांचें' : 'Check Now'}</Text>
              <Feather name="arrow-right" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
