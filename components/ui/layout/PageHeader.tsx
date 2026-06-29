import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightIcon?: AppIconName;
  onRightIconPress?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  onBackPress,
  rightIcon,
  onRightIconPress,
}: PageHeaderProps) {
  return (
    <View className="flex-row items-center justify-between pb-4 pt-2 border-b border-slate-100 bg-slate-50 px-1">
      <View className="flex-row items-center flex-1 mr-4">
        {onBackPress && (
          <Pressable
            onPress={onBackPress}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            className="mr-3 w-8 h-8 rounded-full items-center justify-center bg-white border border-slate-100"
          >
            <Feather name={icons.arrowLeft as any} size={16} color="#1E3A8A" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-slate-800 text-2xl font-bold tracking-tight" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightIcon && onRightIconPress && (
        <Pressable
          onPress={onRightIconPress}
          style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          className="w-10 h-10 rounded-full items-center justify-center bg-white border border-slate-100"
        >
          <Feather name={icons[rightIcon] as any} size={18} color="#1E3A8A" />
        </Pressable>
      )}
    </View>
  );
}

export default PageHeader;
