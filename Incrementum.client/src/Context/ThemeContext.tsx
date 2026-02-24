import React, { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./themeContext";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const THEME_STORAGE_KEY = "incrementum-theme";

  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage or default to dark
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return (saved === "light" || saved === "dark") ? saved : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute("data-theme", theme);
    
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
