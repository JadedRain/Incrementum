import React, { useState, useEffect } from "react";
import ExpandableSidebarItem from "../ExpandableSidebarItem";
import { useFilterData } from "../../Context/FilterDataContext";
import type { FilterData } from "../../Context/FilterDataContext";

const LastCloseFilter: React.FC = () => {
  const { addFilter, removeFilter } = useFilterData();

  const [highValue, setHighValue] = useState<number | null>(null);
  const [lowValue, setLowValue] = useState<number | null>(null);

  const highKey = "lastclose52weekhigh.lasttwelvemonths";
  const lowKey = "lastclose52weeklow.lasttwelvemonths";

  const showWarning =
  lowValue !== null && highValue !== null && lowValue > highValue;

  useEffect(() => {
    if (highValue !== null && !showWarning) {
      const highFilter: FilterData = {
        operand: highKey,
        operator: "gt",
        filter_type: "numeric",
        value_high: null,
        value_low: null,
        value: highValue,
      };
      addFilter(highKey, highFilter);
    } else {
      removeFilter(highKey);
    }
  }, [highValue, addFilter, removeFilter, showWarning]);

  useEffect(() => {
    if (lowValue !== null && !showWarning) {
      console.log(lowKey)
      const lowFilter: FilterData = {
        operand: lowKey,
        operator: "lt",
        filter_type: "numeric",
        value_high: null,
        value_low: null,
        value: lowValue,
      };
      addFilter(lowKey, lowFilter);
    } else {
      removeFilter(lowKey);
    }
  }, [lowValue, addFilter, removeFilter, showWarning]);

  return (
    <ExpandableSidebarItem title="Last Close Filters">
      <div style={{ marginBottom: "0.5rem" }}>
        <div style={{ fontWeight: 600 }}>52-Week High / Low</div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <input
            type="number"
            placeholder="High (> )"
            value={highValue ?? ""}
            onChange={(e) =>
              setHighValue(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input"
            style={{ flex: 1, padding: "0.4rem" }}
          />
          <input
            type="number"
            placeholder="Low (< )"
            value={lowValue ?? ""}
            onChange={(e) =>
              setLowValue(e.target.value ? Number(e.target.value) : null)
            }
            className="sidebar-input"
            style={{ flex: 1, padding: "0.4rem" }}
          />
        </div>
      </div>
            
      <div
        style={{
            marginTop: "0.5rem",
            fontSize: "0.85rem",
            color: "#2b2b2b",
        }}
        >
        (On the left is min 52-Week High. On the right is max 52-Week Low.)
      </div>
          {showWarning && (
            <div style={{ color: "red", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              Warning: Low value cannot be higher than High value.
            </div>
                  )}
    </ExpandableSidebarItem>
  );
};

export default LastCloseFilter;
