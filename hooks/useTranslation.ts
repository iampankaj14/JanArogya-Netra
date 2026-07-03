import { useConfigStore } from '../store/useConfigStore';
import { translations, TranslationKey } from '../constants/translations';

export function useTranslation() {
  const language = useConfigStore((state) => state.language);

  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  return { t, language, setLanguage: useConfigStore((state) => state.setLanguage) };
}
