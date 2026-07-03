import React from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { getHealthScoreColor } from '../../../utils/formatters';

interface PHCCardProps {
  id?: string;
  name: string;
  block: string;
  healthScore: number;
  doctorAvailable: boolean;
  stockStatus: 'adequate' | 'warning' | 'critical';
  activeAlertsCount: number;
  onPress?: () => void;
  loading?: boolean;
}

// Sparkline helper
const generateSparkline = (data: number[], width: number, height: number) => {
  if (!data || data.length === 0) return { path: '' };
  const min = Math.min(...data) - (Math.max(...data) * 0.1);
  const max = Math.max(...data) + (Math.max(...data) * 0.1);
  const range = (max - min) || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((val, i) => ({
    x: i * stepX,
    y: height - ((val - min) / range) * height
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return { path };
};

export default function PHCCard({
  id,
  name,
  block,
  healthScore,
  doctorAvailable,
  stockStatus,
  activeAlertsCount,
  onPress,
  loading = false,
}: PHCCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-3xl border border-slate-100 items-center justify-center min-h-[160px]">
        <ActivityIndicator color="#0B1D3A" />
      </View>
    );
  }

  // Determine colors based on overall health score
  let scoreColor = '#10B981'; // Green
  let scoreText = 'Excellent';
  let illustration = require('@/data/phc/phc illustration/green1.png');
  
  if (healthScore < 60) {
    scoreColor = '#EF4444'; // Red
    scoreText = 'Critical';
    illustration = require('@/data/phc/phc illustration/red1.png');
  } else if (healthScore < 80) {
    scoreColor = '#F59E0B'; // Orange
    scoreText = 'Warning';
    illustration = require('@/data/phc/phc illustration/yellow1.png');
  }

  // Determine stock badge config
  let stockIcon = require('@/data/phc/status icon/green_s.png');
  let stockTextColor = 'text-emerald-600';
  let stockText = 'Adequate Stock';
  if (stockStatus === 'warning') {
    stockIcon = require('@/data/phc/status icon/yellow_s.png');
    stockTextColor = 'text-amber-600';
    stockText = 'Warning Stock';
  } else if (stockStatus === 'critical') {
    stockIcon = require('@/data/phc/status icon/red_s.png');
    stockTextColor = 'text-red-600';
    stockText = 'Critical Stock';
  }

  // Determine alerts config
  const alertIcon = activeAlertsCount === 0 
    ? require('@/data/phc/status icon/fine.png') 
    : require('@/data/phc/status icon/critical.png'); // use critical icon or need icon
  const alertTextColor = activeAlertsCount === 0 ? 'text-emerald-600' : 'text-red-600';
  const alertText = activeAlertsCount === 0 ? 'No Active Alerts' : `${activeAlertsCount} Active Alert${activeAlertsCount > 1 ? 's' : ''}`;

  // Doctor config
  const docIcon = doctorAvailable 
    ? require('@/data/phc/status icon/mo_p.png') 
    : require('@/data/phc/status icon/mo_a.png');
  const docTextColor = doctorAvailable ? 'text-emerald-600' : 'text-red-600';
  const docText = doctorAvailable ? 'MO Present' : 'MO Absent';

  // Circular Progress calculations
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  // Dummy Sparkline Data (Varying based on id to look dynamic)
  const stockData = [40, 50, 45, 60, 55, 70, 81];
  const moData = [90, 92, 91, 95, 88, 90, 92];
  const flowData = [20, 35, 30, 40, 25, 50, 45];
  
  if (healthScore < 60) {
    stockData.push(30, 25, 32);
    moData.push(50, 45, 48);
  }

  const stockSpark = generateSparkline(stockData.slice(-7), 50, 15);
  const moSpark = generateSparkline(moData.slice(-7), 50, 15);
  const flowSpark = generateSparkline(flowData.slice(-7), 50, 15);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{ borderColor: scoreColor, borderWidth: 2 }}
      className="bg-white rounded-[28px] shadow-sm overflow-hidden active:opacity-90"
    >
      {/* Top Main Section */}
      <View className="p-4 flex-row">
        {/* Left Illustration */}
        <View className="w-24 h-24 rounded-2xl bg-slate-50 mr-4 items-center justify-center overflow-hidden">
          <Image source={illustration} className="w-full h-full" resizeMode="cover" />
        </View>

        {/* Center Details */}
        <View className="flex-1 justify-center">
          <Text className="text-lg font-black text-slate-800 tracking-tight">{name}</Text>
          <View className="flex-row items-center mt-0.5 mb-3">
            <Feather name="map-pin" size={10} color="#94A3B8" />
            <Text className="text-xs text-slate-500 font-medium ml-1">{block} Block</Text>
          </View>

          {/* Badges Row */}
          <View className="flex-row flex-wrap gap-1.5 mt-1">
            {/* MO Badge */}
            <View className={`flex-row items-center px-2 py-1 rounded-full ${doctorAvailable ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Image source={docIcon} className="w-4 h-4 mr-1" resizeMode="contain" />
              <Text className={`text-[10px] font-bold ${docTextColor}`}>{docText}</Text>
            </View>
            
            {/* Stock Badge */}
            <View className={`flex-row items-center px-2 py-1 rounded-full ${stockStatus === 'adequate' ? 'bg-emerald-50' : stockStatus === 'warning' ? 'bg-amber-50' : 'bg-red-50'}`}>
              <Image source={stockIcon} className="w-4 h-4 mr-1" resizeMode="contain" />
              <Text className={`text-[10px] font-bold ${stockTextColor}`}>{stockText}</Text>
            </View>

            {/* Alerts Badge */}
            <View className={`flex-row items-center px-2 py-1 rounded-full ${activeAlertsCount === 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <Image source={alertIcon} className="w-4 h-4 mr-1" resizeMode="contain" />
              <Text className={`text-[10px] font-bold ${alertTextColor}`}>{alertText}</Text>
            </View>
          </View>
        </View>

        {/* Right Circular Score */}
        <View className="w-20 items-center justify-center ml-2">
          <View className="relative items-center justify-center w-14 h-14">
            <Svg height="56" width="56" viewBox="0 0 64 64" className="absolute">
              <Circle
                cx="32"
                cy="32"
                r={radius}
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx="32"
                cy="32"
                r={radius}
                stroke={scoreColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </Svg>
            <View className="items-center justify-center absolute">
              <Text className="text-[22px] font-black text-slate-800 leading-none">{healthScore}</Text>
            </View>
          </View>
          <Text style={{ color: scoreColor }} className="text-[10px] font-extrabold mt-1">{scoreText}</Text>
        </View>
      </View>

      {/* Sparklines Section */}
      <View className="px-4 pb-4 flex-row justify-between">
        
        <View className="w-1/3">
          <Text className="text-[9px] font-bold text-slate-500 uppercase">Stock Health</Text>
          <View className="flex-row items-end mt-1">
            <Svg height="15" width="50">
              <Path d={stockSpark.path} stroke={scoreColor} strokeWidth="1.5" fill="none" />
            </Svg>
            <Text className="text-[10px] font-bold text-slate-800 ml-2">{stockData[stockData.length-1]}%</Text>
          </View>
        </View>

        <View className="w-1/3">
          <Text className="text-[9px] font-bold text-slate-500 uppercase">MO Attendance</Text>
          <View className="flex-row items-end mt-1">
            <Svg height="15" width="50">
              <Path d={moSpark.path} stroke="#3B82F6" strokeWidth="1.5" fill="none" />
            </Svg>
            <Text className="text-[10px] font-bold text-slate-800 ml-2">{moData[moData.length-1]}%</Text>
          </View>
        </View>

        <View className="w-1/3">
          <Text className="text-[9px] font-bold text-slate-500 uppercase">Patient Flow</Text>
          <View className="flex-row items-end mt-1">
            <Svg height="15" width="50">
              <Path d={flowSpark.path} stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
            </Svg>
            <Text className="text-[10px] font-bold text-slate-800 ml-2">High</Text>
          </View>
        </View>

      </View>

      {/* Footer Action */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-slate-50">
        <Text className="text-xs font-bold text-[#0E62CC]">View Facility Profile</Text>
        <Feather name="arrow-right" size={14} color="#0E62CC" />
      </View>

    </Pressable>
  );
}
