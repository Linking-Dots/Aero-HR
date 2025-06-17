/**
 * Holiday Form Analytics Hook
 * 
 * Comprehensive analytics and behavior tracking for holiday form interactions
 * with performance monitoring and user experience insights.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { holidayFormConfig } from '../config.js';

/**
 * User behavior patterns for classification
 */
const BEHAVIOR_PATTERNS = {
  SYSTEMATIC: 'systematic',     // Fills fields in order
  RANDOM: 'random',            // Jumps around fields
  FOCUSED: 'focused',          // Spends time on specific fields
  QUICK: 'quick',              // Fast completion
  HESITANT: 'hesitant'         // Lots of changes and corrections
};

/**
 * Holiday form analytics hook
 * 
 * @param {Object} options - Analytics configuration
 * @param {boolean} options.enabled - Enable analytics tracking
 * @param {string} options.sessionId - Unique session identifier
 * @param {boolean} options.trackBehavior - Track user behavior patterns
 * @param {boolean} options.trackPerformance - Track performance metrics
 * @param {boolean} options.trackErrors - Track error patterns
 * @param {Function} options.onEvent - Custom event handler
 * @param {boolean} options.enableExport - Enable data export functionality
 * @param {boolean} options.debug - Enable debug logging
 * 
 * @returns {Object} Analytics state and functions
 */
