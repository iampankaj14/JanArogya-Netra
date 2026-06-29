import React from 'react';
import { ScrollView, Text, Pressable } from 'react-native';

interface FilterChipsProps {
  options: string[];
  selectedOption: string;
  onSelectOption: (option: string) => void;
}

export function FilterChips({
  options,
  selectedOption,
  onSelectOption,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row py-2 mb-2"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {options.map((opt) => {
        const isSelected = opt === selectedOption;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelectOption(opt)}
            className={`mr-2.5 px-4 py-2 rounded-full border ${
              isSelected
                ? 'bg-blue-900 border-blue-900'
                : 'bg-white border-slate-200'
            }`}
          >
            <Text
              className={`font-semibold text-xs capitalize ${
                isSelected ? 'text-white' : 'text-slate-600'
              }`}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default FilterChips;
