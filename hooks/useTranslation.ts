import { useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_STORAGE_KEY } from '@/services/i18n';

type Language = 'en' | 'hi';

export function useTranslation() {
  const { t: i18nT, i18n: i18nInstance } = useI18nextTranslation();

  const language = (i18nInstance.language as Language) || 'en';

  const setLanguage = useCallback((lang: Language) => {
    i18nInstance.changeLanguage(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [i18nInstance]);

  const t = useCallback((key: string, variables?: Record<string, string | number>) => {
    return i18nT(key, variables);
  }, [i18nT]);

  return { t, language, setLanguage };
}
