import React from 'react';
import { useFilterData } from '../../Context/FilterDataContext';

const Keywords: React.FC = () => {
  const { selectedSectors, setSelectedSectors } = useFilterData();

  const handleRemove = (sector: string) => {
    setSelectedSectors((prev) => prev.filter((s) => s !== sector));
  };

  return (
    <div className="keywords-section">
      <div className="keywords-label">Keywords</div>
      <div className="keywords-container">
        {selectedSectors.map((sector) => (
          <div key={sector} className="keyword-tag">
            <span className="keyword-text">{sector}</span>
            <button
              className="keyword-remove-btn"
              onClick={() => handleRemove(sector)}
              aria-label={`Remove ${sector}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keywords;
