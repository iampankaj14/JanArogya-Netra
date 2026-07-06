import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '@/constants/translations';

// For this hackathon demo, we pull the hardcoded dictionaries, but setting this up
// via i18next allows for dynamic language loading, JSON loading, and easy scalability.

export const LANGUAGE_STORAGE_KEY = 'netraLanguage';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      hi: { translation: translations.hi },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
  });

// Restore the user's last selected language once persisted storage is available.
// On web this must be skipped during Node-based SSR/static export, where there is
// no window/localStorage; on native, window is irrelevant so we always run it.
if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
    if (saved === 'en' || saved === 'hi') {
      i18n.changeLanguage(saved);
    }
  });
}

export default i18n;
