import React from 'react';
import {Icon, Switch, Tooltip} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function DarkModeSwitch({ darkMode, toggleDarkMode }) {
    return (
        <Tooltip title="Toggle dark mode">
            <Icon onClick={toggleDarkMode} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
            </Icon>
        </Tooltip>
    );
}

export default DarkModeSwitch;
