import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for tracking Daily Work Summary Download Form analytics
 * 
 * Features:
 * - GDPR-compliant analytics tracking
 * - Export behavior monitoring
 * - Performance metrics collection
 * - User preference analysis
 * - Construction data insights
 */
export const useDailyWorkSummaryDownloadFormAnalytics = (
  filteredData = [],
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
  const [sessionId] = useState(() => `export_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [analyticsData, setAnalyticsData] = useState({
    sessionStartTime: Date.now(),
    events: [],
    performance: {},
    userBehavior: {},
    exportMetrics: {},
    preferences: {}
  });
  const [isTracking, setIsTracking] = useState(enableAnalytics);

  // Performance tracking
  const performanceRef = useRef({
    startTime: Date.now(),
    stepTimes: {},
    validationTimes: {},
    exportTimes: {}
  });

  // Event queue for batch processing
  const eventQueue = useRef([]);
  const batchTimeoutRef = useRef(null);

  // Track form session start
  const trackSessionStart = useCallback(() => {
    if (!isTracking) return;

    const event = {
      type: 'export_session_start',
      timestamp: Date.now(),
      sessionId,
      data: {
        dataRecordCount: filteredData.length,
        trackingLevel,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        screenResolution: typeof window !== 'undefined' 
          ? `${window.screen.width}x${window.screen.height}` 
          : 'Unknown'
      }
    };

    queueEvent(event);
  }, [isTracking, sessionId, filteredData.length, trackingLevel]);

  // Track step navigation
  const trackStepChange = useCallback((fromStep, toStep, method = 'navigation') => {
    if (!isTracking) return;

    const currentTime = Date.now();
    const stepDuration = performanceRef.current.stepTimes[fromStep] 
      ? currentTime - performanceRef.current.stepTimes[fromStep]
      : 0;

    performanceRef.current.stepTimes[toStep] = currentTime;

    const event = {
      type: 'export_step_change',
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

  // Track column selection
  const trackColumnSelection = useCallback((action, columnKey = null, selectedColumns = []) => {
    if (!isTracking) return;

    const event = {
      type: 'export_column_selection',
      timestamp: Date.now(),
      sessionId,
      data: {
        action, // 'select', 'deselect', 'select_all', 'deselect_all', 'category_toggle'
        columnKey,
        selectedCount: selectedColumns.filter(col => col.checked).length,
        totalColumns: selectedColumns.length,
        selectedCategories: [...new Set(selectedColumns.filter(col => col.checked).map(col => col.category))]
      }
    };

    queueEvent(event);

    // Update user preferences
    setAnalyticsData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        columnSelections: [...(prev.preferences.columnSelections || []), {
          action,
          columnKey,
          timestamp: Date.now()
        }]
      }
    }));
  }, [isTracking, sessionId]);

  // Track export format selection
  const trackExportFormat = useCallback((format, previousFormat = null) => {
    if (!isTracking) return;

    const event = {
      type: 'export_format_selection',
      timestamp: Date.now(),
      sessionId,
      data: {
        selectedFormat: format,
        previousFormat,
        isFormatChange: previousFormat && previousFormat !== format
      }
    };

    queueEvent(event);

    // Update preferences
    setAnalyticsData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        formatSelections: [...(prev.preferences.formatSelections || []), {
          format,
          timestamp: Date.now()
        }]
      }
    }));
  }, [isTracking, sessionId]);

  // Track export attempt
  const trackExportAttempt = useCallback((stage, details = {}) => {
    if (!isTracking) return;

    const event = {
      type: 'export_attempt',
      timestamp: Date.now(),
      sessionId,
      data: {
        stage, // 'initiated', 'processing', 'completed', 'failed'
        exportFormat: details.exportFormat,
        selectedColumnCount: details.selectedColumnCount || 0,
        recordCount: details.recordCount || filteredData.length,
        fileSize: details.fileSize,
        processingTime: details.processingTime,
        success: details.success || false,
        errorType: details.errorType,
        performanceLevel: details.performanceLevel
      }
    };

    queueEvent(event);

    // Update export metrics
    setAnalyticsData(prev => ({
      ...prev,
      exportMetrics: {
        ...prev.exportMetrics,
        attempts: (prev.exportMetrics.attempts || 0) + 1,
        [stage]: (prev.exportMetrics[stage] || 0) + 1,
        lastAttempt: {
          timestamp: Date.now(),
          stage,
          success: details.success
        }
      }
    }));
  }, [isTracking, sessionId, filteredData.length]);

  // Track user interactions
  const trackInteraction = useCallback((interactionType, details = {}) => {
    if (!isTracking || trackingLevel === 'minimal') return;

    const event = {
      type: 'export_interaction',
      timestamp: Date.now(),
      sessionId,
      data: {
        interaction: interactionType, // 'column_hover', 'tooltip_view', 'help_click', 'preview_toggle'
        element: details.element,
        duration: details.duration || 0,
        value: gdprCompliant && details.sensitive ? '[REDACTED]' : details.value
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
        type: 'export_performance',
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

  // Track data insights
  const trackDataInsights = useCallback(() => {
    if (!isTracking || !filteredData.length) return;

    // Calculate construction-specific insights
    const insights = {
      recordCount: filteredData.length,
      dateRange: {
        earliest: null,
        latest: null
      },
      workTypes: {
        embankment: 0,
        structure: 0,
        pavement: 0
      },
      completionStats: {
        averageCompletion: 0,
        totalCompleted: 0,
        totalPending: 0
      },
      rfiStats: {
        totalSubmissions: 0,
        averageSubmissionRate: 0
      }
    };

    // Calculate date range
    const dates = filteredData
      .map(row => row.date)
      .filter(date => date)
      .map(date => new Date(date))
      .sort();
    
    if (dates.length > 0) {
      insights.dateRange.earliest = dates[0];
      insights.dateRange.latest = dates[dates.length - 1];
    }

    // Calculate work type totals
    filteredData.forEach(row => {
      insights.workTypes.embankment += row.embankment || 0;
      insights.workTypes.structure += row.structure || 0;
      insights.workTypes.pavement += row.pavement || 0;
      
      insights.completionStats.totalCompleted += row.completed || 0;
      insights.completionStats.totalPending += (row.totalDailyWorks || 0) - (row.completed || 0);
      
      insights.rfiStats.totalSubmissions += row.rfiSubmissions || 0;
    });

    // Calculate averages
    insights.completionStats.averageCompletion = filteredData.length > 0
      ? (insights.completionStats.totalCompleted / filteredData.reduce((sum, row) => sum + (row.totalDailyWorks || 0), 0)) * 100
      : 0;

    insights.rfiStats.averageSubmissionRate = filteredData.length > 0
      ? (insights.rfiStats.totalSubmissions / filteredData.reduce((sum, row) => sum + (row.totalDailyWorks || 0), 0)) * 100
      : 0;

    const event = {
      type: 'export_data_insights',
      timestamp: Date.now(),
      sessionId,
      data: insights
    };

    queueEvent(event);

    return insights;
  }, [isTracking, sessionId, filteredData]);

  // Track completion
  const trackCompletion = useCallback((status, details = {}) => {
    if (!isTracking) return;

    const totalTime = Date.now() - performanceRef.current.startTime;

    const event = {
      type: 'export_completion',
      timestamp: Date.now(),
      sessionId,
      data: {
        status, // 'completed', 'abandoned', 'failed', 'cancelled'
        totalTime,
        stepsCompleted: details.stepsCompleted || 0,
        exportFormat: details.exportFormat,
        selectedColumns: details.selectedColumns || 0,
        recordCount: details.recordCount || filteredData.length,
        fileSize: details.fileSize,
        reason: details.reason
      }
    };

    queueEvent(event);

    // Update analytics data
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
  }, [isTracking, sessionId, filteredData.length]);

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

    console.debug('Daily Work Summary Export Analytics - Batch sent:', events.length, 'events');
  }, []);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const insights = trackDataInsights();
    
    return {
      sessionId,
      sessionDuration: Date.now() - analyticsData.sessionStartTime,
      eventCount: analyticsData.events.length,
      performance: analyticsData.performance,
      userBehavior: analyticsData.userBehavior,
      exportMetrics: analyticsData.exportMetrics,
      preferences: analyticsData.preferences,
      dataInsights: insights,
      isTracking,
      trackingLevel
    };
  }, [sessionId, analyticsData, isTracking, trackingLevel, trackDataInsights]);

  // Initialize tracking
  useEffect(() => {
    if (isTracking) {
      trackSessionStart();
      
      // Track initial data insights
      setTimeout(() => trackDataInsights(), 1000);
    }

    // Cleanup on unmount
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      flushEventQueue();
    };
  }, [isTracking, trackSessionStart, trackDataInsights, flushEventQueue]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (analyticsData.completion?.status !== 'completed') {
        trackCompletion('abandoned', {
          reason: 'page_unload'
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [analyticsData.completion, trackCompletion]);

  return {
    // Core tracking methods
    trackSessionStart,
    trackStepChange,
    trackColumnSelection,
    trackExportFormat,
    trackExportAttempt,
    trackInteraction,
    trackPerformance,
    trackDataInsights,
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
    },

    // Specialized tracking
    trackColumnPreferences: (selectedColumns) => {
      const preferences = {
        selectedCategories: [...new Set(selectedColumns.filter(col => col.checked).map(col => col.category))],
        selectedCount: selectedColumns.filter(col => col.checked).length,
        commonColumns: selectedColumns.filter(col => col.checked && col.defaultChecked).length,
        customColumns: selectedColumns.filter(col => col.checked && !col.defaultChecked).length
      };

      trackInteraction('column_preferences_set', preferences);
      return preferences;
    }
  };
};

export default useDailyWorkSummaryDownloadFormAnalytics;
