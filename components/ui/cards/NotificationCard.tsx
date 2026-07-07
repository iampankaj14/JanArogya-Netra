import React from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NotificationItem } from '@/shared/types/notification';
import { useTranslation } from '@/hooks/useTranslation';

interface NotificationCardProps extends Omit<NotificationItem, 'id'> {
  onPress?: () => void;
  loading?: boolean;
}

const getCardConfig = (category?: string) => {
  switch (category) {
    case 'Stock Redistribution':
      return { 
        bgClass: 'bg-emerald-50/50', 
        iconName: 'check-circle', 
        iconColor: '#10B981', 
        pillBg: 'bg-emerald-50',
        pillText: 'text-emerald-600',
        dotColor: 'bg-blue-600'
      };
    case 'Epidemic Alert':
      return { 
        bgClass: 'bg-red-50/50', 
        iconName: 'alert-triangle', 
        iconColor: '#EF4444', 
        pillBg: 'bg-red-50',
        pillText: 'text-red-600',
        dotColor: 'bg-blue-600'
      };
    case 'Monthly Report':
      return {
        bgClass: 'bg-blue-50/50',
        iconName: 'file-text',
        iconColor: '#3B82F6',
        pillBg: 'bg-blue-50',
        pillText: 'text-blue-600',
        dotColor: 'bg-blue-600'
      };
    case 'Stock Alert':
      return {
        bgClass: 'bg-orange-50/50',
        iconName: 'package',
        iconColor: '#F59E0B',
        pillBg: 'bg-orange-50',
        pillText: 'text-orange-600',
        dotColor: 'bg-orange-500' 
      };
    case 'System Update':
      return {
        bgClass: 'bg-purple-50/50',
        iconName: 'speaker',
        iconColor: '#8B5CF6',
        pillBg: 'bg-purple-50',
        pillText: 'text-purple-600',
        dotColor: 'bg-emerald-500' 
      };
    default:
      return {
        bgClass: 'bg-slate-50',
        iconName: 'bell',
        iconColor: '#64748B',
        pillBg: 'bg-slate-100',
        pillText: 'text-slate-600',
        dotColor: 'bg-blue-600'
      };
  }
};

const getRelativeTime = (dateStr: string, lang: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return lang === 'hi' ? 'अभी-अभी' : 'Just now';
  if (diffMins < 60) return lang === 'hi' ? `${diffMins} मिनट पहले` : `${diffMins} mins ago`;
  if (diffHrs < 24) return lang === 'hi' ? `${diffHrs} घंटे पहले` : `${diffHrs} ${diffHrs === 1 ? 'hr' : 'hrs'} ago`;
  if (diffDays === 1) return lang === 'hi' ? 'कल' : 'Yesterday';
  
  return lang === 'hi' ? `${diffDays} दिन पहले` : `${diffDays} days ago`;
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
  const { language } = useTranslation();
  const formattedTime = getRelativeTime(timestamp, language);

  const translateCategory = (cat: string) => {
    if (language !== 'hi') return cat;
    const map: Record<string, string> = {
      'Stock Redistribution': 'स्टॉक पुनर्वितरण',
      'Epidemic Alert': 'महामारी अलर्ट',
      'Monthly Report': 'मासिक रिपोर्ट',
      'Stock Alert': 'स्टॉक अलर्ट',
      'System Update': 'सिस्टम अपडेट'
    };
    return map[cat] || cat;
  };
  
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
      className="bg-white rounded-[20px] shadow-sm shadow-black/5 flex-row border border-slate-100 mb-4 h-[85px]"
    >
      {/* Left Colored Strip with Custom Icon Component */}
      <View className={`w-[110px] h-full ${config.bgClass} items-center justify-center rounded-l-[20px] border-r border-slate-50 overflow-hidden`}>
        {/* Background decorative circles */}
        <View className="absolute w-[120px] h-[120px] rounded-full -top-6 -right-6" style={{ backgroundColor: `${config.iconColor}10` }} />
        <View className="absolute w-[80px] h-[80px] rounded-full -bottom-4 -left-4" style={{ backgroundColor: `${config.iconColor}10` }} />
        
        {/* Main Icon Pill */}
        <View className="w-[64px] h-[64px] rounded-full bg-white shadow-md shadow-black/5 items-center justify-center border border-white relative z-10">
          <View className={`w-[52px] h-[52px] rounded-full items-center justify-center`} style={{ backgroundColor: `${config.iconColor}20` }}>
            <Feather name={iconFallback as any} size={26} color={config.iconColor} />
          </View>
        </View>
      </View>

      {/* Right Content */}
      <View className="flex-1 py-2 px-4 justify-between">
        
        {/* Top Row: Icon, Title, Date, Dot */}
        <View className="flex-row items-start justify-between mb-0">
          <View className="flex-row items-center flex-1 pr-2">
            <Text className="text-black font-bold text-[14px]" numberOfLines={1}>{title}</Text>
          </View>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-slate-500 text-[9px] font-semibold mr-1.5">{formattedTime}</Text>
            {isNew && (
              <View className="bg-red-50 border border-red-100 px-1 py-0.5 rounded mr-1.5">
                <Text className="text-red-600 text-[7px] font-bold uppercase">{language === 'hi' ? 'नया' : 'New'}</Text>
              </View>
            )}
            <View className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
          </View>
        </View>

        {/* Middle Description */}
        <Text className="text-slate-500 text-[12px] leading-4 font-medium mb-1 pr-4" numberOfLines={2}>
          {message}
        </Text>

        {/* Bottom Row: Category Pill and Chevron */}
        <View className="flex-row items-center justify-between mt-auto">
          {category ? (
            <View className={`${config.pillBg} px-2.5 py-1 rounded-md self-start`}>
              <Text className={`${config.pillText} font-bold text-[10px]`}>{translateCategory(category)}</Text>
            </View>
          ) : <View />}
          <Feather name="chevron-right" size={16} color="#3B82F6" />
        </View>

      </View>
    </Pressable>
  );
}

export default NotificationCard;
