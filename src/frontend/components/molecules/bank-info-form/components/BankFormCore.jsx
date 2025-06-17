import React, { memo, useState } from 'react';
import {
  TextField,
  Box,
  Tooltip,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Key as KeyIcon
} from '@mui/icons-material';

/**
 * BankFormCore Component
 * 
 * Core form field component for banking information with:
 * - Field-specific styling and icons
 * - Data masking for sensitive fields
 * - Real-time validation feedback
 * - Loading states for async operations
 * - Accessibility compliance
 * 
 * @param {Object} props Component props
 * @param {string} props.name - Field name
 * @param {Function} props.register - React Hook Form register function
 * @param {Object} props.error - Field error object
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {Object} props.config - Field configuration
 * @param {boolean} props.masked - Whether to mask sensitive data
 * @param {boolean} props.loading - Loading state for async operations
 */
const BankFormCore = memo(({
  name,
  register,
  error,
  value,
  onChange,
  disabled = false,
  config = {},
  masked = false,
  loading = false
}) => {
  const theme = useTheme();
  const [showValue, setShowValue] = useState(false);

  const {
    label = '',
    placeholder = '',
    helpText = '',
    required = false,
    maxLength = null,
    type = 'text',
    autoComplete = 'off'
  } = config;

  // Handle field clearing
  const handleClear = () => {
    onChange?.('');
  };

  // Handle show/hide for sensitive fields
  const handleToggleVisibility = () => {
    setShowValue(!showValue);
  };

  // Get field icon based on field name
  const getFieldIcon = () => {
    switch (name) {
      case 'bank_name':
        return <BankIcon sx={{ opacity: 0.7 }} />;
      case 'bank_account_no':
        return <CardIcon sx={{ opacity: 0.7 }} />;
      case 'ifsc_code':
        return <BankIcon sx={{ opacity: 0.7 }} />;
      case 'pan_no':
        return <KeyIcon sx={{ opacity: 0.7 }} />;
      default:
        return null;
    }
  };

  // Check if field should be masked
  const isSensitiveField = name === 'bank_account_no' || name === 'pan_no';
  const shouldMask = masked && isSensitiveField && !showValue;

  // Mask sensitive data
  const getMaskedValue = (val) => {
    if (!shouldMask || !val) return val;
    
    if (name === 'bank_account_no') {
      // Show last 4 digits
      const visibleDigits = 4;
      if (val.length <= visibleDigits) return val;
      return '*'.repeat(val.length - visibleDigits) + val.slice(-visibleDigits);
    }
    
    if (name === 'pan_no') {
      // Show first 2 and last 1 characters
      if (val.length <= 3) return val;
      return val.slice(0, 2) + '*'.repeat(val.length - 3) + val.slice(-1);
    }
    
    return val;
  };

  // Build input adornments
  const buildStartAdornment = () => {
    const icon = getFieldIcon();
    if (!icon) return null;
    
    return (
      <InputAdornment position="start">
        {icon}
      </InputAdornment>
    );
  };

  const buildEndAdornment = () => {
    const adornments = [];

    // Loading indicator
    if (loading) {
      adornments.push(
        <CircularProgress 
          key="loading" 
          size={20} 
          sx={{ opacity: 0.6 }}
        />
      );
    }

    // Visibility toggle for sensitive fields
    if (isSensitiveField && value && !disabled) {
      adornments.push(
        <Tooltip key="visibility" title={showValue ? "Hide value" : "Show value"}>
          <IconButton
            size="small"
            onClick={handleToggleVisibility}
            sx={{ 
              opacity: 0.6,
              '&:hover': { opacity: 1 }
            }}
          >
            {showValue ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      );
    }

    // Clear button (if value exists and not disabled)
    if (value && !disabled && !loading) {
      adornments.push(
        <Tooltip key="clear" title="Clear field">
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{ 
              opacity: 0.6,
              '&:hover': { opacity: 1 }
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    // Help text tooltip
    if (helpText) {
      adornments.push(
        <Tooltip key="help" title={helpText} placement="top">
          <IconButton
            size="small"
            sx={{ 
              opacity: 0.6,
              '&:hover': { opacity: 1 }
            }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }

    if (adornments.length === 0) return null;

    return (
      <InputAdornment position="end">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {adornments}
        </Box>
      </InputAdornment>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        {...register(name)}
        name={name}
        label={label}
        placeholder={placeholder}
        value={getMaskedValue(value) || ''}
        onChange={(e) => {
          // For masked fields, only update if showing value
          if (shouldMask) return;
          onChange?.(e.target.value);
        }}
        error={!!error}
        helperText={error?.message || ''}
        disabled={disabled}
        required={required}
        type={type}
        autoComplete={autoComplete}
        fullWidth
        variant="outlined"
        inputProps={{
          maxLength: maxLength || undefined,
          'aria-describedby': helpText ? `${name}-help` : undefined,
          style: {
            fontFamily: (name === 'bank_account_no' || name === 'pan_no') ? 'monospace' : 'inherit'
          }
        }}
        InputProps={{
          startAdornment: buildStartAdornment(),
          endAdornment: buildEndAdornment(),
          sx: {
            // Glass morphism styling
            backdropFilter: 'blur(16px) saturate(200%)',
            backgroundColor: disabled 
              ? theme.glassCard.backgroundDisabled || 'rgba(255, 255, 255, 0.05)'
              : theme.glassCard.background || 'rgba(255, 255, 255, 0.1)',
            border: error 
              ? `1px solid ${theme.palette.error.main}`
              : theme.glassCard.border || '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: theme.shape.borderRadius,
            transition: theme.transitions.create([
              'border-color',
              'background-color',
              'box-shadow'
            ]),
            '&:hover': {
              borderColor: error 
                ? theme.palette.error.main
                : theme.palette.primary.main,
              backgroundColor: disabled 
                ? theme.glassCard.backgroundDisabled || 'rgba(255, 255, 255, 0.05)'
                : theme.glassCard.backgroundHover || 'rgba(255, 255, 255, 0.15)'
            },
            '&.Mui-focused': {
              borderColor: error 
                ? theme.palette.error.main
                : theme.palette.primary.main,
              backgroundColor: theme.glassCard.backgroundFocused || 'rgba(255, 255, 255, 0.2)',
              boxShadow: error
                ? `0 0 0 2px ${theme.palette.error.main}25`
                : `0 0 0 2px ${theme.palette.primary.main}25`
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary,
              '&::placeholder': {
                color: theme.palette.text.secondary,
                opacity: 0.7
              }
            }
          }
        }}
        FormHelperTextProps={{
          sx: {
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
            fontSize: '0.75rem',
            mt: 0.5
          }
        }}
        sx={{
          '& .MuiFormLabel-root': {
            color: theme.palette.text.secondary,
            '&.Mui-focused': {
              color: error ? theme.palette.error.main : theme.palette.primary.main
            },
            '&.Mui-error': {
              color: theme.palette.error.main
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none' // Using custom border in InputProps
          }
        }}
      />
      
      {/* Character count for fields with maxLength */}
      {maxLength && value && !shouldMask && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mt: 0.5,
            opacity: 0.7
          }}
        >
          <Typography 
            variant="caption" 
            color={value.length > maxLength * 0.9 ? 'warning.main' : 'text.secondary'}
          >
            {value.length}/{maxLength}
          </Typography>
        </Box>
      )}

      {/* Security notice for sensitive fields */}
      {isSensitiveField && value && (
        <Box sx={{ mt: 0.5 }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              opacity: 0.8
            }}
          >
            <KeyIcon fontSize="small" />
            This information is encrypted and secure
          </Typography>
        </Box>
      )}
    </Box>
  );
});

BankFormCore.displayName = 'BankFormCore';

export default BankFormCore;
