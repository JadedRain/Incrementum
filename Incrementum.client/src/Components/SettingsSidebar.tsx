import React from "react";

type SettingsTab = "account" | "notification" | "customize";

type Props = {
    active: SettingsTab;
    setActive: (tab: SettingsTab) => void;
};

const SettingsSidebar: React.FC<Props> = ({ active, setActive }) => {
    return (
        <div className="SettingsPage-left-sidebar">
            <nav aria-label="Settings navigation">
                <ul>
                    <li>
                        <button
                            type="button"
                            onClick={() => setActive("account")}
                            className={`w-full text-left py-4 border-b border-[hsl(40,46%,36%)] px-1 ${active === "account"
                                ? "font-semibold text-[hsl(40,46%,36%)]"
                                : "text-[hsl(40,46%,36%)]"
                                }`}
                        >
                            Account
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default SettingsSidebar;