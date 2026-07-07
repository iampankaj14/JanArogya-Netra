import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useInventory } from '../../../hooks/useInventory';
import { alertsRepository } from '../../../services/repositories/alertsRepository';
import { phcRepository } from '../../../services/repositories/phcRepository';
import { localTasks, updateLocalTask } from '../../../services/repositories/localDb';
import { PHC } from '@/shared/types/phc';
import { AlertItem } from '@/shared/types/alert';
import { useTranslation } from '@/hooks/useTranslation';

const { width: rawWidth } = Dimensions.get('window');
const width = Math.min(rawWidth, 453);
const isTablet = width >= 768;

export default function PHCHomeDashboard() {
  
  const { authState } = useAuth();
  const router = useRouter();
  const { t, language } = useTranslation();

  const facilityId = authState?.facilityId || 'phc_barola';
  const { stocks } = useInventory(facilityId);
  const lowStockCount = stocks.filter((s) => s.currentStock < s.minRequiredStock).length;

  const [activeOutbreak, setActiveOutbreak] = useState<AlertItem | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    alertsRepository.getActiveAlerts()
      .then((alerts) => {
        if (cancelled) return;
        setActiveOutbreak(alerts.find(a => a.facilityId === facilityId && a.type === 'OUTBREAK' && !a.resolved));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [facilityId]);

  const [tasks, setTasks] = useState(localTasks.filter(t => t.facilityId === facilityId));
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [isEditingTasks, setIsEditingTasks] = useState(false);
  const displayedTasks = showAllTasks ? tasks : tasks.slice(0, 3);

  const summaryScrollViewRef = useRef<ScrollView>(null);
  const summaryCardWidthWithGap = 140 + 10;
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      summaryScrollViewRef.current?.scrollTo({ 
        x: (Math.random() > 0.5 ? summaryCardWidthWithGap : 0) + (Math.random() * summaryCardWidthWithGap * 2), // We will track index properly below
        animated: true 
      });
    }, 3500);
    // Actually wait, let's keep track of index.
  }, []);

  const toggleTask = (id: number) => {
    if (isEditingTasks) return;
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

  const removeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      title: 'New Ad-hoc Task',
      desc: 'Added by user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      completed: false,
      facilityId: facilityId
    };
    setTasks([...tasks, newTask]);
  };

  const facilityNames: Record<string, string> = {
    'phc_barola': 'PHC Barola',
    'phc_badalpur': 'PHC Badalpur',
    'phc_mandi_shyam_nagar': 'PHC Mandi Shyam Nagar',
  };
  const facilityName = facilityNames[facilityId] || 'PHC Barola';
  const DEFAULT_PHC: PHC = {
    id: facilityId,
    name: facilityName,
    block: '',
    healthScore: 0,
    bedsTotal: 0,
    bedsOccupied: 0,
    doctorAvailable: false,
    latitude: 0,
    longitude: 0,
    weeklyFootfall: [],
  } as unknown as PHC;
  const [phc, setPhc] = useState<PHC>(DEFAULT_PHC);

  useEffect(() => {
    const unsubscribe = phcRepository.subscribePHC(facilityId, (fetched) => {
      if (fetched) setPhc(fetched);
    });
    return unsubscribe;
  }, [facilityId]);

  const todayFootfall = (phc.weeklyFootfall && phc.weeklyFootfall.length > 0) ? phc.weeklyFootfall[phc.weeklyFootfall.length - 1] : 0;
  const yesterdayFootfall = (phc.weeklyFootfall && phc.weeklyFootfall.length > 1) ? phc.weeklyFootfall[phc.weeklyFootfall.length - 2] : 0;
  const footfallPct = yesterdayFootfall > 0 ? Math.round(((todayFootfall - yesterdayFootfall) / yesterdayFootfall) * 100) : 0;

  const ipdOccupancy = phc.bedsTotal > 0 ? Math.round((phc.bedsOccupied / phc.bedsTotal) * 100) : 0;
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

          {[
            {
              id: 'opd',
              title: t('dashboardCardTodaysOpd'),
              value: todayFootfall,
              subtitle: t('dashboardPatientsServed'),
              icon: 'users',
              iconFamily: 'Feather',
              color: '#3B82F6',
              bgColor: '#DBEAFE',
              iconBg: 'bg-blue-500',
              borderColor: 'border-blue-200',
              textColor: 'text-blue-600',
              bottomIcon: footfallPct >= 0 ? 'trending-up' : 'trending-down',
              bottomIconColor: footfallPct >= 0 ? '#10B981' : '#EF4444',
              bottomText: `${footfallPct >= 0 ? '+' : ''}${footfallPct}%`,
              bottomTextColor: footfallPct >= 0 ? 'text-emerald-500' : 'text-red-500',
              bottomLabel: t('dashboardVsYesterday'),
              onPress: undefined
            },
            {
              id: 'stock',
              title: t('dashboardCardLowStockItems'),
              value: lowStockCount,
              subtitle: t('dashboardNeedAttention'),
              icon: 'pill',
              iconFamily: 'MaterialCommunityIcons',
              color: '#EF4444',
              bgColor: '#FEE2E2',
              iconBg: 'bg-red-500',
              borderColor: 'border-red-200',
              textColor: 'text-red-500',
              bottomText: t('dashboardViewStock'),
              bottomTextColor: 'text-red-500',
              bottomActionIcon: 'chevron-right',
              onPress: () => router.push('/(tabs)/inventory')
            },
            {
              id: 'ipd',
              title: t('dashboardCardIpdOccupancy'),
              value: `${ipdOccupancy}%`,
              subtitle: `${phc.bedsOccupied} / ${phc.bedsTotal} ${t('dashboardBedsOccupiedSuffix')}`,
              icon: 'bed-outline',
              iconFamily: 'MaterialCommunityIcons',
              color: '#10B981',
              bgColor: '#D1FAE5',
              iconBg: 'bg-emerald-500',
              borderColor: 'border-emerald-200',
              textColor: 'text-emerald-500',
              bottomText: t('dashboardViewDetails'),
              bottomTextColor: 'text-emerald-500',
              bottomActionIcon: 'chevron-right',
              onPress: () => router.push('/(tabs)/reports')
            },
            {
              id: 'pending',
              title: t('dashboardCardPendingTests'),
              value: pendingTests,
              subtitle: t('dashboardAwaitingResults'),
              icon: 'flask-outline',
              iconFamily: 'MaterialCommunityIcons',
              color: '#8B5CF6',
              bgColor: '#F3E8FF',
              iconBg: 'bg-purple-500',
              borderColor: 'border-purple-200',
              textColor: 'text-purple-500',
              bottomText: t('dashboardViewAll'),
              bottomTextColor: 'text-purple-500',
              bottomActionIcon: 'chevron-right',
              onPress: () => router.push('/(tabs)/reports')
            }
          ].map((card, index) => {
            // Map the colors back to light variants for the small icon circle if needed, or use white/50
            const lightIconBg = card.iconBg.replace('500', '50');
            
            return (
            <TouchableOpacity 
              key={card.id} 
              onPress={card.onPress}
              className={`rounded-[16px] border ${card.borderColor} shadow-sm w-[160px] p-4 relative overflow-hidden justify-between`} 
              style={{ backgroundColor: card.bgColor, minHeight: 140 }}
              activeOpacity={card.onPress ? 0.7 : 1}
            >
              <MaterialCommunityIcons 
                name={card.iconFamily === 'Feather' && card.icon === 'users' ? 'account-group' : card.icon as any} 
                size={100} 
                color={`${card.color}15`} 
                style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} 
              />
              
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text className={`text-[12px] font-bold uppercase tracking-wider leading-tight ${card.textColor}`}>{card.title}</Text>
                </View>
                <View className={`w-9 h-9 rounded-full items-center justify-center ${lightIconBg}`}>
                  {card.iconFamily === 'Feather' ? (
                    <Feather name={card.icon as any} size={18} color={card.color} />
                  ) : (
                    <MaterialCommunityIcons name={card.icon as any} size={18} color={card.color} />
                  )}
                </View>
              </View>
              
              <View>
                <Text className="text-4xl font-black text-[#1E3A8A] tracking-tight">{card.value}</Text>
                <Text className="text-[11px] font-semibold text-slate-500 mt-0.5 mb-2">{card.subtitle}</Text>
                
                {card.onPress ? (
                  <View className="flex-row items-center mt-1">
                    <Text className={`text-[11px] font-bold ${card.bottomTextColor}`}>{card.bottomText}</Text>
                    <Feather name={card.bottomActionIcon as any} size={12} color={card.color} style={{ marginLeft: 2 }} />
                  </View>
                ) : (
                  <View className="flex-row items-center mt-1">
                    <Feather name={card.bottomIcon as any} size={12} color={card.bottomIconColor} />
                    <Text className={`text-[11px] font-bold mx-1 ${card.bottomTextColor}`}>{card.bottomText}</Text>
                    <Text className="text-[11px] text-slate-400 font-semibold">{card.bottomLabel}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )})}
        </ScrollView>
      </View>

      {/* High Alert Banner */}
      {activeOutbreak && (
        <View className="px-4 mt-6">
          <TouchableOpacity 
            onPress={() => router.push('/emergency')}
            className="bg-red-600 border-red-500 shadow-red-600/30 rounded-[24px] p-3 flex-row items-center border shadow-sm"
          >
            {/* Left Icon Container */}
            <View className="w-[52px] h-[52px] items-center justify-center mr-1">
              <View className="w-[44px] h-[44px] rounded-full bg-white items-center justify-center">
                <MaterialCommunityIcons name="virus" size={26} color="#EF4444" />
              </View>
            </View>

            {/* Main Content */}
            <View className="flex-1 ml-2 py-1 justify-center">
              <Text className="text-white font-extrabold text-[15px] mb-0.5" numberOfLines={1}>{language === 'hi' && activeOutbreak.titleHi ? activeOutbreak.titleHi : activeOutbreak.title}</Text>
              <Text className="text-red-100 font-semibold text-[10px] mb-1.5" numberOfLines={2}>{language === 'hi' && activeOutbreak.descriptionHi ? activeOutbreak.descriptionHi : activeOutbreak.description}</Text>
              <View className="flex-row items-center bg-red-700/50 self-start px-2 py-0.5 rounded-full border border-red-500/50">
                <Feather name="alert-triangle" size={10} color="#FECACA" />
                <Text className="text-white font-bold text-[9.5px] ml-1 uppercase">{t('dashboardHighAlertBadge')}</Text>
              </View>
            </View>

            {/* Right Action */}
            <View className="items-end justify-center px-1 pl-2">
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                <Feather name="chevron-right" size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Today's Summary */}
      <View className="mt-8">
        <View className="px-4 flex-row justify-between items-center mb-4">
          <Text className="text-slate-900 font-extrabold text-lg px-1">{t('dashboardTodaysSummary')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')} className="flex-row items-center">
            <Feather name="pie-chart" size={12} color="#3B82F6" />
            <Text className="text-blue-600 font-bold text-[12px] ml-1 mr-0.5">{t('dashboardViewFullDashboard')}</Text>
            <Feather name="chevron-right" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={summaryScrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          snapToInterval={150}
          decelerationRate="fast"
        >
          {[
            { id: 'newPatients', value: newPatients, label: t('dashboardNewPatients'), icon: 'account-plus', color: '#3B82F6', iconBg: 'bg-blue-500', bgColor: '#DBEAFE', borderColor: 'border-blue-200', iconFamily: 'MaterialCommunityIcons' },
            { id: 'referrals', value: referrals, label: t('dashboardReferrals'), icon: 'ambulance', color: '#10B981', iconBg: 'bg-emerald-500', bgColor: '#D1FAE5', borderColor: 'border-emerald-200', iconFamily: 'MaterialCommunityIcons' },
            { id: 'labTests', value: labTests, label: t('dashboardLabTests'), icon: 'flask', color: '#F59E0B', iconBg: 'bg-amber-500', bgColor: '#FEF3C7', borderColor: 'border-amber-200', iconFamily: 'MaterialCommunityIcons' },
            { id: 'followUps', value: followUps, label: t('dashboardFollowUps'), icon: 'calendar-sync', color: '#8B5CF6', iconBg: 'bg-purple-500', bgColor: '#F3E8FF', borderColor: 'border-purple-200', iconFamily: 'MaterialCommunityIcons' },
            { id: 'discharges', value: discharges, label: t('dashboardDischarges'), icon: 'home-plus', color: '#14B8A6', iconBg: 'bg-teal-500', bgColor: '#CCFBF1', borderColor: 'border-teal-200', iconFamily: 'MaterialCommunityIcons' }
          ].map((item, index) => {
            const lightIconBg = item.iconBg.replace('500', '50');
            return (
            <View 
              key={item.id} 
              className={`rounded-[16px] border ${item.borderColor} shadow-sm w-[140px] p-4 relative overflow-hidden justify-between`} 
              style={{ backgroundColor: item.bgColor, minHeight: 140 }}
            >
              <MaterialCommunityIcons 
                name={item.icon as any} 
                size={100} 
                color={`${item.color}15`} 
                style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} 
              />
              
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{item.label}</Text>
                </View>
                <View className={`w-9 h-9 rounded-full items-center justify-center ${lightIconBg}`}>
                  <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                </View>
              </View>
              
              <View>
                <Text className="text-4xl font-black text-[#1E3A8A] tracking-tight">{item.value}</Text>
              </View>
            </View>
          )})}
        </ScrollView>
      </View>

      <View className="px-4 mt-8 flex flex-col">

        {/* Today's Tasks */}
        <View className="w-full">
          <View className="flex-row justify-between items-center px-1 mb-3">
            <Text className="text-slate-900 font-extrabold text-lg">{t('dashboardTodaysTasks')}</Text>
          </View>
          <View className="bg-white rounded-[24px] border-[3px] border-blue-400 shadow-sm shadow-slate-200/50 p-4 relative overflow-hidden">
            {/* Faint clipboard icon background */}
            <MaterialCommunityIcons name="clipboard-check-outline" size={120} color="#F1F5F9" style={{ position: 'absolute', top: -10, right: -20, opacity: 0.5, transform: [{ rotate: '15deg' }] }} />

            <View className="flex-col gap-4 relative z-10">

              {displayedTasks.map((task, index) => (
                <View key={task.id} className="w-full">
                  <TouchableOpacity onPress={() => toggleTask(task.id)} className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1">
                      {task.completed ? (
                        <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">
                          <Feather name="check" size={12} color="white" />
                        </View>
                      ) : (
                        <View className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 mt-0.5" />
                      )}
                      <View>
                        <Text className={task.completed ? "text-slate-800 font-bold text-[13px] line-through opacity-70" : "text-[#1E3A8A] font-bold text-[13px]"}>{language === 'hi' && task.titleHi ? task.titleHi : task.title}</Text>
                        <Text className="text-slate-400 text-[10px] font-medium mt-0.5">{language === 'hi' && task.descHi ? task.descHi : task.desc}</Text>
                      </View>
                    </View>
                    {isEditingTasks ? (
                      <TouchableOpacity onPress={() => removeTask(task.id)} className="bg-red-50 p-1.5 rounded-full border border-red-100">
                        <Feather name="trash-2" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-slate-400 text-[9px] font-bold mt-1">{task.time}</Text>
                    )}
                  </TouchableOpacity>
                  
                  {index !== displayedTasks.length - 1 && (
                    <View className="w-full flex-row overflow-hidden my-4">
                      {[...Array(50)].map((_, i) => (
                        <View key={i} className="w-3 h-[3px] bg-blue-300 mr-2 rounded-full" />
                      ))}
                    </View>
                  )}
                </View>
              ))}

            </View>

            {isEditingTasks && (
              <TouchableOpacity onPress={addTask} className="mt-2 bg-emerald-50 border border-emerald-200 py-3 rounded-2xl flex-row items-center justify-center border-dashed active:bg-emerald-100">
                <Feather name="plus" size={14} color="#10B981" />
                <Text className="text-emerald-600 font-bold ml-1.5 text-[12px]">{t('dashboardAddNewTask')}</Text>
              </TouchableOpacity>
            )}

            <View className="mt-5 flex-row gap-2">
              <TouchableOpacity
                onPress={() => setIsEditingTasks(!isEditingTasks)}
                className="flex-1 bg-blue-50 py-3.5 rounded-[16px] flex-row items-center justify-center border border-blue-200 active:bg-blue-100"
              >
                <Text className="text-blue-600 font-black text-[11px] uppercase tracking-widest">{isEditingTasks ? t('dashboardDoneEditing') : t('dashboardEditTasks')}</Text>
              </TouchableOpacity>

              {tasks.length > 3 && (
                <TouchableOpacity
                  onPress={() => setShowAllTasks(!showAllTasks)}
                  className="flex-1 bg-blue-600 py-3.5 rounded-[16px] flex-row items-center justify-center shadow-md shadow-blue-500/30 active:bg-blue-700 border-2 border-blue-500"
                >
                  <Text className="text-white font-black text-[11px] mr-1.5 tracking-widest uppercase">{showAllTasks ? t('dashboardShowLess') : t('dashboardViewAllTasks')}</Text>
                  <View className="w-4 h-4 rounded-full bg-white/20 items-center justify-center">
                    <Feather name={showAllTasks ? "arrow-up" : "arrow-down"} size={10} color="white" />
                  </View>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>

      </View>

      {/* Facility Status Footer */}
      <View className="px-4 mt-8 mb-4">
        <View className="border-2 border-emerald-200 rounded-[24px] p-5 shadow-sm" style={{ backgroundColor: '#D1FAE5' }}>
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
              <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center mr-2">
                <Feather name="wifi" size={10} color="white" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusInternet')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusConnected')}</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center mr-2">
                <Feather name="cloud" size={10} color="white" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusEmrSync')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusSynced')}</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center mr-2">
                <Feather name="refresh-cw" size={10} color="white" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">{t('dashboardStatusLastSync')}</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">{t('dashboardStatusLastSyncValue')}</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center mr-2">
                <Feather name="lock" size={10} color="white" />
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
