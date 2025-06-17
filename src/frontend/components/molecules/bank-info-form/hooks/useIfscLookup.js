import { useState, useCallback, useRef } from 'react';

/**
 * useIfscLookup Hook
 * 
 * Manages IFSC code lookup functionality with:
 * - Real-time IFSC verification
 * - Bank and branch information retrieval
 * - Loading states and error handling
 * - Request debouncing and cancellation
 * - Cache management for performance
 * 
 * @param {Object} options Hook configuration
 * @param {Object} options.config - Configuration object
 * @param {number} options.debounceMs - Debounce delay in milliseconds
 * @param {boolean} options.enableCache - Enable response caching
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds
 */
export const useIfscLookup = ({
  config = {},
  debounceMs = 500,
  enableCache = true,
  cacheExpiry = 300000 // 5 minutes
}) => {
  // State management
  const [branchDetails, setBranchDetails] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Refs for managing requests and cache
  const lookupTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  // Check if cached data is still valid
  const isCacheValid = useCallback((timestamp) => {
    if (!enableCache || !timestamp) return false;
    return Date.now() - timestamp < cacheExpiry;
  }, [enableCache, cacheExpiry]);

  // Clear lookup data
  const clearLookupData = useCallback(() => {
    setBranchDetails(null);
    setLookupError(null);
    setIsLookingUp(false);
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear timeout
    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
      lookupTimeoutRef.current = null;
    }
  }, []);

  // Perform IFSC lookup
  const performIfscLookup = useCallback(async (ifscCode) => {
    if (!ifscCode || ifscCode.length !== 11) {
      clearLookupData();
      return;
    }

    // Basic format validation
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(ifscCode)) {
      setLookupError({
        message: 'Invalid IFSC format',
        type: 'format'
      });
      return;
    }

    // Check cache first
    const cacheKey = ifscCode.toUpperCase();
    const cachedData = cacheRef.current.get(cacheKey);
    
    if (cachedData && isCacheValid(cachedData.timestamp)) {
      setBranchDetails(cachedData.data);
      setLookupError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timeout
    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
    }

    // Debounce the lookup
    lookupTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLookingUp(true);
        setLookupError(null);
        setBranchDetails(null);

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Make API request
        const response = await fetch('/api/banking/ifsc-lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          },
          body: JSON.stringify({ ifsc_code: ifscCode }),
          signal: abortControllerRef.current.signal
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'IFSC lookup failed');
        }

        // Process response data
        const branchInfo = {
          bankName: data.bank_name || data.bank || 'Unknown Bank',
          branchName: data.branch_name || data.branch || 'Unknown Branch',
          city: data.city || '',
          district: data.district || '',
          state: data.state || '',
          address: data.address || '',
          contact: data.contact || '',
          centre: data.centre || '',
          district: data.district || '',
          state: data.state || ''
        };

        // Cache the result
        if (enableCache) {
          cacheRef.current.set(cacheKey, {
            data: branchInfo,
            timestamp: Date.now()
          });
        }

        setBranchDetails(branchInfo);
        setLookupError(null);

      } catch (error) {
        // Don't set error if request was aborted
        if (error.name !== 'AbortError') {
          console.error('IFSC lookup error:', error);
          
          setLookupError({
            message: error.message || 'Unable to verify IFSC code',
            type: error.name === 'TypeError' ? 'network' : 'lookup'
          });
          
          setBranchDetails(null);
        }
      } finally {
        setIsLookingUp(false);
        abortControllerRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs, enableCache, isCacheValid, clearLookupData]);

  // Get cache status
  const getCacheStatus = useCallback(() => {
    return {
      size: cacheRef.current.size,
      keys: Array.from(cacheRef.current.keys())
    };
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    clearLookupData();
    clearCache();
  }, [clearLookupData, clearCache]);

  return {
    // State
    branchDetails,
    isLookingUp,
    lookupError,
    
    // Actions
    performIfscLookup,
    clearLookupData,
    
    // Cache management
    getCacheStatus,
    clearCache,
    cleanup
  };
};

export default useIfscLookup;
