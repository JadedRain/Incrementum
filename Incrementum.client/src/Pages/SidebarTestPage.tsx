import React, { useState } from "react";
import { useAuth } from '../Context/AuthContext';
import { FilterDataProvider } from '../Context/FilterDataContext';
import Sidebar from "../Components/Sidebar";
import "../styles/SettingsPage.css";

const SidebarTestPage: React.FC = () => {
  const { apiKey } = useAuth();

  const [changePeriod, setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  return (
    <FilterDataProvider>
      <Sidebar 
          changePeriod={changePeriod}
          onChangePeriod={setChangePeriod}
          apiKey={apiKey || undefined}
      />
    </FilterDataProvider>
  );
};

export default SidebarTestPage;