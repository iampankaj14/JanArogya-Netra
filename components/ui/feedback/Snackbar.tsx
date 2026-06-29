import React, { useEffect, useRef, useCallback } from 'react';
import { Text, Animated, Pressable } from 'react-native';

interface SnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export function Snackbar({
  visible,
  message,
  onDismiss,
  duration = 3000,
}: SnackbarProps) {
  const slideAnim = useRef(new Animated.Value(100));

  const handleDismiss = useCallback(() => {
    // Slide down
    Animated.timing(slideAnim.current, {
      toValue: 100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      // Slide up
      Animated.timing(slideAnim.current, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.current.setValue(100);
    }
  }, [visible, duration, handleDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim.current }],
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        zIndex: 9999,
      }}
      className="bg-slate-900 px-4 py-3 rounded-lg flex-row items-center justify-between shadow-lg"
    >
      <Text className="text-white text-xs font-semibold flex-1 mr-4">
        {message}
      </Text>
      <Pressable onPress={handleDismiss}>
        <Text className="text-blue-400 text-xs font-bold px-2 py-1">
          DISMISS
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default Snackbar;
