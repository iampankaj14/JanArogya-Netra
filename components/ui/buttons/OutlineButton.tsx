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
      className={`flex-row items-center justify-center bg-transparent border border-blue-900 py-3 px-6 rounded-lg disabled:bg-transparent disabled:border-slate-300`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#1E3A8A" className="mr-2" size="small" />
      ) : (
        leftIcon && (
          <Feather
            name={icons[leftIcon] as any}
            size={18}
            color={disabled ? '#9CA3AF' : '#1E3A8A'}
            style={{ marginRight: 8 }}
          />
        )
      )}
      <Text
        className={`font-semibold text-base ${
          disabled ? 'text-gray-400' : 'text-blue-900'
        }`}
      >
        {title}
      </Text>
      {!loading && rightIcon && (
        <Feather
          name={icons[rightIcon] as any}
          size={18}
          color={disabled ? '#9CA3AF' : '#1E3A8A'}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
}

export default OutlineButton;
