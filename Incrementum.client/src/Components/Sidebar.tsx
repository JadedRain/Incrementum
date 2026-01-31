import React from 'react';
import TickerSymbolFilter from './TickerSymbolFilter';
import IndustryFilter from './FilterComponents/IndustryFilter';
interface SidebarProps {
  screenerName?: string;
  onShowToast?: (message: string) => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <TickerSymbolFilter />

        <IndustryFilter />
      </nav>
    </aside>
  );
};

export default Sidebar;
