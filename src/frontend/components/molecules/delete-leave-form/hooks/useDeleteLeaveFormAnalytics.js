/**
 * Delete Leave Form Analytics Hook
 * Advanced analytics and tracking for leave deletion operations
 * 
 * Features:
 * - User behavior analytics
 * - Deletion pattern analysis
 * - Performance metrics tracking
 * - Security compliance monitoring
 * - Accessibility usage tracking
 * - Business intelligence insights
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { DELETE_LEAVE_FORM_CONFIG } from '../config';

/**
 * Analytics hook for delete leave form operations
 * @param {Object} options - Hook configuration
 * @param {Object} options.leaveData - Leave data being deleted
 * @param {Object} options.userPermissions - User permissions
 * @param {boolean} options.enableTracking - Enable analytics tracking
 * @param {Function} options.onAnalyticsUpdate - Analytics update callback
 * @returns {Object} - Analytics hook interface
 */
export const useDeleteLeaveFormAnalytics = (options = {}) => {
  const {
    leaveData = null,
    userPermissions = null,
    enableTracking = true,
    onAnalyticsUpdate = () => {},
    config = DELETE_LEAVE_FORM_CONFIG
  } = options;

  // Analytics state
  const [analyticsState, setAnalyticsState] = useState({
    // Session tracking
    sessionId: `del_leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionStartTime: null,
    sessionEndTime: null,
    sessionDuration: 0,
    
    // User behavior
    interactions: [],
    interactionCount: 0,
    mostUsedActions: {},
    userHesitationTime: 0,
    
    // Form completion metrics
    formStartTime: null,
    formCompletionTime: null,
    timeToDecision: 0,
    confirmationAttempts: 0,
    reasonChanges: 0,
    
    // Security metrics
    securityChallengesPassed: 0,
    securityChallengesFailed: 0,
    confirmationAccuracy: 0,
    
    // Deletion patterns
    deletionType: null,
    deletionReason: null,
    deletionFrequency: 0,
    cascadeDeletionUsage: 0,
    
    // Performance metrics
    validationCount: 0,
    averageValidationTime: 0,
    errorResolutionTime: 0,
    
    // Business intelligence
    leaveTypeDistribution: {},
    deletionTrends: {},
    userRoleAnalysis: {},
    
    // Accessibility metrics
    keyboardUsage: 0,
    screenReaderUsage: 0,
    focusTraversalCount: 0
  });

  // Refs for tracking
  const interactionTimestampsRef = useRef([]);
  const hesitationTimerRef = useRef(null);
  const lastInteractionTimeRef = useRef(null);
  const analyticsBufferRef = useRef([]);
  const performanceMetricsRef = useRef({
    validationTimes: [],
    errorCounts: [],
    completionTimes: []
  });

  /**
   * Initialize analytics session
   */
  const initializeSession = useCallback(() => {
    if (!enableTracking) return;

    const sessionStartTime = Date.now();
    
    setAnalyticsState(prev => ({
      ...prev,
      sessionStartTime,
      formStartTime: sessionStartTime
    }));

    // Track session start
    trackEvent('session_started', {
      leaveId: leaveData?.id,
      leaveType: leaveData?.type,
      leaveStatus: leaveData?.status,
      userRole: userPermissions?.role,
      hasDeletePermission: userPermissions?.canDeleteOwnLeaves || userPermissions?.canDeleteAnyLeaves
    });
  }, [enableTracking, leaveData, userPermissions]);

  /**
   * Track user interaction events
   */
  const trackEvent = useCallback((eventType, eventData = {}) => {
    if (!enableTracking) return;

    const timestamp = Date.now();
    const interaction = {
      type: eventType,
      timestamp,
      data: eventData,
      sessionId: analyticsState.sessionId
    };

    // Update interaction tracking
    setAnalyticsState(prev => {
      const newInteractions = [...prev.interactions, interaction];
      const interactionCount = newInteractions.length;
      
      // Update most used actions
      const mostUsedActions = { ...prev.mostUsedActions };
      mostUsedActions[eventType] = (mostUsedActions[eventType] || 0) + 1;
      
      // Calculate hesitation time
      let userHesitationTime = prev.userHesitationTime;
      if (lastInteractionTimeRef.current) {
        const timeSinceLastInteraction = timestamp - lastInteractionTimeRef.current;
        if (timeSinceLastInteraction > 3000) { // 3 seconds hesitation threshold
          userHesitationTime += timeSinceLastInteraction;
        }
      }
      
      lastInteractionTimeRef.current = timestamp;
      
      return {
        ...prev,
        interactions: newInteractions,
        interactionCount,
        mostUsedActions,
        userHesitationTime
      };
    });

    // Buffer analytics for batch processing
    analyticsBufferRef.current.push(interaction);
    
    // Process buffer if it gets too large
    if (analyticsBufferRef.current.length >= 10) {
      processAnalyticsBuffer();
    }

    onAnalyticsUpdate(interaction);
  }, [enableTracking, analyticsState.sessionId, onAnalyticsUpdate]);

  /**
   * Track form field interactions
   */
  const trackFieldInteraction = useCallback((field, action, value = null) => {
    trackEvent('field_interaction', {
      field,
      action, // focus, blur, change, validation_error, validation_success
      value: typeof value === 'string' ? value.substring(0, 50) : value, // Truncate for privacy
      timestamp: Date.now()
    });

    // Track specific field analytics
    if (field === 'confirmation') {
      setAnalyticsState(prev => ({
        ...prev,
        confirmationAttempts: action === 'change' ? prev.confirmationAttempts + 1 : prev.confirmationAttempts
      }));
    }

    if (field === 'reason') {
      setAnalyticsState(prev => ({
        ...prev,
        reasonChanges: action === 'change' ? prev.reasonChanges + 1 : prev.reasonChanges
      }));
    }
  }, [trackEvent]);

  /**
   * Track security challenge results
   */
  const trackSecurityChallenge = useCallback((challengeType, passed, attempts = 1) => {
    trackEvent('security_challenge', {
      challengeType,
      passed,
      attempts,
      timestamp: Date.now()
    });

    setAnalyticsState(prev => ({
      ...prev,
      securityChallengesPassed: passed ? prev.securityChallengesPassed + 1 : prev.securityChallengesPassed,
      securityChallengesFailed: !passed ? prev.securityChallengesFailed + 1 : prev.securityChallengesFailed,
      confirmationAccuracy: prev.confirmationAttempts > 0 ? 
        (prev.securityChallengesPassed / prev.confirmationAttempts) * 100 : 100
    }));
  }, [trackEvent]);

  /**
   * Track validation performance
   */
  const trackValidationPerformance = useCallback((validationTime, errorCount, field = null) => {
    performanceMetricsRef.current.validationTimes.push(validationTime);
    performanceMetricsRef.current.errorCounts.push(errorCount);

    const averageValidationTime = performanceMetricsRef.current.validationTimes.reduce((a, b) => a + b, 0) / 
                                 performanceMetricsRef.current.validationTimes.length;

    setAnalyticsState(prev => ({
      ...prev,
      validationCount: prev.validationCount + 1,
      averageValidationTime
    }));

    trackEvent('validation_performance', {
      validationTime,
      errorCount,
      field,
      averageValidationTime
    });
  }, [trackEvent]);

  /**
   * Track deletion completion
   */
  const trackDeletionCompletion = useCallback((deletionData) => {
    const completionTime = Date.now();
    const timeToDecision = completionTime - (analyticsState.formStartTime || completionTime);

    setAnalyticsState(prev => ({
      ...prev,
      formCompletionTime: completionTime,
      timeToDecision,
      deletionType: deletionData.deleteType,
      deletionReason: deletionData.reason,
      sessionEndTime: completionTime,
      sessionDuration: completionTime - (prev.sessionStartTime || completionTime)
    }));

    trackEvent('deletion_completed', {
      timeToDecision,
      deletionType: deletionData.deleteType,
      reasonProvided: !!deletionData.reason,
      reasonLength: deletionData.reason?.length || 0,
      cascadeDelete: deletionData.cascadeDelete,
      notifyUser: deletionData.notifyUser,
      confirmationAttempts: analyticsState.confirmationAttempts,
      validationCount: analyticsState.validationCount
    });

    // Update business intelligence
    updateBusinessIntelligence(deletionData);
  }, [analyticsState, trackEvent]);

  /**
   * Track deletion cancellation
   */
  const trackDeletionCancellation = useCallback((reason = 'user_cancelled') => {
    const cancellationTime = Date.now();
    const timeBeforeCancellation = cancellationTime - (analyticsState.formStartTime || cancellationTime);

    setAnalyticsState(prev => ({
      ...prev,
      sessionEndTime: cancellationTime,
      sessionDuration: cancellationTime - (prev.sessionStartTime || cancellationTime)
    }));

    trackEvent('deletion_cancelled', {
      reason,
      timeBeforeCancellation,
      interactionCount: analyticsState.interactionCount,
      confirmationAttempts: analyticsState.confirmationAttempts,
      reasonChanges: analyticsState.reasonChanges
    });
  }, [analyticsState, trackEvent]);

  /**
   * Track accessibility usage
   */
  const trackAccessibilityUsage = useCallback((usageType, details = {}) => {
    setAnalyticsState(prev => {
      const updates = { ...prev };
      
      switch (usageType) {
        case 'keyboard_navigation':
          updates.keyboardUsage += 1;
          break;
        case 'screen_reader':
          updates.screenReaderUsage += 1;
          break;
        case 'focus_traversal':
          updates.focusTraversalCount += 1;
          break;
      }
      
      return updates;
    });

    trackEvent('accessibility_usage', {
      usageType,
      ...details
    });
  }, [trackEvent]);

  /**
   * Update business intelligence metrics
   */
  const updateBusinessIntelligence = useCallback((deletionData) => {
    setAnalyticsState(prev => {
      const leaveType = leaveData?.type || 'unknown';
      const userRole = userPermissions?.role || 'unknown';
      
      // Update leave type distribution
      const leaveTypeDistribution = { ...prev.leaveTypeDistribution };
      leaveTypeDistribution[leaveType] = (leaveTypeDistribution[leaveType] || 0) + 1;
      
      // Update user role analysis
      const userRoleAnalysis = { ...prev.userRoleAnalysis };
      if (!userRoleAnalysis[userRole]) {
        userRoleAnalysis[userRole] = {
          deletions: 0,
          averageDecisionTime: 0,
          mostCommonReason: null
        };
      }
      userRoleAnalysis[userRole].deletions += 1;
      userRoleAnalysis[userRole].averageDecisionTime = 
        (userRoleAnalysis[userRole].averageDecisionTime + prev.timeToDecision) / 2;
      
      // Update deletion trends
      const today = new Date().toISOString().split('T')[0];
      const deletionTrends = { ...prev.deletionTrends };
      if (!deletionTrends[today]) {
        deletionTrends[today] = {
          count: 0,
          types: {},
          averageTime: 0
        };
      }
      deletionTrends[today].count += 1;
      deletionTrends[today].types[deletionData.deleteType] = 
        (deletionTrends[today].types[deletionData.deleteType] || 0) + 1;
      deletionTrends[today].averageTime = 
        (deletionTrends[today].averageTime + prev.timeToDecision) / deletionTrends[today].count;
      
      return {
        ...prev,
        leaveTypeDistribution,
        userRoleAnalysis,
        deletionTrends,
        deletionFrequency: prev.deletionFrequency + 1,
        cascadeDeletionUsage: deletionData.cascadeDelete ? prev.cascadeDeletionUsage + 1 : prev.cascadeDeletionUsage
      };
    });
  }, [leaveData, userPermissions]);

  /**
   * Process analytics buffer
   */
  const processAnalyticsBuffer = useCallback(() => {
    if (analyticsBufferRef.current.length === 0) return;

    // Process batch analytics
    const events = [...analyticsBufferRef.current];
    analyticsBufferRef.current = [];

    // Send to analytics service or process locally
    trackEvent('batch_analytics', {
      eventCount: events.length,
      eventTypes: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      timespan: events.length > 1 ? 
        events[events.length - 1].timestamp - events[0].timestamp : 0
    });
  }, [trackEvent]);

  /**
   * Get analytics summary
   */
  const getAnalyticsSummary = useCallback(() => {
    const summary = {
      session: {
        id: analyticsState.sessionId,
        duration: analyticsState.sessionDuration,
        interactionCount: analyticsState.interactionCount,
        completed: !!analyticsState.formCompletionTime
      },
      performance: {
        timeToDecision: analyticsState.timeToDecision,
        validationCount: analyticsState.validationCount,
        averageValidationTime: analyticsState.averageValidationTime,
        confirmationAccuracy: analyticsState.confirmationAccuracy
      },
      behavior: {
        hesitationTime: analyticsState.userHesitationTime,
        mostUsedActions: analyticsState.mostUsedActions,
        reasonChanges: analyticsState.reasonChanges,
        confirmationAttempts: analyticsState.confirmationAttempts
      },
      security: {
        challengesPassed: analyticsState.securityChallengesPassed,
        challengesFailed: analyticsState.securityChallengesFailed,
        accuracy: analyticsState.confirmationAccuracy
      },
      accessibility: {
        keyboardUsage: analyticsState.keyboardUsage,
        screenReaderUsage: analyticsState.screenReaderUsage,
        focusTraversalCount: analyticsState.focusTraversalCount
      },
      business: {
        leaveTypeDistribution: analyticsState.leaveTypeDistribution,
        deletionTrends: analyticsState.deletionTrends,
        userRoleAnalysis: analyticsState.userRoleAnalysis
      }
    };

    return summary;
  }, [analyticsState]);

  /**
   * Export analytics data
   */
  const exportAnalyticsData = useCallback(() => {
    return {
      ...analyticsState,
      interactions: analyticsState.interactions,
      performanceMetrics: performanceMetricsRef.current,
      exportTimestamp: Date.now()
    };
  }, [analyticsState]);

  /**
   * Reset analytics state
   */
  const resetAnalytics = useCallback(() => {
    setAnalyticsState({
      sessionId: `del_leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionStartTime: null,
      sessionEndTime: null,
      sessionDuration: 0,
      interactions: [],
      interactionCount: 0,
      mostUsedActions: {},
      userHesitationTime: 0,
      formStartTime: null,
      formCompletionTime: null,
      timeToDecision: 0,
      confirmationAttempts: 0,
      reasonChanges: 0,
      securityChallengesPassed: 0,
      securityChallengesFailed: 0,
      confirmationAccuracy: 0,
      deletionType: null,
      deletionReason: null,
      deletionFrequency: 0,
      cascadeDeletionUsage: 0,
      validationCount: 0,
      averageValidationTime: 0,
      errorResolutionTime: 0,
      leaveTypeDistribution: {},
      deletionTrends: {},
      userRoleAnalysis: {},
      keyboardUsage: 0,
      screenReaderUsage: 0,
      focusTraversalCount: 0
    });

    performanceMetricsRef.current = {
      validationTimes: [],
      errorCounts: [],
      completionTimes: []
    };

    analyticsBufferRef.current = [];
    interactionTimestampsRef.current = [];
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Process remaining analytics buffer on unmount
  useEffect(() => {
    return () => {
      processAnalyticsBuffer();
    };
  }, [processAnalyticsBuffer]);

  // Return hook interface
  return {
    // State
    analyticsState,
    
    // Tracking methods
    trackEvent,
    trackFieldInteraction,
    trackSecurityChallenge,
    trackValidationPerformance,
    trackDeletionCompletion,
    trackDeletionCancellation,
    trackAccessibilityUsage,
    
    // Utility methods
    getAnalyticsSummary,
    exportAnalyticsData,
    resetAnalytics,
    initializeSession,
    
    // Performance metrics
    performanceMetrics: performanceMetricsRef.current
  };
};

export default useDeleteLeaveFormAnalytics;
