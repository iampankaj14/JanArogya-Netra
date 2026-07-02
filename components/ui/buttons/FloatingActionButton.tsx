import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

interface FloatingActionButtonProps extends React.ComponentProps<typeof Pressable> {
  icon: AppIconName;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function FloatingActionButton({
  icon,
  label,
  loading = false,
  disabled = false,
  ...props
}: FloatingActionButtonProps) {
  const isInteractionDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        pressed && { opacity: 0.9 },
        {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 10,
        },
      ]}
      className={`flex-row items-center justify-center bg-brand-blue px-4 py-4 rounded-full disabled:bg-slate-800`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Feather name={icons[icon] as any} size={24} color="#FFFFFF" />
      )}
      {label && !loading && (
        <Text className="text-white font-bold ml-2 text-base">{label}</Text>
      )}
    </Pressable>
  );
}

export default FloatingActionButton;
