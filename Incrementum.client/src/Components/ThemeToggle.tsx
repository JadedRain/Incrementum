import React from "react";
import { useTheme } from "../Context/ThemeContext";
import "../styles/ThemeToggle.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="theme-toggle">
      <input
        type="checkbox"
        checked={theme === "light"}
        onChange={toggleTheme}
        className="theme-toggle-input"
      />
      <span className="theme-toggle-slider"></span>
      <span className="theme-toggle-label">
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </label>
  );
};

export default ThemeToggle;
