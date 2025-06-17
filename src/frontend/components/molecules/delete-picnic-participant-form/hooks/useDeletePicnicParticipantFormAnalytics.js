import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for tracking delete picnic participant form analytics
 * 
 * Features:
 * - GDPR-compliant analytics tracking
 * - Deletion process monitoring
 * - Security event tracking
 * - Performance metrics
 * - User behavior analysis
 * - Event management insights
 */
export const useDeletePicnicParticipantFormAnalytics = (
  participantData = null,
  eventData = null,
  options = {}
) => {
  const {
    enableAnalytics = true,
    trackingLevel = 'standard', // 'minimal', 'standard', 'detailed'
    gdprCompliant = true,
    sessionTimeout = 30 * 60 * 1000, // 30 minutes
    batchSize = 10
  } = options;

  // Analytics state
  const [sessionId] = useState(() => `del_participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [analyticsData, setAnalyticsData] = useState({
    sessionStartTime: Date.now(),
    events: [],
    performance: {},
    security: {},
    userBehavior: {},
    completion: {}
  });
  const [isTracking, setIsTracking] = useState(enableAnalytics);

  // Performance tracking
  const performanceRef = useRef({
    startTime: Date.now(),
    stepTimes: {},
    validationTimes: {},
    securityCheckTimes: {}
  });

  // Event queue for batch processing
  const eventQueue = useRef([]);
  const batchTimeoutRef = useRef(null);

  // Track form session start
  const trackSessionStart = useCallback(() => {
    if (!isTracking) return;

    const event = {
      type: 'delete_participant_session_start',
      timestamp: Date.now(),
      sessionId,
      data: {
        participantId: participantData?.id,
        participantName: gdprCompliant ? '[REDACTED]' : participantData?.name,
        eventId: eventData?.id,
        eventName: gdprCompliant ? '[REDACTED]' : eventData?.name,
        trackingLevel,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown'
      }
    };

    queueEvent(event);
  }, [isTracking, sessionId, participantData, eventData, gdprCompliant, trackingLevel]);

  // Track step navigation
  const trackStepChange = useCallback((fromStep, toStep, method = 'navigation') => {
    if (!isTracking) return;

    const currentTime = Date.now();
    const stepDuration = performanceRef.current.stepTimes[fromStep] 
      ? currentTime - performanceRef.current.stepTimes[fromStep]
      : 0;

    performanceRef.current.stepTimes[toStep] = currentTime;

    const event = {
      type: 'delete_participant_step_change',
      timestamp: currentTime,
      sessionId,
      data: {
        fromStep,
        toStep,
        method, // 'navigation', 'validation', 'auto'
        stepDuration,
        totalTime: currentTime - performanceRef.current.startTime
      }
    };

    queueEvent(event);

    // Update analytics data
    setAnalyticsData(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        stepTransitions: [...(prev.userBehavior.stepTransitions || []), {
          from: fromStep,
          to: toStep,
          method,
          duration: stepDuration,
          timestamp: currentTime
        }]
      }
    }));
  }, [isTracking, sessionId]);

  // Track validation events
  const trackValidation = useCallback((type, field = null, result = {}) => {
    if (!isTracking) return;

    const currentTime = Date.now();
    const validationStart = performanceRef.current.validationTimes[`${type}_${field}`];
    const validationDuration = validationStart ? currentTime - validationStart : 0;

    const event = {
      type: 'delete_participant_validation',
      timestamp: currentTime,
      sessionId,
      data: {
        validationType: type, // 'field', 'step', 'form', 'business_rule'
        field: field,
        isValid: result.isValid,
        errorCount: result.errorCount || 0,
        validationDuration,
        businessRulesPassed: result.businessRulesPassed || 0,
        businessRulesFailed: result.businessRulesFailed || 0
      }
    };

    queueEvent(event);
  }, [isTracking, sessionId]);

  // Track security events
  const trackSecurity = useCallback((eventType, details = {}) => {
    if (!isTracking) return;

    const event = {
      type: 'delete_participant_security',
      timestamp: Date.now(),
      sessionId,
      data: {
        securityEvent: eventType, // 'password_attempt', 'confirmation_attempt', 'lockout', 'suspicious_activity'
        success: details.success || false,
        attemptCount: details.attemptCount || 1,
        severity: details.severity || 'low', // 'low', 'medium', 'high', 'critical'
        ipAddress: gdprCompliant ? '[REDACTED]' : details.ipAddress,
        userAgent: gdprCompliant ? '[REDACTED]' : details.userAgent
      }
    };

    queueEvent(event);

    // Update security analytics
    setAnalyticsData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        events: [...(prev.security.events || []), {
          type: eventType,
          timestamp: Date.now(),
          success: details.success,
          severity: details.severity
        }],
        totalAttempts: (prev.security.totalAttempts || 0) + 1,
        failedAttempts: (prev.security.failedAttempts || 0) + (details.success ? 0 : 1)
      }
    }));
  }, [isTracking, sessionId, gdprCompliant]);

  // Track deletion attempt
  const trackDeletionAttempt = useCallback((stage, result = {}) => {
    if (!isTracking) return;

    const event = {
      type: 'delete_participant_deletion_attempt',
      timestamp: Date.now(),
      sessionId,
      data: {
        stage, // 'initiated', 'validated', 'confirmed', 'processing', 'completed', 'failed'
        success: result.success || false,
        errorType: result.errorType,
        processingTime: result.processingTime || 0,
        reason: result.reason,
        impactAssessmentComplete: result.impactAssessmentComplete || false,
        securityVerificationPassed: result.securityVerificationPassed || false
      }
    };

    queueEvent(event);
  }, [isTracking, sessionId]);

  // Track user interactions
  const trackInteraction = useCallback((interactionType, details = {}) => {
    if (!isTracking || trackingLevel === 'minimal') return;

    const event = {
      type: 'delete_participant_interaction',
      timestamp: Date.now(),
      sessionId,
      data: {
        interaction: interactionType, // 'field_focus', 'field_blur', 'button_click', 'link_click', 'help_view'
        element: details.element,
        value: gdprCompliant && details.sensitive ? '[REDACTED]' : details.value,
        duration: details.duration || 0
      }
    };

    queueEvent(event);
  }, [isTracking, trackingLevel, sessionId, gdprCompliant]);

  // Track performance metrics
  const trackPerformance = useCallback((metric, value, context = {}) => {
    if (!isTracking) return;

    setAnalyticsData(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        [metric]: value,
        [`${metric}_timestamp`]: Date.now(),
        [`${metric}_context`]: context
      }
    }));

    if (trackingLevel === 'detailed') {
      const event = {
        type: 'delete_participant_performance',
        timestamp: Date.now(),
        sessionId,
        data: {
          metric,
          value,
          context
        }
      };

      queueEvent(event);
    }
  }, [isTracking, trackingLevel, sessionId]);

  // Track completion
  const trackCompletion = useCallback((status, details = {}) => {
    if (!isTracking) return;

    const totalTime = Date.now() - performanceRef.current.startTime;

    const event = {
      type: 'delete_participant_completion',
      timestamp: Date.now(),
      sessionId,
      data: {
        status, // 'completed', 'abandoned', 'failed', 'cancelled'
        totalTime,
        stepsCompleted: details.stepsCompleted || 0,
        validationAttempts: details.validationAttempts || 0,
        securityAttempts: details.securityAttempts || 0,
        reason: details.reason,
        finalStep: details.finalStep
      }
    };

    queueEvent(event);

    // Update completion analytics
    setAnalyticsData(prev => ({
      ...prev,
      completion: {
        status,
        totalTime,
        completedAt: Date.now(),
        ...details
      }
    }));

    // Flush remaining events
    flushEventQueue();
  }, [isTracking, sessionId]);

  // Queue event for batch processing
  const queueEvent = useCallback((event) => {
    if (!isTracking) return;

    eventQueue.current.push(event);

    // Process batch if queue is full
    if (eventQueue.current.length >= batchSize) {
      flushEventQueue();
    } else {
      // Set timeout for batch processing
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      
      batchTimeoutRef.current = setTimeout(() => {
        flushEventQueue();
      }, 5000); // 5 second timeout
    }
  }, [isTracking, batchSize]);

  // Flush event queue
  const flushEventQueue = useCallback(() => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    // Send events to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      events.forEach(event => {
        window.gtag('event', event.type, {
          custom_parameter_session_id: event.sessionId,
          custom_parameter_timestamp: event.timestamp,
          ...event.data
        });
      });
    }

    // Also send to custom analytics endpoint if available
    if (typeof window !== 'undefined' && window.customAnalytics) {
      window.customAnalytics.trackBatch(events);
    }

    console.debug('Delete Participant Form Analytics - Batch sent:', events.length, 'events');
  }, []);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    return {
      sessionId,
      sessionDuration: Date.now() - analyticsData.sessionStartTime,
      eventCount: analyticsData.events.length,
      performance: analyticsData.performance,
      security: analyticsData.security,
      userBehavior: analyticsData.userBehavior,
      completion: analyticsData.completion,
      isTracking,
      trackingLevel
    };
  }, [sessionId, analyticsData, isTracking, trackingLevel]);

  // Initialize tracking
  useEffect(() => {
    if (isTracking) {
      trackSessionStart();
    }

    // Cleanup on unmount
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      flushEventQueue();
    };
  }, [isTracking, trackSessionStart, flushEventQueue]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (analyticsData.completion.status !== 'completed') {
        trackCompletion('abandoned', {
          finalStep: 'unknown',
          reason: 'page_unload'
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [analyticsData.completion.status, trackCompletion]);

  return {
    // Core tracking methods
    trackSessionStart,
    trackStepChange,
    trackValidation,
    trackSecurity,
    trackDeletionAttempt,
    trackInteraction,
    trackPerformance,
    trackCompletion,

    // Analytics data
    analyticsData,
    sessionId,
    isTracking,

    // Utility methods
    setIsTracking,
    getAnalyticsSummary,
    flushEventQueue,

    // Performance helpers
    startPerformanceTimer: (key) => {
      performanceRef.current[`${key}_start`] = Date.now();
    },
    
    endPerformanceTimer: (key) => {
      const startTime = performanceRef.current[`${key}_start`];
      if (startTime) {
        const duration = Date.now() - startTime;
        trackPerformance(key, duration);
        return duration;
      }
      return 0;
    }
  };
};

export default useDeletePicnicParticipantFormAnalytics;
