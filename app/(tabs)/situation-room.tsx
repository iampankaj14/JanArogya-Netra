import ErrorState from '@/components/ui/feedback/ErrorState';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, Path, Pattern, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import PHCHomeDashboard from '@/components/features/dashboard/PHCHomeDashboard';
import { useAuth } from '@/context/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useDashboard } from '@/hooks/useDashboard';
import { useTranslation } from '@/hooks/useTranslation';
import { localPHCs, localLogistics, localDiseaseTrends, localTelemetryAudits, localRecommendations } from '@/services/repositories/localDb';

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

  const { authState } = useAuth();
  const { t } = useTranslation();
  const { district, alerts: hookAlerts, recommendations: hookRecommendations, loading: dashboardLoading, refetch } = useDashboard();
  const { approveAlert, rejectAlert } = useAlerts();

  const isBMO = authState?.role === 'BMO';
  const isPHC = authState?.role === 'PHC';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const alerts = hookAlerts;
  const [showAllTrends, setShowAllTrends] = useState(false);
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  
  const assignedFacilityId = authState?.facilityId || 'phc_barola';
  const blockPhcs = isBMO ? localPHCs.filter(p => p.block === assignedFacilityId) : localPHCs;
  const averageHealthScore = blockPhcs.length ? Math.round(blockPhcs.reduce((acc, p) => acc + p.healthScore, 0) / blockPhcs.length) : 0;

  const [activeMissions, setActiveMissions] = useState(localRecommendations);
  const [commandQueue, setCommandQueue] = useState(localLogistics);
  const [telemetryAudits, setTelemetryAudits] = useState(localTelemetryAudits);

  const { showAllTrends: showAllTrendsParam } = useLocalSearchParams();
  useEffect(() => {
    if (showAllTrendsParam === 'true') {
      setShowAllTrends(true);
    }
  }, [showAllTrendsParam]);

  useEffect(() => {
    if (!dashboardLoading) {
      setLoading(false);
    }
  }, [dashboardLoading]);

  // Dynamic Data for Sparklines
  // Generate a trend that ends precisely at the actual metrics
  const activeRecCount = activeMissions.length;
  
  const telemetryData = Array.from({ length: 23 }, (_, i) => {
    if (i === 22) return averageHealthScore;
    return Math.max(0, Math.min(100, averageHealthScore + (Math.sin(i) * 15) + (22-i)));
  });

  const aiRecData = Array.from({ length: 23 }, (_, i) => {
    if (i === 22) return activeRecCount;
    return Math.max(0, activeRecCount + Math.floor(Math.cos(i) * (activeRecCount * 0.3)) - Math.floor((22-i)/4));
  });

  const telemetrySparkline = generateSparkline(telemetryData, 100, 35); // 35 height to leave room
  const aiSparkline = generateSparkline(aiRecData, 100, 35);

  const blockPhcIds = blockPhcs.map(p => p.id);
  const filteredAlerts = isBMO ? alerts.filter(a => blockPhcIds.includes(a.facilityId)) : alerts;

  const filteredTelemetryAudits = isBMO 
    ? telemetryAudits.filter(a => blockPhcs.some(p => a.desc.includes(p.name) || a.desc.includes(p.id) || a.desc.includes(assignedFacilityId)))
    : telemetryAudits;

  // Dynamic Outbreaks Carousel derived from active alerts in DB
  const unresolvedOutbreaks = filteredAlerts
    .filter((a) => a.type === 'OUTBREAK' && !a.resolved)
    .map((a) => ({
      id: a.id,
      facilityId: a.facilityId,
      disease: a.title.replace(' Surge Warning', '').replace(' Warning', ''),
      location: a.facilityName,
      priority: a.priority === 'CRITICAL' ? 'High Priority (Outbreak)' : 'Medium Priority',
      cases: a.title.includes('Dengue') ? 28 : (a.title.includes('Diarrheal') ? 12 : 15),
      isEmergency: a.priority === 'CRITICAL',
    }));

  // Real-world AI Recommendations Data
  const aiRecommendations = activeMissions.filter((r) => isBMO ? (blockPhcIds.includes(r.sourceFacility) || blockPhcIds.includes(r.targetFacility)) : true);

  // Logistics requests (dynamic from DB)
  const logisticsRequests = isBMO ? commandQueue.filter(l => blockPhcs.some(p => l.from.includes(p.name) || l.from.includes(p.id) || l.to.includes(p.name) || l.to.includes(p.id) || l.from.includes(assignedFacilityId) || l.to.includes(assignedFacilityId))) : commandQueue;

  // Dynamic Data for Disease Trends
  const diseaseTrendsData = localDiseaseTrends;

  // Dynamic Image Mapping for Diseases
  const diseaseImages: Record<string, any> = {
    'Dengue': require('@/data/disease/dengue.png'),
    'Malaria': require('@/data/disease/malaria.png'),
    'Chikungunya': require('@/data/disease/chinungunya.png'),
    'Acute Diarrheal Disease (ADD)': require('@/data/disease/diarrhea.png'),
    'Typhoid': require('@/data/disease/typhois.png'),
    'Cholera': require('@/data/disease/cholera.png'),
    'Seasonal Influenza (Flu)': require('@/data/disease/influenza.png'),
    'Viral Fever': require('@/data/disease/fever.png'),
    'Acute Respiratory Infection (ARI)': require('@/data/disease/respiratory.png'),
    'Pneumonia': require('@/data/disease/pheumoina.png'),
  };

  // Auto-scroll logic for the carousel
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidthWithGap = width - 48 + 12;

  useEffect(() => {
    if (unresolvedOutbreaks.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % unresolvedOutbreaks.length;
        scrollViewRef.current?.scrollTo({ x: nextIndex * cardWidthWithGap, animated: true });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(intervalId);
  }, [cardWidthWithGap, unresolvedOutbreaks.length]);

  // Dynamic AI Decision Requests mapped from local activeMissions
  const aiDecisionRequests = aiRecommendations.map((r) => ({
    id: r.id,
    type: r.title,
    confidence: typeof r.confidence === 'number'
      ? (r.confidence > 1 ? r.confidence : r.confidence * 100).toFixed(1) + '%'
      : '94.0%',
    source: r.sourceFacility,
    target: r.targetFacility,
    reason: r.reasoning,
  }));

  // Auto-scroll logic for the AI carousel
  const aiScrollViewRef = useRef<ScrollView>(null);
  const [currentAiIndex, setCurrentAiIndex] = useState(0);

  useEffect(() => {
    if (aiDecisionRequests.length === 0) return;
    const aiIntervalId = setInterval(() => {
      setCurrentAiIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % aiDecisionRequests.length;
        aiScrollViewRef.current?.scrollTo({ x: nextIndex * cardWidthWithGap, animated: true });
        return nextIndex;
      });
    }, 4500);
    return () => clearInterval(aiIntervalId);
  }, [cardWidthWithGap, aiDecisionRequests.length]);

  const handleMomentumScrollEnd = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / cardWidthWithGap);
    if (index >= 0 && index < unresolvedOutbreaks.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

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
      
      const newLogisticsRequest = {
        id: `req-${Date.now()}`,
        from: mission.sourceFacility,
        to: mission.targetFacility,
        item: mission.item,
        quantity: mission.quantity,
        status: 'approved' as const,
        urgent: true
      };
      setCommandQueue(prev => [newLogisticsRequest, ...prev]);

      const newAudit = {
        id: `ta-${Date.now()}`,
        type: 'approved',
        icon: 'check',
        color: 'green',
        text: 'Redistribution Approved',
        desc: `${authState?.role} ${authState?.name || 'User'} approved transfer of ${mission.quantity} ${mission.item} to ${mission.targetFacility}.`,
        time: 'Just now'
      };
      setTelemetryAudits(prev => [newAudit, ...prev]);
    }
  };



  if (isPHC) {
    return <PHCHomeDashboard />;
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white px-6 py-12 justify-between">
        <View className="animate-pulse">
          {/* Header Skeleton */}
          <View className="flex-row justify-between items-center mb-8 mt-4">
            <View className="w-10 h-10 rounded-full bg-slate-200" />
            <View className="w-40 h-6 rounded-lg bg-slate-200" />
            <View className="w-10 h-10 rounded-full bg-slate-200" />
          </View>

          {/* Alert Banner Skeleton */}
          <View className="w-full h-24 rounded-3xl bg-slate-100 border border-slate-200/50 p-4 mb-6 justify-center">
            <View className="w-1/3 h-4 rounded bg-slate-200 mb-2" />
            <View className="w-2/3 h-3 rounded bg-slate-200" />
          </View>

          {/* Grid Cards Skeletons */}
          <View className="flex-row flex-wrap -mx-2 mb-6">
            <View className="w-1/2 px-2 mb-4">
              <View className="h-32 rounded-[24px] bg-slate-100 border border-slate-200/50 p-4" />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="h-32 rounded-[24px] bg-slate-100 border border-slate-200/50 p-4" />
            </View>
          </View>

          {/* Horizontal List Skeletons */}
          <View className="w-full h-32 rounded-3xl bg-slate-100 border border-slate-200/50 p-4">
            <View className="w-1/4 h-4 rounded bg-slate-200 mb-4" />
            <View className="w-full h-12 rounded-xl bg-slate-200" />
          </View>
        </View>

        <Text className="text-center text-slate-400 text-xs font-semibold tracking-wider animate-pulse uppercase">
          Initializing telemetry feed...
        </Text>
      </View>
    );
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
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{blockPhcs.length} PHCs under watch</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2.5 shadow-sm shadow-red-500/10">
                    <Feather name="alert-triangle" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{filteredAlerts.filter(a => a.type === 'OUTBREAK' && !a.resolved).length} Outbreak alerts</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-yellow-500 items-center justify-center mr-2.5 shadow-sm shadow-yellow-500/10">
                    <Feather name="battery" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{filteredAlerts.filter(a => a.type === 'SHORTAGE' && !a.resolved).length} Medicine shortages</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-2.5 shadow-sm shadow-green-500/10">
                    <Feather name="activity" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{filteredAlerts.filter(a => !a.resolved).length} Alerts need attention</Text>
                </View>
              </View>

              <Pressable 
                className="self-start rounded-full bg-[#1A63C6] px-5 py-2.5 mb-6 flex-row items-center shadow-sm shadow-blue-500/50"
                onPress={() => router.push('/reports')}
              >
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
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isBMO ? 'Block Score' : 'District Score'}</Text>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-4xl font-black text-slate-800 tracking-tighter">{averageHealthScore}</Text>
                  <Text className="text-sm font-bold text-slate-400 ml-1">/100</Text>
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
                <Text className="text-brand-navy font-black text-[26px] leading-none mb-1.5">{aiRecommendations.length}</Text>
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

        {/* Unresolved Outbreaks Carousel */}
        <View className="mb-8">
          <Text className="text-brand-navy font-extrabold text-lg mb-3 px-1">Unresolved Outbreaks</Text>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
            snapToInterval={cardWidthWithGap} // Card width + gap
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumScrollEnd}
          >
            {unresolvedOutbreaks.map((outbreak, index) => {
              return (
                <Pressable
                  key={outbreak.id}
                  onPress={() => router.push({ pathname: '/(tabs)/phc-detail', params: { id: outbreak.facilityId } })}
                  style={{ width: width - 48 }}
                  className="bg-red-600 border-red-500 shadow-red-600/30 rounded-[24px] p-3 flex-row items-center border shadow-sm"
                >
                  {/* Left Icon Container */}
                  <View className="w-[52px] h-[52px] items-center justify-center mr-1">
                    <Image
                      source={diseaseImages[outbreak.disease] || require('@/data/disease/fever.png')}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Middle Content */}
                  <View className="flex-1 px-3 justify-center">
                    <Text className="text-white font-extrabold text-[15px] mb-0.5" numberOfLines={1}>{outbreak.disease}</Text>
                    <Text className="text-red-100 font-semibold text-[10px] mb-1.5" numberOfLines={1}>{outbreak.location}</Text>
                    <View className="flex-row items-center bg-red-500 self-start px-2 py-0.5 rounded-full shadow-sm shadow-black/10">
                      <MaterialIcons name="local-fire-department" size={11} color="#FFFFFF" />
                      <Text className="text-white font-bold text-[9.5px] ml-1">{outbreak.priority}</Text>
                    </View>
                  </View>

                  {/* Right Cases Box */}
                  <View className="bg-red-500 border-red-400 rounded-[14px] w-[50px] py-1.5 items-center justify-center border mr-2 shadow-sm shadow-black/10">
                    <Text className="text-white font-black text-[22px] leading-tight">{outbreak.cases}</Text>
                    <Text className="text-red-100 font-bold text-[9px] mt-0.5">Cases</Text>
                  </View>

                  <Feather name="chevron-right" size={20} color="#FFFFFF" />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center items-center mt-4 space-x-1.5 gap-1.5">
            {unresolvedOutbreaks.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-4 bg-red-600' : 'w-1.5 bg-red-200'}`}
              />
            ))}
          </View>
        </View>

        {/* Disease Trends Section */}
        <View className="mb-8 px-1">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-brand-navy font-extrabold text-lg">Disease Trends</Text>
            <Pressable onPress={() => setShowAllTrends(!showAllTrends)} className="flex-row items-center py-1 px-2">
              <Text className="text-blue-600 font-bold text-xs mr-1">{showAllTrends ? 'Show Less' : 'View All'}</Text>
              <Feather name={showAllTrends ? 'chevron-up' : 'chevron-down'} size={14} color="#2563EB" />
            </Pressable>
          </View>

          <View className="bg-white rounded-[24px] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden px-4 py-2">
            {diseaseTrendsData.slice(0, showAllTrends ? diseaseTrendsData.length : 4).map((trend, index) => {
              // Generate sparkline with smaller width/height matching the layout
              const sparkline = generateSparkline(trend.data, 90, 30);
              return (
                <View key={trend.id} className={`flex-row items-center py-4 ${index !== 0 ? 'border-t border-slate-50' : ''}`}>

                  {/* Left Image Icon */}
                  <View className="w-10 h-10 items-center justify-center mr-3">
                    <Image
                      source={diseaseImages[trend.disease] || require('@/data/disease/fever.png')}
                      style={{ width: 34, height: 34, borderRadius: 17 }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Disease Name */}
                  <View className="w-[85px]">
                    <Text className="text-brand-navy font-extrabold text-[14px]" numberOfLines={1}>{trend.disease}</Text>
                  </View>

                  {/* Sparkline Graph */}
                  <View className="flex-1 h-[30px] mx-2 relative">
                    <Svg height="100%" width="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <Defs>
                        <SvgLinearGradient id={`grad-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor={trend.color} stopOpacity="0.25" />
                          <Stop offset="1" stopColor={trend.color} stopOpacity="0.0" />
                        </SvgLinearGradient>
                      </Defs>
                      <Path d={sparkline.areaPath} fill={`url(#grad-${trend.id})`} />
                      <Path d={sparkline.path} fill="none" stroke={trend.color} strokeWidth="2" strokeLinejoin="round" />
                    </Svg>
                    {/* Perfectly Round Dot via View */}
                    <View
                      style={{
                        position: 'absolute',
                        width: 5, height: 5, borderRadius: 2.5, backgroundColor: trend.color,
                        left: `${sparkline.lastPoint.x}%`,
                        top: `${(sparkline.lastPoint.y / 40) * 100}%`,
                        transform: [{ translateX: -2.5 }, { translateY: -2.5 }]
                      }}
                    />
                  </View>

                  {/* Vertical Dashed Divider */}
                  <View className="h-[30px] border-l border-dashed border-slate-200 mx-2" />

                  {/* Stats Area */}
                  <View className="items-center w-[45px]">
                    <Text className="text-brand-navy font-black text-[16px] leading-tight">{trend.cases}</Text>
                    <Text className="text-slate-500 font-bold text-[9px]">Cases</Text>
                  </View>

                  {/* Trend Pill */}
                  <View className="ml-1 px-1.5 py-1 rounded-full flex-row items-center justify-center w-[48px]" style={{ backgroundColor: trend.bg }}>
                    <Text style={{ color: trend.color }} className="font-extrabold text-[9px]">{trend.trend}</Text>
                    <Feather name={trend.isUp ? 'arrow-up' : 'arrow-down'} size={10} color={trend.color} style={{ marginLeft: 1 }} />
                  </View>

                </View>
              );
            })}
          </View>
        </View>

        {/* Active Netra Decision Requests Section */}
        <View className="mb-8 px-1">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-brand-navy font-extrabold text-lg">Active Netra Decision Requests</Text>
          </View>

          {aiDecisionRequests.length === 0 ? (
            <View className="bg-green-50 rounded-[24px] border border-green-100 p-6 items-center justify-center mt-2 mb-4">
              <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-3">
                <Feather name="check-circle" size={24} color="#16A34A" />
              </View>
              <Text className="text-green-800 font-extrabold text-[15px] mb-1">All Clear!</Text>
              <Text className="text-green-600 font-semibold text-center text-[12px]">No active recommendations. Everything is fine.</Text>
            </View>
          ) : (
            <ScrollView
              ref={aiScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0, gap: 12 }}
              snapToInterval={cardWidthWithGap}
              decelerationRate="fast"
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidthWithGap);
                setCurrentAiIndex(newIndex);
              }}
            >
              {aiDecisionRequests.map((request) => (
              <View
                key={request.id}
                style={{ width: cardWidthWithGap - 12 }}
                className="rounded-[24px] shadow-sm shadow-blue-200/50 border border-white/60 overflow-hidden bg-white"
              >
                <LinearGradient
                  colors={['#E8F2FC', '#D4E6FA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: '100%' }}
                >
                  <View className="p-4 relative">
                    {/* Header Row */}
                    <View className="flex-row justify-between items-center mb-4 relative z-10">
                      <View className="flex-row items-center">
                        {/* Glass Icon */}
                        <View className="w-10 h-10 rounded-[12px] bg-white/70 border border-white items-center justify-center mr-3">
                          <Feather name="cpu" size={18} color="#4F46E5" />
                        </View>
                        <View>
                          <Text className="text-slate-600 font-bold text-[11px] mb-0.5">Netra Recommendation</Text>
                          <Text className="text-brand-navy font-black text-[15px]">{request.type}</Text>
                        </View>
                      </View>
                      {/* Glass Pill */}
                      <View className="bg-white/70 border border-white px-2.5 py-1 rounded-full">
                        <Text className="text-blue-700 font-extrabold text-[10px]">{request.confidence} Conf.</Text>
                      </View>
                    </View>

                    {/* Facilities Flow */}
                    <View className="flex-row items-center justify-between mb-4 relative z-10">
                      {/* Source Facility Glass Card */}
                      <View className="bg-white/60 rounded-[16px] p-2 flex-1 flex-row items-center border border-white">
                        <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-2 border border-white">
                          <Feather name="home" size={14} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-500 font-bold text-[9px] mb-0.5">Source Facility</Text>
                          <Text className="text-brand-navy font-bold text-[11px]" numberOfLines={1}>{request.source}</Text>
                        </View>
                      </View>

                      {/* Arrow */}
                      <View className="w-6 items-center justify-center">
                        <Feather name="arrow-right" size={16} color="#2563EB" />
                      </View>

                      {/* Target Facility Glass Card */}
                      <View className="bg-white/60 rounded-[16px] p-2 flex-1 flex-row items-center border border-white">
                        <View className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center mr-2 border border-white">
                          <Feather name="home" size={14} color="#16A34A" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-500 font-bold text-[9px] mb-0.5">Target Facility</Text>
                          <Text className="text-brand-navy font-bold text-[11px]" numberOfLines={1}>{request.target}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Reasoning */}
                    <View className="mb-4 relative z-10">
                      <View className="flex-row items-center mb-1">
                        <Feather name="zap" size={12} color="#4F46E5" style={{ marginRight: 4 }} />
                        <Text className="text-indigo-600 font-black text-[10px] tracking-widest uppercase">REASONING</Text>
                        <Feather name="zap" size={12} color="#4F46E5" style={{ marginLeft: 4 }} />
                      </View>
                      <Text className="text-slate-700 font-semibold text-[11px] leading-relaxed pr-10" numberOfLines={2}>
                        {request.reason}
                      </Text>
                    </View>

                    {/* Action Buttons with Liquid Glass feel */}
                    <View className="flex-row gap-3 relative z-10">
                      <Pressable className="flex-1 py-3 rounded-xl border border-blue-400 items-center justify-center flex-row bg-white/40">
                        <Feather name="file-text" size={14} color="#2563EB" style={{ marginRight: 6 }} />
                        <Text className="text-blue-700 font-extrabold text-[12px]">View Details</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleApproveMission(request.id)}
                        className="flex-1 py-3 rounded-xl bg-blue-600/90 border border-blue-400 items-center justify-center flex-row shadow-lg shadow-blue-500/40"
                      >
                        <Feather name="check-circle" size={14} color="white" style={{ marginRight: 6 }} />
                        <Text className="text-white font-extrabold text-[12px]">Approve Request</Text>
                      </Pressable>
                    </View>
                  </View>
                </LinearGradient>
              </View>
              ))}
            </ScrollView>
          )}

          {aiDecisionRequests.length > 0 && (
            <View className="flex-row justify-center mt-4 mb-2 gap-1.5">
              {aiDecisionRequests.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentAiIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-blue-200'}`}
              />
            ))}
            </View>
          )}
        </View>

        {/* Logistics & Dispatch Queue */}
        <View className="mb-8 px-1">
          <View className="bg-white rounded-[24px] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <View className="px-4 py-2">
              {/* Header (Clickable for dropdown) */}
              <Pressable
                onPress={() => {
                  if (logisticsRequests.length > 3) {
                    setIsLogisticsOpen(!isLogisticsOpen);
                  }
                }}
                className="py-4 flex-row justify-between items-center relative z-10"
              >
                <Text className="text-brand-navy font-extrabold text-[15px]">Logistics & Dispatch Queue</Text>
                {logisticsRequests.length > 3 && (
                  <View className="flex-row items-center">
                    <Text className="text-blue-600 font-bold text-xs mr-1">{isLogisticsOpen ? 'Show Less' : 'View All'}</Text>
                    <Feather name={isLogisticsOpen ? "chevron-up" : "chevron-down"} size={16} color="#2563EB" />
                  </View>
                )}
              </Pressable>

              {/* Border line separating header from list */}
              <View className="border-t border-slate-100 mb-2 relative z-10" />

              {/* Items List */}
              <View className="pb-2 relative z-10">
                {(isLogisticsOpen ? logisticsRequests : logisticsRequests.slice(0, 3)).map((item, index) => {
                  const statusColors: Record<string, string> = {
                    'pending': '#F59E0B',
                    'approved': '#3B82F6',
                    'en_route': '#10B981',
                    'delivered': '#64748B'
                  };
                  return (
                    <View key={item.id} className="flex-row items-center mb-3">
                      <View className="flex-1">
                        <Text className="text-brand-navy font-bold text-[13px]">{item.item}</Text>
                        <Text className="text-slate-500 font-semibold text-[11px]">{item.from} → {item.to}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-brand-navy font-black text-[13px]">{item.quantity}</Text>
                        <Text style={{ color: statusColors[item.status] }} className="font-bold text-[10px] uppercase">{item.status}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Telemetry Audits */}
        <View className="mb-8 px-1">
          <Text className="text-brand-navy font-extrabold text-[15px] mb-3 ml-2">Recent Telemetry Audits</Text>
          <View className="bg-white rounded-[24px] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden p-4 relative">

            {/* Timeline Line */}
            <View className="absolute left-[27px] top-[40px] bottom-[40px] w-[2px] bg-slate-100" />

            {filteredTelemetryAudits.slice(0, 3).map((audit, i) => (
              <View key={audit.id} className={`flex-row items-center py-3 ${i !== Math.min(filteredTelemetryAudits.length, 3) - 1 ? 'border-b border-slate-50' : ''} relative`}>
                <View className="w-6 items-center justify-center bg-white z-10 mr-3">
                  <View className={`w-[18px] h-[18px] rounded-full bg-${audit.color}-500 items-center justify-center border-2 border-white`}>
                    <Feather name={audit.icon as any} size={10} color="white" />
                  </View>
                </View>

                <View className={`w-11 h-11 rounded-full bg-${audit.color}-50 items-center justify-center mr-3 border border-${audit.color}-100/50`}>
                  <Feather name="shield" size={16} color={audit.color === 'red' ? '#EF4444' : '#16A34A'} />
                </View>

                <View className="flex-1">
                  <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{audit.text}</Text>
                  <Text className="text-slate-500 font-semibold text-[11px] leading-relaxed pr-2">{audit.desc}</Text>
                </View>

                <View className="items-end pl-2">
                  <Text className="text-slate-400 font-bold text-[10px] mb-2">{audit.time}</Text>
                  <Feather name="chevron-right" size={14} color="#CBD5E1" />
                </View>
              </View>
            ))}

          </View>
        </View>

      </ScrollView>

    </ScreenContainer>
  );
}
