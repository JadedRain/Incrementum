import React, { useState } from "react";
import LastCloseFilter from "../Components/FilterComponents/52whighlow";
import MarketCapFilter from "../Components/FilterComponents/MarketCapFilter";
import PercentChangeFilter from "../Components/FilterComponents/PercentChangeFilter";
import SharePriceFilter from "../Components/FilterComponents/SharePriceFilter";
import VolumeFilter from "../Components/FilterComponents/VolumeFilter";
import WeekRangeFilter from "../Components/FilterComponents/WeekRangeFilter";
import { FilterDataProvider } from "../Context/FilterDataContext";
import SectorFilter from "../Components/FilterComponents/Sectors";
import FilterList from "../Components/FilterList";

const FilterPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("marketcap");

  const renderSelectedFilter = (key: string) => {
    switch (key) {
      case 'marketcap':
        return <MarketCapFilter />;
      case 'percentchange':
        return <PercentChangeFilter />;
      case 'shareprice':
        return <SharePriceFilter />;
      case 'volume':
        return <VolumeFilter />;
      case 'weekrange':
        return <WeekRangeFilter />;
      case 'lastclose':
        return <LastCloseFilter />;
      default:
        return null;
    }
  };
  return (
    <FilterDataProvider>
      <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Filter Page</h1>

        {/* LastClose Component */}
        <LastCloseFilter />
        {/* Filter Components (interactive) - select one to render */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="filter-select" style={{ marginRight: '0.5rem', fontWeight: 600 }}>Choose filter:</label>
          <select id="filter-select" onChange={(e) => setSelectedFilter(e.target.value)} value={selectedFilter}>
            <option value="marketcap">Market Cap</option>
            <option value="percentchange">% Change</option>
            <option value="shareprice">Share Price</option>
            <option value="volume">Volume</option>
            <option value="weekrange">52-Week Range</option>
            <option value="lastclose">52W High/Low (Last Close)</option>
          </select>
        </div>

        <div style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6 }}>
          {renderSelectedFilter(selectedFilter)}
        </div>
        {/* Sectors Component */}
        <SectorFilter />
        {/* Filter List */}
        <FilterList />
      </div>
    </FilterDataProvider>
  );
};

export default FilterPage;
