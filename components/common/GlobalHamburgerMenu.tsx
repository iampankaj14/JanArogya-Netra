import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GlobalHamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export function GlobalHamburgerMenu({ visible, onClose }: GlobalHamburgerMenuProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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

  if (!visible) return null;

  const handleNavigate = (path: string) => {
    onClose();
    // Small delay to let the drawer close before transition
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  return (
    <View style={StyleSheet.absoluteFill} className="z-[99] flex-row">
      {/* Backdrop */}
      <Animated.View
        style={{ opacity: backdropOpacity }}
        className="absolute inset-0 bg-black"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Drawer Content */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: DRAWER_WIDTH,
        }}
        className="h-full bg-slate-900 border-r border-slate-800 shadow-2xl"
      >
        <SafeAreaView className="flex-1 py-6 px-5 justify-between">
          <View>
            {/* Header / Brand */}
            <View className="flex-row items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-blue-600/10 items-center justify-center mr-2 border border-blue-500/20">
                  <Feather name="eye" size={18} color="#60A5FA" />
                </View>
                <Text className="text-white font-extrabold text-base">Netra Admin</Text>
              </View>
              <Pressable onPress={onClose} className="p-1 active:opacity-75">
                <Feather name="x" size={20} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Menu Items */}
            <View className="space-y-2">
              <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">Systems Commands</Text>
              
              <Pressable
                onPress={() => handleNavigate('/scenario-simulator')}
                className="flex-row items-center py-3 px-4 rounded-xl active:bg-slate-800"
              >
                <Feather name="sliders" size={16} color="#60A5FA" className="mr-3" />
                <Text className="text-slate-200 font-bold text-xs">Scenario Simulator</Text>
              </Pressable>

              <Pressable
                onPress={() => handleNavigate('/explainable-ai')}
                className="flex-row items-center py-3 px-4 rounded-xl active:bg-slate-800"
              >
                <Feather name="info" size={16} color="#60A5FA" className="mr-3" />
                <Text className="text-slate-200 font-bold text-xs">Explainable AI</Text>
              </Pressable>

              <Pressable
                onPress={() => handleNavigate('/resource-redistribution')}
                className="flex-row items-center py-3 px-4 rounded-xl active:bg-slate-800"
              >
                <Feather name="refresh-cw" size={16} color="#60A5FA" className="mr-3" />
                <Text className="text-slate-200 font-bold text-xs">Stock Transfer</Text>
              </Pressable>

              <Pressable
                onPress={() => handleNavigate('/resource-movement-tracker')}
                className="flex-row items-center py-3 px-4 rounded-xl active:bg-slate-800"
              >
                <Feather name="truck" size={16} color="#60A5FA" className="mr-3" />
                <Text className="text-slate-200 font-bold text-xs">Logistics Tracker</Text>
              </Pressable>

              <Pressable
                onPress={() => handleNavigate('/settings')}
                className="flex-row items-center py-3 px-4 rounded-xl active:bg-slate-800"
              >
                <Feather name="settings" size={16} color="#60A5FA" className="mr-3" />
                <Text className="text-slate-200 font-bold text-xs">Console Settings</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer / User info summary */}
          <View className="pt-4 border-t border-slate-800 flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-blue-600/10 items-center justify-center mr-3 border border-blue-500/20">
              <Feather name="user" size={16} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-xs">Dr. Rajesh Kumar</Text>
              <Text className="text-slate-400 text-[9px] uppercase tracking-wider">District Health Officer</Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

export default GlobalHamburgerMenu;
