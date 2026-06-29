import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import TextInput from '../components/ui/inputs/TextInput';
import PasswordInput from '../components/ui/inputs/PasswordInput';
import RoleSelector from '../components/ui/inputs/RoleSelector';
import PrimaryButton from '../components/ui/buttons/PrimaryButton';
import { UserRole } from '@/constants/roles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('DHO');
  const [loading, setLoading] = useState(false);
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
      router.replace('/(tabs)/situation-room');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header Branding */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-blue-600/10 items-center justify-center mb-4 border border-blue-500/20">
              <Feather name="eye" size={32} color="#60A5FA" />
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-tight">
              JanArogya <Text className="text-blue-500">Netra</Text>
            </Text>
            <Text className="text-slate-400 text-xs font-semibold uppercase mt-2 tracking-widest text-center">
              District Command Console
            </Text>
          </View>

          {/* Form Box */}
          <View className="bg-slate-900/80 border border-slate-800/60 rounded-3xl p-6 shadow-2xl">
            <Text className="text-white text-lg font-bold mb-5">Sign In</Text>

            {error ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex-row items-center">
                <Feather name="alert-triangle" size={16} color="#EF4444" className="mr-2" />
                <Text className="text-red-400 text-xs font-medium flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="space-y-4">
              <TextInput
                label="Government Email"
                placeholder="name@health.gov.in"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <PasswordInput
                label="Security Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />

              <RoleSelector
                label="Assigned Command Role"
                selectedValue={role}
                onValueChange={setRole}
              />

              <View className="pt-2">
                <PrimaryButton
                  title="Authenticate Session"
                  loading={loading}
                  onPress={handleLogin}
                />
              </View>
            </View>
          </View>

          <Text className="text-center text-slate-500 text-xs mt-8">
            Authorized Personnel Only. Actions are logged.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
