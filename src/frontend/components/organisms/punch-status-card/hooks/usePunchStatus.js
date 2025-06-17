/**
 * usePunchStatus Hook
 * 
 * Custom hook for managing punch status state and operations.
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { alpha } from '@mui/material/styles';
import { punchStatusUtils } from '../utils';

export const usePunchStatus = (user, config) => {
  // State management
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayPunches, setTodayPunches] = useState([]);
  const [totalWorkTime, setTotalWorkTime] = useState('00:00:00');
  const [realtimeWorkTime, setRealtimeWorkTime] = useState('00:00:00');
  const [userOnLeave, setUserOnLeave] = useState(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    ip: 'Unknown',
    accuracy: 'N/A',
    timestamp: null
  });

  /**
   * Calculate real-time work time
   */
  const calculateRealtimeWorkTime = useCallback((currentTime) => {
    let totalSeconds = 0;
    
    todayPunches.forEach((punch) => {
      if (punch.punchin_time) {
        const punchInTime = punchStatusUtils.parseDateTime(punch.punchin_time);
        
        if (punchInTime) {
          if (punch.punchout_time) {
            // Completed session
            const punchOutTime = punchStatusUtils.parseDateTime(punch.punchout_time);
            if (punchOutTime) {
              const sessionSeconds = Math.floor((punchOutTime - punchInTime) / 1000);
              if (sessionSeconds > 0) {
                totalSeconds += sessionSeconds;
              }
            }
          } else {
            // Current active session
            const sessionSeconds = Math.floor((currentTime - punchInTime) / 1000);
            if (sessionSeconds > 0) {
              totalSeconds += sessionSeconds;
            }
          }
        }
      }
    });
    
    const formattedTime = punchStatusUtils.formatDuration(totalSeconds);
    setRealtimeWorkTime(formattedTime);
  }, [todayPunches]);

  /**
   * Fetch current punch status
   */
  const fetchCurrentStatus = useCallback(async () => {
    try {
      const response = await axios.get(route('attendance.current-user-punch'));
      const data = response.data;
      
      setTodayPunches(data.punches || []);
      setTotalWorkTime(data.total_production_time || '00:00:00');
      setUserOnLeave(data.isUserOnLeave);
      
      // Determine current status
      if (data.punches && data.punches.length > 0) {
        const lastPunch = data.punches[data.punches.length - 1];
        const status = lastPunch.punchout_time ? 'punched_out' : 'punched_in';
        setCurrentStatus(status);
        
        // Initialize real-time calculation
        if (status === 'punched_in') {
          setTimeout(() => {
            calculateRealtimeWorkTime(new Date());
          }, 100);
        } else {
          const calculatedTime = punchStatusUtils.calculateTotalWorkTime(data.punches);
          setRealtimeWorkTime(calculatedTime);
        }
      } else {
        setCurrentStatus('not_punched');
        setRealtimeWorkTime('00:00:00');
      }
    } catch (error) {
      console.error('Error fetching current status:', error);
      toast.error('Failed to fetch attendance status');
      setRealtimeWorkTime('00:00:00');
    }
  }, [calculateRealtimeWorkTime]);

  /**
   * Handle punch in/out action
   */
  const handlePunch = useCallback(async (locationData) => {
    setLoading(true);

    try {
      const deviceFingerprint = punchStatusUtils.getDeviceFingerprint();
      
      let currentIp = 'Unknown';
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        currentIp = ipResponse.data.ip;
      } catch (ipError) {
        console.warn('Could not fetch IP address:', ipError);
      }
      
      // Update session info for dialog
      setSessionInfo({
        ip: currentIp,
        accuracy: locationData?.accuracy ? `${Math.round(locationData.accuracy)}m` : 'N/A',
        timestamp: new Date().toLocaleString()
      });
      
      const context = {
        lat: locationData?.latitude,
        lng: locationData?.longitude,
        accuracy: locationData?.accuracy,
        ip: currentIp,
        wifi_ssid: 'Unknown',
        device_fingerprint: JSON.stringify(deviceFingerprint),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(route('attendance.punch'), context);
      
      if (response.data.status === 'success') {
        toast.success(response.data.message, {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: alpha('#4caf50', 0.1),
            border: `1px solid ${alpha('#4caf50', 0.2)}`,
          }
        });
        
        setSessionDialogOpen(true);
        await fetchCurrentStatus();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error during punch operation:', error);
      toast.error(error.response?.data?.message || 'An error occurred during punch operation');
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentStatus]);

  /**
   * Real-time work time calculation effect
   */
  useEffect(() => {
    if (config.enableRealTimeTracking && currentStatus === 'punched_in' && todayPunches.length > 0) {
      const timer = setInterval(() => {
        calculateRealtimeWorkTime(new Date());
      }, config.refreshInterval || 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStatus, todayPunches, calculateRealtimeWorkTime, config]);

  /**
   * Initialize component
   */
  useEffect(() => {
    fetchCurrentStatus();
  }, [fetchCurrentStatus]);

  return {
    currentStatus,
    loading,
    todayPunches,
    totalWorkTime,
    realtimeWorkTime,
    userOnLeave,
    sessionDialogOpen,
    setSessionDialogOpen,
    sessionInfo,
    handlePunch,
    refreshStatus: fetchCurrentStatus
  };
};
