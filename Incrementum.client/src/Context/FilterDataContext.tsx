import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
// Define the shape of each filterData object
export interface FilterData {
  operand: string;
  operee: string;
  type: "numeric" | "categoric";
  value_high: number | null;
  value_low: number | null;
  value: string| number | null;
}

// Context type: dictionary of filterData, keyed by string
interface FilterDataContextType {
  filterDataDict: Record<string, FilterData>;
  addFilter: (key: string, filter: FilterData) => void;
  removeFilter: (key: string) => void;
}

// Create context
const FilterDataContext = createContext<FilterDataContextType | undefined>(
  undefined
);

// Provider
export const FilterDataProvider = ({ children }: { children: ReactNode }) => {
  const [filterDataDict, setFilterDataDict] = useState<Record<string, FilterData>>({});

  const addFilter = (key: string, filter: FilterData) =>
    setFilterDataDict((prev) => ({ ...prev, [key]: filter }));

  const removeFilter = (key: string) =>
    setFilterDataDict((prev) => {
      const newDict = { ...prev };
      delete newDict[key];
      return newDict;
    });

  return (
    <FilterDataContext.Provider value={{ filterDataDict, addFilter, removeFilter }}>
      {children}
    </FilterDataContext.Provider>
  );
};

// Custom hook
export const useFilterData = (): FilterDataContextType => {
  const context = useContext(FilterDataContext);
  if (!context)
    throw new Error("useFilterData must be used within a FilterDataProvider");
  return context;
};
