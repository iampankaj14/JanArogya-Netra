import React, { useState, useEffect, useRef } from 'react';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Pattern } from 'react-native-svg';
import { View, Text, ScrollView, FlatList, Pressable, Dimensions } from 'react-native';
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
import { dummyDistrict } from '@/dummy/district';
import { dummyNotifications } from '@/dummy/notifications';
import { AIRecommendation } from '@/shared/types/ai';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 48;

export default function SituationRoomScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const alerts = dummyAlerts;
  
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
    { id: 'q3', item: 'Dengue Rapid Kits', qty: 50, status: 'In Transit', ETA: '1 hr' },
    { id: 'q4', item: 'IV Fluids (NS)', qty: 100, status: 'Approved', ETA: 'Today' },
    { id: 'q5', item: 'Azithromycin 500mg', qty: 300, status: 'In Transit', ETA: '4 hrs' },
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

  const handleApproveMission = useCallback((id: string) => {
    const mission = activeMissions.find(m => m.id === id);
    if (mission) {
      setActiveMissions(prev => prev.filter(m => m.id !== id));
      
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
        text: t('situationRoomRedistributionApproved', 'Redistribution Approved'),
        desc: language === 'hi' 
          ? `${authState?.role} ${authState?.name || 'User'} ने ${mission.targetFacility} को ${mission.quantity} ${mission.item} के ट्रांसफर को मंजूरी दी।`
          : `${authState?.role} ${authState?.name || 'User'} approved transfer of ${mission.quantity} ${mission.item} to ${mission.targetFacility}.`,
        time: 'Just now'
      };
      setTelemetryAudits(prev => [newAudit, ...prev]);
    }
  }, [activeMissions, authState]);



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
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* AI Morning Brief */}
        <View className="mb-6 bg-slate-900 border border-slate-800 p-5 rounded-3xl mt-4">
          <View className="flex-row items-center mb-3">
            <View className="w-9 h-9 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
              <Feather name="eye" size={18} color="#60A5FA" />
            </View>
            <Text className="text-white font-extrabold text-base">Netra Daily Briefing</Text>
          </View>
          
          <View className="space-y-2.5">
            <View className="flex-row items-start">
              <Text className="text-blue-400 mr-2 font-bold">•</Text>
              <Text className="text-slate-300 text-xs flex-1">
                Rampur Kalan PHC is flagged at warning status (<Text className="text-red-400 font-bold">48/100</Text>) due to critical NS1 Dengue Kit shortages.
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-blue-400 mr-2 font-bold">•</Text>
              <Text className="text-slate-300 text-xs flex-1">
                1 active supply redistribution task is recommended to balance stocks.
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-blue-400 mr-2 font-bold">•</Text>
              <Text className="text-slate-300 text-xs flex-1">
                Devgarh Health Network average operations index remains nominal at <Text className="text-emerald-400 font-bold">68/100</Text>.
              </Text>
            </View>
          </View>
        </View>

        {/* Today's KPIs Grid Wrapped in Premium Container */}
        <View className="bg-slate-900/60 border border-slate-800/40 rounded-3xl p-4 mb-6">
          <Text className="text-white font-extrabold text-sm mb-3">Today's Performance Telemetry</Text>
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <MetricCard
                title="Active Alerts"
                value={alerts.filter(a => !a.resolved).length.toString()}
                change="+1"
                isPositiveChange={false}
                color="#EF4444"
                icon="critical"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <MetricCard
                title="Avg Health Score"
                value={`${dummyDistrict.healthIndex}/100`}
                change="-2%"
                isPositiveChange={false}
                color="#F59E0B"
                icon="hospital"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <MetricCard
                title="Bed Occupancy"
                value="82%"
                change="+5%"
                isPositiveChange={true}
                color="#3B82F6"
                icon="user"
              />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <MetricCard
                title="MO Presence"
                value="75%"
                change="Nominal"
                isPositiveChange={true}
                color="#10B981"
                icon="success"
              />
            </View>
          </View>
        </View>

        {/* Active Missions (AI Recommendations) Wrapped in Premium Card */}
        {activeMissions.length > 0 && (
          <View className="bg-slate-900/60 border border-slate-800/40 rounded-3xl p-4 mb-6">
            <Text className="text-white font-extrabold text-sm mb-3">Active AI Decision Requests</Text>
            {activeMissions.map((mission) => (
              <AIRecommendationCard
                key={mission.id}
                title={mission.title}
                sourceFacility={mission.sourceFacility}
                targetFacility={mission.targetFacility}
                item={mission.item}
                quantity={mission.quantity}
                confidence={mission.confidence}
                reasoning={mission.reasoning}
                onApprove={() => handleApproveMission(mission.id)}
                onDecline={() => handleDeclineMission(mission.id)}
              />
            ))}
          </View>
        )}

        {/* Command Queue */}
        <SectionHeader title="Logistics & Dispatch Queue" />
        <View className="mb-6 bg-slate-900/40 p-4 border border-slate-800/40 rounded-3xl">
          {commandQueue.map((item, index) => (
            <View key={item.id}>
              <View className="flex-row justify-between items-center py-2.5">
                <View>
                  <Text className="text-white font-bold text-xs">{item.item}</Text>
                  <Text className="text-slate-400 text-[10px] mt-0.5">Quantity: {item.qty} units</Text>
                </View>
                <View className="items-end">
                  <Badge 
                    label={item.status} 
                    variant={item.status === 'In Transit' ? 'info' : item.status === 'Approved' ? 'warning' : 'success'} 
                  />
                  <Text className="text-slate-400 text-[10px] mt-1">ETA: {item.ETA}</Text>
                </View>
              </View>
              {index < commandQueue.length - 1 && <Divider />}
            </View>
          ))}
        </View>

        {/* Critical Alerts Carousel */}
        <SectionHeader title="Unresolved Outbreaks & Incidents" />
        <View className="mb-8">
          <FlatList
            ref={carouselRef}
            data={alerts}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => (
              <View style={{ width: CAROUSEL_WIDTH }} className="mr-4">
                <AlertCard
                  title={item.title}
                  type={item.type}
                  priority={item.priority}
                  date={item.timestamp}
                  description={item.description}
                  onPress={() => alert(`Details for alert: ${item.title}`)}
                />
              </View>
            )}
          />
        </View>

        {/* Disease Trends Clickable Grid */}
        <SectionHeader title="Outbreak Telemetry Trends" />
        <View className="flex-row flex-wrap -mx-2 mb-8">
          {diseases.map((dis) => (
            <View key={dis.name} className="w-1/2 px-2 mb-3">
              <Pressable
                onPress={() => router.push({
                  pathname: '/disease-analytics' as any,
                  params: { disease: dis.name }
                })}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3.5 flex-row items-center justify-between active:bg-slate-800"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{dis.name}</Text>
                  <Text className="text-[10px] font-bold mt-1" style={{ color: dis.color }}>
                    {dis.rate} trend
                  </Text>
                </View>
                <Badge label={dis.risk} variant={dis.risk === 'HIGH' ? 'critical' : dis.risk === 'MED' ? 'warning' : 'success'} compact />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Quick Actions Panel */}
        <SectionHeader title="Operations Quick Commands" />
        <View className="flex-row space-x-3 mb-8">
          <View className="flex-1">
            <OutlineButton 
              title="Simulate Outbreak" 
              leftIcon="refresh"
              onPress={() => alert('Simulating outbreak parameters...')}
            />
          </View>
          <View className="flex-1">
            <OutlineButton 
              title="Trigger Demo Error" 
              leftIcon="warning"
              onPress={() => setError(true)}
            />
          </View>
        </View>

        {/* Activity Timeline (Recent Telemetry Audits) */}
        <SectionHeader title="Recent Telemetry Audits" />
        <View className="bg-slate-900/40 p-5 border border-slate-800/40 rounded-3xl mb-6">
          {dummyNotifications.map((notif, index) => (
            <View key={notif.id} className="flex-row items-start mb-6 relative">
              {/* Timeline Connector Line */}
              {index < dummyNotifications.length - 1 && (
                <View className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-slate-800" />
              )}
              
              {/* Timeline Bullet Node */}
              <View className="w-6 h-6 rounded-full bg-slate-850 border border-slate-800 items-center justify-center mr-3 z-10">
                <Feather 
                  name={(notif.title.toLowerCase().includes('alert') || notif.title.toLowerCase().includes('warning')) ? 'alert-triangle' : 'info'} 
                  size={10} 
                  color={(notif.title.toLowerCase().includes('alert') || notif.title.toLowerCase().includes('warning')) ? '#EF4444' : '#60A5FA'} 
                />
              </View>

              <Pressable 
                onPress={() => router.push('/notifications')}
                className="flex-1 bg-slate-900/60 border border-slate-800/50 rounded-2xl p-3 active:bg-slate-800"
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white font-extrabold text-xs">{notif.title}</Text>
                  <Text className="text-slate-500 text-[8px] font-bold">10m ago</Text>
                </View>
                <Text className="text-slate-400 text-[10px] leading-relaxed">{notif.message}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
