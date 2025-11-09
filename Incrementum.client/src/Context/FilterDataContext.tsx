import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import {useEffect} from "react";
// Define the shape of each filterData object
export interface MinMaxData {min: null, max: null}
export interface FilterData {
  operand: string;
  operator: string;
  filter_type: "numeric" | "categoric";
  value_high: number | null;
  value_low: number | null;
  value: string| number | null;
}

// Context type: dictionary of filterData, keyed by string
interface FilterDataContextType {
  filterDataDict: Record<string, FilterData>;
  addFilter: (key: string, filter: FilterData) => void;
  removeFilter: (key: string) => void;
  selectedSectors: string[];
  setSelectedSectors: React.Dispatch<React.SetStateAction<string[]>>;
  stocks: any[];               // fetched stock data
  isLoading: boolean;          // loading indicator
  error: string | null; 
  fetchInit: (key: string) => any | null;
  setInitDict:React.Dispatch<React.SetStateAction<Record<string, any | null>>>;

}

// Create context
const FilterDataContext = createContext<FilterDataContextType | undefined>(
  undefined
);

// Provider
export const FilterDataProvider = ({ children }: { children: ReactNode }) => {
  const [initDict, setInitDict] = useState<Record<string, any>>({})
  const fetchInit =  (key: string)=> {
    if(key in initDict)
    {
      const result = initDict[key];
      setInitDict((prev) => {
      const newDict = { ...prev };
      delete newDict[key];
      return newDict;
    });
      return result;
    }
    return null;
  }
  
  const [filterDataDict, setFilterDataDict] = useState<Record<string, FilterData>>({});
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const addFilter = useCallback((key: string, filter: FilterData) => {
    setFilterDataDict((prev) => ({ ...prev, [key]: filter }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilterDataDict((prev) => {
      const newDict = { ...prev };
      delete newDict[key];
      return newDict;
    });
  }, []);
  useEffect(() => {
    const fetchFilteredStocks = async () => {
      // Extract list of filter objects (values only)
      const filtersList = Object.values(filterDataDict);

      // Don't fetch if no filters
      if (filtersList.length === 0) {
        setStocks([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const jsonData = JSON.stringify(filtersList)
        console.log(jsonData)
        const response = await fetch("/stocks/getfilteredstocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonData, // send as list of values
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched stocks:", data.stocks.quotes);
        setStocks(data.stocks.quotes || []);
      } catch (err: any) {
        console.error("Error fetching stocks:", err);
        setError(err.message ?? "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredStocks();
  }, [filterDataDict]);
  return (
    <FilterDataContext.Provider
      value={{
        setInitDict,
        fetchInit,
        filterDataDict,
        addFilter,
        removeFilter,
        selectedSectors,
        setSelectedSectors,
        stocks,
        isLoading,
        error,
      }}
    >
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
