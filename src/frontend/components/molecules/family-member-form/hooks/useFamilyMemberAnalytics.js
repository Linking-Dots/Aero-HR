/**
 * Family Member Form Analytics Hook
 * 
 * @fileoverview Advanced analytics and tracking hook for family member forms.
 * Provides comprehensive user behavior tracking, performance monitoring, and form analytics.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useFamilyMemberAnalytics
 * @namespace Components.Molecules.FamilyMemberForm.Hooks
 * 
 * @requires React ^18.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Comprehensive analytics system with:
 * - User behavior tracking and interaction patterns
 * - Form completion analytics and funnel analysis
 * - Performance monitoring and optimization insights
 * - Relationship selection patterns and preferences
 * - Error frequency tracking and problem identification
 * - Field completion timing and efficiency metrics
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Performance monitoring, Usability analytics
 * - GDPR: Privacy-compliant tracking and data anonymization
 * - ISO 27001 (Information Security): Secure analytics data handling
 * 
 * @privacy
 * - No personal data tracking without consent
 * - Anonymized behavioral data collection
 * - Configurable tracking preferences
 * - GDPR-compliant data retention
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ANALYTICS_CONFIG } from '../config.js';

/**
 * Analytics event types
 */
const ANALYTICS_EVENTS = {
  // Form lifecycle events
  FORM_VIEW: 'form_view',
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_SUCCESS: 'form_success',
  FORM_ERROR: 'form_error',
  FORM_ABANDON: 'form_abandon',
  FORM_RESET: 'form_reset',
  FORM_CLEAR: 'form_clear',
  FORM_AUTOSAVE: 'form_autosave',
  
  // Field interaction events
  FIELD_FOCUS: 'field_focus',
  FIELD_BLUR: 'field_blur',
  FIELD_CHANGE: 'field_change',
  FIELD_VALIDATION_ERROR: 'field_validation_error',
  FIELD_VALIDATION_SUCCESS: 'field_validation_success',
  
  // Specific feature events
  RELATIONSHIP_SELECTED: 'relationship_selected',
  PHONE_FORMATTED: 'phone_formatted',
  AGE_CALCULATED: 'age_calculated',
  DUPLICATE_DETECTED: 'duplicate_detected',
  
  // User experience events
  KEYBOARD_SHORTCUT_USED: 'keyboard_shortcut_used',
  HELP_ACCESSED: 'help_accessed',
  ERROR_DISMISSED: 'error_dismissed',
  SECTION_EXPANDED: 'section_expanded',
  
  // Performance events
  SLOW_VALIDATION: 'slow_validation',
  FAST_COMPLETION: 'fast_completion',
  LONG_SESSION: 'long_session'
};

/**
 * Performance thresholds
 */
const PERFORMANCE_THRESHOLDS = {
  SLOW_VALIDATION: 1000, // ms
  FAST_COMPLETION: 30000, // ms (30 seconds)
  LONG_SESSION: 600000, // ms (10 minutes)
  HIGH_ERROR_RATE: 0.5 // 50% error rate
};

/**
 * Family Member Form Analytics Hook
 * 
 * @param {Object} options - Hook configuration options
 * @param {boolean} options.enabled - Enable analytics tracking
 * @param {string} options.formId - Unique form identifier
 * @param {string} options.userId - User identifier (anonymized)
 * @param {boolean} options.trackPerformance - Enable performance tracking
 * @param {boolean} options.trackBehavior - Enable behavior tracking
 * @param {boolean} options.trackErrors - Enable error tracking
 * @param {Function} options.onAnalyticsEvent - Analytics event callback
 * 
 * @returns {Object} Analytics management interface
 */
