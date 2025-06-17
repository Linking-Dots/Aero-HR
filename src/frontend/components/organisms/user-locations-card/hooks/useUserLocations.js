/**
 * useUserLocations Hook
 * 
 * Custom hook for managing user location data and statistics.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export const useUserLocations = (selectedDate) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user locations for selected date
   */
  const fetchUserLocations = useCallback(async () => {
    if (!selectedDate) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = route('getUserLocationsForDate', { date: selectedDate });
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch user locations`);
      }

      const data = await response.json();
      const locations = Array.isArray(data.locations) ? data.locations : [];
      
      setUsers(locations);
    } catch (error) {
      console.error('Error fetching user locations:', error);
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);
  /**
   * Calculate user statistics
   */
  const userStats = useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        averageDistance: 0,
        checkInsToday: 0,
        lastUpdate: null
      };
    }

    // Group locations by user_id to get unique users
    const userGroups = users.reduce((acc, location) => {
      const userId = location.user_id || location.id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(location);
      return acc;
    }, {});

    // Calculate stats based on unique users
    const uniqueUsers = Object.keys(userGroups);
    const totalUsers = uniqueUsers.length;
    
    let activeUsers = 0;
    let checkInsToday = 0;
    let totalDistance = 0;
    let usersWithDistance = 0;
    let lastUpdate = null;

    // Office coordinates for distance calculation (from config)
    const officeLocation = {
      lat: 40.7128, // Default NYC coordinates - should come from config
      lng: -74.0060
    };

    uniqueUsers.forEach(userId => {
      const userLocations = userGroups[userId];
      
      // Sort by timestamp to get chronological order
      userLocations.sort((a, b) => {
        const timeA = a.punchin_time || a.timestamp || a.created_at;
        const timeB = b.punchin_time || b.timestamp || b.created_at;
        
        if (!timeA) return 1;
        if (!timeB) return -1;
        return new Date(timeA) - new Date(timeB);
      });

      // Get the last location entry for this user
      const lastLocation = userLocations[userLocations.length - 1];
      
      // Check if user has any activity today
      const hasActivity = userLocations.some(loc => {
        return loc.punchin_time || loc.status === 'active' || loc.status === 'checked_in';
      });
      
      if (hasActivity) {
        activeUsers++;
      }

      // Count check-ins
      const checkInCount = userLocations.filter(loc => loc.punchin_time).length;
      checkInsToday += checkInCount;

      // Calculate distance from office if location exists
      if (lastLocation && lastLocation.lat && lastLocation.lng) {
        const distance = calculateDistance(
          officeLocation.lat,
          officeLocation.lng,
          parseFloat(lastLocation.lat),
          parseFloat(lastLocation.lng)
        );
        
        if (!isNaN(distance)) {
          totalDistance += distance;
          usersWithDistance++;
        }
      }

      // Track latest update
      const locationTime = lastLocation.punchin_time || lastLocation.timestamp || lastLocation.created_at;
      if (locationTime) {
        const updateTime = new Date(locationTime);
        if (!lastUpdate || updateTime > lastUpdate) {
          lastUpdate = updateTime;
        }
      }
    });

    const averageDistance = usersWithDistance > 0 ? totalDistance / usersWithDistance : 0;

    return {
      totalUsers,
      activeUsers,
      averageDistance: Math.round(averageDistance * 100) / 100, // Round to 2 decimal places
      checkInsToday,
      lastUpdate: lastUpdate ? lastUpdate.toISOString() : null
    };
  }, [users]);

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Convert degrees to radians
   */
  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  /**
   * Format selected date for display
   */
  const formattedDate = useMemo(() => {
    if (!selectedDate) return 'Invalid Date';
    
    try {
      return new Date(selectedDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, [selectedDate]);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(() => {
    fetchUserLocations();
  }, [fetchUserLocations]);

  /**
   * Initialize data fetching
   */
  useEffect(() => {
    fetchUserLocations();
  }, [fetchUserLocations]);

  return {
    users,
    loading,
    error,
    userStats,
    formattedDate,
    refreshData
  };
};
