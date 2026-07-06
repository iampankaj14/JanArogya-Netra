import React, { useEffect, useRef } from 'react';
import { Pressable, Animated } from 'react-native';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#BFDBFE']
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22]
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={10}>
      <Animated.View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor, justifyContent: 'center' }}>
        <Animated.View style={{ 
          width: 20, height: 20, borderRadius: 10, 
          backgroundColor: value ? '#3B82F6' : '#FFFFFF', 
          transform: [{ translateX }],
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
        }} />
      </Animated.View>
    </Pressable>
  );
}
