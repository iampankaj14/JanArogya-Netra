import { Feather } from '@expo/vector-icons';
import { Image, Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import NotificationBell from './NotificationBell';
import ProfileAvatar from './ProfileAvatar';
import { useAuth } from '../../../context/AuthContext';

interface TopAppBarProps {
  onHamburgerPress: () => void;
  unreadNotificationsCount?: number;
  onNotificationsPress: () => void;
  onProfilePress: () => void;
}

export function TopAppBar({
  onHamburgerPress,
  unreadNotificationsCount = 0,
  onNotificationsPress,
  onProfilePress,
}: TopAppBarProps) {
  const { authState } = useAuth();
  const router = useRouter();
  const roleDisplay = authState?.role === 'DHO' ? 'Chief Medical Officer' : authState?.role === 'BMO' ? 'Block Medical Officer' : 'PHC Officer';

  return (
    <View className="pt-8 pb-2 z-50">
      <View className="flex-row bg-white border border-slate-200 py-1.5 px-2 justify-between items-center rounded-full mx-6 shadow-sm shadow-slate-300/50">
        {/* Left: Hamburger menu */}
        <Pressable
          onPress={onHamburgerPress}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-slate-50"
        >
          <Feather name="menu" size={19} color="#0B1D3A" />
        </Pressable>

        {/* Center: Identity & Logo */}
        <Pressable 
          className="flex-col items-center justify-center flex-1 mt-1 active:opacity-60"
          onPress={() => router.push({ pathname: '/(tabs)/situation-room', params: { scrollToTop: Date.now().toString() } })}
        >
          <Image
            source={require('../../../assets/images/janarogya_logo_text.png')}
            style={{ width: 140, height: 26 }}
            resizeMode="contain"
          />
        </Pressable>

        {/* Right: Actions */}
        <View className="flex-row items-center gap-2">
          <NotificationBell
            badgeCount={unreadNotificationsCount}
            onPress={onNotificationsPress}
          />
          <ProfileAvatar
            name={authState?.name || "Dr. Rajesh Kumar"}
            imageUrl={authState?.avatarUrl}
            size="sm"
            onPress={onProfilePress}
          />
        </View>
      </View>
    </View>
  );
}

export default TopAppBar;
