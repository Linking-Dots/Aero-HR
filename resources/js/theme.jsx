import {createTheme} from '@mui/material/styles';
import {useMemo} from "react";


const useTheme = (darkMode, themeColor={ name: "DEFAULT", className: "bg-blue-600/25 text-white-600 font-bold" }) => {
    return useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light' ,
                },
                typography: {
                    fontFamily: 'Exo',  // Set your default font here
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
                glassCard: {
                    backdropFilter: 'blur(40px) saturate(200%)',
                    backgroundColor: (() => {
                        switch (themeColor.name) {
                            case "TEAL":
                                return darkMode ? 'rgba(80, 227, 194, 0.55)' : 'rgba(80, 227, 194, 0.30)';
                            case "GREEN":
                                return darkMode ? 'rgba(0, 100, 0, 0.55)' : 'rgba(0, 255, 0, 0.20)';
                            case "PURPLE":
                                return darkMode ? 'rgba(128, 0, 128, 0.55)' : 'rgba(255, 0, 255, 0.20)';
                            case "RED":
                                return darkMode ? 'rgba(139, 0, 0, 0.55)' : 'rgba(255, 0, 0, 0.20)';
                            case "ORANGE":
                                return darkMode ? 'rgba(255, 140, 0, 0.55)' : 'rgba(255, 165, 0, 0.20)';
                            case "DEFAULT":
                            default:
                                return darkMode ? 'rgba(31, 38, 59, 0.55)' : 'rgba(255, 255, 255, 0.60)';
                        }
                    })(),
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.5)',
                },
            }),
        [darkMode, themeColor]
    );
};

export default useTheme;
