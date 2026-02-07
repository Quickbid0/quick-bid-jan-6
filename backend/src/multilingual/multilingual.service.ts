import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { I18nService } from 'nestjs-i18n';

export interface TranslationKey {
  key: string;
  namespace?: string;
  defaultValue?: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  isRTL: boolean;
  completeness: number; // percentage
}

export interface LocalizedContent {
  [key: string]: string | LocalizedContent;
}

@Injectable()
export class MultilingualService {
  private readonly logger = new Logger(MultilingualService.name);

  private supportedLanguages: LanguageConfig[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      isDefault: true,
      isRTL: false,
      completeness: 100,
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      isDefault: false,
      isRTL: false,
      completeness: 85,
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      isDefault: false,
      isRTL: false,
      completeness: 75,
    },
    {
      code: 'ta',
      name: 'Tamil',
      nativeName: 'தமிழ்',
      isDefault: false,
      isRTL: false,
      completeness: 70,
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      isDefault: false,
      isRTL: false,
      completeness: 65,
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      isDefault: false,
      isRTL: false,
      completeness: 60,
    },
    {
      code: 'gu',
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      isDefault: false,
      isRTL: false,
      completeness: 55,
    },
    {
      code: 'kn',
      name: 'Kannada',
      nativeName: 'ಕನ್ನಡ',
      isDefault: false,
      isRTL: false,
      completeness: 50,
    },
    {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      isDefault: false,
      isRTL: false,
      completeness: 45,
    },
    {
      code: 'pa',
      name: 'Punjabi',
      nativeName: 'ਪੰਜਾਬੀ',
      isDefault: false,
      isRTL: false,
      completeness: 40,
    },
  ];

  // Translation storage (in production, this would be in a database or external service)
  private translations: Map<string, LocalizedContent> = new Map();

  constructor(private i18nService?: I18nService) {
    this.initializeTranslations();
  }

  private initializeTranslations(): void {
    // Load translations from files or database
    // For now, we'll initialize with some sample translations
    this.loadDefaultTranslations();
    this.logger.log('Multilingual service initialized with translations');
  }

  private loadDefaultTranslations(): void {
    // English (default)
    this.translations.set('en', {
      common: {
        welcome: 'Welcome',
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        search: 'Search',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
      },
      auction: {
        title: 'Auctions',
        live: 'Live Auctions',
        timed: 'Timed Auctions',
        flash: 'Flash Auctions',
        tender: 'Tender Auctions',
        bid: 'Place Bid',
        currentPrice: 'Current Price',
        startingPrice: 'Starting Price',
        endTime: 'End Time',
        timeLeft: 'Time Left',
        winner: 'Winner',
        bids: 'Bids',
        status: 'Status',
      },
      user: {
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
        dashboard: 'Dashboard',
        wallet: 'Wallet',
        balance: 'Balance',
      },
      errors: {
        notFound: 'Not found',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        validationError: 'Validation error',
        serverError: 'Server error',
        networkError: 'Network error',
      },
    });

    // Hindi
    this.translations.set('hi', {
      common: {
        welcome: 'स्वागत है',
        login: 'लॉग इन',
        logout: 'लॉग आउट',
        register: 'पंजीकरण',
        search: 'खोजें',
        save: 'सेव करें',
        cancel: 'रद्द करें',
        delete: 'मिटाएं',
        edit: 'संपादित करें',
        view: 'देखें',
        back: 'वापस',
        next: 'अगला',
        previous: 'पिछला',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलता',
      },
      auction: {
        title: 'नीलामी',
        live: 'लाइव नीलामी',
        timed: 'समयबद्ध नीलामी',
        flash: 'फ्लैश नीलामी',
        tender: 'टेंडर नीलामी',
        bid: 'बोली लगाएं',
        currentPrice: 'वर्तमान मूल्य',
        startingPrice: 'आरंभिक मूल्य',
        endTime: 'समाप्ति समय',
        timeLeft: 'शेष समय',
        winner: 'विजेता',
        bids: 'बोलियां',
        status: 'स्थिति',
      },
      user: {
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        notifications: 'सूचनाएं',
        dashboard: 'डैशबोर्ड',
        wallet: 'वॉलेट',
        balance: 'बैलेंस',
      },
      errors: {
        notFound: 'नहीं मिला',
        unauthorized: 'अनधिकृत',
        forbidden: 'निषिद्ध',
        validationError: 'मान्यकरण त्रुटि',
        serverError: 'सर्वर त्रुटि',
        networkError: 'नेटवर्क त्रुटि',
      },
    });

    // Telugu
    this.translations.set('te', {
      common: {
        welcome: 'స్వాగతం',
        login: 'లాగిన్',
        logout: 'లాగౌట్',
        register: 'నమోదు',
        search: 'వెతకండి',
        save: 'సేవ్ చేయండి',
        cancel: 'రద్దు చేయండి',
        delete: 'తొలగించండి',
        edit: 'సవరించు',
        view: 'వీక్షించు',
        back: 'వెనుకకు',
        next: 'తరువాత',
        previous: 'మునుపటి',
        loading: 'లోడ్ అవుతోంది...',
        error: 'లోపం',
        success: 'విజయం',
      },
      auction: {
        title: 'వేలం',
        live: 'ప్రత్యక్ష వేలం',
        timed: 'సమయ నిర్ణీత వేలం',
        flash: 'ఫ్లాష్ వేలం',
        tender: 'టెండర్ వేలం',
        bid: 'బోలు వేయండి',
        currentPrice: 'ప్రస్తుత ధర',
        startingPrice: 'ప్రారంభ ధర',
        endTime: 'ముగింపు సమయం',
        timeLeft: 'మిగిలిన సమయం',
        winner: 'విజేత',
        bids: 'బోలు',
        status: 'స్థితి',
      },
      user: {
        profile: 'ప్రొఫైల్',
        settings: 'సెట్టింగులు',
        notifications: 'నోటిఫికేషన్లు',
        dashboard: 'డ్యాష్బోర్డ్',
        wallet: 'వాలెట్',
        balance: 'బ్యాలెన్స్',
      },
      errors: {
        notFound: 'కనుగొనబడలేదు',
        unauthorized: 'అధికారం లేదు',
        forbidden: 'నిషేధించబడింది',
        validationError: 'విధిముఖ్యత తప్పు',
        serverError: 'సర్వర్ తప్పు',
        networkError: 'నెట్వర్క్ తప్పు',
      },
    });
  }

  async translate(
    key: string,
    language?: string,
    options?: {
      namespace?: string;
      defaultValue?: string;
      args?: Record<string, any>;
    }
  ): Promise<string> {
    const targetLanguage = language || this.getDefaultLanguage();
    const { namespace = 'common', defaultValue, args } = options || {};

    try {
      // Try to get translation using i18n service if available
      if (this.i18nService) {
        return await this.i18nService.translate(key, {
          lang: targetLanguage,
          args,
        });
      }

      // Fallback to our custom translation system
      const translations = this.translations.get(targetLanguage);
      if (!translations) {
        return defaultValue || key;
      }

      // Navigate through nested object structure
      const keys = namespace === 'common' ? [key] : [namespace, key];
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return defaultValue || key;
        }
      }

      // Replace arguments if provided
      if (typeof value === 'string' && args) {
        Object.entries(args).forEach(([argKey, argValue]) => {
          value = value.replace(new RegExp(`{{${argKey}}}`, 'g'), String(argValue));
        });
      }

      return typeof value === 'string' ? value : defaultValue || key;
    } catch (error) {
      this.logger.error(`Translation error for key "${key}" in language "${targetLanguage}":`, error);
      return defaultValue || key;
    }
  }

  async translateMultiple(
    keys: TranslationKey[],
    language?: string
  ): Promise<Record<string, string>> {
    const translations: Record<string, string> = {};

    for (const keyData of keys) {
      const { key, namespace, defaultValue } = keyData;
      translations[key] = await this.translate(key, language, { namespace, defaultValue });
    }

    return translations;
  }

  getSupportedLanguages(): LanguageConfig[] {
    return [...this.supportedLanguages];
  }

  getDefaultLanguage(): string {
    return this.supportedLanguages.find(lang => lang.isDefault)?.code || 'en';
  }

  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === languageCode);
  }

  getLanguageConfig(languageCode: string): LanguageConfig | undefined {
    return this.supportedLanguages.find(lang => lang.code === languageCode);
  }

  async detectUserLanguage(userId?: string, acceptLanguage?: string): Promise<string> {
    // Check user's preferred language from database
    if (userId) {
      try {
        // In real implementation, fetch from user preferences
        // const user = await this.prismaService.user.findUnique({
        //   where: { id: userId },
        //   select: { preferredLanguage: true }
        // });
        // if (user?.preferredLanguage && this.isLanguageSupported(user.preferredLanguage)) {
        //   return user.preferredLanguage;
        // }
      } catch (error) {
        this.logger.warn(`Failed to fetch user language preference for ${userId}:`, error);
      }
    }

    // Check Accept-Language header
    if (acceptLanguage) {
      const preferredLanguages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
      for (const lang of preferredLanguages) {
        const languageCode = lang.split('-')[0]; // Extract language code (e.g., 'en' from 'en-US')
        if (this.isLanguageSupported(languageCode)) {
          return languageCode;
        }
      }
    }

    // Fallback to default language
    return this.getDefaultLanguage();
  }

  async setUserLanguage(userId: string, languageCode: string): Promise<boolean> {
    if (!this.isLanguageSupported(languageCode)) {
      return false;
    }

    try {
      // In real implementation, update user preferences in database
      // await this.prismaService.user.update({
      //   where: { id: userId },
      //   data: { preferredLanguage: languageCode }
      // });

      this.logger.log(`Updated language preference for user ${userId} to ${languageCode}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update language preference for user ${userId}:`, error);
      return false;
    }
  }

  async getTranslationsForLanguage(languageCode: string): Promise<LocalizedContent | null> {
    return this.translations.get(languageCode) || null;
  }

  async addTranslation(
    languageCode: string,
    key: string,
    value: string,
    namespace: string = 'common'
  ): Promise<boolean> {
    try {
      if (!this.isLanguageSupported(languageCode)) {
        return false;
      }

      let translations = this.translations.get(languageCode);
      if (!translations) {
        translations = {};
        this.translations.set(languageCode, translations);
      }

      // Navigate to the correct namespace
      let target = translations;
      const namespaceKeys = namespace === 'common' ? [] : namespace.split('.');

      for (const nsKey of namespaceKeys) {
        if (!target[nsKey] || typeof target[nsKey] !== 'object') {
          target[nsKey] = {};
        }
        target = target[nsKey] as LocalizedContent;
      }

      target[key] = value;

      // Update completeness percentage
      this.updateLanguageCompleteness(languageCode);

      this.logger.log(`Added translation for ${languageCode}.${namespace}.${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to add translation:`, error);
      return false;
    }
  }

  async getTranslationStats(): Promise<{
    totalLanguages: number;
    totalKeys: number;
    completenessByLanguage: { language: string; completeness: number }[];
    missingTranslations: { language: string; missingKeys: string[] }[];
  }> {
    const totalLanguages = this.supportedLanguages.length;
    const englishTranslations = this.translations.get('en');

    if (!englishTranslations) {
      return {
        totalLanguages: 0,
        totalKeys: 0,
        completenessByLanguage: [],
        missingTranslations: [],
      };
    }

    // Flatten English translations to get all keys
    const allKeys = this.flattenTranslations(englishTranslations);
    const totalKeys = allKeys.length;

    const completenessByLanguage = this.supportedLanguages.map(lang => ({
      language: lang.code,
      completeness: lang.completeness,
    }));

    const missingTranslations = this.supportedLanguages
      .filter(lang => lang.code !== 'en')
      .map(lang => {
        const translations = this.translations.get(lang.code);
        if (!translations) return { language: lang.code, missingKeys: allKeys };

        const flattened = this.flattenTranslations(translations);
        const missingKeys = allKeys.filter(key => !flattened.includes(key));

        return { language: lang.code, missingKeys };
      });

    return {
      totalLanguages,
      totalKeys,
      completenessByLanguage,
      missingTranslations,
    };
  }

  private flattenTranslations(obj: LocalizedContent, prefix: string = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        keys.push(fullKey);
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...this.flattenTranslations(value, fullKey));
      }
    }

    return keys;
  }

  private updateLanguageCompleteness(languageCode: string): void {
    const englishTranslations = this.translations.get('en');
    if (!englishTranslations) return;

    const allKeys = this.flattenTranslations(englishTranslations);
    const languageTranslations = this.translations.get(languageCode);

    if (!languageTranslations) return;

    const translatedKeys = this.flattenTranslations(languageTranslations);
    const completeness = (translatedKeys.length / allKeys.length) * 100;

    const langConfig = this.supportedLanguages.find(lang => lang.code === languageCode);
    if (langConfig) {
      langConfig.completeness = Math.round(completeness);
    }
  }

  // Date and number formatting based on locale
  formatDate(date: Date, languageCode: string, options?: Intl.DateTimeFormatOptions): string {
    try {
      const locale = this.getLocaleFromLanguage(languageCode);
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  formatNumber(number: number, languageCode: string, options?: Intl.NumberFormatOptions): string {
    try {
      const locale = this.getLocaleFromLanguage(languageCode);
      return new Intl.NumberFormat(locale, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  formatCurrency(amount: number, currency: string = 'INR', languageCode: string): string {
    try {
      const locale = this.getLocaleFromLanguage(languageCode);
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  }

  private getLocaleFromLanguage(languageCode: string): string {
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
    };

    return localeMap[languageCode] || languageCode;
  }

  // RTL (Right-to-Left) language support
  isRTLLanguage(languageCode: string): boolean {
    const langConfig = this.getLanguageConfig(languageCode);
    return langConfig?.isRTL || false;
  }

  getTextDirection(languageCode: string): 'ltr' | 'rtl' {
    return this.isRTLLanguage(languageCode) ? 'rtl' : 'ltr';
  }

  // Bulk operations for translation management
  async bulkAddTranslations(
    translations: Array<{
      languageCode: string;
      key: string;
      value: string;
      namespace?: string;
    }>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const translation of translations) {
      try {
        const result = await this.addTranslation(
          translation.languageCode,
          translation.key,
          translation.value,
          translation.namespace
        );

        if (result) {
          success++;
        } else {
          failed++;
          errors.push(`Failed to add ${translation.languageCode}.${translation.key}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error adding ${translation.languageCode}.${translation.key}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async exportTranslations(languageCode?: string): Promise<string> {
    const translationsToExport = languageCode
      ? { [languageCode]: this.translations.get(languageCode) || {} }
      : Object.fromEntries(this.translations);

    return JSON.stringify(translationsToExport, null, 2);
  }

  async importTranslations(translationsJson: string): Promise<{ success: boolean; imported: number; errors: string[] }> {
    try {
      const translations = JSON.parse(translationsJson);
      const imported: Array<{ languageCode: string; key: string; value: string; namespace?: string }> = [];

      // Flatten the translations object
      for (const [languageCode, langTranslations] of Object.entries(translations)) {
        const flattened = this.flattenTranslationsWithValues(langTranslations as LocalizedContent);

        for (const [key, value] of Object.entries(flattened)) {
          const [namespace, ...keyParts] = key.split('.');
          imported.push({
            languageCode,
            key: keyParts.join('.') || namespace,
            value,
            namespace: keyParts.length > 0 ? namespace : 'common',
          });
        }
      }

      const result = await this.bulkAddTranslations(imported);

      return {
        success: result.failed === 0,
        imported: result.success,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse translations JSON: ${error.message}`],
      };
    }
  }

  private flattenTranslationsWithValues(obj: LocalizedContent, prefix: string = ''): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        result[fullKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(result, this.flattenTranslationsWithValues(value, fullKey));
      }
    }

    return result;
  }
}
