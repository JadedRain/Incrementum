import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import NavigationBar from "../Components/NavigationBar";
import SettingsSidebar from "../Components/SettingsSidebar";
import "../styles/SettingsPage.css";

const SettingsPage: React.FC = () => {
  const {apiKey} = useAuth();
  const [account, setAccount] = useState<{ name: string; email: string; phone_number: string } | null>(null);
  const [setError] = useState("");
  const [active, setActive] = useState<'account' | 'notification' | 'customize'>('account');

  useEffect(() => {
    const fetchAccount = async () => {
      if (!apiKey) return;
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey })
      });
      if (res.ok) {
        setAccount(await res.json());
      } else {
        setError("Could not fetch account info.");
      }
    };
    fetchAccount();
  }, [apiKey]);

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
            {active === 'account' && (
              <div className="account-card bg-[hsl(40,63%,63%)] rounded p-8 w-full mt-0 relative">
                <h2 className="text-2xl font-bold mb-4 text-[hsl(40,46%,36%)]">Account Settings</h2>

                <div className="mt-4">
                  <h3 className="text-lg font-medium text-[hsl(40,46%,36%)]">Account Info</h3>
                  <div className="border-t border-[hsl(40,46%,36%)] my-3" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base text-[hsl(40,46%,36%)]">Name</div>
                      <div className="inline-flex items-center px-3 py-2 bg-[hsl(40,61%,55%)] text-[hsl(40,62%,26%)]">{account?.name ?? "—"}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-base text-[hsl(40,46%,36%)]">Email</div>
                      <div className="inline-flex items-center px-3 py-2 bg-[hsl(40,61%,55%)] text-[hsl(40,62%,26%)]">{account?.email ?? "—"}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-base text-[hsl(40,46%,36%)]">Phone Number</div>
                      <div className="inline-flex items-center px-3 py-2 bg-[hsl(40,61%,55%)] text-[hsl(40,62%,26%)]">{account?.phone_number ?? "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
