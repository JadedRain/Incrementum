import React from "react";
import { usePreferences } from "../Context/usePreferences";
import "../styles/BubbleSwitch.css";

const InfoBubblesToggle: React.FC = () => {
  const { showInfoBubbles, toggleInfoBubbles } = usePreferences();

  return (
    <label className="bubble-switch">
      <input
        type="checkbox"
        checked={showInfoBubbles}
        onChange={toggleInfoBubbles}
        className="bubble-switch-input"
      />
      <span className="bubble-switch-slider"></span>
      <span className="bubble-switch-label">
        {showInfoBubbles ? "Info" : "NoInfo"}
      </span>
    </label>
  );
};

export default InfoBubblesToggle;
