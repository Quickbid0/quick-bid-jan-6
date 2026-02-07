import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandalone || isIOSStandalone);

      // Check for iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);

      // If already installed, don't show prompt
      if (isStandalone || isIOSStandalone) {
        setIsInstalled(true);
        return;
      }

      // Show prompt for mobile devices after a delay
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000); // Show after 30 seconds
      }
    };

    checkInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or fallback
      if (isIOS && !isStandalone) {
        alert('To install QuickMela on iOS:\n1. Tap the share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
      }
      setShowPrompt(false);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed for this session
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed recently
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  const recentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime)) < 24 * 60 * 60 * 1000; // 24 hours

  if (isInstalled || isStandalone || !showPrompt || recentlyDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-auto">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Install QuickMela
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Get the full experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                {isIOS ? (
                  <>
                    <Smartphone className="w-3 h-3 mr-1" />
                    iOS
                  </>
                ) : (
                  <>
                    <Monitor className="w-3 h-3 mr-1" />
                    Android/Chrome
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Fast • Offline • Push notifications
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Install App
            </button>

            {isIOS && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Tap share button → Add to Home Screen
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
