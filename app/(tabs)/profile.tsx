import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Toggle } from '../../components/ui/inputs/Toggle';
import { localNotifications } from '@/services/repositories/localDb';

export default function ProfileScreen() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const [pushNotifs, setPushNotifs] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const name = authState.name || 'Dr. Rajesh Kumar';
  const role = authState.role || 'DHO';
  const email = authState.email || 'rajesh.kumar@health.gov.in';
  const avatarUrl = authState.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80';
  const location = authState.facilityId === 'phc_barola' ? 'PHC Barola, UP' : (authState.facilityId === 'f1' ? 'Bisrakh Block, UP' : 'Gautam Budh Nagar, UP');

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}>

        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 pl-1">
          <View className="flex-1 pr-4">
            <Text className="text-brand-navy font-black text-2xl mb-1 tracking-tight">{t('profileTitle')}</Text>
            <Text className="text-slate-500 text-[16px] font-semibold leading-5 pr-4">{t('profileSubtitle')}</Text>
          </View>
          <Image
            source={require('../../data/profile/profile_page.png')}
            className="-mr-4"
            style={{ width: 144, height: 96 }}
            resizeMode="contain"
          />
        </View>

        {/* Profile Card */}
        <View className="mb-10 mt-2">
          <View className="bg-blue-500 rounded-t-[32px] rounded-b-[40px] px-5 pt-6 pb-16 flex-row relative overflow-hidden">

            {/* Avatar */}
            <View className="relative mr-4 z-10">
              <Image
                source={{ uri: avatarUrl }}
                className="w-[84px] h-[84px] rounded-full border-2 border-white"
              />
              <View className="w-4 h-4 bg-emerald-400 border-2 border-white rounded-full absolute bottom-1 right-1" />
            </View>

            {/* Details */}
            <View className="flex-1 z-10">
              <View className="flex-row justify-between items-start mb-1.5">
                <View className="flex-row items-center flex-1 pr-2">
                  <Text className="text-white font-extrabold text-[17px] mr-1" numberOfLines={1}>{name}</Text>
                  <Feather name="check-circle" size={14} color="#FFF" />
                </View>

              </View>

              <View className="bg-white/20 border border-white/30 rounded-full px-2.5 py-0.5 self-start mb-3">
                <Text className="text-white text-[9px] font-bold tracking-widest uppercase">{role}</Text>
              </View>

              <View className="flex-row items-center mb-1">
                <Feather name="mail" size={10} color="#BFDBFE" className="mr-1.5" />
                <Text className="text-blue-100 text-[10px] font-semibold">{email}</Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="map-pin" size={10} color="#BFDBFE" className="mr-1.5" />
                <Text className="text-blue-100 text-[10px] font-semibold">{location}</Text>
              </View>
            </View>
          </View>

          {/* Overlapping Stats Card */}
          <View className="bg-white rounded-[24px] mx-4 -mt-10 p-2 shadow-sm shadow-black/10 border-2 border-blue-200 flex-row flex-wrap">
            {/* Stat 1 */}
            <View className="w-1/2 flex-row items-center justify-start p-3 border-b border-r border-slate-100">
              <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-2">
                <Feather name="shield" size={14} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[11px] font-bold" numberOfLines={1}>{t('profileStatRoleLabel')}</Text>
                <Text className="text-brand-navy font-black text-[15px]" numberOfLines={1}>{role}</Text>
              </View>
            </View>
            {/* Stat 2 */}
            <View className="w-1/2 flex-row items-center justify-start p-3 border-b border-slate-100">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-2">
                <Feather name="home" size={14} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[11px] font-bold" numberOfLines={1}>{role === 'PHC' ? t('profileStatBedsManaged') : t('profileStatPhcsManaged')}</Text>
                <Text className="text-brand-navy font-black text-[15px]" numberOfLines={1}>{role === 'PHC' ? '18' : (role === 'BMO' ? '8' : '24')}</Text>
              </View>
            </View>
            {/* Stat 3 */}
            <View className="w-1/2 flex-row items-center justify-start p-3 border-r border-slate-100">
              <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-2">
                <Feather name="users" size={14} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[11px] font-bold" numberOfLines={1}>{t('profileStatTeamMembers')}</Text>
                <Text className="text-brand-navy font-black text-[15px]" numberOfLines={1}>{role === 'PHC' ? '14' : (role === 'BMO' ? '45' : '128')}</Text>
              </View>
            </View>
            {/* Stat 4 */}
            <View className="w-1/2 flex-row items-center justify-start p-3">
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2">
                <Feather name="calendar" size={14} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-[11px] font-bold" numberOfLines={1}>{t('profileStatMemberSince')}</Text>
                <Text className="text-brand-navy font-black text-[15px]" numberOfLines={1}>{t('profileStatMemberSinceValue')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Console Preferences */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3 pl-1">
            <View className="w-6 h-6 rounded-full bg-purple-50 items-center justify-center mr-2">
              <Feather name="settings" size={12} color="#8B5CF6" />
            </View>
            <Text className="text-brand-navy font-black text-[14px] flex-1">{t('profilePreferencesTitle')}</Text>
            <Feather name="chevron-up" size={18} color="#94A3B8" />
          </View>

          <View className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm shadow-black/5 p-4">

            {/* Language Toggle */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Feather name="globe" size={18} color="#3B82F6" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{language === 'hi' ? 'हिंदी' : 'English'}</Text>
                  <Text className="text-slate-500 text-[9px]">{t('profileLanguageDesc')}</Text>
                </View>
              </View>
              <Toggle value={language === 'hi'} onValueChange={(val) => setLanguage(val ? 'hi' : 'en')} />
            </View>
            <View className="h-[1px] bg-slate-50 mb-4 ml-12" />

            {/* Item 3 */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-3">
                  <Feather name="bell" size={18} color="#F59E0B" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('profileOutbreakAlarmsTitle')}</Text>
                  <Text className="text-slate-500 text-[9px]">{t('profileOutbreakAlarmsDesc')}</Text>
                </View>
              </View>
              <Toggle value={pushNotifs} onValueChange={setPushNotifs} />
            </View>
          </View>
        </View>

        {/* System & Support */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3 pl-1">
            <View className="w-6 h-6 rounded-full bg-emerald-50 items-center justify-center mr-2">
              <Feather name="tool" size={12} color="#10B981" />
            </View>
            <Text className="text-brand-navy font-black text-[14px] flex-1">{t('profileSupportSectionTitle')}</Text>
            <Feather name="chevron-up" size={18} color="#94A3B8" />
          </View>

          <View className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm shadow-black/5 p-4">
            {/* Item 1 */}
            <Pressable onPress={() => router.push('/notifications')} className="flex-row items-center justify-between mb-4 active:opacity-70">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                  <Feather name="mail" size={18} color="#3B82F6" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('profileNotificationsInboxTitle')}</Text>
                  <Text className="text-slate-500 text-[9px]">{t('profileNotificationsInboxDesc')}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                {localNotifications.length > 0 && (
                  <View className="bg-red-500 rounded-full min-w-[20px] h-5 px-1 items-center justify-center mr-2">
                    <Text className="text-white text-[10px] font-bold">{localNotifications.length}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </View>
            </Pressable>
            <View className="h-[1px] bg-slate-50 mb-4 ml-12" />

            {/* Item 2 */}
            <Pressable onPress={() => router.push('/settings')} className="flex-row items-center justify-between mb-4 active:opacity-70">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3 border border-emerald-100">
                  <Feather name="settings" size={18} color="#10B981" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('profileSystemSettingsTitle')}</Text>
                  <Text className="text-slate-500 text-[9px]">{t('profileSystemSettingsDesc')}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </Pressable>
            <View className="h-[1px] bg-slate-50 mb-4 ml-12" />


            {/* Item 4 */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3 border-2 border-blue-200">
                  <Feather name="info" size={18} color="#64748B" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-brand-navy font-bold text-[13px] mb-0.5">{t('profileConsoleVersionTitle')}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="text-slate-500 font-semibold text-[10px] mr-2">{t('profileConsoleVersionValue')}</Text>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </View>
            </View>
          </View>
        </View>

        {/* Log Out */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          className="bg-red-50 border border-red-100 rounded-3xl p-4 flex-row items-center justify-between mb-8 shadow-sm shadow-black/5 mx-1"
        >
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-red-100 rounded-2xl items-center justify-center mr-4 border border-red-200">
              <Feather name="power" size={24} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-red-600 font-extrabold text-[15px] mb-0.5">{t('profileLogoutTitle')}</Text>
              <Text className="text-slate-500 text-[10px] font-semibold">{t('profileLogoutDesc')}</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#EF4444" />
        </Pressable>

      </ScrollView>
    </ScreenContainer>
  );
}
