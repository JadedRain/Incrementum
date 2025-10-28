import React from "react";
import LastCloseFilter from "../Components/FilterComponents/52whighlow";
import MarketCapFilter from "../Components/FilterComponents/MarketCapFilter";
import PercentChangeFilter from "../Components/FilterComponents/PercentChangeFilter";
import SharePriceFilter from "../Components/FilterComponents/SharePriceFilter";
import VolumeFilter from "../Components/FilterComponents/VolumeFilter";
import WeekRangeFilter from "../Components/FilterComponents/WeekRangeFilter";
import { FilterDataProvider, useFilterData } from "../Context/FilterDataContext";

// A small sub-component to display the list
const FilterList: React.FC = () => {
  const { filterDataDict } = useFilterData();

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Current Filters</h2>
      {Object.keys(filterDataDict).length === 0 ? (
        <p>No filters added.</p>
      ) : (
        <ul>
          {Object.entries(filterDataDict).map(([key, f]) => (
            <li key={key} style={{ marginBottom: "0.5rem" }}>
              <strong>{key}</strong>: {f.operand} {f.operee} ({f.type}) [High:{" "}
              {f.value_high ?? "-"}, Low: {f.value_low ?? "-"}, Value:{" "}
              {f.value ?? "-"}]
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FilterPage: React.FC = () => {
  return (
    <FilterDataProvider>
      <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Filter Page</h1>
        
        {/* Filter Components (interactive) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <MarketCapFilter />
          <PercentChangeFilter />
          <SharePriceFilter />
          <VolumeFilter />
          <WeekRangeFilter />
          <LastCloseFilter />
        </div>

        {/* Filter List */}
        <FilterList />
      </div>
    </FilterDataProvider>
  );
};

export default FilterPage;
