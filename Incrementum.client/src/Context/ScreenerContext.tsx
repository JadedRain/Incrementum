import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import type { ReactNode } from "react";

type ChangePeriod = "daily" | "weekly" | "monthly";

interface ScreenerContextType {
  selectedSectors: string[];
  onSelectedSectorsChange: Dispatch<SetStateAction<string[]>>;
  selectedIndustries: string[];
  onSelectedIndustriesChange: Dispatch<SetStateAction<string[]>>;
  percentThreshold: string;
  onPercentThresholdChange: Dispatch<SetStateAction<string>>;
  changePeriod: ChangePeriod;
  onChangePeriod: Dispatch<SetStateAction<ChangePeriod>>;
  percentChangeFilter: string;
  onPercentChangeFilter: Dispatch<SetStateAction<string>>;
  showCustomScreenerSection: boolean;
  setShowCustomScreenerSection: Dispatch<SetStateAction<boolean>>;
  apiKey: string;
  setApiKey: Dispatch<SetStateAction<string>>;
}

const ScreenerContext = createContext<ScreenerContextType | null>(null);

export const ScreenerProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [percentThreshold, setPercentThreshold] = useState<string>("");
  const [changePeriod, setChangePeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [percentChangeFilter, setPercentChangeFilter] = useState<string>("");
  const [showCustomScreenerSection, setShowCustomScreenerSection] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");

  const value = {
    selectedSectors,
    onSelectedSectorsChange: setSelectedSectors,
    selectedIndustries,
    onSelectedIndustriesChange: setSelectedIndustries,
    percentThreshold,
    onPercentThresholdChange: setPercentThreshold,
    changePeriod,
    onChangePeriod: setChangePeriod,
    percentChangeFilter,
    onPercentChangeFilter: setPercentChangeFilter,
    showCustomScreenerSection,
    setShowCustomScreenerSection,
    apiKey,
    setApiKey,
  };

  return (
    <ScreenerContext.Provider value={value}>
      {children}
    </ScreenerContext.Provider>
  );
};

// Hook for consuming the context
export const useScreener = () => {
  const context = useContext(ScreenerContext);
  if (!context) throw new Error("useScreener must be used within a ScreenerProvider");
  return context;
};
