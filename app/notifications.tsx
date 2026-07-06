import React, { useState } from 'react';
import { View, FlatList, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import NotificationCard from '@/components/ui/cards/NotificationCard';
import EmptyState from '@/components/ui/feedback/EmptyState';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from '@/hooks/useTranslation';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { notifications, loading, markAllAsRead, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState('all');

  // Fallback bilingual lookup for known demo/dummy notification bodies sourced from
  // localDb (arbitrary Firestore-authored notifications have no app-controlled key,
  // so this only covers strings the app itself seeds).
  const translateDynamic = (text: string) => {
    if (language !== 'hi' || !text) return text;

    const map: Record<string, string> = {
      'Transfer Dispatched': 'ट्रांसफर भेजा गया',
      'Redistribution Approved': 'पुनर्वितरण स्वीकृत',
      'New Epidemic Alert': 'नया महामारी अलर्ट',
      'Monthly Summary Ready': 'मासिक सारांश तैयार',
      'Dengue Surge Warning triggered for PHC Badalpur.': 'पीएचसी बादलपुर के लिए डेंगू वृद्धि चेतावनी जारी की गई है।',
      'The AI-generated health briefing for Gautam Budh Nagar is now available.': 'गौतम बुद्ध नगर के लिए AI-जनित स्वास्थ्य ब्रीफिंग अब उपलब्ध है।',
      'Low Stock Alert': 'लो स्टॉक अलर्ट',
      '8 medicines are running low in stock across 3 PHCs.': '3 पीएचसी में 8 दवाओं का स्टॉक कम हो रहा है।',
      'System Update Completed': 'सिस्टम अपडेट पूरा हुआ',
      'System maintenance completed successfully at 10:00 AM.': 'सिस्टम मेंटेनेंस सुबह 10:00 बजे सफलतापूर्वक पूरा हुआ।'
    };

    if (map[text]) return map[text];

    let result = text;
    result = result.replace(/Transfer of /g, 'का ट्रांसफर ');
    result = result.replace(/ units of /g, ' यूनिट ');
    result = result.replace(/ has been initialized\./g, ' शुरू कर दिया गया है।');
    result = result.replace(/approved transfer of /g, 'ने ट्रांसफर को मंजूरी दी ');
    result = result.replace(/ to /g, ' को ');
    result = result.replace(/Dengue Kits/g, 'डेंगू किट्स');
    return result;
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const allCount = notifications.length;
  const alertCount = notifications.filter(n => n.type === 'alert').length;
  const updateCount = notifications.filter(n => n.type === 'update').length;
  const reportCount = notifications.filter(n => n.type === 'report').length;

  const filters = [
    { id: 'all', label: t('notificationsFilterAll'), icon: 'inbox', badge: allCount, bgClass: 'bg-blue-50', iconColor: '#3B82F6', badgeBg: 'bg-blue-600' },
    { id: 'alert', label: t('notificationsFilterAlerts'), icon: 'alert-triangle', badge: alertCount, bgClass: 'bg-red-50', iconColor: '#EF4444', badgeBg: 'bg-red-500' },
    { id: 'update', label: t('notificationsFilterUpdates'), icon: 'volume-2', badge: updateCount, bgClass: 'bg-emerald-50', iconColor: '#10B981', badgeBg: 'bg-emerald-500' },
    { id: 'report', label: t('notificationsFilterReports'), icon: 'file-text', badge: reportCount, bgClass: 'bg-purple-50', iconColor: '#8B5CF6', badgeBg: 'bg-purple-500' },
  ];

  return (
    <ScreenContainer>
      
      {/* Custom Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                if (router.canGoBack()) { router.back(); } else { router.push('/'); }
              } else {
                router.replace('/');
              }
            }}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm shadow-black/5 items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#000" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">{t('notificationsHeaderTitle')}</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">{t('notificationsHeaderSubtitle')}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mb-6">
        {/* Mark All Read */}
        <Pressable 
          onPress={handleMarkAllRead}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          className="flex-1 bg-blue-600 rounded-[20px] p-3.5 flex-row items-center shadow-md shadow-blue-600/30 mr-2 border border-blue-500"
        >
          <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 shadow-sm shadow-black/10">
            <Feather name="check" size={16} color="#2563EB" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-extrabold text-[13px] mb-0.5">{t('notificationsMarkAllReadTitle')}</Text>
            <Text className="text-blue-100 text-[8px] font-bold">{t('notificationsMarkAllReadDesc')}</Text>
          </View>
        </Pressable>

        {/* Clear All */}
        <Pressable 
          onPress={handleClearAll}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          className="flex-1 bg-white border border-red-200 rounded-[20px] p-3.5 flex-row items-center shadow-sm shadow-black/5 ml-1"
        >
          <View className="w-8 h-8 rounded-full bg-red-50 border border-red-100 items-center justify-center mr-3">
            <Feather name="trash-2" size={14} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="text-red-600 font-extrabold text-[13px] mb-0.5">{t('notificationsClearAllTitle')}</Text>
            <Text className="text-slate-500 text-[8px] font-bold">{t('notificationsClearAllDesc')}</Text>
          </View>
        </Pressable>
      </View>



      {/* Notification List (Standard map instead of FlatList to prevent freeze) */}
      <View className="flex-1 pb-10">
        {loading ? (
          <View>
            {[1, 2, 3].map((i) => (
              <View key={i} className="mb-3">
                <Skeleton className="h-20 w-full rounded-2xl" />
              </View>
            ))}
          </View>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title={t('notificationsEmptyTitle')}
            description={t('notificationsEmptyDescription')}
            icon="bell"
          />
        ) : (
          filteredNotifications.map((item) => (
            <View key={item.id} className="mb-3">
              <NotificationCard
                title={translateDynamic(item.title)}
                message={translateDynamic(item.message)}
                timestamp={item.timestamp}
                read={item.read}
                category={item.category}
                isNew={item.isNew}
                onPress={() => {
                  if (item.type === 'alert') router.push('/emergency');
                  else router.push('/reports');
                }}
              />
            </View>
          ))
        )}
      </View>

    </ScreenContainer>
  );
}
