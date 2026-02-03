import React from 'react';
import TickerSymbolFilter from './FilterComponents/TickerSymbolFilter';
import IndustryFilter from './FilterComponents/IndustryFilter';
import MarketCapFilter from './FilterComponents/MarketCapFilter';
import EPSFilter from './FilterComponents/EPSFilter';

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

        <MarketCapFilter />

        <EPSFilter />
      </nav>
    </aside>
  );
};

export default Sidebar;
