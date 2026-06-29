import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatDate } from '../../../utils/formatters';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  error?: string;
}

export function DatePicker({
  label,
  value = new Date(),
  onChange,
  error,
}: DatePickerProps) {
  const handlePress = () => {
    // Simulating date picking
    if (onChange) {
      onChange(new Date());
    }
  };

  const borderClass = error ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white';

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-slate-700 font-bold text-xs mb-1.5 uppercase tracking-wide">
          {label}
        </Text>
      )}

      <Pressable
        onPress={handlePress}
        className={`flex-row items-center justify-between border rounded-lg h-12 px-3 ${borderClass}`}
      >
        <Text className="text-slate-800 text-sm">{formatDate(value)}</Text>
        <Feather name="calendar" size={18} color="#6B7280" />
      </Pressable>

      {error && (
        <Text className="text-red-500 text-xxs text-[10px] mt-1 font-semibold">{error}</Text>
      )}
    </View>
  );
}

export default DatePicker;
