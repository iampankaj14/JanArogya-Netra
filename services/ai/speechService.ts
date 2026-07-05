import * as Speech from 'expo-speech';

class SpeechService {
  private voices: Speech.Voice[] = [];
  private isSpeaking = false;

  constructor() {
    this.initVoices();
  }

  async initVoices() {
    try {
      this.voices = await Speech.getAvailableVoicesAsync();
    } catch (e) {
      console.warn("Could not fetch voices", e);
    }
  }

  async speak(text: string, language: string = 'en') {
    this.stopSpeaking();
    this.isSpeaking = true;

    let selectedVoice;
    if (this.voices.length > 0) {
      const langPrefix = language.split('-')[0];
      const langVoices = this.voices.filter(v => v.language.startsWith(langPrefix));
      
      let googleVoice = langVoices.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female'));
      if (!googleVoice) googleVoice = langVoices.find(v => v.name.toLowerCase().includes('google'));

      const femaleKeywords = ['samantha', 'victoria', 'karen', 'moira', 'tessa', 'lekha', 'zira', 'female'];
      let femaleVoice = langVoices.find(v => 
        femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword) || v.identifier.toLowerCase().includes(keyword))
      );

      let enhancedVoice = langVoices.find(v => v.quality && v.quality === Speech.VoiceQuality.Enhanced);
      selectedVoice = googleVoice || femaleVoice || enhancedVoice || langVoices[0];
    }

    // Clean text to avoid robotic markdown pronunciation
    const cleanText = text.replace(/[*#_]/g, '');
    
    // Split text into smaller chunks to prevent Web TTS from breaking or spelling words
    const sentences = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];
    
    for (const sentence of sentences) {
      if (!this.isSpeaking) break;
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      Speech.speak(trimmed, {
        language,
        pitch: 1.0, // Strict 1.0 to prevent engine distortion
        rate: 1.0, // Strict 1.0 to prevent engine distortion
        voice: selectedVoice ? selectedVoice.identifier : undefined,
      });
    }
  }

  stopSpeaking() {
    this.isSpeaking = false;
    Speech.stop();
  }
}

export const speechService = new SpeechService();
export default speechService;
