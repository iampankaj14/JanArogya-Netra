import { Feather } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutAnimation, PanResponder, Platform, Pressable, StyleSheet, Text, UIManager, View, Image, Easing } from 'react-native';
import GlobalHamburgerMenu from '../../components/common/GlobalHamburgerMenu';
import { NetraAIAssistant } from '../../components/common/NetraAIAssistant';
import TopAppBar from '../../components/ui/navigation/TopAppBar';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { alertsRepository } from '@/services/repositories/alertsRepository';
import { phcRepository } from '@/services/repositories/phcRepository';
import { notificationsRepository } from '@/services/repositories/notificationsRepository';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom Tab Bar component moved outside to prevent re-mounting
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { authState } = useAuth();
  const { t } = useTranslation();

  const currentActiveRouteName = state.routes[state.index].name;
  const highlightRouteName = currentActiveRouteName === 'phc-detail' ? 'phcs' : currentActiveRouteName;

  const visibleRoutes = state.routes.filter((route: any) => {
    if (route.name === 'profile' || route.name === 'phc-detail') return false;
    if (authState?.role === 'PHC') {
      return ['situation-room', 'inventory', 'reports', 'emergency'].includes(route.name);
    }
    return ['situation-room', 'district-map', 'phcs', 'reports'].includes(route.name);
  });

  const activeVisualIndex = Math.max(0, visibleRoutes.findIndex((r: any) => r.name === highlightRouteName));
  
  // Sequential Animation State
  const slideAnim = useRef(new Animated.Value(activeVisualIndex)).current;
  const prevIndexRef = useRef(activeVisualIndex);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeVisualIndex,
      useNativeDriver: false,
      friction: 7,
      tension: 65, // Reverted to the original snappy speed
    }).start();
  }, [activeVisualIndex]);

  return (
    <View style={styles.tabBarContainer}>
      {/* Premium Floating Dock */}
      <View 
        className="bg-white border border-slate-200/80 py-1.5 px-2 rounded-[36px] mx-6 mb-8"
        style={{
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 24
        }}
      >
        <View className="flex-row justify-between items-center relative">

          {/* Step-by-Step Sliding Background Indicator */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '25%', // 1/4th of the inner container width since there are exactly 4 buttons
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1, 2, 3],
                  outputRange: ['0%', '100%', '200%', '300%']
                })
              }],
              backgroundColor: 'rgba(26, 99, 198, 0.18)', // Brand blue with stronger opacity
              borderRadius: 9999,
            }}
          />

          {visibleRoutes.map((route: any, index: number) => {
            const isFocused = route.name === highlightRouteName;

            const onPress = () => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              const isActuallyFocused = currentActiveRouteName === route.name;

              if (!isActuallyFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName: any = 'activity';
            let label = t('tabHome');
            if (route.name === 'situation-room') {
              iconName = 'activity';
              label = authState?.role === 'PHC' ? t('tabFacility') : t('tabHome');
            }
            else if (route.name === 'district-map') { iconName = 'map'; label = t('tabMap'); }
            else if (route.name === 'phcs') { iconName = 'heart'; label = t('tabPhcs'); }
            else if (route.name === 'inventory') { iconName = 'box'; label = t('tabInventory'); }
            else if (route.name === 'reports') { iconName = 'bar-chart-2'; label = t('tabReports'); }
            else if (route.name === 'emergency') { iconName = 'shield'; label = t('tabAlert'); }

            const activeColor = route.name === 'emergency' ? '#EF4444' : '#0E62CC';

            return (
              <Pressable
                key={route.name}
                onPress={onPress}
                className="items-center justify-center py-2.5 px-3.5 rounded-full flex-1 z-10 bg-transparent"
              >
                <View className="h-5 items-center justify-center">
                  <Feather
                    name={iconName}
                    size={18}
                    color={isFocused ? activeColor : '#94A3B8'}
                  />
                </View>
                <Text
                  className={`text-[10px] font-extrabold mt-1 tracking-wider ${isFocused ? (route.name === 'emergency' ? 'text-red-500' : 'text-[#0E62CC]') : 'text-slate-400'}`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showNetra, setShowNetra] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!authState?.uid && !authState?.role) return;
    
    const unsubscribe = notificationsRepository.subscribeNotifications(
      { role: authState.role, uid: authState.uid },
      (notifications) => {
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [authState]);

  // Strict Route Guarding
  useEffect(() => {
    if (!authState) return;
    
    const currentRoute = segments[segments.length - 1];
    
    // As per user request, PHC staff now has access to all hamburger menu advanced tools
    if (authState.role === 'PHC') {
      const restrictedForPHC = [
        'district-map', 
        'phcs'
      ];
      if (restrictedForPHC.includes(currentRoute)) {
        router.replace('/(tabs)/situation-room');
      }
    } else if (authState.role === 'BMO') {
      // BMO restrictions (if any remain)
    }
  }, [segments, authState?.role, router]);

  // Dragging logic for the AI button
  const pan = useRef(new Animated.ValueXY()).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const { width: rawScreenWidth } = Dimensions.get('window');
  const SCREEN_WIDTH = Math.min(rawScreenWidth, 453);
  // Initial position is at right: 16, width is 52.
  const MAX_LEFT = -(SCREEN_WIDTH - 16 - 52 - 16);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Start dragging only after moving a few pixels to allow normal taps
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();

        const currentX = (pan.x as any)._value;
        // Snap to left or right edge based on midpoint
        const targetX = currentX < (MAX_LEFT / 2) ? MAX_LEFT : 0;

        Animated.spring(pan, {
          toValue: { x: targetX, y: (pan.y as any)._value },
          useNativeDriver: false,
          friction: 6,
          tension: 40
        }).start();
      }
    })
  ).current;

  return (
    <View className="flex-1 bg-[#F5F8FC]">
      {/* Shared Header */}
      <TopAppBar
        onHamburgerPress={() => setDrawerOpen(true)}
        unreadNotificationsCount={unreadCount}
        onNotificationsPress={() => router.push('/notifications')}
        onProfilePress={() => router.push('/profile')}
      />

      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
        backBehavior="history"
      >
        <Tabs.Screen name="situation-room" />
        <Tabs.Screen name="district-map" />
        <Tabs.Screen name="phcs" />
        <Tabs.Screen name="inventory" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="phc-detail" options={{ href: null }} />
        <Tabs.Screen name="scenario-simulator" options={{ href: null }} />
        <Tabs.Screen name="resource-redistribution" options={{ href: null }} />
        <Tabs.Screen name="resource-movement-tracker" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="emergency" options={{ href: null }} />
      </Tabs>

      {/* Global Drawer Menu */}
      <GlobalHamburgerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Global Floating Netra AI Trigger Button */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {
            position: 'absolute',
            bottom: 100,
            right: 16,
            zIndex: 9999,
          },
          { transform: pan.getTranslateTransform() }
        ]}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: '#4F46E5',
            borderRadius: 30,
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({ inputRange: [1, 1.15], outputRange: [0.6, 0] })
          }}
        />
        <Pressable
          onPress={() => setShowNetra(true)}
          className="w-[56px] h-[56px] rounded-full bg-white items-center justify-center shadow-2xl active:scale-95 border border-slate-200 overflow-hidden"
          style={{ elevation: 12, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
        >
          <Image source={require('../../data/netra.png')} style={{width: 36, height: 36}} resizeMode="contain" />
        </Pressable>
      </Animated.View>

      {/* Netra AI Chat Interface Modal Overlay */}
      <NetraAIAssistant
        visible={showNetra}
        onClose={() => setShowNetra(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 20,
    zIndex: 50,
  },
});
