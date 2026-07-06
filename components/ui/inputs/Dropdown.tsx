import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
  icon?: keyof typeof Feather.glyphMap;
}

export function Dropdown({
  label,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onValueChange,
  error,
  icon,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === selectedValue);

  const handleSelect = (val: string) => {
    onValueChange(val);
    setIsOpen(false);
  };

  const borderClass = error ? 'border-red-500 bg-red-50' : 'border-blue-200 bg-white';

  return (
    <View className="w-full mb-4">
      {label && (
        <View className="flex-row items-center mb-2">
          {icon && <Feather name={icon} size={12} color="#3B82F6" style={{ marginRight: 6 }} />}
          <Text className="text-brand-navy font-extrabold text-[13px] uppercase tracking-wide">
            {label}
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center justify-between border-2 rounded-2xl h-14 px-4 shadow-sm shadow-blue-500/10 ${borderClass}`}
      >
        <Text className={`text-[13px] font-bold ${selectedOption ? 'text-brand-navy' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color="#94A3B8" />
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
                  className={`py-3.5 px-4 border-b border-slate-50 flex-row justify-between items-center ${isSelected ? 'bg-blue-50/30' : 'active:bg-slate-50'
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
