import { phcRepository } from '@/services/repositories/phcRepository';
import { alertsRepository } from '@/services/repositories/alertsRepository';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { PHC } from '@/shared/types/phc';
import { MedicineStock } from '@/shared/types/medicine';
import { AlertItem } from '@/shared/types/alert';
import { AIRecommendation } from '@/shared/types/ai';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Dimensions, Image, Pressable, ScrollView, Text, TouchableOpacity, View, LogBox, Platform } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient, Text as SvgText, G } from 'react-native-svg';

LogBox.ignoreLogs(['Unknown event handler property `onResponderTerminate`']);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Components
const MetricCard = ({ title, value, icon, iconBg, trend, trendVal, subtitle, borderColor, bgColor = '#FFFFFF' }: any) => (
  <View className={`rounded-3xl p-4 shadow-sm border ${borderColor} w-[48%] mb-3`} style={{ backgroundColor: bgColor }}>
    <View className="flex-row items-center mb-3">
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${iconBg}`}>
        <MaterialCommunityIcons name={icon} size={16} color="white" />
      </View>
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-1">{title}</Text>
    </View>
    <Text className="text-2xl font-black text-brand-navy mb-1">{value}</Text>
    <View className="flex-row items-center">
      {trend && (
        <Feather name={trend === 'up' ? 'arrow-up' : 'arrow-down'} size={10} color={trend === 'up' ? '#10B981' : '#F59E0B'} />
      )}
      {trend && (
        <Text className={`text-[10px] font-bold ml-1 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-amber-500' : 'text-slate-400'}`}>
          {trendVal}
        </Text>
      )}
      <Text className="text-[10px] text-slate-400 ml-1">{subtitle}</Text>
    </View>
  </View>
);

