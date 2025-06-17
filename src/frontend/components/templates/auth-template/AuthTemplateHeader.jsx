/**
 * @fileoverview Authentication Template Header Component
 * @description Header component for authentication pages with branding and navigation
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author glassERP Development Team
 * 
 * @compliance
 * - ISO 25010: Usability, accessibility, performance efficiency
 * - WCAG 2.1 AA: Accessibility compliance with proper heading structure
 * 
 * @features
 * - Company branding integration
 * - Language/theme switcher
 * - Responsive design
 * - Glass morphism styling
 * - Accessibility navigation
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Brightness6 as ThemeIcon,
  Language as LanguageIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Hooks and utilities
import { useDarkMode } from '@shared/hooks/useDarkMode';
import { useLanguage } from '@shared/hooks/useLanguage';
import { AUTH_TEMPLATE_CONFIG } from './config';

/**
 * Authentication Template Header Component
 * 
 * Provides header functionality for authentication pages including:
 * - Company branding
 * - Theme switching
 * - Language selection
 * - Back navigation
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showBackButton - Whether to show back navigation
 * @param {Function} props.onBackClick - Callback for back navigation
 * @param {boolean} props.showLanguageSelector - Whether to show language selector
 * @param {boolean} props.showThemeToggle - Whether to show theme toggle
 * @param {string} props.title - Page title for accessibility
 * @param {Object} props.branding - Company branding configuration
 * @returns {JSX.Element} Rendered header component
 */
const AuthTemplateHeader = memo(({
  showBackButton = false,
  onBackClick = () => {},
  showLanguageSelector = true,
  showThemeToggle = true,
  title = "Authentication",
  branding = AUTH_TEMPLATE_CONFIG.branding,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  // Animation variants
  const headerVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4, delay: 0.1 }
    }
  };

  return (
    <motion.div
      variants={headerVariants}
      initial="initial"
      animate="animate"
      {...props}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.05)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            zIndex: -1
          }
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Left section - Back button and Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {showBackButton && (
              <IconButton
                onClick={onBackClick}
                color="inherit"
                aria-label="Go back"
                sx={{
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.2),
                    transform: 'translateX(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <BackIcon />
              </IconButton>
            )}

            <motion.div variants={logoVariants}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {branding.logo && (
                  <Box
                    component="img"
                    src={branding.logo}
                    alt={`${branding.companyName} logo`}
                    sx={{
                      height: 40,
                      width: 'auto',
                      filter: isDarkMode ? 'brightness(1.2)' : 'none'
                    }}
                  />
                )}
                
                {!isMobile && (
                  <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                      fontWeight: 600,
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.main} 0%, 
                        ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    {branding.companyName}
                  </Typography>
                )}
              </Box>
            </motion.div>
          </Box>

          {/* Center section - Page title (for screen readers) */}
          <Typography
            variant="h1"
            sx={{
              position: 'absolute',
              left: '-9999px',
              fontSize: '1px'
            }}
          >
            {title} - {branding.companyName}
          </Typography>

          {/* Right section - Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Language Selector */}
            {showLanguageSelector && availableLanguages.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  displayEmpty
                  renderValue={(value) => value?.toUpperCase() || 'EN'}
                  sx={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    },
                    '& .MuiSelect-select': {
                      py: 0.5,
                      fontSize: '0.875rem'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }
                    }
                  }}
                >
                  {availableLanguages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Theme Toggle */}
            {showThemeToggle && (
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                sx={{
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.2),
                    transform: 'rotate(180deg)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ThemeIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
});

AuthTemplateHeader.displayName = 'AuthTemplateHeader';

AuthTemplateHeader.propTypes = {
  showBackButton: PropTypes.bool,
  onBackClick: PropTypes.func,
  showLanguageSelector: PropTypes.bool,
  showThemeToggle: PropTypes.bool,
  title: PropTypes.string,
  branding: PropTypes.shape({
    companyName: PropTypes.string.isRequired,
    logo: PropTypes.string,
    tagline: PropTypes.string
  })
};

export default AuthTemplateHeader;
