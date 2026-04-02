import React, { useEffect, useState, type ReactNode } from "react";
import { PreferencesContext, type PreferencesContextType } from "./preferencesContext";

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const INFO_BUBBLES_STORAGE_KEY = "incrementum-show-info-bubbles";

  const [showInfoBubbles, setShowInfoBubblesState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(INFO_BUBBLES_STORAGE_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem(INFO_BUBBLES_STORAGE_KEY, String(showInfoBubbles));
  }, [showInfoBubbles]);

  const setShowInfoBubbles = (value: boolean) => {
    setShowInfoBubblesState(value);
  };

  const toggleInfoBubbles = () => {
    setShowInfoBubblesState((prev) => !prev);
  };

  const value: PreferencesContextType = {
    showInfoBubbles,
    setShowInfoBubbles,
    toggleInfoBubbles,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
