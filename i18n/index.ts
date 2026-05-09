import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/i18n/locales/en.json';
import pl from '@/i18n/locales/pl.json';
import type { AppLanguage } from '@/store/app-settings';

export function resolveAppLanguage(locale: string | undefined): AppLanguage {
  if (!locale) {
    return 'en';
  }

  return locale.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    pl: {
      translation: pl,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
