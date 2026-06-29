import React from 'react';
import { View, Text } from 'react-native';

interface ChartProps {
  title?: string;
  height?: number;
}

export function LineChart({
  title = 'Trends Analysis',
  height = 150,
}: ChartProps) {
  return (
    <View className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-full">
      {title && (
        <Text className="text-slate-800 font-bold text-sm mb-3">
          {title}
        </Text>
      )}
      
      {/* Grid container */}
      <View style={{ height }} className="border-l border-b border-slate-200 justify-between pb-1 flex-col">
        {/* Horizontal grid lines */}
        <View className="border-t border-slate-100 border-dashed w-full h-[1px]" />
        <View className="border-t border-slate-100 border-dashed w-full h-[1px]" />
        <View className="border-t border-slate-100 border-dashed w-full h-[1px]" />
        
        {/* Mock Line Path using absolute positioning dots/bars */}
        <View className="absolute top-0 bottom-0 left-0 right-0 justify-around flex-row items-end px-3">
          <View className="w-2.5 h-2.5 rounded-full bg-blue-900 mb-[20%]" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-900 mb-[45%]" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-900 mb-[30%]" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-900 mb-[70%]" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-900 mb-[60%]" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-900 mb-[90%]" />
        </View>
      </View>

      {/* X Axis Labels */}
      <View className="flex-row justify-around mt-2 pl-3">
        <Text className="text-slate-400 text-[10px] font-bold">Jan</Text>
        <Text className="text-slate-400 text-[10px] font-bold">Feb</Text>
        <Text className="text-slate-400 text-[10px] font-bold">Mar</Text>
        <Text className="text-slate-400 text-[10px] font-bold">Apr</Text>
        <Text className="text-slate-400 text-[10px] font-bold">May</Text>
        <Text className="text-slate-400 text-[10px] font-bold">Jun</Text>
      </View>
    </View>
  );
}

export default LineChart;
