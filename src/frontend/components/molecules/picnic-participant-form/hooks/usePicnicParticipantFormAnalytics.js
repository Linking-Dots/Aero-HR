// filepath: src/frontend/components/molecules/picnic-participant-form/hooks/usePicnicParticipantFormAnalytics.js

/**
 * usePicnicParticipantFormAnalytics Hook
 * 
 * Comprehensive analytics tracking for picnic participant forms
 * Monitors user behavior, team selection patterns, completion rates, and performance metrics
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { PICNIC_PARTICIPANT_CONFIG } from '../config';

export const usePicnicParticipantFormAnalytics = (formData, options = {}) => {
  const {
    enabled = PICNIC_PARTICIPANT_CONFIG.analytics.enabled,
    trackUserBehavior = true,
    trackTeamPreferences = true,
    trackPaymentPatterns = true,
    trackPerformance = true,
    onAnalyticsEvent,
    sessionId = `picnic_form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  } = options;

  // Analytics state
  const [sessionData, setSessionData] = useState({
    sessionId,
    startTime: new Date().toISOString(),
    userId: null,
    device: getDeviceInfo(),
    browser: getBrowserInfo()
  });

  const [userBehavior, setUserBehavior] = useState({
    fieldInteractions: {},
    formSections: {},
    navigationPattern: [],
    hesitationPoints: [],
    errorRecoveryTime: []
  });

  const [teamAnalytics, setTeamAnalytics] = useState({
    teamSelectionHistory: [],
    teamPreferences: {},
    selectionReasons: [],
    teamSwitchCount: 0
  });

  const [paymentAnalytics, setPaymentAnalytics] = useState({
    amountChanges: [],
    paymentHesitation: [],
    discountUsage: [],
    finalAmount: null
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    formStartTime: Date.now(),
    sectionCompletionTimes: {},
    totalFormTime: null,
    validationTime: 0,
    errorCount: 0,
    correctionTime: []
  });

  // Refs for tracking
  const interactionTimers = useRef(new Map());
  const lastInteraction = useRef(null);
  const formEvents = useRef([]);

  // Device and browser detection utilities
  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet|Kindle|Silk/i.test(userAgent);
    
    return {
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      userAgent: userAgent.substring(0, 100), // Truncate for privacy
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';
    
    return {
      name: browserName,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Track form event
  const trackEvent = useCallback((eventType, eventData = {}) => {
    if (!enabled) return;

    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      sessionId,
      data: eventData
    };

    formEvents.current.push(event);
    
    // Trigger external analytics handler
    if (onAnalyticsEvent) {
      onAnalyticsEvent(event);
    }

    // Update relevant analytics state based on event type
    switch (eventType) {
      case 'field_focus':
        trackFieldInteraction(eventData.fieldName, 'focus');
        break;
      case 'field_blur':
        trackFieldInteraction(eventData.fieldName, 'blur');
        break;
      case 'field_change':
        trackFieldChange(eventData.fieldName, eventData.value, eventData.previousValue);
        break;
      case 'team_selection':
        trackTeamSelection(eventData.team, eventData.previousTeam);
        break;
      case 'payment_change':
        trackPaymentChange(eventData.amount, eventData.previousAmount);
        break;
      case 'validation_error':
        trackValidationError(eventData.fieldName, eventData.error);
        break;
    }
  }, [enabled, sessionId, onAnalyticsEvent]);

  // Track field interactions
  const trackFieldInteraction = useCallback((fieldName, interactionType) => {
    const now = Date.now();
    
    if (interactionType === 'focus') {
      interactionTimers.current.set(fieldName, now);
      lastInteraction.current = { fieldName, type: 'focus', time: now };
    } else if (interactionType === 'blur') {
      const focusTime = interactionTimers.current.get(fieldName);
      if (focusTime) {
        const duration = now - focusTime;
        
        setUserBehavior(prev => ({
          ...prev,
          fieldInteractions: {
            ...prev.fieldInteractions,
            [fieldName]: {
              ...prev.fieldInteractions[fieldName],
              totalTime: (prev.fieldInteractions[fieldName]?.totalTime || 0) + duration,
              focusCount: (prev.fieldInteractions[fieldName]?.focusCount || 0) + 1,
              lastInteraction: now
            }
          }
        }));
        
        // Track hesitation (long focus time without changes)
        if (duration > 10000) { // 10 seconds
          setUserBehavior(prev => ({
            ...prev,
            hesitationPoints: [...prev.hesitationPoints, {
              fieldName,
              duration,
              timestamp: now
            }]
          }));
        }
      }
    }
  }, []);

  // Track field value changes
  const trackFieldChange = useCallback((fieldName, newValue, previousValue) => {
    const now = Date.now();
    
    setUserBehavior(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          changeCount: (prev.fieldInteractions[fieldName]?.changeCount || 0) + 1,
          lastChange: now,
          valueHistory: [
            ...(prev.fieldInteractions[fieldName]?.valueHistory || []),
            { value: newValue, timestamp: now }
          ]
        }
      }
    }));

    // Track corrections (multiple rapid changes)
    if (lastInteraction.current && 
        lastInteraction.current.fieldName === fieldName &&
        now - lastInteraction.current.time < 2000) {
      
      setPerformanceMetrics(prev => ({
        ...prev,
        correctionTime: [...prev.correctionTime, {
          fieldName,
          correctionDuration: now - lastInteraction.current.time,
          timestamp: now
        }]
      }));
    }
    
    lastInteraction.current = { fieldName, type: 'change', time: now };
  }, []);

  // Track team selection patterns
  const trackTeamSelection = useCallback((newTeam, previousTeam) => {
    if (!trackTeamPreferences) return;

    setTeamAnalytics(prev => {
      const selectionHistory = [...prev.teamSelectionHistory, {
        team: newTeam,
        previousTeam,
        timestamp: new Date().toISOString(),
        selectionOrder: prev.teamSelectionHistory.length + 1
      }];

      return {
        ...prev,
        teamSelectionHistory: selectionHistory,
        teamSwitchCount: previousTeam && previousTeam !== newTeam ? prev.teamSwitchCount + 1 : prev.teamSwitchCount,
        teamPreferences: {
          ...prev.teamPreferences,
          [newTeam]: (prev.teamPreferences[newTeam] || 0) + 1
        }
      };
    });
  }, [trackTeamPreferences]);

  // Track payment behavior
  const trackPaymentChange = useCallback((newAmount, previousAmount) => {
    if (!trackPaymentPatterns) return;

    setPaymentAnalytics(prev => ({
      ...prev,
      amountChanges: [...prev.amountChanges, {
        amount: newAmount,
        previousAmount,
        timestamp: new Date().toISOString(),
        changeType: newAmount > previousAmount ? 'increase' : 'decrease'
      }],
      finalAmount: newAmount
    }));

    // Track payment hesitation (multiple amount changes)
    const recentChanges = paymentAnalytics.amountChanges.filter(
      change => Date.now() - new Date(change.timestamp).getTime() < 30000 // 30 seconds
    );
    
    if (recentChanges.length > 2) {
      setPaymentAnalytics(prev => ({
        ...prev,
        paymentHesitation: [...prev.paymentHesitation, {
          changesInPeriod: recentChanges.length + 1,
          timestamp: new Date().toISOString()
        }]
      }));
    }
  }, [trackPaymentPatterns, paymentAnalytics.amountChanges]);

  // Track validation errors
  const trackValidationError = useCallback((fieldName, error) => {
    const now = Date.now();
    
    setPerformanceMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));

    // Track error recovery time
    const fieldInteraction = userBehavior.fieldInteractions[fieldName];
    if (fieldInteraction?.lastChange) {
      const recoveryTime = now - fieldInteraction.lastChange;
      setPerformanceMetrics(prev => ({
        ...prev,
        errorRecoveryTime: [...prev.errorRecoveryTime, {
          fieldName,
          error,
          recoveryTime,
          timestamp: now
        }]
      }));
    }
  }, [userBehavior.fieldInteractions]);

  // Calculate form analytics summary
  const analyticsSummary = useMemo(() => {
    const now = Date.now();
    const formDuration = now - performanceMetrics.formStartTime;
    
    // User engagement metrics
    const totalInteractions = Object.values(userBehavior.fieldInteractions)
      .reduce((sum, field) => sum + (field.changeCount || 0), 0);
    
    const averageFieldTime = Object.values(userBehavior.fieldInteractions)
      .reduce((sum, field) => sum + (field.totalTime || 0), 0) / 
      Object.keys(userBehavior.fieldInteractions).length || 0;

    // Team preferences analysis
    const mostPreferredTeam = Object.entries(teamAnalytics.teamPreferences)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Payment behavior analysis
    const averagePaymentChange = paymentAnalytics.amountChanges.length > 0 ?
      paymentAnalytics.amountChanges.reduce((sum, change) => 
        sum + Math.abs(change.amount - (change.previousAmount || 0)), 0
      ) / paymentAnalytics.amountChanges.length : 0;

    // Performance analysis
    const errorRate = performanceMetrics.errorCount / Math.max(totalInteractions, 1);
    const averageErrorRecoveryTime = performanceMetrics.errorRecoveryTime.length > 0 ?
      performanceMetrics.errorRecoveryTime.reduce((sum, recovery) => 
        sum + recovery.recoveryTime, 0
      ) / performanceMetrics.errorRecoveryTime.length : 0;

    return {
      session: {
        duration: formDuration,
        formattedDuration: formatDuration(formDuration),
        completed: false // Will be updated on form submission
      },
      engagement: {
        totalInteractions,
        averageFieldTime,
        hesitationCount: userBehavior.hesitationPoints.length,
        navigationChanges: userBehavior.navigationPattern.length
      },
      teamPreferences: {
        mostPreferred: mostPreferredTeam,
        switchCount: teamAnalytics.teamSwitchCount,
        selectionSpeed: calculateSelectionSpeed()
      },
      paymentBehavior: {
        changeCount: paymentAnalytics.amountChanges.length,
        averageChange: averagePaymentChange,
        hesitationCount: paymentAnalytics.paymentHesitation.length,
        finalAmount: paymentAnalytics.finalAmount
      },
      performance: {
        errorRate,
        errorCount: performanceMetrics.errorCount,
        averageErrorRecoveryTime,
        validationTime: performanceMetrics.validationTime
      }
    };
  }, [userBehavior, teamAnalytics, paymentAnalytics, performanceMetrics]);

  // Helper function to format duration
  const formatDuration = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Calculate team selection speed
  const calculateSelectionSpeed = () => {
    if (teamAnalytics.teamSelectionHistory.length < 2) return null;
    
    const firstSelection = new Date(teamAnalytics.teamSelectionHistory[0].timestamp);
    const lastSelection = new Date(teamAnalytics.teamSelectionHistory[teamAnalytics.teamSelectionHistory.length - 1].timestamp);
    
    return lastSelection.getTime() - firstSelection.getTime();
  };

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    return {
      session: sessionData,
      userBehavior,
      teamAnalytics,
      paymentAnalytics,
      performanceMetrics,
      summary: analyticsSummary,
      events: formEvents.current,
      exportedAt: new Date().toISOString()
    };
  }, [sessionData, userBehavior, teamAnalytics, paymentAnalytics, performanceMetrics, analyticsSummary]);

  // Form completion tracking
  const markFormComplete = useCallback((submissionData = {}) => {
    const completionEvent = {
      type: 'form_complete',
      timestamp: new Date().toISOString(),
      sessionId,
      submissionData,
      summary: analyticsSummary
    };

    trackEvent('form_complete', completionEvent);
    
    setPerformanceMetrics(prev => ({
      ...prev,
      totalFormTime: Date.now() - prev.formStartTime
    }));
  }, [sessionId, analyticsSummary, trackEvent]);

  // Initialize analytics tracking
  useEffect(() => {
    if (enabled) {
      trackEvent('form_start', { formType: 'picnic_participant' });
    }
  }, [enabled, trackEvent]);

  return {
    // Analytics data
    sessionData,
    userBehavior,
    teamAnalytics,
    paymentAnalytics,
    performanceMetrics,
    analyticsSummary,
    
    // Tracking functions
    trackEvent,
    trackFieldInteraction,
    trackTeamSelection,
    trackPaymentChange,
    trackValidationError,
    markFormComplete,
    
    // Utilities
    exportAnalytics,
    isTrackingEnabled: enabled,
    sessionId
  };
};

export default usePicnicParticipantFormAnalytics;
