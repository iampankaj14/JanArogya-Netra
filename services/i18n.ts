import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from '@/constants/translations';

// For this hackathon demo, we pull the hardcoded dictionaries, but setting this up
// via i18next allows for dynamic language loading, JSON loading, and easy scalability.

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

export default i18n;
