import React, { useEffect, useState } from "react";
import ExpandableSidebarItem from "../ExpandableSidebarItem";
import Loading from "../Loading";
import { useFilterData } from "../../Context/FilterDataContext";
import type { FilterData } from "../../Context/FilterDataContext";

const SectorFilter: React.FC = () => {
  const { addFilter, removeFilter, selectedSectors, setSelectedSectors, fetchInit, filterDataDict } = useFilterData();
  const init = fetchInit("sector") // string[] | null
  if(init != null && Array.isArray(init))
  {
    setSelectedSectors(init)
  }
  const [sectors, setSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Check for existing sector filters on mount
  useEffect(() => {
    if (!initialized && Object.keys(filterDataDict).length > 0) {
      const existingSectors: string[] = [];
      Object.entries(filterDataDict).forEach(([, filter]) => {
        if (filter.operand === 'sector' && filter.value && typeof filter.value === 'string') {
          existingSectors.push(filter.value);
        }
      });
      if (existingSectors.length > 0 && selectedSectors.length === 0) {
        setSelectedSectors(existingSectors);
      }
      setInitialized(true);
    }
  }, [filterDataDict, initialized, selectedSectors.length, setSelectedSectors]);
    useEffect(() => {
    const fetchSectors = async () => {
        try {
        setLoading(true);
        const response = await fetch("/sectors/");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const sectorNames = Array.isArray(data.sectors)
            ? (typeof data.sectors[0] === "string" ? data.sectors : (data.sectors as { name: string }[]).map((s) => s.name))
            : [];
        console.log(sectorNames)
        setSectors(sectorNames);
        } catch (err: unknown) {
        console.error("Failed to fetch sectors:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to load sectors");
        } finally {
        setLoading(false);
        }
    };

    fetchSectors();
    }, []);


    useEffect(() => {
    sectors.forEach((sector) => {
      const key = `sector.${sector}`;
      if (!selectedSectors.includes(sector)) {
        removeFilter(key);
      }
    });

    selectedSectors.forEach((sector) => {
      const key = `sector.${sector}`;
      const filter: FilterData = {
        operand: "sector",
        operator: "eq",
        filter_type: "categoric",
        value: sector,
        value_high: null,
        value_low: null,
      };
      addFilter(key, filter);
    });
  }, [selectedSectors, sectors, removeFilter, addFilter]);

  const handleCheckboxChange = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };
    if (loading) {
    return (
      <ExpandableSidebarItem title="Sector Filters">
        <Loading loading={true} />
      </ExpandableSidebarItem>
    );
  }

  if (error) {
    return (
      <ExpandableSidebarItem title="Sector Filters">
        <div style={{ color: "red" }}>Error: {error}</div>
      </ExpandableSidebarItem>
    );
  }
  return (
    <ExpandableSidebarItem title="Sector Filters">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {sectors.map((sector) => (
          <label key={sector} style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selectedSectors.includes(sector)}
              onChange={() => handleCheckboxChange(sector)}
              style={{ marginRight: "0.5rem" }}
            />
            {sector}
          </label>
        ))}
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          fontSize: "0.85rem",
          color: "#2b2b2b",
        }}
      >
        Select one or more sectors to include in the filter.
      </div>
    </ExpandableSidebarItem>
  );
};

export default SectorFilter;
