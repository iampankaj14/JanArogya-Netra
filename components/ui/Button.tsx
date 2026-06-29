import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, variant = 'primary', ...props }: ButtonProps) {
  const bgClass = variant === 'primary' ? 'bg-blue-600 active:bg-blue-700' : 'bg-gray-200 active:bg-gray-300';
  const textClass = variant === 'primary' ? 'text-white' : 'text-gray-800';

  return (
    <Pressable
      className={`py-3 px-6 rounded-lg items-center ${bgClass}`}
      {...props}
    >
      <Text className={`font-semibold text-base ${textClass}`}>{title}</Text>
    </Pressable>
  );
}
