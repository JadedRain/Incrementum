import { createContext } from "react";

export type ScreenerType = 'custom' | 'public';
export type DefaultScreener = {
  id: string;
  type: ScreenerType;
  name: string;
} | null;

export type PreferencesContextType = {
  showInfoBubbles: boolean;
  setShowInfoBubbles: (value: boolean) => void;
  toggleInfoBubbles: () => void;
  defaultPrivate: boolean;
  setDefaultPrivate: (value: boolean) => void;
  defaultScreener: DefaultScreener;
  setDefaultScreener: (screener: DefaultScreener) => void;
};

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
