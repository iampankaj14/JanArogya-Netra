import React, { useState } from 'react';
import { View, FlatList, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import NotificationCard from '@/components/ui/cards/NotificationCard';
import EmptyState from '@/components/ui/feedback/EmptyState';
import { dummyNotifications } from '@/dummy/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const filters = [
    { id: 'all', label: 'All', icon: 'inbox', badge: 12, bgClass: 'bg-blue-50', iconColor: '#3B82F6', badgeBg: 'bg-blue-600' },
    { id: 'alert', label: 'Alerts', icon: 'alert-triangle', badge: 4, bgClass: 'bg-red-50', iconColor: '#EF4444', badgeBg: 'bg-red-500' },
    { id: 'update', label: 'Updates', icon: 'volume-2', badge: 5, bgClass: 'bg-emerald-50', iconColor: '#10B981', badgeBg: 'bg-emerald-500' },
    { id: 'report', label: 'Reports', icon: 'file-text', badge: 3, bgClass: 'bg-purple-50', iconColor: '#8B5CF6', badgeBg: 'bg-purple-500' },
  ];

  return (
    <ScreenContainer>
      
      {/* Custom Header */}
      <View className="flex-row items-center justify-between mt-4 mb-6">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            className="w-11 h-11 rounded-full bg-white border border-slate-100 shadow-sm shadow-black/5 items-center justify-center mr-4 active:bg-slate-50"
          >
            <Feather name="arrow-left" size={22} color="#000" />
          </Pressable>
          <View className="flex-1 pr-2">
            <Text className="text-brand-navy font-black text-[22px] tracking-tight mb-1">Notifications Inbox</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">Stay updated with important alerts and updates</Text>
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
            <Text className="text-white font-extrabold text-[13px] mb-0.5">Mark all as read</Text>
            <Text className="text-blue-100 text-[8px] font-bold">Clear all unread notifications</Text>
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
            <Text className="text-red-600 font-extrabold text-[13px] mb-0.5">Clear all</Text>
            <Text className="text-slate-500 text-[8px] font-bold">Remove all notifications</Text>
          </View>
        </Pressable>
      </View>

      {/* Filter Pills */}
      <View className="mb-6 -mx-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-2xl mr-3 border ${
                  isActive ? 'bg-white border-blue-200 shadow-sm shadow-blue-900/5' : 'bg-white/60 border-slate-100'
                }`}
              >
                <Feather name={filter.icon as any} size={14} color={isActive ? filter.iconColor : '#94A3B8'} className="mr-2" />
                <Text className={`font-bold text-[13px] mr-2 ${isActive ? 'text-black' : 'text-slate-500'}`}>
                  {filter.label}
                </Text>
                <View className={`${isActive ? filter.badgeBg : 'bg-slate-300'} px-1.5 py-0.5 rounded-full`}>
                  <Text className="text-white font-black text-[9px]">{filter.badge}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List */}
      <View className="flex-1">
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NotificationCard
              title={item.title}
              message={item.message}
              timestamp={item.timestamp}
              read={item.read}
              category={item.category}
              isNew={item.isNew}
              onPress={() => {}}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Inbox is Clear"
              description="You have no unread notifications or outbreak warnings."
              icon="bell"
            />
          }
        />
      </View>

    </ScreenContainer>
  );
}
