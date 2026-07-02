import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BaseButtonProps } from './ButtonProps';
import { icons } from '@/constants/icons';

export function OutlineButton({
  title,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}: BaseButtonProps) {
  const isInteractionDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        pressed && { opacity: 0.8 },
      ]}
      className={`flex-row items-center justify-center bg-transparent border border-brand-border py-3 px-6 rounded-xl disabled:border-slate-850`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#0E76FD" className="mr-2" size="small" />
      ) : (
        leftIcon && (
          <Feather
            name={icons[leftIcon] as any}
            size={18}
            color={disabled ? '#475569' : '#0E76FD'}
            style={{ marginRight: 8 }}
          />
        )
      )}
      <Text
        className={`font-bold text-sm ${
          disabled ? 'text-slate-650' : 'text-blue-400'
        }`}
      >
        {title}
      </Text>
      {!loading && rightIcon && (
        <Feather
          name={icons[rightIcon] as any}
          size={18}
          color={disabled ? '#475569' : '#0E76FD'}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
}

export default OutlineButton;
