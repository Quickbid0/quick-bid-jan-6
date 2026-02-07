import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import bn from '../locales/bn.json';

const resources = {
  en: {
    translation: en,
  },
  hi: {
    translation: hi,
  },
  mr: {
    translation: mr,
  },
  ta: {
    translation: ta,
  },
  te: {
    translation: te,
  },
  bn: {
    translation: bn,
  },
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    backend: {
      loadPath: '/locales/{{lng}}.json',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
