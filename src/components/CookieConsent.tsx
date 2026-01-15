import React, { useEffect, useState } from 'react';

type Consent = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = 'qm-consent-v1';

const CookieConsent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState<Consent>({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-cookie-preferences', onOpen as EventListener);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setOpen(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Consent & { ts?: number };
      setConsent({ essential: true, analytics: !!parsed.analytics, marketing: !!parsed.marketing });
      setOpen(false);
    } catch {
      setOpen(true);
    }
    return () => {
      window.removeEventListener('open-cookie-preferences', onOpen as EventListener);
    };
  }, []);

  const acceptAll = () => {
    const value = { essential: true, analytics: true, marketing: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...value, ts: Date.now() }));
    setConsent(value);
    setOpen(false);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...consent, ts: Date.now() }));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-5xl m-4 rounded-lg border bg-white dark:bg-gray-800 shadow-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            We use cookies to provide essential site functionality and to improve your experience. Manage your preferences below.
          </div>
          <div className="flex items-center gap-2">
            <button onClick={acceptAll} className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Accept all</button>
            <details className="relative">
              <summary className="px-3 py-2 rounded border text-sm cursor-pointer select-none">Preferences</summary>
              <div className="absolute right-0 mt-2 w-64 rounded border bg-white dark:bg-gray-900 p-3 shadow">
                <label className="flex items-center gap-2 text-sm py-1">
                  <input type="checkbox" checked disabled />
                  Essential
                </label>
                <label className="flex items-center gap-2 text-sm py-1">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent((c) => ({ ...c, analytics: e.target.checked }))}
                  />
                  Analytics
                </label>
                <label className="flex items-center gap-2 text-sm py-1">
                  <input
                    type="checkbox"
                    checked={consent.marketing}
                    onChange={(e) => setConsent((c) => ({ ...c, marketing: e.target.checked }))}
                  />
                  Marketing
                </label>
                <div className="flex justify-end pt-2">
                  <button onClick={save} className="px-3 py-1 rounded bg-gray-900 text-white text-sm dark:bg-gray-700">Save</button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
