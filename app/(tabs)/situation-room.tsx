import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import MetricCard from '@/components/ui/cards/MetricCard';
import AlertCard from '@/components/ui/cards/AlertCard';
import AIRecommendationCard from '@/components/ui/cards/AIRecommendationCard';
import BarChart from '@/components/ui/charts/BarChart';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import Badge from '@/components/ui/badges/Badge';
import Divider from '@/components/ui/layout/Divider';
import LoadingSpinner from '@/components/ui/feedback/LoadingSpinner';
import ErrorState from '@/components/ui/feedback/ErrorState';

import { dummyAlerts } from '@/dummy/alerts';
import { dummyPHCs } from '@/dummy/phcs';
import { dummyDistrict } from '@/dummy/district';
import { dummyNotifications } from '@/dummy/notifications';
import { AIRecommendation } from '@/shared/types/ai';

export default function SituationRoomScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
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
  ]);

  useEffect(() => {
    // Simulate loading on mount
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleApproveMission = (id: string) => {
    // Move mission to command queue
    const mission = activeMissions.find(m => m.id === id);
    if (mission) {
      setActiveMissions(prev => prev.filter(m => m.id !== id));
      setCommandQueue(prev => [
        ...prev,
        { id: mission.id, item: mission.item, qty: mission.quantity, status: 'Preparing Dispatch', ETA: '6 hrs' }
      ]);
    }
  };

  const handleDeclineMission = (id: string) => {
    setActiveMissions(prev => prev.filter(m => m.id !== id));
  };

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
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Emergency Alert Bar / Quick Toggles */}
        <View className="flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-6 mt-2">
          <View className="flex-row items-center">
            <View className={`w-3 h-3 rounded-full ${emergencyMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'} mr-3`} />
            <View>
              <Text className="text-white font-bold text-sm">
                {emergencyMode ? 'EMERGENCY MODE ACTIVE' : 'District Systems Nominal'}
              </Text>
              <Text className="text-slate-400 text-xs">Devgarh District Health Network</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-slate-400 text-xs font-bold mr-2">Emergency Mode</Text>
            <Switch
              value={emergencyMode}
              onValueChange={setEmergencyMode}
              trackColor={{ false: '#334155', true: '#EF4444' }}
              thumbColor={emergencyMode ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Emergency Banner */}
        {emergencyMode && (
          <View className="bg-red-950/60 border border-red-900/60 rounded-3xl p-5 mb-6 shadow-lg">
            <View className="flex-row items-center mb-3">
              <Feather name="alert-octagon" size={24} color="#EF4444" className="mr-3" />
              <Text className="text-red-400 font-extrabold text-base">District Emergency Response Protocols</Text>
            </View>
            <Text className="text-red-200 text-xs leading-relaxed mb-4">
              Dengue outbreak surge threshold breached at Rampur Kalan. AI has redirected priority medical logistics. Outbreak containment protocols initiated.
            </Text>
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <PrimaryButton 
                  title="Deploy Supplies" 
                  onPress={() => alert('Emergency medical dispatch order created.')}
                  style={{ backgroundColor: '#EF4444' }}
                />
              </View>
              <View className="flex-1">
                <OutlineButton 
                  title="Crisis Intel Feed" 
                  onPress={() => alert('Opening situational report feed.')}
                  style={{ borderColor: '#B91C1C' }}
                />
              </View>
            </View>
          </View>
        )}

        {/* AI Morning Brief */}
        <View className="mb-6 bg-slate-900/60 border border-slate-800/40 p-5 rounded-3xl">
          <View className="flex-row items-center mb-3">
            <View className="w-9 h-9 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
              <Feather name="eye" size={18} color="#60A5FA" />
            </View>
            <Text className="text-white font-extrabold text-base">Netra Daily Briefing</Text>
          </View>
          <Text className="text-slate-300 text-xs leading-relaxed">
            Good morning, DHO Rajesh. Devgarh Health Network reports an overall score of <Text className="text-blue-400 font-bold">68/100</Text>. Rampur Kalan is currently flagged at <Text className="text-red-400 font-bold">48/100</Text> due to high patient load and NS1 Dengue Kit shortages. 1 redistribution task is recommended.
          </Text>
        </View>

        {/* Today's KPIs Grid */}
        <SectionHeader title="Today's Performance Telemetry" />
        <View className="flex-row flex-wrap -mx-2 mb-4">
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

        {/* Active Missions (AI Recommendations) */}
        <SectionHeader title="Active AI Decision Requests" />
        {activeMissions.length > 0 ? (
          activeMissions.map((mission) => (
            <View className="mb-6" key={mission.id}>
              <AIRecommendationCard
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
            </View>
          ))
        ) : (
          <View className="bg-slate-900 border border-dashed border-slate-800 rounded-3xl p-6 items-center mb-6">
            <Feather name="shield" size={32} color="#475569" className="mb-2" />
            <Text className="text-slate-400 text-xs font-semibold">All recommendations resolved. Command clear.</Text>
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

        {/* Critical Alerts */}
        <SectionHeader title="Unresolved Outbreaks & Incidents" />
        {alerts.map((alertItem) => (
          <View className="mb-4" key={alertItem.id}>
            <AlertCard
              title={alertItem.title}
              type={alertItem.type}
              priority={alertItem.priority}
              date={alertItem.timestamp}
              description={alertItem.description}
              onPress={() => alert(`Details for alert: ${alertItem.title}`)}
            />
          </View>
        ))}

        {/* Monitor Closely */}
        <SectionHeader title="Facilities Requiring Close Monitoring" />
        <View className="mb-6 bg-slate-900/40 border border-slate-800/40 rounded-3xl p-4">
          {dummyPHCs.filter(p => p.healthScore < 70).map((phc, index, arr) => (
            <View key={phc.id}>
              <View className="flex-row items-center justify-between py-2">
                <View>
                  <Text className="text-white font-bold text-xs">{phc.name}</Text>
                  <Text className="text-slate-400 text-[10px]">{phc.block} Block</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-slate-400 text-[10px] mr-2">Health Index:</Text>
                  <Text className={`font-extrabold text-xs ${phc.healthScore < 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {phc.healthScore}
                  </Text>
                </View>
              </View>
              {index < arr.length - 1 && <Divider />}
            </View>
          ))}
        </View>

        {/* District Health Pulse */}
        <SectionHeader title="District Outbreak Telemetry Trend" />
        <BarChart title="Infection Incidence Rates (Weekly)" />

        {/* Quick Actions Panel */}
        <SectionHeader title="Operations Quick Commands" />
        <View className="flex-row space-x-3 mb-6">
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

        {/* Recent Activity Feed */}
        <SectionHeader title="Recent Telemetry Audits" />
        <View className="bg-slate-900/40 p-4 border border-slate-800/40 rounded-3xl">
          {dummyNotifications.map((notif, index) => (
            <View key={notif.id}>
              <View className="py-2">
                <Text className="text-white font-bold text-xs">{notif.title}</Text>
                <Text className="text-slate-400 text-[10px] leading-relaxed mt-0.5">{notif.message}</Text>
              </View>
              {index < dummyNotifications.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
