import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useInventory } from '../../../hooks/useInventory';
import dummyAlerts from '../../../dummy/alerts';
import { localTasks, updateLocalTask } from '../../../services/repositories/localDb';
import { dummyPHCs } from '../../../dummy/phcs';
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function PHCHomeDashboard() {
  const { authState } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const facilityId = authState?.facilityId || 'phc_barola';
  const { stocks } = useInventory(facilityId);
  const lowStockCount = stocks.filter((s) => s.currentStock < s.minRequiredStock).length;
  
  const activeOutbreak = dummyAlerts.find(a => a.facilityId === facilityId && a.type === 'OUTBREAK' && !a.resolved);

  const [tasks, setTasks] = useState(localTasks.filter(t => t.facilityId === facilityId));

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const updated = { ...t, completed: !t.completed };
        updateLocalTask(updated);
        return updated;
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const facilityNames: Record<string, string> = {
    'phc_barola': 'PHC Barola',
    'phc_badalpur': 'PHC Badalpur',
    'phc_mandi_shyam_nagar': 'PHC Mandi Shyam Nagar',
  };
  const facilityName = facilityNames[facilityId] || 'PHC Barola';
  const phc = dummyPHCs.find(p => p.id === facilityId) || dummyPHCs[0];

  const todayFootfall = phc.weeklyFootfall ? phc.weeklyFootfall[phc.weeklyFootfall.length - 1] : 142;
  const yesterdayFootfall = phc.weeklyFootfall ? phc.weeklyFootfall[phc.weeklyFootfall.length - 2] : 130;
  const footfallPct = yesterdayFootfall ? Math.round(((todayFootfall - yesterdayFootfall) / yesterdayFootfall) * 100) : 12;

  const ipdOccupancy = Math.round((phc.bedsOccupied / Math.max(1, phc.bedsTotal)) * 100);
  const pendingTests = Math.round(todayFootfall * 0.25);

  const newPatients = Math.round(todayFootfall * 0.6);
  const referrals = Math.round(todayFootfall * 0.05);
  const labTests = Math.round(todayFootfall * 0.2);
  const followUps = Math.round(todayFootfall * 0.15);
  const discharges = Math.round(phc.bedsOccupied * 0.15);

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const [weatherData, setWeatherData] = useState<{temp: number, humidity: number, code: number} | null>(null);

  useEffect(() => {
    if (phc.latitude && phc.longitude) {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${phc.latitude}&longitude=${phc.longitude}&current=temperature_2m,relative_humidity_2m,weather_code`)
        .then(res => res.json())
        .then(data => {
          if (data.current) {
            setWeatherData({
              temp: Math.round(data.current.temperature_2m),
              humidity: Math.round(data.current.relative_humidity_2m),
              code: data.current.weather_code
            });
          }
        })
        .catch(err => console.log('Weather fetch error:', err));
    }
  }, [phc.latitude, phc.longitude]);

  const getWeatherInfo = (code: number) => {
    if (code === 0) return { label: 'Clear Sky', icon: 'weather-sunny', color: '#FBBF24' };
    if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: 'weather-partly-cloudy', color: '#FBBF24' };
    if (code >= 45 && code <= 48) return { label: 'Fog', icon: 'weather-fog', color: '#94A3B8' };
    if (code >= 51 && code <= 67) return { label: 'Rain', icon: 'weather-rainy', color: '#3B82F6' };
    if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'weather-snowy', color: '#93C5FD' };
    if (code >= 80 && code <= 82) return { label: 'Showers', icon: 'weather-pouring', color: '#2563EB' };
    if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: 'weather-lightning', color: '#7C3AED' };
    return { label: t('dashboardWeatherPartlyCloudy'), icon: 'weather-partly-cloudy', color: '#FBBF24' };
  };

  const wInfo = weatherData ? getWeatherInfo(weatherData.code) : { label: t('dashboardWeatherPartlyCloudy'), icon: 'weather-partly-cloudy', color: '#FBBF24' };
  const displayTemp = weatherData ? `${weatherData.temp}°C` : '--°C';
  const displayHum = weatherData ? `${weatherData.humidity}%` : '--%';

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC]" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

      {/* Header & Weather */}
      <View className="px-4 mt-6 flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-3xl font-black text-[#1E3A8A] tracking-tight">{t('dashboardWelcomeStaff')}</Text>
          <Text className="text-slate-500 text-[13px] font-semibold mt-1">{facilityName} • {t('dashboardTodayLabel')} {currentDate}</Text>
        </View>
        <View className="bg-white rounded-[20px] p-3 shadow-sm border border-slate-100 flex-row items-center w-36">
          <MaterialCommunityIcons name={wInfo.icon as any} size={28} color={wInfo.color} />
          <View className="ml-2 flex-1">
            <View className="flex-row items-baseline">
              <Text className="text-lg font-black text-slate-800">{displayTemp}</Text>
            </View>
            <Text className="text-[9px] font-bold text-slate-500" numberOfLines={1}>{wInfo.label}</Text>
            <Text className="text-[9px] font-bold text-slate-400 mt-0.5"><Feather name="droplet" size={8} color="#3B82F6" /> {displayHum}</Text>
          </View>
        </View>
      </View>

      {/* 4 Key Metrics Cards (Horizontal Scroll) */}
      <View className="mt-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>

          {/* Today's OPD */}
          <View className="bg-white rounded-[24px] border border-blue-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2 border border-blue-100/50">
                <Feather name="users" size={14} color="#3B82F6" />
              </View>
              <Text className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">{t('dashboardCardTodaysOpd')}</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">{todayFootfall}</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">{t('dashboardPatientsServed')}</Text>
            <View className="flex-row items-center mt-auto border-t border-slate-50 pt-3">
              <Feather name={footfallPct >= 0 ? "trending-up" : "trending-down"} size={12} color={footfallPct >= 0 ? "#10B981" : "#EF4444"} />
              <Text className={`text-[10px] font-bold mx-1 ${footfallPct >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{footfallPct >= 0 ? '+' : ''}{footfallPct}%</Text>
              <Text className="text-[10px] text-slate-400 font-semibold">{t('dashboardVsYesterday')}</Text>
            </View>
          </View>

          {/* Low Stock Items */}
          <View className="bg-white rounded-[24px] border border-red-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-2 border border-red-100/50">
                <MaterialCommunityIcons name="pill" size={14} color="#EF4444" />
              </View>
              <Text className="text-[10px] font-bold text-red-500 tracking-widest uppercase">{t('dashboardCardLowStockItems')}</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">{lowStockCount}</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">{t('dashboardNeedAttention')}</Text>
            <TouchableOpacity className="flex-row items-center justify-between mt-auto border-t border-slate-50 pt-3 active:opacity-60" onPress={() => router.push('/(tabs)/inventory')}>
              <Text className="text-[11px] font-bold text-red-500">{t('dashboardViewStock')}</Text>
              <Feather name="chevron-right" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* IPD Occupancy */}
          <View className="bg-white rounded-[24px] border border-emerald-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-2 border border-emerald-100/50">
                <MaterialCommunityIcons name="bed-outline" size={14} color="#10B981" />
              </View>
              <Text className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">{t('dashboardCardIpdOccupancy')}</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">{ipdOccupancy}%</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">{phc.bedsOccupied} / {phc.bedsTotal} {t('dashboardBedsOccupiedSuffix')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reports')} className="flex-row items-center justify-between mt-auto border-t border-slate-50 pt-3 active:opacity-60">
              <Text className="text-[11px] font-bold text-emerald-500">{t('dashboardViewDetails')}</Text>
              <Feather name="chevron-right" size={14} color="#10B981" />
            </TouchableOpacity>
          </View>

          {/* Pending Tests */}
          <View className="bg-white rounded-[24px] border border-purple-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-2 border border-purple-100/50">
                <MaterialCommunityIcons name="flask-outline" size={14} color="#8B5CF6" />
              </View>
              <Text className="text-[10px] font-bold text-purple-500 tracking-widest uppercase">{t('dashboardCardPendingTests')}</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">{pendingTests}</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">{t('dashboardAwaitingResults')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reports')} className="flex-row items-center justify-between mt-auto border-t border-slate-50 pt-3 active:opacity-60">
              <Text className="text-[11px] font-bold text-purple-500">{t('dashboardViewAll')}</Text>
              <Feather name="chevron-right" size={14} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* High Alert Banner */}
      {activeOutbreak && (
        <View className="px-4 mt-6">
          <View className="bg-[#FFF5F5] border border-red-200 rounded-[20px] p-4 flex-row items-center relative overflow-hidden shadow-sm shadow-red-100">
            <View className="w-12 h-12 rounded-full bg-red-100/80 items-center justify-center mr-3 border border-red-200">
              <MaterialCommunityIcons name="virus" size={24} color="#EF4444" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-[#991B1B] font-extrabold text-[15px] mr-2">{activeOutbreak.title}</Text>
                <View className="bg-red-200/60 px-2 py-0.5 rounded-full border border-red-300">
                  <Text className="text-red-700 font-bold text-[8px] tracking-wider uppercase">{t('dashboardHighAlertBadge')}</Text>
                </View>
              </View>
              <Text className="text-red-900/80 text-[11px] font-medium leading-relaxed pr-8">
                {activeOutbreak.description}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/emergency')}
              className="absolute right-4 top-4 bg-white px-2 py-1.5 rounded-full border border-red-200 flex-row items-center shadow-sm active:bg-slate-50"
            >
              <Text className="text-red-600 font-bold text-[9px] mr-0.5">{t('dashboardAlertView')}</Text>
              <Feather name="chevron-right" size={10} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Summary */}
      <View className="mt-8">
        <View className="px-4 flex-row justify-between items-center mb-4">
          <Text className="text-slate-500 font-extrabold text-[12px] tracking-widest uppercase">{t('dashboardTodaysSummary')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')} className="flex-row items-center">
            <Feather name="pie-chart" size={12} color="#3B82F6" />
            <Text className="text-blue-600 font-bold text-[12px] ml-1 mr-0.5">{t('dashboardViewFullDashboard')}</Text>
            <Feather name="chevron-right" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Feather name="user-plus" size={14} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">{newPatients}</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">{t('dashboardNewPatients')}</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
              <MaterialCommunityIcons name="hospital-building" size={14} color="#10B981" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">{referrals}</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">{t('dashboardReferrals')}</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-3">
              <Feather name="user-check" size={14} color="#F97316" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">{labTests}</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">{t('dashboardLabTests')}</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-3">
              <Feather name="users" size={14} color="#8B5CF6" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">{followUps}</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">{t('dashboardFollowUps')}</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-teal-50 items-center justify-center mr-3">
              <MaterialCommunityIcons name="bed-empty" size={14} color="#14B8A6" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">{discharges}</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">{t('dashboardDischarges')}</Text>
            </View>
          </View>

        </ScrollView>
      </View>

      <View className="px-4 mt-8 flex flex-col">

        {/* Today's Tasks */}
        <View className="w-full">
          <Text className="text-slate-500 font-extrabold text-[12px] tracking-widest uppercase mb-4">{t('dashboardTodaysTasks')}</Text>
          <View className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50 p-4 relative overflow-hidden">
            {/* Faint clipboard icon background */}
            <MaterialCommunityIcons name="clipboard-check-outline" size={120} color="#F1F5F9" style={{ position: 'absolute', top: -10, right: -20, opacity: 0.5, transform: [{ rotate: '15deg' }] }} />

            <View className="flex-col gap-4 relative z-10">

              {tasks.map((task, index) => (
                <TouchableOpacity key={task.id} onPress={() => toggleTask(task.id)} className={`flex-row items-start justify-between ${index !== tasks.length - 1 ? 'border-b border-slate-50 pb-4' : ''}`}>
                  <View className="flex-row items-center flex-1">
                    {task.completed ? (
                      <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center mr-3 mt-0.5">
                        <Feather name="check" size={12} color="white" />
                      </View>
                    ) : (
                      <View className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 mt-0.5" />
                    )}
                    <View>
                      <Text className={task.completed ? "text-slate-800 font-bold text-[13px] line-through opacity-70" : "text-[#1E3A8A] font-bold text-[13px]"}>{task.title}</Text>
                      <Text className="text-slate-400 text-[10px] font-medium mt-0.5">{task.desc}</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-[9px] font-bold mt-1">{task.time}</Text>
                </TouchableOpacity>
              ))}

            </View>

            <TouchableOpacity 
              onPress={() => Alert.alert(t('dashboardTasksAlertTitle'), t('dashboardTasksAlertMessage'))}
              className="mt-5 bg-[#F8FAFC] py-3 rounded-xl flex-row items-center justify-center border border-slate-100"
            >
              <Text className="text-blue-600 font-bold text-[11px] mr-1">{t('dashboardViewAllTasks')}</Text>
              <Feather name="chevron-right" size={14} color="#3B82F6" />
            </TouchableOpacity>

          </View>
        </View>

      </View>

      {/* Facility Status Footer */}
      <View className="px-4 mt-8 mb-4">
        <View className="bg-[#F0FDF4] border border-emerald-100 rounded-3xl p-5 shadow-sm shadow-emerald-100/50">
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center shadow-sm shadow-emerald-500/30 mr-3 border-2 border-white">
                <Feather name="shield" size={18} color="white" />
              </View>
              <View>
                <Text className="text-emerald-800 font-black text-[15px] mb-0.5 tracking-tight">{t('dashboardFacilityStatusOperational')}</Text>
                <View className="bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 self-start">
                  <Text className="text-emerald-700 font-bold text-[9px]">{t('dashboardAllSystemsNormal')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between flex-wrap gap-y-4">

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="wifi" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusInternet')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusConnected')}</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="cloud" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusEmrSync')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusSynced')}</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="refresh-cw" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusLastSync')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusLastSyncValue')}</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="lock" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusDataSecurity')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusSecure')}</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

    </ScrollView>
  );
}
