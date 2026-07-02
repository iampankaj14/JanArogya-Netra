import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TextInput from '../components/ui/inputs/TextInput';
import PasswordInput from '../components/ui/inputs/PasswordInput';
import { UserRole } from '@/constants/roles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('DHO');
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    setLoading(true);

    // Simulate authentication lag
    setTimeout(() => {
      setLoading(false);
      setShowLoadingScreen(true);

      // Show dashboard skeleton for 1.8 seconds before loading home screen
      setTimeout(() => {
        router.replace('/(tabs)/situation-room');
      }, 1800);
    }, 1200);
  };

  if (showLoadingScreen) {
    return (
      <View className="flex-1 bg-white px-6 py-12 justify-between">
        <View className="animate-pulse">
          {/* Header Skeleton */}
          <View className="flex-row justify-between items-center mb-8 mt-4">
            <View className="w-8 h-8 rounded-lg bg-slate-200" />
            <View className="w-32 h-6 rounded-lg bg-slate-200" />
            <View className="flex-row space-x-2">
              <View className="w-8 h-8 rounded-full bg-slate-200" />
              <View className="w-8 h-8 rounded-full bg-slate-200" />
            </View>
          </View>

          {/* Briefing Banner Skeleton */}
          <View className="w-full h-28 rounded-3xl bg-slate-100 border border-slate-200/50 p-4 mb-6 justify-center">
            <View className="w-1/3 h-4 rounded bg-slate-200 mb-2" />
            <View className="w-full h-3 rounded bg-slate-200 mb-1.5" />
            <View className="w-2/3 h-3 rounded bg-slate-200" />
          </View>

          {/* Grid Cards Skeletons */}
          <View className="flex-row flex-wrap -mx-2 mb-6">
            <View className="w-1/2 px-2 mb-4">
              <View className="h-24 rounded-2xl bg-slate-100 border border-slate-200/50 p-4" />
            </View>
            <View className="w-1/2 px-2 mb-4">
              <View className="h-24 rounded-2xl bg-slate-100 border border-slate-200/50 p-4" />
            </View>
          </View>

          {/* List Card Skeletons */}
          <View className="w-full h-44 rounded-3xl bg-slate-100 border border-slate-200/50 p-4">
            <View className="w-1/4 h-4 rounded bg-slate-200 mb-4" />
            <View className="w-full h-8 rounded-xl bg-slate-200 mb-2" />
            <View className="w-full h-8 rounded-xl bg-slate-200" />
          </View>
        </View>

        <Text className="text-center text-brand-gray text-xs font-semibold tracking-wider animate-pulse uppercase">
          Initializing telemetry feed...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      className="flex-1 bg-white"
    >
      {/* Top Header Row */}
      <View className="flex-row justify-between items-center px-2 pt-4 pb-2 border-b border-slate-100/50">
        <View className="flex-row items-center">
          <Image 
            source={require('../assets/images/emblem_new.png')} 
            style={{ width: 150, height: 35, marginLeft: -30 }} 
            resizeMode="contain"
          />
        </View>
        <View className="flex-row bg-slate-50 rounded-full px-3 py-1.5 items-center border border-slate-200 shadow-xxs">
          <Feather name="globe" size={12} color="#0E62CC" style={{ marginRight: 4 }} />
          <Text className="text-[10px] font-black text-[#0E62CC]">English</Text>
          <Text className="text-[10px] text-slate-350 font-bold mx-1">|</Text>
          <Text className="text-[10px] font-bold text-slate-500">हिंदी</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} className="flex-grow-1 bg-white" keyboardShouldPersistTaps="handled">
        <View className="flex-grow justify-start px-4 pt-4 pb-6">
          {/* Header Branding */}
          <View className="items-center" style={{ marginBottom: -25, marginTop: -15, zIndex: 10 }}>
            <Image 
              source={require('../assets/images/logo_combined.png')} 
              style={{ width: 400, height: 260 }} 
              resizeMode="contain"
            />
          </View>

          {/* Form Content */}
          <View className="bg-slate-50 border border-slate-100/80 rounded-[32px] p-8 shadow-md space-y-6">
            {error ? (
              <View className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex-row items-center">
                <Feather name="alert-triangle" size={16} color="#EF4444" className="mr-2" />
                <Text className="text-red-700 text-xs font-semibold flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Custom Card-Style Role Selector */}
            <View className="mb-4">
              <View className="flex-row items-center mb-3">
                <Feather name="users" size={15} color="#334155" />
                <Text className="text-slate-800 text-sm font-black ml-1.5">Select Your Role</Text>
              </View>
              <View className="flex-row justify-between -mx-1">
                {(['DHO', 'BMO', 'PHC'] as const).map((r) => {
                  const roleVal = r === 'PHC' ? 'PHC Staff' as any : r;
                  const isActive = role === roleVal;
                  let title = '';
                  let subtitle = '';
                  let iconSource: any;
                  
                  if (r === 'DHO') {
                    title = 'DHO';
                    subtitle = 'District Health\nOfficer';
                    iconSource = require('../assets/images/role_dho.png');
                  } else if (r === 'BMO') {
                    title = 'BMO';
                    subtitle = 'Block Medical\nOfficer';
                    iconSource = require('../assets/images/role_bmo.png');
                  } else {
                    title = 'PHC Staff';
                    subtitle = 'Health Centre\nStaff';
                    iconSource = require('../assets/images/role_phc.png');
                  }
                  
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setRole(roleVal)}
                      activeOpacity={0.8}
                      className={`flex-1 mx-1 bg-white border rounded-2xl p-2.5 items-center justify-center relative ${
                        isActive ? 'border-[#0E62CC] border-[1.5px]' : 'border-slate-100 shadow-sm'
                      }`}
                      style={{ elevation: 2 }}
                    >
                      {isActive && (
                        <View className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-[#0E62CC] items-center justify-center z-10">
                          <Feather name="check" size={9} color="white" />
                        </View>
                      )}
                      <Image 
                        source={iconSource}
                        style={{ width: 44, height: 44, marginBottom: 6 }}
                        resizeMode="contain"
                      />
                      <Text className="font-black text-[11px] text-slate-800 mb-0.5">{title}</Text>
                      <Text className="text-[9px] text-slate-500 font-bold text-center leading-3">{subtitle}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TextInput
              label="Email Address"
              placeholder="official@health.gov.in"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="email"
              className="mb-2"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              className="mb-2"
            />

            {/* Remember Me & Forgot Password */}
            <View className="flex-row items-center justify-between mt-1 mb-4">
              <TouchableOpacity onPress={() => {}} className="flex-row items-center">
                <View className="w-4 h-4 rounded border border-[#0E62CC] bg-[#0E62CC] items-center justify-center mr-2">
                  <Feather name="check" size={10} color="white" />
                </View>
                <Text className="text-slate-750 text-xs font-bold">Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => alert('Forgot password helper triggered.')}>
                <Text className="text-[#0E62CC] text-xs font-bold">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Action Button */}
            <View className="pt-4 pb-2">
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
                className="w-full"
              >
                <LinearGradient
                  colors={['#1E7BE0', '#0E62CC', '#0B4FA8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 8 }}
                  className="w-full py-5 flex-row rounded-lg items-center justify-center relative shadow-lg shadow-blue-500/40"
                >
                  <Text className="text-white font-black text-lg tracking-wider text-center flex-1">
                    {loading ? 'Authenticating...' : 'Login'}
                  </Text>
                  {!loading && (
                    <View className="absolute right-4 bg-white/20 p-1 rounded-md">
                      <Feather name="arrow-right" size={14} color="white" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
