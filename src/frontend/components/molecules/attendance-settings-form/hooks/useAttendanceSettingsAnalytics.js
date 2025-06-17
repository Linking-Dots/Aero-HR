/**
 * Attendance Settings Form Analytics Hook
 * 
 * @fileoverview Advanced analytics hook for tracking user behavior and form performance.
 * Provides comprehensive insights into form usage patterns and optimization opportunities.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module useAttendanceSettingsAnalytics
 * @namespace Components.Molecules.AttendanceSettingsForm.Hooks
 * 
 * @requires React ^18.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Analytics features:
 * - User interaction tracking (clicks, focus, blur events)
 * - Form completion behavior analysis
 * - Performance metrics and timing analysis
 * - Settings change frequency and patterns
 * - Error frequency and resolution tracking
 * - GDPR-compliant data collection
 * 
 * @example
 * ```javascript
 * const analytics = useAttendanceSettingsAnalytics({
 *   enabled: true,
 *   formData,
 *   formRef
 * });
 * ```
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ANALYTICS_CONFIG, FORM_SECTIONS } from '../config';

/**
 * Analytics event types
 */
const ANALYTICS_EVENTS = {
  // Form lifecycle events
  FORM_LOAD: 'form_load',
  FORM_SUBMIT: 'form_submit',
  FORM_SUCCESS: 'form_success',
  FORM_ERROR: 'form_error',
  FORM_RESET: 'form_reset',
  FORM_CLEAR: 'form_clear',
  
  // Field interaction events
  FIELD_FOCUS: 'field_focus',
  FIELD_BLUR: 'field_blur',
  FIELD_CHANGE: 'field_change',
  
  // Section events
  SECTION_EXPAND: 'section_expand',
  SECTION_COLLAPSE: 'section_collapse',
  SECTION_COMPLETE: 'section_complete',
  
  // Validation events
  VALIDATION_ERROR: 'validation_error',
  VALIDATION_SUCCESS: 'validation_success',
  
  // Special events
  AUTO_SAVE: 'auto_save',
  KEYBOARD_SHORTCUT: 'keyboard_shortcut',
  EXTERNAL_DATA_LOAD: 'external_data_load'
};

/**
 * User behavior patterns
 */
const BEHAVIOR_PATTERNS = {
  LINEAR: 'linear',           // User fills form top to bottom
  RANDOM: 'random',          // User jumps around sections
  FOCUSED: 'focused',        // User focuses on one section at a time
  REVIEWER: 'reviewer'       // User frequently goes back to review/edit
};

/**
 * Attendance settings form analytics hook
 */
