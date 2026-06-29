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
  let defaultColor = '#1F2937';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-blue-900 w-10 h-10 rounded-full justify-center items-center';
      defaultColor = '#FFFFFF';
      break;
    case 'secondary':
      bgClass = 'bg-blue-100 w-10 h-10 rounded-full justify-center items-center';
      defaultColor = '#1E3A8A';
      break;
    case 'transparent':
    default:
      bgClass = 'w-10 h-10 rounded-full justify-center items-center active:bg-slate-100';
      break;
  }

  const iconColor = color || defaultColor;

  return (
    <Pressable
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
      ]}
      className={`${bgClass} disabled:bg-slate-200`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <Feather name={icons[icon] as any} size={size} color={disabled ? '#9CA3AF' : iconColor} />
      )}
    </Pressable>
  );
}

export default IconButton;
