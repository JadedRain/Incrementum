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
                            className={`w-full text-left py-4 border-b border-[var(--text-primary)] px-1 ${active === "account"
                                ? "font-semibold text-[var(--text-primary)]"
                                : "text-[var(--text-primary)]"
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