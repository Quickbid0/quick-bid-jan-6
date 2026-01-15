import React, { useEffect, useState } from 'react';

interface LegalAcceptanceProps {
  storageKey?: string;
  onAcceptedChange?: (accepted: boolean) => void;
}

// Simple acceptance component that enforces a checkbox and persists to localStorage.
// Integrate this before login, listing creation, or bidding flows by checking the
// `accepted` state or reading the same storageKey in those modules.
const LegalAcceptance: React.FC<LegalAcceptanceProps> = ({ storageKey = 'quickmela_legal_accepted', onAcceptedChange }) => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      if (saved === 'true') {
        setAccepted(true);
        if (onAcceptedChange) {
          onAcceptedChange(true);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey, onAcceptedChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    setAccepted(next);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, next ? 'true' : 'false');
      }
    } catch {
      // ignore storage errors
    }
    if (onAcceptedChange) {
      onAcceptedChange(next);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
      <label className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={accepted}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span>
          I Accept All QuickMela Terms &amp; Policies
        </span>
      </label>
      {!accepted && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          You must accept all QuickMela terms and policies before continuing.
        </p>
      )}
    </div>
  );
};

export default LegalAcceptance;
