import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'minimal' | 'full';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown'
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      // Optional: Show success message
      console.log(`Language changed to ${languageCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => handleLanguageChange(currentLanguage.code === 'en' ? 'hi' : 'en')}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
        aria-label={t('common.language') || 'Change language'}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isChanging}
          className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={t('common.selectLanguage') || 'Select language'}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="font-medium">{currentLanguage.nativeName}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
              role="listbox"
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isChanging}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    language.code === i18n.language ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  role="option"
                  aria-selected={language.code === i18n.language}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.nativeName}</span>
                    <span className="text-gray-500">({language.name})</span>
                  </div>
                  {language.code === i18n.language && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('common.selectLanguage') || 'Select language'}
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 z-50 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg"
            role="listbox"
          >
            {languages.map((language, index) => (
              <motion.button
                key={language.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleLanguageChange(language.code)}
                disabled={isChanging}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  language.code === i18n.language ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                role="option"
                aria-selected={language.code === i18n.language}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                </div>
                {language.code === i18n.language && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;
