/**
 * useLocationTracking Hook
 * 
 * Custom hook for managing geolocation tracking.
 */

import { useState, useCallback } from 'react';

export const useLocationTracking = (enabled = true) => {
  const [locationData, setLocationData] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  /**
   * Request current location
   */
  const requestLocation = useCallback(() => {
    if (!enabled || !navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setIsRequesting(true);
    setLocationError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocationData(data);
          setIsRequesting(false);
          resolve(data);
        },
        (error) => {
          let errorMessage = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
          }
          
          setLocationError(errorMessage);
          setIsRequesting(false);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    });
  }, [enabled]);

  return {
    locationData,
    locationError,
    isRequesting,
    requestLocation
  };
};
