import React, { createContext, useContext, useState, useMemo } from 'react';
import { applyThemeToRoot } from "@/utils/themeUtils.js";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [themeColor, setThemeColor] = useState(() => {
    const stored = localStorage.getItem('themeColor');
    return stored
      ? JSON.parse(stored)
      : { 
          name: "OCEAN", 
          primary: "#0ea5e9", 
          secondary: "#0284c7",
          gradient: "from-sky-500 to-blue-600",
          description: "Ocean Blue - Professional & Trustworthy"
        };
  });

  const value = useMemo(() => ({
    darkMode,
    themeColor,
    toggleDarkMode: () => setDarkMode(dm => !dm),
    setThemeColor,
  }), [darkMode, themeColor]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('themeColor', JSON.stringify(themeColor));
    applyThemeToRoot(themeColor, darkMode);
  }, [darkMode, themeColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
