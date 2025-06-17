/**
 * Emergency Contact Form Validation Summary Component
 * 
 * Comprehensive validation status display with error categorization,
 * progress tracking, and accessibility features.
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

import React, { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Collapse,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as AssignmentIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ERROR_MESSAGES } from '../config.js';

/**
 * EmergencyContactFormValidationSummary - Validation status component
 * 
 * Features:
 * - Real-time validation status display
 * - Error categorization and grouping
 * - Progress tracking by section
 * - Accessibility announcements for screen readers
 * - Expandable detailed error information
 */
const EmergencyContactFormValidationSummary = memo(({
  validationSummary,
  formErrors = {},
  completionPercentages,
  formValues = {},
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = React.useState({
    errors: false,
    details: false
  });

  // Categorize errors by field type and severity
  const categorizedErrors = useMemo(() => {
    const categories = {
      required: { errors: [], severity: 'error', icon: ErrorIcon },
      format: { errors: [], severity: 'warning', icon: WarningIcon },
      business: { errors: [], severity: 'info', icon: InfoIcon },
      duplicate: { errors: [], severity: 'error', icon: ErrorIcon }
    };

    Object.entries(formErrors).forEach(([field, error]) => {
      if (typeof error === 'string') {
        if (error.includes('required')) {
          categories.required.errors.push({ field, error });
        } else if (error.includes('duplicate')) {
          categories.duplicate.errors.push({ field, error });
        } else if (error.includes('format') || error.includes('valid')) {
          categories.format.errors.push({ field, error });
        } else {
          categories.business.errors.push({ field, error });
        }
      }
    });

    return categories;
  }, [formErrors]);

  // Calculate validation progress
  const validationProgress = useMemo(() => {
    const totalFields = 6; // 3 primary + 3 secondary
    const primaryFields = ['emergency_contact_primary_name', 'emergency_contact_primary_relationship', 'emergency_contact_primary_phone'];
    const secondaryFields = ['emergency_contact_secondary_name', 'emergency_contact_secondary_relationship', 'emergency_contact_secondary_phone'];
    
    const primaryCompleted = primaryFields.filter(field => 
      formValues[field] && formValues[field].trim() !== '' && !formErrors[field]
    ).length;
    
    const secondaryCompleted = secondaryFields.filter(field => 
      formValues[field] && formValues[field].trim() !== '' && !formErrors[field]
    ).length;
    
    const totalCompleted = primaryCompleted + secondaryCompleted;
    const totalRequired = 3; // Primary contact fields are required
    const optionalCompleted = secondaryCompleted;
    
    return {
      overall: Math.round((totalCompleted / totalFields) * 100),
      required: Math.round((primaryCompleted / totalRequired) * 100),
      optional: Math.round((optionalCompleted / 3) * 100),
      totalErrors: Object.keys(formErrors).length,
      isValid: Object.keys(formErrors).length === 0 && primaryCompleted === 3
    };
  }, [formValues, formErrors]);

  // Get field display name
  const getFieldDisplayName = (fieldName) => {
    const fieldMap = {
      emergency_contact_primary_name: 'Primary Contact Name',
      emergency_contact_primary_relationship: 'Primary Contact Relationship',
      emergency_contact_primary_phone: 'Primary Contact Phone',
      emergency_contact_secondary_name: 'Secondary Contact Name',
      emergency_contact_secondary_relationship: 'Secondary Contact Relationship',
      emergency_contact_secondary_phone: 'Secondary Contact Phone'
    };
    return fieldMap[fieldName] || fieldName;
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  // Main validation status
  const getMainStatus = () => {
    if (validationProgress.isValid) {
      return {
        severity: 'success',
        title: 'All Information Valid',
        message: 'Emergency contact information is complete and valid.',
        icon: CheckCircleIcon
      };
    } else if (validationProgress.totalErrors > 0) {
      return {
        severity: 'error',
        title: `${validationProgress.totalErrors} Validation ${validationProgress.totalErrors === 1 ? 'Error' : 'Errors'}`,
        message: 'Please correct the highlighted fields to continue.',
        icon: ErrorIcon
      };
    } else {
      return {
        severity: 'info',
        title: 'Form In Progress',
        message: `${validationProgress.required}% of required fields completed.`,
        icon: InfoIcon
      };
    }
  };

  const mainStatus = getMainStatus();

  return (
    <Box className={className} {...props}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper}60, ${theme.palette.background.default}40)`,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${getSeverityColor(mainStatus.severity)}30`,
          borderRadius: 2
        }}
      >
        <CardContent>
          {/* Main Status Alert */}
          <Alert 
            severity={mainStatus.severity}
            icon={<mainStatus.icon />}
            sx={{ mb: 2 }}
          >
            <AlertTitle>{mainStatus.title}</AlertTitle>
            {mainStatus.message}
          </Alert>

          {/* Progress Overview */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Required Fields</Typography>
                  <Chip 
                    label={`${validationProgress.required}%`}
                    size="small"
                    color={validationProgress.required === 100 ? 'success' : 'primary'}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={validationProgress.required}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: validationProgress.required === 100 
                        ? theme.palette.success.main 
                        : theme.palette.primary.main,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <GroupIcon fontSize="small" color="secondary" />
                  <Typography variant="body2">Optional Fields</Typography>
                  <Chip 
                    label={`${validationProgress.optional}%`}
                    size="small"
                    color={validationProgress.optional === 100 ? 'success' : 'secondary'}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={validationProgress.optional}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: validationProgress.optional === 100 
                        ? theme.palette.success.main 
                        : theme.palette.secondary.main,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssignmentIcon fontSize="small" color="info" />
                  <Typography variant="body2">Overall Progress</Typography>
                  <Chip 
                    label={`${validationProgress.overall}%`}
                    size="small"
                    color={validationProgress.overall === 100 ? 'success' : 'info'}
                    variant="outlined"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={validationProgress.overall}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.grey[300],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: validationProgress.overall === 100 
                        ? theme.palette.success.main 
                        : theme.palette.info.main,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Error Details */}
          {validationProgress.totalErrors > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Validation Issues
                </Typography>
                <Tooltip title={expandedSections.errors ? 'Hide error details' : 'Show error details'}>
                  <IconButton
                    size="small"
                    onClick={() => toggleSection('errors')}
                    sx={{ 
                      transition: 'transform 0.3s ease',
                      transform: expandedSections.errors ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Collapse in={expandedSections.errors} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.error.main}05)`,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.error.main}20`,
                    p: 2
                  }}
                >
                  {Object.entries(categorizedErrors).map(([category, { errors, severity, icon: Icon }]) => {
                    if (errors.length === 0) return null;
                    
                    return (
                      <Box key={category} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Icon 
                            fontSize="small" 
                            sx={{ color: getSeverityColor(severity) }}
                          />
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: getSeverityColor(severity),
                              textTransform: 'capitalize'
                            }}
                          >
                            {category} Issues ({errors.length})
                          </Typography>
                        </Box>
                        
                        <List dense>
                          {errors.map(({ field, error }, index) => (
                            <ListItem key={`${field}-${index}`} sx={{ pl: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Icon 
                                  fontSize="small" 
                                  sx={{ color: getSeverityColor(severity) }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={getFieldDisplayName(field)}
                                secondary={error}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </>
          )}

          {/* Validation Guidelines */}
          {validationProgress.totalErrors === 0 && validationProgress.required < 100 && (
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.background.paper}30, ${theme.palette.info.main}10)`,
                borderRadius: 1,
                border: `1px solid ${theme.palette.info.main}30`,
                p: 2,
                mt: 2
              }}
            >
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                Completion Guidelines
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Primary contact</strong> information is required (name, relationship, phone)
                <br />
                • <strong>Secondary contact</strong> is optional but recommended
                <br />
                • Phone numbers must be valid Indian mobile numbers (10 digits)
                <br />
                • Primary and secondary contacts cannot have the same phone number
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
});

EmergencyContactFormValidationSummary.displayName = 'EmergencyContactFormValidationSummary';

export default EmergencyContactFormValidationSummary;
