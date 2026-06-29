import React from 'react';
import { View, Text } from 'react-native';

interface ChartProps {
  title?: string;
  height?: number;
}

export function BarChart({
  title = 'Monthly Comparison',
  height = 150,
}: ChartProps) {
  const bars = [
    { label: 'A', height: '35%' },
    { label: 'B', height: '65%' },
    { label: 'C', height: '45%' },
    { label: 'D', height: '85%' },
    { label: 'E', height: '55%' },
    { label: 'F', height: '95%' },
  ];

  return (
    <View className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-full">
      {title && (
        <Text className="text-slate-800 font-bold text-sm mb-3">
          {title}
        </Text>
      )}

      {/* Bar container */}
      <View style={{ height }} className="border-l border-b border-slate-200 justify-around flex-row items-end pb-1 px-2 relative">
        {/* Horizontal grid lines */}
        <View className="absolute left-0 right-0 top-[25%] border-t border-slate-50 border-dashed h-[1px]" />
        <View className="absolute left-0 right-0 top-[50%] border-t border-slate-50 border-dashed h-[1px]" />
        <View className="absolute left-0 right-0 top-[75%] border-t border-slate-50 border-dashed h-[1px]" />

        {bars.map((bar, index) => (
          <View key={index} className="items-center flex-1">
            <View
              style={{ height: bar.height as any }}
              className="w-4 bg-blue-900 rounded-t-sm"
            />
          </View>
        ))}
      </View>

      {/* X Axis Labels */}
      <View className="flex-row justify-around mt-2 pl-3">
        {bars.map((bar, index) => (
          <Text key={index} className="text-slate-400 text-[10px] font-bold">
            {bar.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default BarChart;