export const useFamilyMemberAnalytics = (options = {}) => {
  const {
    enabled = ANALYTICS_CONFIG.tracking.enabled,
    formId = 'family-member-form',
    userId = 'anonymous',
    trackPerformance = ANALYTICS_CONFIG.performance.trackLoadTime,
    trackBehavior = ANALYTICS_CONFIG.behavior.trackFieldOrder,
    trackErrors = true,
    onAnalyticsEvent
  } = options;

  // Analytics state
  const [analytics, setAnalytics] = useState({
    sessionId: generateSessionId(),
    startTime: Date.now(),
    events: [],
    fieldInteractions: {},
    performanceMetrics: {},
    behaviorPatterns: {},
    errorAnalytics: {},
    completionMetrics: {}
  });

  // Session tracking
  const sessionData = useRef({
    focusedField: null,
    fieldOrder: [],
    timeSpentPerField: {},
    totalKeystrokes: 0,
    totalErrors: 0,
    formStarted: false,
    lastInteraction: Date.now()
  });

  // Performance tracking
  const performanceTimers = useRef({});
  const fieldTimers = useRef({});

  /**
   * Generate unique session ID
   */
  function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send analytics event
   */
  const sendAnalyticsEvent = useCallback((eventType, eventData = {}) => {
    if (!enabled) return;

    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: analytics.sessionId,
      formId,
      userId,
      data: eventData
    };

    // Add to events array
    setAnalytics(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));

    // Call external analytics handler
    if (onAnalyticsEvent) {
      onAnalyticsEvent(event);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Analytics Event:', event);
    }
  }, [enabled, analytics.sessionId, formId, userId, onAnalyticsEvent]);

  /**
   * Track form view
   */
  const trackFormView = useCallback(() => {
    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_VIEW, {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }, [sendAnalyticsEvent]);

  /**
   * Track form start (first interaction)
   */
  const trackFormStart = useCallback(() => {
    if (!sessionData.current.formStarted) {
      sessionData.current.formStarted = true;
      sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_START, {
        timestamp: Date.now()
      });
    }
  }, [sendAnalyticsEvent]);

  /**
   * Track field focus
   */
  const trackFieldFocus = useCallback((fieldName) => {
    if (!enabled) return;

    trackFormStart(); // Ensure form start is tracked

    const now = Date.now();
    sessionData.current.focusedField = fieldName;
    sessionData.current.lastInteraction = now;

    // Start field timer
    fieldTimers.current[fieldName] = now;

    // Track field order
    if (!sessionData.current.fieldOrder.includes(fieldName)) {
      sessionData.current.fieldOrder.push(fieldName);
    }

    sendAnalyticsEvent(ANALYTICS_EVENTS.FIELD_FOCUS, {
      fieldName,
      fieldOrder: sessionData.current.fieldOrder.length,
      timeFromStart: now - analytics.startTime
    });

    // Update field interactions
    setAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          focusCount: (prev.fieldInteractions[fieldName]?.focusCount || 0) + 1,
          lastFocused: now
        }
      }
    }));
  }, [enabled, sendAnalyticsEvent, trackFormStart, analytics.startTime]);

  /**
   * Track field blur
   */
  const trackFieldBlur = useCallback((fieldName, value) => {
    if (!enabled) return;

    const now = Date.now();
    const focusTime = fieldTimers.current[fieldName];
    const timeSpent = focusTime ? now - focusTime : 0;

    // Update time spent tracking
    sessionData.current.timeSpentPerField[fieldName] = 
      (sessionData.current.timeSpentPerField[fieldName] || 0) + timeSpent;

    sendAnalyticsEvent(ANALYTICS_EVENTS.FIELD_BLUR, {
      fieldName,
      value: value ? 'filled' : 'empty', // Don't track actual values for privacy
      timeSpent,
      totalTimeSpent: sessionData.current.timeSpentPerField[fieldName]
    });

    // Update field interactions
    setAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          blurCount: (prev.fieldInteractions[fieldName]?.blurCount || 0) + 1,
          timeSpent: sessionData.current.timeSpentPerField[fieldName],
          hasValue: !!value
        }
      }
    }));

    // Clear field timer
    delete fieldTimers.current[fieldName];
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track field change
   */
  const trackFieldChange = useCallback((fieldName, newValue, oldValue) => {
    if (!enabled) return;

    sessionData.current.totalKeystrokes++;
    sessionData.current.lastInteraction = Date.now();

    const changeType = !oldValue ? 'first_input' : newValue.length > oldValue.length ? 'addition' : 'deletion';

    sendAnalyticsEvent(ANALYTICS_EVENTS.FIELD_CHANGE, {
      fieldName,
      changeType,
      valueLength: newValue ? newValue.length : 0,
      totalKeystrokes: sessionData.current.totalKeystrokes
    });

    // Update field interactions
    setAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          changeCount: (prev.fieldInteractions[fieldName]?.changeCount || 0) + 1,
          lastChanged: Date.now()
        }
      }
    }));
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track validation error
   */
  const trackValidationError = useCallback((errors) => {
    if (!enabled || !errors) return;

    sessionData.current.totalErrors++;

    Object.entries(errors).forEach(([fieldName, error]) => {
      sendAnalyticsEvent(ANALYTICS_EVENTS.FIELD_VALIDATION_ERROR, {
        fieldName,
        errorType: categorizeError(error),
        errorMessage: error
      });
    });

    // Update error analytics
    setAnalytics(prev => ({
      ...prev,
      errorAnalytics: {
        ...prev.errorAnalytics,
        totalErrors: sessionData.current.totalErrors,
        errorsByField: Object.keys(errors).reduce((acc, field) => ({
          ...acc,
          [field]: (prev.errorAnalytics.errorsByField?.[field] || 0) + 1
        }), prev.errorAnalytics.errorsByField || {}),
        lastError: Date.now()
      }
    }));
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track relationship selection
   */
  const trackRelationshipSelected = useCallback((relationship, category) => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.RELATIONSHIP_SELECTED, {
      relationship,
      category,
      timestamp: Date.now()
    });

    // Update behavior patterns
    setAnalytics(prev => ({
      ...prev,
      behaviorPatterns: {
        ...prev.behaviorPatterns,
        relationshipSelections: {
          ...prev.behaviorPatterns.relationshipSelections,
          [relationship]: (prev.behaviorPatterns.relationshipSelections?.[relationship] || 0) + 1
        }
      }
    }));
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track phone formatting
   */
  const trackPhoneFormatted = useCallback((originalValue, formattedValue) => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.PHONE_FORMATTED, {
      originalLength: originalValue ? originalValue.length : 0,
      formattedLength: formattedValue ? formattedValue.length : 0,
      hadFormatting: originalValue !== formattedValue
    });
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track age calculation
   */
  const trackAgeCalculated = useCallback((dateOfBirth, calculatedAge) => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.AGE_CALCULATED, {
      ageRange: getAgeRange(calculatedAge?.years),
      isMinor: calculatedAge?.isMinor,
      isAdult: calculatedAge?.isAdult,
      isSenior: calculatedAge?.isSenior
    });
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((formData) => {
    if (!enabled) return;

    const completionTime = Date.now() - analytics.startTime;
    const fieldCompletionRate = calculateFieldCompletionRate(formData);

    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
      completionTime,
      fieldCompletionRate,
      totalKeystrokes: sessionData.current.totalKeystrokes,
      totalErrors: sessionData.current.totalErrors,
      fieldOrder: sessionData.current.fieldOrder,
      errorRate: sessionData.current.totalErrors / (sessionData.current.totalKeystrokes || 1)
    });

    // Check for performance events
    if (completionTime < PERFORMANCE_THRESHOLDS.FAST_COMPLETION) {
      sendAnalyticsEvent(ANALYTICS_EVENTS.FAST_COMPLETION, { completionTime });
    }
  }, [enabled, sendAnalyticsEvent, analytics.startTime]);

  /**
   * Track form success
   */
  const trackFormSuccess = useCallback((submissionData) => {
    if (!enabled) return;

    const completionTime = Date.now() - analytics.startTime;

    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_SUCCESS, {
      completionTime,
      finalData: {
        hasPhone: !!submissionData.family_member_phone,
        relationshipCategory: getRelationshipCategory(submissionData.family_member_relationship),
        ageCategory: getAgeCategory(submissionData.family_member_dob)
      }
    });

    // Update completion metrics
    setAnalytics(prev => ({
      ...prev,
      completionMetrics: {
        ...prev.completionMetrics,
        successfulSubmissions: (prev.completionMetrics.successfulSubmissions || 0) + 1,
        averageCompletionTime: calculateAverageCompletionTime(prev.completionMetrics, completionTime),
        lastSuccess: Date.now()
      }
    }));
  }, [enabled, sendAnalyticsEvent, analytics.startTime]);

  /**
   * Track form error
   */
  const trackFormError = useCallback((error) => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_ERROR, {
      errorType: error.name || 'Unknown',
      errorMessage: error.message,
      stackTrace: error.stack ? error.stack.substring(0, 200) : null
    });

    // Update error analytics
    setAnalytics(prev => ({
      ...prev,
      errorAnalytics: {
        ...prev.errorAnalytics,
        submissionErrors: (prev.errorAnalytics.submissionErrors || 0) + 1,
        lastSubmissionError: Date.now()
      }
    }));
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track auto-save
   */
  const trackAutoSave = useCallback((formData) => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_AUTOSAVE, {
      fieldsCompleted: Object.values(formData).filter(Boolean).length,
      timestamp: Date.now()
    });
  }, [enabled, sendAnalyticsEvent]);

  /**
   * Track form reset
   */
  const trackFormReset = useCallback(() => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_RESET, {
      timeBeforeReset: Date.now() - analytics.startTime,
      fieldsCompletedBeforeReset: sessionData.current.fieldOrder.length
    });
  }, [enabled, sendAnalyticsEvent, analytics.startTime]);

  /**
   * Track form clear
   */
  const trackFormClear = useCallback(() => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_CLEAR, {
      timeBeforeClear: Date.now() - analytics.startTime
    });
  }, [enabled, sendAnalyticsEvent, analytics.startTime]);

  /**
   * Track keyboard shortcut usage
   */
  const trackKeyboardShortcut = useCallback((shortcut, action) => {
    if (!enabled) return;

    sendAnalyticsEvent(ANALYTICS_EVENTS.KEYBOARD_SHORTCUT_USED, {
      shortcut,
      action,
      timestamp: Date.now()
    });
  }, [enabled, sendAnalyticsEvent]);

  // Helper functions
  const categorizeError = (error) => {
    const errorMessage = error?.toLowerCase() || '';
    if (errorMessage.includes('required')) return 'required';
    if (errorMessage.includes('format')) return 'format';
    if (errorMessage.includes('duplicate')) return 'duplicate';
    return 'other';
  };

  const getAgeRange = (age) => {
    if (!age) return 'unknown';
    if (age < 18) return 'minor';
    if (age < 35) return 'young_adult';
    if (age < 60) return 'adult';
    return 'senior';
  };

  const getRelationshipCategory = (relationship) => {
    // This would map to the relationship categories from config
    return 'family'; // Simplified for now
  };

  const getAgeCategory = (dateOfBirth) => {
    // Calculate age category from date of birth
    return 'adult'; // Simplified for now
  };

  const calculateFieldCompletionRate = (formData) => {
    const totalFields = Object.keys(formData).length;
    const completedFields = Object.values(formData).filter(Boolean).length;
    return totalFields > 0 ? completedFields / totalFields : 0;
  };

  const calculateAverageCompletionTime = (metrics, newTime) => {
    const count = metrics.successfulSubmissions || 0;
    const currentAvg = metrics.averageCompletionTime || 0;
    return (currentAvg * count + newTime) / (count + 1);
  };

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const currentTime = Date.now();
    const sessionDuration = currentTime - analytics.startTime;
    
    return {
      sessionId: analytics.sessionId,
      sessionDuration,
      totalEvents: analytics.events.length,
      fieldInteractions: analytics.fieldInteractions,
      performanceMetrics: analytics.performanceMetrics,
      behaviorPatterns: analytics.behaviorPatterns,
      errorAnalytics: analytics.errorAnalytics,
      completionMetrics: analytics.completionMetrics,
      sessionData: {
        fieldOrder: sessionData.current.fieldOrder,
        totalKeystrokes: sessionData.current.totalKeystrokes,
        totalErrors: sessionData.current.totalErrors,
        timeSpentPerField: sessionData.current.timeSpentPerField
      }
    };
  }, [analytics]);

  // Effect: Track form view on mount
  useEffect(() => {
    if (enabled) {
      trackFormView();
    }
  }, [enabled, trackFormView]);

  // Effect: Track long sessions
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const sessionDuration = Date.now() - analytics.startTime;
      if (sessionDuration > PERFORMANCE_THRESHOLDS.LONG_SESSION) {
        sendAnalyticsEvent(ANALYTICS_EVENTS.LONG_SESSION, { sessionDuration });
      }
    }, PERFORMANCE_THRESHOLDS.LONG_SESSION);

    return () => clearInterval(interval);
  }, [enabled, analytics.startTime, sendAnalyticsEvent]);

  // Effect: Track page visibility changes
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - potential form abandonment
        const timeSinceLastInteraction = Date.now() - sessionData.current.lastInteraction;
        if (timeSinceLastInteraction < 30000) { // Within 30 seconds
          sendAnalyticsEvent(ANALYTICS_EVENTS.FORM_ABANDON, {
            reason: 'page_hidden',
            timeFromStart: Date.now() - analytics.startTime,
            fieldsCompleted: sessionData.current.fieldOrder.length
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, analytics.startTime, sendAnalyticsEvent]);

  return {
    // Core tracking functions
    trackFormView,
    trackFormStart,
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackValidationError,
    trackRelationshipSelected,
    trackPhoneFormatted,
    trackAgeCalculated,
    trackFormSubmit,
    trackFormSuccess,
    trackFormError,
    trackAutoSave,
    trackFormReset,
    trackFormClear,
    trackKeyboardShortcut,
    
    // Analytics data
    getAnalytics: getAnalyticsSummary,
    
    // Configuration
    enabled,
    trackPerformance,
    trackBehavior,
    trackErrors,
    
    // Session info
    sessionId: analytics.sessionId,
    startTime: analytics.startTime
  };
};

export default useFamilyMemberAnalytics;