export default function PHCDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t, language } = useTranslation();
  const { authState } = useAuth();
  const [showAllMedicines, setShowAllMedicines] = useState(false);
  const [currentAiIndex, setCurrentAiIndex] = useState(0);

  const translateDynamic = (text: string) => {
    if (language !== 'hi' || !text) return text;

    const map: Record<string, string> = {
      'Paracetamol 650mg': 'पैरासिटामोल 650mg',
      'ORS (Oral Rehydration Salt)': 'ओआरएस (ओरल रिहाइड्रेशन साल्ट)',
      'Amoxicillin 250mg': 'अमोक्सिसिलिन 250mg',
      'Dengue RDT Kit': 'डेंगू आरडीटी किट',
      'Malaria RDT Kit': 'मलेरिया आरडीटी किट',
      'Typhoid Antigen Test': 'टाइफाइड एंटीजन टेस्ट',
      'IV Fluids (RL 500ml)': 'आईवी फ्लूइड्स (आरएल 500ml)',
      'Vitamin C + Zinc': 'विटामिन सी + जिंक',
      'Azithromycin 500mg': 'एज़िथ्रोमाइसिन 500mg',
      'Oxygen Cylinder (B Type)': 'ऑक्सीजन सिलेंडर (बी टाइप)',
      'Transfer 50 Dengue Kits': '50 डेंगू किट्स ट्रांसफर करें',
      'Move 20 Malaria RDTs': '20 मलेरिया RDTs ट्रांसफर करें',
      'Urgent Paracetamol Restock': 'पैरासिटामोल की तुरंत जरूरत',
      'High incidence of Dengue cases reported in Badalpur. Transferring surplus kits from Bisrakh is recommended to prevent shortages.': 'बादलपुर में डेंगू के मामले बढ़ रहे हैं। कमी से बचने के लिए बिसरख से एक्स्ट्रा किट भेजना सही रहेगा।',
      'Malaria cases rising slightly in Khoda. Proactive redistribution will maintain adequate buffer stock.': 'खोड़ा में मलेरिया के केस हल्के बढ़ रहे हैं। पहले से ही स्टॉक भेजना सही रहेगा ताकि कमी न हो।',
      'Critical shortage expected due to viral fever surge. Immediate restock required.': 'वायरल बुखार बढ़ने से स्टॉक की भारी कमी हो सकती है। तुरंत नया स्टॉक चाहिए।',
      'PHC Bisrakh': 'पीएचसी बिसरख',
      'PHC Badalpur': 'पीएचसी बादलपुर',
      'PHC Khoda': 'पीएचसी खोड़ा',
      'CHC Dadri': 'सीएचसी दादरी',
      'chc_bisrakh': 'सीएचसी बिसरख',
      'uphc_harola': 'यूपीएचसी हरौला',
      'Azithromycin Re-stocking': 'एज़िथ्रोमाइसिन रीस्टॉकिंग',
      'UPHC Harola is running low on broad-spectrum antibiotics. Transfer from Bisrakh recommended.': 'यूपीएचसी हरौला में ब्रॉड-स्पेक्ट्रम एंटीबायोटिक्स की कमी हो रही है। बिसरख से ट्रांसफर करने की सिफारिश की जाती है।'
    };

    if (map[text]) return map[text];
    return text;
  };

  const [activeDataPoint, setActiveDataPoint] = useState<number | null>(3); // Default to Peak (Thursday)
  const infraScrollRef = useRef<ScrollView>(null);

  const [phc, setPhc] = useState<PHC | null>(null);
  const [stocks, setStocks] = useState<MedicineStock[]>([]);
  const [phcAlerts, setPhcAlerts] = useState<AlertItem[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        const fetchedPhc = await phcRepository.getPHC(id as string);
        setPhc(fetchedPhc);

        const fetchedStocks = await phcRepository.getInventory(id as string);
        setStocks(fetchedStocks);

        const allAlerts = await alertsRepository.getActiveAlerts();
        setPhcAlerts(allAlerts.filter(a => a.facilityId === id));

        const allRecommendations = await alertsRepository.getAIRecommendations();
        setAiRecommendations(
          allRecommendations.filter(r => r.targetFacility === id || r.sourceFacility === id)
        );
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const [lastSyncTime] = useState(() =>
    new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Auto-scroll logic for Infrastructure
  useEffect(() => {
    let scrollPosition = 0;
    const interval = setInterval(() => {
      if (infraScrollRef.current) {
        scrollPosition = scrollPosition === 0 ? 150 : 0;
        infraScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayedStocks = showAllMedicines ? stocks : stocks.slice(0, 3);
  const lowStockCount = stocks.filter(s => s.currentStock < s.minRequiredStock).length;

  const handleApproveReject = async (recId: string, approve: boolean) => {
    // Optimistically remove from view; repository call persists the decision.
    setAiRecommendations(prev => prev.filter(r => r.id !== recId));
    try {
      if (approve) {
        await alertsRepository.approveMission(recId, authState?.uid || 'unknown');
      } else {
        await alertsRepository.rejectMission(recId);
      }
    } catch (err) {
      console.error('Failed to record mission decision', err);
    }
  };

  if (dataLoading || !phc) {
    return (
      <View className="flex-1 bg-[#F8FAFC] p-4">
        <Skeleton width="100%" height={250} className="rounded-3xl mb-4" />
        <View className="flex-row justify-between mb-4">
          <Skeleton width="48%" height={100} className="rounded-3xl" />
          <Skeleton width="48%" height={100} className="rounded-3xl" />
        </View>
        <Skeleton width="100%" height={200} className="rounded-3xl" />
      </View>
    );
  }

  // Added footfall data
  const footfallData = phc.weeklyFootfall || [50, 60, 70, 80, 90, 100, 110];
  const totalFootfall = footfallData.reduce((a, b) => a + b, 0);
  const avgFootfall = Math.round(totalFootfall / footfallData.length);
  const minF = Math.min(...footfallData);
  const maxF = Math.max(...footfallData);
  const xCoords = [20, 70, 120, 170, 220, 270, 330];
  const graphPts = footfallData.map((val, i) => {
    let cy = 100;
    if (maxF > minF) cy = 160 - ((val - minF) / (maxF - minF)) * 100 - 20;
    return { cx: xCoords[i], cy, val, i };
  });
  const pathD = `M20,${graphPts[0].cy} ` + graphPts.slice(1).map(p => `L${p.cx},${p.cy}`).join(' ');
  const areaPath = pathD + ` L330,180 L20,180 Z`;

  const todayFootfall = footfallData[footfallData.length - 1];
  const yesterdayFootfall = footfallData[footfallData.length - 2] || todayFootfall;
  const footfallDiff = todayFootfall - yesterdayFootfall;
  const footfallTrend = footfallDiff >= 0 ? 'up' : 'down';
  const footfallPct = yesterdayFootfall > 0 ? Math.round(Math.abs(footfallDiff) / yesterdayFootfall * 100) : 0;

  const bedsAvailable = Math.max(0, phc.bedsTotal - phc.bedsOccupied);
  const bedsOccupiedPct = Math.round((phc.bedsOccupied / Math.max(1, phc.bedsTotal)) * 100);

  const staffAbsent = phc.staffTotal - phc.staffPresent;

  let illustrationSrc = require('@/data/phc/phc illustration/green1.png');
  if (phc.healthScore < 70) {
    illustrationSrc = require('@/data/phc/phc illustration/red1.png');
  } else if (phc.healthScore < 90) {
    illustrationSrc = require('@/data/phc/phc illustration/yellow1.png');
  }

  const translatedName = language === 'hi' && phc.nameHi ? phc.nameHi : phc.name;
  const translatedBlock = language === 'hi' && phc.blockHi ? phc.blockHi : phc.block;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HERO SECTION */}
        <View className="bg-white px-4 py-6 shadow-sm border-b border-slate-100 mb-4 rounded-b-3xl mt-2">
          {/* Back button */}
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/district-map');
              }
            }}
            className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mb-4 border border-slate-200 active:bg-slate-100"
          >
            <Feather name="arrow-left" size={20} color="#64748B" />
          </Pressable>
          <View className="flex-row">
            <View className="w-32 h-28 bg-[#E6F3FF] rounded-2xl mr-4 items-center justify-center overflow-hidden border border-blue-50">
              <Image source={illustrationSrc} className="w-full h-full" resizeMode="cover" />
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row items-center mb-1">
                <Text className="text-xl font-black text-brand-navy mr-2">{translatedName}</Text>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#10B981" />
              </View>
              <Text className="text-xs text-slate-500 mb-3 leading-relaxed">
                {translatedBlock} {t('phcDetailBlockLine')}
              </Text>

              {/* Pills */}
              <View className="flex-row flex-wrap gap-2">
                <View className="bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex-row items-center">
                  <MaterialCommunityIcons name="map-marker" size={10} color="#10B981" className="mr-1" />
                  <Text className="text-[9px] font-bold text-emerald-700">{t('phcDetailPillUttarPradesh')}</Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                  <Text className="text-[9px] font-bold text-blue-700">{t('phcDetailPillEstablished')} {phc.establishedYear}</Text>
                </View>
                <View className="bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                  <Text className="text-[9px] font-bold text-purple-700">{t('phcDetailPillPhcCode')} {phc.phcCode}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Meta Info Row */}
          <View className="flex-row justify-between items-center mt-6 pt-4 border-t border-slate-100">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-emerald-50 rounded-md items-center justify-center mr-2">
                <MaterialCommunityIcons name="hospital-building" size={14} color="#10B981" />
              </View>
              <View>
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t('phcDetailFacilityTypeLabel')}</Text>
                <Text className="text-xs font-bold text-brand-navy">{t('phcDetailFacilityTypeValue')}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-blue-50 rounded-md items-center justify-center mr-2">
                <MaterialCommunityIcons name="bank" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t('phcDetailManagedByLabel')}</Text>
                <Text className="text-xs font-bold text-brand-navy">{t('phcDetailManagedByValue')}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-amber-50 rounded-md items-center justify-center mr-2">
                <MaterialCommunityIcons name="sync" size={14} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t('phcDetailLastSyncLabel')}</Text>
                <Text className="text-xs font-bold text-brand-navy">{t('phcDetailLastSyncPrefix')} {lastSyncTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* NETRA HEALTH INDEX */}
        <View className="px-4 mb-6">
          <LinearGradient
            colors={
              phc.healthScore >= 90 ? ['#ECFDF5', '#D1FAE5'] :
                phc.healthScore >= 70 ? ['#FFFBEB', '#FEF3C7'] :
                  ['#FEF2F2', '#FEE2E2']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: phc.healthScore >= 90 ? '#6EE7B7' : phc.healthScore >= 70 ? '#FCD34D' : '#FCA5A5',
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 40,
              overflow: 'hidden'
            }}
            className="shadow-sm relative"
          >
            <View className="flex-row items-center mb-5">
              <Text className="text-slate-600 font-black text-[11px] tracking-widest uppercase mr-2">{t('phcDetailHealthIndexTitle')}</Text>
              <Feather name="info" size={14} color="#94A3B8" />
            </View>

            <View className="flex-row items-center">
              {/* Circular Gauge */}
              <View className="relative w-[72px] h-[72px] items-center justify-center mr-5">
                <Svg height="72" width="72" viewBox="0 0 72 72" className="absolute">
                  <Circle cx="36" cy="36" r="32" stroke="rgba(0,0,0,0.05)" strokeWidth="6" fill="none" />
                  <Circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke={phc.healthScore >= 90 ? '#10B981' : phc.healthScore >= 70 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="201.06"
                    strokeDashoffset={201.06 - (phc.healthScore / 100) * 201.06}
                    strokeLinecap="round"
                    transform="rotate(-90 36 36)"
                  />
                </Svg>
                <View className="items-center justify-center absolute w-full h-full" style={{ left: 0, top: 0, right: 0, bottom: 0 }}>
                  <Text className="text-slate-800 font-black text-[22px]" style={{ textAlign: 'center', includeFontPadding: false }}>
                    {phc.healthScore}
                    <Text className="text-slate-500 font-bold text-[10px]">%</Text>
                  </Text>
                </View>
              </View>

              <View className="flex-1">
                <Text
                  className="font-bold text-[9px] mb-1"
                  style={{ color: phc.healthScore >= 90 ? '#059669' : phc.healthScore >= 70 ? '#D97706' : '#DC2626' }}
                >
                  {phc.healthScore >= 90 ? t('phcDetailStatusOperational') : phc.healthScore >= 70 ? t('phcDetailStatusAttention') : t('phcDetailStatusCritical')}
                </Text>
                <Text className="text-slate-600 text-xs leading-relaxed">
                  {t('phcDetailHealthIndexDesc')}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* KEY METRICS GRID */}
        <View className="px-4 mb-4 flex-row flex-wrap justify-between">
          <MetricCard
            title={t('phcDetailMetricFootfallToday')}
            value={todayFootfall.toString()}
            icon="account-group" iconBg="bg-purple-500"
            trend={footfallTrend} trendVal={`${footfallPct}%`} subtitle={t('phcDetailMetricSubtitleVsYesterday')}
            borderColor="border-purple-200"
            bgColor="#F3E8FF"
          />
          <MetricCard
            title={t('phcDetailMetricBedsAvailable')}
            value={`${bedsAvailable} / ${phc.bedsTotal}`}
            icon="bed-empty" iconBg="bg-emerald-500"
            subtitle={`${bedsOccupiedPct}${t('phcDetailMetricOccupiedSuffix')}`}
            borderColor="border-emerald-200"
            bgColor="#D1FAE5"
          />
          <MetricCard
            title={t('phcDetailStaffPresentLabel')}
            value={`${phc.staffPresent} / ${phc.staffTotal}`}
            icon="account-group" iconBg="bg-amber-500"
            subtitle={`${staffAbsent} ${t('phcDetailAbsentTodaySuffix')}`}
            borderColor="border-amber-200"
            bgColor="#FEF3C7"
          />
          <MetricCard
            title={t('phcDetailMetricConsultRooms')}
            value={phc.consultRooms.toString()}
            icon="doctor" iconBg="bg-purple-400"
            borderColor="border-purple-200"
            bgColor="#F3E8FF"
          />
          <MetricCard
            title={t('phcDetailMetricLabServices')}
            value={t('phcDetailMetricLabServicesValue')}
            icon="flask" iconBg="bg-blue-400"
            borderColor="border-blue-200"
            bgColor="#DBEAFE"
          />
        </View>

        {/* MEDICINE STOCK OVERVIEW */}
        <View className="px-4 mb-6">
          {/* Header Area */}
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <View className="flex-row items-center">
              <Text className="text-brand-navy font-black text-[22px]">{t('phcDetailMedicineStockTitle')}</Text>
              {lowStockCount > 0 && (
                <View className="bg-red-100 px-1.5 py-0.5 rounded ml-2 border border-red-200">
                  <Text className="text-red-700 font-bold text-[8px] uppercase tracking-wider">{lowStockCount} LOW STOCK</Text>
                </View>
              )}
            </View>

            <Pressable
              className="bg-[#EF4444] rounded-[6px] px-2.5 py-1.5 flex-row items-center shadow-sm shadow-red-200"
              onPress={() => setShowAllMedicines(!showAllMedicines)}
            >
              <Text className="text-white font-bold text-[9px] mr-1">{showAllMedicines ? t('phcDetailViewLess') : t('phcDetailViewAll')}</Text>
              <MaterialCommunityIcons name={showAllMedicines ? "chevron-up" : "chevron-down"} size={10} color="white" />
            </Pressable>
          </View>

          <View className="bg-white rounded-[24px] border-[2px] border-red-200 shadow-sm shadow-slate-200/50 p-5 pt-3 relative overflow-hidden">

            {/* List */}
            <View className="mt-2">
              {displayedStocks.map((item, index) => {
                const isShortage = item.currentStock < item.minRequiredStock;
                const pct = Math.min(100, Math.round((item.currentStock / item.minRequiredStock) * 100));

                // Use HEX colors to bypass NativeWind bug
                const bgColorHex = isShortage ? '#FEF2F2' : '#ECFDF5'; // red-50 or emerald-50
                const borderColor = isShortage ? 'border-red-100' : 'border-emerald-100';
                const solidBgHex = isShortage ? '#EF4444' : '#10B981'; // red-500 or emerald-500
                const dashColor = isShortage ? 'border-red-300' : 'border-emerald-300';

                // Solid colored icon background
                const iconBgHex = isShortage ? '#EF4444' : '#10B981';
                const iconColor = 'white';
                const iconName = isShortage ? 'alert-circle' : 'check-circle';

                return (
                  <View key={item.id} className={`flex-row items-center p-3 rounded-2xl border ${borderColor} mb-3`} style={{ backgroundColor: bgColorHex }}>
                    {/* Icon */}
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 shadow-sm shadow-slate-200/50" style={{ backgroundColor: iconBgHex }}>
                      <MaterialCommunityIcons name={item.type === 'EMERGENCY' ? 'medical-bag' : iconName} size={22} color={iconColor} />
                    </View>

                    {/* Info */}
                    <View className="flex-1 pr-2">
                      <Text className="text-slate-800 font-extrabold text-[14px] mb-0.5" numberOfLines={1}>{translateDynamic(item.name)}</Text>
                      <Text className="text-slate-500 font-semibold text-[10px]">{item.currentStock} / {item.minRequiredStock} units</Text>
                    </View>

                    {/* Dashed line and Solid Box */}
                    <View className="flex-row items-center">
                      <View className={`h-10 border-l-2 border-dashed ${dashColor} mr-3 opacity-60`} />
                      <View className="rounded-xl py-1.5 px-3 items-center justify-center min-w-[56px] shadow-sm" style={{ backgroundColor: solidBgHex }}>
                        <Text className="text-white font-black text-lg leading-tight">{pct}%</Text>
                        <Text className="text-white/90 font-bold text-[8px] uppercase tracking-wider">{isShortage ? 'LOW' : 'STOCK'}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Active Alerts */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <Text className="text-brand-navy font-black text-[22px]">{t('phcDetailActiveAlertsTitle')}</Text>
          </View>
          <View className="w-full bg-white rounded-[24px] border-[2px] border-red-200 shadow-sm shadow-slate-200/50 p-5 relative overflow-hidden">

            <View>
              {phcAlerts.length > 0 ? phcAlerts.map(alert => (
                <View key={alert.id} className={`flex-row items-center rounded-xl p-3 border mb-3 ${alert.type === 'OUTBREAK' ? 'bg-red-50 border-red-100' : alert.type === 'SHORTAGE' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                  <View className={`mr-3 rounded-full p-2 ${alert.type === 'OUTBREAK' ? 'bg-red-100' : alert.type === 'SHORTAGE' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <MaterialCommunityIcons
                      name={alert.type === 'OUTBREAK' ? 'alert-circle-outline' : alert.type === 'SHORTAGE' ? 'medical-bag' : 'information-outline'}
                      size={20}
                      color={alert.type === 'OUTBREAK' ? '#EF4444' : alert.type === 'SHORTAGE' ? '#F59E0B' : '#3B82F6'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`${alert.type === 'OUTBREAK' ? 'text-red-600' : alert.type === 'SHORTAGE' ? 'text-amber-600' : 'text-blue-600'} font-bold text-xs mb-0.5`}>{alert.title}</Text>
                    <Text className="text-slate-500 text-[10px] font-medium">{alert.description}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={alert.type === 'OUTBREAK' ? '#EF4444' : alert.type === 'SHORTAGE' ? '#F59E0B' : '#3B82F6'} />
                </View>
              )) : (
                <View className="items-center py-6">
                  <Feather name="check-circle" size={32} color="#10B981" />
                  <Text className="text-slate-500 font-bold mt-2">{t('phcDetailNoActiveAlerts')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* INFRASTRUCTURE SNAPSHOT */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <Text className="text-brand-navy font-black text-[22px]">{t('phcDetailInfrastructureTitle')}</Text>
          </View>
          <View className="bg-white rounded-[24px] border-[2px] border-blue-200 shadow-sm shadow-slate-200/50 p-5 relative overflow-hidden">

            <ScrollView
              ref={infraScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-2"
            >
              <View className="flex-row px-2 gap-3">
                <View className="rounded-2xl p-4 w-32 border border-blue-500 shadow-sm" style={{ backgroundColor: '#EFF6FF' }}>
                  <View className="flex-row items-center mb-3">
                    <View className="w-7 h-7 rounded-lg bg-blue-500 items-center justify-center mr-2 shadow-sm shadow-blue-200">
                      <MaterialCommunityIcons name="bed-empty" size={14} color="white" />
                    </View>
                    <Text className="text-slate-500 font-bold text-[10px] flex-1" numberOfLines={1}>{t('phcDetailTotalBeds')}</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">{phc.bedsTotal}</Text>
                </View>
                <View className="rounded-2xl p-4 w-32 border border-emerald-500 shadow-sm" style={{ backgroundColor: '#ECFDF5' }}>
                  <View className="flex-row items-center mb-3">
                    <View className="w-7 h-7 rounded-lg bg-emerald-500 items-center justify-center mr-2 shadow-sm shadow-emerald-200">
                      <MaterialCommunityIcons name="bed-outline" size={14} color="white" />
                    </View>
                    <Text className="text-slate-500 font-bold text-[10px] flex-1" numberOfLines={1}>{t('phcDetailAvailable')}</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">{phc.bedsTotal - phc.bedsOccupied}</Text>
                </View>
                <View className="rounded-2xl p-4 w-32 border border-purple-500 shadow-sm" style={{ backgroundColor: '#F3E8FF' }}>
                  <View className="flex-row items-center mb-3">
                    <View className="w-7 h-7 rounded-lg bg-purple-500 items-center justify-center mr-2 shadow-sm shadow-purple-200">
                      <MaterialCommunityIcons name="doctor" size={14} color="white" />
                    </View>
                    <Text className="text-slate-500 font-bold text-[10px] flex-1" numberOfLines={1}>{t('phcDetailConsultRoomsShort')}</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">{phc.consultRooms}</Text>
                </View>
                <View className="rounded-2xl p-4 w-32 border border-amber-500 shadow-sm" style={{ backgroundColor: '#FFFBEB' }}>
                  <View className="flex-row items-center mb-3">
                    <View className="w-7 h-7 rounded-lg bg-amber-500 items-center justify-center mr-2 shadow-sm shadow-amber-200">
                      <MaterialCommunityIcons name="ambulance" size={14} color="white" />
                    </View>
                    <Text className="text-slate-500 font-bold text-[10px] flex-1" numberOfLines={1}>{t('phcDetailAmbulances')}</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">{phc.ambulances}</Text>
                </View>
                <View className="rounded-2xl p-4 w-32 border border-red-500 shadow-sm" style={{ backgroundColor: '#FEF2F2' }}>
                  <View className="flex-row items-center mb-3">
                    <View className="w-7 h-7 rounded-lg bg-red-500 items-center justify-center mr-2 shadow-sm shadow-red-200">
                      <MaterialCommunityIcons name="gas-cylinder" size={14} color="white" />
                    </View>
                    <Text className="text-slate-500 font-bold text-[10px] flex-1" numberOfLines={1}>{t('phcDetailO2Cylinders')}</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">{phc.o2Cylinders}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* STAFF & DUTY ROSTER */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-3 ml-2 pr-1">
            <Text className="text-brand-navy font-black text-[22px]">{t('phcDetailStaffRosterTitle')}</Text>
          </View>
          
          {(() => {
            const attendancePct = Math.round((phc.staffPresent / phc.staffTotal) * 100);
            const isPerfect = attendancePct === 100;
            const isGood = attendancePct >= 80 && attendancePct < 100;
            
            const cardBorder = isPerfect ? 'border-emerald-400' : isGood ? 'border-amber-400' : 'border-red-400';
            const cardBg = isPerfect ? 'bg-emerald-50' : isGood ? 'bg-amber-50' : 'bg-red-50';
            const svgStroke = isPerfect ? '#10B981' : isGood ? '#F59E0B' : '#EF4444';
            const textAccent = isPerfect ? 'text-emerald-600' : isGood ? 'text-amber-600' : 'text-red-600';
            
            return (
              <View className={`rounded-[24px] border-2 shadow-sm shadow-slate-200/50 py-8 px-6 relative overflow-hidden ${cardBorder} ${cardBg}`}>
                <View className="flex-row items-center">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-end">
                      <Text className="text-brand-navy font-extrabold text-lg leading-none pb-0.5">{t('phcDetailMedicalOfficers')}</Text>
                    </View>
                    <Text className={`font-bold text-xs mt-1 mb-4 ${textAccent}`}>{phc.staffTotal - phc.staffPresent} {t('phcDetailAbsentTodaySuffix')}</Text>

                    <View className="flex-row mt-4">
                      <View className="w-32 rounded-2xl p-4 mr-3 border-2 border-slate-200 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                        <View className="flex-row items-center mb-1.5">
                          <MaterialCommunityIcons name="account-check-outline" size={14} color="#000000" className="mr-1" />
                          <Text className="text-black font-extrabold text-[11px]">{t('phcDetailStaffPresentLabel')}</Text>
                        </View>
                        <Text className={`font-black text-2xl ${textAccent}`}>{phc.staffPresent}</Text>
                      </View>
                      
                      <View className="w-32 rounded-2xl p-4 border-2 border-slate-200 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
                        <View className="flex-row items-center mb-1.5">
                          <MaterialCommunityIcons name="account-multiple-outline" size={14} color="#000000" className="mr-1" />
                          <Text className="text-black font-extrabold text-[11px]">{t('phcDetailTotalStaffLabel')}</Text>
                        </View>
                        <Text className={`font-black text-2xl ${textAccent}`}>{phc.staffTotal}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Circular Gauge */}
                  <View className="relative w-24 h-24 items-center justify-center ml-2">
                    <Svg height="100%" width="100%" viewBox="0 0 64 64" className="absolute">
                      <Circle cx="32" cy="32" r="24" stroke="#F1F5F9" strokeWidth="5" fill="none" />
                      <Circle cx="32" cy="32" r="24" stroke={svgStroke} strokeWidth="5" fill="none" strokeDasharray="150.8" strokeDashoffset={150.8 - (150.8 * attendancePct) / 100} strokeLinecap="round" transform="rotate(-90 32 32)" />
                    </Svg>
                    <View className="items-center justify-center">
                      <Text className={`font-black text-xl ${textAccent}`}>{attendancePct}%</Text>
                    </View>
                  </View>
            </View>
              </View>
            );
          })()}
        </View>

        {/* NETRA AI RECOMMENDATION CAROUSEL */}
        <View className="mb-6">
          {aiRecommendations.length === 0 ? (
            <View className="bg-green-50 rounded-[24px] border border-green-100 p-6 items-center justify-center mt-2 mx-4">
              <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-3">
                <Feather name="check-circle" size={24} color="#16A34A" />
              </View>
              <Text className="text-green-800 font-extrabold text-[15px] mb-1">{t('phcDetailAllClearTitle')}</Text>
              <Text className="text-green-600 font-semibold text-center text-[12px]">{t('phcDetailAllClearDesc')}</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={SCREEN_WIDTH * 0.85 + 16}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onScroll={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / (SCREEN_WIDTH * 0.85 + 16));
                setCurrentAiIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {aiRecommendations.map((rec, index) => (
                <View key={rec.id} style={{ width: SCREEN_WIDTH * 0.85, marginRight: 16 }}>
                  <View className="bg-[#DADAFC] border border-[#C5C5EA] rounded-[24px] p-5 shadow-sm shadow-indigo-100 overflow-hidden relative">
                    {/* Header Row */}
                    <View className="flex-row items-center mb-4 z-10">
                      {/* Netra Logo */}
                      <View className="w-[60px] h-[60px] rounded-full bg-white items-center justify-center mr-3 border-[3px] border-[#E8EBF6] shadow-sm">
                        <Image source={require('../../data/netra.png')} style={{width: 36, height: 36}} resizeMode="contain" />
                      </View>
                      <View className="flex-1 justify-center">
                        <Text className="text-slate-400 font-extrabold text-[9px] tracking-widest mb-0.5">{t('phcDetailNetraRecommendationLabel') || 'NETRA AI RECOMMENDATIONS'}</Text>
                        <Text className="text-brand-navy font-black text-[15px] leading-tight" numberOfLines={2}>
                          {translateDynamic(rec.title)}
                        </Text>
                      </View>
                      {/* Confidence Pill */}
                      <View className="bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-1 rounded-[8px] flex-row items-center">
                        <MaterialIcons name="check-circle" size={12} color="#15803D" />
                        <Text className="text-[#15803D] font-bold text-[9px] ml-1">89.0% Conf.</Text>
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
                          <Text className="text-[#15803D] font-extrabold text-[8px] uppercase tracking-wider mb-0.5">{t('phcDetailSourceFacilityLabel') || 'Source'}</Text>
                          <Text className="text-brand-navy font-bold text-[12px] mb-1" numberOfLines={1}>
                            {translateDynamic(rec.sourceFacility)}
                          </Text>
                          <View className="bg-green-100 px-1.5 py-0.5 rounded-[4px] self-start">
                            <Text className="text-[#15803D] font-bold text-[8px]">In Stock</Text>
                          </View>
                        </View>
                      </View>

                      {/* Arrow */}
                      <View className="w-6 h-6 rounded-full bg-white items-center justify-center mx-1.5 shadow-sm shadow-black/5 border border-slate-100 z-20">
                        <Feather name="arrow-right" size={12} color="#6366F1" />
                      </View>

                      {/* Target Facility Glass Card (Red) */}
                      <View className="bg-[#FEF2F2] rounded-[16px] p-3 flex-1 flex-row items-center border border-[#FEE2E2] shadow-sm shadow-red-100">
                        <View className="w-[38px] h-[38px] rounded-[12px] bg-[#EF4444] items-center justify-center mr-2">
                          <MaterialCommunityIcons name="hospital-building" size={20} color="white" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-red-700 font-extrabold text-[8px] uppercase tracking-wider mb-0.5">{t('phcDetailTargetFacilityLabel') || 'Target'}</Text>
                          <Text className="text-brand-navy font-bold text-[12px] mb-1" numberOfLines={1}>
                            {translateDynamic(rec.targetFacility)}
                          </Text>
                          <View className="bg-red-100 px-1.5 py-0.5 rounded-[4px] self-start">
                            <Text className="text-red-700 font-bold text-[8px]">Critical</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Reasoning */}
                    <View className="mb-4 z-10 rounded-[16px] p-2 flex-row items-center">
                      <View className="w-[36px] h-[36px] rounded-full bg-[#E0E7FF] items-center justify-center mr-3">
                        <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#6366F1" />
                      </View>
                      <View className="flex-1 pr-2 justify-center">
                        <Text className="text-[#6366F1] font-black text-[9px] tracking-widest uppercase mb-1.5">{t('phcDetailReasoningLabel') || 'Reasoning'}</Text>
                        <Text className="text-slate-600 font-medium text-[10.5px] leading-tight pr-2" numberOfLines={4}>• {translateDynamic(rec.reasoning)}</Text>
                      </View>
                      <View className="w-[150px] items-end justify-center -my-2 -mr-10">
                        <Image source={require('../../assets/images/reasoning_illustration.png')} style={{width: 150, height: 100}} resizeMode="contain" />
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="z-10">
                      <Pressable
                        onPress={() => handleApproveReject(rec.id, true)}
                        className="w-full py-3.5 rounded-[14px] bg-[#6366F1] items-center justify-center flex-row shadow-md shadow-indigo-500/30 active:bg-indigo-600"
                      >
                        <Feather name="check-circle" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-[14px]">{t('phcDetailApproveButton') || 'Approve Request'}</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Pagination Dots */}
          {aiRecommendations.length > 0 && (
            <View className="flex-row justify-center items-center mt-3 space-x-1.5 gap-1.5">
              {aiRecommendations.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full ${index === currentAiIndex ? 'w-4 bg-indigo-500' : 'w-1.5 bg-slate-300'}`}
                />
              ))}
            </View>
          )}
        </View>

        {/* BOTTOM SECTION (TRENDS & ALERTS) */}
        <View className="px-4 mb-6 flex-col">
          <Text className="text-brand-navy font-black text-[22px] mb-4 mt-2">{t('phcDetailWeeklyFootfallLabel')}</Text>

          {/* Trends */}
          <View className="w-full bg-blue-100/60 rounded-[24px] p-5 shadow-sm shadow-blue-500/10 border border-blue-600 mb-4">
            <View className="flex-row items-start justify-between z-10 mb-2">
              <View className="w-[46px] h-[46px] rounded-full bg-blue-600 items-center justify-center border-[4px] border-blue-50 shadow-md shadow-blue-500/30">
                <Feather name="activity" size={20} color="white" />
              </View>
              <View className="flex-1 ml-4 pt-0.5">
                <View className="flex-row justify-end items-center mb-1">
                  <Text className={`text-base font-black px-3 py-1 rounded-[8px] ${footfallTrend === 'up' ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' : 'text-red-700 bg-red-100 border border-red-200'}`}>
                    {footfallTrend === 'up' ? '↑' : '↓'} {footfallPct}%
                  </Text>
                </View>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-4xl font-black text-slate-800 tracking-tighter">{totalFootfall}</Text>
                  <Text className="text-sm font-bold text-slate-400 ml-1">{t('phcDetailPatientsSuffix')}</Text>
                </View>
              </View>
            </View>

            {/* Detailed Graph Area */}
            <View className="h-[180px] mt-2 relative -mx-1">
              {/* Average Line Label */}
              <Text className="absolute top-[80px] right-2 text-[9px] font-black text-slate-400 uppercase bg-white/90 px-1 z-10">{t('phcDetailAvgFootfallPrefix')} {avgFootfall}</Text>

              <Svg height="100%" width="100%" viewBox="0 0 350 180">
                <Defs>
                  <SvgLinearGradient id="footfallDetailGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.25" />
                    <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
                  </SvgLinearGradient>
                </Defs>

                {/* Average Line */}
                <Path d="M0,100 L350,100" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4,4" />

                {/* Gradient Fill */}
                <Path d={areaPath} fill="url(#footfallDetailGrad)" />

                {/* Main Trend Line */}
                <Path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points (Tappable) */}
                {graphPts.map((pt) => (
                  <G key={pt.i}>
                    {/* Visible Circle */}
                    <Circle
                      key={`vis-${pt.i}`}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={activeDataPoint === pt.i ? 6 : 4.5}
                      fill={activeDataPoint === pt.i ? "#3B82F6" : "white"}
                      stroke={activeDataPoint === pt.i ? "white" : "#3B82F6"}
                      strokeWidth="2"
                    />
                    {/* Invisible Touch Target (Larger Hit Area) */}
                    <Circle
                      key={`inv-${pt.i}`}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="25"
                      fill="transparent"
                      {...(Platform.OS === 'web'
                        ? { onClick: () => setActiveDataPoint(pt.i) } as any
                        : { onPress: () => setActiveDataPoint(pt.i) }
                      )}
                    />
                  </G>
                ))}

                {/* Dynamic Tooltip inside SVG */}
                {activeDataPoint !== null && (
                  <SvgText
                    x={graphPts[activeDataPoint].cx}
                    y={graphPts[activeDataPoint].cy - 15}
                    fill="#1E293B"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {graphPts[activeDataPoint].val}
                  </SvgText>
                )}
              </Svg>
            </View>

            {/* X-Axis Labels */}
            <View className="flex-row justify-between px-2 mt-2 pt-1 border-t border-slate-100">
              {[t('phcDetailDayMon'), t('phcDetailDayTue'), t('phcDetailDayWed'), t('phcDetailDayThu'), t('phcDetailDayFri'), t('phcDetailDaySat'), t('phcDetailDaySun')].map((day, i) => (
                <Text key={i} className={`text-[10px] ${activeDataPoint === i ? 'font-black text-blue-600' : 'font-bold text-slate-400'}`}>
                  {day}
                </Text>
              ))}
            </View>
          </View>



        </View>

      </ScrollView>
    </View>
  );
}
