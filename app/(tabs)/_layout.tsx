import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager, Animated, PanResponder, Dimensions } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import TopAppBar from '../../components/ui/navigation/TopAppBar';
import GlobalHamburgerMenu from '../../components/common/GlobalHamburgerMenu';
import { NetraAIAssistant } from '../../components/common/NetraAIAssistant';

export default function TabLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showNetra, setShowNetra] = useState(false);
  const router = useRouter();

  // Dragging logic for the AI button
  const pan = useRef(new Animated.ValueXY()).current;
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

  // Custom Tab Bar component
  const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    // Only 4 visible tabs
    const slideAnim = useRef(new Animated.Value(state.index)).current;

    useEffect(() => {
      Animated.spring(slideAnim, {
        toValue: state.index,
        useNativeDriver: false,
        friction: 8,
        tension: 50,
      }).start();
    }, [state.index]);

    return (
      <View style={styles.tabBarContainer}>
        {/* Floating Dock */}
        <View className="bg-white border border-slate-100/50 py-1.5 px-2 rounded-[32px] mx-6 mb-6 shadow-xl">
          <View className="flex-row justify-between items-center relative">
            
            {/* Smooth Sliding Background Indicator */}
            <Animated.View 
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '20%', // 1/5th of the inner container width to account for 5 buttons
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: ['0%', '100%', '200%', '300%'] // Moves by its own width
                  })
                }],
                backgroundColor: 'rgba(14, 98, 204, 0.1)',
                borderRadius: 9999,
              }}
            />

            {state.routes.map((route: any, index: number) => {
            if (route.name === 'profile') return null; // Hide profile tab

            const isFocused = state.index === index;

            const onPress = () => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName: any = 'activity';
            let label = 'Home';
            if (route.name === 'situation-room') { iconName = 'activity'; label = 'Home'; }
            else if (route.name === 'district-map') { iconName = 'map'; label = 'Map'; }
            else if (route.name === 'phcs') { iconName = 'heart'; label = 'PHCs'; }
            else if (route.name === 'reports') { iconName = 'bar-chart-2'; label = 'Reports'; }

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
                    color={isFocused ? '#0E62CC' : '#94A3B8'}
                  />
                </View>
                <Text
                  className={`text-[10px] font-extrabold mt-1 ${isFocused ? 'text-[#0E62CC]' : 'text-slate-400'}`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
            
            {/* Emergency Action Button in Nav Bar */}
            <Pressable
              onPress={() => {
                setEmergencyMode(!emergencyMode);
                alert(emergencyMode ? 'Emergency mode deactivated.' : 'EMERGENCY MODE DEPLOYED IN DISTRICT!');
              }}
              className="items-center justify-center py-2.5 px-3.5 rounded-full flex-1 z-10 bg-transparent"
            >
              <View className="h-5 items-center justify-center">
                <Feather
                  name="shield"
                  size={18}
                  color={emergencyMode ? '#EF4444' : '#94A3B8'}
                />
              </View>
              <Text
                className={`text-[10px] font-extrabold mt-1 ${emergencyMode ? 'text-red-500' : 'text-slate-400'}`}
              >
                Alert
              </Text>
            </Pressable>

          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F5F8FC]">
      {/* Shared Header */}
      <TopAppBar
        onHamburgerPress={() => setDrawerOpen(true)}
        unreadNotificationsCount={3}
        onNotificationsPress={() => router.push('/notifications')}
        onProfilePress={() => router.push('/profile')}
      />

      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="situation-room" />
        <Tabs.Screen name="district-map" />
        <Tabs.Screen name="phcs" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="profile" />
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
        <Pressable
          onPress={() => setShowNetra(true)}
          className="w-[52px] h-[52px] rounded-full bg-[#0E62CC] items-center justify-center shadow-2xl active:bg-blue-700 border-4 border-white"
          style={{ elevation: 12, shadowColor: '#0E62CC', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
        >
          <Feather name="eye" size={22} color="white" />
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
    elevation: 0,
  },
});
