import { createTheme } from '@mui/material/styles';
import { useMemo } from "react";

const useTheme = (
    darkMode,
    themeColor = { name: "DEFAULT", className: "bg-blue-600/25 text-white-600 font-bold" }
) => {
    return useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                },
                typography: {
                    fontFamily: 'Fredoka',
                },
                text: {
                    primary: '#268bd2',
                    secondary: '#2aa198',
                },
                background: {
                    default: 'transparent',
                },
                context: {
                    background: '#cb4b16',
                    text: '#FFFFFF',
                },
                divider: {
                    default: '#073642',
                },
                action: {
                    button: 'rgba(0,0,0,.54)',
                    hover: 'rgba(0,0,0,.08)',
                    disabled: 'rgba(0,0,0,.12)',
                },
                glassCard: darkMode
                    ? {
                        // iOS 26 Liquid Glass look for dark mode
                        backdropFilter: 'blur(24px) saturate(180%)',
                        background: 'linear-gradient(135deg, rgba(40,40,60,0.60) 0%, rgba(40,40,60,0.20) 100%)',
                        border: '1.5px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.28), 0 1.5px 8px 0 rgba(255,255,255,0.08) inset',
                        borderRadius: '28px',
                        borderHighlight: '1.5px solid rgba(255,255,255,0.18)',
                    }
                    : {
                        // iOS 26 Liquid Glass look for light mode
                        backdropFilter: 'blur(24px) saturate(180%)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.10) 100%)',
                        border: '1.5px solid rgba(255,255,255,0.25)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 1.5px 8px 0 rgba(255,255,255,0.12) inset',
                        borderRadius: '28px',
                        borderHighlight: '1.5px solid rgba(255,255,255,0.35)',
                    },
            }),
        [darkMode, themeColor]
    );
};

export default useTheme;
