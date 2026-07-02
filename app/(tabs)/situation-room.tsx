import React, { useState, useEffect, useRef } from 'react';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Pattern } from 'react-native-svg';
import { View, Text, ScrollView, FlatList, Pressable, useWindowDimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import MetricCard from '@/components/ui/cards/MetricCard';
import AlertCard from '@/components/ui/cards/AlertCard';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import Badge from '@/components/ui/badges/Badge';
import Divider from '@/components/ui/layout/Divider';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';
import ErrorState from '@/components/ui/feedback/ErrorState';
import { LinearGradient } from 'expo-linear-gradient';

import { dummyAlerts } from '@/dummy/alerts';
import { dummyNotifications } from '@/dummy/notifications';
import { AIRecommendation } from '@/shared/types/ai';

const generateSparkline = (data: number[], width: number, height: number) => {
  if (!data || data.length === 0) return { path: '', areaPath: '', lastPoint: { x: 0, y: 0 } };
  
  // Adding padding to min and max so the chart doesn't touch the very top/bottom edges
  const min = Math.min(...data) - (Math.max(...data) * 0.1); 
  const max = Math.max(...data) + (Math.max(...data) * 0.1);
  const range = (max - min) || 1;
  
  // Leave 4 units on the left and 6 units on the right so the dot is never clipped
  const paddingLeft = 4;
  const paddingRight = 6;
  const stepX = (width - paddingLeft - paddingRight) / (data.length - 1);
  
  const points = data.map((val, i) => {
    const x = paddingLeft + (i * stepX);
    // Invert Y because SVG 0,0 is top-left
    const y = height - ((val - min) / range) * height;
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return { path, areaPath, lastPoint: points[points.length - 1] };
};

export default function SituationRoomScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const carouselWidth = width - 44;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const alerts = dummyAlerts;
  
  // Detailed Dynamic Dummy Data for Sparklines (To be replaced with Firebase data)
  // Generating a detailed trend that ends precisely at 84 and 12
  const telemetryData = [65, 62, 58, 55, 60, 59, 63, 61, 58, 50, 55, 60, 68, 70, 69, 72, 75, 78, 80, 82, 80, 83, 84];
  const aiRecData = [4, 4, 3, 5, 4, 6, 5, 5, 4, 7, 6, 8, 7, 7, 6, 9, 8, 10, 9, 11, 10, 11, 12];
  
  const telemetrySparkline = generateSparkline(telemetryData, 100, 35); // 35 height to leave room
  const aiSparkline = generateSparkline(aiRecData, 100, 35);

  // Simulation for DHO approval actions
  const [activeMissions, setActiveMissions] = useState<AIRecommendation[]>([
    {
      id: 'm_rec1',
      title: 'Outbreak Reallocation',
      sourceFacility: 'Dharampur PHC',
      targetFacility: 'Rampur Kalan PHC',
      item: 'Dengue NS1 Test Kits',
      quantity: 50,
      confidence: 94,
      reasoning: 'Dengue cases at Rampur Kalan PHC are surging. Dharampur PHC currently holds 200 excess NS1 kits with low local disease prevalence.',
      timestamp: '2026-06-29T10:00:00Z',
    }
  ]);

  const [commandQueue, setCommandQueue] = useState([
    { id: 'q1', item: 'Paracetamol 500mg', qty: 500, status: 'In Transit', ETA: '2 hrs' },
    { id: 'q2', item: 'Amoxicillin 250mg', qty: 200, status: 'Approved', ETA: 'Tomorrow' },
  ]);

  const carouselRef = useRef<FlatList>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto sliding carousel logic
  useEffect(() => {
    if (alerts.length === 0) return;
    const interval = setInterval(() => {
      try {
        const nextIndex = (carouselIndex + 1) % alerts.length;
        setCarouselIndex(nextIndex);
        carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      } catch {
        // Safe fail on rendering ticks
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselIndex, alerts.length]);

  useEffect(() => {
    // Simulate loading on mount
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveMission = (id: string) => {
    const mission = activeMissions.find(m => m.id === id);
    if (mission) {
      setActiveMissions(prev => prev.filter(m => m.id !== id));
      setCommandQueue(prev => [
        ...prev,
        { id: mission.id, item: mission.item, qty: mission.quantity, status: 'Preparing Dispatch', ETA: '6 hrs' }
      ]);
    }
  };

  const diseases = [
    { name: 'Dengue', rate: '+18%', risk: 'HIGH', color: '#EF4444' },
    { name: 'Malaria', rate: '-4%', risk: 'LOW', color: '#10B981' },
    { name: 'Chikungunya', rate: '+2%', risk: 'MED', color: '#F59E0B' },
    { name: 'Seasonal Influenza', rate: '+12%', risk: 'MED', color: '#F59E0B' },
    { name: 'Acute Diarrheal', rate: '+22%', risk: 'HIGH', color: '#EF4444' },
    { name: 'Typhoid', rate: '0%', risk: 'LOW', color: '#10B981' }
  ];

  if (loading) {
    return <LoadingSpinner label="Loading Situation Room telemetry..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Unable to connect to active monitoring networks." 
        onRetry={() => {
          setError(false);
          setLoading(true);
          setTimeout(() => setLoading(false), 800);
        }}
      />
    );
  }

  return (
    <ScreenContainer padding={false} withSafeArea={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 130 }} className="bg-[#F2F7FD]">
        
        {/* Netra Daily Briefing (Hero Card) */}
        <View className="mb-2.5">
          <LinearGradient
            colors={['#E8F2FC', '#D4E6FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 28, overflow: 'hidden' }}
            className="py-24 px-7 shadow-sm border border-white/60 relative"
          >
            {/* Decorative integrated illustration asset on the right */}
            <View className="absolute right-[-15] top-0 bottom-0 w-[60%] z-0">
               <Image 
                 source={require('../../assets/images/hero_illustration.png')}
                 style={{ width: '100%', height: '100%' }}
                 resizeMode="contain"
               />
            </View>
            
            {/* Text content on the left shifted further right and pushed down */}
            <View className="z-10 w-[56%] ml-3 mt-5">
              <Text className="text-brand-navy font-black text-[26px] mb-4 tracking-tight ml-1">Netra Daily Briefing</Text>
              
              <View className="gap-1 mb-5 ml-1">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-2.5 shadow-sm shadow-blue-500/10">
                    <Feather name="home" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>3 Districts under watch</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2.5 shadow-sm shadow-red-500/10">
                    <Feather name="alert-triangle" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>12 Outbreak alerts</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-yellow-500 items-center justify-center mr-2.5 shadow-sm shadow-yellow-500/10">
                    <Feather name="battery" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>8 Medicine shortages</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-2.5 shadow-sm shadow-green-500/10">
                    <Feather name="activity" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>5 PHCs need attention</Text>
                </View>
              </View>
              
              <Pressable className="self-start rounded-full bg-[#1A63C6] px-5 py-2.5 mb-6 flex-row items-center shadow-sm shadow-blue-500/50">
                <Text className="text-white text-[12px] font-bold mr-2">View Details</Text>
                <View className="bg-white rounded-full p-0.5">
                   <Feather name="arrow-right" size={11} color="#1A63C6" />
                </View>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Row of Metrics: Telemetry Score & AI Recommendations */}
        <View className="flex-row gap-3 px-1 mb-8">
          {/* Telemetry Score */}
          <View className="flex-1 bg-white rounded-[24px] p-4 pt-5 pb-5 shadow-sm shadow-blue-500/10 border border-blue-200 overflow-hidden relative">
             <View className="flex-row items-start justify-between z-10 mb-4">
               {/* Left: Icon */}
               <View className="w-[46px] h-[46px] rounded-full bg-blue-600 items-center justify-center border-[4px] border-blue-50 shadow-md shadow-blue-500/30">
                 <Feather name="activity" size={20} color="white" />
               </View>
               {/* Right: Text Stack */}
               <View className="flex-1 ml-3 pt-0.5">
                 <Text className="text-slate-800 font-bold text-[10px] mb-0.5 tracking-wide" numberOfLines={1}>Telemetry Score</Text>
                 <Text className="text-brand-navy font-black text-[26px] leading-none mb-1.5">84%</Text>
                 <View className="flex-row items-center">
                   <Feather name="arrow-up-right" size={11} color="#16A34A" />
                   <Text className="text-green-600 font-extrabold text-[10.5px] ml-1">Good</Text>
                 </View>
               </View>
             </View>
             {/* Faint Sparkline Background Approximation */}
             <View className="absolute bottom-0 left-0 right-0 h-[45px] overflow-hidden rounded-b-[24px]">
               <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                 <Defs>
                   <SvgLinearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                     <Stop offset="0" stopColor="#2563EB" stopOpacity="0.35" />
                     <Stop offset="1" stopColor="#2563EB" stopOpacity="0.02" />
                   </SvgLinearGradient>
                   <Pattern id="stripesBlue" width="6" height="6" patternUnits="userSpaceOnUse">
                     <Path d="M0,0 L0,6" stroke="#2563EB" strokeWidth="1" strokeOpacity="0.15" />
                   </Pattern>
                 </Defs>
                 {/* Dynamic Area fill */}
                 <Path d={telemetrySparkline.areaPath} fill="url(#gradBlue)" />
                 {/* Pattern fill overlay */}
                 <Path d={telemetrySparkline.areaPath} fill="url(#stripesBlue)" />
                 {/* Shadow Stroke for Depth */}
                 <Path d={telemetrySparkline.path} fill="none" stroke="#1E40AF" strokeWidth="4" strokeOpacity="0.15" strokeLinejoin="round" transform="translate(0, 3)" />
                 {/* Dynamic Stroke line */}
                 <Path d={telemetrySparkline.path} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
               </Svg>
               {/* Perfectly Round Dot via React Native View */}
               <View 
                 style={{
                   position: 'absolute',
                   width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#2563EB',
                   left: `${telemetrySparkline.lastPoint.x}%`,
                   top: `${(telemetrySparkline.lastPoint.y / 40) * 100}%`,
                   transform: [{ translateX: -3.5 }, { translateY: -3.5 }]
                 }} 
               />
             </View>
          </View>

          {/* AI Recommendations */}
          <View className="flex-1 bg-white rounded-[24px] p-4 pt-5 pb-5 shadow-sm shadow-green-500/10 border border-green-200 overflow-hidden relative">
             <View className="flex-row items-start justify-between z-10 mb-4">
               {/* Left: Icon */}
               <View className="w-[46px] h-[46px] rounded-full bg-green-600 items-center justify-center border-[4px] border-green-50 shadow-md shadow-green-500/30">
                 <Feather name="check-circle" size={20} color="white" />
               </View>
               {/* Right: Text Stack */}
               <View className="flex-1 ml-3 pt-0.5">
                 <Text className="text-slate-800 font-bold text-[10px] mb-0.5 tracking-wide" numberOfLines={1}>AI Recommendations</Text>
                 <Text className="text-brand-navy font-black text-[26px] leading-none mb-1.5">{aiRecData[aiRecData.length - 1]}</Text>
                 <View className="flex-row items-center">
                   <Feather name="arrow-up-right" size={11} color="#16A34A" />
                   <Text className="text-green-600 font-extrabold text-[10.5px] ml-1">New</Text>
                 </View>
               </View>
             </View>
             {/* Faint Sparkline Background Approximation */}
             <View className="absolute bottom-0 left-0 right-0 h-[45px] overflow-hidden rounded-b-[24px]">
               <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                 <Defs>
                   <SvgLinearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                     <Stop offset="0" stopColor="#16A34A" stopOpacity="0.35" />
                     <Stop offset="1" stopColor="#16A34A" stopOpacity="0.02" />
                   </SvgLinearGradient>
                   <Pattern id="stripesGreen" width="6" height="6" patternUnits="userSpaceOnUse">
                     <Path d="M0,0 L0,6" stroke="#16A34A" strokeWidth="1" strokeOpacity="0.15" />
                   </Pattern>
                 </Defs>
                 {/* Dynamic Area fill */}
                 <Path d={aiSparkline.areaPath} fill="url(#gradGreen)" />
                 {/* Pattern fill overlay */}
                 <Path d={aiSparkline.areaPath} fill="url(#stripesGreen)" />
                 {/* Shadow Stroke for Depth */}
                 <Path d={aiSparkline.path} fill="none" stroke="#14532D" strokeWidth="4" strokeOpacity="0.15" strokeLinejoin="round" transform="translate(0, 3)" />
                 {/* Dynamic Stroke line */}
                 <Path d={aiSparkline.path} fill="none" stroke="#22C55E" strokeWidth="2" strokeLinejoin="round" />
               </Svg>
               {/* Perfectly Round Dot via React Native View */}
               <View 
                 style={{
                   position: 'absolute',
                   width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16A34A',
                   left: `${aiSparkline.lastPoint.x}%`,
                   top: `${(aiSparkline.lastPoint.y / 40) * 100}%`,
                   transform: [{ translateX: -3.5 }, { translateY: -3.5 }]
                 }} 
               />
             </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
