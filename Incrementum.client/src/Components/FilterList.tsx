import type React from "react";
import { useFilterData } from "../Context/FilterDataContext";

const FilterList: React.FC = () => {
  const { filterDataDict } = useFilterData();

  return (
    <div className="filter-list">
      <h2>Current Filters</h2>
      {Object.keys(filterDataDict).length === 0 ? (
        <p>No filters added.</p>
      ) : (
        <ul>
          {Object.entries(filterDataDict).map(([key, f]) => (
            <li key={key} className="filter-list-item">
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
export default FilterList;