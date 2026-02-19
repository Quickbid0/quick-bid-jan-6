import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AISettings {
  autoBidEnabled: boolean;
  maxAmount: number;
  increment: number;
  winProbabilityThreshold: number;
  fraudRiskThreshold: number;
}

interface AIContextType {
  settings: AISettings;
  setSettings: (settings: AISettings) => void;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AISettings>({
    autoBidEnabled: false,
    maxAmount: 1000,
    increment: 100,
    winProbabilityThreshold: 0.45,
    fraudRiskThreshold: 0.6,
  });

  return (
    <AIContext.Provider value={{ settings, setSettings }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};
