import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth, LoginRole } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<LoginRole>('DHO');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      login(role, email);
      router.replace('/(tabs)/situation-room');
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      className="flex-1 bg-white"
    >
      {/* Header Section (Fixed at top, outside ScrollView) */}
      <View className="flex-row justify-between items-center px-2 pt-4 pb-2 bg-white z-10">
        <Image
          source={require('@/data/login/govt.png')}
          style={{ width: 140, height: 45, marginLeft: -15 }}
          resizeMode="contain"
        />
        <View className="flex-row bg-slate-50 rounded-full px-3 py-1.5 items-center border border-slate-200">
          <Feather name="globe" size={12} color="#0E62CC" style={{ marginRight: 4 }} />
          <Text className="text-[11px] font-bold text-[#0E62CC]">English</Text>
          <Text className="text-[11px] text-slate-300 mx-1">|</Text>
          <Text className="text-[11px] font-bold text-slate-500">हिंदी</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-grow-1" keyboardShouldPersistTaps="handled">

        {/* Logo Section */}
        <View className="items-center justify-center" style={{ marginTop: -15, marginBottom: 5 }}>
          <Image
            source={require('@/data/logo.png')}
            style={{ width: 320, height: 190 }}
            resizeMode="contain"
          />
        </View>

        {/* Main Form Card */}
        <View className="flex-1 bg-[#F8FAFC] rounded-t-[36px] px-6 pt-8 pb-12 border-t border-slate-100 shadow-sm shadow-slate-200/50" style={{ marginTop: -25 }}>

          {error ? (
            <View className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex-row items-center">
              <Feather name="alert-triangle" size={16} color="#EF4444" className="mr-2" />
              <Text className="text-red-700 text-xs font-semibold flex-1">{error}</Text>
            </View>
          ) : null}

          {/* Role Selector */}
          <View className="flex-row items-center mb-4">
            <Feather name="users" size={16} color="#334155" />
            <Text className="text-slate-800 text-[15px] font-extrabold ml-2">Select Your Role</Text>
          </View>

          <View className="flex-row justify-between mb-8 space-x-2">
            {(['DHO', 'BMO', 'PHC'] as const).map((r) => {
              const isActive = role === r;
              let title = '';
              let subtitle = '';
              let iconSource: any;

              if (r === 'DHO') {
                title = 'DHO';
                subtitle = 'District Health\nOfficer';
                iconSource = require('@/data/login/dho.png');
              } else if (r === 'BMO') {
                title = 'BMO';
                subtitle = 'Block Medical\nOfficer';
                iconSource = require('@/data/login/bmo.png');
              } else {
                title = 'PHC Staff';
                subtitle = 'Health Centre\nStaff';
                iconSource = require('@/data/login/phc.png');
              }

              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  activeOpacity={0.8}
                  className={`flex-1 bg-white rounded-2xl p-3 items-center justify-center relative shadow-sm shadow-slate-200/40 ${isActive ? 'border-[#0E62CC] border-[1.5px]' : 'border border-transparent'
                    }`}
                >
                  {isActive && (
                    <View className="absolute top-1.5 right-1.5 w-[15px] h-[15px] rounded-full bg-[#0E62CC] items-center justify-center z-10 border border-white">
                      <Feather name="check" size={9} color="white" />
                    </View>
                  )}
                  <Image
                    source={iconSource}
                    style={{ width: 48, height: 48, marginBottom: 8 }}
                    resizeMode="contain"
                  />
                  <Text className="font-extrabold text-[12px] text-slate-800 mb-0.5">{title}</Text>
                  <Text className="text-[9px] text-slate-500 font-bold text-center leading-[11px]">{subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Email Input */}
          <Text className="text-slate-600 font-extrabold text-[11px] tracking-wider mb-2">EMAIL ADDRESS</Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 mb-5 shadow-sm shadow-slate-100/50">
            <Feather name="mail" size={18} color="#64748B" />
            <TextInput
              placeholder="official@health.gov.in"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 ml-3 text-slate-800 text-[14px] font-semibold"
            />
          </View>

          {/* Password Input */}
          <Text className="text-slate-600 font-extrabold text-[11px] tracking-wider mb-2">PASSWORD</Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 mb-5 shadow-sm shadow-slate-100/50">
            <Feather name="lock" size={18} color="#64748B" />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 text-slate-800 text-[14px] font-semibold"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pl-2">
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
              <View className={`w-[18px] h-[18px] rounded-[5px] border items-center justify-center mr-2 ${rememberMe ? 'bg-[#0E62CC] border-[#0E62CC]' : 'bg-white border-slate-300'}`}>
                {rememberMe && <Feather name="check" size={12} color="white" />}
              </View>
              <Text className="text-slate-800 text-[13px] font-extrabold">Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { }}>
              <Text className="text-[#0E62CC] text-[13px] font-extrabold">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Action Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
            className="w-full mt-2 mb-4"
          >
            <LinearGradient
              colors={['#1870DA', '#0E62CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 14, height: 46 }}
              className="w-full shadow-lg shadow-blue-500/30"
            >
              <View className="flex-1 items-center justify-center">
                <Text className="text-white font-extrabold text-[16px] tracking-wide text-center">
                  {loading ? 'Authenticating...' : 'Login'}
                </Text>
              </View>

              {!loading && (
                <View className="absolute right-1.5 top-1.5 bottom-1.5 bg-white/20 items-center justify-center" style={{ width: 34, borderRadius: 10 }}>
                  <Feather name="arrow-right" size={16} color="white" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
