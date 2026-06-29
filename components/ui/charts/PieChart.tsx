import React from 'react';
import { View, Text } from 'react-native';

interface ChartProps {
  title?: string;
}

export function PieChart({
  title = 'Inventory Distribution',
}: ChartProps) {
  const segments = [
    { name: 'Antibiotics', percentage: '40%', color: 'bg-blue-900' },
    { name: 'IV Fluids', percentage: '25%', color: 'bg-blue-500' },
    { name: 'Vaccines', percentage: '20%', color: 'bg-blue-300' },
    { name: 'Others', percentage: '15%', color: 'bg-blue-100' },
  ];

  return (
    <View className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm w-full">
      {title && (
        <Text className="text-slate-800 font-bold text-sm mb-3">
          {title}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        {/* Mock Circular Pie using nested styled borders */}
        <View className="w-24 h-24 rounded-full border-8 border-blue-950 items-center justify-center relative">
          <View className="w-16 h-16 rounded-full border-4 border-blue-500 items-center justify-center bg-slate-50">
            <Text className="text-slate-800 font-bold text-xs">Total</Text>
            <Text className="text-slate-500 text-[10px]">100%</Text>
          </View>
        </View>

        {/* Legend */}
        <View className="flex-1 ml-6 gap-1.5">
          {segments.map((seg, index) => (
            <View key={index} className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className={`w-2.5 h-2.5 rounded-full ${seg.color} mr-2`} />
                <Text className="text-slate-600 text-xs font-semibold">{seg.name}</Text>
              </View>
              <Text className="text-slate-400 text-xs font-bold">{seg.percentage}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default PieChart;
