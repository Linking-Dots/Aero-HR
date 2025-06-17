/**
 * useUpdatesData Hook
 * 
 * Custom hook for managing updates data fetching and state.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useUpdatesData = (refreshInterval = 300000) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [upcomingHoliday, setUpcomingHoliday] = useState(null);

  /**
   * Fetch updates data from API
   */
  const fetchUpdates = useCallback(async () => {
    let isMounted = true;
    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(route('updates'), {
        signal: controller.signal,
        timeout: 10000
      });
      
      if (isMounted && response.data) {
        setUsers(response.data.users || []);
        setTodayLeaves(response.data.todayLeaves || []);
        setUpcomingLeaves(response.data.upcomingLeaves || []);
        setUpcomingHoliday(response.data.upcomingHoliday || null);
      }
    } catch (err) {
      if (isMounted && !controller.signal.aborted) {
        console.error('Failed to fetch updates:', err);
        setError(err.message);
        // Set safe defaults on error
        setUsers([]);
        setTodayLeaves([]);
        setUpcomingLeaves([]);
        setUpcomingHoliday(null);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  /**
   * Initial data fetch and periodic refresh
   */
  useEffect(() => {
    fetchUpdates();

    // Set up periodic refresh if interval is provided
    if (refreshInterval > 0) {
      const interval = setInterval(fetchUpdates, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchUpdates, refreshInterval]);

  return {
    loading,
    error,
    users,
    todayLeaves,
    upcomingLeaves,
    upcomingHoliday,
    refreshData
  };
};
