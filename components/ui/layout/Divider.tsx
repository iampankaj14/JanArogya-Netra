import React from 'react';
import { View } from 'react-native';

interface DividerProps {
  vertical?: boolean;
  spacing?: number;
}

export function Divider({
  vertical = false,
  spacing = 16,
}: DividerProps) {
  if (vertical) {
    return (
      <View
        style={{ marginHorizontal: spacing }}
        className="w-[1px] h-full bg-slate-100"
      />
    );
  }

  return (
    <View
      style={{ marginVertical: spacing }}
      className="h-[1px] w-full bg-slate-100"
    />
  );
}

export default Divider;
