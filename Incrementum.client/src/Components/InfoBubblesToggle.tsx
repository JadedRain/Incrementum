import React from "react";
import { usePreferences } from "../Context/usePreferences";

const InfoBubblesToggle: React.FC = () => {
  const { showInfoBubbles, toggleInfoBubbles } = usePreferences();

  return (
    <button
      onClick={toggleInfoBubbles}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{
        backgroundColor: showInfoBubbles ? "var(--accent)" : "var(--bg-sunken)",
      }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-[var(--text-primary)] transition-transform"
        style={{
          transform: showInfoBubbles ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
};

export default InfoBubblesToggle;
