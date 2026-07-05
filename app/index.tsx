import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useVideoPlayer, VideoView } from 'expo-video';

const videoSource = require('../data/splash/splash_animation.mp4');

export default function SplashScreen() {
  const router = useRouter();

  const { authState, loading } = useAuth();
  const videoRef = React.useRef<any>(null);

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.muted = true; // Web browsers block autoplay unless the video is muted
    playerInstance.play();
  });

  useEffect(() => {
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch((e: any) => console.log('Autoplay prevented:', e));
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      if (authState.uid) {
        router.replace('/(tabs)/situation-room');
      } else {
        router.replace('/login');
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [loading, authState.uid]); // Removed player from dependencies to prevent timer resets

  return (
    <View style={styles.container} className="bg-white">
      {Platform.OS === 'web' ? (
        <video
          ref={videoRef}
          src="/splash_animation.mp4"
          muted
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={false}
          contentFit="cover"
        />
      )}
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
