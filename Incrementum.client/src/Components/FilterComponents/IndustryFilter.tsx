import React from 'react';
import CategoryFilter from './CategoricFilter';
import { useFilterData } from "../../Context/FilterDataContext";
import {useState, useEffect} from "react"
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import { fetchWrapper, apiString } from "../../Context/FetchingHelper";
const IndustryFilter: React.FC = () => {
  const {selectedSectors} = useFilterData()
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [industries, SetIndustries] = useState<string[]>()
    useEffect(() => {
    const fetchIndustries = async () => {
        try {
        if (selectedSectors == null)
        {
          return
        }
        setLoading(true);
        const response = await fetchWrapper(()=>fetch(apiString("/industries/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ "sectors": selectedSectors}),
        }));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        SetIndustries([])
        const data = await response.json();
        selectedSectors.forEach((sector)=>{
          const industryNames = Array.isArray(data.industries[sector])
            ? data.industries[sector]
            : [];
          console.log(industryNames)
          SetIndustries((p)=>p?.concat(industryNames));

        })
        } catch (err: unknown) {
        console.error("Failed to fetch industries:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message || "Failed to load industries");
        } finally {
        setLoading(false);
        }
    };

    fetchIndustries();
    }, [selectedSectors]);
    if (industries?.length == 0) {
    return (
      <ExpandableSidebarItem title="Industry Filters">
        <div>Please Select one or more Sectors to display related industries</div>
      </ExpandableSidebarItem>
    );
  }
      if (loading) {
    return (
      <ExpandableSidebarItem title="Industry Filters">
        <div>Loading industries...</div>
      </ExpandableSidebarItem>
    );
  }

  if (error) {
    return (
      <ExpandableSidebarItem title="Industry Filters">
        <div style={{ color: "red" }}>Error: {error}</div>
      </ExpandableSidebarItem>
    );
  }
  return (
      <CategoryFilter categorys={industries ?? []} category='industry' displayName="Industries" />
  );
};

export default IndustryFilter;