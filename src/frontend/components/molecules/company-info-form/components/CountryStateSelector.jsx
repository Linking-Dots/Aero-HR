import React, { memo } from 'react';
import {
  Grid,
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Public as CountryIcon,
  Place as StateIcon
} from '@mui/icons-material';

/**
 * CountryStateSelector Component
 * 
 * Advanced country and state selection component with:
 * - Dependent state loading based on country selection
 * - Search and autocomplete functionality
 * - Loading states and error handling
 * - Glass morphism design integration
 * - Accessibility compliance
 * - Real-time validation feedback
 * 
 * @param {Object} props Component props
 * @param {Array} props.countries - Available countries array
 * @param {Array} props.states - Available states for selected country
 * @param {string} props.selectedCountry - Currently selected country
 * @param {string} props.selectedState - Currently selected state
 * @param {Function} props.onCountryChange - Country change handler
 * @param {Function} props.onStateChange - State change handler
 * @param {boolean} props.loadingCountries - Countries loading state
 * @param {boolean} props.loadingStates - States loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {Object} props.errors - Validation errors for country and state
 * @param {Object} props.config - Configuration object
 */
const CountryStateSelector = memo(({
  countries = [],
  states = [],
  selectedCountry = '',
  selectedState = '',
  onCountryChange,
  onStateChange,
  loadingCountries = false,
  loadingStates = false,
  disabled = false,
  errors = {},
  config = {}
}) => {
  const theme = useTheme();

  // Find selected country and state objects
  const selectedCountryObj = countries.find(country => 
    country.name === selectedCountry || country.code === selectedCountry
  );
  
  const selectedStateObj = states.find(state => 
    state.name === selectedState || state.code === selectedState
  );

  // Handle country selection
  const handleCountrySelect = (event, newValue) => {
    const countryValue = newValue ? (newValue.name || newValue) : '';
    onCountryChange?.(countryValue);
  };

  // Handle state selection
  const handleStateSelect = (event, newValue) => {
    const stateValue = newValue ? (newValue.name || newValue) : '';
    onStateChange?.(stateValue);
  };

  // Common autocomplete styling
  const getAutocompleteStyles = (hasError = false) => ({
    '& .MuiOutlinedInput-root': {
      backdropFilter: 'blur(16px) saturate(200%)',
      backgroundColor: disabled 
        ? theme.glassCard.backgroundDisabled || 'rgba(255, 255, 255, 0.05)'
        : theme.glassCard.background || 'rgba(255, 255, 255, 0.1)',
      border: hasError 
        ? `1px solid ${theme.palette.error.main}`
        : theme.glassCard.border || '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: theme.shape.borderRadius,
      transition: theme.transitions.create([
        'border-color',
        'background-color',
        'box-shadow'
      ]),
      '&:hover': {
        borderColor: hasError 
          ? theme.palette.error.main
          : theme.palette.primary.main,
        backgroundColor: disabled 
          ? theme.glassCard.backgroundDisabled || 'rgba(255, 255, 255, 0.05)'
          : theme.glassCard.backgroundHover || 'rgba(255, 255, 255, 0.15)'
      },
      '&.Mui-focused': {
        borderColor: hasError 
          ? theme.palette.error.main
          : theme.palette.primary.main,
        backgroundColor: theme.glassCard.backgroundFocused || 'rgba(255, 255, 255, 0.2)',
        boxShadow: hasError
          ? `0 0 0 2px ${theme.palette.error.main}25`
          : `0 0 0 2px ${theme.palette.primary.main}25`
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none'
      },
      '& .MuiInputBase-input': {
        color: theme.palette.text.primary
      }
    },
    '& .MuiFormLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: hasError ? theme.palette.error.main : theme.palette.primary.main
      },
      '&.Mui-error': {
        color: theme.palette.error.main
      }
    }
  });

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationIcon color="primary" />
        <Typography variant="subtitle1" fontWeight="medium">
          Location Information
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Country Selection */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.name || option.label || '';
            }}
            value={selectedCountryObj || selectedCountry || null}
            onChange={handleCountrySelect}
            loading={loadingCountries}
            disabled={disabled || loadingCountries}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              const optionKey = option.name || option.code || option;
              const valueKey = value.name || value.code || value;
              return optionKey === valueKey;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                placeholder="Select a country"
                error={!!errors.country}
                helperText={errors.country?.message || ''}
                required
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <CountryIcon sx={{ mr: 1, opacity: 0.7 }} />,
                  endAdornment: (
                    <>
                      {loadingCountries && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  {option.flag && (
                    <Typography sx={{ fontSize: '1.2em' }}>
                      {option.flag}
                    </Typography>
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {option.name || option}
                    </Typography>
                    {option.code && (
                      <Typography variant="caption" color="text.secondary">
                        {option.code}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
            sx={getAutocompleteStyles(!!errors.country)}
          />
        </Grid>

        {/* State Selection */}
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={states}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.name || option.label || '';
            }}
            value={selectedStateObj || selectedState || null}
            onChange={handleStateSelect}
            loading={loadingStates}
            disabled={disabled || loadingStates || !selectedCountry}
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              const optionKey = option.name || option.code || option;
              const valueKey = value.name || value.code || value;
              return optionKey === valueKey;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State/Province"
                placeholder={selectedCountry ? "Select a state" : "Select country first"}
                error={!!errors.state}
                helperText={errors.state?.message || ''}
                required
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <StateIcon sx={{ mr: 1, opacity: 0.7 }} />,
                  endAdornment: (
                    <>
                      {loadingStates && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {option.name || option}
                    </Typography>
                    {option.code && (
                      <Typography variant="caption" color="text.secondary">
                        {option.code}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
            sx={getAutocompleteStyles(!!errors.state)}
          />
        </Grid>
      </Grid>

      {/* Selection Summary */}
      {(selectedCountry || selectedState) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Selected Location:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {selectedCountry && (
              <Chip
                label={selectedCountry}
                size="small"
                icon={<CountryIcon />}
                variant="outlined"
                sx={{ 
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            )}
            {selectedState && (
              <Chip
                label={selectedState}
                size="small"
                icon={<StateIcon />}
                variant="outlined"
                sx={{ 
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Loading States Information */}
      {(loadingCountries || loadingStates) && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            {loadingCountries ? 'Loading countries...' : 'Loading states...'}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

CountryStateSelector.displayName = 'CountryStateSelector';

export default CountryStateSelector;
