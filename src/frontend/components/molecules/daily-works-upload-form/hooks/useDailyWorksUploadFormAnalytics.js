import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing DailyWorksUploadForm analytics and tracking
 * 
 * Features:
 * - Upload performance monitoring
 * - User behavior analytics
 * - File processing metrics
 * - Error tracking and categorization
 * - GDPR-compliant data collection
 * - Real-time progress tracking
 */
export const useDailyWorksUploadFormAnalytics = (
  config = {},
  isEnabled = true
) => {
  const [analytics, setAnalytics] = useState({
    session: {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    upload: {
      totalFiles: 0,
      totalSize: 0,
      filesProcessed: 0,
      filesSuccessful: 0,
      filesFailed: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0
    },
    performance: {
      uploadSpeed: 0,
      processingSpeed: 0,
      memoryUsage: 0,
      renderTimes: [],
      validationTimes: []
    },
    interactions: {
      stepNavigation: [],
      fieldInteractions: [],
      fileOperations: [],
      validationTriggers: [],
      errorEncounters: []
    },
    errors: {
      validationErrors: [],
      uploadErrors: [],
      processingErrors: [],
      networkErrors: []
    },
    completion: {
      completionRate: 0,
      abandonment: null,
      finalStep: null,
      successfulUploads: 0
    }
  });

  const [isTracking, setIsTracking] = useState(isEnabled);
  const [privacyConsent, setPrivacyConsent] = useState(
    localStorage.getItem('analytics_consent') === 'true'
  );

  const trackingRef = useRef({
    stepStartTime: Date.now(),
    lastInteraction: Date.now(),
    activeFile: null,
    processingStartTime: null
  });

  const performanceObserver = useRef(null);

  // Initialize performance monitoring
  useEffect(() => {
    if (!isTracking || !privacyConsent) return;

    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            trackPerformanceMetric(entry.name, entry.duration);
          }
        });
      });

      performanceObserver.current.observe({ entryTypes: ['measure'] });
    }

    // Monitor memory usage (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        setAnalytics(prev => ({
          ...prev,
          performance: {
            ...prev.performance,
            memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024 // MB
          }
        }));
      }
    };

    const memoryInterval = setInterval(monitorMemory, 5000);

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      clearInterval(memoryInterval);
    };
  }, [isTracking, privacyConsent]);

  // Track step navigation
  const trackStepNavigation = useCallback((fromStep, toStep, method = 'next') => {
    if (!isTracking || !privacyConsent) return;

    const now = Date.now();
    const stepDuration = now - trackingRef.current.stepStartTime;

    setAnalytics(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        stepNavigation: [
          ...prev.interactions.stepNavigation,
          {
            timestamp: now,
            fromStep,
            toStep,
            method, // 'next', 'previous', 'direct'
            duration: stepDuration,
            sessionTime: now - prev.session.startTime
          }
        ]
      }
    }));

    trackingRef.current.stepStartTime = now;
  }, [isTracking, privacyConsent]);

  // Track field interactions
  const trackFieldInteraction = useCallback((fieldName, action, value = null) => {
    if (!isTracking || !privacyConsent) return;

    const now = Date.now();
    
    setAnalytics(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        fieldInteractions: [
          ...prev.interactions.fieldInteractions,
          {
            timestamp: now,
            fieldName,
            action, // 'focus', 'blur', 'change', 'validation'
            hasValue: value !== null && value !== '',
            sessionTime: now - prev.session.startTime
          }
        ]
      }
    }));

    trackingRef.current.lastInteraction = now;
  }, [isTracking, privacyConsent]);

  // Track file operations
  const trackFileOperation = useCallback((operation, fileInfo = {}, result = null) => {
    if (!isTracking || !privacyConsent) return;

    const now = Date.now();

    setAnalytics(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        fileOperations: [
          ...prev.interactions.fileOperations,
          {
            timestamp: now,
            operation, // 'select', 'drop', 'remove', 'parse', 'validate'
            fileName: fileInfo.name || 'unknown',
            fileSize: fileInfo.size || 0,
            fileType: fileInfo.type || 'unknown',
            result, // 'success', 'error', 'warning'
            sessionTime: now - prev.session.startTime
          }
        ]
      }
    }));
  }, [isTracking, privacyConsent]);

  // Track upload progress
  const trackUploadProgress = useCallback((fileIndex, progress, speed = null) => {
    if (!isTracking || !privacyConsent) return;

    setAnalytics(prev => ({
      ...prev,
      upload: {
        ...prev.upload,
        filesProcessed: Math.max(prev.upload.filesProcessed, fileIndex + 1)
      },
      performance: {
        ...prev.performance,
        uploadSpeed: speed || prev.performance.uploadSpeed
      }
    }));
  }, [isTracking, privacyConsent]);

  // Track file processing
  const trackFileProcessing = useCallback((fileInfo, processingTime, result) => {
    if (!isTracking || !privacyConsent) return;

    setAnalytics(prev => {
      const newTotalTime = prev.upload.totalProcessingTime + processingTime;
      const newProcessedCount = prev.upload.filesProcessed + 1;
      
      return {
        ...prev,
        upload: {
          ...prev.upload,
          totalProcessingTime: newTotalTime,
          averageProcessingTime: newTotalTime / newProcessedCount,
          filesSuccessful: result === 'success' ? prev.upload.filesSuccessful + 1 : prev.upload.filesSuccessful,
          filesFailed: result === 'error' ? prev.upload.filesFailed + 1 : prev.upload.filesFailed
        },
        performance: {
          ...prev.performance,
          processingSpeed: fileInfo.size / (processingTime / 1000) // bytes per second
        }
      };
    });
  }, [isTracking, privacyConsent]);

  // Track validation events
  const trackValidation = useCallback((type, field, result, duration = 0) => {
    if (!isTracking || !privacyConsent) return;

    const now = Date.now();

    setAnalytics(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        validationTriggers: [
          ...prev.interactions.validationTriggers,
          {
            timestamp: now,
            type, // 'field', 'form', 'file', 'data'
            field,
            result, // 'valid', 'invalid', 'warning'
            duration,
            sessionTime: now - prev.session.startTime
          }
        ]
      },
      performance: {
        ...prev.performance,
        validationTimes: [...prev.performance.validationTimes, duration]
      }
    }));
  }, [isTracking, privacyConsent]);

  // Track errors
  const trackError = useCallback((category, error, context = {}) => {
    if (!isTracking || !privacyConsent) return;

    const now = Date.now();
    const errorInfo = {
      timestamp: now,
      category, // 'validation', 'upload', 'processing', 'network'
      message: error.message || error,
      code: error.code || null,
      context,
      sessionTime: now - prev.session.startTime,
      userAgent: navigator.userAgent
    };

    setAnalytics(prev => ({
      ...prev,
      interactions: {
        ...prev.interactions,
        errorEncounters: [
          ...prev.interactions.errorEncounters,
          errorInfo
        ]
      },
      errors: {
        ...prev.errors,
        [`${category}Errors`]: [
          ...prev.errors[`${category}Errors`],
          errorInfo
        ]
      }
    }));
  }, [isTracking, privacyConsent]);

  // Track completion and abandonment
  const trackCompletion = useCallback((success = true, finalStep = null, uploadCount = 0) => {
    if (!isTracking || !privacyConsent) return;

    const now = Date.now();
    const sessionDuration = now - analytics.session.startTime;

    setAnalytics(prev => ({
      ...prev,
      completion: {
        completionRate: success ? 100 : (finalStep || 0) * 25, // Assuming 4 steps
        abandonment: success ? null : {
          step: finalStep,
          timestamp: now,
          sessionDuration,
          reason: 'user_abandonment'
        },
        finalStep,
        successfulUploads: uploadCount
      }
    }));
  }, [analytics.session.startTime, isTracking, privacyConsent]);

  // Track performance metrics
  const trackPerformanceMetric = useCallback((name, duration) => {
    if (!isTracking || !privacyConsent) return;

    setAnalytics(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        renderTimes: name.includes('render') 
          ? [...prev.performance.renderTimes, duration]
          : prev.performance.renderTimes
      }
    }));
  }, [isTracking, privacyConsent]);

  // Generate analytics report
  const generateReport = useCallback(() => {
    if (!privacyConsent) return null;

    const now = Date.now();
    const sessionDuration = now - analytics.session.startTime;

    return {
      session: {
        ...analytics.session,
        duration: sessionDuration,
        endTime: now
      },
      summary: {
        totalInteractions: analytics.interactions.fieldInteractions.length,
        totalValidations: analytics.interactions.validationTriggers.length,
        totalErrors: Object.values(analytics.errors).flat().length,
        averageStepTime: analytics.interactions.stepNavigation.length > 0
          ? analytics.interactions.stepNavigation.reduce((sum, nav) => sum + nav.duration, 0) / analytics.interactions.stepNavigation.length
          : 0,
        uploadSuccessRate: analytics.upload.totalFiles > 0
          ? (analytics.upload.filesSuccessful / analytics.upload.totalFiles) * 100
          : 0
      },
      performance: {
        ...analytics.performance,
        averageValidationTime: analytics.performance.validationTimes.length > 0
          ? analytics.performance.validationTimes.reduce((sum, time) => sum + time, 0) / analytics.performance.validationTimes.length
          : 0,
        averageRenderTime: analytics.performance.renderTimes.length > 0
          ? analytics.performance.renderTimes.reduce((sum, time) => sum + time, 0) / analytics.performance.renderTimes.length
          : 0
      },
      insights: generateInsights(analytics, sessionDuration)
    };
  }, [analytics, privacyConsent]);

  // Generate insights from analytics data
  const generateInsights = (data, sessionDuration) => {
    const insights = [];

    // Performance insights
    if (data.performance.averageValidationTime > 1000) {
      insights.push({
        type: 'performance',
        level: 'warning',
        message: 'Validation times are higher than expected',
        suggestion: 'Consider optimizing validation logic'
      });
    }

    if (data.performance.memoryUsage > 100) {
      insights.push({
        type: 'performance',
        level: 'warning',
        message: 'High memory usage detected',
        suggestion: 'Large file processing may impact performance'
      });
    }

    // User behavior insights
    if (data.interactions.errorEncounters.length > 5) {
      insights.push({
        type: 'usability',
        level: 'warning',
        message: 'Multiple errors encountered',
        suggestion: 'Review form validation and user guidance'
      });
    }

    if (sessionDuration > 300000) { // 5 minutes
      insights.push({
        type: 'usability',
        level: 'info',
        message: 'Extended session duration',
        suggestion: 'User may benefit from better workflow guidance'
      });
    }

    // Upload insights
    if (data.upload.filesFailed > data.upload.filesSuccessful) {
      insights.push({
        type: 'upload',
        level: 'error',
        message: 'High file processing failure rate',
        suggestion: 'Review file validation and processing logic'
      });
    }

    return insights;
  };

  // Privacy controls
  const updatePrivacyConsent = useCallback((consent) => {
    setPrivacyConsent(consent);
    localStorage.setItem('analytics_consent', consent.toString());
    
    if (!consent) {
      // Clear analytics data
      setAnalytics(prev => ({
        ...prev,
        interactions: {
          stepNavigation: [],
          fieldInteractions: [],
          fileOperations: [],
          validationTriggers: [],
          errorEncounters: []
        },
        errors: {
          validationErrors: [],
          uploadErrors: [],
          processingErrors: [],
          networkErrors: []
        }
      }));
    }
  }, []);

  // Export analytics data (GDPR compliance)
  const exportAnalyticsData = useCallback(() => {
    if (!privacyConsent) return null;

    return {
      exportDate: new Date().toISOString(),
      sessionId: analytics.session.id,
      data: generateReport()
    };
  }, [analytics, privacyConsent, generateReport]);

  return {
    // Analytics state
    analytics,
    isTracking,
    privacyConsent,
    
    // Tracking methods
    trackStepNavigation,
    trackFieldInteraction,
    trackFileOperation,
    trackUploadProgress,
    trackFileProcessing,
    trackValidation,
    trackError,
    trackCompletion,
    
    // Reporting
    generateReport,
    exportAnalyticsData,
    
    // Privacy controls
    updatePrivacyConsent,
    enableTracking: () => setIsTracking(true),
    disableTracking: () => setIsTracking(false),
    
    // Utility methods
    getSessionDuration: () => Date.now() - analytics.session.startTime,
    getInteractionCount: () => analytics.interactions.fieldInteractions.length,
    getErrorCount: () => Object.values(analytics.errors).flat().length,
    getUploadSuccessRate: () => analytics.upload.totalFiles > 0
      ? (analytics.upload.filesSuccessful / analytics.upload.totalFiles) * 100
      : 0
  };
};

export default useDailyWorksUploadFormAnalytics;
