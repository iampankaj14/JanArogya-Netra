import React, { useState } from 'react';
import { View, FlatList, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import NotificationCard from '@/components/ui/cards/NotificationCard';
import EmptyState from '@/components/ui/feedback/EmptyState';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import { dummyNotifications } from '@/dummy/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(dummyNotifications);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    alert('All notifications marked as read.');
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mt-2">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 items-center justify-center active:bg-slate-800"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </Pressable>
        <Text className="text-white font-black text-lg">Notifications Inbox</Text>
        <View className="w-10 h-10" />
      </View>

      <View className="flex-row justify-end space-x-3 my-4">
        {notifications.length > 0 && (
          <>
            <OutlineButton 
              title="Mark all read" 
              onPress={handleMarkAllRead}
            />
            <OutlineButton 
              title="Clear all" 
              onPress={handleClearAll}
              style={{ borderColor: '#EF4444' }}
            />
          </>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="mb-4">
            <NotificationCard
              title={item.title}
              message={item.message}
              timestamp={item.timestamp}
              read={item.read}
              onPress={() => alert(`Review details for notification: ${item.title}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Inbox is Clear"
            description="You have no unread notifications or outbreak warnings."
            icon="bell"
          />
        }
      />
    </ScreenContainer>
  );
}
