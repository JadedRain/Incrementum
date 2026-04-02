import { createContext } from "react";

export type PreferencesContextType = {
  showInfoBubbles: boolean;
  setShowInfoBubbles: (value: boolean) => void;
  toggleInfoBubbles: () => void;
};

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);
