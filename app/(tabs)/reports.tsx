import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { phcRepository } from '@/services/repositories/phcRepository';
import { alertsRepository } from '@/services/repositories/alertsRepository';
import { transfersRepository } from '@/services/repositories/transfersRepository';
import { reportsRepository } from '@/services/repositories/reportsRepository';
import Svg, { Circle, Path, Defs, Stop, LinearGradient as SvgLinearGradient, Rect, Text as SvgText, G } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { PHC } from '@/shared/types/phc';
import { AlertItem } from '@/shared/types/alert';
import { TransferOrder } from '@/services/repositories/localDb';
import { DiseaseTrend } from '@/dummy/diseaseTrends';
import { MedicineStock } from '@/shared/types/medicine';

export default function ReportsScreen() {
  const { authState } = useAuth();
  const [timeframe, setTimeframe] = useState('7_days');
  const [isTimeframeModalVisible, setIsTimeframeModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [fetchedPHCs, setFetchedPHCs] = useState<PHC[]>([]);
  const [fetchedAlerts, setFetchedAlerts] = useState<AlertItem[]>([]);
  const [fetchedTransfers, setFetchedTransfers] = useState<TransferOrder[]>([]);
  const [fetchedDiseaseTrends, setFetchedDiseaseTrends] = useState<DiseaseTrend[]>([]);
  const [fetchedMedicines, setFetchedMedicines] = useState<MedicineStock[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [phcsData, alertsData, transfersData, diseaseTrendsData, medicinesData] = await Promise.all([
          phcRepository.getAllPHCs(),
          alertsRepository.getAlerts(),
          transfersRepository.getTransfers(),
          reportsRepository.getDiseaseTrends(),
          phcRepository.getAllInventory(),
        ]);

        if (isMounted) {
          setFetchedPHCs(phcsData);
          setFetchedAlerts(alertsData);
          setFetchedTransfers(transfersData);

          let trends = [...diseaseTrendsData];
          if (timeframe === 'today') trends = trends.map(t => ({...t, cases: Math.max(1, Math.round(t.cases / 7))}));
          if (timeframe === '30_days') trends = trends.map(t => ({...t, cases: Math.max(1, Math.round(t.cases * 4.2))}));
          setFetchedDiseaseTrends(trends);
          setFetchedMedicines(medicinesData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch reports data', error);
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [timeframe]);
  const router = useRouter();
  const { t, language } = useTranslation();

  // Auto-scroll for Epidemiological Watch
  const epiScrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    if (!fetchedDiseaseTrends || fetchedDiseaseTrends.length === 0) return;
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % fetchedDiseaseTrends.length;
      epiScrollViewRef.current?.scrollTo({ x: currentIndex * 156, animated: true });
    }, 3000);
    return () => clearInterval(intervalId);
  }, [fetchedDiseaseTrends.length]);

  const isDHO = authState?.role === 'DHO';
  const isBMO = authState?.role === 'BMO';
  const assignedFacilityId = authState?.facilityId || 'phc_barola';

  const reportPhcs = isDHO
    ? fetchedPHCs
    : isBMO
      ? fetchedPHCs.filter(p => p.block === assignedFacilityId)
      : fetchedPHCs.filter(p => p.id === assignedFacilityId);

  const phcIds = reportPhcs.map(p => p.id);

  // Key Metrics
  const totalBeds = reportPhcs.reduce((sum, p) => sum + p.bedsTotal, 0);
  const occupiedBeds = reportPhcs.reduce((sum, p) => sum + p.bedsOccupied, 0);
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalStaff = reportPhcs.reduce((sum, p) => sum + p.staffTotal, 0);
  const presentStaff = reportPhcs.reduce((sum, p) => sum + p.staffPresent, 0);
  const staffAttendanceRate = totalStaff > 0 ? Math.round((presentStaff / totalStaff) * 100) : 0;

  const avgHealthScore = reportPhcs.length > 0 
    ? Math.round(reportPhcs.reduce((sum, p) => sum + p.healthScore, 0) / reportPhcs.length)
    : 0;

  const activeAlerts = fetchedAlerts.filter(a => phcIds.includes(a.facilityId) && !a.resolved);
  const criticalAlertsCount = activeAlerts.filter(a => a.priority === 'CRITICAL').length;

  // Weekly Footfall Aggregation (assuming 7 days data)
  let aggregatedFootfall = [0, 0, 0, 0, 0, 0, 0];
  reportPhcs.forEach(phc => {
    phc.weeklyFootfall.forEach((val, i) => {
      aggregatedFootfall[i] += val;
    });
  });

  if (timeframe === 'today') {
    aggregatedFootfall = aggregatedFootfall.map(v => Math.max(1, Math.round(v / 7)));
  } else if (timeframe === '30_days') {
    aggregatedFootfall = aggregatedFootfall.map(v => Math.round(v * 4.2));
  }
  const todayFootfall = aggregatedFootfall[6] || 0;
  const yesterdayFootfall = aggregatedFootfall[5] || 0;
  const footfallDiff = todayFootfall - yesterdayFootfall;
  const footfallTrend = yesterdayFootfall > 0 ? Math.round((footfallDiff / yesterdayFootfall) * 100) : 0;

  // Dynamic SVG generation
  const [activeOpdPoint, setActiveOpdPoint] = useState<number | null>(6);
  const maxFootfall = Math.max(...aggregatedFootfall, 10);
  
  const getOpdData = () => {
    const xPoints = [30, 80, 130, 180, 230, 280, 330];
    return aggregatedFootfall.map((val, i) => {
      const h = Math.min(100, Math.max(10, (val / (maxFootfall * 1.2)) * 100));
      const yTop = 120 - h;
      return { cx: xPoints[i], h, yTop, val: val.toString() };
    });
  };
  const opdData = getOpdData();

  // Resource Utilization
  const totalAmbulances = reportPhcs.reduce((sum, p) => sum + p.ambulances, 0);
  const totalO2 = reportPhcs.reduce((sum, p) => sum + p.o2Cylinders, 0);

  // Pharmacy & Logistics
  const criticalStockItems = isDHO 
    ? fetchedMedicines.filter(m => m.currentStock <= m.minRequiredStock)
    : fetchedMedicines.filter(m => m.currentStock <= m.minRequiredStock && phcIds.includes(m.facilityId));
  const activeShipments = fetchedTransfers.filter(t => t.status === 'EN_ROUTE');

  // Critical Watchlist
  const criticalPhcs = [...reportPhcs]
    .filter(p => p.healthScore < 80 || p.activeAlertsCount > 0 || p.stockStatus === 'critical' || p.stockStatus === 'warning')
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 3);

  const getPhcName = (phc: any) => {
    if (!phc) return t('reportsHeaderDefaultFacility');
    return (language === 'hi' && phc.nameHi) ? phc.nameHi : phc.name;
  };

  const getBlockName = () => {
    if (language === 'hi') {
      const phc = fetchedPHCs.length > 0 ? fetchedPHCs.find(p => p.block === assignedFacilityId) : null;
      if (phc && phc.blockHi) return phc.blockHi;
    }
    return assignedFacilityId.toUpperCase();
  };

  const headerTitle = isDHO ? t('reportsHeaderDefaultDistrict') : isBMO ? `${getBlockName()} ${t('reportsHeaderBlockSuffix')}` : `${getPhcName(reportPhcs[0])} ${t('reportsHeaderFacilitySuffix')}`;

  
  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-slate-500 font-bold mt-4">{t('reportsLoading')}</Text>
      </View>
    );
  }

  return (
    <>
      <Modal visible={isTimeframeModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-[24px] w-full p-6 shadow-xl">
            <Text className="text-brand-navy font-black text-xl mb-4 text-center">Select Timeframe</Text>
            
            <TouchableOpacity 
              onPress={() => { setTimeframe('today'); setIsTimeframeModalVisible(false); }}
              className={`p-4 rounded-[16px] border mb-3 ${timeframe === 'today' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-center font-bold ${timeframe === 'today' ? 'text-blue-600' : 'text-slate-600'}`}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { setTimeframe('7_days'); setIsTimeframeModalVisible(false); }}
              className={`p-4 rounded-[16px] border mb-3 ${timeframe === '7_days' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-center font-bold ${timeframe === '7_days' ? 'text-blue-600' : 'text-slate-600'}`}>Last 7 Days</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { setTimeframe('30_days'); setIsTimeframeModalVisible(false); }}
              className={`p-4 rounded-[16px] border mb-4 ${timeframe === '30_days' ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-200'}`}
            >
              <Text className={`text-center font-bold ${timeframe === '30_days' ? 'text-blue-600' : 'text-slate-600'}`}>Last 30 Days</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setIsTimeframeModalVisible(false)}
              className="p-4 rounded-[16px] bg-slate-100"
            >
              <Text className="text-center font-bold text-slate-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ScrollView className="flex-1 bg-[#F8FAFC]" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
      
      {/* HEADER */}
      <View className="px-4 mt-6 flex-row justify-between items-start mb-6">
        <View>
          <View className="flex-row items-center mb-1">
            <Text className="text-2xl font-black text-brand-navy leading-tight tracking-tight">{headerTitle}</Text>
          </View>
          <Text className="text-slate-500 text-xs font-medium">{t('reportsSubtitle')}</Text>
        </View>
        <TouchableOpacity onPress={() => setIsTimeframeModalVisible(true)} className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm">
    <MaterialCommunityIcons name="chart-bar" size={20} color="#3B82F6" />
  </TouchableOpacity>
      </View>

      {/* KEY METRICS GRID */}
      <View className="px-4 flex-row flex-wrap justify-between mb-2">
        
        {/* Footfall Card */}
        <View className="w-[48%] bg-[#DBEAFE] rounded-[16px] p-4 border border-[#3B82F6]/60 shadow-sm shadow-blue-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="account-group" size={100} color="rgba(59,130,246,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsTodaysOpd')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <MaterialCommunityIcons name="account-group" size={20} color="#3B82F6" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">{todayFootfall}</Text>
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name={footfallDiff >= 0 ? "arrow-top-right-thick" : "arrow-bottom-right-thick"} size={12} color={footfallDiff >= 0 ? "#10B981" : "#EF4444"} />
              <Text className={`font-bold text-[13px] ml-1 mr-1 ${footfallDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>{Math.abs(footfallTrend)}%</Text>
              <Text className="text-slate-400 text-[14px] font-bold">{t('reportsVsYesterday')}</Text>
            </View>
          </View>
        </View>

        {/* Health Score Card */}
        <View className="w-[48%] bg-[#D1FAE5] rounded-[16px] p-4 border border-[#10B981]/60 shadow-sm shadow-emerald-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="heart-pulse" size={100} color="rgba(16,185,129,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsAvgHealth')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#10B981" />
            </View>
          </View>
          <View>
            <View className="flex-row items-baseline">
              <Text className="text-brand-navy font-black text-3xl tracking-tight">{avgHealthScore}</Text>
              <Text className="text-slate-400 font-bold text-xs ml-0.5">/100</Text>
            </View>
            <View className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <View className={`h-full rounded-full ${avgHealthScore > 80 ? 'bg-emerald-500' : avgHealthScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${avgHealthScore}%` }}></View>
            </View>
          </View>
        </View>

        {/* Beds Occupancy Card */}
        <View className="w-[48%] bg-[#FFEDD5] rounded-[16px] p-4 border border-[#F97316]/60 shadow-sm shadow-orange-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="bed-outline" size={100} color="rgba(249,115,22,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsIpdBeds')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
              <MaterialCommunityIcons name="bed-outline" size={20} color="#F97316" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">{bedOccupancyRate}%</Text>
            <Text className="text-slate-400 text-[14px] font-bold mt-1 uppercase tracking-wider">{occupiedBeds} {t('reportsOccupiedOfTotalJoiner')} {totalBeds} {t('reportsOccupiedOfTotal')}</Text>
          </View>
        </View>

        {/* Alerts Card */}
        <View className="w-[48%] bg-[#FEE2E2] rounded-[16px] p-4 border border-[#EF4444]/60 shadow-sm shadow-red-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="alert-outline" size={100} color="rgba(239,68,68,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsActiveAlerts')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
              <MaterialCommunityIcons name="alert-outline" size={20} color="#EF4444" />
            </View>
          </View>
          <View>
            <Text className="text-red-500 font-black text-3xl tracking-tight">{activeAlerts.length}</Text>
            <View className="flex-row items-center mt-1 bg-red-50 self-start px-2 py-0.5 rounded-full border border-red-100">
              <MaterialCommunityIcons name="alert-circle" size={10} color="#EF4444" style={{marginRight: 4}} />
              <Text className="text-red-500 font-bold text-[14px] uppercase tracking-wider">{criticalAlertsCount} {t('reportsCriticalSuffix')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* OPD TREND GRAPH */}
      <View className="px-4 mb-6">
        <View className="w-full bg-[#E0E7FF] rounded-[16px] p-4 border border-[#4F46E5]/60 shadow-sm shadow-indigo-500/10 relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-4 relative z-10">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center mr-3 border border-indigo-200">
                <MaterialCommunityIcons name="chart-line-variant" size={16} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-brand-navy font-black text-sm">{t('reports7DayOpdFootfall')}</Text>
                <Text className="text-indigo-500 text-[13px] font-bold">{t('reportsAggregatedTraffic')}</Text>
              </View>
            </View>
            <View className="bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Text className="text-slate-600 font-bold text-[13px]">{t('reportsMaxLabel')} {maxFootfall}</Text>
            </View>
          </View>
          
          <View className="h-40 w-full relative mt-2">
            <Svg height="100%" width="100%" viewBox="0 0 350 160" pointerEvents="none">
              {/* Grid Lines */}
              <Path d="M0,20 L350,20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <Path d="M0,45 L350,45" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <Path d="M0,70 L350,70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <Path d="M0,95 L350,95" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <Path d="M0,120 L350,120" stroke="#E2E8F0" strokeWidth="1" />

              {/* Bars & Interactivity */}
              {opdData.map((bar, i) => (
                <G key={`opd-${i}`}>
                  <Rect 
                    x={bar.cx - 10} 
                    y={bar.yTop} 
                    width="20" 
                    height={bar.h} 
                    rx="6" 
                    fill={activeOpdPoint === i ? "#4F46E5" : "#EEF2FF"} 
                  />
                  
                  {/* Tooltip */}
                  {activeOpdPoint === i && (
                    <G>
                      <Rect x={bar.cx - 20} y={bar.yTop - 26} width="40" height="18" rx="6" fill="#4F46E5" />
                      <Path d={`M${bar.cx - 5},${bar.yTop - 8} L${bar.cx + 5},${bar.yTop - 8} L${bar.cx},${bar.yTop - 3} Z`} fill="#4F46E5" />
                      <SvgText x={bar.cx} y={bar.yTop - 13} fill="white" fontSize="10" fontWeight="900" textAnchor="middle">{bar.val}</SvgText>
                    </G>
                  )}
                </G>
              ))}

              {/* X-Axis Labels */}
              {(timeframe === 'today' 
                ? ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM'] 
                : timeframe === '30_days'
                  ? ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7']
                  : [t('reportsDayMon'), t('reportsDayTue'), t('reportsDayWed'), t('reportsDayThu'), t('reportsDayFri'), t('reportsDaySat'), t('reportsDaySun')]
              ).map((d, i) => (
                <SvgText
                  key={`label-${i}`}
                  x={opdData[i].cx}
                  y={145}
                  fill={activeOpdPoint === i ? "#4F46E5" : "#94A3B8"}
                  fontSize="12"
                  fontWeight={activeOpdPoint === i ? "900" : "bold"}
                  textAnchor="middle"
                >
                  {d}
                </SvgText>
              ))}
            </Svg>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, zIndex: 10 }}>
              {opdData.map((bar, i) => (
                <Pressable
                  key={`hit-opd-${i}`}
                  onPress={() => setActiveOpdPoint(i)}
                  style={{ position: 'absolute', left: `${(bar.cx / 350) * 100}%`, top: 0, bottom: 0, width: 40, marginLeft: -20 }}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* EPIDEMIOLOGICAL TRENDS */}
      {(isDHO || isBMO) && (
        <View className="mb-6">
          <Text className="text-brand-navy font-black text-[22px] mb-3 ml-5">{t('reportsEpidemiologicalWatch')}</Text>
          <ScrollView ref={epiScrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
            {fetchedDiseaseTrends.map((trend) => (
              <View key={trend.id} className="rounded-[16px] p-4 border shadow-sm w-36 mr-3" style={{ backgroundColor: trend.color + '33', borderColor: trend.color + '99' }}>
                <View className="flex-row items-center mb-1">
                  <MaterialCommunityIcons 
                    name={({'Viral Fever': 'thermometer', 'Dengue': 'mosquito', 'Typhoid': 'bacteria-outline', 'Malaria': 'bug', 'Chikungunya': 'virus-outline'}[trend.disease] || 'virus-outline') as any} 
                    size={14} 
                    color={trend.color} 
                    style={{marginRight: 4}} 
                  />
                  <Text className="text-slate-500 font-bold text-[13px] uppercase flex-1" numberOfLines={1}>
                    {language === 'hi' ? 
                      ({'Viral Fever': 'वायरल बुखार', 'Dengue': ' डेंगू', 'Typhoid': 'टाइफाइड', 'Malaria': 'मलेरिया', 'Chikungunya': 'चिकनगुनिया'}[trend.disease] || trend.disease) 
                      : trend.disease}
                  </Text>
                </View>
                <View className="flex-row items-baseline mb-2">
                  <Text className="text-brand-navy font-black text-xl">{trend.cases}</Text>
                  <Text className={`font-bold text-[14px] ml-2 ${trend.isUp ? 'text-red-500' : 'text-emerald-500'}`}>{trend.trend}</Text>
                </View>
                {/* Mini Sparkline */}
                <View className="h-8 w-full mt-1">
                  <Svg height="100%" width="100%" viewBox="0 0 100 30" pointerEvents="none">
                    <Path
                      d={`M0,${30 - (trend.data[0] / 210) * 30} ${trend.data.map((d, i) => `L${(i / (trend.data.length - 1)) * 100},${30 - (d / 210) * 30}`).join(' ')}`}
                      stroke={trend.color}
                      strokeWidth="2"
                      fill="none"
                    />
                  </Svg>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* PHARMACY & LOGISTICS OVERVIEW */}
      <View className="px-4 mb-6">
        <Text className="text-brand-navy font-black text-[22px] mb-3 ml-1">{t('reportsPharmacyLogistics')}</Text>
        <View className="flex-row justify-between">
          
          <View className="w-[48%] bg-[#FEE2E2] rounded-[16px] p-4 border border-[#EF4444]/60 shadow-sm shadow-red-500/10">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-2 border border-red-100">
                <MaterialCommunityIcons name="medical-bag" size={14} color="#EF4444" />
              </View>
              <Text className="text-slate-500 font-bold text-[13px]">{t('reportsCriticalStocks')}</Text>
            </View>
            <Text className="text-brand-navy font-black text-2xl">{criticalStockItems.length}</Text>
            <Text className="text-slate-400 font-bold text-[14px] mt-1">{t('reportsItemsNeedRestock')}</Text>
          </View>

          <View className="w-[48%] bg-[#E0E7FF] rounded-[16px] p-4 border border-[#4F46E5]/60 shadow-sm shadow-indigo-500/10">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-2 border border-indigo-100">
                <MaterialCommunityIcons name="truck-fast-outline" size={16} color="#4F46E5" />
              </View>
              <Text className="text-slate-500 font-bold text-[13px]">{t('reportsActiveTransfers')}</Text>
            </View>
            <Text className="text-brand-navy font-black text-2xl">{activeShipments.length}</Text>
            <Text className="text-slate-400 font-bold text-[14px] mt-1">{t('reportsShipmentsEnRoute')}</Text>
          </View>

        </View>
      </View>

      {/* RESOURCE UTILIZATION */}
      <View className="px-4 mb-6">
        <Text className="text-brand-navy font-black text-[22px] mb-3 ml-1">{t('reportsResourceUtilization')}</Text>
        <View className="flex-row justify-between">
          
          <View className="w-[31%] bg-[#CCFBF1] rounded-[16px] p-3 border border-[#0D9488]/60 shadow-sm shadow-teal-500/10 items-center justify-center py-4">
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center mb-2 shadow-sm shadow-black/5">
              <MaterialCommunityIcons name="doctor" size={16} color="#0D9488" />
            </View>
            <Text className="text-brand-navy font-black text-xl leading-tight">{staffAttendanceRate}%</Text>
            <Text className="text-teal-700 font-bold text-[14px] mt-1 uppercase tracking-wider text-center">{t('reportsStaffPresent')}</Text>
          </View>

          <View className="w-[31%] bg-[#FFE4E6] rounded-[16px] p-3 border border-[#E11D48]/60 shadow-sm shadow-rose-500/10 items-center justify-center py-4">
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center mb-2 shadow-sm shadow-black/5">
              <MaterialCommunityIcons name="ambulance" size={16} color="#E11D48" />
            </View>
            <Text className="text-brand-navy font-black text-xl leading-tight">{totalAmbulances}</Text>
            <Text className="text-rose-700 font-bold text-[14px] mt-1 uppercase tracking-wider text-center">{t('reportsAmbulances')}</Text>
          </View>

          <View className="w-[31%] bg-[#E0F2FE] rounded-[16px] p-3 border border-[#0284C7]/60 shadow-sm shadow-sky-500/10 items-center justify-center py-4">
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center mb-2 shadow-sm shadow-black/5">
              <MaterialCommunityIcons name="gas-cylinder" size={16} color="#0284C7" />
            </View>
            <Text className="text-brand-navy font-black text-xl leading-tight">{totalO2}</Text>
            <Text className="text-sky-700 font-bold text-[14px] mt-1 uppercase tracking-wider text-center">{t('reportsO2Cylinders')}</Text>
          </View>

        </View>
      </View>

      {/* ADDITIONAL METRICS GRID */}
      <View className="px-4 flex-row flex-wrap justify-between mb-2">
        <Text className="text-brand-navy font-black text-[22px] mb-3 ml-1 w-full">{t('reportsAdditionalMetrics')}</Text>
        
        {/* Lab Tests */}
        <View className="w-[48%] bg-[#E9D5FF] rounded-[16px] p-4 border border-[#8B5CF6]/60 shadow-sm shadow-purple-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="test-tube" size={100} color="rgba(139,92,246,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsLabTests')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center">
              <MaterialCommunityIcons name="test-tube" size={20} color="#8B5CF6" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">432</Text>
            <Text className="text-slate-400 text-[14px] font-bold mt-1 uppercase tracking-wider">{t('reportsConductedToday')}</Text>
          </View>
        </View>

        {/* Vaccinations */}
        <View className="w-[48%] bg-[#CCFBF1] rounded-[16px] p-4 border border-[#0D9488]/60 shadow-sm shadow-teal-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="needle" size={100} color="rgba(20,184,166,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsVaccinations')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center">
              <MaterialCommunityIcons name="needle" size={20} color="#0D9488" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">185</Text>
            <Text className="text-slate-400 text-[14px] font-bold mt-1 uppercase tracking-wider">{t('reportsDosesAdministered')}</Text>
          </View>
        </View>

        {/* Deliveries */}
        <View className="w-[48%] bg-[#FCE7F3] rounded-[16px] p-4 border border-[#EC4899]/60 shadow-sm shadow-pink-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="baby-carriage" size={100} color="rgba(236,72,153,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsDeliveries')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center">
              <MaterialCommunityIcons name="baby-carriage" size={20} color="#EC4899" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">14</Text>
            <Text className="text-slate-400 text-[14px] font-bold mt-1 uppercase tracking-wider">{t('reportsMaternalDeliveries')}</Text>
          </View>
        </View>

        {/* Emergency */}
        <View className="w-[48%] bg-[#FFE4E6] rounded-[16px] p-4 border border-[#E11D48]/60 shadow-sm shadow-rose-500/10 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="hospital-marker" size={100} color="rgba(225,29,72,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[13px] uppercase tracking-wider leading-tight">{t('reportsEmergencies')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center">
              <MaterialCommunityIcons name="hospital-marker" size={20} color="#E11D48" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">27</Text>
            <Text className="text-slate-400 text-[14px] font-bold mt-1 uppercase tracking-wider">{t('reportsAdmissionsToday')}</Text>
          </View>
        </View>
      </View>

      {/* CRITICAL WATCHLIST (Only for DHO/BMO) */}
      {(isDHO || isBMO) && criticalPhcs.length > 0 && (
        <View className="px-4 mb-8">
          <Text className="text-brand-navy font-black text-[22px] mb-3 ml-1">{t('reportsNeedsAttention')}</Text>
          {criticalPhcs.map((phc, idx) => (
            <Pressable 
              key={phc.id}
              onPress={() => router.push({ pathname: '/(tabs)/phc-detail', params: { id: phc.id } })}
              className={`bg-[#FEF2F2] rounded-[16px] p-4 border border-[#EF4444]/40 shadow-sm flex-row items-center relative overflow-hidden ${idx !== criticalPhcs.length - 1 ? 'mb-3' : ''}`}
            >
              {/* Left thick indicator line */}
              <View className="absolute left-0 top-3 bottom-3 w-[4px] bg-[#EF4444] rounded-r-md" />

              {/* Icon Box */}
              <View className="ml-2 w-[42px] h-[42px] rounded-[12px] bg-[#FEE2E2] items-center justify-center mr-3">
                <MaterialCommunityIcons name="hospital-building" size={22} color="#EF4444" />
              </View>

              {/* Middle Content */}
              <View className="flex-1 pr-2 justify-center">
                <Text className="text-brand-navy font-extrabold text-[15px] leading-tight">{getPhcName(phc)}</Text>
                <Text className="text-slate-500 text-[13px] font-bold mt-1">
                  <Text className="text-red-500">{phc.activeAlertsCount} {t('reportsActiveAlertsBullet')}</Text> • {phc.stockStatus} {t('reportsStockSuffix')}
                </Text>
              </View>

              {/* Dashed Separator */}
              <View className="mx-2 justify-center items-center">
                <Svg height="36" width="2">
                  <Path d="M1,0 L1,36" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="5 4" />
                </Svg>
              </View>

              {/* Score Box */}
              <View className="items-center justify-center w-[46px] bg-[#EF4444] border border-[#F87171] shadow-sm shadow-red-500/30 rounded-[12px] py-1.5 ml-1">
                <Text className="text-white font-black text-[16px] leading-tight text-center px-1" numberOfLines={1} adjustsFontSizeToFit>{phc.healthScore}</Text>
                <Text className="font-extrabold text-[7.5px] mt-0.5 text-red-100 uppercase tracking-widest">Score</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

    </ScrollView>
    </>
  );
}
