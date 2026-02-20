import React, { useState, useEffect, useRef } from 'react';
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

  // Clear local state when filters are reset
  useEffect(() => {
    const industryKeys = Object.keys(filterDict).filter(key => key.startsWith('industry__'));
    if (industryKeys.length === 0 && activeIndustryFilters.length > 0) {
      setActiveIndustryFilters([]);
      setIndustryQuery('');
    }
  }, [filterDict, activeIndustryFilters.length]);

  useEffect(() => {
    const fetchIndustrySuggestions = async () => {
      if (industryQuery.trim().length < 2) {
        setIndustrySuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetchWrapper(() =>
          fetch(apiString(`/stocks/industry-autocomplete?query=${encodeURIComponent(industryQuery)}`))
        );
        const data = await response.json();
        setIndustrySuggestions(data.industries || []);
        setShowSuggestions(true);
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
      setActiveIndustryFilters(prev => [...prev, industry]);
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
    setActiveIndustryFilters(prev => prev.filter(i => i !== industry));
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
            if (e.key === 'Enter' && industryQuery.trim().length > 1) {
              selectIndustry(industryQuery);
            }
          }}
          onFocus={() => industrySuggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Start typing an industry..."
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          Type to search for industries (e.g., "banking", "software")
        </p>
        
        {/* Spacer to push content down when suggestions are visible */}
        {showSuggestions && industrySuggestions.length > 0 && (
          <div style={{ height: Math.min(industrySuggestions.length * 48 + 8, 248) + 'px' }} />
        )}
        
        {showSuggestions && industrySuggestions.length > 0 && (
          <div 
            className="industry-suggestions-container"
            style={{
              marginTop: '-' + (Math.min(industrySuggestions.length * 48 + 8, 248)) + 'px',
            }}
          >
            {industrySuggestions.map((industry, index) => (
              <div
                key={index}
                onClick={() => selectIndustry(industry)}
                className="px-3 py-2 hover:bg-[var(--bg-sunken)] cursor-pointer"
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