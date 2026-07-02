import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource = require('../assets/videos/splash.mp4');

export default function SplashScreen() {
  const router = useRouter();

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  useEffect(() => {
    // Navigate to Login after 4 seconds (approx duration of splash video)
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container} className="bg-brand-navy">
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
