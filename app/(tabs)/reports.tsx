import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { localPHCs, localAlerts, localDiseaseTrends, localMedicines, localTransfers } from '@/services/repositories/localDb';
import Svg, { Circle, Path, Defs, Stop, LinearGradient as SvgLinearGradient, Rect, Text as SvgText, G } from 'react-native-svg';
import { useRouter } from 'expo-router';

export default function ReportsScreen() {
  const { authState } = useAuth();
  const router = useRouter();
  const { t, language } = useTranslation();

  const isDHO = authState?.role === 'DHO';
  const isBMO = authState?.role === 'BMO';
  const assignedFacilityId = authState?.facilityId || 'phc_barola';

  const reportPhcs = isDHO
    ? localPHCs
    : isBMO
      ? localPHCs.filter(p => p.block === assignedFacilityId)
      : localPHCs.filter(p => p.id === assignedFacilityId);

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

  const activeAlerts = localAlerts.filter(a => phcIds.includes(a.facilityId) && !a.resolved);
  const criticalAlertsCount = activeAlerts.filter(a => a.priority === 'CRITICAL').length;

  // Weekly Footfall Aggregation (assuming 7 days data)
  const aggregatedFootfall = [0, 0, 0, 0, 0, 0, 0];
  reportPhcs.forEach(phc => {
    phc.weeklyFootfall.forEach((val, i) => {
      aggregatedFootfall[i] += val;
    });
  });
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
    ? localMedicines.filter(m => m.currentStock <= m.minRequiredStock)
    : localMedicines.filter(m => m.currentStock <= m.minRequiredStock && phcIds.includes(m.facilityId));
  const activeShipments = localTransfers.filter(t => t.status === 'EN_ROUTE');

  // Critical Watchlist
  const criticalPhcs = [...reportPhcs].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);

  const getPhcName = (phc: any) => {
    if (!phc) return t('reportsHeaderDefaultFacility');
    return (language === 'hi' && phc.nameHi) ? phc.nameHi : phc.name;
  };

  const getBlockName = () => {
    if (language === 'hi') {
      const phc = localPHCs.find(p => p.block === assignedFacilityId);
      if (phc && phc.blockHi) return phc.blockHi;
    }
    return assignedFacilityId.toUpperCase();
  };

  const headerTitle = isDHO ? t('reportsHeaderDefaultDistrict') : isBMO ? `${getBlockName()} ${t('reportsHeaderBlockSuffix')}` : `${getPhcName(reportPhcs[0])} ${t('reportsHeaderFacilitySuffix')}`;

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC]" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
      
      {/* HEADER */}
      <View className="px-4 mt-6 flex-row justify-between items-start mb-6">
        <View>
          <View className="flex-row items-center mb-1">
            <Text className="text-3xl font-black text-brand-navy tracking-tight">{headerTitle}</Text>
          </View>
          <Text className="text-slate-500 text-xs font-medium">{t('reportsSubtitle')}</Text>
        </View>
        <View className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm">
          <MaterialCommunityIcons name="chart-bar" size={20} color="#3B82F6" />
        </View>
      </View>

      {/* KEY METRICS GRID */}
      <View className="px-4 flex-row flex-wrap justify-between mb-2">
        
        {/* Footfall Card */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-blue-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="account-group" size={100} color="rgba(59,130,246,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">{t('reportsTodaysOpd')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <MaterialCommunityIcons name="account-group" size={20} color="#3B82F6" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">{todayFootfall}</Text>
            <View className="flex-row items-center mt-1">
              <MaterialCommunityIcons name={footfallDiff >= 0 ? "arrow-top-right-thick" : "arrow-bottom-right-thick"} size={12} color={footfallDiff >= 0 ? "#10B981" : "#EF4444"} />
              <Text className={`font-bold text-[10px] ml-1 mr-1 ${footfallDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>{Math.abs(footfallTrend)}%</Text>
              <Text className="text-slate-400 text-[9px] font-bold">{t('reportsVsYesterday')}</Text>
            </View>
          </View>
        </View>

        {/* Health Score Card */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-emerald-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="heart-pulse" size={100} color="rgba(16,185,129,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">{t('reportsAvgHealth')}</Text>
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
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-orange-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="bed-outline" size={100} color="rgba(249,115,22,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">{t('reportsIpdBeds')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
              <MaterialCommunityIcons name="bed-outline" size={20} color="#F97316" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">{bedOccupancyRate}%</Text>
            <Text className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-wider">{occupiedBeds} {t('reportsOccupiedOfTotalJoiner')} {totalBeds} {t('reportsOccupiedOfTotal')}</Text>
          </View>
        </View>

        {/* Alerts Card */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-red-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="alert-outline" size={100} color="rgba(239,68,68,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">{t('reportsActiveAlerts')}</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
              <MaterialCommunityIcons name="alert-outline" size={20} color="#EF4444" />
            </View>
          </View>
          <View>
            <Text className="text-red-500 font-black text-3xl tracking-tight">{activeAlerts.length}</Text>
            <View className="flex-row items-center mt-1 bg-red-50 self-start px-2 py-0.5 rounded-full border border-red-100">
              <MaterialCommunityIcons name="alert-circle" size={10} color="#EF4444" style={{marginRight: 4}} />
              <Text className="text-red-500 font-bold text-[9px] uppercase tracking-wider">{criticalAlertsCount} {t('reportsCriticalSuffix')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* OPD TREND GRAPH */}
      <View className="px-4 mb-6">
        <View className="w-full bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-4 relative z-10">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center mr-3 border border-indigo-200">
                <MaterialCommunityIcons name="chart-line-variant" size={16} color="#4F46E5" />
              </View>
              <View>
                <Text className="text-brand-navy font-black text-sm">{t('reports7DayOpdFootfall')}</Text>
                <Text className="text-indigo-500 text-[10px] font-bold">{t('reportsAggregatedTraffic')}</Text>
              </View>
            </View>
            <View className="bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Text className="text-slate-600 font-bold text-[10px]">{t('reportsMaxLabel')} {maxFootfall}</Text>
            </View>
          </View>
          
          <View className="h-32 w-full relative mt-2">
            <Svg height="100%" width="100%" viewBox="0 0 350 140" pointerEvents="none">
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
            </Svg>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
              {opdData.map((bar, i) => (
                <Pressable
                  key={`hit-opd-${i}`}
                  onPress={() => setActiveOpdPoint(i)}
                  style={{ position: 'absolute', left: `${(bar.cx / 350) * 100}%`, top: 0, bottom: 0, width: 40, marginLeft: -20 }}
                />
              ))}
            </View>
          </View>
          <View className="flex-row justify-between pl-8 pr-4 mt-3">
            {[t('reportsDayMon'), t('reportsDayTue'), t('reportsDayWed'), t('reportsDayThu'), t('reportsDayFri'), t('reportsDaySat'), t('reportsDaySun')].map((d, i) => (
              <Text key={d} className={`text-[10px] ${activeOpdPoint === i ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold'}`}>{d}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* EPIDEMIOLOGICAL TRENDS */}
      {(isDHO || isBMO) && (
        <View className="mb-6">
          <Text className="text-brand-navy font-extrabold text-sm mb-3 ml-5">{t('reportsEpidemiologicalWatch')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
            {localDiseaseTrends.map((trend) => (
              <View key={trend.id} className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm w-36 mr-3">
                <Text className="text-slate-500 font-bold text-[10px] uppercase mb-1">
                  {language === 'hi' ? 
                    ({'Viral Fever': 'वायरल बुखार', 'Dengue': 'डेंगू', 'Typhoid': 'टाइफाइड', 'Malaria': 'मलेरिया', 'Chikungunya': 'चिकनगुनिया'}[trend.disease] || trend.disease) 
                    : trend.disease}
                </Text>
                <View className="flex-row items-baseline mb-2">
                  <Text className="text-brand-navy font-black text-xl">{trend.cases}</Text>
                  <Text className={`font-bold text-[9px] ml-2 ${trend.isUp ? 'text-red-500' : 'text-emerald-500'}`}>{trend.trend}</Text>
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
        <Text className="text-brand-navy font-extrabold text-sm mb-3 ml-1">{t('reportsPharmacyLogistics')}</Text>
        <View className="flex-row justify-between">
          
          <View className="w-[48%] bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-2 border border-red-100">
                <MaterialCommunityIcons name="medical-bag" size={14} color="#EF4444" />
              </View>
              <Text className="text-slate-500 font-bold text-[10px]">{t('reportsCriticalStocks')}</Text>
            </View>
            <Text className="text-brand-navy font-black text-2xl">{criticalStockItems.length}</Text>
            <Text className="text-slate-400 font-bold text-[9px] mt-1">{t('reportsItemsNeedRestock')}</Text>
          </View>

          <View className="w-[48%] bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-2 border border-indigo-100">
                <MaterialCommunityIcons name="truck-fast-outline" size={16} color="#4F46E5" />
              </View>
              <Text className="text-slate-500 font-bold text-[10px]">{t('reportsActiveTransfers')}</Text>
            </View>
            <Text className="text-brand-navy font-black text-2xl">{activeShipments.length}</Text>
            <Text className="text-slate-400 font-bold text-[9px] mt-1">{t('reportsShipmentsEnRoute')}</Text>
          </View>

        </View>
      </View>

      {/* RESOURCE UTILIZATION */}
      <View className="px-4 mb-6">
        <Text className="text-brand-navy font-extrabold text-sm mb-3 ml-1">{t('reportsResourceUtilization')}</Text>
        <View className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm flex-row justify-between items-center">
          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center mb-2 border border-teal-100">
              <MaterialCommunityIcons name="doctor" size={20} color="#0D9488" />
            </View>
            <Text className="text-brand-navy font-black text-lg">{staffAttendanceRate}%</Text>
            <Text className="text-slate-400 font-bold text-[9px]">{t('reportsStaffPresent')}</Text>
          </View>

          <View className="w-[1px] h-12 bg-slate-200"></View>

          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mb-2 border border-red-100">
              <MaterialCommunityIcons name="ambulance" size={20} color="#E11D48" />
            </View>
            <Text className="text-brand-navy font-black text-lg">{totalAmbulances}</Text>
            <Text className="text-slate-400 font-bold text-[9px]">{t('reportsAmbulances')}</Text>
          </View>

          <View className="w-[1px] h-12 bg-slate-200"></View>

          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-sky-50 items-center justify-center mb-2 border border-sky-100">
              <MaterialCommunityIcons name="gas-cylinder" size={20} color="#0284C7" />
            </View>
            <Text className="text-brand-navy font-black text-lg">{totalO2}</Text>
            <Text className="text-slate-400 font-bold text-[9px]">{t('reportsO2Cylinders')}</Text>
          </View>
        </View>
      </View>

      {/* ADDITIONAL METRICS GRID */}
      <View className="px-4 flex-row flex-wrap justify-between mb-2">
        <Text className="text-brand-navy font-extrabold text-sm mb-3 ml-1 w-full">Additional Metrics</Text>
        
        {/* Lab Tests */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-purple-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="test-tube" size={100} color="rgba(139,92,246,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">Lab Tests</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center">
              <MaterialCommunityIcons name="test-tube" size={20} color="#8B5CF6" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">432</Text>
            <Text className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-wider">Conducted Today</Text>
          </View>
        </View>

        {/* Vaccinations */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-teal-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="needle" size={100} color="rgba(20,184,166,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">Vaccinations</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center">
              <MaterialCommunityIcons name="needle" size={20} color="#0D9488" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">185</Text>
            <Text className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-wider">Doses Administered</Text>
          </View>
        </View>

        {/* Deliveries */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-pink-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="baby-carriage" size={100} color="rgba(236,72,153,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">Deliveries</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center">
              <MaterialCommunityIcons name="baby-carriage" size={20} color="#EC4899" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">14</Text>
            <Text className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-wider">Maternal Deliveries</Text>
          </View>
        </View>

        {/* Emergency */}
        <View className="w-[48%] bg-white rounded-[28px] p-5 border border-slate-100 border-l-[4px] border-l-rose-500 shadow-sm shadow-slate-200/50 mb-4 justify-between overflow-hidden" style={{ minHeight: 140 }}>
          <MaterialCommunityIcons name="hospital-marker" size={100} color="rgba(225,29,72,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider leading-tight">Emergencies</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center">
              <MaterialCommunityIcons name="hospital-marker" size={20} color="#E11D48" />
            </View>
          </View>
          <View>
            <Text className="text-brand-navy font-black text-3xl tracking-tight">27</Text>
            <Text className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-wider">Admissions Today</Text>
          </View>
        </View>
      </View>

      {/* CRITICAL WATCHLIST (Only for DHO/BMO) */}
      {(isDHO || isBMO) && criticalPhcs.length > 0 && (
        <View className="px-4 mb-8">
          <Text className="text-brand-navy font-extrabold text-sm mb-3 ml-1">{t('reportsNeedsAttention')}</Text>
          {criticalPhcs.map((phc, idx) => (
            <Pressable 
              key={phc.id}
              onPress={() => router.push({ pathname: '/(tabs)/phc-detail', params: { id: phc.id } })}
              className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex-row items-center ${idx !== criticalPhcs.length - 1 ? 'mb-3' : ''}`}
            >
              <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3 border border-rose-200">
                <Text className="text-rose-500 font-black text-xs">{phc.healthScore}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-black text-sm mb-0.5">{getPhcName(phc)}</Text>
                <Text className="text-slate-500 text-[10px] font-bold">{phc.activeAlertsCount} {t('reportsActiveAlertsBullet')} • {phc.stockStatus} {t('reportsStockSuffix')}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
            </Pressable>
          ))}
        </View>
      )}

    </ScrollView>
  );
}
