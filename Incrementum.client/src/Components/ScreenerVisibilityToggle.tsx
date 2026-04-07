import React from "react";
import { usePreferences } from "../Context/usePreferences";
import "../styles/BubbleSwitch.css";

const ScreenerVisibilityToggle: React.FC = () => {
  const { defaultPrivate, setDefaultPrivate } = usePreferences();

  return (
    <label className="bubble-switch">
      <input
        type="checkbox"
        checked={defaultPrivate}
        onChange={(e) => setDefaultPrivate(e.target.checked)}
        className="bubble-switch-input"
      />
      <span className="bubble-switch-slider"></span>
      <span className="bubble-switch-label">
        {defaultPrivate ? "Private" : "Public"}
      </span>
    </label>
  );
};

export default ScreenerVisibilityToggle;
