/**
 * FormValidationSummary Component
 * 
 * Displays validation errors and warnings summary for leave form
 * 
 * @fileoverview Validation summary component for leave application form
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Error and warning categorization
 * - Accessible error announcements
 * - Expandable/collapsible sections
 * - Quick navigation to problematic fields
 * - Glass morphism design
 * - Screen reader support
 * 
 * @author glassERP Development Team
 * @module molecules/leave-form/components
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

/**
 * FormValidationSummary Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.errors - Validation errors
 * @param {Object} props.warnings - Validation warnings
 * @param {Object} props.config - Form configuration
 * @param {Function} props.onFieldFocus - Field focus handler
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} FormValidationSummary component
 */
const FormValidationSummary = ({
  errors = {},
  warnings = {},
  config,
  onFieldFocus = () => {},
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: true
  });

  // Count errors and warnings
  const errorCount = Object.keys(errors).length;
  const warningCount = Object.keys(warnings).length;

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle field click to focus
  const handleFieldClick = (fieldName) => {
    onFieldFocus(fieldName);
    
    // Scroll to field
    const fieldElement = document.querySelector(`[name="${fieldName}"]`);
    if (fieldElement) {
      fieldElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      fieldElement.focus();
    }
  };

  // Get field display name
  const getFieldDisplayName = (fieldName) => {
    const fieldConfig = config.fields[fieldName];
    return fieldConfig?.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Don't render if no errors or warnings
  if (errorCount === 0 && warningCount === 0) {
    return null;
  }

  return (
    <Box
      className={`form-validation-summary ${className}`}
      data-testid="validation-summary"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Errors Section */}
      {errorCount > 0 && (
        <Alert
          severity="error"
          sx={{
            mb: warningCount > 0 ? 2 : 0,
            backdropFilter: 'blur(16px) saturate(200%)',
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertTitle sx={{ m: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                <XCircleIcon className="w-5 h-5" />
                Please correct the following errors
                <Chip
                  label={errorCount}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </AlertTitle>
            </Box>

            <IconButton
              size="small"
              onClick={() => toggleSection('errors')}
              aria-label={expandedSections.errors ? 'Collapse errors' : 'Expand errors'}
              sx={{ color: theme.palette.error.main }}
            >
              {expandedSections.errors ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.errors}>
            <List dense sx={{ mt: 1, pl: 0 }}>
              {Object.entries(errors).map(([fieldName, error]) => (
                <ListItem
                  key={fieldName}
                  button
                  onClick={() => handleFieldClick(fieldName)}
                  sx={{
                    pl: 0,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)'
                    },
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to ${getFieldDisplayName(fieldName)} field`}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{getFieldDisplayName(fieldName)}:</strong>{' '}
                        {typeof error === 'object' ? error.message : error}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Alert>
      )}

      {/* Warnings Section */}
      {warningCount > 0 && (
        <Alert
          severity="warning"
          sx={{
            backdropFilter: 'blur(16px) saturate(200%)',
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AlertTitle sx={{ m: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ExclamationTriangleIcon className="w-5 h-5" />
                Recommendations and warnings
                <Chip
                  label={warningCount}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </AlertTitle>
            </Box>

            <IconButton
              size="small"
              onClick={() => toggleSection('warnings')}
              aria-label={expandedSections.warnings ? 'Collapse warnings' : 'Expand warnings'}
              sx={{ color: theme.palette.warning.main }}
            >
              {expandedSections.warnings ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </IconButton>
          </Box>

          <Collapse in={expandedSections.warnings}>
            <List dense sx={{ mt: 1, pl: 0 }}>
              {Object.entries(warnings).map(([fieldName, warning]) => (
                <ListItem
                  key={fieldName}
                  button
                  onClick={() => handleFieldClick(fieldName)}
                  sx={{
                    pl: 0,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.1)'
                    },
                    cursor: 'pointer'
                  }}
                  aria-label={`Go to ${getFieldDisplayName(fieldName)} field`}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{getFieldDisplayName(fieldName)}:</strong>{' '}
                        {typeof warning === 'object' ? warning.message : warning}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Alert>
      )}

      {/* Accessibility Information */}
      <Box
        sx={{ mt: 1 }}
        role="region"
        aria-label="Form validation help"
      >
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <InformationCircleIcon className="w-3 h-3" />
          Click on any item above to navigate to the corresponding field
        </Typography>
      </Box>
    </Box>
  );
};

// Prop types
FormValidationSummary.propTypes = {
  errors: PropTypes.object,
  warnings: PropTypes.object,
  config: PropTypes.object.isRequired,
  onFieldFocus: PropTypes.func,
  className: PropTypes.string
};

export default FormValidationSummary;
