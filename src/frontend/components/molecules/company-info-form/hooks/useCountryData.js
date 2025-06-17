import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useCountryData Hook
 * 
 * Manages country and state data with:
 * - Country list loading and caching
 * - State list loading based on country selection
 * - Search and filtering capabilities
 * - Loading states and error handling
 * - Data caching for performance
 * - Dependency management between country/state
 * 
 * @param {Object} options Hook configuration
 * @param {string} options.initialCountry - Initial country selection
 * @param {string} options.initialState - Initial state selection
 * @param {Object} options.config - Configuration object
 * @param {boolean} options.enableCaching - Enable data caching
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds
 */
export const useCountryData = ({
  initialCountry = '',
  initialState = '',
  config = {},
  enableCaching = true,
  cacheExpiry = 300000 // 5 minutes
}) => {
  // Data state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedState, setSelectedState] = useState(initialState);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [error, setError] = useState(null);

  // Cache management
  const cacheRef = useRef({
    countries: { data: null, timestamp: null },
    states: {}
  });

  // Check if cached data is still valid
  const isCacheValid = useCallback((timestamp) => {
    if (!enableCaching || !timestamp) return false;
    return Date.now() - timestamp < cacheExpiry;
  }, [enableCaching, cacheExpiry]);

  // Load countries data
  const loadCountries = useCallback(async () => {
    try {
      setLoadingCountries(true);
      setError(null);

      // Check cache first
      const cachedCountries = cacheRef.current.countries;
      if (cachedCountries.data && isCacheValid(cachedCountries.timestamp)) {
        setCountries(cachedCountries.data);
        return cachedCountries.data;
      }

      // Load from API
      const response = await fetch('/api/countries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load countries: ${response.statusText}`);
      }

      const data = await response.json();
      const countriesData = data.countries || data.data || data;

      // Process and sort countries
      const processedCountries = countriesData
        .map(country => ({
          name: country.name || country.country_name || country,
          code: country.code || country.country_code || '',
          flag: country.flag || country.emoji || '',
          phoneCode: country.phone_code || country.calling_code || ''
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Update cache
      if (enableCaching) {
        cacheRef.current.countries = {
          data: processedCountries,
          timestamp: Date.now()
        };
      }

      setCountries(processedCountries);
      return processedCountries;
    } catch (error) {
      console.error('Error loading countries:', error);
      setError(error.message);
      
      // Fallback to basic country list
      const fallbackCountries = [
        { name: 'United States', code: 'US', flag: '🇺🇸' },
        { name: 'Canada', code: 'CA', flag: '🇨🇦' },
        { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
        { name: 'Germany', code: 'DE', flag: '🇩🇪' },
        { name: 'France', code: 'FR', flag: '🇫🇷' },
        { name: 'Australia', code: 'AU', flag: '🇦🇺' },
        { name: 'India', code: 'IN', flag: '🇮🇳' },
        { name: 'China', code: 'CN', flag: '🇨🇳' },
        { name: 'Japan', code: 'JP', flag: '🇯🇵' },
        { name: 'Brazil', code: 'BR', flag: '🇧🇷' }
      ];
      
      setCountries(fallbackCountries);
      return fallbackCountries;
    } finally {
      setLoadingCountries(false);
    }
  }, [enableCaching, isCacheValid]);

  // Load states for a specific country
  const loadStatesForCountry = useCallback(async (countryName) => {
    if (!countryName) {
      setStates([]);
      return [];
    }

    try {
      setLoadingStates(true);
      setError(null);

      // Check cache first
      const cachedStates = cacheRef.current.states[countryName];
      if (cachedStates && isCacheValid(cachedStates.timestamp)) {
        setStates(cachedStates.data);
        return cachedStates.data;
      }

      // Load from API
      const response = await fetch(`/api/countries/${encodeURIComponent(countryName)}/states`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load states for ${countryName}: ${response.statusText}`);
      }

      const data = await response.json();
      const statesData = data.states || data.data || data;

      // Process and sort states
      const processedStates = statesData
        .map(state => ({
          name: state.name || state.state_name || state,
          code: state.code || state.state_code || '',
          country: countryName
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Update cache
      if (enableCaching) {
        cacheRef.current.states[countryName] = {
          data: processedStates,
          timestamp: Date.now()
        };
      }

      setStates(processedStates);
      return processedStates;
    } catch (error) {
      console.error(`Error loading states for ${countryName}:`, error);
      setError(error.message);
      
      // Clear states on error
      setStates([]);
      return [];
    } finally {
      setLoadingStates(false);
    }
  }, [enableCaching, isCacheValid]);

  // Find country by name or code
  const getCountryByName = useCallback((nameOrCode) => {
    return countries.find(country => 
      country.name === nameOrCode || 
      country.code === nameOrCode ||
      country.name.toLowerCase() === nameOrCode.toLowerCase()
    );
  }, [countries]);

  // Find state by name or code
  const getStateByName = useCallback((nameOrCode) => {
    return states.find(state => 
      state.name === nameOrCode || 
      state.code === nameOrCode ||
      state.name.toLowerCase() === nameOrCode.toLowerCase()
    );
  }, [states]);

  // Handle country change
  const handleCountryChange = useCallback(async (countryName) => {
    setSelectedCountry(countryName);
    setSelectedState(''); // Clear state when country changes
    
    if (countryName) {
      await loadStatesForCountry(countryName);
    } else {
      setStates([]);
    }
  }, [loadStatesForCountry]);

  // Handle state change
  const handleStateChange = useCallback((stateName) => {
    setSelectedState(stateName);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current = {
      countries: { data: null, timestamp: null },
      states: {}
    };
  }, []);

  // Get cache status
  const getCacheStatus = useCallback(() => {
    return {
      countries: {
        cached: !!cacheRef.current.countries.data,
        valid: isCacheValid(cacheRef.current.countries.timestamp)
      },
      states: Object.keys(cacheRef.current.states).length
    };
  }, [isCacheValid]);

  // Load initial data
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  // Load states when initial country is set
  useEffect(() => {
    if (initialCountry && countries.length > 0) {
      loadStatesForCountry(initialCountry);
    }
  }, [initialCountry, countries.length, loadStatesForCountry]);

  // Update selected country when initial country changes
  useEffect(() => {
    if (initialCountry !== selectedCountry) {
      handleCountryChange(initialCountry);
    }
  }, [initialCountry, selectedCountry, handleCountryChange]);

  // Update selected state when initial state changes
  useEffect(() => {
    if (initialState !== selectedState) {
      setSelectedState(initialState);
    }
  }, [initialState, selectedState]);

  return {
    // Data
    countries,
    states,
    selectedCountry,
    selectedState,
    
    // Loading states
    loadingCountries,
    loadingStates,
    error,
    
    // Actions
    loadCountries,
    loadStatesForCountry,
    handleCountryChange,
    handleStateChange,
    
    // Utilities
    getCountryByName,
    getStateByName,
    clearCache,
    getCacheStatus
  };
};

export default useCountryData;
