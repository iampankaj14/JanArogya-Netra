import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GlobalHamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const { width: rawWidth } = Dimensions.get('window');
const width = Math.min(rawWidth, 453);
const DRAWER_WIDTH = width * 0.85;

export function GlobalHamburgerMenu({ visible, onClose }: GlobalHamburgerMenuProps) {
  const router = useRouter();
  
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const { authState, logout } = useAuth();
  const { t } = useTranslation();

  const name = authState?.name || t('menuDefaultName');
  const roleDisplay = authState?.role === 'DHO' ? t('menuRoleDhoFallback') : authState?.role === 'BMO' ? t('menuRoleBmoFallback') : t('menuRolePhcFallback');
  const avatarUrl = authState?.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path as any);
    }, 200);
  };

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: visible ? 999 : -1 }]}
      pointerEvents={visible ? 'auto' : 'none'}
      className="flex-row"
    >
      {/* Backdrop */}
      <Animated.View
        style={{ 
          opacity: backdropOpacity,
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}
        className="absolute inset-0"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Drawer Content */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: DRAWER_WIDTH,
          backgroundColor: '#FFFFFF'
        }}
        className="h-full rounded-r-[32px] shadow-2xl overflow-hidden"
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>

            {/* Header / Brand */}
            <View className="flex-row justify-end mb-6">
              <Pressable onPress={onClose} className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200">
                <Feather name="x" size={18} color="#0F172A" />
              </Pressable>
            </View>

            {/* Welcome Card */}
            <View className="bg-blue-500 rounded-[24px] p-4 flex-row items-center mb-8 shadow-lg shadow-blue-500/30">
              <View className="w-12 h-12 rounded-[14px] bg-white items-center justify-center mr-3 shadow-sm shadow-black/10">
                <Feather name="shield" size={22} color="#3B82F6" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-blue-100 text-[9px] font-bold mb-0.5 tracking-wide">{t('menuWelcomeBack')}</Text>
                <Text className="text-white font-black text-[15px] mb-0.5" numberOfLines={1}>{name}</Text>
                <Text className="text-blue-200 text-[9px] font-medium" numberOfLines={1}>{roleDisplay}</Text>
              </View>
            </View>

            {/* Divider */}
            <View className="flex-row items-center justify-center mb-6">
              <View className="w-2 h-2 rounded-sm rotate-45 border border-slate-300" />
              <View className="h-[1px] w-6 bg-slate-200 mx-2" />
              <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-[2px]">{t('menuSystemsCommands')}</Text>
              <View className="h-[1px] w-6 bg-slate-200 mx-2" />
              <View className="w-2 h-2 rounded-sm rotate-45 border border-slate-300" />
            </View>

            {/* Menu Items */}
            <View className="mb-8 relative">
              <MaterialCommunityIcons name="hexagram-outline" size={180} color="rgba(59,130,246,0.03)" style={{position: 'absolute', top: 20, right: -40, zIndex: -1}} />
              <MaterialCommunityIcons name="chart-bubble" size={140} color="rgba(16,185,129,0.03)" style={{position: 'absolute', bottom: -20, left: -20, zIndex: -1}} />
                  <Pressable onPress={() => handleNavigate('/scenario-simulator')} className="bg-blue-50 rounded-2xl p-3 flex-row items-center border border-blue-200 shadow-sm shadow-blue-500/10 active:bg-blue-100 mb-4">
                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 shadow-sm border border-blue-100">
                      <Feather name="sliders" size={18} color="#3B82F6" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-brand-navy font-extrabold text-[13px] mb-0.5">{t('menuScenarioSimulatorTitle')}</Text>
                      <Text className="text-slate-500 text-[9px] font-semibold">{t('menuScenarioSimulatorDesc')}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#3B82F6" />
                  </Pressable>

                  <Pressable onPress={() => handleNavigate('/resource-redistribution')} className="bg-emerald-50 rounded-2xl p-3 flex-row items-center border border-emerald-200 shadow-sm shadow-emerald-500/10 active:bg-emerald-100 mb-4">
                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 shadow-sm border border-emerald-100">
                      <Feather name="refresh-cw" size={18} color="#10B981" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-brand-navy font-extrabold text-[13px] mb-0.5">{t('menuStockTransferTitle')}</Text>
                      <Text className="text-slate-500 text-[9px] font-semibold">{t('menuStockTransferDesc')}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#10B981" />
                  </Pressable>

                  <Pressable onPress={() => handleNavigate('/resource-movement-tracker')} className="bg-amber-50 rounded-2xl p-3 flex-row items-center border border-amber-200 shadow-sm shadow-amber-500/10 active:bg-amber-100 mb-4">
                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 shadow-sm border border-amber-100">
                      <Feather name="truck" size={18} color="#F59E0B" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-brand-navy font-extrabold text-[13px] mb-0.5">{t('menuLogisticsTrackerTitle')}</Text>
                      <Text className="text-slate-500 text-[9px] font-semibold">{t('menuLogisticsTrackerDesc')}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#F59E0B" />
                  </Pressable>

              <Pressable onPress={() => handleNavigate('/settings')} className="bg-pink-50 rounded-2xl p-3 flex-row items-center border border-pink-200 shadow-sm shadow-pink-500/10 active:bg-pink-100">
                <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-3 shadow-sm border border-pink-100">
                  <Feather name="settings" size={18} color="#EC4899" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-brand-navy font-extrabold text-[13px] mb-0.5">{t('menuConsoleSettingsTitle')}</Text>
                  <Text className="text-slate-500 text-[9px] font-semibold">{t('menuConsoleSettingsDesc')}</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#EC4899" />
              </Pressable>

            </View>

            {/* Smart Health Banner */}
            <View className="bg-blue-50/70 border border-blue-100 rounded-3xl p-4 flex-row items-center justify-between mb-8 overflow-hidden relative">
              <View className="flex-1 pr-2 z-10">
                <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center mb-2">
                  <Feather name="star" size={10} color="#FFF" />
                </View>
                <Text className="text-brand-navy font-black text-[12px] mb-1">{t('menuSmartHealthBannerTitle')}</Text>
                <Text className="text-slate-500 text-[9px] font-semibold leading-4">{t('menuSmartHealthBannerDesc')}</Text>
              </View>
              {/* Fake illustration using views and icons */}
              <View className="w-14 h-16 bg-blue-400 rounded-lg justify-center items-center opacity-80 z-10 relative mr-1 border-2 border-white shadow-sm">
                <View className="w-8 h-[2px] bg-white/70 mb-2 rounded-full" />
                <View className="w-8 h-[2px] bg-white/70 mb-2 rounded-full" />
                <View className="w-8 h-[2px] bg-white/70 rounded-full" />
                <View className="absolute -bottom-2 -right-3 w-7 h-7 rounded-full bg-emerald-400 items-center justify-center border-2 border-white">
                  <Feather name="check" size={12} color="#FFF" />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Footer User Row */}
          <View className="px-6 py-4 border-t border-slate-100 flex-row items-center justify-between bg-white">
            <View className="flex-row items-center flex-1 pr-4">
              <Image
                source={{ uri: avatarUrl }}
                className="w-12 h-12 rounded-full mr-3 border border-slate-200"
              />
              <View className="flex-1">
                <Text className="text-brand-navy font-black text-[13px] mb-0.5">{name}</Text>
                <Text className="text-slate-500 text-[8px] font-extrabold uppercase tracking-widest">{roleDisplay}</Text>
              </View>
            </View>
            <Pressable onPress={async () => { await logout(); onClose(); router.replace('/login'); }} className="p-2 bg-slate-50 rounded-xl border border-slate-200 active:bg-slate-100">
              <Feather name="log-out" size={18} color="#64748B" />
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

export default GlobalHamburgerMenu;
