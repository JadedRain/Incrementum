import React from "react";
import { FilterDataProvider} from '../Context/FilterDataContext';
import Sidebar from "../Components/Sidebar";
import FilterList from "../Components/FilterList";
import "../styles/SettingsPage.css";

const SidebarTestPage: React.FC = () => {
  return (
    <FilterDataProvider>
      <Sidebar />
      <FilterList />
    </FilterDataProvider>
  );
};

export default SidebarTestPage;