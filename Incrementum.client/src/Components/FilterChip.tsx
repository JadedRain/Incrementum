import React, { useState } from 'react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-full text-sm transition-all duration-200 hover:bg-[var(--bg-sunken)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="font-medium">{label}</span>
      {isHovered && (
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-[var(--bg-base)] transition-colors"
          aria-label={`Remove ${label} filter`}
        >
          <span className="text-xs leading-none">×</span>
        </button>
      )}
    </div>
  );
};

export default FilterChip;
