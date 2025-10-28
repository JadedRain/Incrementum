import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import "../styles/SettingsPage.css";

const SettingsPage: React.FC = () => {
  const { apiKey, signOut } = useAuth();
  const [account, setAccount] = useState<{ name: string; email: string; phone_number: string } | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
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
          <div className="SettingsPage-left-sidebar">
              <nav aria-label="Settings navigation">
                <ul>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActive('account')}
                      className={`w-full text-left py-4 border-b border-[hsl(40,46%,20%)] px-1 ${active === 'account' ? 'font-semibold text-[hsl(40,46%,10%)]' : 'text-[hsl(40,46%,18%)]'}`}
                    >
                      Account
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActive('notification')}
                      className={`w-full text-left py-4 border-b border-[hsl(40,46%,20%)] px-1 ${active === 'notification' ? 'font-semibold text-[hsl(40,46%,10%)]' : 'text-[hsl(40,46%,18%)]'}`}
                    >
                      Notification
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActive('customize')}
                      className={`w-full text-left py-4 border-b border-[hsl(40,46%,20%)] px-1 ${active === 'customize' ? 'font-semibold text-[hsl(40,46%,10%)]' : 'text-[hsl(40,46%,18%)]'}`}
                    >
                      Customize
                    </button>
                  </li>
                </ul>
              </nav>
          </div>
          <div className="Settings-main-content flex-1 flex flex-col items-start justify-start">
              {active === 'account' && (
                <div className="account-card bg-[hsl(40,63%,63%)] rounded p-8 w-full mt-0 relative">
                  <button
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    onClick={() => { signOut(); navigate('/'); }}
                  >
                    Log Out
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-[hsl(40,46%,18%)]">Account Settings</h2>

                  {/* Section 1 */}
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-[hsl(40,46%,18%)]">Section 1</h3>
                    <div className="border-t border-[hsl(40,46%,20%)] my-3" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-base text-[hsl(40,46%,18%)]">Setting 1</div>
                        <select className="bg-[hsl(40,63%,63%)] text-[hsl(40,46%,18%)] px-3 py-2 rounded">
                          <option>Value</option>
                          <option>Value 2</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-base text-[hsl(40,46%,18%)]">Setting 2</div>
                        <select className="bg-[hsl(40,63%,63%)] text-[hsl(40,46%,18%)] px-3 py-2 rounded">
                          <option>Value</option>
                          <option>Value 2</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-base text-[hsl(40,46%,18%)]">Setting 3</div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[hsl(40,46%,18%)] peer-focus:outline-none rounded-full peer peer-checked:bg-[hsl(40,62%,26%)]"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-[hsl(40,46%,18%)]">Section 2</h3>
                    <div className="border-t border-[hsl(40,46%,20%)] my-3" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-base text-[hsl(40,46%,18%)]">Setting 1</div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[hsl(40,46%,18%)] peer-focus:outline-none rounded-full peer peer-checked:bg-[hsl(40,62%,26%)]"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-base text-[hsl(40,46%,18%)]">Setting 2</div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[hsl(40,46%,18%)] peer-focus:outline-none rounded-full peer peer-checked:bg-[hsl(40,62%,26%)]"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-base text-[hsl(40,46%,18%)]">Setting 3</div>
                        <select className="bg-[hsl(40,63%,63%)] text-[hsl(40,46%,18%)] px-3 py-2 rounded">
                          <option>Value</option>
                          <option>Value 2</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {active === 'notification' && (
                <div className="bg-[hsl(40,63%,63%)] rounded p-8 w-full mt-0">
                  <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
                  <p className="text-sm text-gray-600">Manage your email and push notification preferences here.</p>
                  {/* Add notification form controls here */}
                </div>
              )}

              {active === 'customize' && (
                <div className="bg-[hsl(40,63%,63%)] rounded p-8 w-full mt-0">
                  <h2 className="text-xl font-semibold mb-4">Customize</h2>
                  <p className="text-sm text-gray-600">Theme, layout and other UI preferences live here.</p>
                  {/* Add customization controls here */}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
