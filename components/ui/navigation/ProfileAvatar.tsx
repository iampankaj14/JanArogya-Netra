import React from 'react';
import { Pressable, Text, View, Image } from 'react-native';

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function ProfileAvatar({
  name,
  imageUrl,
  size = 'md',
  onPress,
}: ProfileAvatarProps) {
  const getInitials = (n: string) => {
    if (!n) return '';
    const parts = n.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  let sizeClass = '';
  let textClass = '';

  switch (size) {
    case 'sm':
      sizeClass = 'w-8 h-8 rounded-full';
      textClass = 'text-xs font-bold';
      break;
    case 'lg':
      sizeClass = 'w-16 h-16 rounded-full';
      textClass = 'text-xl font-bold';
      break;
    case 'md':
    default:
      sizeClass = 'w-11 h-11 rounded-full';
      textClass = 'text-sm font-bold';
      break;
  }

  const avatar = imageUrl ? (
    <Image source={{ uri: imageUrl }} className={sizeClass} />
  ) : (
    <View className={`${sizeClass} bg-brand-navy items-center justify-center border border-brand-navy`}>
      <Text className={`text-white ${textClass}`}>{getInitials(name)}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
        {avatar}
      </Pressable>
    );
  }

  return avatar;
}

export default ProfileAvatar;