const useAttendanceSettingsAnalytics = (options = {}) => {
  const {
    enabled = true,
    formData = {},
    formRef = null,
    userId = null,
    sessionId = null
  } = options;

  // Analytics state
  const [events, setEvents] = useState([]);
  const [sessionData, setSessionData] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [userBehavior, setUserBehavior] = useState({});
  const [fieldInteractions, setFieldInteractions] = useState({});
  const [sectionMetrics, setSectionMetrics] = useState({});

  // Refs for tracking
  const sessionStartTime = useRef(Date.now());
  const fieldFocusStartTimes = useRef({});
  const sectionExpandTimes = useRef({});
  const lastActivity = useRef(Date.now());
  const interactionSequence = useRef([]);

  /**
   * Generate unique session ID if not provided
   */
  const currentSessionId = useMemo(() => {
    return sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, [sessionId]);

  /**
   * Check if analytics should be tracked
   */
  const shouldTrack = useCallback(() => {
    return enabled && ANALYTICS_CONFIG.behaviorTracking;
  }, [enabled]);

  /**
   * Create analytics event
   */
  const createEvent = useCallback((type, data = {}) => {
    if (!shouldTrack()) return null;

    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      sessionId: currentSessionId,
      userId: userId || 'anonymous',
      data: {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    return event;
  }, [shouldTrack, currentSessionId, userId]);

  /**
   * Track analytics event
   */
  const trackEvent = useCallback((type, data = {}) => {
    const event = createEvent(type, data);
    if (!event) return;

    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
    lastActivity.current = Date.now();

    // Update interaction sequence
    interactionSequence.current.push({
      type,
      timestamp: event.timestamp,
      field: data.fieldName || null
    });

    // Keep last 50 interactions
    if (interactionSequence.current.length > 50) {
      interactionSequence.current = interactionSequence.current.slice(-50);
    }

    // Send to analytics service (if configured)
    if (window.gtag) {
      window.gtag('event', type, {
        custom_parameter_1: data.fieldName || '',
        custom_parameter_2: data.value || '',
        session_id: currentSessionId
      });
    }
  }, [createEvent, currentSessionId]);

  /**
   * Track form load
   */
  const trackFormLoad = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.FORM_LOAD, {
      formVersion: '1.0.0',
      loadTime: Date.now() - sessionStartTime.current,
      initialData: Object.keys(formData).length > 0
    });
  }, [trackEvent, formData]);

  /**
   * Track field interaction
   */
  const trackFieldFocus = useCallback((fieldName) => {
    fieldFocusStartTimes.current[fieldName] = Date.now();
    
    trackEvent(ANALYTICS_EVENTS.FIELD_FOCUS, {
      fieldName,
      section: getSectionForField(fieldName),
      focusOrder: Object.keys(fieldFocusStartTimes.current).length
    });

    // Update field interaction stats
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        focusCount: (prev[fieldName]?.focusCount || 0) + 1,
        lastFocused: Date.now()
      }
    }));
  }, [trackEvent]);

  /**
   * Track field blur
   */
  const trackFieldBlur = useCallback((fieldName) => {
    const focusStartTime = fieldFocusStartTimes.current[fieldName];
    const focusTime = focusStartTime ? Date.now() - focusStartTime : 0;
    
    trackEvent(ANALYTICS_EVENTS.FIELD_BLUR, {
      fieldName,
      focusTime,
      section: getSectionForField(fieldName)
    });

    // Update field interaction stats
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        totalFocusTime: (prev[fieldName]?.totalFocusTime || 0) + focusTime,
        averageFocusTime: ((prev[fieldName]?.averageFocusTime || 0) + focusTime) / 2,
        lastBlurred: Date.now()
      }
    }));

    delete fieldFocusStartTimes.current[fieldName];
  }, [trackEvent]);

  /**
   * Track field change
   */
  const trackFieldChange = useCallback((fieldName, value) => {
    trackEvent(ANALYTICS_EVENTS.FIELD_CHANGE, {
      fieldName,
      valueType: typeof value,
      valueLength: typeof value === 'string' ? value.length : null,
      section: getSectionForField(fieldName),
      isEmpty: !value || value === '',
      isArrayValue: Array.isArray(value)
    });

    // Update field interaction stats
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        changeCount: (prev[fieldName]?.changeCount || 0) + 1,
        lastChanged: Date.now(),
        hasValue: !(!value || value === '')
      }
    }));
  }, [trackEvent]);

  /**
   * Track section expansion
   */
  const trackSectionExpand = useCallback((sectionId) => {
    sectionExpandTimes.current[sectionId] = Date.now();
    
    trackEvent(ANALYTICS_EVENTS.SECTION_EXPAND, {
      sectionId,
      sectionTitle: FORM_SECTIONS[sectionId]?.title || sectionId,
      expansionOrder: Object.keys(sectionExpandTimes.current).length
    });
  }, [trackEvent]);

  /**
   * Track section collapse
   */
  const trackSectionCollapse = useCallback((sectionId) => {
    const expandTime = sectionExpandTimes.current[sectionId];
    const timeExpanded = expandTime ? Date.now() - expandTime : 0;
    
    trackEvent(ANALYTICS_EVENTS.SECTION_COLLAPSE, {
      sectionId,
      timeExpanded,
      sectionTitle: FORM_SECTIONS[sectionId]?.title || sectionId
    });

    // Update section metrics
    setSectionMetrics(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        totalTimeExpanded: (prev[sectionId]?.totalTimeExpanded || 0) + timeExpanded,
        expansionCount: (prev[sectionId]?.expansionCount || 0) + 1,
        averageTimeExpanded: ((prev[sectionId]?.averageTimeExpanded || 0) + timeExpanded) / 2
      }
    }));

    delete sectionExpandTimes.current[sectionId];
  }, [trackEvent]);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((submissionData) => {
    const sessionTime = Date.now() - sessionStartTime.current;
    
    trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
      sessionTime,
      fieldCount: Object.keys(submissionData).length,
      completedFields: Object.values(submissionData).filter(v => v !== null && v !== undefined && v !== '').length,
      settingsChanged: getChangedSettings(submissionData),
      submissionAttempts: (sessionData.submissionAttempts || 0) + 1
    });

    setSessionData(prev => ({
      ...prev,
      submissionAttempts: (prev.submissionAttempts || 0) + 1,
      lastSubmissionTime: Date.now()
    }));
  }, [trackEvent, sessionData]);

  /**
   * Track form success
   */
  const trackFormSuccess = useCallback((submissionData) => {
    trackEvent(ANALYTICS_EVENTS.FORM_SUCCESS, {
      finalData: submissionData,
      totalSessionTime: Date.now() - sessionStartTime.current,
      settingsUpdated: Object.keys(submissionData).length
    });
  }, [trackEvent]);

  /**
   * Track form error
   */
  const trackFormError = useCallback((errorMessage) => {
    trackEvent(ANALYTICS_EVENTS.FORM_ERROR, {
      errorMessage,
      errorType: categorizeError(errorMessage),
      sessionTime: Date.now() - sessionStartTime.current
    });
  }, [trackEvent]);

  /**
   * Track validation errors
   */
  const trackValidationError = useCallback((errors) => {
    trackEvent(ANALYTICS_EVENTS.VALIDATION_ERROR, {
      errorCount: Object.keys(errors).length,
      errorFields: Object.keys(errors),
      errorTypes: Object.values(errors).map(err => typeof err === 'object' ? err.category : 'unknown')
    });
  }, [trackEvent]);

  /**
   * Track auto-save
   */
  const trackAutoSave = useCallback((formData) => {
    trackEvent(ANALYTICS_EVENTS.AUTO_SAVE, {
      dataSize: JSON.stringify(formData).length,
      fieldsWithData: Object.keys(formData).filter(key => formData[key] !== null && formData[key] !== '').length
    });
  }, [trackEvent]);

  /**
   * Track form reset
   */
  const trackFormReset = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.FORM_RESET, {
      sessionTime: Date.now() - sessionStartTime.current,
      interactionCount: interactionSequence.current.length
    });
  }, [trackEvent]);

  /**
   * Track form clear
   */
  const trackFormClear = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.FORM_CLEAR, {
      sessionTime: Date.now() - sessionStartTime.current,
      interactionCount: interactionSequence.current.length
    });
  }, [trackEvent]);

  /**
   * Track keyboard shortcuts
   */
  const trackKeyboardShortcut = useCallback((shortcut) => {
    trackEvent(ANALYTICS_EVENTS.KEYBOARD_SHORTCUT, {
      shortcut,
      sessionTime: Date.now() - sessionStartTime.current
    });
  }, [trackEvent]);

  /**
   * Get section for field
   */
  const getSectionForField = useCallback((fieldName) => {
    for (const [sectionId, section] of Object.entries(FORM_SECTIONS)) {
      if (section.fields.includes(fieldName)) {
        return sectionId;
      }
    }
    return 'unknown';
  }, []);

  /**
   * Get changed settings
   */
  const getChangedSettings = useCallback((newData) => {
    // This would compare with initial data to find what changed
    // For now, return all non-empty fields
    return Object.keys(newData).filter(key => 
      newData[key] !== null && newData[key] !== undefined && newData[key] !== ''
    );
  }, []);

  /**
   * Categorize error for analytics
   */
  const categorizeError = useCallback((errorMessage) => {
    if (errorMessage.includes('network') || errorMessage.includes('connection')) return 'network';
    if (errorMessage.includes('validation')) return 'validation';
    if (errorMessage.includes('server')) return 'server';
    if (errorMessage.includes('permission')) return 'permission';
    return 'unknown';
  }, []);

  /**
   * Analyze user behavior patterns
   */
  const analyzeUserBehavior = useCallback(() => {
    const interactions = interactionSequence.current;
    if (interactions.length < 5) return BEHAVIOR_PATTERNS.LINEAR;

    // Analyze interaction patterns
    const fieldSwitches = interactions.filter((_, index) => {
      if (index === 0) return false;
      const current = interactions[index];
      const previous = interactions[index - 1];
      return current.field !== previous.field && current.field && previous.field;
    }).length;

    const fieldRevisits = {};
    interactions.forEach(interaction => {
      if (interaction.field) {
        fieldRevisits[interaction.field] = (fieldRevisits[interaction.field] || 0) + 1;
      }
    });

    const totalRevisits = Object.values(fieldRevisits).reduce((sum, count) => sum + count, 0);
    const avgRevisits = totalRevisits / Object.keys(fieldRevisits).length;

    // Determine pattern
    if (fieldSwitches > interactions.length * 0.7) return BEHAVIOR_PATTERNS.RANDOM;
    if (avgRevisits > 2) return BEHAVIOR_PATTERNS.REVIEWER;
    if (fieldSwitches < interactions.length * 0.3) return BEHAVIOR_PATTERNS.LINEAR;
    
    return BEHAVIOR_PATTERNS.FOCUSED;
  }, []);

  /**
   * Get performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    const currentTime = Date.now();
    const sessionTime = currentTime - sessionStartTime.current;
    const lastActivityTime = currentTime - lastActivity.current;

    return {
      sessionDuration: sessionTime,
      lastActivity: lastActivityTime,
      interactionCount: interactionSequence.current.length,
      interactionRate: interactionSequence.current.length / (sessionTime / 1000 / 60), // interactions per minute
      fieldInteractionCount: Object.keys(fieldInteractions).length,
      averageFieldFocusTime: Object.values(fieldInteractions).reduce(
        (sum, field) => sum + (field.averageFocusTime || 0), 0
      ) / Object.keys(fieldInteractions).length || 0,
      behaviorPattern: analyzeUserBehavior(),
      mostInteractedField: Object.entries(fieldInteractions).reduce(
        (max, [field, data]) => data.changeCount > (max.count || 0) ? { field, count: data.changeCount } : max,
        {}
      ).field
    };
  }, [fieldInteractions, analyzeUserBehavior]);

  /**
   * Get form completion insights
   */
  const getCompletionInsights = useCallback(() => {
    const totalFields = Object.keys(FORM_SECTIONS).reduce(
      (total, sectionId) => total + FORM_SECTIONS[sectionId].fields.length, 0
    );
    const interactedFields = Object.keys(fieldInteractions).length;
    const completedFields = Object.values(fieldInteractions).filter(field => field.hasValue).length;

    return {
      totalFields,
      interactedFields,
      completedFields,
      interactionProgress: Math.round((interactedFields / totalFields) * 100),
      completionProgress: Math.round((completedFields / totalFields) * 100),
      abandonmentRisk: interactedFields > 0 && completedFields / interactedFields < 0.5,
      sectionsVisited: Object.keys(sectionMetrics).length,
      mostTimeSpentSection: Object.entries(sectionMetrics).reduce(
        (max, [section, data]) => data.totalTimeExpanded > (max.time || 0) 
          ? { section, time: data.totalTimeExpanded } : max,
        {}
      ).section
    };
  }, [fieldInteractions, sectionMetrics]);

  /**
   * Get analytics summary
   */
  const getAnalyticsSummary = useCallback(() => {
    return {
      events: events.slice(-20), // Last 20 events
      sessionData: {
        ...sessionData,
        sessionId: currentSessionId,
        startTime: sessionStartTime.current,
        duration: Date.now() - sessionStartTime.current
      },
      performanceMetrics: getPerformanceMetrics(),
      fieldInteractions,
      sectionMetrics,
      completionInsights: getCompletionInsights(),
      behaviorPattern: analyzeUserBehavior()
    };
  }, [events, sessionData, currentSessionId, getPerformanceMetrics, fieldInteractions, sectionMetrics, getCompletionInsights, analyzeUserBehavior]);

  /**
   * Export analytics data
   */
  const exportAnalytics = useCallback(() => {
    const data = getAnalyticsSummary();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-settings-analytics-${currentSessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [getAnalyticsSummary, currentSessionId]);

  // Effect: Track form load on mount
  useEffect(() => {
    if (shouldTrack()) {
      trackFormLoad();
    }
  }, [shouldTrack, trackFormLoad]);

  // Effect: Set up performance monitoring
  useEffect(() => {
    if (!shouldTrack()) return;

    const updatePerformanceMetrics = () => {
      setPerformanceMetrics(getPerformanceMetrics());
    };

    const interval = setInterval(updatePerformanceMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [shouldTrack, getPerformanceMetrics]);

  return {
    // Event tracking functions
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackSectionExpand,
    trackSectionCollapse,
    trackFormSubmit,
    trackFormSuccess,
    trackFormError,
    trackValidationError,
    trackAutoSave,
    trackFormReset,
    trackFormClear,
    trackKeyboardShortcut,

    // Analytics data
    getAnalytics: getAnalyticsSummary,
    getPerformanceMetrics,
    getCompletionInsights,

    // Utility functions
    exportAnalytics,
    
    // State
    events: events.slice(-10), // Last 10 events for debugging
    isTracking: shouldTrack(),
    sessionId: currentSessionId,
    
    // Behavior analysis
    behaviorPattern: analyzeUserBehavior(),
    fieldInteractions,
    sectionMetrics
  };
};

export default useAttendanceSettingsAnalytics;