export const useHolidayFormAnalytics = (options = {}) => {
  const {
    enabled = true,
    sessionId = `holiday_form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    trackBehavior = true,
    trackPerformance = true,
    trackErrors = true,
    onEvent = null,
    enableExport = true,
    debug = false
  } = options;

  // Analytics state
  const [sessionData, setSessionData] = useState({
    sessionId,
    startTime: Date.now(),
    endTime: null,
    totalInteractions: 0,
    fieldOrder: [],
    completedFields: new Set(),
    errorCount: 0,
    correctionCount: 0
  });

  const [fieldInteractions, setFieldInteractions] = useState({});
  const [behaviorMetrics, setBehaviorMetrics] = useState({
    focusPattern: [],
    typingPattern: [],
    navigationPattern: [],
    errorPattern: []
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    formLoadTime: 0,
    averageFieldTime: 0,
    totalFormTime: 0,
    validationResponseTimes: [],
    dateSelectionTimes: []
  });

  // Refs for tracking
  const startTimeRef = useRef(Date.now());
  const fieldStartTimes = useRef({});
  const lastFocusedField = useRef(null);
  const keystrokes = useRef({});
  const mouseClicks = useRef([]);

  /**
   * Track event with analytics
   */
  const trackEvent = useCallback((eventType, eventData = {}) => {
    if (!enabled) return;

    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId,
      data: eventData
    };

    if (debug) {
      console.log('Holiday Analytics:', event);
    }

    // Update session data
    setSessionData(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1
    }));

    // Call external event handler
    if (onEvent) {
      onEvent(event);
    }

    // Track specific events
    switch (eventType) {
      case 'field_focus':
        trackFieldFocus(eventData.fieldName);
        break;
      case 'field_blur':
        trackFieldBlur(eventData.fieldName);
        break;
      case 'field_change':
        trackFieldChange(eventData.fieldName, eventData.value);
        break;
      case 'validation_error':
        trackValidationError(eventData.fieldName, eventData.error);
        break;
      case 'date_selected':
        trackDateSelection(eventData.fieldName, eventData.value);
        break;
    }
  }, [enabled, sessionId, debug, onEvent]);

  /**
   * Track field focus events
   */
  const trackFieldFocus = useCallback((fieldName) => {
    if (!trackBehavior) return;

    const timestamp = Date.now();
    fieldStartTimes.current[fieldName] = timestamp;
    lastFocusedField.current = fieldName;

    // Update field interactions
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        focusCount: (prev[fieldName]?.focusCount || 0) + 1,
        lastFocused: timestamp
      }
    }));

    // Update behavior metrics
    setBehaviorMetrics(prev => ({
      ...prev,
      focusPattern: [...prev.focusPattern, { fieldName, timestamp }].slice(-50) // Keep last 50
    }));

    // Update field order if new field
    setSessionData(prev => {
      const newFieldOrder = [...prev.fieldOrder];
      if (!newFieldOrder.includes(fieldName)) {
        newFieldOrder.push(fieldName);
      }
      return { ...prev, fieldOrder: newFieldOrder };
    });
  }, [trackBehavior]);

  /**
   * Track field blur events
   */
  const trackFieldBlur = useCallback((fieldName) => {
    if (!trackBehavior) return;

    const timestamp = Date.now();
    const startTime = fieldStartTimes.current[fieldName];
    const timeSpent = startTime ? timestamp - startTime : 0;

    // Update field interactions
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        lastBlurred: timestamp,
        timeSpent: (prev[fieldName]?.timeSpent || 0) + timeSpent
      }
    }));
  }, [trackBehavior]);

  /**
   * Track field changes
   */
  const trackFieldChange = useCallback((fieldName, value) => {
    if (!trackBehavior) return;

    const timestamp = Date.now();

    // Update field interactions
    setFieldInteractions(prev => {
      const previous = prev[fieldName] || {};
      const changeCount = previous.changeCount || 0;
      const hasValue = value && value.toString().trim() !== '';

      return {
        ...prev,
        [fieldName]: {
          ...previous,
          changeCount: changeCount + 1,
          lastChanged: timestamp,
          hasValue,
          lastValue: value
        }
      };
    });

    // Track completed fields
    if (value && value.toString().trim() !== '') {
      setSessionData(prev => ({
        ...prev,
        completedFields: new Set([...prev.completedFields, fieldName])
      }));
    }

    // Track keystroke patterns
    if (typeof value === 'string') {
      keystrokes.current[fieldName] = (keystrokes.current[fieldName] || 0) + 1;
    }
  }, [trackBehavior]);

  /**
   * Track validation errors
   */
  const trackValidationError = useCallback((fieldName, error) => {
    if (!trackErrors) return;

    const timestamp = Date.now();

    // Update session error count
    setSessionData(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1
    }));

    // Update behavior metrics
    setBehaviorMetrics(prev => ({
      ...prev,
      errorPattern: [
        ...prev.errorPattern,
        { fieldName, error, timestamp }
      ].slice(-20) // Keep last 20 errors
    }));
  }, [trackErrors]);

  /**
   * Track date selection performance
   */
  const trackDateSelection = useCallback((fieldName, value) => {
    if (!trackPerformance) return;

    const selectionTime = Date.now() - (fieldStartTimes.current[fieldName] || Date.now());

    setPerformanceMetrics(prev => ({
      ...prev,
      dateSelectionTimes: [
        ...prev.dateSelectionTimes,
        { fieldName, value, selectionTime, timestamp: Date.now() }
      ].slice(-10) // Keep last 10 selections
    }));
  }, [trackPerformance]);

  /**
   * Analyze user behavior patterns
   */
  const analyzeBehaviorPattern = useMemo(() => {
    if (!trackBehavior) return { pattern: 'unknown', confidence: 0 };

    const { focusPattern } = behaviorMetrics;
    const { fieldOrder } = sessionData;

    if (focusPattern.length < 3) {
      return { pattern: 'insufficient_data', confidence: 0 };
    }

    // Analyze focus pattern for systematic vs random behavior
    const expectedOrder = ['title', 'fromDate', 'toDate', 'type', 'description'];
    const actualOrder = fieldOrder;
    
    const systematicScore = expectedOrder.reduce((score, field, index) => {
      const actualIndex = actualOrder.indexOf(field);
      return actualIndex === index ? score + 1 : score;
    }, 0) / expectedOrder.length;

    // Analyze time spent patterns
    const fieldTimes = Object.values(fieldInteractions).map(f => f.timeSpent || 0);
    const avgTime = fieldTimes.reduce((sum, time) => sum + time, 0) / fieldTimes.length;
    const timeVariance = fieldTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / fieldTimes.length;

    // Determine pattern
    if (systematicScore > 0.8) {
      return { pattern: BEHAVIOR_PATTERNS.SYSTEMATIC, confidence: systematicScore };
    } else if (timeVariance > avgTime * 2) {
      return { pattern: BEHAVIOR_PATTERNS.FOCUSED, confidence: 0.7 };
    } else if (avgTime < 5000) { // Less than 5 seconds per field
      return { pattern: BEHAVIOR_PATTERNS.QUICK, confidence: 0.8 };
    } else if (sessionData.correctionCount > sessionData.totalInteractions * 0.3) {
      return { pattern: BEHAVIOR_PATTERNS.HESITANT, confidence: 0.7 };
    } else {
      return { pattern: BEHAVIOR_PATTERNS.RANDOM, confidence: 0.6 };
    }
  }, [trackBehavior, behaviorMetrics, sessionData, fieldInteractions]);

  /**
   * Calculate form completion metrics
   */
  const completionMetrics = useMemo(() => {
    const requiredFields = ['title', 'fromDate', 'toDate', 'type'];
    const completedCount = requiredFields.filter(field => 
      sessionData.completedFields.has(field)
    ).length;
    
    const totalFields = Object.keys(holidayFormConfig.fieldConfigs).length;
    const allCompletedCount = Array.from(sessionData.completedFields).length;

    return {
      requiredCompletion: (completedCount / requiredFields.length) * 100,
      totalCompletion: (allCompletedCount / totalFields) * 100,
      completedFields: Array.from(sessionData.completedFields),
      missingRequiredFields: requiredFields.filter(field => 
        !sessionData.completedFields.has(field)
      )
    };
  }, [sessionData.completedFields]);

  /**
   * Performance insights
   */
  const performanceInsights = useMemo(() => {
    const currentTime = Date.now();
    const sessionDuration = currentTime - startTimeRef.current;
    
    const fieldTimes = Object.values(fieldInteractions).map(f => f.timeSpent || 0);
    const avgFieldTime = fieldTimes.length > 0 
      ? fieldTimes.reduce((sum, time) => sum + time, 0) / fieldTimes.length 
      : 0;

    const slowestField = Object.entries(fieldInteractions).reduce((slowest, [field, data]) => {
      const time = data.timeSpent || 0;
      return time > (slowest.time || 0) ? { field, time } : slowest;
    }, {});

    return {
      sessionDuration,
      averageFieldTime: avgFieldTime,
      slowestField: slowestField.field || null,
      slowestFieldTime: slowestField.time || 0,
      totalKeystrokes: Object.values(keystrokes.current).reduce((sum, count) => sum + count, 0),
      interactionRate: sessionDuration > 0 ? (sessionData.totalInteractions / sessionDuration) * 1000 : 0 // interactions per second
    };
  }, [fieldInteractions, sessionData.totalInteractions]);

  /**
   * Export analytics data
   */
  const exportAnalytics = useCallback(() => {
    if (!enableExport) return null;

    const exportData = {
      session: {
        ...sessionData,
        endTime: Date.now(),
        duration: Date.now() - startTimeRef.current
      },
      fieldInteractions,
      behaviorMetrics,
      performanceMetrics,
      behaviorPattern: analyzeBehaviorPattern,
      completionMetrics,
      performanceInsights,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        formType: 'holiday',
        analyticsEnabled: enabled
      }
    };

    if (debug) {
      console.log('Holiday Analytics Export:', exportData);
    }

    return exportData;
  }, [
    enableExport,
    sessionData,
    fieldInteractions,
    behaviorMetrics,
    performanceMetrics,
    analyzeBehaviorPattern,
    completionMetrics,
    performanceInsights,
    enabled,
    debug
  ]);

  /**
   * Get insights and recommendations
   */
  const getInsights = useCallback(() => {
    const insights = [];
    const recommendations = [];

    // Behavior insights
    const pattern = analyzeBehaviorPattern;
    if (pattern.pattern === BEHAVIOR_PATTERNS.HESITANT) {
      insights.push('User shows hesitant behavior with frequent corrections');
      recommendations.push('Consider providing clearer field descriptions or examples');
    } else if (pattern.pattern === BEHAVIOR_PATTERNS.QUICK) {
      insights.push('User completes form quickly and efficiently');
      recommendations.push('Form design is working well for this user type');
    }

    // Performance insights
    const perf = performanceInsights;
    if (perf.averageFieldTime > 15000) { // 15 seconds
      insights.push('User spends significant time on fields');
      recommendations.push('Consider simplifying field interfaces or adding help text');
    }

    // Completion insights
    const completion = completionMetrics;
    if (completion.requiredCompletion < 100) {
      insights.push(`Missing required fields: ${completion.missingRequiredFields.join(', ')}`);
      recommendations.push('Highlight required fields more prominently');
    }

    // Error insights
    if (sessionData.errorCount > 3) {
      insights.push('High number of validation errors encountered');
      recommendations.push('Review validation messages for clarity');
    }

    return { insights, recommendations };
  }, [analyzeBehaviorPattern, performanceInsights, completionMetrics, sessionData.errorCount]);

  /**
   * Initialize analytics session
   */
  useEffect(() => {
    if (enabled) {
      trackEvent('session_started', { formType: 'holiday' });
    }
  }, [enabled, trackEvent]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (enabled) {
        setSessionData(prev => ({
          ...prev,
          endTime: Date.now()
        }));
        trackEvent('session_ended', { 
          duration: Date.now() - startTimeRef.current 
        });
      }
    };
  }, [enabled, trackEvent]);

  return {
    // Analytics state
    sessionData,
    fieldInteractions,
    behaviorMetrics,
    performanceMetrics,
    
    // Computed data
    behaviorPattern: analyzeBehaviorPattern,
    completionMetrics,
    performanceInsights,
    
    // Functions
    trackEvent,
    exportAnalytics,
    getInsights,
    
    // Metadata
    enabled,
    sessionId
  };
};

export default useHolidayFormAnalytics;
