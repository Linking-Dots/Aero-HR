import React from 'react';
import { Icon, Switch, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

/**
 * DarkModeSwitch Component - Atomic Design: Atom
 * 
 * A toggle switch component for switching between light and dark themes.
 * Displays appropriate icons and provides accessibility features.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {Function} props.toggleDarkMode - Function to toggle dark mode
 * @returns {JSX.Element} Rendered DarkModeSwitch component
 * 
 * @example
 * <DarkModeSwitch 
 *   darkMode={isDark} 
 *   toggleDarkMode={handleToggle} 
 * />
 */
function DarkModeSwitch({ darkMode, toggleDarkMode }) {
    return (
        <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
            <Icon 
                onClick={toggleDarkMode} 
                color="inherit"
                role="button"
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                sx={{ cursor: 'pointer' }}
            >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                <Switch 
                    checked={darkMode} 
                    onChange={toggleDarkMode} 
                    color="default"
                    inputProps={{ 'aria-label': 'Dark mode toggle' }}
                />
            </Icon>
        </Tooltip>
    );
}

export default DarkModeSwitch;
