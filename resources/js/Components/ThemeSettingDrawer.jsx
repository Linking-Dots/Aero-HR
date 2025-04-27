import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import {useTheme} from "@mui/material/styles";
import {Button} from "@heroui/react";
import CloseIcon from "@mui/icons-material/Close";
import {Circle} from "@mui/icons-material";

const ThemeSettingDrawer = ({ themeDrawerOpen, themeColor, toggleThemeDrawer, toggleThemeColor, darkMode, toggleDarkMode }) => {
    const theme = useTheme();
    const themeColors = [
        { name: "DEFAULT", className: "bg-blue-600/25 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[hover=true]:bg-blue-600 data-[hover=true]:text-white text-white-600 font-bold" },
        { name: "TEAL", className: "bg-teal-600/25 data-[active=true]:bg-teal-600 data-[active=true]:text-white text-teal-600 font-bold data-[hover=true]:bg-teal-600 data-[hover=true]:text-white"},
        { name: "GREEN", className: "bg-green-600/25 data-[active=true]:bg-green-600 data-[active=true]:text-white data-[hover=true]:bg-green-600 data-[hover=true]:text-white text-green-600 font-bold"},
        { name: "PURPLE", className: "bg-purple-600/25 data-[active=true]:bg-purple-600 data-[active=true]:text-white data-[hover=true]:bg-purple-600 data-[hover=true]:text-white text-purple-600 font-bold"},
        { name: "RED", className: "bg-red-600/25 data-[active=true]:bg-red-600 data-[active=true]:text-white data-[hover=true]:bg-red-600 data-[hover=true]:text-white text-red-600 font-bold"},
        { name: "ORANGE", className: "bg-orange-600/25 data-[active=true]:bg-orange-600 data-[active=true]:text-white data-[hover=true]:bg-orange-600 data-[hover=true]:text-white text-orange-600 font-bold"},
    ];

    return (
        <Drawer
            PaperProps={{
                sx: {
                backdropFilter: theme.glassCard.backdropFilter,
                backgroundColor: theme.glassCard.backgroundColor,
                border: theme.glassCard.border,
            }
            }}
            anchor="right" open={themeDrawerOpen} onClose={toggleThemeDrawer}>
            <List>
                {/* Header */}
                <ListItem>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Theme Settings" />
                </ListItem>

                {/* Theme Base */}
                <ListItem>
                    <ListItemText primary="THEME BASE" />
                </ListItem>

                <ListItem>
                    <Button

                        fullWidth
                        radius="full"
                        onClick={toggleDarkMode}
                        className="justify-start bg-gradient-to-tr from-black to-white-500 text-white shadow-lg"
                        variant="ghost"
                        startContent={darkMode ? <CheckIcon /> : <CloseIcon />}
                        isRounded
                    >
                        DARK MODE
                    </Button>
                </ListItem>


                {/* Theme Colors */}
                <ListItem>
                    <ListItemText primary="THEME COLORS" />
                </ListItem>
                {themeColors.map((color, index) => (
                    <ListItem key={index}>
                        <Button
                            data-active={color.name === themeColor.name}
                            onClick={() => toggleThemeColor(color)}
                            fullWidth
                            radius="full"
                            className={`${color.className} justify-start`}
                            startContent={color.name === themeColor.name ? <CheckIcon sx={{ ml: -1}}/> : <Circle sx={{ ml: -1}}/>}
                        >
                            {color.name}
                        </Button>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default ThemeSettingDrawer;
