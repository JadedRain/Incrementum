import React, { useEffect, useState, type ReactNode } from "react";
import { PreferencesContext, type PreferencesContextType, type DefaultScreener } from "./preferencesContext";

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const INFO_BUBBLES_STORAGE_KEY = "incrementum-show-info-bubbles";
  const DEFAULT_PRIVATE_STORAGE_KEY = "incrementum-default-private";
  const DEFAULT_SCREENER_STORAGE_KEY = "incrementum-default-screener";

  const [showInfoBubbles, setShowInfoBubblesState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(INFO_BUBBLES_STORAGE_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  const [defaultPrivate, setDefaultPrivateState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_PRIVATE_STORAGE_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  const [defaultScreener, setDefaultScreenerState] = useState<DefaultScreener>(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_SCREENER_STORAGE_KEY);
      if (saved === null || saved === 'null') {
        return null;
      }
      const parsed = JSON.parse(saved) as { id: string | number; type: string; name: string } | null;
      if (!parsed) {
        return null;
      }
      // Normalize ID to string
      return {
        id: String(parsed.id),
        type: parsed.type as 'public' | 'custom',
        name: parsed.name,
      };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(INFO_BUBBLES_STORAGE_KEY, String(showInfoBubbles));
  }, [showInfoBubbles]);

  useEffect(() => {
    localStorage.setItem(DEFAULT_PRIVATE_STORAGE_KEY, String(defaultPrivate));
  }, [defaultPrivate]);

  useEffect(() => {
    localStorage.setItem(
      DEFAULT_SCREENER_STORAGE_KEY,
      defaultScreener === null ? 'null' : JSON.stringify(defaultScreener)
    );
  }, [defaultScreener]);

  // Initialize defaults in localStorage if not already set
  useEffect(() => {
    if (!localStorage.getItem(DEFAULT_PRIVATE_STORAGE_KEY)) {
      localStorage.setItem(DEFAULT_PRIVATE_STORAGE_KEY, "true");
    }
  }, []);

  const setShowInfoBubbles = (value: boolean) => {
    setShowInfoBubblesState(value);
  };

  const toggleInfoBubbles = () => {
    setShowInfoBubblesState((prev) => !prev);
  };

  const setDefaultPrivate = (value: boolean) => {
    setDefaultPrivateState(value);
  };

  const setDefaultScreener = (screener: DefaultScreener) => {
    setDefaultScreenerState(screener);
  };

  const value: PreferencesContextType = {
    showInfoBubbles,
    setShowInfoBubbles,
    toggleInfoBubbles,
    defaultPrivate,
    setDefaultPrivate,
    defaultScreener,
    setDefaultScreener,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
