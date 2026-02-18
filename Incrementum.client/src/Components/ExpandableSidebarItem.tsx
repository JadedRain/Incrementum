import React, { useState } from 'react';

interface Props {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const ExpandableSidebarItem: React.FC<Props> = ({ title, defaultOpen = false, children, className }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`relative sidebar-dropdown ${className ?? ''}`}>
      <button className="sidebar-links sidebar-dropdown-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {title}
        <svg
          className={`w-4 h-4 ml-2 sidebar-chevron${open ? ' open' : ''}`}
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
