import React from 'react';
import { useFilterData } from '../../Context/FilterDataContext';

const Keywords: React.FC = () => {
  const { selectedSectors, setSelectedSectors, filterDataDict, removeFilter } = useFilterData();

  const handleRemoveSector = (sector: string) => {
    setSelectedSectors((prev) => prev.filter((s) => s !== sector));
  };

  const handleRemoveFilter = (key: string) => {
    removeFilter(key);
  };

  // Get all non-sector filters for display
  const otherFilters = Object.entries(filterDataDict).filter(([_key, filter]) => {
    return filter.operand !== 'sector';
  });

  return (
    <div className="keywords-section">
      <div className="keywords-label">Active Filters</div>
      <div className="keywords-container">
        {/* Display sector filters */}
        {selectedSectors.map((sector) => (
          <div key={sector} className="keyword-tag">
            <span className="keyword-text">Sector: {sector}</span>
            <button
              className="keyword-remove-btn"
              onClick={() => handleRemoveSector(sector)}
              aria-label={`Remove ${sector}`}
            >
              ×
            </button>
          </div>
        ))}
        
        {/* Display other filters */}
        {otherFilters.map(([key, filter]) => {
          let displayText = '';
          if (filter.filter_type === 'numeric') {
            if (filter.value_low !== null && filter.value_high !== null) {
              displayText = `${filter.operand}: ${filter.value_low} - ${filter.value_high}`;
            } else if (filter.value !== null) {
              displayText = `${filter.operand}: ${filter.value}`;
            }
          } else if (filter.filter_type === 'categoric') {
            displayText = `${filter.operand}: ${filter.value}`;
          }
          
          return (
            <div key={key} className="keyword-tag">
              <span className="keyword-text">{displayText}</span>
              <button
                className="keyword-remove-btn"
                onClick={() => handleRemoveFilter(key)}
                aria-label={`Remove ${displayText}`}
              >
                ×
              </button>
            </div>
          );
        })}
        
        {selectedSectors.length === 0 && otherFilters.length === 0 && (
          <div className="text-gray-500 text-sm">No filters applied</div>
        )}
      </div>
    </div>
  );
};

export default Keywords;
