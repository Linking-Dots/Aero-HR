/**
 * Delete Daily Work Form Analytics Hook
 * 
 * Comprehensive analytics and tracking for daily work deletion with construction
 * project metrics, user behavior analysis, and security monitoring.
 * 
 * @module useDeleteDailyWorkFormAnalytics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { deleteDailyWorkFormConfig } from '../config.js';

/**
 * Custom hook for delete daily work form analytics
 * 
 * @param {Object} config - Analytics configuration
 * @param {string} config.sessionId - Unique session identifier
 * @param {string|number} config.workId - Daily work entry ID
 * @param {Object} config.workData - Daily work entry data
 * @param {Object} config.userData - Current user data
 * @param {boolean} config.enabled - Enable analytics tracking
 * @param {boolean} config.enablePerformanceTracking - Enable performance metrics
 * @param {boolean} config.enableSecurityTracking - Enable security event tracking
 * @param {Function} config.onEvent - Custom event handler
 * 
 * @returns {Object} Analytics state and tracking functions
 */
export const useDeleteDailyWorkFormAnalytics = ({
  sessionId = null,
  workId,
  workData = {},
  userData = {},
  enabled = true,
  enablePerformanceTracking = true,
  enableSecurityTracking = true,
  onEvent,
} = {}) => {
  // Analytics state
  const [analytics, setAnalytics] = useState({
    sessionId: sessionId || `delete-work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    startTime: Date.now(),
    events: [],
    metrics: {},
    userBehavior: {},
    securityEvents: [],
    performanceMetrics: {},
  });

  // Tracking refs
  const eventQueueRef = useRef([]);
  const performanceMarksRef = useRef(new Map());
  const interactionTimeoutRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());

  // Configuration
  const { eventCategories } = deleteDailyWorkFormConfig.analytics;

  // Event tracking
  const trackEvent = useCallback((eventType, data = {}) => {
    if (!enabled) return;

    const event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: Date.now(),
      sessionId: analytics.sessionId,
      workId,
      userId: userData.id,
      data: {
        ...data,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        url: window.location.href,
      },
    };

    // Add to event queue
    eventQueueRef.current.push(event);

    // Update analytics state
    setAnalytics(prev => ({
      ...prev,
      events: [...prev.events, event],
    }));

    // Call custom event handler
    onEvent?.(event);

    // Batch send events
    scheduleEventBatch();
  }, [enabled, analytics.sessionId, workId, userData.id, onEvent]);

  // Performance tracking
  const trackPerformance = useCallback((metricName, value, unit = 'ms') => {
    if (!enabled || !enablePerformanceTracking) return;

    const performanceData = {
      name: metricName,
      value,
      unit,
      timestamp: Date.now(),
      sessionId: analytics.sessionId,
    };

    setAnalytics(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        [metricName]: performanceData,
      },
    }));

    trackEvent(eventCategories.performance, {
      metric: metricName,
      value,
      unit,
    });
  }, [enabled, enablePerformanceTracking, analytics.sessionId, trackEvent, eventCategories.performance]);

  // Security event tracking
  const trackSecurityEvent = useCallback((eventType, details = {}) => {
    if (!enabled || !enableSecurityTracking) return;

    const securityEvent = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: analytics.sessionId,
      workId,
      userId: userData.id,
      details,
      severity: details.severity || 'medium',
    };

    setAnalytics(prev => ({
      ...prev,
      securityEvents: [...prev.securityEvents, securityEvent],
    }));

    trackEvent(eventCategories.security, securityEvent);
  }, [enabled, enableSecurityTracking, analytics.sessionId, workId, userData.id, trackEvent, eventCategories.security]);

  // User behavior tracking
  const trackUserBehavior = useCallback((action, context = {}) => {
    if (!enabled) return;

    const behaviorData = {
      action,
      context,
      timestamp: Date.now(),
      sessionDuration: Date.now() - analytics.startTime,
    };

    setAnalytics(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        [action]: behaviorData,
      },
    }));

    trackEvent(eventCategories.interaction, behaviorData);
  }, [enabled, analytics.startTime, analytics.sessionId, trackEvent, eventCategories.interaction]);

  // Specific tracking functions
  const trackFormStart = useCallback(() => {
    trackEvent('form_start', {
      workType: workData.work_type,
      projectId: workData.project_id,
      createdBy: workData.created_by,
      workStatus: workData.status,
    });
    
    trackUserBehavior('deletion_initiated', {
      workId,
      workAge: workData.created_at ? Date.now() - new Date(workData.created_at).getTime() : 0,
    });
  }, [trackEvent, trackUserBehavior, workData, workId]);

  const trackStepChange = useCallback((newStep, previousStep, formData) => {
    const stepChangeData = {
      fromStep: previousStep,
      toStep: newStep,
      direction: newStep > previousStep ? 'forward' : 'backward',
      stepDuration: Date.now() - lastInteractionRef.current,
      formCompleteness: calculateFormCompleteness(formData),
    };

    trackEvent('step_change', stepChangeData);
    trackUserBehavior('navigation', stepChangeData);
    
    lastInteractionRef.current = Date.now();
  }, [trackEvent, trackUserBehavior]);

  const trackFieldInteraction = useCallback((fieldName, fieldType, action) => {
    const interactionData = {
      field: fieldName,
      type: fieldType,
      action, // 'focus', 'blur', 'change', 'error'
      timestamp: Date.now(),
    };

    trackEvent('field_interaction', interactionData);
    
    // Track time between interactions
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    
    interactionTimeoutRef.current = setTimeout(() => {
      trackUserBehavior('interaction_pause', {
        duration: Date.now() - lastInteractionRef.current,
        lastField: fieldName,
      });
    }, 5000);
    
    lastInteractionRef.current = Date.now();
  }, [trackEvent, trackUserBehavior]);

  const trackValidationError = useCallback((errors, step) => {
    const errorData = {
      errors: Object.keys(errors),
      errorCount: Object.keys(errors).length,
      step,
      errorTypes: categorizeErrors(errors),
    };

    trackEvent('validation_error', errorData);
    trackUserBehavior('validation_failure', errorData);
  }, [trackEvent, trackUserBehavior]);

  const trackDeletionAttempt = useCallback((success, reason, errorMessage) => {
    const attemptData = {
      success,
      reason,
      errorMessage,
      sessionDuration: Date.now() - analytics.startTime,
      totalEvents: analytics.events.length,
    };

    trackEvent('deletion_attempt', attemptData);
    
    if (success) {
      trackUserBehavior('deletion_completed', attemptData);
    } else {
      trackUserBehavior('deletion_failed', attemptData);
      trackSecurityEvent('deletion_failure', { reason: errorMessage });
    }
  }, [trackEvent, trackUserBehavior, trackSecurityEvent, analytics.startTime, analytics.events.length]);

  const trackAbandon = useCallback((step, reason) => {
    const abandonData = {
      step,
      reason,
      sessionDuration: Date.now() - analytics.startTime,
      completionPercentage: ((step + 1) / deleteDailyWorkFormConfig.steps.length) * 100,
    };

    trackEvent('form_abandon', abandonData);
    trackUserBehavior('abandonment', abandonData);
  }, [trackEvent, trackUserBehavior, analytics.startTime]);

  // Performance marks
  const startPerformanceMark = useCallback((markName) => {
    if (!enablePerformanceTracking) return;
    
    performanceMarksRef.current.set(markName, Date.now());
    
    if (performance.mark) {
      performance.mark(`delete-work-${markName}-start`);
    }
  }, [enablePerformanceTracking]);

  const endPerformanceMark = useCallback((markName) => {
    if (!enablePerformanceTracking) return;
    
    const startTime = performanceMarksRef.current.get(markName);
    if (startTime) {
      const duration = Date.now() - startTime;
      trackPerformance(markName, duration);
      performanceMarksRef.current.delete(markName);
      
      if (performance.mark && performance.measure) {
        performance.mark(`delete-work-${markName}-end`);
        performance.measure(
          `delete-work-${markName}`,
          `delete-work-${markName}-start`,
          `delete-work-${markName}-end`
        );
      }
    }
  }, [enablePerformanceTracking, trackPerformance]);

  // Analytics data processing
  const getAnalyticsSummary = useCallback(() => {
    const events = analytics.events;
    const sessionDuration = Date.now() - analytics.startTime;
    
    return {
      sessionId: analytics.sessionId,
      sessionDuration,
      totalEvents: events.length,
      eventsByType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      securityEventCount: analytics.securityEvents.length,
      performanceMetrics: Object.keys(analytics.performanceMetrics).length,
      userBehaviorPatterns: Object.keys(analytics.userBehavior).length,
    };
  }, [analytics]);

  const getDeletionInsights = useCallback(() => {
    const events = analytics.events;
    const deletionEvents = events.filter(e => e.type.includes('deletion'));
    
    return {
      totalAttempts: deletionEvents.filter(e => e.type === 'deletion_attempt').length,
      successfulDeletions: deletionEvents.filter(e => 
        e.type === 'deletion_attempt' && e.data.success
      ).length,
      mostCommonReason: getMostCommonReason(events),
      averageCompletionTime: getAverageCompletionTime(events),
      abandonnmentRate: getAbandonmentRate(events),
    };
  }, [analytics.events]);

  // Helper functions
  const calculateFormCompleteness = useCallback((formData) => {
    const totalFields = Object.keys(deleteDailyWorkFormConfig.fields).length;
    const completedFields = Object.values(formData).filter(value => 
      value !== '' && value !== false && value !== null && value !== undefined
    ).length;
    
    return Math.round((completedFields / totalFields) * 100);
  }, []);

  const categorizeErrors = useCallback((errors) => {
    const categories = { required: 0, format: 0, business: 0, security: 0 };
    
    Object.values(errors).forEach(error => {
      if (error.includes('required')) categories.required++;
      else if (error.includes('format') || error.includes('exactly')) categories.format++;
      else if (error.includes('permission') || error.includes('cannot')) categories.business++;
      else if (error.includes('security')) categories.security++;
    });
    
    return categories;
  }, []);

  const getMostCommonReason = useCallback((events) => {
    const reasonEvents = events.filter(e => e.type === 'form_start');
    const reasons = reasonEvents.map(e => e.data.reason).filter(Boolean);
    
    if (reasons.length === 0) return null;
    
    const reasonCounts = reasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(reasonCounts).sort(([,a], [,b]) => b - a)[0]?.[0];
  }, []);

  const getAverageCompletionTime = useCallback((events) => {
    const completedSessions = events.filter(e => 
      e.type === 'deletion_attempt' && e.data.success
    );
    
    if (completedSessions.length === 0) return 0;
    
    const totalDuration = completedSessions.reduce((sum, event) => 
      sum + event.data.sessionDuration, 0
    );
    
    return Math.round(totalDuration / completedSessions.length);
  }, []);

  const getAbandonmentRate = useCallback((events) => {
    const startEvents = events.filter(e => e.type === 'form_start').length;
    const completionEvents = events.filter(e => 
      e.type === 'deletion_attempt' && e.data.success
    ).length;
    
    if (startEvents === 0) return 0;
    
    return Math.round(((startEvents - completionEvents) / startEvents) * 100);
  }, []);

  // Batch event sending
  const scheduleEventBatch = useCallback(() => {
    // In a real implementation, this would send events to analytics service
    // For now, we'll just log them
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event Queue:', eventQueueRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Analytics state
    analytics,
    
    // Core tracking functions
    trackEvent,
    trackPerformance,
    trackSecurityEvent,
    trackUserBehavior,
    
    // Specific tracking functions
    trackFormStart,
    trackStepChange,
    trackFieldInteraction,
    trackValidationError,
    trackDeletionAttempt,
    trackAbandon,
    
    // Performance tracking
    startPerformanceMark,
    endPerformanceMark,
    
    // Analytics insights
    getAnalyticsSummary,
    getDeletionInsights,
    
    // Configuration
    enabled,
    sessionId: analytics.sessionId,
  };
};

export default useDeleteDailyWorkFormAnalytics;
