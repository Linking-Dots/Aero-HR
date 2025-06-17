// filepath: src/frontend/components/molecules/picnic-participant-form/components/PicnicParticipantFormCore.jsx

/**
 * PicnicParticipantFormCore Component
 * 
 * Core form component for picnic participant registration
 * Features glass morphism design, team selection, and payment management
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  Euro as EuroIcon,
  ExpandMore as ExpandMoreIcon,
  Casino as CasinoIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { PICNIC_PARTICIPANT_CONFIG } from '../config';

const PicnicParticipantFormCore = ({
  formData,
  errors = {},
  fieldValidationStates = {},
  updateField,
  generateNewRandomNumber,
  teamSuggestions,
  onFieldFocus,
  onFieldBlur,
  disabled = false,
  layout = 'accordion'
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    participant: true,
    assignment: true,
    payment: true
  });

  // Handle accordion section toggle
  const handleSectionToggle = useCallback((sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  }, []);

  // Format phone number as user types
  const formatPhoneNumber = useCallback((value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +91 XXXXX XXXXX
    if (digits.length >= 10) {
      return `+91 ${digits.slice(-10, -5)} ${digits.slice(-5)}`;
    } else if (digits.length >= 5) {
      return `+91 ${digits.slice(-10, -5)} ${digits.slice(-5)}`;
    } else if (digits.length > 0) {
      return `+91 ${digits}`;
    }
    return '';
  }, []);

  // Handle phone number change with formatting
  const handlePhoneChange = useCallback((event) => {
    const formatted = formatPhoneNumber(event.target.value);
    updateField('phone', formatted);
  }, [formatPhoneNumber, updateField]);

  // Handle currency formatting
  const handleAmountChange = useCallback((event) => {
    const value = event.target.value.replace(/[^\d.]/g, '');
    const numericValue = parseFloat(value) || 0;
    updateField('payment_amount', numericValue);
  }, [updateField]);

  // Get field error helper
  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName] || null;
  }, [errors]);

  // Get field validation state
  const getFieldValidationState = useCallback((fieldName) => {
    const state = fieldValidationStates[fieldName];
    if (!state) return {};
    
    return {
      error: !state.valid && state.error,
      helperText: state.error,
      color: state.valid === false ? 'error' : state.valid === true ? 'success' : 'primary'
    };
  }, [fieldValidationStates]);

  // Team options with color indicators
  const teamOptions = useMemo(() => {
    return PICNIC_PARTICIPANT_CONFIG.fields.team.options.map(option => ({
      ...option,
      colorStyle: {
        backgroundColor: option.color + '20',
        borderLeft: `4px solid ${option.color}`,
        color: option.color
      }
    }));
  }, []);

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

  // Render participant information section
  const renderParticipantSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Participant Name"
          variant="outlined"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          onFocus={() => onFieldFocus?.('name')}
          onBlur={() => onFieldBlur?.('name')}
          disabled={disabled}
          placeholder="Enter participant full name"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            )
          }}
          {...getFieldValidationState('name')}
          helperText={getFieldError('name') || 'Enter the full name of the picnic participant'}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Contact Number"
          variant="outlined"
          value={formData.phone || ''}
          onChange={handlePhoneChange}
          onFocus={() => onFieldFocus?.('phone')}
          onBlur={() => onFieldBlur?.('phone')}
          disabled={disabled}
          placeholder="+91 XXXXX XXXXX"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon color="action" />
              </InputAdornment>
            )
          }}
          {...getFieldValidationState('phone')}
          helperText={getFieldError('phone') || 'Enter a valid Indian mobile number'}
        />
      </Grid>
    </Grid>
  );

  // Render team assignment section
  const renderAssignmentSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Team Assignment</InputLabel>
          <Select
            value={formData.team || ''}
            onChange={(e) => updateField('team', e.target.value)}
            onFocus={() => onFieldFocus?.('team')}
            onBlur={() => onFieldBlur?.('team')}
            disabled={disabled}
            label="Team Assignment"
            startAdornment={
              <InputAdornment position="start">
                <GroupIcon color="action" />
              </InputAdornment>
            }
            {...getFieldValidationState('team')}
          >
            <MenuItem value="" disabled>
              <em>Select your team</em>
            </MenuItem>
            {teamOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: option.color,
                      marginRight: 2
                    }}
                  />
                  <Typography>{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error={!!getFieldError('team')}>
            {getFieldError('team') || 'Choose a team for group activities'}
          </FormHelperText>
        </FormControl>

        {/* Team suggestions */}
        {teamSuggestions && teamSuggestions.recommended && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Suggested team for better balance:
            </Typography>
            <Chip
              label={teamSuggestions.recommended}
              size="small"
              variant="outlined"
              sx={{ ml: 1 }}
              onClick={() => updateField('team', teamSuggestions.recommended)}
            />
          </Box>
        )}
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Lucky Number"
          variant="outlined"
          value={formData.random_number || ''}
          disabled={true}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CasinoIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Generate new lucky number">
                  <IconButton
                    onClick={generateNewRandomNumber}
                    disabled={disabled}
                    size="small"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
          {...getFieldValidationState('random_number')}
          helperText="Your unique number for games and prizes"
        />
      </Grid>
    </Grid>
  );

  // Render payment section
  const renderPaymentSection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contribution Amount"
          variant="outlined"
          type="number"
          value={formData.payment_amount || ''}
          onChange={handleAmountChange}
          onFocus={() => onFieldFocus?.('payment_amount')}
          onBlur={() => onFieldBlur?.('payment_amount')}
          disabled={disabled}
          inputProps={{
            min: 0,
            max: 10000,
            step: 50
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="body2" color="text.secondary">₹</Typography>
              </InputAdornment>
            )
          }}
          {...getFieldValidationState('payment_amount')}
          helperText={getFieldError('payment_amount') || 'Enter amount in multiples of ₹50'}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ ...glassStyle, height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Payment Summary
            </Typography>
            <Typography variant="h6" color="primary">
              ₹{formData.payment_amount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total contribution amount
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Accordion layout
  if (layout === 'accordion') {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Participant Information */}
        <Accordion 
          expanded={expandedSections.participant}
          onChange={() => handleSectionToggle('participant')}
          sx={glassStyle}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Participant Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {renderParticipantSection()}
          </AccordionDetails>
        </Accordion>

        {/* Team Assignment */}
        <Accordion 
          expanded={expandedSections.assignment}
          onChange={() => handleSectionToggle('assignment')}
          sx={{ ...glassStyle, mt: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
              <Typography variant="h6">Team & Game Assignment</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {renderAssignmentSection()}
          </AccordionDetails>
        </Accordion>

        {/* Payment Information */}
        <Accordion 
          expanded={expandedSections.payment}
          onChange={() => handleSectionToggle('payment')}
          sx={{ ...glassStyle, mt: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PaymentIcon sx={{ mr: 1, color: theme.palette.success.main }} />
              <Typography variant="h6">Payment Information</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {renderPaymentSection()}
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }

  // Standard layout
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Participant Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          Participant Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {renderParticipantSection()}
      </Box>

      {/* Team Assignment */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
          Team & Game Assignment
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {renderAssignmentSection()}
      </Box>

      {/* Payment Information */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentIcon sx={{ mr: 1, color: theme.palette.success.main }} />
          Payment Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {renderPaymentSection()}
      </Box>
    </Box>
  );
};

export default PicnicParticipantFormCore;
