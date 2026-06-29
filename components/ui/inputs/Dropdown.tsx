import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BottomSheet from '../layout/BottomSheet';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  error?: string;
}

export function Dropdown({
  label,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onValueChange,
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === selectedValue);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setIsOpen(false);
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
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center justify-between border rounded-lg h-12 px-3 ${borderClass}`}
      >
        <Text className={`text-sm ${selectedOption ? 'text-slate-800' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={16} color="#6B7280" />
      </Pressable>

      {error && (
        <Text className="text-red-500 text-xxs text-[10px] mt-1 font-semibold">{error}</Text>
      )}

      <BottomSheet visible={isOpen} onClose={() => setIsOpen(false)} title={label || 'Select'}>
        <ScrollView className="max-h-60" showsVerticalScrollIndicator={false}>
          <View className="pb-4">
            {options.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  className={`py-3.5 px-4 border-b border-slate-50 flex-row justify-between items-center ${
                    isSelected ? 'bg-blue-50/30' : 'active:bg-slate-50'
                  }`}
                >
                  <Text className={`text-sm ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-700'}`}>
                    {opt.label}
                  </Text>
                  {isSelected && <Feather name="check" size={16} color="#1E3A8A" />}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

export default Dropdown;
