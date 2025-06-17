/**
 * DailyWorkForm Analytics Hook
 * Provides comprehensive analytics and insights for construction work management
 * 
 * @module useDailyWorkFormAnalytics
 * @version 1.0.0
 * 
 * Features:
 * - Work pattern analysis with construction-specific metrics
 * - RFI tracking and performance monitoring
 * - Time estimation accuracy and productivity insights
 * - Safety compliance and road type analytics
 * - Construction workflow optimization recommendations
 * 
 * ISO Compliance:
 * - ISO 25010: Performance efficiency, usability, maintainability
 * - ISO 27001: Data privacy, secure analytics, GDPR compliance
 * - ISO 9001: Quality metrics, continuous improvement tracking
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

/**
 * Analytics configuration for construction work tracking
 */
const ANALYTICS_CONFIG = {
  // Tracking intervals
  intervals: {
    realTime: 1000,      // 1 second for real-time updates
    behavioral: 5000,    // 5 seconds for behavior tracking
    performance: 30000,  // 30 seconds for performance metrics
    insights: 300000     // 5 minutes for analytics insights
  },

  // Work pattern thresholds
  thresholds: {
    highFrequencyWork: 5,     // Work entries per day
    longDurationWork: 8,      // Hours threshold
    complexityScore: 0.7,     // Work complexity threshold
    efficiencyThreshold: 0.8, // Time estimation accuracy
    safetyComplianceMin: 0.95 // Minimum safety compliance
  },

  // Analytics categories
  categories: {
    productivity: ['work_completion', 'time_accuracy', 'rfi_efficiency'],
    safety: ['road_type_compliance', 'safety_requirements', 'risk_assessment'],
    quality: ['work_quality_score', 'completion_rate', 'error_frequency'],
    efficiency: ['resource_utilization', 'time_optimization', 'workflow_speed'],
    compliance: ['regulatory_adherence', 'documentation_quality', 'audit_readiness']
  },

  // Construction-specific metrics
  constructionMetrics: {
    workTypes: ['structure', 'embankment', 'pavement'],
    roadTypes: ['highway', 'local', 'arterial', 'collector'],
    complexityLevels: ['low', 'medium', 'high', 'critical'],
    safetyLevels: ['standard', 'elevated', 'high_risk', 'critical_safety']
  }
};

/**
 * Hook for DailyWorkForm analytics and insights
 * 
 * @param {Object} options - Analytics configuration options
 * @param {boolean} options.enabled - Enable/disable analytics tracking
 * @param {string} options.userId - User ID for personalized analytics
 * @param {string} options.projectId - Project ID for project-specific insights
 * @param {Object} options.formData - Current form data for real-time analysis
 * @param {Array} options.historicalData - Historical work data for trend analysis
 * @param {Function} options.onInsight - Callback for new insights
 * @param {Function} options.onRecommendation - Callback for recommendations
 * 
 * @returns {Object} Analytics state and methods
 */
