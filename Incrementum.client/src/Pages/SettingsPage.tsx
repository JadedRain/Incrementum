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
    <div className="min-h-screen bg-[hsl(40,13%,53%)] pt-[40px]">
      <NavigationBar />
      <div className="px-8">
        <div className="flex items-start gap-8">
          <SettingsSidebar active={active} setActive={setActive} />
          <div className="Settings-main-content flex-1 flex flex-col items-start justify-start">
            <SettingsMainContent title={mainContent.title} sections={mainContent.sections} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;