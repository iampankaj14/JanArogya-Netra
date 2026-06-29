import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface SummaryItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface SummaryCardProps {
  title?: string;
  items: SummaryItem[];
  loading?: boolean;
}

export function SummaryCard({
  title,
  items,
  loading = false,
}: SummaryCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-xl border border-slate-100 items-center justify-center min-h-[100px]">
        <ActivityIndicator color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      {title && (
        <Text className="text-slate-800 font-bold text-sm mb-3 border-b border-slate-50 pb-2">
          {title}
        </Text>
      )}
      <View className="gap-2.5">
        {items.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center">
            <Text className="text-slate-400 text-xs font-semibold">{item.label}</Text>
            <Text
              className={`text-sm ${
                item.highlight ? 'text-blue-900 font-bold' : 'text-slate-700 font-medium'
              }`}
            >
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default SummaryCard;
