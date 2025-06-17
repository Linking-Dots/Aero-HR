import { useState, useEffect, useCallback, useMemo } from 'react';
import { DAILY_WORKS_DOWNLOAD_CONFIG } from '../config';

/**
 * Analytics tracking hook for Daily Works Download Form
 * Provides GDPR-compliant analytics and user behavior tracking
 */
export const useDailyWorksDownloadFormAnalytics = ({
    formId = 'daily-works-download',
    userId,
    sessionId,
    enableTracking = true
}) => {
    // Analytics state
    const [analytics, setAnalytics] = useState({
        sessionData: {
            sessionId,
            userId,
            startTime: Date.now(),
            formId,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        },
        events: [],
        performance: {
            interactionCount: 0,
            totalTimeSpent: 0,
            errorsEncountered: 0,
            completionRate: 0
        },
        behavior: {
            columnSelections: {},
            formatPreferences: {},
            stepNavigation: [],
            errorPatterns: []
        }
    });

    // Event queue for batch processing
    const [eventQueue, setEventQueue] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Performance tracking
    const [performanceMetrics, setPerformanceMetrics] = useState({
        formLoadTime: 0,
        validationTime: 0,
        exportTime: 0,
        userActions: 0,
        errorCount: 0
    });

    // User behavior patterns
    const [behaviorPatterns, setBehaviorPatterns] = useState({
        frequentColumns: new Map(),
        formatUsage: new Map(),
        errorFrequency: new Map(),
        timeSpentPerStep: new Map(),
        navigationPatterns: []
    });

    // Initialize analytics on mount
    useEffect(() => {
        if (!enableTracking) return;

        const loadStartTime = Date.now();
        
        // Track form initialization
        trackEvent('form_initialized', {
            formId,
            loadTime: Date.now() - loadStartTime,
            viewport: analytics.sessionData.viewport,
            userAgent: analytics.sessionData.userAgent
        });

        // Set up performance observer
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        updatePerformanceMetrics(entry.name, entry.duration);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        }

        // Cleanup function
        return () => {
            flushEvents();
        };
    }, [enableTracking, formId]);

    // Track form events
    const trackEvent = useCallback((eventType, eventData = {}) => {
        if (!enableTracking) return;

        const event = {
            eventType,
            timestamp: Date.now(),
            formId,
            userId,
            sessionId,
            data: {
                ...eventData,
                url: window.location.href,
                referrer: document.referrer,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        // Add to event queue
        setEventQueue(prev => [...prev, event]);

        // Update analytics state
        setAnalytics(prev => ({
            ...prev,
            events: [...prev.events, event],
            performance: {
                ...prev.performance,
                interactionCount: prev.performance.interactionCount + 1
            }
        }));

        // Process events if queue is full
        if (eventQueue.length >= DAILY_WORKS_DOWNLOAD_CONFIG.analytics.batchSize) {
            processEventQueue();
        }
    }, [enableTracking, eventQueue.length, formId, userId, sessionId]);

    // Track column selection behavior
    const trackColumnSelection = useCallback((columnKey, isSelected, category) => {
        trackEvent('column_selected', {
            columnKey,
            isSelected,
            category,
            selectionMethod: 'manual'
        });

        // Update behavior patterns
        setBehaviorPatterns(prev => {
            const newFrequent = new Map(prev.frequentColumns);
            const currentCount = newFrequent.get(columnKey) || 0;
            newFrequent.set(columnKey, currentCount + 1);

            return {
                ...prev,
                frequentColumns: newFrequent
            };
        });
    }, [trackEvent]);

    // Track format selection
    const trackFormatSelection = useCallback((format, previousFormat, reason = 'user_selection') => {
        trackEvent('format_changed', {
            newFormat: format,
            previousFormat,
            reason,
            timestamp: Date.now()
        });

        // Update format usage patterns
        setBehaviorPatterns(prev => {
            const newUsage = new Map(prev.formatUsage);
            const currentCount = newUsage.get(format) || 0;
            newUsage.set(format, currentCount + 1);

            return {
                ...prev,
                formatUsage: newUsage
            };
        });
    }, [trackEvent]);

    // Track step navigation
    const trackStepNavigation = useCallback((fromStep, toStep, navigationType = 'next') => {
        const startTime = Date.now();
        
        trackEvent('step_navigation', {
            fromStep,
            toStep,
            navigationType,
            timestamp: startTime
        });

        // Update step timing
        setBehaviorPatterns(prev => {
            const newTiming = new Map(prev.timeSpentPerStep);
            if (fromStep !== null) {
                const timeSpent = startTime - (prev.lastStepTime || startTime);
                newTiming.set(fromStep, (newTiming.get(fromStep) || 0) + timeSpent);
            }

            return {
                ...prev,
                timeSpentPerStep: newTiming,
                lastStepTime: startTime,
                navigationPatterns: [...prev.navigationPatterns, {
                    from: fromStep,
                    to: toStep,
                    type: navigationType,
                    timestamp: startTime
                }]
            };
        });
    }, [trackEvent]);

    // Track export actions
    const trackExportAction = useCallback((action, metadata = {}) => {
        const exportEvent = {
            action,
            timestamp: Date.now(),
            metadata: {
                ...metadata,
                performanceMode: metadata.performanceMode || 'balanced',
                recordCount: metadata.recordCount || 0,
                columnCount: metadata.columnCount || 0
            }
        };

        trackEvent('export_action', exportEvent);

        // Track export performance
        if (action === 'export_completed') {
            setPerformanceMetrics(prev => ({
                ...prev,
                exportTime: metadata.exportTime || 0
            }));
        }
    }, [trackEvent]);

    // Track validation errors
    const trackValidationError = useCallback((errorType, errorMessage, fieldName = null) => {
        trackEvent('validation_error', {
            errorType,
            errorMessage,
            fieldName,
            timestamp: Date.now()
        });

        // Update error patterns
        setBehaviorPatterns(prev => {
            const newErrors = new Map(prev.errorFrequency);
            const currentCount = newErrors.get(errorType) || 0;
            newErrors.set(errorType, currentCount + 1);

            return {
                ...prev,
                errorFrequency: newErrors
            };
        });

        setPerformanceMetrics(prev => ({
            ...prev,
            errorCount: prev.errorCount + 1
        }));
    }, [trackEvent]);

    // Track performance metrics
    const updatePerformanceMetrics = useCallback((metricName, value) => {
        setPerformanceMetrics(prev => ({
            ...prev,
            [metricName]: value
        }));
    }, []);

    // Process event queue
    const processEventQueue = useCallback(async () => {
        if (isProcessing || eventQueue.length === 0) return;

        setIsProcessing(true);

        try {
            // Simulate API call to analytics service
            const batch = {
                sessionId,
                userId,
                formId,
                events: eventQueue,
                timestamp: Date.now(),
                batchSize: eventQueue.length
            };

            // In a real implementation, you would send this to your analytics service
            console.log('Analytics Batch:', batch);

            // Clear processed events
            setEventQueue([]);

        } catch (error) {
            console.error('Failed to process analytics events:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, eventQueue, sessionId, userId, formId]);

    // Flush all pending events
    const flushEvents = useCallback(async () => {
        if (eventQueue.length > 0) {
            await processEventQueue();
        }
    }, [eventQueue.length, processEventQueue]);

    // Get analytics insights
    const getAnalyticsInsights = useMemo(() => {
        const insights = {
            topColumns: Array.from(behaviorPatterns.frequentColumns.entries())
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([column, count]) => ({ column, count })),
            
            preferredFormats: Array.from(behaviorPatterns.formatUsage.entries())
                .sort(([,a], [,b]) => b - a)
                .map(([format, count]) => ({ format, count })),
            
            commonErrors: Array.from(behaviorPatterns.errorFrequency.entries())
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([error, count]) => ({ error, count })),
            
            averageStepTime: Array.from(behaviorPatterns.timeSpentPerStep.entries())
                .map(([step, time]) => ({ step, time: Math.round(time / 1000) })),
            
            navigationEfficiency: behaviorPatterns.navigationPatterns.length > 0 ? {
                totalNavigations: behaviorPatterns.navigationPatterns.length,
                backwardNavigations: behaviorPatterns.navigationPatterns.filter(nav => nav.type === 'back').length,
                jumpNavigations: behaviorPatterns.navigationPatterns.filter(nav => nav.type === 'jump').length
            } : null,
            
            overallPerformance: {
                ...performanceMetrics,
                completionRate: analytics.performance.completionRate,
                averageInteractionTime: analytics.events.length > 0 ? 
                    (Date.now() - analytics.sessionData.startTime) / analytics.events.length : 0
            }
        };

        return insights;
    }, [behaviorPatterns, performanceMetrics, analytics]);

    // Periodic event processing
    useEffect(() => {
        if (!enableTracking) return;

        const interval = setInterval(() => {
            if (eventQueue.length > 0) {
                processEventQueue();
            }
        }, DAILY_WORKS_DOWNLOAD_CONFIG.analytics.flushInterval);

        return () => clearInterval(interval);
    }, [enableTracking, eventQueue.length, processEventQueue]);

    // GDPR compliance methods
    const clearAnalyticsData = useCallback(() => {
        setAnalytics({
            sessionData: analytics.sessionData,
            events: [],
            performance: {
                interactionCount: 0,
                totalTimeSpent: 0,
                errorsEncountered: 0,
                completionRate: 0
            },
            behavior: {
                columnSelections: {},
                formatPreferences: {},
                stepNavigation: [],
                errorPatterns: []
            }
        });
        setEventQueue([]);
        setBehaviorPatterns({
            frequentColumns: new Map(),
            formatUsage: new Map(),
            errorFrequency: new Map(),
            timeSpentPerStep: new Map(),
            navigationPatterns: []
        });
    }, [analytics.sessionData]);

    const exportAnalyticsData = useCallback(() => {
        return {
            analytics,
            eventQueue,
            performanceMetrics,
            behaviorPatterns: {
                ...behaviorPatterns,
                frequentColumns: Array.from(behaviorPatterns.frequentColumns.entries()),
                formatUsage: Array.from(behaviorPatterns.formatUsage.entries()),
                errorFrequency: Array.from(behaviorPatterns.errorFrequency.entries()),
                timeSpentPerStep: Array.from(behaviorPatterns.timeSpentPerStep.entries())
            },
            insights: getAnalyticsInsights
        };
    }, [analytics, eventQueue, performanceMetrics, behaviorPatterns, getAnalyticsInsights]);

    return {
        // Core tracking functions
        trackEvent,
        trackColumnSelection,
        trackFormatSelection,
        trackStepNavigation,
        trackExportAction,
        trackValidationError,
        updatePerformanceMetrics,
        
        // Analytics data
        analytics,
        performanceMetrics,
        behaviorPatterns,
        insights: getAnalyticsInsights,
        
        // Utility functions
        processEventQueue,
        flushEvents,
        clearAnalyticsData,
        exportAnalyticsData,
        
        // State indicators
        isProcessing,
        eventQueueSize: eventQueue.length,
        trackingEnabled: enableTracking
    };
};
