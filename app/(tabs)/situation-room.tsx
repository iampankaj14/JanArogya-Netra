import ErrorState from '@/components/ui/feedback/ErrorState';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, useWindowDimensions, View, Animated, Easing } from 'react-native';
import Svg, { Defs, Path, Pattern, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

import PHCHomeDashboard from '@/components/features/dashboard/PHCHomeDashboard';
import { useAuth } from '@/context/AuthContext';
import { useAlerts } from '@/hooks/useAlerts';
import { useDashboard } from '@/hooks/useDashboard';
import { useRoleScopedPHCs } from '@/hooks/usePHCs';
import { useTranslation } from '@/hooks/useTranslation';
import { reportsRepository } from '@/services/repositories/reportsRepository';
import { localLogistics, localTelemetryAudits } from '@/services/repositories/localDb';
import { DiseaseTrend } from '@/dummy/diseaseTrends';

const translateDynamic = (text: string, lang: string) => {
  if (lang !== 'hi' || !text) return text;
  
  const map: Record<string, string> = {
    // Facilities
    'PHC Badalpur': 'पीएचसी बादलपुर',
    'PHC Barola': 'पीएचसी बरौला',
    'Jewar PHC': 'जेवर पीएचसी',
    'District Hospital': 'जिला अस्पताल',
    'Dadri CHC': 'दादरी सीएचसी',
    'State Warehouse': 'राज्य गोदाम',
    'CHC Bhangel': 'सीएचसी भंगेल',
    'UPHC Surajpur': 'यूपीएचसी सूरजपुर',
    'PHC Bisrakh': 'पीएचसी बिसरख',
    
    // Diseases
    'Dengue': 'डेंगू',
    'Malaria': 'मलेरिया',
    'Chikungunya': 'चिकनगुनिया',
    'Acute Diarrheal Disease (ADD)': 'तीव्र डायरिया रोग (ADD)',
    'Acute Diarrheal Disease': 'तीव्र डायरिया रोग (ADD)',
    'Typhoid': 'टाइफाइड',
    'Cholera': 'हैजा',
    'Seasonal Influenza (Flu)': 'मौसमी इन्फ्लूएंजा (फ्लू)',
    'Viral Fever': 'वायरल बुखार',
    'Acute Respiratory Infection (ARI)': 'तीव्र श्वसन संक्रमण (ARI)',
    'Pneumonia': 'निमोनिया',
    
    // Medicines
    'Paracetamol 650mg': 'पेरासिटामोल 650mg',
    'IV Fluids': 'आईवी फ्लूइड्स',
    'Dengue Testing Kits': 'डेंगू टेस्टिंग किट्स',
    'Amoxicillin': 'अमोक्सिसिलिन',
    'ORS Packets': 'ओआरएस पैकेट्स',
    'Malaria RDT': 'मलेरिया आरडीटी',
    
    // Status
    'pending': 'लंबित',
    'approved': 'स्वीकृत',
    'en_route': 'रास्ते में',
    'delivered': 'वितरित',
    'PENDING': 'लंबित',
    'APPROVED': 'स्वीकृत',
    'EN_ROUTE': 'रास्ते में',
    'DELIVERED': 'वितरित',

    // Specific audit texts
    'Redistribution Approved': 'पुनर्वितरण स्वीकृत',
    'Critical Stockout Alert': 'गंभीर स्टॉकआउट अलर्ट',
    'Disease Trend Spike': 'रोग रुझान में वृद्धि',
    'Logistics Dispatched': 'लॉजिस्टिक्स भेजा गया'
  };

  if (map[text]) return map[text];

  let result = text;
  Object.keys(map).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), map[key]);
  });
  
  // Custom phrases
  result = result.replace('approved transfer of', 'ने ट्रांसफर को मंजूरी दी');
  result = result.replace('to', 'को');
  result = result.replace('stock dropped below', 'का स्टॉक नीचे गिर गया');
  result = result.replace('tablets at', 'टैबलेट से');
  result = result.replace('cases increased by', 'के मामले बढ़ गए');
  result = result.replace('in', 'में');
  result = result.replace('dispatched to', 'को भेजा गया');
  result = result.replace('Dengue NS1 Kits', 'डेंगू NS1 किट्स');

  return result;
};

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
  const { width: rawWidth } = useWindowDimensions();
  const width = Math.min(rawWidth, 453);
  const carouselWidth = width - 44;

  const { authState } = useAuth();
  const { t, language } = useTranslation();
  const { district, alerts: hookAlerts, recommendations: hookRecommendations, loading: dashboardLoading, refetch } = useDashboard();
  const { approveAlert, rejectAlert } = useAlerts();

  const isBMO = authState?.role === 'BMO';
  const isPHC = authState?.role === 'PHC';

  const { showAllTrends: showAllTrendsParam, scrollToTop } = useLocalSearchParams();
  const mainScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollToTop) {
      mainScrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollToTop]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const alerts = hookAlerts;

  const graphAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      graphAnim.setValue(0);
      Animated.timing(graphAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start();
    }, [graphAnim])
  );
  const [showAllTrends, setShowAllTrends] = useState(showAllTrendsParam === 'true');
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  
  const assignedFacilityId = authState?.facilityId || 'phc_barola';
  const { phcs: blockPhcs } = useRoleScopedPHCs();
  const averageHealthScore = blockPhcs.length ? Math.round(blockPhcs.reduce((acc, p) => acc + p.healthScore, 0) / blockPhcs.length) : 0;

  const activeMissions = hookRecommendations;
  const [commandQueue, setCommandQueue] = useState(localLogistics);
  const [telemetryAudits, setTelemetryAudits] = useState(localTelemetryAudits);
  const [diseaseTrendsData, setDiseaseTrendsData] = useState<DiseaseTrend[]>([]);

  useEffect(() => {
    let cancelled = false;
    reportsRepository.getDiseaseTrends()
      .then((trends) => { if (!cancelled) setDiseaseTrendsData(trends); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Removed effects that call setState synchronously

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

  const filteredTelemetryAudits = (isBMO 
    ? telemetryAudits.filter(a => blockPhcs.some(p => a.desc.includes(p.name) || a.desc.includes(p.id) || a.desc.includes(assignedFacilityId)))
    : telemetryAudits).map((audit, i) => ({ ...audit, time: i === 0 ? 'Just now' : `${Math.max(1, i * 4)}m ago` }));

  // Dynamic Outbreaks Carousel derived from active alerts in DB
  const unresolvedOutbreaks = filteredAlerts
    .filter((a) => a.type === 'OUTBREAK' && !a.resolved)
    .map((a) => ({
      id: a.id,
      facilityId: a.facilityId,
      disease: a.title.replace(' Surge Warning', '').replace(' Warning', ''),
      location: a.facilityName,
      priority: a.priority === 'CRITICAL' ? t('situationRoomHighPriorityOutbreak') : t('situationRoomMediumPriority'),
      cases: diseaseTrendsData.find(t => a.title.includes(t.disease))?.cases || 15,
      isEmergency: a.priority === 'CRITICAL',
    }));

  // Real-world AI Recommendations Data
  const aiRecommendations = activeMissions.filter((r) => isBMO ? (blockPhcIds.includes(r.sourceFacility) || blockPhcIds.includes(r.targetFacility)) : true);

  // Logistics requests (dynamic from DB)
  const logisticsRequests = isBMO ? commandQueue.filter(l => blockPhcs.some(p => l.from.includes(p.name) || l.from.includes(p.id) || l.to.includes(p.name) || l.to.includes(p.id) || l.from.includes(assignedFacilityId) || l.to.includes(assignedFacilityId))) : commandQueue;

  const diseaseIcons: Record<string, { name: any, color: string, bg: string }> = {
    'Dengue': { name: 'virus', color: '#EF4444', bg: '#FEE2E2' },
    'Malaria': { name: 'bug', color: '#EAB308', bg: '#FEF9C3' },
    'Chikungunya': { name: 'spider', color: '#F97316', bg: '#FFEDD5' },
    'Acute Diarrheal Disease (ADD)': { name: 'stomach', color: '#8B5CF6', bg: '#EDE9FE' },
    'Acute Diarrheal Disease': { name: 'stomach', color: '#8B5CF6', bg: '#EDE9FE' },
    'Typhoid': { name: 'bacteria', color: '#06B6D4', bg: '#CFFAFE' },
    'Cholera': { name: 'water-alert', color: '#3B82F6', bg: '#DBEAFE' },
    'Seasonal Influenza (Flu)': { name: 'virus', color: '#EC4899', bg: '#FCE7F3' },
    'Viral Fever': { name: 'thermometer-high', color: '#F43F5E', bg: '#FFE4E6' },
    'Acute Respiratory Infection (ARI)': { name: 'lungs', color: '#10B981', bg: '#D1FAE5' },
    'Pneumonia': { name: 'lungs', color: '#14B8A6', bg: '#CCFBF1' },
  };

  const logisticsIcons: Record<string, { name: any, color: string, bg: string }> = {
    'Paracetamol 650mg': { name: 'pill', color: '#10B981', bg: '#D1FAE5' },
    'IV Fluids': { name: 'iv-bag', color: '#3B82F6', bg: '#DBEAFE' },
    'Dengue Testing Kits': { name: 'test-tube', color: '#F59E0B', bg: '#FEF3C7' },
    'Amoxicillin': { name: 'pill', color: '#8B5CF6', bg: '#EDE9FE' },
    'ORS Packets': { name: 'water-plus', color: '#06B6D4', bg: '#CFFAFE' },
    'Malaria RDT': { name: 'test-tube', color: '#EF4444', bg: '#FEE2E2' },
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

  const handleApproveMission = useCallback(async (id: string) => {
    const mission = activeMissions.find(m => m.id === id);
    if (!mission) return;

    await approveAlert(id);

    const newLogisticsRequest = {
      // eslint-disable-next-line react-hooks/purity
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
      // eslint-disable-next-line react-hooks/purity
      id: `ta-${Date.now()}`,
      type: 'approved',
      icon: 'check',
      color: 'green',
      text: t('situationRoomRedistributionApproved'),
      desc: language === 'hi'
        ? `${authState?.role} ${authState?.name || 'User'} ने ${mission.targetFacility} को ${mission.quantity} ${mission.item} के ट्रांसफर को मंजूरी दी।`
        : `${authState?.role} ${authState?.name || 'User'} approved transfer of ${mission.quantity} ${mission.item} to ${mission.targetFacility}.`,
      time: 'Just now'
    };
    setTelemetryAudits(prev => [newAudit, ...prev]);
  }, [activeMissions, authState, approveAlert, t, language]);



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
          {t('situationRoomInitializingTelemetry')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={t('situationRoomErrorMessage')}
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
      <ScrollView ref={mainScrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 130 }} className="bg-[#F2F7FD]">

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
              <Text className="text-brand-navy font-black text-[26px] mb-4 tracking-tight ml-1">{t('situationRoomBriefingTitle')}</Text>

              <View className="gap-1 mb-5 ml-1">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-2.5 shadow-sm shadow-blue-500/10">
                    <Feather name="home" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{blockPhcs.length} {t('situationRoomPhcsUnderWatch')}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2.5 shadow-sm shadow-red-500/10">
                    <Feather name="alert-triangle" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{filteredAlerts.filter(a => a.type === 'OUTBREAK' && !a.resolved).length} {t('situationRoomOutbreakAlerts')}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-yellow-500 items-center justify-center mr-2.5 shadow-sm shadow-yellow-500/10">
                    <Feather name="battery" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{filteredAlerts.filter(a => a.type === 'SHORTAGE' && !a.resolved).length} {t('situationRoomMedicineShortages')}</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-2.5 shadow-sm shadow-green-500/10">
                    <Feather name="activity" size={10} color="white" />
                  </View>
                  <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>{filteredAlerts.filter(a => !a.resolved).length} {t('situationRoomAlertsNeedAttention')}</Text>
                </View>
              </View>

              <Pressable 
                className="self-start rounded-full bg-[#1A63C6] px-5 py-2.5 mb-6 flex-row items-center shadow-sm shadow-blue-500/50"
                onPress={() => router.push('/reports')}
              >
                <Text className="text-white text-[12px] font-bold mr-2">{t('situationRoomViewDetails')}</Text>
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
                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isBMO ? t('situationRoomBlockScore') : t('situationRoomDistrictScore')}</Text>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-4xl font-black text-slate-800 tracking-tighter">{averageHealthScore}</Text>
                  <Text className="text-sm font-bold text-slate-400 ml-1">/100</Text>
                </View>
              </View>
            </View>
            {/* Faint Sparkline Background Approximation */}
            <Animated.View 
              className="absolute bottom-0 left-0 right-0 h-[45px] overflow-hidden rounded-b-[24px]"
              style={{
                opacity: graphAnim,
                transform: [{ translateY: graphAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }]
              }}
            >
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
            </Animated.View>
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
                <Text className="text-slate-800 font-bold text-[10px] mb-0.5 tracking-wide" numberOfLines={1}>{t('situationRoomAiRecommendations')}</Text>
                <Text className="text-brand-navy font-black text-[26px] leading-none mb-1.5">{aiRecommendations.length}</Text>
                <View className="flex-row items-center">
                  <Feather name="arrow-up-right" size={11} color="#16A34A" />
                  <Text className="text-green-600 font-extrabold text-[10.5px] ml-1">{t('situationRoomNew')}</Text>
                </View>
              </View>
            </View>
            {/* Faint Sparkline Background Approximation */}
            <Animated.View 
              className="absolute bottom-0 left-0 right-0 h-[45px] overflow-hidden rounded-b-[24px]"
              style={{
                opacity: graphAnim,
                transform: [{ translateY: graphAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }]
              }}
            >
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
            </Animated.View>
          </View>
        </View>

        {/* Unresolved Outbreaks Carousel */}
        <View className="mb-8">
          <Text className="text-brand-navy font-extrabold text-lg mb-3 px-1">{t('situationRoomUnresolvedOutbreaks')}</Text>
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
                    <View 
                      style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: 22, 
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MaterialCommunityIcons 
                        name={diseaseIcons[outbreak.disease]?.name || 'virus'} 
                        size={24} 
                        color="#DC2626" 
                      />
                    </View>
                  </View>

                  {/* Middle Content */}
                  <View className="flex-1 px-3 justify-center">
                    <Text className="text-white font-extrabold text-[15px] mb-0.5" numberOfLines={1}>{translateDynamic(outbreak.disease, language)}</Text>
                    <Text className="text-red-100 font-semibold text-[10px] mb-1.5" numberOfLines={1}>{translateDynamic(outbreak.location, language)}</Text>
                    <View className="flex-row items-center bg-red-500 self-start px-2 py-0.5 rounded-full shadow-sm shadow-black/10">
                      <MaterialIcons name="local-fire-department" size={11} color="#FFFFFF" />
                      <Text className="text-white font-bold text-[9.5px] ml-1">{outbreak.priority}</Text>
                    </View>
                  </View>

                  {/* Right Cases Box */}
                  <View className="bg-red-500 border-red-400 rounded-[14px] w-[50px] py-1.5 items-center justify-center border mr-2 shadow-sm shadow-black/10">
                    <Text className="text-white font-black text-[22px] leading-tight">{outbreak.cases}</Text>
                    <Text className="text-red-100 font-bold text-[9px] mt-0.5">{t('situationRoomCases')}</Text>
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
          {/* Header Area */}
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <Text className="text-brand-navy font-extrabold text-lg">{t('situationRoomDiseaseTrends')}</Text>
            
            <Pressable 
              className="bg-[#EF4444] rounded-[6px] px-2.5 py-1.5 flex-row items-center shadow-sm shadow-red-200"
              onPress={() => setShowAllTrends(!showAllTrends)}
            >
              <Text className="text-white font-bold text-[9px] mr-1">{showAllTrends ? t('situationRoomShowLess') || 'View Less' : t('situationRoomViewAll') || 'View All'}</Text>
              <MaterialCommunityIcons name={showAllTrends ? "chevron-up" : "chevron-down"} size={10} color="white" />
            </Pressable>
          </View>

          <View className="bg-white rounded-[12px] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <View className="px-3 pb-3 pt-3">
              {diseaseTrendsData.slice(0, showAllTrends ? diseaseTrendsData.length : 4).map((trend, index) => {
                const sparkline = generateSparkline(trend.data, 90, 30);
                
                const rowBgColor = trend.isUp ? 'bg-red-50' : 'bg-emerald-50';
                const rowBorderColor = trend.isUp ? 'border-red-200' : 'border-emerald-200';
                const leftBarColor = trend.isUp ? 'bg-[#EF4444]' : 'bg-[#10B981]';
                const badgeIcon = trend.isUp ? 'trending-up' : 'trending-down';
                const badgeColor = trend.isUp ? '#EF4444' : '#10B981';
                
                const mainIcon = diseaseIcons[trend.disease]?.name || 'virus';
                const iconBgColor = trend.isUp ? '#FEE2E2' : '#D1FAE5'; // Red-100 or Emerald-100
                const iconColor = trend.isUp ? '#EF4444' : '#10B981'; // Red-500 or Emerald-500

                return (
                  <View key={trend.id} className={`${rowBgColor} rounded-[12px] mb-3 shadow-sm shadow-slate-200/50 border ${rowBorderColor} flex-row overflow-hidden p-2.5 items-center relative`}>
                    
                    {/* Left Colored Bar */}
                    <View className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${leftBarColor}`} />
                    
                    {/* Square Icon Container */}
                    <View className="ml-2 w-[40px] h-[40px] rounded-[10px] items-center justify-center mr-3 relative" style={{ backgroundColor: iconBgColor }}>
                      <MaterialCommunityIcons name={mainIcon} size={20} color={iconColor} />
                      <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm">
                        <MaterialCommunityIcons name={badgeIcon} size={10} color={badgeColor} />
                      </View>
                    </View>
                    
                    {/* Middle Info: Name & Sparkline */}
                    <View className="flex-1 pr-2 flex-row items-center">
                      <View className="w-[85px] mr-1">
                        <Text className="text-brand-navy font-black text-[12px] tracking-tight" numberOfLines={2}>{translateDynamic(trend.disease, language)}</Text>
                      </View>

                      {/* Sparkline Graph */}
                      <View className="flex-1 h-[30px] relative">
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
                        {/* Dot */}
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
                    </View>

                    {/* Vertical Dashed Divider */}
                    <View className="h-[30px] border-l border-dashed border-black mx-1.5" />

                    {/* Stats Area */}
                    <View 
                      className={`items-center justify-center w-[40px] border rounded-[10px] py-1 shadow-sm ${
                        trend.isUp 
                          ? 'bg-red-500 border-red-400 shadow-red-500/30' 
                          : 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30'
                      }`}
                    >
                      <Text className="text-white font-black text-[14px] leading-tight text-center px-1" numberOfLines={1} adjustsFontSizeToFit>{trend.cases}</Text>
                      <Text className={`font-bold text-[7px] mt-0.5 ${trend.isUp ? 'text-red-100' : 'text-emerald-100'}`}>
                        {language === 'hi' ? 'मामले' : 'CASES'}
                      </Text>
                    </View>

                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Active Netra Decision Requests Section */}
        <View className="mb-8 px-1">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-brand-navy font-extrabold text-lg">{t('situationRoomActiveDecisionRequests')}</Text>
          </View>

          {aiDecisionRequests.length === 0 ? (
            <View className="bg-green-50 rounded-[24px] border border-green-100 p-6 items-center justify-center mt-2 mb-4">
              <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-3">
                <Feather name="check-circle" size={24} color="#16A34A" />
              </View>
              <Text className="text-green-800 font-extrabold text-[15px] mb-1">{t('situationRoomAllClear')}</Text>
              <Text className="text-green-600 font-semibold text-center text-[12px]">{t('situationRoomNoActiveRecommendations')}</Text>
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
                className="bg-[#DADAFC] rounded-[28px] p-4 shadow-sm border border-[#C5C5EA] overflow-hidden"
              >
                {/* Header Row */}
                <View className="flex-row items-center mb-4 z-10">
                  {/* Netra Logo */}
                  <View className="w-[60px] h-[60px] rounded-full bg-white items-center justify-center mr-3 border-[3px] border-[#E8EBF6] shadow-sm">
                    <Image source={require('../../data/netra.png')} style={{width: 36, height: 36}} resizeMode="contain" />
                  </View>
                  <View className="flex-1 justify-center">
                    <Text className="text-[#3B82F6] font-bold text-[10px] mb-0.5">{t('situationRoomNetraAiRecommendation') || 'Netra AI Recommendation'}</Text>
                    <Text className="text-brand-navy font-black text-[15px] leading-tight" numberOfLines={2}>
                      {language === 'hi' 
                        ? (request.type === 'Redistribute Stock' ? 'स्टॉक\nपुनर्वितरित करें' : translateDynamic(request.type, language)) 
                        : request.type.replace('Redistribute ', 'Redistribute\n')}
                    </Text>
                  </View>
                  {/* Confidence Pill */}
                  <View className="bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-1 rounded-[8px] flex-row items-center">
                    <MaterialIcons name="check-circle" size={12} color="#15803D" />
                    <Text className="text-[#15803D] font-bold text-[9px] ml-1">{request.confidence} {t('situationRoomConfidenceSuffix') || 'Confidence'}</Text>
                  </View>
                </View>

                {/* Facilities Flow */}
                <View className="flex-row items-center justify-between mb-4 z-10">
                  {/* Source Facility Glass Card (Green) */}
                  <View className="bg-[#F0FDF4] rounded-[16px] p-3 flex-1 flex-row items-center border border-[#DCFCE7] shadow-sm shadow-green-100">
                    <View className="w-[38px] h-[38px] rounded-[12px] bg-[#22C55E] items-center justify-center mr-2">
                      <MaterialCommunityIcons name="hospital-building" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#15803D] font-extrabold text-[8px] uppercase tracking-wider mb-0.5">{t('situationRoomSource') || 'Source'}</Text>
                      <Text className="text-brand-navy font-bold text-[12px] mb-1" numberOfLines={1}>
                        {translateDynamic(request.source, language).replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <View className="bg-green-100 px-1.5 py-0.5 rounded-[4px] self-start">
                        <Text className="text-[#15803D] font-bold text-[8px]">{t('situationRoomInStock') || 'In Stock'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Arrow */}
                  <View className="w-6 h-6 rounded-full bg-white items-center justify-center mx-1.5 shadow-sm shadow-black/5 border border-slate-100 z-20">
                    <Feather name="arrow-right" size={12} color="#3B82F6" />
                  </View>

                  {/* Target Facility Glass Card (Red) */}
                  <View className="bg-[#FEF2F2] rounded-[16px] p-3 flex-1 flex-row items-center border border-[#FEE2E2] shadow-sm shadow-red-100">
                    <View className="w-[38px] h-[38px] rounded-[12px] bg-[#EF4444] items-center justify-center mr-2">
                      <MaterialCommunityIcons name="hospital-building" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-red-700 font-extrabold text-[8px] uppercase tracking-wider mb-0.5">{t('situationRoomTarget') || 'Target'}</Text>
                      <Text className="text-brand-navy font-bold text-[12px] mb-1" numberOfLines={1}>
                        {translateDynamic(request.target, language).replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <View className="bg-red-100 px-1.5 py-0.5 rounded-[4px] self-start">
                        <Text className="text-red-700 font-bold text-[8px]">{t('phcsMetricCriticalLabel') || 'Critical'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Reasoning */}
                <View className="mb-4 z-10 rounded-[16px] p-2 flex-row items-center">
                  <View className="w-[36px] h-[36px] rounded-full bg-[#E0E7FF] items-center justify-center mr-3">
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#3B82F6" />
                  </View>
                  <View className="flex-1 pr-2 justify-center">
                    <Text className="text-[#3B82F6] font-black text-[9px] tracking-widest uppercase mb-1.5">{t('situationRoomReasoningLabel')}</Text>
                    {request.type === 'Redistribute Stock' ? (
                      <View>
                        <Text className="text-slate-600 font-medium text-[10px] mb-0.5">• {t('situationRoomReasonTargetLow') || 'Target is critically low.'}</Text>
                        <Text className="text-slate-600 font-medium text-[10px]">• {t('situationRoomReasonSourceSurplus') || 'Source has surplus stock.'}</Text>
                      </View>
                    ) : (
                      <Text className="text-slate-600 font-medium text-[10.5px] leading-tight pr-2" numberOfLines={4}>• {translateDynamic(request.reason, language)}</Text>
                    )}
                  </View>
                  <View className="w-[150px] items-end justify-center -my-2 -mr-10">
                    <Image source={require('../../assets/images/reasoning_illustration.png')} style={{width: 150, height: 100}} resizeMode="contain" />
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="z-10">
                  <Pressable
                    onPress={() => handleApproveMission(request.id)}
                    className="w-full py-3.5 rounded-[14px] bg-[#3B82F6] items-center justify-center flex-row shadow-md shadow-blue-500/30 active:bg-blue-600"
                  >
                    <Feather name="check-circle" size={16} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-[14px]">{t('situationRoomApproveRequest')}</Text>
                  </Pressable>
                </View>
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
          {/* Header Area (Outside Card) */}
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <Text className="text-brand-navy font-extrabold text-lg">{t('situationRoomLogisticsQueueTitle')}</Text>
            
            <Pressable 
              className="bg-[#6366F1] rounded-[6px] px-2.5 py-1.5 flex-row items-center shadow-sm shadow-indigo-200"
              onPress={() => setIsLogisticsOpen(!isLogisticsOpen)}
            >
              <Text className="text-white font-bold text-[9px] mr-1">{isLogisticsOpen ? t('situationRoomShowLess') || 'View Less' : t('situationRoomViewAll') || 'View All'}</Text>
              <MaterialCommunityIcons name={isLogisticsOpen ? "chevron-up" : "chevron-down"} size={10} color="white" />
            </Pressable>
          </View>

          <View className="bg-white rounded-[12px] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {/* Items List */}
            <View className="px-3 pb-3 pt-3">
              {(isLogisticsOpen ? logisticsRequests : logisticsRequests.slice(0, 3)).map((item, index) => {
                const isPending = item.status.toLowerCase() === 'pending';
                const isDelivered = item.status.toLowerCase() === 'delivered';
                const isEnRoute = !isPending && !isDelivered; // Treat others as en-route
                
                const leftBarColor = isPending ? 'bg-[#F97316]' : (isDelivered ? 'bg-[#10B981]' : 'bg-[#3B82F6]');
                const badgeIcon = isPending ? 'timer-sand' : (isDelivered ? 'check-circle' : 'truck-fast');
                const badgeColor = isPending ? '#F97316' : (isDelivered ? '#10B981' : '#3B82F6');
                
                const mainIcon = item.item.toLowerCase().includes('kit') ? 'package-variant-closed' : item.item.toLowerCase().includes('tablet') || item.item.toLowerCase().includes('paracetamol') || item.item.toLowerCase().includes('amoxicillin') ? 'pill' : 'medical-bag';
                const iconBgColor = isPending ? '#FFEDD5' : (isDelivered ? '#DCFCE7' : '#DBEAFE');
                const iconColor = isPending ? '#EA580C' : (isDelivered ? '#059669' : '#2563EB');

                const rowBgColor = isPending ? 'bg-orange-50' : (isDelivered ? 'bg-emerald-50' : 'bg-blue-50');
                const rowBorderColor = isPending ? 'border-orange-200' : (isDelivered ? 'border-emerald-200' : 'border-blue-300');

                return (
                  <View key={item.id} className={`${rowBgColor} rounded-[12px] mb-3 shadow-sm shadow-slate-200/50 border ${rowBorderColor} flex-row overflow-hidden p-2.5 items-center relative`}>
                    {/* Left Colored Bar */}
                    <View className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${leftBarColor}`} />
                    
                    {/* Square Icon Container */}
                    <View className="ml-2 w-[40px] h-[40px] rounded-[10px] items-center justify-center mr-3 relative" style={{ backgroundColor: iconBgColor }}>
                      <MaterialCommunityIcons name={mainIcon} size={20} color={iconColor} />
                      <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm">
                        <MaterialCommunityIcons name={badgeIcon} size={10} color={badgeColor} />
                      </View>
                    </View>
                    
                    {/* Middle Info */}
                    <View className="flex-1 pr-2">
                      <Text className="text-brand-navy font-black text-[14px] tracking-tight mb-1" numberOfLines={1}>{translateDynamic(item.item, language)}</Text>
                      
                      <View className="flex-row items-center flex-wrap gap-1.5">
                        <View className="flex-row items-center mr-1">
                          <Text className="text-slate-500 font-semibold text-[8px] uppercase">{translateDynamic(item.from, language).replace(/_/g, ' ')}</Text>
                          <MaterialCommunityIcons name="arrow-right" size={10} color="#94A3B8" style={{ marginHorizontal: 2 }} />
                          <Text className="text-slate-500 font-semibold text-[8px] uppercase">{translateDynamic(item.to, language).replace(/_/g, ' ')}</Text>
                        </View>

                        <View className="flex-row items-center gap-1.5 mt-1">
                          <View className="bg-slate-50 rounded-[4px] px-1.5 py-0.5 flex-row items-center border border-slate-100">
                            <MaterialCommunityIcons name="calendar-text-outline" size={10} color="#94A3B8" />
                            <Text className="text-slate-500 font-semibold text-[8px] ml-1">ID: {`DSP-${8920 + index}`}</Text>
                          </View>
                          <View className="bg-slate-50 rounded-[4px] px-1.5 py-0.5 flex-row items-center border border-slate-100">
                            <MaterialCommunityIcons name="clock-outline" size={10} color="#94A3B8" />
                            <Text className="text-slate-500 font-semibold text-[8px] ml-1">{isDelivered ? 'Yesterday' : 'Today'}, {10 + index}:{isPending ? '45' : '30'} {isDelivered ? 'PM' : 'AM'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    {/* Vertical Dashed Divider */}
                    <View className="h-[30px] border-l border-dashed border-black mx-1.5" />

                    {/* Stats Area */}
                    <View 
                      className={`items-center justify-center w-[40px] border rounded-[10px] py-1 shadow-sm ${
                        isPending 
                          ? 'bg-orange-500 border-orange-400 shadow-orange-500/30' 
                          : isDelivered 
                            ? 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30'
                            : 'bg-blue-500 border-blue-400 shadow-blue-500/30'
                      }`}
                    >
                      <Text className="text-white font-black text-[14px] leading-tight">{item.quantity}</Text>
                      <Text className={`font-bold text-[7px] mt-0.5 ${isPending ? 'text-orange-100' : isDelivered ? 'text-emerald-100' : 'text-blue-100'}`}>
                        {item.item.toLowerCase().includes('kit') ? 'KITS' : 'TABS'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Footer */}
            <View className="bg-white px-3 py-3 border-t border-slate-100 flex-row items-center justify-between">
              <View className="flex-row gap-3 flex-1">
                <View className="flex-row items-center">
                  <View className="w-[24px] h-[24px] rounded-[6px] bg-indigo-100 items-center justify-center mr-1.5">
                    <MaterialCommunityIcons name="cube-outline" size={14} color="#6366F1" />
                  </View>
                  <Text className="text-brand-navy font-bold text-[10px]">{t('situationRoomRealtimeUpdates') || 'Real-time Updates'}</Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-[24px] h-[24px] rounded-[6px] bg-blue-100 items-center justify-center mr-1.5">
                    <MaterialCommunityIcons name="map-marker-path" size={14} color="#3B82F6" />
                  </View>
                  <Text className="text-brand-navy font-bold text-[10px]">{t('situationRoomSmartRouting') || 'Smart Routing'}</Text>
                </View>
              </View>
              
              <View className="bg-slate-50 rounded-[8px] p-2 px-2.5 border border-slate-100 flex-row items-center ml-2">
                <View className="w-[24px] h-[24px] rounded-full bg-indigo-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="truck-delivery" size={14} color="#6366F1" />
                </View>
                <Text className="text-brand-navy font-black text-[12px]">
                  {logisticsRequests.filter(req => req.status.toLowerCase() !== 'delivered').length} <Text className="font-semibold text-[9px] text-slate-600">{t('situationRoomActive') || 'Active'}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Telemetry Audits */}
        <View className="mb-8 px-1">
          {/* Header Area */}
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <Text className="text-brand-navy font-extrabold text-lg">{t('situationRoomRecentTelemetryAudits')}</Text>
            
            <Pressable 
              className="bg-slate-800 rounded-[6px] px-2.5 py-1.5 flex-row items-center shadow-sm shadow-slate-300"
              onPress={() => router.push('/reports')}
            >
              <Text className="text-white font-bold text-[9px] mr-1">{t('situationRoomViewAll')}</Text>
              <MaterialCommunityIcons name="chevron-right" size={10} color="white" />
            </Pressable>
          </View>

          <View className="bg-white rounded-[12px] shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <View className="px-3 pb-3 pt-3">
              {filteredTelemetryAudits.slice(0, 3).map((audit, i) => {
                const rowBgColor = audit.color === 'red' ? 'bg-red-50' : 'bg-emerald-50';
                const rowBorderColor = audit.color === 'red' ? 'border-red-200' : 'border-emerald-200';
                const leftBarColor = audit.color === 'red' ? 'bg-[#EF4444]' : 'bg-[#10B981]';
                const badgeIcon = audit.color === 'red' ? 'alert' : 'check-all';
                const badgeColor = audit.color === 'red' ? '#EF4444' : '#10B981';
                const iconBgColor = audit.color === 'red' ? '#FEE2E2' : '#D1FAE5';
                const iconColor = audit.color === 'red' ? '#EF4444' : '#10B981';

                return (
                  <View key={audit.id} className={`${rowBgColor} rounded-[12px] mb-3 shadow-sm shadow-slate-200/50 border ${rowBorderColor} flex-row overflow-hidden p-2.5 items-center relative`}>
                    
                    {/* Left Colored Bar */}
                    <View className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${leftBarColor}`} />
                    
                    {/* Square Icon Container */}
                    <View className="ml-2 w-[40px] h-[40px] rounded-[10px] items-center justify-center mr-3 relative" style={{ backgroundColor: iconBgColor }}>
                      <MaterialCommunityIcons name={audit.color === 'red' ? 'shield-alert' : 'shield-check'} size={20} color={iconColor} />
                      <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm">
                        <MaterialCommunityIcons name={badgeIcon} size={10} color={badgeColor} />
                      </View>
                    </View>
                    
                    {/* Middle Info */}
                    <View className="flex-1 pr-2">
                      <Text className="text-brand-navy font-black text-[14px] tracking-tight mb-1" numberOfLines={1}>{translateDynamic(audit.text, language)}</Text>
                      
                      <Text className="text-slate-500 font-semibold text-[8px] leading-relaxed mb-1" numberOfLines={2}>{translateDynamic(audit.desc, language)}</Text>

                      <View className="flex-row items-center flex-wrap gap-1.5 mt-0.5">
                        <View className="bg-slate-50 rounded-[4px] px-1.5 py-0.5 flex-row items-center border border-slate-100">
                          <MaterialCommunityIcons name="shield-key-outline" size={10} color="#94A3B8" />
                          <Text className="text-slate-500 font-semibold text-[8px] ml-1">ID: {`AUD-${9120 + i}`}</Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Vertical Dashed Divider */}
                    <View className="h-[30px] border-l border-dashed border-black mx-1.5" />

                    {/* Stats Area */}
                    <View 
                      className={`items-center justify-center min-w-[52px] px-1 border rounded-[10px] py-1 shadow-sm ${
                        audit.color === 'red' 
                          ? 'bg-red-500 border-red-400 shadow-red-500/30' 
                          : 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30'
                      }`}
                    >
                      <Text className="text-white font-black text-[10px] leading-tight text-center px-1" numberOfLines={1} adjustsFontSizeToFit>{language === 'hi' ? audit.time.replace('Just now', 'अभी').replace('m ago', 'मिनट') : audit.time.replace(' ago', '')}</Text>
                      <Text className={`font-bold text-[7px] mt-0.5 ${audit.color === 'red' ? 'text-red-100' : 'text-emerald-100'}`}>
                        {language === 'hi' ? 'समय' : 'TIME'}
                      </Text>
                    </View>

                  </View>
                );
              })}
            </View>
          </View>
        </View>

      </ScrollView>

    </ScreenContainer>
  );
}
