import React from 'react';
import { View, Text } from 'react-native';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <View className="w-full py-4 px-6 bg-slate-900 border-b border-slate-800">
      <Text className="text-white text-lg font-bold">{title}</Text>
    </View>
  );
}
