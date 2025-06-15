import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { useMemo } from "react";

const useTheme = (
  darkMode,
  themeColor = { name: "DEFAULT", className: "bg-blue-600/25 text-white-600 font-bold" }
) => {
  const baseTheme = useMemo(() => {
    const getGlassBackground = () => {
      const alpha = darkMode ? 0.55 : 0.30;
      const colorMap = {
        TEAL: `rgba(80, 227, 194, ${alpha})`,
        GREEN: `rgba(${darkMode ? '0, 100, 0, 0.55' : '0, 255, 0, 0.20'})`,
        PURPLE: `rgba(${darkMode ? '128, 0, 128, 0.55' : '255, 0, 255, 0.20'})`,
        RED: `rgba(${darkMode ? '139, 0, 0, 0.55' : '255, 0, 0, 0.20'})`,
        ORANGE: `rgba(${darkMode ? '255, 140, 0, 0.55' : '255, 165, 0, 0.20'})`,
        DEFAULT: darkMode ? 'rgba(31, 38, 59, 0.55)' : 'rgba(255, 255, 255, 0.60)',
      };
      return colorMap[themeColor.name] || colorMap.DEFAULT;
    };

    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
      },
      typography: {
        fontFamily: `'Exo', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
        fontSize: 12, // base font size, smaller for mobile compact
      },
      shape: {
        borderRadius: 6, // slightly tighter rounded corners
      },
      spacing: 6, // tighter global spacing
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              minHeight: '32px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              lineHeight: 1.4,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              fontSize: '0.75rem',
              padding: '4px',
            },
          },
        },
        MuiCardContent: {
          styleOverrides: {
            root: {
              padding: '8px',
            },
          },
        },
      },
      breakpoints: {
        values: {
          xs: 0,
          sm: 480,
          md: 768,
          lg: 1024,
          xl: 1280,
        },
      },
      glassCard: {
        backdropFilter: 'blur(40px) saturate(200%)',
        backgroundColor: getGlassBackground(),
        border: darkMode
          ? '1px solid rgba(255, 255, 255, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: darkMode
          ? '0 4px 10px rgba(0, 0, 0, 0.4)'
          : '0 4px 10px rgba(0, 0, 0, 0.1)',
      },
    });
  }, [darkMode, themeColor]);

  return responsiveFontSizes(baseTheme);
};

export default useTheme;
