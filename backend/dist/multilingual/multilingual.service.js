"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MultilingualService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultilingualService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_i18n_1 = require("nestjs-i18n");
let MultilingualService = MultilingualService_1 = class MultilingualService {
    constructor(i18nService) {
        this.i18nService = i18nService;
        this.logger = new common_1.Logger(MultilingualService_1.name);
        this.supportedLanguages = [
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
        this.translations = new Map();
        this.initializeTranslations();
    }
    initializeTranslations() {
        this.loadDefaultTranslations();
        this.logger.log('Multilingual service initialized with translations');
    }
    loadDefaultTranslations() {
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
    async translate(key, language, options) {
        const targetLanguage = language || this.getDefaultLanguage();
        const { namespace = 'common', defaultValue, args } = options || {};
        try {
            if (this.i18nService) {
                return await this.i18nService.translate(key, {
                    lang: targetLanguage,
                    args,
                });
            }
            const translations = this.translations.get(targetLanguage);
            if (!translations) {
                return defaultValue || key;
            }
            const keys = namespace === 'common' ? [key] : [namespace, key];
            let value = translations;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                }
                else {
                    return defaultValue || key;
                }
            }
            if (typeof value === 'string' && args) {
                Object.entries(args).forEach(([argKey, argValue]) => {
                    value = value.replace(new RegExp(`{{${argKey}}}`, 'g'), String(argValue));
                });
            }
            return typeof value === 'string' ? value : defaultValue || key;
        }
        catch (error) {
            this.logger.error(`Translation error for key "${key}" in language "${targetLanguage}":`, error);
            return defaultValue || key;
        }
    }
    async translateMultiple(keys, language) {
        const translations = {};
        for (const keyData of keys) {
            const { key, namespace, defaultValue } = keyData;
            translations[key] = await this.translate(key, language, { namespace, defaultValue });
        }
        return translations;
    }
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }
    getDefaultLanguage() {
        return this.supportedLanguages.find(lang => lang.isDefault)?.code || 'en';
    }
    isLanguageSupported(languageCode) {
        return this.supportedLanguages.some(lang => lang.code === languageCode);
    }
    getLanguageConfig(languageCode) {
        return this.supportedLanguages.find(lang => lang.code === languageCode);
    }
    async detectUserLanguage(userId, acceptLanguage) {
        if (userId) {
            try {
            }
            catch (error) {
                this.logger.warn(`Failed to fetch user language preference for ${userId}:`, error);
            }
        }
        if (acceptLanguage) {
            const preferredLanguages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
            for (const lang of preferredLanguages) {
                const languageCode = lang.split('-')[0];
                if (this.isLanguageSupported(languageCode)) {
                    return languageCode;
                }
            }
        }
        return this.getDefaultLanguage();
    }
    async setUserLanguage(userId, languageCode) {
        if (!this.isLanguageSupported(languageCode)) {
            return false;
        }
        try {
            this.logger.log(`Updated language preference for user ${userId} to ${languageCode}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to update language preference for user ${userId}:`, error);
            return false;
        }
    }
    async getTranslationsForLanguage(languageCode) {
        return this.translations.get(languageCode) || null;
    }
    async addTranslation(languageCode, key, value, namespace = 'common') {
        try {
            if (!this.isLanguageSupported(languageCode)) {
                return false;
            }
            let translations = this.translations.get(languageCode);
            if (!translations) {
                translations = {};
                this.translations.set(languageCode, translations);
            }
            let target = translations;
            const namespaceKeys = namespace === 'common' ? [] : namespace.split('.');
            for (const nsKey of namespaceKeys) {
                if (!target[nsKey] || typeof target[nsKey] !== 'object') {
                    target[nsKey] = {};
                }
                target = target[nsKey];
            }
            target[key] = value;
            this.updateLanguageCompleteness(languageCode);
            this.logger.log(`Added translation for ${languageCode}.${namespace}.${key}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to add translation:`, error);
            return false;
        }
    }
    async getTranslationStats() {
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
            if (!translations)
                return { language: lang.code, missingKeys: allKeys };
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
    flattenTranslations(obj, prefix = '') {
        const keys = [];
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'string') {
                keys.push(fullKey);
            }
            else if (typeof value === 'object' && value !== null) {
                keys.push(...this.flattenTranslations(value, fullKey));
            }
        }
        return keys;
    }
    updateLanguageCompleteness(languageCode) {
        const englishTranslations = this.translations.get('en');
        if (!englishTranslations)
            return;
        const allKeys = this.flattenTranslations(englishTranslations);
        const languageTranslations = this.translations.get(languageCode);
        if (!languageTranslations)
            return;
        const translatedKeys = this.flattenTranslations(languageTranslations);
        const completeness = (translatedKeys.length / allKeys.length) * 100;
        const langConfig = this.supportedLanguages.find(lang => lang.code === languageCode);
        if (langConfig) {
            langConfig.completeness = Math.round(completeness);
        }
    }
    formatDate(date, languageCode, options) {
        try {
            const locale = this.getLocaleFromLanguage(languageCode);
            return new Intl.DateTimeFormat(locale, options).format(date);
        }
        catch (error) {
            return date.toLocaleDateString();
        }
    }
    formatNumber(number, languageCode, options) {
        try {
            const locale = this.getLocaleFromLanguage(languageCode);
            return new Intl.NumberFormat(locale, options).format(number);
        }
        catch (error) {
            return number.toString();
        }
    }
    formatCurrency(amount, currency = 'INR', languageCode) {
        try {
            const locale = this.getLocaleFromLanguage(languageCode);
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
            }).format(amount);
        }
        catch (error) {
            return `${currency} ${amount}`;
        }
    }
    getLocaleFromLanguage(languageCode) {
        const localeMap = {
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
    isRTLLanguage(languageCode) {
        const langConfig = this.getLanguageConfig(languageCode);
        return langConfig?.isRTL || false;
    }
    getTextDirection(languageCode) {
        return this.isRTLLanguage(languageCode) ? 'rtl' : 'ltr';
    }
    async bulkAddTranslations(translations) {
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const translation of translations) {
            try {
                const result = await this.addTranslation(translation.languageCode, translation.key, translation.value, translation.namespace);
                if (result) {
                    success++;
                }
                else {
                    failed++;
                    errors.push(`Failed to add ${translation.languageCode}.${translation.key}`);
                }
            }
            catch (error) {
                failed++;
                errors.push(`Error adding ${translation.languageCode}.${translation.key}: ${error.message}`);
            }
        }
        return { success, failed, errors };
    }
    async exportTranslations(languageCode) {
        const translationsToExport = languageCode
            ? { [languageCode]: this.translations.get(languageCode) || {} }
            : Object.fromEntries(this.translations);
        return JSON.stringify(translationsToExport, null, 2);
    }
    async importTranslations(translationsJson) {
        try {
            const translations = JSON.parse(translationsJson);
            const imported = [];
            for (const [languageCode, langTranslations] of Object.entries(translations)) {
                const flattened = this.flattenTranslationsWithValues(langTranslations);
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
        }
        catch (error) {
            return {
                success: false,
                imported: 0,
                errors: [`Failed to parse translations JSON: ${error.message}`],
            };
        }
    }
    flattenTranslationsWithValues(obj, prefix = '') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'string') {
                result[fullKey] = value;
            }
            else if (typeof value === 'object' && value !== null) {
                Object.assign(result, this.flattenTranslationsWithValues(value, fullKey));
            }
        }
        return result;
    }
};
exports.MultilingualService = MultilingualService;
exports.MultilingualService = MultilingualService = MultilingualService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_i18n_1.I18nService])
], MultilingualService);
//# sourceMappingURL=multilingual.service.js.map