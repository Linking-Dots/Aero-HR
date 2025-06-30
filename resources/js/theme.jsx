import {createTheme} from '@mui/material/styles';
import {useMemo} from "react";


const useTheme = (darkMode) => {
    return useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: {
                        main: darkMode ? '#60a5fa' : '#3b82f6',
                        light: darkMode ? '#93c5fd' : '#60a5fa',
                        dark: darkMode ? '#2563eb' : '#1d4ed8',
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: darkMode ? '#a78bfa' : '#8b5cf6',
                        light: darkMode ? '#c4b5fd' : '#a78bfa',
                        dark: darkMode ? '#7c3aed' : '#6d28d9',
                        contrastText: '#ffffff',
                    },
                    background: {
                        default: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
                        paper: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    },
                    text: {
                        primary: darkMode ? '#f1f5f9' : '#0f172a',
                        secondary: darkMode ? '#cbd5e1' : '#475569',
                    },
                    success: {
                        main: darkMode ? '#34d399' : '#10b981',
                        light: darkMode ? '#6ee7b7' : '#34d399',
                        dark: darkMode ? '#059669' : '#047857',
                    },
                    warning: {
                        main: darkMode ? '#fbbf24' : '#f59e0b',
                        light: darkMode ? '#fcd34d' : '#fbbf24',
                        dark: darkMode ? '#d97706' : '#b45309',
                    },
                    error: {
                        main: darkMode ? '#f87171' : '#ef4444',
                        light: darkMode ? '#fca5a5' : '#f87171',
                        dark: darkMode ? '#dc2626' : '#b91c1c',
                    },
                },
                typography: {
                    fontFamily: '"Inter", "Aptos", system-ui, -apple-system, sans-serif',
                    h1: {
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                    },
                    h2: {
                        fontWeight: 600,
                        letterSpacing: '-0.025em',
                    },
                    h3: {
                        fontWeight: 600,
                        letterSpacing: '-0.025em',
                    },
                    h4: {
                        fontWeight: 600,
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                    body1: {
                        lineHeight: 1.6,
                    },
                    body2: {
                        lineHeight: 1.5,
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                shadows: [
                    'none',
                    '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                    '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
                    '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                    '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
                    '0 25px 50px rgba(0, 0, 0, 0.25)',
                ],
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                textTransform: 'none',
                                fontWeight: 600,
                                padding: '10px 20px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                },
                            },
                            contained: {
                                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.4)',
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backdropFilter: 'blur(20px) saturate(200%)',
                                background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                                borderRadius: 16,
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                backdropFilter: 'blur(20px) saturate(200%)',
                                background: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                                borderRadius: 16,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: darkMode 
                                        ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
                                        : '0 12px 40px rgba(0, 0, 0, 0.1)',
                                },
                            },
                        },
                    },
                },
                text: {
                    primary: darkMode ? '#f1f5f9' : '#0f172a',
                    secondary: darkMode ? '#cbd5e1' : '#475569',
                },
                background: {
                    default: 'transparent',
                },
                context: {
                    background: darkMode ? '#7c2d12' : '#ea580c',
                    text: '#ffffff',
                },
                divider: {
                    default: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                },
                action: {
                    button: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    disabled: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
                },
                glassCard: {
                    backdropFilter: 'blur(20px) saturate(200%)',
                    backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: 16,
                    boxShadow: darkMode 
                        ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                },
            }),
        [darkMode]
    );
};

export default useTheme;
