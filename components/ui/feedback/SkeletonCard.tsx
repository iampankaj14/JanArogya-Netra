import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface SkeletonCardProps {
  height?: number;
  width?: string | number;
}

export function SkeletonCard({
  height = 100,
  width = '100%',
}: SkeletonCardProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        opacity,
        height,
        width: width as any,
      }}
      className="bg-slate-200 rounded-xl w-full mb-3"
    />
  );
}

export default SkeletonCard;
