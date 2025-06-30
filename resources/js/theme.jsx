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
                                borderRadius: 16,
                                background: darkMode
                                    ? 'rgba(15, 20, 25, 0.15)'
                                    : 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(8px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                                border: darkMode
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: darkMode
                                    ? '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 2px 12px rgba(255, 255, 255, 0.05)'
                                    : '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 2px 12px rgba(255, 255, 255, 0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                overflow: 'hidden',
                                isolation: 'isolate',
                                '&:hover': {
                                    transform: 'translateY(-2px) scale(1.005)',
                                    boxShadow: darkMode
                                        ? '0 12px 40px rgba(0, 0, 0, 0.35), inset 0 2px 12px rgba(255, 255, 255, 0.08)'
                                        : '0 12px 40px rgba(31, 38, 135, 0.18), inset 0 2px 12px rgba(255, 255, 255, 0.5)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: 16,
                                    padding: '1px',
                                    background: darkMode
                                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))'
                                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    pointerEvents: 'none',
                                },
                            },
                        },
                        {
                            props: { variant: 'statistic' },
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                borderRadius: 16,
                                background: darkMode
                                    ? 'rgba(15, 20, 25, 0.12)'
                                    : 'rgba(255, 255, 255, 0.65)',
                                backdropFilter: 'blur(10px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                                border: darkMode
                                    ? '1px solid rgba(255, 255, 255, 0.08)'
                                    : '1px solid rgba(255, 255, 255, 0.7)',
                                boxShadow: darkMode
                                    ? '0 6px 25px rgba(0, 0, 0, 0.2), inset 0 1px 8px rgba(255, 255, 255, 0.04)'
                                    : '0 6px 25px rgba(31, 38, 135, 0.08), inset 0 1px 8px rgba(255, 255, 255, 0.5)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                color: darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
                                overflow: 'hidden',
                                isolation: 'isolate',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    background: darkMode
                                        ? 'rgba(15, 20, 25, 0.18)'
                                        : 'rgba(255, 255, 255, 0.75)',
                                    boxShadow: darkMode
                                        ? '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 8px rgba(255, 255, 255, 0.06)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 8px rgba(255, 255, 255, 0.6)',
                                },
                            },
                        },
                        {
                            props: { variant: 'updates' },
                            style: {
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                borderRadius: 16,
                                background: darkMode
                                    ? 'rgba(15, 20, 25, 0.12)'
                                    : 'rgba(255, 255, 255, 0.65)',
                                backdropFilter: 'blur(10px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                                border: darkMode
                                    ? '1px solid rgba(255, 255, 255, 0.08)'
                                    : '1px solid rgba(255, 255, 255, 0.7)',
                                boxShadow: darkMode
                                    ? '0 6px 25px rgba(0, 0, 0, 0.2), inset 0 1px 8px rgba(255, 255, 255, 0.04)'
                                    : '0 6px 25px rgba(31, 38, 135, 0.08), inset 0 1px 8px rgba(255, 255, 255, 0.5)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                color: darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
                                overflow: 'hidden',
                                isolation: 'isolate',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    background: darkMode
                                        ? 'rgba(15, 20, 25, 0.18)'
                                        : 'rgba(255, 255, 255, 0.75)',
                                    boxShadow: darkMode
                                        ? '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 8px rgba(255, 255, 255, 0.06)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 8px rgba(255, 255, 255, 0.6)',
                                },
                            },
                        },
                    ],
                },
                MuiDialog: {
                    styleOverrides: {
                        root: {
                        // container styles
                        backdropFilter: 'blur(2px)', // optional container blur
                        },
                        paper: {
                        borderRadius: 16,
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'all 0.3s ease-in-out',
                        }
                    },
                    variants: [
                        {
                        props: { variant: 'glass' },
                        style: {
                            '& .MuiPaper-root': {
                            background: darkMode
                                ? 'rgba(15, 20, 25, 0.15)'
                                : 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(12px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                            border: darkMode
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: darkMode
                                ? '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 12px rgba(255, 255, 255, 0.05)'
                                : '0 8px 32px rgba(31, 38, 135, 0.1), inset 0 2px 12px rgba(255, 255, 255, 0.4)',
                            color: darkMode
                                ? 'rgba(255, 255, 255, 0.9)'
                                : 'rgba(0, 0, 0, 0.8)',
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
                                borderRadius: 16,
                                padding: '1px',
                                background: darkMode
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                pointerEvents: 'none',
                            },
                            }
                        }
                        }
                    ]
                },

            },
            glassCard: darkMode
                ? {
                    backdropFilter: 'blur(10px) saturate(180%)',
                    background: 'rgba(15, 20, 25, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2), inset 0 1px 8px rgba(255, 255, 255, 0.04)',
                    borderRadius: 16,
                    borderHighlight: '1px solid rgba(255, 255, 255, 0.15)',
                    hoverBackground: 'rgba(15, 20, 25, 0.18)',
                    hoverBoxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 8px rgba(255, 255, 255, 0.06)',
                }
                : {
                    backdropFilter: 'blur(10px) saturate(180%)',
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 6px 25px rgba(31, 38, 135, 0.08), inset 0 1px 8px rgba(255, 255, 255, 0.5)',
                    borderRadius: 16,
                    borderHighlight: '1px solid rgba(255, 255, 255, 0.5)',
                    hoverBackground: 'rgba(255, 255, 255, 0.75)',
                    hoverBoxShadow: '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 8px rgba(255, 255, 255, 0.6)',
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
                