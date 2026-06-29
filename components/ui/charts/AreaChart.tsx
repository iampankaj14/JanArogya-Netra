import React from 'react';
import { View, Text } from 'react-native';

interface ChartProps {
  title?: string;
  height?: number;
}

export function AreaChart({
  title = 'Capacity Fill Rates',
  height = 150,
}: ChartProps) {
  const points = [
    { label: 'W1', height: '20%' },
    { label: 'W2', height: '50%' },
    { label: 'W3', height: '40%' },
    { label: 'W4', height: '80%' },
    { label: 'W5', height: '70%' },
  ];

  return (
    <View className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-full">
      {title && (
        <Text className="text-slate-800 font-bold text-sm mb-3">
          {title}
        </Text>
      )}

      {/* Area Plot Container */}
      <View style={{ height }} className="border-l border-b border-slate-200 justify-around flex-row items-end pb-1 px-2 relative">
        <View className="absolute left-0 right-0 top-[33%] border-t border-slate-100 border-dashed h-[1px]" />
        <View className="absolute left-0 right-0 top-[66%] border-t border-slate-100 border-dashed h-[1px]" />

        {points.map((pt, index) => (
          <View key={index} className="items-center flex-1 h-full justify-end">
            {/* Mocking area fill using vertical filled columns under points */}
            <View
              style={{ height: pt.height as any }}
              className="w-8 bg-blue-100/60 rounded-t-lg border-t-2 border-blue-900 justify-center items-center"
            >
              <View className="w-1.5 h-1.5 rounded-full bg-blue-900 absolute -top-1" />
            </View>
          </View>
        ))}
      </View>

      {/* X Axis Labels */}
      <View className="flex-row justify-around mt-2 pl-3">
        {points.map((pt, index) => (
          <Text key={index} className="text-slate-400 text-[10px] font-bold">
            {pt.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default AreaChart;
