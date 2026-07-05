import { useCallback, useState } from 'react';

// TEMP STUB — expo-speech-recognition is a native module and crashes in Expo Go.
// Re-enable the real implementation below once running inside a dev build
// (npx expo prebuild --clean && npx expo run:android / EAS dev build).
export function useVoiceInput(language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [transcript] = useState('');

  const start = useCallback(async (_lang: string = language) => {
    console.warn('Voice input is disabled in Expo Go. Build a dev client to enable it.');
    return false;
  }, [language]);

  const stop = useCallback(() => {
    setIsListening(false);
  }, []);

  return { isListening, transcript, start, stop };
}

/* --- REAL IMPLEMENTATION (uncomment for dev/production build) ---

import { useCallback, useEffect, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

// Wraps the OS-native speech recognizer (the same engine backing the
// microphone key on the Google/Gboard keyboard) so voice input behaves
// exactly like typing: partial + final results stream back as plain text,
// no audio file is ever recorded or read.
export function useVoiceInput(language: string = 'en-US') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript;
    if (text) setTranscript(text);
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.warn('Speech recognition error', event.error, event.message);
    setIsListening(false);
  });

  const start = useCallback(async (lang: string = language) => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      console.warn('Speech recognition permission denied.');
      return false;
    }
    setTranscript('');
    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
    });
    return true;
  }, [language]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  useEffect(() => stop, [stop]);

  return { isListening, transcript, start, stop };
}

--- END REAL IMPLEMENTATION --- */
