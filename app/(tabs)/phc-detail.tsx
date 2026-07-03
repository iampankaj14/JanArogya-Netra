import { dummyMedicines } from '@/dummy/medicines';
import { dummyPHCs } from '@/dummy/phcs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Components
const MetricCard = ({ title, value, icon, iconBg, trend, trendVal, subtitle, borderColor }: any) => (
  <View className={`bg-white rounded-3xl p-4 shadow-sm border ${borderColor} w-[48%] mb-3`}>
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
  const [showAllMedicines, setShowAllMedicines] = useState(false);
  const [currentAiIndex, setCurrentAiIndex] = useState(0);
  const [activeDataPoint, setActiveDataPoint] = useState<number | null>(3); // Default to Peak (Thursday)
  const infraScrollRef = useRef<ScrollView>(null);

  // Find target facility
  const phc = dummyPHCs.find(p => p && p.id === id) || dummyPHCs[0];
  const stocks = dummyMedicines; // Assume they all belong to this PHC for demo

  const displayedStocks = showAllMedicines ? stocks : stocks.slice(0, 5);

  const aiRecommendations = [
    {
      id: '1',
      type: 'Stock Transfer',
      confidence: '95%',
      source: 'Rampur Kalan PHC',
      target: phc.name,
      reason: 'Rising Dengue cases detected. Transfer ORS and Paracetamol based on predictive footfall models.'
    },
    {
      id: '2',
      type: 'Staff Relocation',
      confidence: '88%',
      source: 'District Hospital',
      target: phc.name,
      reason: 'Critical shortage of Medical Officers. Temporary relocation recommended for 3 days.'
    },
    {
      id: '3',
      type: 'Equipment Maintenance',
      confidence: '92%',
      source: phc.name,
      target: 'Maintenance Hub',
      reason: 'X-Ray machine operating at 60% efficiency. Urgent calibration required before failure.'
    }
  ];

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

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HERO SECTION */}
        <View className="bg-white px-4 py-6 shadow-sm border-b border-slate-100 mb-4 rounded-b-3xl mt-2">
          <View className="flex-row">
            <View className="w-32 h-28 bg-[#E6F3FF] rounded-2xl mr-4 items-center justify-center overflow-hidden border border-blue-50">
              <Image source={require('@/data/phc/phc illustration/green1.png')} className="w-full h-full" resizeMode="cover" />
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row items-center mb-1">
                <Text className="text-xl font-black text-brand-navy mr-2">{phc.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#10B981" />
              </View>
              <Text className="text-xs text-slate-500 mb-3 leading-relaxed">
                {phc.block} Block • Gautam Buddh Nagar, Uttar Pradesh
              </Text>

              {/* Pills */}
              <View className="flex-row flex-wrap gap-2">
                <View className="bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex-row items-center">
                  <MaterialCommunityIcons name="map-marker" size={10} color="#10B981" className="mr-1" />
                  <Text className="text-[9px] font-bold text-emerald-700">Uttar Pradesh</Text>
                </View>
                <View className="bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                  <Text className="text-[9px] font-bold text-blue-700">Established 2012</Text>
                </View>
                <View className="bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                  <Text className="text-[9px] font-bold text-purple-700">PHC Code: UP-GBN-012</Text>
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
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Facility Type</Text>
                <Text className="text-xs font-bold text-brand-navy">PHC</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-blue-50 rounded-md items-center justify-center mr-2">
                <MaterialCommunityIcons name="bank" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Managed By</Text>
                <Text className="text-xs font-bold text-brand-navy">Govt. Health Dept.</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-amber-50 rounded-md items-center justify-center mr-2">
                <MaterialCommunityIcons name="sync" size={14} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Last Sync</Text>
                <Text className="text-xs font-bold text-brand-navy">Today, 10:30 AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* NETRA HEALTH INDEX */}
        <View className="px-4 mb-6">
          <LinearGradient
            colors={
              phc.healthScore >= 80 ? ['#ECFDF5', '#D1FAE5'] :
                phc.healthScore >= 60 ? ['#FFFBEB', '#FEF3C7'] :
                  ['#FEF2F2', '#FEE2E2']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: phc.healthScore >= 80 ? '#6EE7B7' : phc.healthScore >= 60 ? '#FCD34D' : '#FCA5A5',
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 40,
              overflow: 'hidden'
            }}
            className="shadow-sm relative"
          >
            <View className="flex-row items-center mb-5">
              <Text className="text-slate-600 font-black text-[11px] tracking-widest uppercase mr-2">Netra Health Index</Text>
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
                    stroke={phc.healthScore >= 80 ? '#10B981' : phc.healthScore >= 60 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="201.06"
                    strokeDashoffset={201.06 - (phc.healthScore / 100) * 201.06}
                    strokeLinecap="round"
                    transform="rotate(-90 36 36)"
                  />
                </Svg>
                <View className="items-center justify-center mt-1.5">
                  <View className="flex-row items-baseline">
                    <Text className="text-slate-800 font-black text-xl leading-none">{phc.healthScore}</Text>
                    <Text className="text-slate-500 font-bold text-[10px]">%</Text>
                  </View>
                </View>
              </View>

              <View className="flex-1">
                <Text
                  className="font-bold text-[9px] mb-1"
                  style={{ color: phc.healthScore >= 80 ? '#059669' : phc.healthScore >= 60 ? '#D97706' : '#DC2626' }}
                >
                  {phc.healthScore >= 80 ? 'OPERATIONAL' : phc.healthScore >= 60 ? 'NEEDS ATTENTION' : 'CRITICAL'}
                </Text>
                <Text className="text-slate-600 text-xs leading-relaxed">
                  Netra AI is monitoring this facility. Based on upcoming data, we will recommend specific actions here to improve the score.
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* KEY METRICS GRID */}
        <View className="px-4 mb-4 flex-row flex-wrap justify-between">
          <MetricCard
            title="Footfall (Today)"
            value="236"
            icon="account-group" iconBg="bg-purple-500"
            trend="up" trendVal="18%" subtitle="vs yesterday"
            borderColor="border-purple-200"
          />
          <MetricCard
            title="OPD (This Month)"
            value="4,732"
            icon="calendar-text" iconBg="bg-blue-500"
            trend="up" trendVal="12%" subtitle="vs last month"
            borderColor="border-blue-200"
          />
          <MetricCard
            title="Beds Available"
            value="7 / 15"
            icon="bed-empty" iconBg="bg-emerald-500"
            subtitle="47% Occupied"
            borderColor="border-emerald-200"
          />
          <MetricCard
            title="Avg. Wait Time"
            value="26 mins"
            icon="clock-outline" iconBg="bg-amber-500"
            trend="down" trendVal="8 mins" subtitle="vs last week"
            borderColor="border-amber-200"
          />
          <MetricCard
            title="Consultation Rooms"
            value="2"
            icon="doctor" iconBg="bg-purple-400"
            borderColor="border-purple-200"
          />
          <MetricCard
            title="Lab Services"
            value="Available"
            icon="flask" iconBg="bg-blue-400"
            borderColor="border-blue-200"
          />
        </View>

        {/* MEDICINE STOCK OVERVIEW */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="pill" size={14} color="#10B981" />
                </View>
                <Text className="text-brand-navy font-bold text-sm">Medicine Stock Overview</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAllMedicines(!showAllMedicines)}>
                <Text className="text-blue-600 font-bold text-xs">{showAllMedicines ? 'View Less' : 'View All'}</Text>
              </TouchableOpacity>
            </View>

            {/* List */}
            <View className="mt-2">
              {displayedStocks.map((item, index) => {
                const isShortage = item.currentStock < item.minRequiredStock;
                const pct = Math.min(100, Math.round((item.currentStock / item.minRequiredStock) * 100));
                return (
                  <View key={item.id} className={index !== displayedStocks.length - 1 ? "mb-5" : ""}>
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center flex-1 pr-2">
                        <MaterialCommunityIcons name={item.type === 'EMERGENCY' ? 'water' : 'pill'} size={14} color={isShortage ? "#EF4444" : "#10B981"} className="mr-2" />
                        <Text className="text-slate-800 font-bold text-[13px]" numberOfLines={1}>{item.name}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-slate-800 font-black text-xs mr-2">{pct}%</Text>
                        <View className={`px-2 py-0.5 rounded-full ${isShortage ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <Text className={`${isShortage ? 'text-red-600' : 'text-emerald-600'} font-bold text-[9px] uppercase tracking-wider`}>{isShortage ? 'Low' : 'Adequate'}</Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <View className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden mr-3">
                        <View className={`h-full ${isShortage ? 'bg-red-500' : (pct < 50 ? 'bg-amber-500' : 'bg-emerald-500')} rounded-full`} style={{ width: `${pct}%` }} />
                      </View>
                      <Text className="text-slate-500 font-medium text-[10px] w-14 text-right">
                        {item.currentStock} / {item.minRequiredStock}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Low Stock Alert Banner */}
            <View className="mt-5 bg-red-50 rounded-xl p-3 flex-row items-center border border-red-100">
              <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" className="mr-2" />
              <Text className="flex-1 text-red-600 font-bold text-xs">Several items are low in stock</Text>
              <Feather name="chevron-right" size={16} color="#EF4444" />
            </View>
          </View>
        </View>

        {/* INFRASTRUCTURE SNAPSHOT */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="office-building" size={14} color="#3B82F6" />
                </View>
                <Text className="text-brand-navy font-bold text-sm">Infrastructure Snapshot</Text>
              </View>
              <TouchableOpacity>
                <Text className="text-blue-600 font-bold text-xs">View Details</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={infraScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-2"
            >
              <View className="flex-row px-2 gap-3">
                <View className="bg-blue-50/50 rounded-2xl p-4 w-32 border border-blue-50">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="bed-empty" size={18} color="#3B82F6" className="mr-2" />
                    <Text className="text-slate-500 font-bold text-[10px]">Total Beds</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">15</Text>
                </View>
                <View className="bg-emerald-50/50 rounded-2xl p-4 w-32 border border-emerald-50">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="bed-outline" size={18} color="#10B981" className="mr-2" />
                    <Text className="text-slate-500 font-bold text-[10px]">Available</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">7</Text>
                </View>
                <View className="bg-purple-50/50 rounded-2xl p-4 w-32 border border-purple-50">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="doctor" size={18} color="#8B5CF6" className="mr-2" />
                    <Text className="text-slate-500 font-bold text-[10px]">Consult Rooms</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">2</Text>
                </View>
                <View className="bg-amber-50/50 rounded-2xl p-4 w-32 border border-amber-50">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="ambulance" size={18} color="#F59E0B" className="mr-2" />
                    <Text className="text-slate-500 font-bold text-[10px]">Ambulances</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">1</Text>
                </View>
                <View className="bg-red-50/50 rounded-2xl p-4 w-32 border border-red-50">
                  <View className="flex-row items-center mb-3">
                    <MaterialCommunityIcons name="gas-cylinder" size={18} color="#EF4444" className="mr-2" />
                    <Text className="text-slate-500 font-bold text-[10px]">O2 Cylinders</Text>
                  </View>
                  <Text className="text-brand-navy font-black text-2xl">12</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        {/* STAFF & DUTY ROSTER */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-3xl py-8 px-6 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-purple-100 items-center justify-center mr-2">
                  <MaterialCommunityIcons name="account-group" size={14} color="#8B5CF6" />
                </View>
                <Text className="text-brand-navy font-bold text-sm">Staff & Duty Roster</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              {/* Circular Gauge */}
              <View className="relative w-20 h-20 items-center justify-center mr-6">
                <Svg height="80" width="80" viewBox="0 0 64 64" className="absolute">
                  <Circle cx="32" cy="32" r="28" stroke="#F1F5F9" strokeWidth="6" fill="none" />
                  <Circle cx="32" cy="32" r="28" stroke="#10B981" strokeWidth="6" fill="none" strokeDasharray="175.93" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 32 32)" />
                </Svg>
                <View className="items-center justify-center">
                  <MaterialCommunityIcons name="check-all" size={24} color="#10B981" />
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-brand-navy font-bold text-sm">Medical Officers</Text>
                  <Text className="text-emerald-600 font-black text-3xl leading-none relative top-1">100%</Text>
                </View>
                <Text className="text-emerald-500 font-bold text-xs mb-4">0 absent today</Text>

                <View className="flex-row justify-between border-t border-slate-100 pt-4 mt-2">
                  <View>
                    <View className="flex-row items-center mb-1.5">
                      <MaterialCommunityIcons name="account-check-outline" size={14} color="#94A3B8" className="mr-1" />
                      <Text className="text-slate-500 font-bold text-[10px]">Staff Present</Text>
                    </View>
                    <Text className="text-brand-navy font-black text-lg">12</Text>
                  </View>
                  <View>
                    <View className="flex-row items-center mb-1.5">
                      <MaterialCommunityIcons name="account-multiple-outline" size={14} color="#94A3B8" className="mr-1" />
                      <Text className="text-slate-500 font-bold text-[10px]">Total Staff</Text>
                    </View>
                    <Text className="text-brand-navy font-black text-lg">12</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* NETRA AI RECOMMENDATION CAROUSEL */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentAiIndex(newIndex);
            }}
          >
            {aiRecommendations.map((rec) => (
              <View key={rec.id} style={{ width: SCREEN_WIDTH }} className="px-4">
                <View className="rounded-[24px] shadow-sm shadow-blue-200/50 border border-white/60 overflow-hidden bg-white">
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
                            <Text className="text-brand-navy font-black text-[15px]">{rec.type}</Text>
                          </View>
                        </View>
                        {/* Glass Pill */}
                        <View className="bg-white/70 border border-white px-2.5 py-1 rounded-full">
                          <Text className="text-blue-700 font-extrabold text-[10px]">{rec.confidence} Conf.</Text>
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
                            <Text className="text-brand-navy font-bold text-[11px]" numberOfLines={1}>{rec.source}</Text>
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
                            <Text className="text-brand-navy font-bold text-[11px]" numberOfLines={1}>{rec.target}</Text>
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
                          {rec.reason}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row gap-3 relative z-10">
                        <Pressable className="flex-1 py-3 rounded-xl border border-red-300 items-center justify-center flex-row bg-white/60">
                          <Feather name="x-circle" size={14} color="#DC2626" style={{ marginRight: 6 }} />
                          <Text className="text-red-600 font-extrabold text-[12px]">Reject Request</Text>
                        </Pressable>

                        <Pressable className="flex-1 py-3 rounded-xl bg-blue-600/90 border border-blue-400 items-center justify-center flex-row shadow-lg shadow-blue-500/40">
                          <Feather name="check-circle" size={14} color="white" style={{ marginRight: 6 }} />
                          <Text className="text-white font-extrabold text-[12px]">Approve Request</Text>
                        </Pressable>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center items-center mt-3 space-x-1.5 gap-1.5">
            {aiRecommendations.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${index === currentAiIndex ? 'w-4 bg-indigo-500' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </View>
        </View>

        {/* BOTTOM SECTION (TRENDS & ALERTS) */}
        <View className="px-4 mb-6 flex-col">

          {/* Trends */}
          <View className="w-full bg-white rounded-[24px] p-5 shadow-sm shadow-blue-500/10 border border-blue-200 mb-4">
            <View className="flex-row items-start justify-between z-10 mb-2">
              <View className="w-[46px] h-[46px] rounded-full bg-blue-600 items-center justify-center border-[4px] border-blue-50 shadow-md shadow-blue-500/30">
                <Feather name="activity" size={20} color="white" />
              </View>
              <View className="flex-1 ml-4 pt-0.5">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekly Footfall</Text>
                  <Text className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</Text>
                </View>
                <View className="flex-row items-baseline mt-1">
                  <Text className="text-4xl font-black text-slate-800 tracking-tighter">1,284</Text>
                  <Text className="text-sm font-bold text-slate-400 ml-1">patients</Text>
                </View>
              </View>
            </View>

            {/* Detailed Graph Area */}
            <View className="h-[180px] mt-2 relative -mx-1">
              {/* Average Line Label */}
              <Text className="absolute top-[80px] right-2 text-[9px] font-black text-slate-400 uppercase bg-white/90 px-1 z-10">Avg: 183</Text>

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
                <Path d="M20,120 Q45,100 70,100 T120,130 T170,60 T220,110 T270,90 T330,120 L330,180 L20,180 Z" fill="url(#footfallDetailGrad)" />
                
                {/* Main Trend Line */}
                <Path d="M20,120 Q45,100 70,100 T120,130 T170,60 T220,110 T270,90 T330,120" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Data Points (Tappable) */}
                {[
                  { cx: 20, cy: 120, i: 0 },
                  { cx: 70, cy: 100, i: 1 },
                  { cx: 120, cy: 130, i: 2 },
                  { cx: 170, cy: 60, i: 3 }, // Peak
                  { cx: 220, cy: 110, i: 4 },
                  { cx: 270, cy: 90, i: 5 },
                  { cx: 330, cy: 120, i: 6 },
                ].map((pt) => (
                  <G key={pt.i}>
                    {/* Visible Circle */}
                    <Circle 
                      cx={pt.cx} 
                      cy={pt.cy} 
                      r={activeDataPoint === pt.i ? 6 : 4.5} 
                      fill={activeDataPoint === pt.i ? "#3B82F6" : "white"} 
                      stroke={activeDataPoint === pt.i ? "white" : "#3B82F6"} 
                      strokeWidth="2"
                    />
                    {/* Invisible Touch Target (Larger Hit Area) */}
                    <Circle 
                      cx={pt.cx} 
                      cy={pt.cy} 
                      r="25" 
                      fill="transparent" 
                      onPress={() => setActiveDataPoint(pt.i)}
                    />
                  </G>
                ))}

                {/* Dynamic Tooltip inside SVG */}
                {activeDataPoint !== null && (
                  <SvgText 
                    x={[20, 70, 120, 170, 220, 270, 330][activeDataPoint]} 
                    y={[120, 100, 130, 60, 110, 90, 120][activeDataPoint] - 15}
                    fill="#1E293B" 
                    fontSize="12" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {[120, 195, 80, 250, 155, 210, 115][activeDataPoint]}
                  </SvgText>
                )}
              </Svg>
            </View>

            {/* X-Axis Labels */}
            <View className="flex-row justify-between px-2 mt-2 pt-1 border-t border-slate-100">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <Text key={i} className={`text-[10px] ${activeDataPoint === i ? 'font-black text-blue-600' : 'font-bold text-slate-400'}`}>
                  {day}
                </Text>
              ))}
            </View>
          </View>

          {/* Active Alerts */}
          <View className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <View className="w-5 h-5 bg-red-100 rounded-full items-center justify-center mr-2">
                  <Feather name="bell" size={12} color="#EF4444" />
                </View>
                <Text className="text-brand-navy font-bold text-sm">Active Alerts</Text>
              </View>
            </View>

            <View>
              <View className="flex-row items-center bg-red-50 rounded-xl p-3 border border-red-100 mb-3">
                <View className="mr-3 bg-red-100 rounded-full p-2">
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-red-600 font-bold text-xs mb-0.5">Low stock: 8 medicines</Text>
                  <Text className="text-slate-500 text-[10px] font-medium">Reorder recommended</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#EF4444" />
              </View>

              <View className="flex-row items-center bg-amber-50 rounded-xl p-3 border border-amber-100 mb-3">
                <View className="mr-3 bg-amber-100 rounded-full p-1.5">
                  <MaterialCommunityIcons name="account-group" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="text-amber-600 font-bold text-xs mb-0.5">High footfall detected</Text>
                  <Text className="text-slate-500 text-[10px] font-medium">Monitor bed availability closely</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#F59E0B" />
              </View>

              <View className="flex-row items-center bg-blue-50 rounded-xl p-3 border border-blue-100">
                <View className="mr-3 bg-blue-100 rounded-full p-2">
                  <MaterialCommunityIcons name="water-check" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-blue-600 font-bold text-xs mb-0.5">Water quality test due</Text>
                  <Text className="text-slate-500 text-[10px] font-medium">Last test: 25 days ago</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#3B82F6" />
              </View>
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}
