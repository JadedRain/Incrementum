import React, { useEffect, useState } from "react";
import { useAuth } from '../Context/AuthContext';
import { FilterDataProvider } from '../Context/FilterDataContext';
import Sidebar from "../Components/Sidebar";
import "../styles/SettingsPage.css";

const SidebarTestPage: React.FC = () => {
  const { apiKey } = useAuth();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const [changePeriod, setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    setSelectedSectors(["Technology"]);
    setSelectedIndustries(["Cyber Security"]);
  }, []);

  return (
    <FilterDataProvider>
      <Sidebar 
          selectedSectors={selectedSectors}
          onSelectedSectorsChange={setSelectedSectors}
          selectedIndustries={selectedIndustries}
          onSelectedIndustriesChange={setSelectedIndustries}
          changePeriod={changePeriod}
          onChangePeriod={setChangePeriod}
          showCustomScreenerSection={true}
          apiKey={apiKey || undefined}
      />
    </FilterDataProvider>
  );
};

export default SidebarTestPage;