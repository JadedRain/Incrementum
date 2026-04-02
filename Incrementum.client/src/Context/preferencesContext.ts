import { createContext } from "react";

export type PreferencesContextType = {
  showInfoBubbles: boolean;
  setShowInfoBubbles: (value: boolean) => void;
  toggleInfoBubbles: () => void;
  defaultPrivate: boolean;
  setDefaultPrivate: (value: boolean) => void;
};

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
