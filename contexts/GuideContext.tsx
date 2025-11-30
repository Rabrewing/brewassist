'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type GuideContextValue = {
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;
};

const GuideContext = createContext<GuideContextValue | undefined>(undefined);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <GuideContext.Provider value={{ isGuideOpen, setIsGuideOpen }}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide(): GuideContextValue {
  const ctx = useContext(GuideContext);
  if (!ctx) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return ctx;
}
