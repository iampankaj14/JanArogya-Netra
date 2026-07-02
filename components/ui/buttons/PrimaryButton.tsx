import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BaseButtonProps } from './ButtonProps';
import { icons } from '@/constants/icons';

export function PrimaryButton({
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
        pressed && { opacity: 0.85 },
      ]}
      className={`flex-row items-center justify-center bg-brand-blue border border-brand-blue py-3 px-6 rounded-xl disabled:bg-slate-800 disabled:border-slate-800`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" className="mr-2" size="small" />
      ) : (
        leftIcon && (
          <Feather
            name={icons[leftIcon] as any}
            size={18}
            color={disabled ? '#475569' : '#FFFFFF'}
            style={{ marginRight: 8 }}
          />
        )
      )}
      <Text
        className={`font-bold text-sm ${
          disabled ? 'text-slate-500' : 'text-white'
        }`}
      >
        {title}
      </Text>
      {!loading && rightIcon && (
        <Feather
          name={icons[rightIcon] as any}
          size={18}
          color={disabled ? '#475569' : '#FFFFFF'}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
}

export default PrimaryButton;
