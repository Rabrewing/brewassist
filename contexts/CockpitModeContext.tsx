"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { CockpitMode } from "@/lib/brewTypes";

interface CockpitModeContextType {
  mode: CockpitMode;
  updateMode: (nextMode: CockpitMode) => void;
}

const CockpitModeContext = createContext<CockpitModeContextType | undefined>(undefined);

export function CockpitModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CockpitMode>("admin"); // Default to "admin"

  useEffect(() => {
    // This effect runs only on the client side after hydration
    const storedMode = localStorage.getItem("cockpitMode") as CockpitMode;
    if (storedMode) {
      setMode(storedMode);
    }
  }, []);

  const updateMode = (nextMode: CockpitMode) => {
    setMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("cockpitMode", nextMode);
    }
  };

  return (
    <CockpitModeContext.Provider value={{ mode, updateMode }}>
      {children}
    </CockpitModeContext.Provider>
  );
}

export const useCockpitMode = () => {
  const context = useContext(CockpitModeContext);
  if (context === undefined) {
    throw new Error("useCockpitMode must be used within a CockpitModeProvider");
  }
  return context;
};
