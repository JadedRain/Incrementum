import React, { useEffect } from "react";
import ExpandableSidebarItem from "../ExpandableSidebarItem";
import { useFilterData } from "../../Context/FilterDataContext";
import type { FilterData } from "../../Context/FilterDataContext";

const SectorFilter: React.FC = () => {
  const { addFilter, removeFilter, selectedSectors, setSelectedSectors } = useFilterData();

  const sectors = [
    "Technology",
    "Healthcare",
    "Financials",
    "Energy",
    "Consumer Discretionary",
    "Industrials",
    "Materials",
    "Real Estate",
    "Utilities",
    "Communication Services",
  ];

  const filterKey = "sector";

    useEffect(() => {
    // First remove any filters for unselected sectors
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
        operee: "eq",
        type: "categoric",
        value: sector,
        value_high: null,
        value_low: null,
      };
      addFilter(key, filter);
    });
  }, [selectedSectors, addFilter, removeFilter]);

  const handleCheckboxChange = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

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
