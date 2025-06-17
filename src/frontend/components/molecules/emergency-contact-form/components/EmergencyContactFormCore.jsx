/**
 * Emergency Contact Form Core Component
 * 
 * Core form component containing the primary and secondary contact sections.
 * Implements glass morphism design with responsive layout and accessibility features.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security)
 * - ISO 9001 (Quality Management)
 * - WCAG 2.1 AA (Accessibility)
 */

import React, { memo, useCallback } from 'react';
import {
  Grid,
  Typography,
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import GlassCard from '../../../atoms/glass-card/GlassCard.jsx';
import { ContactSection } from './ContactSection.jsx';
import { FORM_CONFIG } from '../config.js';

/**
 * EmergencyContactFormCore - Main form layout component
 * 
 * Features:
 * - Expandable sections for primary and secondary contacts
 * - Real-time completion indicators
 * - Glass morphism design with responsive layout
 * - Accessibility compliance with ARIA labels
 * - Progress indicators for each section
 */
const EmergencyContactFormCore = memo(({
  formik,
  onFieldFocus,
  onFieldBlur,
  onFieldChange,
  validateField,
  formatPhoneNumber,
  validationSummary,
  completionPercentages,
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = React.useState({
    primary: true,
    secondary: false
  });

  // Toggle section expansion
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Auto-expand secondary section when primary is complete
  React.useEffect(() => {
    if (completionPercentages.primary === 100 && !expandedSections.secondary) {
      setExpandedSections(prev => ({ ...prev, secondary: true }));
    }
  }, [completionPercentages.primary, expandedSections.secondary]);

  // Section header component
  const SectionHeader = memo(({ 
    section, 
    title, 
    subtitle, 
    isRequired, 
    completionPercentage, 
    isExpanded, 
    onToggle 
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, 
          ${theme.palette.background.paper}20, 
          ${theme.palette.background.default}10)`,
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: `linear-gradient(135deg, 
            ${theme.palette.background.paper}30, 
            ${theme.palette.background.default}20)`
        }
      }}
      onClick={() => onToggle(section)}
      role="button"
      aria-expanded={isExpanded}
      aria-controls={`${section}-contact-section`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(section);
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `linear-gradient(135deg, 
              ${theme.palette.primary.main}20, 
              ${theme.palette.secondary.main}20)`,
            border: `2px solid ${isRequired ? theme.palette.primary.main : theme.palette.secondary.main}`,
            color: isRequired ? theme.palette.primary.main : theme.palette.secondary.main
          }}
        >
          {section === 'primary' ? <PersonIcon /> : <GroupsIcon />}
        </Box>
        
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
            {isRequired && (
              <Chip
                label="Required"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            )}
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: '0.875rem' }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Completion indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 8,
              backgroundColor: theme.palette.grey[300],
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: completionPercentage === 100 
                  ? theme.palette.success.main 
                  : completionPercentage > 0 
                    ? theme.palette.primary.main 
                    : theme.palette.grey[400],
                transition: 'all 0.3s ease',
                borderRadius: 4
              }}
            />
          </Box>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ minWidth: 35, textAlign: 'right' }}
          >
            {completionPercentage}%
          </Typography>
        </Box>

        <Tooltip title={isExpanded ? 'Collapse section' : 'Expand section'}>
          <IconButton
            size="small"
            sx={{ 
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
            }}
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  ));

  return (
    <Box 
      className={className} 
      sx={{ width: '100%' }}
      {...props}
    >
      <Grid container spacing={3}>
        {/* Primary Contact Section */}
        <Grid item xs={12}>
          <GlassCard
            sx={{
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              border: `1px solid ${
                formik.errors.emergency_contact_primary_name ||
                formik.errors.emergency_contact_primary_relationship ||
                formik.errors.emergency_contact_primary_phone
                  ? theme.palette.error.main 
                  : 'transparent'
              }`
            }}
          >
            <SectionHeader
              section="primary"
              title={FORM_CONFIG.sections.primary.title}
              subtitle={FORM_CONFIG.sections.primary.subtitle}
              isRequired={FORM_CONFIG.sections.primary.required}
              completionPercentage={completionPercentages.primary}
              isExpanded={expandedSections.primary}
              onToggle={toggleSection}
            />
            
            <Collapse
              in={expandedSections.primary}
              timeout="auto"
              unmountOnExit
            >
              <Box
                id="primary-contact-section"
                sx={{ padding: theme.spacing(3) }}
              >
                <ContactSection
                  contactType="primary"
                  formik={formik}
                  onFieldFocus={onFieldFocus}
                  onFieldBlur={onFieldBlur}
                  onFieldChange={onFieldChange}
                  validateField={validateField}
                  formatPhoneNumber={formatPhoneNumber}
                  isRequired={true}
                />
              </Box>
            </Collapse>
          </GlassCard>
        </Grid>

        {/* Secondary Contact Section */}
        <Grid item xs={12}>
          <GlassCard
            sx={{
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              opacity: completionPercentages.primary < 100 ? 0.7 : 1,
              border: `1px solid ${
                formik.errors.emergency_contact_secondary_name ||
                formik.errors.emergency_contact_secondary_relationship ||
                formik.errors.emergency_contact_secondary_phone
                  ? theme.palette.error.main 
                  : 'transparent'
              }`
            }}
          >
            <SectionHeader
              section="secondary"
              title={FORM_CONFIG.sections.secondary.title}
              subtitle={FORM_CONFIG.sections.secondary.subtitle}
              isRequired={FORM_CONFIG.sections.secondary.required}
              completionPercentage={completionPercentages.secondary}
              isExpanded={expandedSections.secondary}
              onToggle={toggleSection}
            />
            
            <Collapse
              in={expandedSections.secondary}
              timeout="auto"
              unmountOnExit
            >
              <Box
                id="secondary-contact-section"
                sx={{ padding: theme.spacing(3) }}
              >
                <ContactSection
                  contactType="secondary"
                  formik={formik}
                  onFieldFocus={onFieldFocus}
                  onFieldBlur={onFieldBlur}
                  onFieldChange={onFieldChange}
                  validateField={validateField}
                  formatPhoneNumber={formatPhoneNumber}
                  isRequired={false}
                />
              </Box>
            </Collapse>
          </GlassCard>
        </Grid>

        {/* Form Summary */}
        {validationSummary && (
          <Grid item xs={12}>
            <Box
              sx={{
                padding: theme.spacing(2),
                background: `linear-gradient(135deg, 
                  ${theme.palette.background.paper}10, 
                  ${theme.palette.background.default}05)`,
                backdropFilter: 'blur(10px)',
                borderRadius: theme.shape.borderRadius,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Emergency Contact Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Progress:
                </Typography>
                <Box
                  sx={{
                    width: 80,
                    height: 8,
                    backgroundColor: theme.palette.grey[300],
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${completionPercentages.overall}%`,
                      height: '100%',
                      backgroundColor: completionPercentages.overall === 100 
                        ? theme.palette.success.main 
                        : theme.palette.primary.main,
                      transition: 'all 0.3s ease',
                      borderRadius: 4
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  color={completionPercentages.overall === 100 ? 'success.main' : 'text.primary'}
                >
                  {completionPercentages.overall}%
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
});

EmergencyContactFormCore.displayName = 'EmergencyContactFormCore';

export default EmergencyContactFormCore;
