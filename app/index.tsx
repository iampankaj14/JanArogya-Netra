import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource = require('../data/splash/splash_animation.mp4');

export default function SplashScreen() {
  const router = useRouter();

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  useEffect(() => {
    // Navigate to Login when video finishes naturally
    const subscription = player.addListener('playToEnd', () => {
      router.replace('/login');
    });

    // Safety fallback: if video fails to play or gets stuck, dismiss after 6 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 6000);

    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, [player, router]);

  return (
    <View style={styles.container} className="bg-white">
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Force pure white
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: -10,
    right: -10,
    width: '105%',
    height: '105%',
  },
});
