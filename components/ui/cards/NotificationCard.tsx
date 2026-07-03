import React from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NotificationItem } from '@/shared/types/notification';

interface NotificationCardProps extends Omit<NotificationItem, 'id'> {
  onPress?: () => void;
  loading?: boolean;
}

const getCardConfig = (category?: string) => {
  switch (category) {
    case 'Stock Redistribution':
      return { 
        image: require('../../../data/notification/check.png'), 
        bgClass: 'bg-emerald-50/50', 
        iconName: 'check-circle', 
        iconColor: '#10B981', 
        pillBg: 'bg-emerald-50',
        pillText: 'text-emerald-600',
        dotColor: 'bg-blue-600'
      };
    case 'Epidemic Alert':
      return { 
        image: require('../../../data/notification/emergency.png'), 
        bgClass: 'bg-red-50/50', 
        iconName: 'alert-triangle', 
        iconColor: '#EF4444', 
        pillBg: 'bg-red-50',
        pillText: 'text-red-600',
        dotColor: 'bg-blue-600'
      };
    case 'Monthly Report':
      return {
        image: require('../../../data/notification/news.png'),
        bgClass: 'bg-blue-50/50',
        iconName: 'file-text',
        iconColor: '#3B82F6',
        pillBg: 'bg-blue-50',
        pillText: 'text-blue-600',
        dotColor: 'bg-blue-600'
      };
    case 'Stock Alert':
      return {
        image: require('../../../data/notification/medi.png'),
        bgClass: 'bg-orange-50/50',
        iconName: 'package',
        iconColor: '#F59E0B',
        pillBg: 'bg-orange-50',
        pillText: 'text-orange-600',
        dotColor: 'bg-orange-500' 
      };
    case 'System Update':
      return {
        image: require('../../../data/notification/announce.png'),
        bgClass: 'bg-purple-50/50',
        iconName: 'speaker',
        iconColor: '#8B5CF6',
        pillBg: 'bg-purple-50',
        pillText: 'text-purple-600',
        dotColor: 'bg-emerald-500' 
      };
    default:
      return {
        image: require('../../../data/notification/bell.png'),
        bgClass: 'bg-slate-50',
        iconName: 'bell',
        iconColor: '#64748B',
        pillBg: 'bg-slate-100',
        pillText: 'text-slate-600',
        dotColor: 'bg-blue-600'
      };
  }
};

const formatDateObj = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  return `${day}-${month}-${year}, ${time}`;
};

export function NotificationCard({
  title,
  message,
  timestamp,
  read,
  category,
  isNew,
  onPress,
  loading = false,
}: NotificationCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-3xl border border-slate-100 items-center justify-center min-h-[120px]">
        <ActivityIndicator color="#0B1D3A" />
      </View>
    );
  }

  const config = getCardConfig(category);
  const formattedTime = formatDateObj(timestamp);
  
  // Convert speaker to something Feather has (volume-2)
  const iconFallback = config.iconName === 'speaker' ? 'volume-2' : config.iconName;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        { overflow: 'hidden' },
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
      ]}
      className="bg-white rounded-[20px] shadow-sm shadow-black/5 flex-row border border-slate-100 mb-4 h-[130px]"
    >
      {/* Left Colored Strip with Image */}
      <View className={`w-[110px] h-full ${config.bgClass} items-center justify-center rounded-l-[20px] border-r border-slate-50`}>
        <Image 
          source={config.image}
          style={{ width: 80, height: 80 }}
          resizeMode="contain"
        />
      </View>

      {/* Right Content */}
      <View className="flex-1 py-3 px-4 justify-between">
        
        {/* Top Row: Icon, Title, Date, Dot */}
        <View className="flex-row items-start justify-between mb-1">
          <View className="flex-row items-center flex-1 pr-2">
            <View className={`w-6 h-6 rounded-full items-center justify-center mr-2`} style={{ backgroundColor: `${config.iconColor}15` }}>
              <Feather name={iconFallback as any} size={12} color={config.iconColor} />
            </View>
            <Text className="text-black font-bold text-[14px]" numberOfLines={1}>{title}</Text>
          </View>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-slate-500 text-[9px] font-semibold mr-1.5">{formattedTime}</Text>
            {isNew && (
              <View className="bg-red-50 border border-red-100 px-1 py-0.5 rounded mr-1.5">
                <Text className="text-red-600 text-[7px] font-bold uppercase">New</Text>
              </View>
            )}
            <View className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
          </View>
        </View>

        {/* Middle Description */}
        <Text className="text-slate-500 text-[12px] leading-4 font-medium mb-2 pr-4" numberOfLines={2}>
          {message}
        </Text>

        {/* Bottom Row: Category Pill and Chevron */}
        <View className="flex-row items-center justify-between mt-auto">
          {category ? (
            <View className={`${config.pillBg} px-2.5 py-1 rounded-md self-start`}>
              <Text className={`${config.pillText} font-bold text-[10px]`}>{category}</Text>
            </View>
          ) : <View />}
          <Feather name="chevron-right" size={16} color="#3B82F6" />
        </View>

      </View>
    </Pressable>
  );
}

export default NotificationCard;
