import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LoginRole, useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { auth, isFirebaseConfigured } from '../services/firebase/firebaseConfig';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<LoginRole>('DHO');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password, role, rememberMe);
      router.replace('/(tabs)/situation-room');
    } catch (e: any) {
      if (e.message === 'AUTH/INVALID_CREDENTIALS') {
        setError('Invalid email or password.');
      } else if (e.message === 'AUTH/ROLE_MISMATCH') {
        setError('Your account is not registered for this role.');
      } else {
        setError('Login failed: Please verify your internet or credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Password Reset', 
      'For password reset, please contact support at support@janarogya.gov.in',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      className="flex-1 bg-white"
    >
      {/* Header Section */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2 bg-white z-10">
        <View className="justify-center h-[45px]">
          <Text className="text-brand-navy font-black tracking-widest text-[14px]">MADE IN INDIA 🇮🇳</Text>
        </View>
        
        {/* Language Switcher Toggle */}
        <TouchableOpacity 
          onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex-row items-center bg-white border border-slate-200 rounded-full px-3.5 py-2 shadow-sm shadow-slate-200/50"
        >
          <Feather name="globe" size={16} color="#0E62CC" />
          <View className="flex-row items-center ml-2">
            <Text className={`text-[13px] ${language === 'en' ? 'text-[#0E62CC] font-bold' : 'text-slate-500 font-medium'}`}>English</Text>
            <Text className="text-slate-300 mx-1.5">|</Text>
            <Text className={`text-[13px] ${language === 'hi' ? 'text-[#0E62CC] font-bold' : 'text-slate-500 font-medium'}`}>हिन्दी</Text>
          </View>
        </TouchableOpacity>
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
            <Text className="text-slate-800 text-[15px] font-extrabold ml-2">{t('selectRole')}</Text>
          </View>

          <View className="flex-row justify-between mb-8 space-x-2">
            {(['DHO', 'BMO', 'PHC'] as const).map((r) => {
              const isActive = role === r;
              let title = '';
              let subtitle = '';
              let iconSource: any;

              if (r === 'DHO') {
                title = t('dhoTitle');
                subtitle = t('dhoSubtitle');
                iconSource = require('@/data/login/dho.png');
              } else if (r === 'BMO') {
                title = t('bmoTitle');
                subtitle = t('bmoSubtitle');
                iconSource = require('@/data/login/bmo.png');
              } else {
                title = t('phcTitle');
                subtitle = t('phcSubtitle');
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
          <Text className="text-slate-600 font-extrabold text-[11px] tracking-wider mb-2">{t('emailAddress')}</Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 mb-5 shadow-sm shadow-slate-100/50">
            <Feather name="mail" size={18} color="#64748B" />
            <TextInput
              placeholder={t('emailPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 ml-3 text-slate-800 text-[14px] font-semibold"
            />
          </View>

          {/* Password Input */}
          <Text className="text-slate-600 font-extrabold text-[11px] tracking-wider mb-2">{t('password')}</Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 mb-5 shadow-sm shadow-slate-100/50">
            <Feather name="lock" size={18} color="#64748B" />
            <TextInput
              placeholder={t('passwordPlaceholder')}
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
              <Text className="text-slate-800 text-[13px] font-extrabold">{t('rememberMe')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-[#0E62CC] text-[13px] font-extrabold">{t('forgotPassword')}</Text>
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
                  {loading ? t('authenticating') : t('loginTitle')}
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
