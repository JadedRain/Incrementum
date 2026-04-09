import React, { useState } from 'react';
import InfoIconSvg from '../assets/info-filled-svgrepo-com.svg';
import { usePreferences } from '../Context/usePreferences';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  className?: string;
  description?: string;
}

const ExpandableSidebarItem: React.FC<Props> = ({ title, defaultOpen = false, children, className, description }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [showTooltip, setShowTooltip] = useState(false);
  const { showInfoBubbles } = usePreferences();

  return (
    <div className={`relative sidebar-dropdown ${className ?? ''}`}>
      <button className="sidebar-links sidebar-dropdown-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="flex items-center gap-2">
          {description && showInfoBubbles && (
            <div
              className="relative inline-block"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <img src={InfoIconSvg} alt="info" className="w-4 h-4 cursor-help flex-shrink-0" />
              {showTooltip && (
                <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 px-3 py-2 bg-gray-900 text-white rounded text-xs whitespace-normal w-48 shadow-lg z-50 pointer-events-auto">
                  {description}
                </div>
              )}
            </div>
          )}
          <span>{title}</span>
        </div>
        <svg
          className={`w-4 h-4 ml-auto sidebar-chevron${open ? ' open' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="sidebar-expandable-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandableSidebarItem;
