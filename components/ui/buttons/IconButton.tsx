import React from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

interface IconButtonProps extends React.ComponentProps<typeof Pressable> {
  icon: AppIconName;
  size?: number;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'transparent';
}

export function IconButton({
  icon,
  size = 20,
  color,
  loading = false,
  disabled = false,
  variant = 'transparent',
  ...props
}: IconButtonProps) {
  const isInteractionDisabled = disabled || loading;
  
  let bgClass = '';
  let defaultColor = '#94A3B8';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-brand-blue w-10 h-10 rounded-full justify-center items-center';
      defaultColor = '#FFFFFF';
      break;
    case 'secondary':
      bgClass = 'bg-brand-blue/10 w-10 h-10 rounded-full justify-center items-center border border-brand-blue/20';
      defaultColor = '#0E76FD';
      break;
    case 'transparent':
    default:
      bgClass = 'w-10 h-10 rounded-full justify-center items-center active:bg-slate-800/50';
      break;
  }

  const iconColor = color || defaultColor;

  return (
    <Pressable
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
      ]}
      className={`${bgClass} disabled:bg-slate-800`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <Feather name={icons[icon] as any} size={size} color={disabled ? '#475569' : iconColor} />
      )}
    </Pressable>
  );
}

export default IconButton;
