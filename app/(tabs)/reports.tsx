import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Svg, { Circle, Path, Defs, Stop, LinearGradient as SvgLinearGradient, Rect, Text as SvgText, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReportsScreen() {
  const { authState } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState('Daily Report');
  const formats = ['Daily Report', 'Weekly Report', 'Monthly Report', 'Forecast'];
  
  // Interactive chart states
  const [activeBedPoint, setActiveBedPoint] = useState<number | null>(6);
  const [activeOpdPoint, setActiveOpdPoint] = useState<number | null>(4);
  const [activeForecastPoint, setActiveForecastPoint] = useState<number | null>(8);
  const [showTodayMenu, setShowTodayMenu] = useState(false);

  // Dynamic Chart Data based on selectedFormat
  const getBedData = () => {
    if (selectedFormat === 'Weekly Report') {
      return [
        { cx: 30, cy: 50, val: '70%' }, { cx: 80, cy: 45, val: '75%' }, { cx: 130, cy: 60, val: '60%' },
        { cx: 180, cy: 50, val: '70%' }, { cx: 230, cy: 40, val: '80%' }, { cx: 280, cy: 65, val: '55%' }, { cx: 330, cy: 55, val: '65%' }
      ];
    }
    return [
      { cx: 30, cy: 70, val: '50%' }, { cx: 80, cy: 85, val: '35%' }, { cx: 130, cy: 80, val: '40%' },
      { cx: 180, cy: 80, val: '40%' }, { cx: 230, cy: 65, val: '55%' }, { cx: 280, cy: 75, val: '45%' }, { cx: 330, cy: 73, val: '47%' }
    ];
  };

  const getOpdData = () => {
    if (selectedFormat === 'Weekly Report') {
      return [
        { cx: 30, h: 60, yTop: 60, val: '1.2K' }, { cx: 80, h: 80, yTop: 40, val: '1.6K' }, { cx: 130, h: 90, yTop: 30, val: '1.8K' },
        { cx: 180, h: 100, yTop: 20, val: '2.0K' }, { cx: 230, h: 110, yTop: 10, val: '2.2K' }, { cx: 280, h: 70, yTop: 50, val: '1.4K' }, { cx: 330, h: 30, yTop: 90, val: '600' }
      ];
    }
    return [
      { cx: 30, h: 40, yTop: 80, val: '800' }, { cx: 80, h: 60, yTop: 60, val: '1.2K' }, { cx: 130, h: 75, yTop: 45, val: '1.5K' },
      { cx: 180, h: 90, yTop: 30, val: '1.8K' }, { cx: 230, h: 100, yTop: 20, val: '2K' }, { cx: 280, h: 60, yTop: 60, val: '1.2K' }, { cx: 330, h: 15, yTop: 105, val: '300' }
    ];
  };

  const bedData = getBedData();
  const opdData = getOpdData();

  // Forecast Full Width Data
  const forecastData = [
    { cx: 30, cy: 110, val: '28' }, { cx: 55, cy: 103, val: '42' }, { cx: 80, cy: 112, val: '30' }, { cx: 105, cy: 98, val: '50' },
    { cx: 130, cy: 82, val: '75' }, { cx: 155, cy: 94, val: '65' }, { cx: 180, cy: 91, val: '60' }, { cx: 205, cy: 85, val: '70' },
    { cx: 230, cy: 62, val: '132' }, { cx: 255, cy: 75, val: '105' }, { cx: 280, cy: 80, val: '95' }, { cx: 305, cy: 70, val: '110' },
    { cx: 340, cy: 60, val: '145' }
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER */}
        <View className="px-4 pt-10 mt-2 flex-row justify-between items-start">
          <View>
            <View className="flex-row items-center">
              <Text className="text-3xl font-black text-brand-navy tracking-tight">Facility Reports</Text>
              <View className="w-6 h-6 bg-blue-50 rounded-md items-center justify-center ml-2 border border-blue-100">
                <Feather name="bar-chart-2" size={14} color="#3B82F6" />
              </View>
            </View>
            <Text className="text-slate-500 text-xs mt-1">Intelligence synthesis and predictive health audits</Text>
          </View>
        </View>

        {/* PILLS */}
        <View className="mt-5 mb-5 px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt;
              return (
                <TouchableOpacity
                  key={fmt}
                  onPress={() => setSelectedFormat(fmt)}
                  activeOpacity={0.7}
                  className={`py-2 px-4 rounded-full border mr-2 ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* NETRA AI RECOMMENDATION (PHC Style Glassmorphism) */}
        <View className="px-4 mb-5">
          <View className="rounded-[24px] shadow-sm shadow-blue-200/50 border border-white/60 overflow-hidden bg-white">
            <LinearGradient
              colors={['#E8F2FC', '#D4E6FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: '100%' }}
            >
              <View className="p-4 relative">
                <View className="flex-row justify-between items-center mb-3 relative z-10">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-[12px] bg-white/70 border border-white items-center justify-center mr-3">
                      <Feather name="cpu" size={18} color="#4F46E5" />
                    </View>
                    <View>
                      <Text className="text-slate-600 font-bold text-[11px] mb-0.5">Netra Recommendation</Text>
                      <Text className="text-brand-navy font-black text-[14px]">AI Executive Briefing</Text>
                    </View>
                  </View>
                  <View className="bg-white/70 border border-white px-2.5 py-1 rounded-full">
                    <Text className="text-emerald-600 font-extrabold text-[10px]">98.2% Sync</Text>
                  </View>
                </View>

                <View className="mb-2 relative z-10">
                  <Text className="text-slate-700 font-semibold text-[11px] leading-relaxed">
                    Data sync completeness is at <Text className="font-bold text-emerald-600">98.2%</Text> across Gautam Buddh Nagar facilities. Dengue vectors are projected to climb in Dadri block over the next 10 days.
                  </Text>
                </View>

                <View className="relative z-10 bg-white/60 rounded-[16px] p-3 border border-white mt-1">
                  <View className="flex-row items-center mb-1">
                    <Feather name="zap" size={12} color="#4F46E5" style={{ marginRight: 4 }} />
                    <Text className="text-indigo-600 font-black text-[10px] tracking-widest uppercase">ACTION REQUIRED</Text>
                  </View>
                  <Text className="text-slate-800 font-bold text-[11px]">
                    Pre-position rapid antigen cassettes in Dadri block.
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* METRICS GRID 2x2 */}
        <View className="px-4 mb-5 flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                <MaterialCommunityIcons name="account-group" size={16} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-slate-500 font-bold text-[9px]">Total OPD</Text>
                <Text className="text-brand-navy font-black text-lg">{selectedFormat === 'Weekly Report' ? '28,450' : '4,732'}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Feather name="arrow-up" size={10} color="#10B981" />
              <Text className="text-emerald-500 font-bold text-[10px] ml-0.5 mr-1">12%</Text>
              <Text className="text-slate-400 text-[9px]">vs {selectedFormat === 'Weekly Report' ? 'last week' : 'yesterday'}</Text>
            </View>
          </View>
          
          <View className="w-[48%] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-2">
                <MaterialCommunityIcons name="bed-outline" size={16} color="#10B981" />
              </View>
              <View>
                <Text className="text-slate-500 font-bold text-[9px]">Beds Occupied</Text>
                <Text className="text-brand-navy font-black text-lg">{selectedFormat === 'Weekly Report' ? '68%' : '47%'}</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-[10px] ml-1">{selectedFormat === 'Weekly Report' ? '10 / 15 avg' : '7 / 15'}</Text>
          </View>
          
          <View className="w-[48%] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-2">
                <Feather name="clock" size={16} color="#F97316" />
              </View>
              <View>
                <Text className="text-slate-500 font-bold text-[9px]">Avg. Wait Time</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-brand-navy font-black text-lg">26</Text>
                  <Text className="text-slate-500 font-bold text-[9px] ml-1 relative bottom-1">mins</Text>
                </View>
              </View>
            </View>
            <View className="flex-row items-center">
              <Feather name="arrow-down" size={10} color="#10B981" />
              <Text className="text-emerald-500 font-bold text-[10px] ml-0.5 mr-1">8 mins</Text>
              <Text className="text-slate-400 text-[9px]">vs last week</Text>
            </View>
          </View>

          <View className="w-[48%] bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                <MaterialCommunityIcons name="flask-outline" size={16} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-slate-500 font-bold text-[9px]">Lab Tests</Text>
                <Text className="text-emerald-500 font-black text-sm">Available</Text>
              </View>
            </View>
            <Text className="text-slate-600 font-bold text-[10px] ml-1 mt-0.5"><Text className="text-brand-navy font-black">24</Text> today</Text>
          </View>
        </View>

        {/* FULL WIDTH STACKED CHARTS */}
        <View className="px-4 mb-5 flex-col space-y-5">
          
          {/* Bed Occupancy Trend */}
          <View className="w-full bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm relative overflow-hidden mb-5">
            <View className="flex-row items-center mb-1 relative z-10">
              <View className="w-8 h-8 rounded-md bg-emerald-50 items-center justify-center mr-2 border border-emerald-100">
                <MaterialCommunityIcons name="bed" size={16} color="#10B981" />
              </View>
              <View>
                <Text className="text-brand-navy font-bold text-xs">Bed Occupancy Trend</Text>
                <Text className="text-blue-500 text-[9px] font-bold">Average weekly load</Text>
              </View>
            </View>
            
            <View className="h-32 w-full mt-4 relative">
              <Svg height="100%" width="100%" viewBox="0 0 350 140">
                <Defs>
                  <SvgLinearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#10B981" stopOpacity="0.2" />
                    <Stop offset="1" stopColor="#10B981" stopOpacity="0" />
                  </SvgLinearGradient>
                </Defs>
                
                {/* Grid Lines */}
                <Path d="M0,20 L350,20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,53 L350,53" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,86 L350,86" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,120 L350,120" stroke="#E2E8F0" strokeWidth="1" />

                {/* Y-Axis labels */}
                <SvgText x="0" y="24" fill="#94A3B8" fontSize="9" fontWeight="bold">100%</SvgText>
                <SvgText x="0" y="57" fill="#94A3B8" fontSize="9" fontWeight="bold">75%</SvgText>
                <SvgText x="0" y="90" fill="#94A3B8" fontSize="9" fontWeight="bold">50%</SvgText>
                <SvgText x="0" y="118" fill="#94A3B8" fontSize="9" fontWeight="bold">0%</SvgText>

                {/* Area and Line */}
                <Path d={`M${bedData[0].cx},${bedData[0].cy} L${bedData[1].cx},${bedData[1].cy} L${bedData[2].cx},${bedData[2].cy} L${bedData[3].cx},${bedData[3].cy} L${bedData[4].cx},${bedData[4].cy} L${bedData[5].cx},${bedData[5].cy} L${bedData[6].cx},${bedData[6].cy} L330,120 L30,120 Z`} fill="url(#greenGrad)" />
                <Path d={`M${bedData[0].cx},${bedData[0].cy} L${bedData[1].cx},${bedData[1].cy} L${bedData[2].cx},${bedData[2].cy} L${bedData[3].cx},${bedData[3].cy} L${bedData[4].cx},${bedData[4].cy} L${bedData[5].cx},${bedData[5].cy} L${bedData[6].cx},${bedData[6].cy}`} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Points and Tooltips */}
                {bedData.map((pt, i) => (
                  <G key={`bed-${i}`}>
                    {/* Circle */}
                    <Circle 
                      cx={pt.cx} 
                      cy={pt.cy} 
                      r={activeBedPoint === i ? 6 : 4} 
                      fill={activeBedPoint === i ? "#10B981" : "white"} 
                      stroke={activeBedPoint === i ? "white" : "#10B981"} 
                      strokeWidth="2" 
                    />
                    {/* Invisible touch target */}
                    <Circle 
                      cx={pt.cx} cy={pt.cy} r="30" fill="transparent" 
                      onPress={() => setActiveBedPoint(i)}
                    />
                    {/* Tooltip */}
                    {activeBedPoint === i && (
                      <G>
                        <Rect x={pt.cx - 15} y={pt.cy - 24} width="30" height="16" rx="4" fill="#10B981" />
                        <Path d={`M${pt.cx - 4},${pt.cy - 8} L${pt.cx + 4},${pt.cy - 8} L${pt.cx},${pt.cy - 4} Z`} fill="#10B981" />
                        <SvgText x={pt.cx} y={pt.cy - 13} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">{pt.val}</SvgText>
                      </G>
                    )}
                  </G>
                ))}
              </Svg>
            </View>
            <View className="flex-row justify-between pl-8 mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <Text key={d} className={`text-[9px] ${activeBedPoint === i ? 'text-brand-navy font-black' : 'text-slate-400 font-bold'}`}>{d}</Text>
              ))}
            </View>
          </View>

          {/* OPD Traffic */}
          <View className="w-full bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm relative overflow-hidden">
            <View className="flex-row items-center justify-between mb-1 relative z-10">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-md bg-blue-50 items-center justify-center mr-2 border border-blue-100">
                  <MaterialCommunityIcons name="account-group" size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-xs">OPD Traffic</Text>
                  <Text className="text-blue-500 text-[9px] font-bold">This Week</Text>
                </View>
              </View>
              <Text className="text-slate-400 text-[8px] font-bold">(Patients Daily)</Text>
            </View>
            
            <View className="h-32 w-full mt-4 relative">
              <Svg height="100%" width="100%" viewBox="0 0 350 140">
                {/* Grid Lines */}
                <Path d="M0,20 L350,20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,45 L350,45" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,70 L350,70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,95 L350,95" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,120 L350,120" stroke="#E2E8F0" strokeWidth="1" />

                {/* Y-Axis labels */}
                <SvgText x="0" y="24" fill="#94A3B8" fontSize="9" fontWeight="bold">2K</SvgText>
                <SvgText x="0" y="49" fill="#94A3B8" fontSize="9" fontWeight="bold">1.5K</SvgText>
                <SvgText x="0" y="74" fill="#94A3B8" fontSize="9" fontWeight="bold">1K</SvgText>
                <SvgText x="0" y="99" fill="#94A3B8" fontSize="9" fontWeight="bold">500</SvgText>
                <SvgText x="0" y="118" fill="#94A3B8" fontSize="9" fontWeight="bold">0</SvgText>

                {/* Bars & Interactivity */}
                {opdData.map((bar, i) => (
                  <G key={`opd-${i}`}>
                    {/* Background invisible bar for touch */}
                    <Rect x={bar.cx - 15} y="20" width="30" height="100" fill="transparent" onPress={() => setActiveOpdPoint(i)} />
                    
                    <Rect 
                      x={bar.cx - 8} 
                      y={bar.yTop} 
                      width="16" 
                      height={bar.h} 
                      rx="4" 
                      fill={activeOpdPoint === i ? "#2563EB" : "#3B82F6"} 
                    />
                    
                    {/* Tooltip */}
                    {activeOpdPoint === i && (
                      <G>
                        <Rect x={bar.cx - 18} y={bar.yTop - 22} width="36" height="16" rx="4" fill="#2563EB" />
                        <Path d={`M${bar.cx - 4},${bar.yTop - 6} L${bar.cx + 4},${bar.yTop - 6} L${bar.cx},${bar.yTop - 2} Z`} fill="#2563EB" />
                        <SvgText x={bar.cx} y={bar.yTop - 11} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">{bar.val}</SvgText>
                      </G>
                    )}
                  </G>
                ))}
              </Svg>
            </View>
            <View className="flex-row justify-between pl-8 pr-3 mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <Text key={d} className={`text-[9px] ${activeOpdPoint === i ? 'text-blue-600 font-black' : 'text-slate-400 font-bold'}`}>{d}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 14-DAY FORECAST */}
        <View className="px-4 mb-5">
          <View className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm relative overflow-hidden">
            <View className="flex-row items-center mb-4 relative z-10">
              <View className="w-8 h-8 rounded-xl bg-purple-100 items-center justify-center mr-3 border border-purple-200">
                <MaterialCommunityIcons name="virus" size={16} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-brand-navy font-bold text-xs">14-Day Vector Incidence Forecast</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2.5 h-1 bg-purple-500 rounded-full mr-1.5"></View>
                  <Text className="text-slate-500 text-[8px] font-bold mr-4">Predicted Cases</Text>
                  <View className="w-2.5 h-1 bg-purple-100 rounded-full mr-1.5"></View>
                  <Text className="text-slate-500 text-[8px] font-bold">Confidence Range</Text>
                </View>
              </View>
            </View>

            <View className="h-40 w-full relative">
              <Svg height="100%" width="100%" viewBox="0 0 350 160">
                <Defs>
                  <SvgLinearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.25" />
                    <Stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#C4B5FD" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#C4B5FD" stopOpacity="0.1" />
                  </SvgLinearGradient>
                </Defs>

                {/* Y-Axis */}
                <SvgText x="0" y="24" fill="#94A3B8" fontSize="9" fontWeight="bold">200</SvgText>
                <SvgText x="0" y="49" fill="#94A3B8" fontSize="9" fontWeight="bold">150</SvgText>
                <SvgText x="0" y="74" fill="#94A3B8" fontSize="9" fontWeight="bold">100</SvgText>
                <SvgText x="0" y="99" fill="#94A3B8" fontSize="9" fontWeight="bold">50</SvgText>
                <SvgText x="0" y="124" fill="#94A3B8" fontSize="9" fontWeight="bold">0</SvgText>

                <Path d="M20,20 L350,20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M20,45 L350,45" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M0,70 L350,70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M20,95 L350,95" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                <Path d="M20,120 L350,120" stroke="#E2E8F0" strokeWidth="1" />

                <Path d="M30,110 Q55,100 80,115 T130,95 T180,105 T230,75 T280,85 T340,60 L340,120 L30,120 Z" fill="url(#purpleGrad)" />
                <Path d="M30,110 Q55,100 80,115 T130,95 T180,105 T230,75 T280,85 T340,60" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Interactive Points */}
                {forecastData.map((pt, i) => (
                  <G key={`fc-${i}`}>
                    <Circle 
                      cx={pt.cx} cy={pt.cy} r={activeForecastPoint === i ? 6 : 4} 
                      fill={activeForecastPoint === i ? "#8B5CF6" : "white"} 
                      stroke={activeForecastPoint === i ? "white" : "#8B5CF6"} strokeWidth="2" 
                    />
                    <Circle 
                      cx={pt.cx} cy={pt.cy} r="25" fill="transparent" 
                      onPress={() => setActiveForecastPoint(i)}
                    />
                    {activeForecastPoint === i && (
                      <G>
                        <Rect x={pt.cx - 15} y={pt.cy - 24} width="30" height="16" rx="4" fill="#8B5CF6" />
                        <Path d={`M${pt.cx - 4},${pt.cy - 8} L${pt.cx + 4},${pt.cy - 8} L${pt.cx},${pt.cy - 4} Z`} fill="#8B5CF6" />
                        <SvgText x={pt.cx} y={pt.cy - 13} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">{pt.val}</SvgText>
                      </G>
                    )}
                  </G>
                ))}
              </Svg>
            </View>

            <View className="flex-row justify-between pl-6 pr-1 mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((d, i) => (
                <Text key={d} className={`text-[7px] ${activeForecastPoint === i ? 'text-purple-600 font-black' : 'text-slate-400 font-bold'}`}>Day {d}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* BOTTOM 3 CARDS */}
        <View className="pl-4 pr-0 mb-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible pb-2" contentContainerStyle={{ paddingRight: 16 }}>
            
            <View className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm w-44 mr-4">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[10px]">Top Disease Alerts</Text>
                  <Text className="text-slate-400 text-[8px]">Last 7 Days</Text>
                </View>
              </View>

              <View className="space-y-3 mb-4">
                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-brand-navy font-bold text-[9px]">Dengue</Text>
                    <Text className="text-brand-navy font-black text-[9px]">{selectedFormat === 'Weekly Report' ? '342' : '128'}</Text>
                  </View>
                  <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <View className="h-full bg-red-500 w-[85%] rounded-full"></View>
                  </View>
                </View>

                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-brand-navy font-bold text-[9px]">Malaria</Text>
                    <Text className="text-brand-navy font-black text-[9px]">{selectedFormat === 'Weekly Report' ? '120' : '56'}</Text>
                  </View>
                  <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <View className="h-full bg-orange-500 w-[45%] rounded-full"></View>
                  </View>
                </View>

                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-brand-navy font-bold text-[9px]">Chikungunya</Text>
                    <Text className="text-brand-navy font-black text-[9px]">34</Text>
                  </View>
                  <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <View className="h-full bg-amber-500 w-[25%] rounded-full"></View>
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-brand-navy font-bold text-[9px]">Typhoid</Text>
                    <Text className="text-brand-navy font-black text-[9px]">12</Text>
                  </View>
                  <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <View className="h-full bg-emerald-500 w-[10%] rounded-full"></View>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                className="flex-row justify-between items-center mt-auto pt-3 border-t border-slate-50 active:opacity-50"
                onPress={() => {
                  import('expo-router').then(({ router }) => {
                    router.push('/(tabs)/situation-room?showAllTrends=true');
                  });
                }}
              >
                <Text className="text-red-500 font-bold text-[10px]">View All Alerts</Text>
                <Feather name="chevron-right" size={12} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm w-44 mr-4">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="flask-outline" size={16} color="#8B5CF6" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[10px]">Lab Utilization</Text>
                  <Text className="text-slate-400 text-[8px]">This Week</Text>
                </View>
              </View>
              
              <View className="items-center justify-center mt-2 mb-4 relative h-24">
                <Svg height="100" width="100" viewBox="0 0 64 64" className="absolute">
                  <Circle cx="32" cy="32" r="28" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                  <Circle cx="32" cy="32" r="28" stroke="#8B5CF6" strokeWidth="8" fill="none" strokeDasharray="175.93" strokeDashoffset="49.26" strokeLinecap="round" transform="rotate(-90 32 32)" />
                </Svg>
                <View className="items-center justify-center z-10">
                  <Text className="text-brand-navy font-black text-2xl leading-tight">72<Text className="text-xs">%</Text></Text>
                  <Text className="text-slate-400 text-[8px] font-bold">Utilization</Text>
                </View>
              </View>

              <View className="flex-row justify-between mt-auto">
                <View className="items-center">
                  <Text className="text-brand-navy font-black text-xl leading-tight">24</Text>
                  <Text className="text-slate-400 text-[8px] font-bold">Tests Done</Text>
                </View>
                <View className="w-[1px] bg-slate-100 h-full mx-2"></View>
                <View className="items-center">
                  <Text className="text-brand-navy font-black text-xl leading-tight">33</Text>
                  <Text className="text-slate-400 text-[8px] font-bold">Capacity</Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm w-44">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="shield-check-outline" size={16} color="#10B981" />
                </View>
                <View>
                  <Text className="text-brand-navy font-bold text-[10px]">Report Health Score</Text>
                  <Text className="text-slate-400 text-[8px]">Overall Performance</Text>
                </View>
              </View>
              
              <View className="items-center justify-center mt-2 relative overflow-hidden h-20 mb-6">
                <Svg height="100" width="100" viewBox="0 0 100 50">
                  <Path d="M10,50 A40,40 0 0,1 90,50" stroke="#F1F5F9" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <Path d="M10,50 A40,40 0 0,1 90,50" stroke="#10B981" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="22.6" />
                </Svg>
                <View className="absolute bottom-1 items-center justify-center w-full">
                  <Text className="text-brand-navy font-black text-3xl leading-tight">82<Text className="text-sm">%</Text></Text>
                  <Text className="text-emerald-500 text-[10px] font-bold">Good</Text>
                </View>
                <Text className="absolute bottom-0 left-2 text-slate-400 text-[8px] font-bold">0%</Text>
                <Text className="absolute bottom-0 right-2 text-slate-400 text-[8px] font-bold">100%</Text>
              </View>

              <TouchableOpacity 
                className="flex-row justify-between items-center mt-auto pt-3 border-t border-slate-50 active:opacity-50"
                onPress={() => Alert.alert('Health Score Breakdown', 'Showing detailed performance metrics...')}
              >
                <Text className="text-emerald-500 font-bold text-[10px]">See Score Breakdown</Text>
                <Feather name="chevron-right" size={12} color="#10B981" />
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}
