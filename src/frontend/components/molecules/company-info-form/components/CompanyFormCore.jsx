import React, { memo } from 'react';
import {
  TextField,
  Box,
  Tooltip,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

/**
 * CompanyFormCore Component
 * 
 * Core form field component for company information with:
 * - Unified field styling and behavior
 * - Real-time validation feedback
 * - Glass morphism design integration
 * - Accessibility compliance
 * - Tooltips and help text
 * 
 * @param {Object} props Component props
 * @param {string} props.name - Field name
 * @param {Function} props.register - React Hook Form register function
 * @param {Object} props.error - Field error object
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {Object} props.config - Field configuration
 * @param {boolean} props.multiline - Multiline input flag
 * @param {number} props.rows - Number of rows for multiline
 * @param {React.ReactNode} props.startAdornment - Start input adornment
 * @param {React.ReactNode} props.endAdornment - End input adornment
 * @param {string} props.type - Input type
 */
const CompanyFormCore = memo(({
  name,
  register,
  error,
  value,
  onChange,
  disabled = false,
  config = {},
  multiline = false,
  rows = 1,
  startAdornment = null,
  endAdornment = null,
  type = 'text'
}) => {
  const theme = useTheme();

  const {
    label = '',
    placeholder = '',
    helpText = '',
    required = false,
    maxLength = null,
    autoComplete = 'off'
  } = config;

  // Handle field clearing
  const handleClear = () => {
    onChange?.('');
  };

  // Build input adornments
  const buildStartAdornment = () => {
    if (!startAdornment) return null;
    
    return (
      <InputAdornment position="start">
        {startAdornment}
      </InputAdornment>
    );
  };

  const buildEndAdornment = () => {
    const adornments = [];

    // Clear button (if value exists and not disabled)
    if (value && !disabled && !multiline) {
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

    // Custom end adornment
    if (endAdornment) {
      adornments.push(endAdornment);
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
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        error={!!error}
        helperText={error?.message || ''}
        disabled={disabled}
        required={required}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        type={type}
        autoComplete={autoComplete}
        fullWidth
        variant="outlined"
        inputProps={{
          maxLength: maxLength || undefined,
          'aria-describedby': helpText ? `${name}-help` : undefined
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
      {maxLength && value && (
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
    </Box>
  );
});

CompanyFormCore.displayName = 'CompanyFormCore';

export default CompanyFormCore;
