import React, { useEffect, useState, type ReactNode } from "react";
import { PreferencesContext, type PreferencesContextType } from "./preferencesContext";

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const INFO_BUBBLES_STORAGE_KEY = "incrementum-show-info-bubbles";
  const DEFAULT_PRIVATE_STORAGE_KEY = "incrementum-default-private";

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

  useEffect(() => {
    localStorage.setItem(INFO_BUBBLES_STORAGE_KEY, String(showInfoBubbles));
  }, [showInfoBubbles]);

  useEffect(() => {
    localStorage.setItem(DEFAULT_PRIVATE_STORAGE_KEY, String(defaultPrivate));
  }, [defaultPrivate]);

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

  const value: PreferencesContextType = {
    showInfoBubbles,
    setShowInfoBubbles,
    toggleInfoBubbles,
    defaultPrivate,
    setDefaultPrivate,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
