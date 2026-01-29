import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import {useEffect} from "react";
import { apiString, fetchWrapper } from "./FetchingHelper";
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

interface FilterDataContextType {
  filterDataDict: Record<string, FilterData>;
  addFilter: (key: string, filter: FilterData) => void;
  removeFilter: (key: string) => void;
  selectedSectors: string[];
  setSelectedSectors: React.Dispatch<React.SetStateAction<string[]>>;
  stocks: unknown[];               // fetched stock data
  isLoading: boolean;          // loading indicator
  error: string | null; 
  fetchInit: (key: string) => unknown | null;
  setInitDict: React.Dispatch<React.SetStateAction<Record<string, unknown | null>>>;
  isInit: boolean;
  setIsInit: React.Dispatch<React.SetStateAction<boolean>>;
  initDict: Record<string, unknown | null>;
  setSortValue: React.Dispatch<React.SetStateAction<string | null>>;
  setSortBool: React.Dispatch<React.SetStateAction<string | null>>;

}

const FilterDataContext = createContext<FilterDataContextType | undefined>(
  undefined
);

export const FilterDataProvider = ({ children }: { children: ReactNode }) => {
  const [initDict, setInitDict] = useState<Record<string, unknown | null>>({})
  const fetchInit =  (key: string)=> {
    if(initDict != null && Object.hasOwn(initDict, key))
      {
      const result = initDict[key];
      return result;
    }
    return null;
  }
  const [isInit, setIsInit] = useState(false);
  const [filterDataDict, setFilterDataDict] = useState<Record<string, FilterData>>({});
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [stocks, setStocks] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortValue, setSortValue] = useState<string | null>(null);
  const [sortBool, setSortBool] =  useState<string| null>(null);
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
              const headerlist: Record<string, string> = {
        "Content-Type": "application/json",
      };
        if(sortValue != null && sortBool != null){
          headerlist["sortValue"] = sortValue;
          headerlist["sortBool"] = sortBool;
        }
        //replace
        const response = await fetchWrapper(()=>fetch(apiString("/stocks/getfilteredstocks"), {
          method: "POST",
          headers: headerlist,
          body: jsonData, // send as list of values
        }));

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched stocks:", data.stocks.quotes);
        setStocks(data.stocks.quotes || []);
      } catch (err: unknown) {
        console.error("Error fetching stocks:", err);
        if (err instanceof Error) {
          setError(err.message ?? "Unknown error");
        } else {
          setError(String(err) || "Unknown error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredStocks();
  }, [filterDataDict, sortBool, sortValue]);
  return (
    <FilterDataContext.Provider
      value={{
        setSortBool,
        setSortValue,
        initDict,
        setIsInit,
        isInit,
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
// eslint-disable-next-line react-refresh/only-export-components
export const useFilterData = (): FilterDataContextType => {
  const context = useContext(FilterDataContext);
  if (!context)
    throw new Error("useFilterData must be used within a FilterDataProvider");
  return context;
};