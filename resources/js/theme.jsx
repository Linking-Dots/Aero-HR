import {createTheme} from '@mui/material/styles';
import {useMemo} from "react";


const useTheme = (darkMode) => {
    return useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light' ,
                },
                typography: {
                    fontFamily: 'Roboto, Arial, sans-serif',  // Set your default font here
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
                    backgroundColor: darkMode ? 'rgba(24, 32, 45, 0.75)' : 'rgba(245, 255, 250, 0.75)',
                    border: darkMode ? '2px solid rgba(0,0,0,0.2)'  : '2px solid rgba(255, 255, 255, 0.5)',
                },
            }),
        [darkMode]
    );
};

export default useTheme;
