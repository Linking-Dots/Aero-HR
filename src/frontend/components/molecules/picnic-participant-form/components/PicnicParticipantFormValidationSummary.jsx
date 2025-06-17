// filepath: src/frontend/components/molecules/picnic-participant-form/components/PicnicParticipantFormValidationSummary.jsx

/**
 * PicnicParticipantFormValidationSummary Component
 * 
 * Interactive validation feedback with error navigation and progress tracking
 * Provides comprehensive validation status display for picnic participant forms
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  LinearProgress,
  Collapse,
  IconButton,
  Alert,
  AlertTitle,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NavigateNext as NavigateNextIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { PICNIC_PARTICIPANT_CONFIG } from '../config';

const PicnicParticipantFormValidationSummary = ({
  errors = {},
  validationStatus = {},
  errorSummary = {},
  fieldValidationStates = {},
  onFieldFocus,
  onErrorClick,
  showProgress = true,
  showDetails = true,
  compactMode = false,
  className
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    critical: true,
    high: true,
    medium: false,
    low: false
  });

  // Toggle section expansion
  const toggleSection = useCallback((severity) => {
    setExpandedSections(prev => ({
      ...prev,
      [severity]: !prev[severity]
    }));
  }, []);

  // Get severity icon and color
  const getSeverityConfig = useCallback((severity) => {
    const configs = {
      critical: {
        icon: ErrorIcon,
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light + '20',
        label: 'Critical Errors'
      },
      high: {
        icon: WarningIcon,
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light + '20',
        label: 'High Priority'
      },
      medium: {
        icon: InfoIcon,
        color: theme.palette.info.main,
        bgColor: theme.palette.info.light + '20',
        label: 'Medium Priority'
      },
      low: {
        icon: CheckCircleIcon,
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light + '20',
        label: 'Low Priority'
      }
    };
    return configs[severity] || configs.medium;
  }, [theme]);

  // Get field section icon
  const getFieldSectionIcon = useCallback((fieldName) => {
    const participantFields = ['name', 'phone'];
    const assignmentFields = ['team', 'random_number'];
    const paymentFields = ['payment_amount'];

    if (participantFields.includes(fieldName)) return PersonIcon;
    if (assignmentFields.includes(fieldName)) return GroupIcon;
    if (paymentFields.includes(fieldName)) return PaymentIcon;
    return InfoIcon;
  }, []);

  // Handle error item click
  const handleErrorClick = useCallback((fieldName, error) => {
    if (onErrorClick) {
      onErrorClick(fieldName, error);
    }
    if (onFieldFocus) {
      onFieldFocus(fieldName);
    }
  }, [onErrorClick, onFieldFocus]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!validationStatus.totalFields) return 0;
    return Math.round((validationStatus.validFields / validationStatus.totalFields) * 100);
  }, [validationStatus]);

  // Glass morphism style
  const glassStyle = {
    backdropFilter: 'blur(20px) saturate(200%)',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(17, 25, 40, 0.25)'
      : 'rgba(255, 255, 255, 0.25)',
    border: `1px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.125)'
      : 'rgba(209, 213, 219, 0.3)'}`,
    borderRadius: '16px',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
  };

  // Render progress section
  const renderProgressSection = () => {
    if (!showProgress) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Form Validation Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {validationStatus.validFields || 0}/{validationStatus.totalFields || 0} fields
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: progressPercentage === 100 
                ? `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {progressPercentage}% Complete
          </Typography>
          {validationStatus.invalidFields > 0 && (
            <Typography variant="caption" color="error">
              {validationStatus.invalidFields} errors remaining
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Render error group
  const renderErrorGroup = (severity, errorList) => {
    if (!errorList || errorList.length === 0) return null;

    const config = getSeverityConfig(severity);
    const IconComponent = config.icon;
    const isExpanded = expandedSections[severity];

    return (
      <Box key={severity} sx={{ mb: 2 }}>
        <ListItemButton
          onClick={() => toggleSection(severity)}
          sx={{
            borderRadius: 2,
            backgroundColor: config.bgColor,
            border: `1px solid ${config.color}30`,
            mb: 1
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={errorList.length} color="error">
              <IconComponent sx={{ color: config.color }} />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary={config.label}
            secondary={`${errorList.length} issue${errorList.length !== 1 ? 's' : ''}`}
            primaryTypographyProps={{ fontWeight: 'medium' }}
          />
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={isExpanded}>
          <List dense sx={{ pl: 2 }}>
            {errorList.map(({ field, message }, index) => {
              const SectionIcon = getFieldSectionIcon(field);
              const fieldConfig = PICNIC_PARTICIPANT_CONFIG.fields[field];
              
              return (
                <ListItem
                  key={`${field}-${index}`}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleErrorClick(field, message)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SectionIcon sx={{ fontSize: 18, color: config.color }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={fieldConfig?.label || field}
                    secondary={message}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: 'medium'
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption',
                      color: 'text.secondary'
                    }}
                  />
                  <NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  // Render validation summary
  const renderValidationSummary = () => {
    const hasErrors = errorSummary.total > 0;
    
    if (!hasErrors && validationStatus.isComplete) {
      return (
        <Alert 
          severity="success" 
          sx={{ 
            ...glassStyle,
            border: `1px solid ${theme.palette.success.main}30`,
            backgroundColor: theme.palette.success.light + '20'
          }}
        >
          <AlertTitle>Form Validation Complete</AlertTitle>
          All fields are properly filled and validated. You can now submit the form.
        </Alert>
      );
    }

    if (!hasErrors && !validationStatus.isComplete) {
      return (
        <Alert 
          severity="info"
          sx={{ 
            ...glassStyle,
            border: `1px solid ${theme.palette.info.main}30`,
            backgroundColor: theme.palette.info.light + '20'
          }}
        >
          <AlertTitle>Form In Progress</AlertTitle>
          Continue filling out the form fields. Validation will occur as you type.
        </Alert>
      );
    }

    return (
      <Box>
        {errorSummary.critical?.length > 0 && renderErrorGroup('critical', errorSummary.critical)}
        {errorSummary.high?.length > 0 && renderErrorGroup('high', errorSummary.high)}
        {errorSummary.medium?.length > 0 && renderErrorGroup('medium', errorSummary.medium)}
        {errorSummary.low?.length > 0 && renderErrorGroup('low', errorSummary.low)}
      </Box>
    );
  };

  // Render field status chips
  const renderFieldStatusChips = () => {
    if (compactMode || !showDetails) return null;

    const fieldStatuses = Object.entries(PICNIC_PARTICIPANT_CONFIG.fields).map(([fieldName, config]) => {
      const state = fieldValidationStates[fieldName];
      const hasError = errors[fieldName];
      
      let status = 'pending';
      let color = 'default';
      
      if (hasError) {
        status = 'error';
        color = 'error';
      } else if (state?.valid === true) {
        status = 'valid';
        color = 'success';
      } else if (state?.validating) {
        status = 'validating';
        color = 'info';
      }

      return (
        <Chip
          key={fieldName}
          label={config.label}
          size="small"
          color={color}
          variant={status === 'valid' ? 'filled' : 'outlined'}
          sx={{ m: 0.5 }}
          onClick={() => onFieldFocus?.(fieldName)}
        />
      );
    });

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Field Status:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
          {fieldStatuses}
        </Box>
      </Box>
    );
  };

  // Don't render if no validation data
  if (!validationStatus.totalFields && !errorSummary.total) {
    return null;
  }

  return (
    <Card sx={{ ...glassStyle, ...(className && { className }) }}>
      <CardContent sx={{ p: compactMode ? 2 : 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Validation Summary
          </Typography>
          {errorSummary.total > 0 && (
            <Chip
              label={`${errorSummary.total} issue${errorSummary.total !== 1 ? 's' : ''}`}
              color="error"
              size="small"
            />
          )}
        </Box>

        {/* Progress Section */}
        {renderProgressSection()}

        {/* Validation Summary */}
        {renderValidationSummary()}

        {/* Field Status Chips */}
        {renderFieldStatusChips()}
      </CardContent>
    </Card>
  );
};

export default PicnicParticipantFormValidationSummary;
