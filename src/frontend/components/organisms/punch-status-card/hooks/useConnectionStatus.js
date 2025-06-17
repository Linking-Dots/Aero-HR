/**
 * useConnectionStatus Hook
 * 
 * Custom hook for monitoring connection status.
 */

import { useState, useEffect, useCallback } from 'react';

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    location: false,
    network: navigator.onLine,
    device: true
  });

  /**
   * Check network status
   */
  const checkNetworkStatus = useCallback(() => {
    setConnectionStatus(prev => ({
      ...prev,
      network: navigator.onLine
    }));
  }, []);

  /**
   * Check all connections
   */
  const checkConnections = useCallback(() => {
    checkNetworkStatus();
    // Additional connection checks can be added here
  }, [checkNetworkStatus]);

  /**
   * Update location status
   */
  const updateLocationStatus = useCallback((hasLocation) => {
    setConnectionStatus(prev => ({
      ...prev,
      location: hasLocation
    }));
  }, []);

  /**
   * Setup network listeners
   */
  useEffect(() => {
    const handleOnline = () => checkNetworkStatus();
    const handleOffline = () => checkNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetworkStatus]);

  return {
    connectionStatus,
    checkConnections,
    updateLocationStatus
  };
};
