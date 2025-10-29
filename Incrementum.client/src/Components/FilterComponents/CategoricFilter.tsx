import React, { useEffect, useState } from "react";
import ExpandableSidebarItem from "../ExpandableSidebarItem";
import { useFilterData } from "../../Context/FilterDataContext";
import type { FilterData } from "../../Context/FilterDataContext";


interface  CategoryFilterProps {
    categorys: string[];
    category: string;
    displayName: string | null;
}
const CategoryFilter: React.FC<CategoryFilterProps> = (_props) => {
  const { addFilter, removeFilter} = useFilterData();
  const [selectedCategorys, setSelectedCategorys] = useState<string[]>([])
  const categorys = _props.categorys;
  const categore = _props.category;
  const name = `${categore} Filters`
      useEffect(() => {
      categorys.forEach((category) => {
        const key = `${category}.${category}`;
        if (!selectedCategorys.includes(category)) {
          removeFilter(key);
        }
      });
  const handleCheckboxChange = (category: string) => {
    setSelectedCategorys((prev) =>
      prev.includes(category)
        ? prev.filter((s) => s !== category)
        : [...prev, category]
    );
  };
      selectedCategorys.forEach((category) => {
        const key = `${categore}.${category}`;
        const filter: FilterData = {
          operand: categore,
          operee: "eq",
          type: "categoric",
          value: category,
          value_high: null,
          value_low: null,
        };
        addFilter(key, filter);
      });
    }, [selectedCategorys]);
  
    const handleCheckboxChange = (category: string) => {
      setSelectedCategorys((prev) =>
        prev.includes(category)
          ? prev.filter((s) => s !== category)
          : [...prev, category]
      );
    };

  return (
    <ExpandableSidebarItem title={name}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {categorys.map((category) => (
          <label key={category} style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selectedCategorys.includes(category)}
              onChange={() => handleCheckboxChange(category)}
              style={{ marginRight: "0.5rem" }}
            />
            {category}
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
        Select one or more {_props.displayName ?? categore } to include in the filter.
      </div>
    </ExpandableSidebarItem>
  );
};

export default CategoryFilter;