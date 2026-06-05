import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import ja from './locales/ja';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: deviceLanguage === 'ja' ? 'ja' : 'en', // en primary, ja localized
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Dev-only: expose to the web preview harness for locale checks.
if (__DEV__ && typeof window !== 'undefined') {
  (window as unknown as { __i18n?: typeof i18n }).__i18n = i18n;
}

export default i18n;
