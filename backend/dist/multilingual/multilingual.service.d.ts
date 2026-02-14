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
    completeness: number;
}
export interface LocalizedContent {
    [key: string]: string | LocalizedContent;
}
export declare class MultilingualService {
    private i18nService?;
    private readonly logger;
    private supportedLanguages;
    private translations;
    constructor(i18nService?: I18nService);
    private initializeTranslations;
    private loadDefaultTranslations;
    translate(key: string, language?: string, options?: {
        namespace?: string;
        defaultValue?: string;
        args?: Record<string, any>;
    }): Promise<string>;
    translateMultiple(keys: TranslationKey[], language?: string): Promise<Record<string, string>>;
    getSupportedLanguages(): LanguageConfig[];
    getDefaultLanguage(): string;
    isLanguageSupported(languageCode: string): boolean;
    getLanguageConfig(languageCode: string): LanguageConfig | undefined;
    detectUserLanguage(userId?: string, acceptLanguage?: string): Promise<string>;
    setUserLanguage(userId: string, languageCode: string): Promise<boolean>;
    getTranslationsForLanguage(languageCode: string): Promise<LocalizedContent | null>;
    addTranslation(languageCode: string, key: string, value: string, namespace?: string): Promise<boolean>;
    getTranslationStats(): Promise<{
        totalLanguages: number;
        totalKeys: number;
        completenessByLanguage: {
            language: string;
            completeness: number;
        }[];
        missingTranslations: {
            language: string;
            missingKeys: string[];
        }[];
    }>;
    private flattenTranslations;
    private updateLanguageCompleteness;
    formatDate(date: Date, languageCode: string, options?: Intl.DateTimeFormatOptions): string;
    formatNumber(number: number, languageCode: string, options?: Intl.NumberFormatOptions): string;
    formatCurrency(amount: number, currency: string, languageCode: string): string;
    private getLocaleFromLanguage;
    isRTLLanguage(languageCode: string): boolean;
    getTextDirection(languageCode: string): 'ltr' | 'rtl';
    bulkAddTranslations(translations: Array<{
        languageCode: string;
        key: string;
        value: string;
        namespace?: string;
    }>): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    exportTranslations(languageCode?: string): Promise<string>;
    importTranslations(translationsJson: string): Promise<{
        success: boolean;
        imported: number;
        errors: string[];
    }>;
    private flattenTranslationsWithValues;
}
