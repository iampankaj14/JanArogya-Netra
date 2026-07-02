import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, useWindowDimensions, Image } from 'react-native';
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
import { dummyNotifications } from '@/dummy/notifications';
import { AIRecommendation } from '@/shared/types/ai';

export default function SituationRoomScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const carouselWidth = width - 44;
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

  const handleApproveMission = (id: string) => {
    const mission = activeMissions.find(m => m.id === id);
    if (mission) {
      setActiveMissions(prev => prev.filter(m => m.id !== id));
      setCommandQueue(prev => [
        ...prev,
        { id: mission.id, item: mission.item, qty: mission.quantity, status: 'Preparing Dispatch', ETA: '6 hrs' }
      ]);
    }
  };

  const diseases = [
    { name: 'Dengue', rate: '+18%', risk: 'HIGH', color: '#EF4444' },
    { name: 'Malaria', rate: '-4%', risk: 'LOW', color: '#10B981' },
    { name: 'Chikungunya', rate: '+2%', risk: 'MED', color: '#F59E0B' },
    { name: 'Seasonal Influenza', rate: '+12%', risk: 'MED', color: '#F59E0B' },
    { name: 'Acute Diarrheal', rate: '+22%', risk: 'HIGH', color: '#EF4444' },
    { name: 'Typhoid', rate: '0%', risk: 'LOW', color: '#10B981' }
  ];

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
    <ScreenContainer padding={false} withSafeArea={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16, paddingBottom: 130 }} className="bg-[#F2F7FD]">
        
        {/* Netra Daily Briefing (Hero Card) */}
        <LinearGradient
          colors={['#E8F2FC', '#D4E6FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, overflow: 'hidden' }}
          className="mb-10 py-24 px-7 shadow-sm border border-white/60 relative"
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
                <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>3 Districts under watch</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2.5 shadow-sm shadow-red-500/10">
                  <Feather name="alert-triangle" size={10} color="white" />
                </View>
                <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>12 Outbreak alerts</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-yellow-500 items-center justify-center mr-2.5 shadow-sm shadow-yellow-500/10">
                  <Feather name="battery" size={10} color="white" />
                </View>
                <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>8 Medicine shortages</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-2.5 shadow-sm shadow-green-500/10">
                  <Feather name="activity" size={10} color="white" />
                </View>
                <Text className="text-slate-800 text-[11.5px] font-bold" numberOfLines={1}>5 PHCs need attention</Text>
              </View>
            </View>
            
            <Pressable className="self-start rounded-full bg-[#1A63C6] px-5 py-2.5 mb-6 flex-row items-center shadow-sm shadow-blue-500/50">
              <Text className="text-white text-[12px] font-bold mr-2">View Details</Text>
              <View className="bg-white rounded-full p-0.5">
                 <Feather name="arrow-right" size={11} color="#1A63C6" />
              </View>
            </Pressable>
          </View>
        </LinearGradient>
      </ScrollView>
    </ScreenContainer>
  );
}
