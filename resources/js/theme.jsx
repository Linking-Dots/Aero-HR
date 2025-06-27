import { createTheme } from '@mui/material/styles';
import { useMemo } from "react";
import { getThemeColor, generateThemeProperties, hexToRgb } from './utils/themeUtils';

/**
 * useTheme - MUI theme generator using standardized theme color objects
 * Ensures consistency with THEME_COLORS, backgrounds, and font theming.
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @param {string|object} themeColor - Theme color name or object (prefer name)
 * @param {string} fontFamily - Font family string (optional, defaults to Inter stack)
 * @returns {object} MUI theme object
 */
const useTheme = (
    darkMode,
    themeColor = "OCEAN",
    fontFamily = '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif'
) => {
    return useMemo(() => {
        // Always resolve themeColor from THEME_COLORS for consistency
        const themeObj = typeof themeColor === 'string' ? getThemeColor(themeColor) : getThemeColor(themeColor?.name);
        const cssVars = generateThemeProperties(themeObj);
        const primaryRgb = cssVars['--theme-primary-rgb'];
        const secondaryRgb = cssVars['--theme-secondary-rgb'];

        return createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light',
                primary: {
                    main: themeObj.primary,
                    dark: themeObj.secondary,
                    light: themeObj.primary + '80',
                },
                secondary: {
                    main: themeObj.secondary,
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
                fontFamily,
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
                    variants: [
                        {
                            props: { variant: 'glass' },
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                borderRadius: '2rem',
                                background: darkMode
                                    ? 'rgba(15, 20, 25, 0.15)'
                                    : 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(5px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(5px) saturate(180%)',
                                border: darkMode
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: darkMode
                                    ? '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 12px rgba(255, 255, 255, 0.05)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.1), inset 0 2px 12px rgba(255, 255, 255, 0.4)',
                                transition: 'all 0.3s ease-in-out',
                                color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                overflow: 'hidden',
                                isolation: 'isolate',
                                '&:hover': {
                                    transform: 'scale(1.015)',
                                    boxShadow: darkMode
                                        ? '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 2px 12px rgba(255, 255, 255, 0.08)'
                                        : '0 12px 40px rgba(31, 38, 135, 0.15), inset 0 2px 12px rgba(255, 255, 255, 0.5)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '1.9rem',
                                    padding: '1px',
                                    background: darkMode
                                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    pointerEvents: 'none',
                                },
                            },
                        },
                    ],
                },
            },
            glassCard: darkMode
                ? {
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
            colors: {
                primary: themeObj.primary,
                secondary: themeObj.secondary,
                gradient: themeObj.gradient,
                name: themeObj.name,
            },
            customProperties: cssVars,
        });
    }, [darkMode, themeColor, fontFamily]);
};

export default useTheme;
                