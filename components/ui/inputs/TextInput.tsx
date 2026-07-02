import React from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppIconName, icons } from '@/constants/icons';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: AppIconName;
  rightIcon?: AppIconName;
  onRightIconPress?: () => void;
}

export function TextInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  className = '',
  ...props
}: TextInputProps) {
  const borderClass = error ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white focus:border-blue-900';

  return (
    <View className={`w-full mb-4 ${className}`}>
      {label && (
        <Text className="text-slate-700 font-bold text-sm mb-2 uppercase tracking-wide">
          {label}
        </Text>
      )}
      <View className={`flex-row items-center border rounded-xl h-14 px-4 ${borderClass}`}>
        {leftIcon && (
          <Feather
            name={icons[leftIcon] as any}
            size={18}
            color="#6B7280"
            style={{ marginRight: 8 }}
          />
        )}
        <RNTextInput
          className="flex-1 text-slate-800 text-base h-full"
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Feather
              name={icons[rightIcon] as any}
              size={18}
              color="#6B7280"
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="text-red-500 text-xxs text-[10px] mt-1 font-semibold">{error}</Text>
      ) : helperText ? (
        <Text className="text-slate-400 text-xxs text-[10px] mt-1 font-medium">{helperText}</Text>
      ) : null}
    </View>
  );
}

export default TextInput;