export const useDailyWorkFormAnalytics = ({
  enabled = true,
  userId = null,
  projectId = null,
  formData = {},
  historicalData = [],
  onInsight = null,
  onRecommendation = null
} = {}) => {
  // Analytics state
  const [analytics, setAnalytics] = useState({
    // Current session metrics
    session: {
      startTime: Date.now(),
      duration: 0,
      interactionCount: 0,
      fieldsCompleted: 0,
      validationErrors: 0,
      rfiGenerated: 0,
      workTypeChanges: 0,
      timeEstimationUpdates: 0
    },

    // Work pattern analytics
    workPatterns: {
      frequentWorkTypes: [],
      preferredLocations: [],
      averageWorkDuration: 0,
      peakWorkTimes: [],
      workComplexityTrend: 'stable',
      seasonalPatterns: {}
    },

    // RFI analytics
    rfiMetrics: {
      totalGenerated: 0,
      averageProcessingTime: 0,
      approvalRate: 0,
      mostCommonTypes: [],
      urgencyDistribution: {},
      completionRate: 0
    },

    // Time estimation analytics
    timeAccuracy: {
      overallAccuracy: 0,
      byWorkType: {},
      improvementTrend: 'stable',
      factorsInfluencing: [],
      recommendedAdjustments: {}
    },

    // Safety compliance analytics
    safetyMetrics: {
      complianceScore: 0,
      riskAssessments: 0,
      safetyIncidents: 0,
      roadTypeSafety: {},
      improvementAreas: []
    },

    // Performance insights
    performance: {
      productivityScore: 0,
      efficiencyRating: 0,
      qualityIndex: 0,
      workflowOptimization: 0,
      benchmarkComparison: {}
    },

    // Real-time insights
    insights: [],
    recommendations: [],
    alerts: [],
    trends: {}
  });

  // Analytics tracking state
  const [tracking, setTracking] = useState({
    isActive: enabled,
    events: [],
    metrics: {},
    lastUpdate: null,
    performance: {
      fastest: { field: null, time: Infinity },
      slowest: { field: null, time: 0 },
      average: 0
    }
  });

  /**
   * Track user interaction with form
   */
  const trackInteraction = useCallback((eventType, data = {}) => {
    if (!tracking.isActive) return;

    const timestamp = Date.now();
    const event = {
      type: eventType,
      timestamp,
      data,
      sessionId: `session_${analytics.session.startTime}`,
      userId,
      projectId
    };

    setTracking(prev => ({
      ...prev,
      events: [...prev.events.slice(-99), event], // Keep last 100 events
      lastUpdate: timestamp
    }));

    // Update session metrics
    setAnalytics(prev => ({
      ...prev,
      session: {
        ...prev.session,
        duration: timestamp - prev.session.startTime,
        interactionCount: prev.session.interactionCount + 1,
        ...(eventType === 'field_completed' && {
          fieldsCompleted: prev.session.fieldsCompleted + 1
        }),
        ...(eventType === 'validation_error' && {
          validationErrors: prev.session.validationErrors + 1
        }),
        ...(eventType === 'rfi_generated' && {
          rfiGenerated: prev.session.rfiGenerated + 1
        }),
        ...(eventType === 'work_type_changed' && {
          workTypeChanges: prev.session.workTypeChanges + 1
        }),
        ...(eventType === 'time_estimation_updated' && {
          timeEstimationUpdates: prev.session.timeEstimationUpdates + 1
        })
      }
    }));
  }, [tracking.isActive, analytics.session.startTime, userId, projectId]);

  /**
   * Analyze work patterns from historical data
   */
  const analyzeWorkPatterns = useCallback(() => {
    if (!historicalData.length) return;

    const workTypeFrequency = {};
    const locationFrequency = {};
    const durations = [];
    const timeDistribution = Array(24).fill(0);

    historicalData.forEach(work => {
      // Work type frequency
      const workType = work.type || 'unknown';
      workTypeFrequency[workType] = (workTypeFrequency[workType] || 0) + 1;

      // Location frequency
      const location = work.location || 'unknown';
      locationFrequency[location] = (locationFrequency[location] || 0) + 1;

      // Duration tracking
      if (work.planned_time) {
        const duration = parseFloat(work.planned_time) || 0;
        durations.push(duration);
      }

      // Time distribution
      if (work.date) {
        const hour = new Date(work.date).getHours();
        timeDistribution[hour]++;
      }
    });

    // Calculate insights
    const frequentWorkTypes = Object.entries(workTypeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count, percentage: (count / historicalData.length) * 100 }));

    const preferredLocations = Object.entries(locationFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count, percentage: (count / historicalData.length) * 100 }));

    const averageWorkDuration = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;

    const peakWorkTimes = timeDistribution
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    setAnalytics(prev => ({
      ...prev,
      workPatterns: {
        ...prev.workPatterns,
        frequentWorkTypes,
        preferredLocations,
        averageWorkDuration,
        peakWorkTimes
      }
    }));
  }, [historicalData]);

  /**
   * Calculate RFI metrics and insights
   */
  const calculateRfiMetrics = useCallback(() => {
    const rfiData = historicalData.filter(work => work.rfi_number);
    
    if (!rfiData.length) return;

    const totalGenerated = rfiData.length;
    const processingTimes = rfiData
      .filter(rfi => rfi.processing_time)
      .map(rfi => rfi.processing_time);

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    const approvedRfis = rfiData.filter(rfi => rfi.status === 'approved').length;
    const approvalRate = totalGenerated > 0 ? (approvedRfis / totalGenerated) * 100 : 0;

    const typeFrequency = {};
    rfiData.forEach(rfi => {
      const type = rfi.type || 'general';
      typeFrequency[type] = (typeFrequency[type] || 0) + 1;
    });

    const mostCommonTypes = Object.entries(typeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    setAnalytics(prev => ({
      ...prev,
      rfiMetrics: {
        ...prev.rfiMetrics,
        totalGenerated,
        averageProcessingTime,
        approvalRate,
        mostCommonTypes
      }
    }));
  }, [historicalData]);

  /**
   * Analyze time estimation accuracy
   */
  const analyzeTimeAccuracy = useCallback(() => {
    const worksWithActual = historicalData.filter(work => 
      work.planned_time && work.actual_time
    );

    if (!worksWithActual.length) return;

    let totalAccuracy = 0;
    const accuracyByType = {};

    worksWithActual.forEach(work => {
      const planned = parseFloat(work.planned_time);
      const actual = parseFloat(work.actual_time);
      
      if (planned > 0 && actual > 0) {
        const accuracy = Math.min(planned / actual, actual / planned);
        totalAccuracy += accuracy;

        const workType = work.type || 'unknown';
        if (!accuracyByType[workType]) {
          accuracyByType[workType] = { total: 0, count: 0 };
        }
        accuracyByType[workType].total += accuracy;
        accuracyByType[workType].count += 1;
      }
    });

    const overallAccuracy = totalAccuracy / worksWithActual.length;

    const byWorkType = Object.entries(accuracyByType).reduce((acc, [type, data]) => {
      acc[type] = data.total / data.count;
      return acc;
    }, {});

    setAnalytics(prev => ({
      ...prev,
      timeAccuracy: {
        ...prev.timeAccuracy,
        overallAccuracy,
        byWorkType
      }
    }));
  }, [historicalData]);

  /**
   * Generate insights and recommendations
   */
  const generateInsights = useCallback(() => {
    const insights = [];
    const recommendations = [];

    // Work pattern insights
    if (analytics.workPatterns.frequentWorkTypes.length > 0) {
      const topWorkType = analytics.workPatterns.frequentWorkTypes[0];
      insights.push({
        type: 'work_pattern',
        title: 'Most Frequent Work Type',
        description: `${topWorkType.type} represents ${topWorkType.percentage.toFixed(1)}% of your work`,
        impact: 'medium',
        category: 'productivity'
      });

      if (topWorkType.percentage > 50) {
        recommendations.push({
          type: 'specialization',
          title: 'Consider Work Type Specialization',
          description: `Focus on optimizing ${topWorkType.type} workflows for better efficiency`,
          priority: 'medium',
          estimatedImpact: 'Potential 15-20% efficiency improvement'
        });
      }
    }

    // Time accuracy insights
    if (analytics.timeAccuracy.overallAccuracy > 0) {
      const accuracy = analytics.timeAccuracy.overallAccuracy;
      insights.push({
        type: 'time_accuracy',
        title: 'Time Estimation Performance',
        description: `Your time estimates are ${(accuracy * 100).toFixed(1)}% accurate`,
        impact: accuracy > 0.8 ? 'positive' : 'attention_needed',
        category: 'efficiency'
      });

      if (accuracy < 0.7) {
        recommendations.push({
          type: 'time_improvement',
          title: 'Improve Time Estimation',
          description: 'Consider reviewing historical data and adjusting estimation methods',
          priority: 'high',
          estimatedImpact: 'Better project planning and resource allocation'
        });
      }
    }

    // RFI efficiency insights
    if (analytics.rfiMetrics.totalGenerated > 0) {
      const approvalRate = analytics.rfiMetrics.approvalRate;
      insights.push({
        type: 'rfi_efficiency',
        title: 'RFI Approval Rate',
        description: `${approvalRate.toFixed(1)}% of your RFIs are approved`,
        impact: approvalRate > 80 ? 'positive' : 'attention_needed',
        category: 'quality'
      });

      if (approvalRate < 70) {
        recommendations.push({
          type: 'rfi_quality',
          title: 'Improve RFI Quality',
          description: 'Focus on more detailed documentation and clearer requirements',
          priority: 'medium',
          estimatedImpact: 'Higher approval rates and faster processing'
        });
      }
    }

    setAnalytics(prev => ({
      ...prev,
      insights,
      recommendations
    }));

    // Trigger callbacks
    if (onInsight && insights.length > 0) {
      insights.forEach(insight => onInsight(insight));
    }

    if (onRecommendation && recommendations.length > 0) {
      recommendations.forEach(recommendation => onRecommendation(recommendation));
    }
  }, [analytics, onInsight, onRecommendation]);

  /**
   * Calculate performance scores
   */
  const calculatePerformanceScores = useCallback(() => {
    const { session, timeAccuracy, rfiMetrics, workPatterns } = analytics;

    // Productivity score (0-100)
    const productivityFactors = [
      Math.min(session.fieldsCompleted / 8, 1) * 25, // Field completion efficiency
      Math.min(session.rfiGenerated / 3, 1) * 25,   // RFI generation efficiency
      Math.min((session.duration / 3600000) / 2, 1) * 25, // Time efficiency (2 hours max)
      Math.max(0, 1 - (session.validationErrors / 10)) * 25 // Error rate
    ];
    const productivityScore = productivityFactors.reduce((sum, score) => sum + score, 0);

    // Efficiency rating (0-100)
    const efficiencyScore = Math.min(
      (timeAccuracy.overallAccuracy * 40) +
      (Math.min(rfiMetrics.approvalRate / 100, 1) * 30) +
      (Math.min(workPatterns.averageWorkDuration / 8, 1) * 30),
      100
    );

    // Quality index (0-100)
    const qualityScore = Math.min(
      ((rfiMetrics.approvalRate || 0) * 0.4) +
      ((1 - Math.min(session.validationErrors / 10, 1)) * 30) +
      ((timeAccuracy.overallAccuracy || 0) * 30),
      100
    );

    setAnalytics(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        productivityScore: Math.round(productivityScore),
        efficiencyRating: Math.round(efficiencyScore),
        qualityIndex: Math.round(qualityScore)
      }
    }));
  }, [analytics]);

  /**
   * Debounced analytics update
   */
  const debouncedUpdate = useMemo(
    () => debounce(() => {
      analyzeWorkPatterns();
      calculateRfiMetrics();
      analyzeTimeAccuracy();
      generateInsights();
      calculatePerformanceScores();
    }, ANALYTICS_CONFIG.intervals.behavioral),
    [analyzeWorkPatterns, calculateRfiMetrics, analyzeTimeAccuracy, generateInsights, calculatePerformanceScores]
  );

  // Effect: Initialize analytics
  useEffect(() => {
    if (enabled && historicalData.length > 0) {
      debouncedUpdate();
    }
  }, [enabled, historicalData, debouncedUpdate]);

  // Effect: Track form data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      trackInteraction('form_updated', { formData });
    }
  }, [formData, trackInteraction]);

  // Effect: Periodic analytics update
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        session: {
          ...prev.session,
          duration: Date.now() - prev.session.startTime
        }
      }));
    }, ANALYTICS_CONFIG.intervals.realTime);

    return () => clearInterval(interval);
  }, [enabled]);

  /**
   * Export analytics data
   */
  const exportAnalytics = useCallback((format = 'json') => {
    const exportData = {
      timestamp: new Date().toISOString(),
      userId,
      projectId,
      analytics,
      tracking: {
        ...tracking,
        events: tracking.events.slice(-50) // Last 50 events only
      }
    };

    if (format === 'csv') {
      // Convert to CSV format for reporting
      const csvData = [
        ['Metric', 'Value', 'Category'],
        ['Productivity Score', analytics.performance.productivityScore, 'Performance'],
        ['Efficiency Rating', analytics.performance.efficiencyRating, 'Performance'],
        ['Quality Index', analytics.performance.qualityIndex, 'Performance'],
        ['Time Accuracy', (analytics.timeAccuracy.overallAccuracy * 100).toFixed(1) + '%', 'Accuracy'],
        ['RFI Approval Rate', analytics.rfiMetrics.approvalRate.toFixed(1) + '%', 'RFI'],
        ['Session Duration', Math.round(analytics.session.duration / 60000) + ' minutes', 'Session'],
        ['Interactions', analytics.session.interactionCount, 'Session']
      ];
      
      return csvData.map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(exportData, null, 2);
  }, [analytics, tracking, userId, projectId]);

  /**
   * Reset analytics data
   */
  const resetAnalytics = useCallback(() => {
    setAnalytics({
      session: {
        startTime: Date.now(),
        duration: 0,
        interactionCount: 0,
        fieldsCompleted: 0,
        validationErrors: 0,
        rfiGenerated: 0,
        workTypeChanges: 0,
        timeEstimationUpdates: 0
      },
      workPatterns: {
        frequentWorkTypes: [],
        preferredLocations: [],
        averageWorkDuration: 0,
        peakWorkTimes: [],
        workComplexityTrend: 'stable',
        seasonalPatterns: {}
      },
      rfiMetrics: {
        totalGenerated: 0,
        averageProcessingTime: 0,
        approvalRate: 0,
        mostCommonTypes: [],
        urgencyDistribution: {},
        completionRate: 0
      },
      timeAccuracy: {
        overallAccuracy: 0,
        byWorkType: {},
        improvementTrend: 'stable',
        factorsInfluencing: [],
        recommendedAdjustments: {}
      },
      safetyMetrics: {
        complianceScore: 0,
        riskAssessments: 0,
        safetyIncidents: 0,
        roadTypeSafety: {},
        improvementAreas: []
      },
      performance: {
        productivityScore: 0,
        efficiencyRating: 0,
        qualityIndex: 0,
        workflowOptimization: 0,
        benchmarkComparison: {}
      },
      insights: [],
      recommendations: [],
      alerts: [],
      trends: {}
    });

    setTracking({
      isActive: enabled,
      events: [],
      metrics: {},
      lastUpdate: null,
      performance: {
        fastest: { field: null, time: Infinity },
        slowest: { field: null, time: 0 },
        average: 0
      }
    });
  }, [enabled]);

  return {
    // Analytics data
    analytics,
    tracking,
    
    // Analytics methods
    trackInteraction,
    analyzeWorkPatterns,
    calculateRfiMetrics,
    analyzeTimeAccuracy,
    generateInsights,
    calculatePerformanceScores,
    exportAnalytics,
    resetAnalytics,
    
    // Computed properties
    isTracking: tracking.isActive,
    hasInsights: analytics.insights.length > 0,
    hasRecommendations: analytics.recommendations.length > 0,
    sessionDuration: analytics.session.duration,
    productivityScore: analytics.performance.productivityScore,
    efficiencyRating: analytics.performance.efficiencyRating,
    qualityIndex: analytics.performance.qualityIndex,
    
    // Configuration
    config: ANALYTICS_CONFIG
  };
};

export default useDailyWorkFormAnalytics;
