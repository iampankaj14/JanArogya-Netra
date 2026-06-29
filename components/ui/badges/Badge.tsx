import React from 'react';
import { View, Text } from 'react-native';

export type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'info';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  compact?: boolean;
}

export function Badge({ label, variant, compact = false }: BadgeProps) {
  let bgClass = '';
  let textClass = '';

  switch (variant) {
    case 'critical':
      bgClass = 'bg-red-100 border-red-200';
      textClass = 'text-red-700';
      break;
    case 'high':
      bgClass = 'bg-orange-100 border-orange-200';
      textClass = 'text-orange-700';
      break;
    case 'medium':
      bgClass = 'bg-amber-100 border-amber-200';
      textClass = 'text-amber-700';
      break;
    case 'low':
      bgClass = 'bg-blue-100 border-blue-200';
      textClass = 'text-blue-700';
      break;
    case 'success':
      bgClass = 'bg-emerald-100 border-emerald-200';
      textClass = 'text-emerald-700';
      break;
    case 'warning':
      bgClass = 'bg-yellow-100 border-yellow-200';
      textClass = 'text-yellow-700';
      break;
    case 'info':
    default:
      bgClass = 'bg-slate-100 border-slate-200';
      textClass = 'text-slate-700';
      break;
  }

  const paddingClass = compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <View className={`border rounded-full items-center justify-center ${bgClass} ${paddingClass}`}>
      <Text className={`font-semibold ${textClass} capitalize`}>{label}</Text>
    </View>
  );
}

export default Badge;
