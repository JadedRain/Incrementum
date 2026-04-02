import React from "react";
import { usePreferences } from "../Context/usePreferences";

const ScreenerVisibilityToggle: React.FC = () => {
  const { defaultPrivate, setDefaultPrivate } = usePreferences();

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={defaultPrivate}
          onChange={() => setDefaultPrivate(true)}
          className="cursor-pointer"
        />
        <span className="text-sm text-[var(--text-primary)]">Private</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          checked={!defaultPrivate}
          onChange={() => setDefaultPrivate(false)}
          className="cursor-pointer"
        />
        <span className="text-sm text-[var(--text-primary)]">Public</span>
      </label>
    </div>
  );
};

export default ScreenerVisibilityToggle;
