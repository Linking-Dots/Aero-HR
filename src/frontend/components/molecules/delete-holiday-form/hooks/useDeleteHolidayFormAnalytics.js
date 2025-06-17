// filepath: src/frontend/components/molecules/delete-holiday-form/hooks/useDeleteHolidayFormAnalytics.js

/**
 * Delete Holiday Form Analytics Hook
 * Comprehensive analytics tracking for holiday deletion behavior and security monitoring
 * 
 * Features:
 * - User behavior pattern tracking (hesitation, rapid progression, detailed review)
 * - Security event monitoring (multiple attempts, suspicious patterns)
 * - Performance metrics (step completion times, interaction patterns)
 * - Impact assessment analytics (decision patterns, risk evaluation)
 * - Error tracking and categorization
 * - Privacy-compliant data collection (GDPR/CCPA compliant)
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DELETE_HOLIDAY_CONFIG } from '../config.js';

export const useDeleteHolidayFormAnalytics = (formData, options = {}) => {
  const {
    enableTracking = true,
    enablePerformanceTracking = true,
    enableSecurityTracking = true,
    sessionId = `delete_holiday_${Date.now()}`,
    userId = null,
    onAnalyticsEvent,
    privacyMode = false
  } = options;

  // Analytics state
  const [analytics, setAnalytics] = useState({
    sessionId,
    userId,
    startTime: Date.now(),
    events: [],
    behaviorPatterns: [],
    performanceMetrics: {},
    securityEvents: [],
    deletionAttempts: 0,
    completionStatus: 'in_progress'
  });

  // Tracking refs
  const sessionStartRef = useRef(Date.now());
  const stepStartTimeRef = useRef(Date.now());
  const interactionCountRef = useRef(0);
  const hesitationTimerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());

  // Behavior pattern detection
  const [behaviorState, setBehaviorState] = useState({
    hesitationCount: 0,
    rapidProgressions: 0,
    detailedReviews: 0,
    backNavigations: 0,
    impactAssessmentChanges: 0,
    confirmationAttempts: 0
  });

  // Performance tracking state
  const [performanceData, setPerformanceData] = useState({
    stepCompletionTimes: {},
    averageStepTime: 0,
    totalFormTime: 0,
    interactionRate: 0,
    validationErrors: 0,
    apiCallTimes: []
  });

  // Security monitoring state
  const [securityMetrics, setSecurityMetrics] = useState({
    deletionAttempts: 0,
    suspiciousPatterns: [],
    rapidSequentialAccess: 0,
    unusualNavigationPatterns: 0,
    multipleFormAbandonment: 0
  });

  // Event logging function
  const logEvent = useCallback((eventType, eventData = {}, category = 'user_interaction') => {
    if (!enableTracking && !privacyMode) return;

    const event = {
      id: `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      category,
      timestamp: Date.now(),
      sessionTime: Date.now() - sessionStartRef.current,
      data: privacyMode ? {} : eventData,
      formState: privacyMode ? {} : {
        currentStep: formData.currentStep,
        progress: calculateProgress(),
        hasErrors: Object.keys(formData.errors || {}).length > 0
      }
    };

    setAnalytics(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));

    // Trigger callback if provided
    if (onAnalyticsEvent) {
      onAnalyticsEvent(event);
    }

    // Update interaction tracking
    interactionCountRef.current += 1;
    lastInteractionRef.current = Date.now();

    return event;
  }, [enableTracking, privacyMode, sessionId, formData, onAnalyticsEvent]);

  // Calculate form progress
  const calculateProgress = useCallback(() => {
    const totalSteps = DELETE_HOLIDAY_CONFIG.confirmation.steps.length;
    const currentStep = formData.currentStep || 0;
    const completedSteps = formData.completedSteps?.length || 0;
    
    return {
      percentage: (completedSteps / totalSteps) * 100,
      currentStep,
      totalSteps,
      completedSteps
    };
  }, [formData]);

  // Behavior pattern detection functions
  const detectHesitation = useCallback((threshold = 30000) => {
    const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
    
    if (timeSinceLastInteraction > threshold) {
      setBehaviorState(prev => ({
        ...prev,
        hesitationCount: prev.hesitationCount + 1
      }));

      logEvent('hesitation_detected', {
        hesitationDuration: timeSinceLastInteraction,
        currentStep: formData.currentStep,
        threshold
      }, 'behavior_pattern');

      return true;
    }
    return false;
  }, [formData.currentStep, logEvent]);

  const detectRapidProgression = useCallback((stepTime) => {
    const rapidThreshold = 5000; // 5 seconds
    
    if (stepTime < rapidThreshold) {
      setBehaviorState(prev => ({
        ...prev,
        rapidProgressions: prev.rapidProgressions + 1
      }));

      logEvent('rapid_progression_detected', {
        stepTime,
        threshold: rapidThreshold,
        step: formData.currentStep
      }, 'behavior_pattern');

      return true;
    }
    return false;
  }, [formData.currentStep, logEvent]);

  const detectDetailedReview = useCallback((stepTime) => {
    const detailedThreshold = 120000; // 2 minutes
    
    if (stepTime > detailedThreshold) {
      setBehaviorState(prev => ({
        ...prev,
        detailedReviews: prev.detailedReviews + 1
      }));

      logEvent('detailed_review_detected', {
        stepTime,
        threshold: detailedThreshold,
        step: formData.currentStep
      }, 'behavior_pattern');

      return true;
    }
    return false;
  }, [formData.currentStep, logEvent]);

  // Security monitoring functions
  const trackSecurityEvent = useCallback((eventType, severity = 'low', details = {}) => {
    if (!enableSecurityTracking) return;

    const securityEvent = {
      type: eventType,
      severity,
      timestamp: Date.now(),
      sessionId,
      userId,
      details: privacyMode ? {} : details
    };

    setSecurityMetrics(prev => ({
      ...prev,
      suspiciousPatterns: [...prev.suspiciousPatterns, securityEvent]
    }));

    logEvent(eventType, securityEvent, 'security');
  }, [enableSecurityTracking, sessionId, userId, privacyMode, logEvent]);

  const monitorDeletionAttempts = useCallback(() => {
    setSecurityMetrics(prev => {
      const newAttempts = prev.deletionAttempts + 1;
      
      if (newAttempts > DELETE_HOLIDAY_CONFIG.security.maxDeletionAttempts) {
        trackSecurityEvent('excessive_deletion_attempts', 'high', {
          attempts: newAttempts,
          maxAllowed: DELETE_HOLIDAY_CONFIG.security.maxDeletionAttempts
        });
      }

      return {
        ...prev,
        deletionAttempts: newAttempts
      };
    });
  }, [trackSecurityEvent]);

  // Performance tracking functions
  const trackStepCompletion = useCallback((step, completionTime) => {
    if (!enablePerformanceTracking) return;

    setPerformanceData(prev => {
      const newStepTimes = {
        ...prev.stepCompletionTimes,
        [step]: completionTime
      };

      const totalSteps = Object.keys(newStepTimes).length;
      const totalTime = Object.values(newStepTimes).reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / totalSteps;

      return {
        ...prev,
        stepCompletionTimes: newStepTimes,
        averageStepTime: averageTime,
        totalFormTime: Date.now() - sessionStartRef.current
      };
    });

    // Detect behavior patterns based on step time
    detectRapidProgression(completionTime);
    detectDetailedReview(completionTime);

    logEvent('step_completed', {
      step,
      completionTime,
      performanceCategory: completionTime < 5000 ? 'fast' : completionTime > 60000 ? 'slow' : 'normal'
    }, 'performance');
  }, [enablePerformanceTracking, detectRapidProgression, detectDetailedReview, logEvent]);

  const trackApiCall = useCallback((endpoint, duration, success = true) => {
    if (!enablePerformanceTracking) return;

    setPerformanceData(prev => ({
      ...prev,
      apiCallTimes: [...prev.apiCallTimes, { endpoint, duration, success, timestamp: Date.now() }]
    }));

    logEvent('api_call_completed', {
      endpoint,
      duration,
      success
    }, 'performance');
  }, [enablePerformanceTracking, logEvent]);

  // Impact assessment analytics
  const trackImpactAssessment = useCallback((categoryId, score, previousScore = null) => {
    const change = previousScore !== null ? score - previousScore : null;
    
    setBehaviorState(prev => ({
      ...prev,
      impactAssessmentChanges: prev.impactAssessmentChanges + 1
    }));

    logEvent('impact_assessment_updated', {
      categoryId,
      score,
      previousScore,
      change,
      assessmentCount: behaviorState.impactAssessmentChanges + 1
    }, 'impact_assessment');

    // Track decision patterns
    if (change !== null) {
      const pattern = change > 0 ? 'increasing_concern' : 
                     change < 0 ? 'decreasing_concern' : 'stable_assessment';
      
      logEvent('assessment_pattern_detected', {
        pattern,
        categoryId,
        magnitude: Math.abs(change)
      }, 'behavior_pattern');
    }
  }, [behaviorState.impactAssessmentChanges, logEvent]);

  // Confirmation tracking
  const trackConfirmationAttempt = useCallback((success = false, errors = []) => {
    setBehaviorState(prev => ({
      ...prev,
      confirmationAttempts: prev.confirmationAttempts + 1
    }));

    logEvent('confirmation_attempted', {
      success,
      attemptNumber: behaviorState.confirmationAttempts + 1,
      errors: errors.map(err => ({ field: err.field, type: err.type }))
    }, 'confirmation');

    if (!success && behaviorState.confirmationAttempts > 2) {
      logEvent('multiple_confirmation_failures', {
        attempts: behaviorState.confirmationAttempts + 1
      }, 'behavior_pattern');
    }
  }, [behaviorState.confirmationAttempts, logEvent]);

  // Analytics summary generation
  const generateAnalyticsSummary = useCallback(() => {
    const sessionDuration = Date.now() - sessionStartRef.current;
    const interactionRate = interactionCountRef.current / (sessionDuration / 60000); // interactions per minute

    return {
      session: {
        id: sessionId,
        duration: sessionDuration,
        interactionCount: interactionCountRef.current,
        interactionRate,
        completionStatus: analytics.completionStatus
      },
      behavior: {
        patterns: analytics.behaviorPatterns,
        hesitationCount: behaviorState.hesitationCount,
        rapidProgressions: behaviorState.rapidProgressions,
        detailedReviews: behaviorState.detailedReviews,
        backNavigations: behaviorState.backNavigations
      },
      performance: {
        ...performanceData,
        efficiency: calculateEfficiencyScore()
      },
      security: {
        ...securityMetrics,
        riskLevel: calculateRiskLevel()
      },
      completion: calculateProgress()
    };
  }, [sessionId, analytics, behaviorState, performanceData, securityMetrics]);

  // Calculate efficiency score (0-100)
  const calculateEfficiencyScore = useCallback(() => {
    const avgTime = performanceData.averageStepTime;
    const errorRate = performanceData.validationErrors / Math.max(interactionCountRef.current, 1);
    
    if (avgTime === 0) return 100;
    
    // Lower time and error rate = higher efficiency
    const timeScore = Math.max(0, 100 - (avgTime / 1000) * 2); // Penalize longer times
    const errorScore = Math.max(0, 100 - (errorRate * 100)); // Penalize errors
    
    return Math.round((timeScore + errorScore) / 2);
  }, [performanceData]);

  // Calculate risk level based on security metrics
  const calculateRiskLevel = useCallback(() => {
    const { deletionAttempts, suspiciousPatterns, rapidSequentialAccess } = securityMetrics;
    
    let riskScore = 0;
    
    if (deletionAttempts > 2) riskScore += 30;
    if (suspiciousPatterns.length > 0) riskScore += 20;
    if (rapidSequentialAccess > 1) riskScore += 15;
    if (behaviorState.hesitationCount > 3) riskScore += 10;
    
    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  }, [securityMetrics, behaviorState]);

  // Effects for automatic tracking
  useEffect(() => {
    // Track form initialization
    logEvent('form_initialized', {
      holidayId: formData.holidayId,
      initialStep: formData.currentStep || 0
    }, 'initialization');

    // Set up hesitation detection timer
    if (enableTracking) {
      hesitationTimerRef.current = setInterval(() => {
        detectHesitation();
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (hesitationTimerRef.current) {
        clearInterval(hesitationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Track step changes
    if (analytics.events.length > 0) { // Skip initial render
      const stepTime = Date.now() - stepStartTimeRef.current;
      trackStepCompletion(formData.currentStep, stepTime);
    }
    stepStartTimeRef.current = Date.now();
  }, [formData.currentStep]);

  useEffect(() => {
    // Track form completion
    if (formData.acknowledgment && formData.confirmationText === 'DELETE') {
      setAnalytics(prev => ({
        ...prev,
        completionStatus: 'completed'
      }));

      logEvent('form_completed', {
        totalTime: Date.now() - sessionStartRef.current,
        summary: generateAnalyticsSummary()
      }, 'completion');
    }
  }, [formData.acknowledgment, formData.confirmationText, generateAnalyticsSummary, logEvent]);

  return {
    // Analytics data
    analytics,
    behaviorState,
    performanceData,
    securityMetrics,

    // Tracking functions
    logEvent,
    trackStepCompletion,
    trackApiCall,
    trackImpactAssessment,
    trackConfirmationAttempt,
    trackSecurityEvent,
    monitorDeletionAttempts,

    // Pattern detection
    detectHesitation,
    detectRapidProgression,
    detectDetailedReview,

    // Analytics utilities
    generateAnalyticsSummary,
    calculateEfficiencyScore,
    calculateRiskLevel,
    calculateProgress,

    // Configuration
    config: DELETE_HOLIDAY_CONFIG.analytics
  };
};

export default useDeleteHolidayFormAnalytics;
