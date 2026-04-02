import React, { useMemo, useState, useEffect, useRef } from 'react';
import ExpandableSidebarItem from '../ExpandableSidebarItem';
import FilterChip from '../FilterChip';
import Loading from '../Loading';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import { fetchWrapper, apiString } from '../../Context/FetchingHelper';
import '../../styles/IndustryFilter.css';

const IndustryFilter: React.FC = () => {
  const [industryQuery, setIndustryQuery] = useState('');
  const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndustryFilters, setActiveIndustryFilters] = useState<string[]>([]);
  const { addFilter, removeFilter, filterDict } = useDatabaseScreenerContext();
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  const industryFiltersFromContext = useMemo(() => {
    return Object.values(filterDict)
      .filter((f) => f.operand === 'industry')
      .map((f) => (typeof f.value === 'string' ? f.value : String(f.value ?? '')))
      .filter((v) => v.length > 0)
      .sort((a, b) => a.localeCompare(b));
  }, [filterDict]);
  const previousIndustryFilterCountRef = useRef(industryFiltersFromContext.length);

  // Keep chip UI in sync with context (e.g., when applying shared links)
  useEffect(() => {
    setActiveIndustryFilters((prev) => {
      const next = industryFiltersFromContext;
      if (prev.length === next.length && prev.every((p, i) => p === next[i])) {
        return prev;
      }
      return next;
    });
  }, [industryFiltersFromContext]);

  // Clear input when filters are reset
  useEffect(() => {
    const currentIndustryFilterCount = industryFiltersFromContext.length;
    if (previousIndustryFilterCountRef.current > 0 && currentIndustryFilterCount === 0) {
      setIndustryQuery('');
      setShowSuggestions(false);
    }
    previousIndustryFilterCountRef.current = currentIndustryFilterCount;
  }, [industryFiltersFromContext]);

  useEffect(() => {
    const fetchIndustrySuggestions = async () => {
      if (industryQuery.trim().length < 1) {
        setIndustrySuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetchWrapper(() =>
          fetch(apiString(`/stocks/industry-autocomplete?query=${encodeURIComponent(industryQuery)}`))
        );
        const data = await response.json();
        setIndustrySuggestions(data.industries || []);
        setShowSuggestions((data.industries || []).length > 0);
      } catch {
        setError('Error fetching industry suggestions');
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(fetchIndustrySuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [industryQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectIndustry = (industry: string) => {
    if (!activeIndustryFilters.includes(industry)) {
      setIndustryQuery('');
      setShowSuggestions(false);
      addFilter({
        operator: 'contains',
        operand: 'industry',
        filter_type: 'string',
        value: industry,
      });
    }
  };

  const removeIndustryFilter = (industry: string) => {
    const key = `industry__contains__${industry}`;
    removeFilter(key);
  };

  return (
    <ExpandableSidebarItem title="Industry Search">
      <div className="mb-4 relative" ref={suggestionBoxRef}>
        <label className="block text-sm font-medium mb-2">Industry Search:</label>
        <input
          type="text"
          value={industryQuery}
          onChange={e => setIndustryQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && industryQuery.trim().length > 0) {
              selectIndustry(industryQuery);
              return;
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          onFocus={() => industrySuggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Start typing an industry..."
          className="sidebar-input filter-input-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Type to search for industries (e.g., "banking", "software")
        </p>

        {showSuggestions && industrySuggestions.length > 0 && (
          <div className="industry-suggestions-container">
            {industrySuggestions.map((industry, index) => (
              <div
                key={index}
                onClick={() => selectIndustry(industry)}
                className="industry-suggestion-item"
              >
                {industry}
              </div>
            ))}
          </div>
        )}
        {loading && <Loading loading={true} />}
        {error && <div className="filter-warning">{error}</div>}
        {activeIndustryFilters.length > 0 && (
          <div className="filter-chips">
            {activeIndustryFilters.map(industry => (
              <FilterChip
                key={industry}
                label={industry}
                onRemove={() => removeIndustryFilter(industry)}
              />
            ))}
          </div>
        )}
      </div>
    </ExpandableSidebarItem>
  );
};

export default IndustryFilter;