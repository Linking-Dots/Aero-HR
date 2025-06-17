/**
 * Theme Setting Drawer Core Component
 * 
 * The main UI component for the theme configuration drawer.
 */

import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography,
  Divider
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Check as CheckIcon,
  Circle as CircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Button } from "@heroui/react";

export const ThemeSettingDrawerCore = ({
  open,
  onClose,
  anchor,
  darkMode,
  selectedTheme,
  availableThemes,
  onDarkModeToggle,
  onThemeColorSelect,
  isThemeSelected,
  theme,
  className,
  style,
  config
}) => {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      className={className}
      style={style}
      PaperProps={{
        sx: {
          width: config.ui.drawerWidth,
          backdropFilter: theme.glassCard.backdropFilter,
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          borderRadius: config.glassStyle.borderRadius,
          boxShadow: config.glassStyle.shadow
        }
      }}
      ModalProps={{
        slotProps: {
          backdrop: {
            sx: {
              backdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }
          }
        }
      }}
      aria-label={config.accessibility.drawerLabel}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="600">
              {config.labels.title}
            </Typography>
          </Box>
        </Box>

        <List sx={{ flexGrow: 1, p: 0 }}>
          {/* Theme Base Section */}
          <ListItem sx={{ px: 0, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
              {config.labels.themeBase}
            </Typography>
          </ListItem>

          <ListItem sx={{ px: 0, py: config.ui.spacing.item }}>
            <Button
              fullWidth
              radius={config.ui.buttonRadius}
              onClick={onDarkModeToggle}
              className="justify-start bg-gradient-to-tr from-black to-gray-500 text-white shadow-lg"
              variant={darkMode ? "solid" : "ghost"}
              startContent={darkMode ? <CheckIcon /> : <CloseIcon />}
              aria-label={config.accessibility.darkModeLabel}
            >
              {config.labels.darkMode}
            </Button>
          </ListItem>

          <Divider sx={{ my: 2 }} />

          {/* Theme Colors Section */}
          <ListItem sx={{ px: 0, py: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
              {config.labels.themeColors}
            </Typography>
          </ListItem>

          {availableThemes.map((color, index) => (
            <ListItem key={color.name} sx={{ px: 0, py: config.ui.spacing.item }}>
              <Button
                fullWidth
                radius={config.ui.buttonRadius}
                onClick={() => onThemeColorSelect(color)}
                className={color.className}
                startContent={
                  isThemeSelected(color) ? 
                    <CheckIcon sx={{ ml: -1 }} /> : 
                    <CircleIcon sx={{ ml: -1 }} />
                }
                aria-label={`${config.accessibility.themeColorLabel}: ${color.name}`}
                data-active={isThemeSelected(color)}
              >
                {color.name}
              </Button>
            </ListItem>
          ))}
        </List>

        {/* Footer */}
        <Box sx={{ 
          mt: 'auto',
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            Customize your workspace appearance
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
