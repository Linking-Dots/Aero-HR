import { createTheme } from '@mui/material/styles';
import { useMemo } from "react";

// Helper function to safely convert hex to RGB
const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return '14, 165, 233'; // Default blue RGB
    
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return '14, 165, 233';
    
    try {
        const result = cleanHex.match(/.{2}/g);
        if (!result) return '14, 165, 233';
        
        return result.map(hex => parseInt(hex, 16)).join(', ');
    } catch (error) {
        return '14, 165, 233';
    }
};

const useTheme = (
    darkMode,
    themeColor = { 
        name: "OCEAN", 
        primary: "#0ea5e9", 
        secondary: "#0284c7",
        gradient: "from-sky-500 to-blue-600",
        description: "Ocean Blue - Professional & Trustworthy"
    }
) => {
    return useMemo(
        () => {
            // Ensure themeColor has valid properties
            const safeThemeColor = {
                name: themeColor?.name || "OCEAN",
                primary: themeColor?.primary || "#0ea5e9",
                secondary: themeColor?.secondary || "#0284c7",
                gradient: themeColor?.gradient || "from-sky-500 to-blue-600",
                description: themeColor?.description || "Ocean Blue - Professional & Trustworthy"
            };

            const primaryRgb = hexToRgb(safeThemeColor.primary);
            const secondaryRgb = hexToRgb(safeThemeColor.secondary);

            return createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: {
                        main: safeThemeColor.primary,
                        dark: safeThemeColor.secondary,
                        light: safeThemeColor.primary + '80',
                    },
                    secondary: {
                        main: safeThemeColor.secondary,
                    },
                    background: {
                        default: darkMode ? '#0f1419' : '#ffffff',
                        paper: darkMode ? '#1a202c' : '#ffffff',
                    },
                    text: {
                        primary: darkMode ? '#ffffff' : '#1a202c',
                        secondary: darkMode ? '#a0aec0' : '#4a5568',
                    }
                },
                typography: {
                    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                    h1: { fontWeight: 700 },
                    h2: { fontWeight: 700 },
                    h3: { fontWeight: 600 },
                    h4: { fontWeight: 600 },
                    h5: { fontWeight: 600 },
                    h6: { fontWeight: 600 },
                    body1: { fontWeight: 400 },
                    body2: { fontWeight: 400 },
                    button: { fontWeight: 500, textTransform: 'none' },
                },
                shape: {
                    borderRadius: 16,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '8px 16px',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                boxShadow: darkMode 
                                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            },
                        },
                    },
                },
                glassCard: darkMode
                    ? {
                        // Enhanced dark mode glass effect
                        backdropFilter: 'blur(20px) saturate(200%)',
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: `
                            0 25px 50px -12px rgba(0, 0, 0, 0.25),
                            0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                            0 2px 4px 0 rgba(${primaryRgb}, 0.1)
                        `,
                        borderRadius: '20px',
                        borderHighlight: '1px solid rgba(255, 255, 255, 0.2)',
                    }
                    : {
                        // Enhanced light mode glass effect
                        backdropFilter: 'blur(20px) saturate(200%)',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `
                            0 25px 50px -12px rgba(0, 0, 0, 0.15),
                            0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                            0 2px 4px 0 rgba(${primaryRgb}, 0.1)
                        `,
                        borderRadius: '20px',
                        borderHighlight: '1px solid rgba(255, 255, 255, 0.4)',
                    },
                // Add theme color utilities
                colors: {
                    primary: safeThemeColor.primary,
                    secondary: safeThemeColor.secondary,
                    gradient: safeThemeColor.gradient,
                    name: safeThemeColor.name,
                },
                // CSS custom properties for dynamic theming
                customProperties: {
                    '--theme-primary': safeThemeColor.primary,
                    '--theme-secondary': safeThemeColor.secondary,
                    '--theme-primary-rgb': primaryRgb,
                    '--theme-secondary-rgb': secondaryRgb,
                }
            });
        },
        [darkMode, themeColor]
    );
};

export default useTheme;