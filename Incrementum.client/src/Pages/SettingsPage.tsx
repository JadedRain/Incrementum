import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import NavigationBar from "../Components/NavigationBar";
import SettingsSidebar from "../Components/SettingsSidebar";
import SettingsMainContent from "../Components/SettingsMainContent";
import useAccount from "../hooks/useAccount";
import useSettingsContent from "../hooks/useSettingsContent";
import "../styles/SettingsPage.css";

const SettingsPage: React.FC = () => {
  const { apiKey } = useAuth();
  const [active, setActive] = useState<'account' | 'notification' | 'customize'>('account');

  const { account } = useAccount(apiKey);

  const mainContent = useSettingsContent(active, account);

  if (!apiKey) {
    return <div className="account-container">Please log in to view your account.</div>;
  }

  return (
    <div className="settings-page">
      <NavigationBar />
      <div className="settings-layout">
        <SettingsSidebar active={active} setActive={setActive} />
        <div className="Settings-main-content">
          <SettingsMainContent title={mainContent.title} sections={mainContent.sections} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;