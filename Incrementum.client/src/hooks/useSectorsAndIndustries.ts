import { useState, useEffect } from 'react';
import { fetchWrapper } from "../Context/FetchingHelper";

interface UseSectorsAndIndustriesReturn {
  sectorChecks: { [k: string]: boolean };
  setSectorChecks: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
  industryChecks: { [k: string]: boolean };
  setIndustryChecks: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
}

interface UseSectorsAndIndustriesProps {
  selectedSectors?: string[];
  selectedIndustries?: string[];
}

export const useSectorsAndIndustries = ({
  selectedSectors,
  selectedIndustries,
}: UseSectorsAndIndustriesProps): UseSectorsAndIndustriesReturn => {
  const [sectorChecks, setSectorChecks] = useState<{ [k: string]: boolean }>({});
  const [industryChecks, setIndustryChecks] = useState<{ [k: string]: boolean }>({});

  useEffect(() => {
    let mounted = true;
    
    const fetchSectors = async () => {
      const res = await fetchWrapper(fetch('/sectors/'));
      if (!res.ok) return;
      const data = await res.json();
      const fetched: string[] = Array.isArray(data.sectors) ? data.sectors : [];
      if (!mounted) return;

      setSectorChecks(() => {
        const next: { [k: string]: boolean } = {};
        fetched.forEach(s => {
          const isSelected = selectedSectors?.includes(s) || false;
          next[s] = isSelected;
        });
        return next;
      });
    };

    const fetchIndustries = async () => {
      const res = await fetchWrapper(fetch('/industries/'));
      if (!res.ok) return;
      const data = await res.json();
      const fetched: string[] = Array.isArray(data.industries) ? data.industries : [];
      if (!mounted) return;

      setIndustryChecks(() => {
        const next: { [k: string]: boolean } = {};
        fetched.forEach(s => {
          const isSelected = selectedIndustries?.includes(s) || false;
          next[s] = isSelected;
        });
        return next;
      });
    };

    fetchSectors();
    fetchIndustries();

    return () => { mounted = false; };
  }, [selectedSectors, selectedIndustries]);

  return {
    sectorChecks,
    setSectorChecks,
    industryChecks,
    setIndustryChecks,
  };
};