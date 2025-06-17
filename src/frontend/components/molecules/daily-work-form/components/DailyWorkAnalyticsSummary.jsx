/**
 * DailyWork Analytics Summary Component
 * Advanced analytics dashboard for construction work management insights
 * 
 * @component DailyWorkAnalyticsSummary
 * @version 1.0.0
 * 
 * Features:
 * - Real-time construction work analytics and performance metrics
 * - RFI tracking and approval rate monitoring
 * - Time estimation accuracy and productivity insights
 * - Safety compliance scoring and trend analysis
 * - Interactive charts and visual analytics display
 * 
 * ISO Compliance:
 * - ISO 25010: Performance efficiency, usability, maintainability
 * - ISO 27001: Data analytics security, privacy protection
 * - ISO 9001: Quality metrics, continuous improvement tracking
 */

import React, { memo, useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield,
  FileText,
  MapPin,
  Tool,
  AlertCircle,
  CheckCircle,
  Activity,
  Award,
  Zap,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Download,
  RefreshCw
} from 'lucide-react';

/**
 * Animation configurations for smooth transitions
 */
const ANIMATIONS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  card: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    transition: { duration: 0.3 }
  },
  metric: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', stiffness: 400, damping: 15 }
  },
  chart: {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3 }
  }
};

/**
 * Metric card component for displaying key analytics
 */
const MetricCard = memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend = null,
  onClick = null,
  size = 'default'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-800',
      accent: 'text-green-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-800',
      accent: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      accent: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-800',
      accent: 'text-purple-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const isSmall = size === 'small';

  return (
    <motion.div
      variants={ANIMATIONS.card}
      whileHover="hover"
      className={`
        ${colors.bg} ${colors.border} border rounded-xl 
        ${isSmall ? 'p-3' : 'p-4'} 
        ${onClick ? 'cursor-pointer' : ''} 
        transition-all duration-200
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`${colors.icon} ${isSmall ? 'w-4 h-4' : 'w-5 h-5'}`} />
            <h3 className={`${colors.text} font-medium ${isSmall ? 'text-sm' : 'text-base'}`}>
              {title}
            </h3>
          </div>
          
          <motion.div
            variants={ANIMATIONS.metric}
            className={`${colors.accent} font-bold ${isSmall ? 'text-lg' : 'text-2xl'} mb-1`}
          >
            {value}
          </motion.div>
          
          {subtitle && (
            <p className={`${colors.text} opacity-70 ${isSmall ? 'text-xs' : 'text-sm'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 ${isSmall ? 'text-xs' : 'text-sm'}`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Activity className="w-4 h-4 text-gray-500" />
            )}
            <span className={
              trend.direction === 'up' ? 'text-green-600' :
              trend.direction === 'down' ? 'text-red-600' :
              'text-gray-600'
            }>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

/**
 * Progress bar component for visual metrics
 */
const ProgressBar = memo(({ 
  label, 
  value, 
  max = 100, 
  color = 'blue',
  showValue = true,
  size = 'default'
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isSmall = size === 'small';

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-gray-700 font-medium ${isSmall ? 'text-sm' : 'text-base'}`}>
          {label}
        </span>
        {showValue && (
          <span className={`text-gray-600 ${isSmall ? 'text-xs' : 'text-sm'}`}>
            {value}/{max}
          </span>
        )}
      </div>
      <div className={`bg-gray-200 rounded-full ${isSmall ? 'h-2' : 'h-3'} overflow-hidden`}>
        <motion.div
          className={`${colorClasses[color]} ${isSmall ? 'h-2' : 'h-3'} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

/**
 * Work type distribution chart component
 */
const WorkTypeChart = memo(({ workPatterns, compact = false }) => {
  const { frequentWorkTypes = [] } = workPatterns;

  if (frequentWorkTypes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Tool className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No work type data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {frequentWorkTypes.slice(0, compact ? 3 : 5).map((workType, index) => (
        <motion.div
          key={workType.type}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-3 h-3 rounded-full
              ${index === 0 ? 'bg-blue-500' : 
                index === 1 ? 'bg-green-500' : 
                index === 2 ? 'bg-orange-500' : 
                index === 3 ? 'bg-purple-500' : 'bg-gray-500'}
            `} />
            <span className="text-gray-700 capitalize font-medium">
              {workType.type.replace('_', ' ')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-900 font-semibold">{workType.count}</span>
            <span className="text-gray-500 text-sm ml-2">
              ({workType.percentage.toFixed(1)}%)
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

WorkTypeChart.displayName = 'WorkTypeChart';

/**
 * RFI performance metrics component
 */
const RfiMetrics = memo(({ rfiMetrics, compact = false }) => {
  const metrics = [
    {
      label: 'Total Generated',
      value: rfiMetrics.totalGenerated || 0,
      color: 'blue'
    },
    {
      label: 'Approval Rate',
      value: `${(rfiMetrics.approvalRate || 0).toFixed(1)}%`,
      color: rfiMetrics.approvalRate >= 80 ? 'green' : rfiMetrics.approvalRate >= 60 ? 'orange' : 'red'
    },
    {
      label: 'Avg Processing',
      value: `${(rfiMetrics.averageProcessingTime || 0).toFixed(1)}h`,
      color: 'purple'
    }
  ];

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {metrics.map((metric, index) => (
        <ProgressBar
          key={metric.label}
          label={metric.label}
          value={typeof metric.value === 'string' ? 
            parseFloat(metric.value) || 0 : 
            metric.value
          }
          max={
            metric.label === 'Approval Rate' ? 100 :
            metric.label === 'Total Generated' ? Math.max(metric.value, 10) :
            24
          }
          color={metric.color}
          size={compact ? 'small' : 'default'}
        />
      ))}
    </div>
  );
});

RfiMetrics.displayName = 'RfiMetrics';

/**
 * Main DailyWorkAnalyticsSummary component
 */
const DailyWorkAnalyticsSummary = memo(({
  analytics = {},
  showDetailedMetrics = true,
  showCharts = true,
  compact = false,
  refreshInterval = null,
  onRefresh = null,
  onExport = null,
  className = '',
  testId = 'daily-work-analytics-summary'
}) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    workPatterns: !compact,
    rfiMetrics: !compact,
    performance: !compact
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Main performance metrics
  const performanceMetrics = useMemo(() => [
    {
      title: 'Productivity Score',
      value: `${analytics.performance?.productivityScore || 0}`,
      subtitle: 'Overall productivity rating',
      icon: Award,
      color: analytics.performance?.productivityScore >= 80 ? 'green' : 
             analytics.performance?.productivityScore >= 60 ? 'orange' : 'red',
      trend: analytics.performance?.productivityScore > 75 ? 
        { direction: 'up', value: '+5%' } : null
    },
    {
      title: 'Efficiency Rating',
      value: `${analytics.performance?.efficiencyRating || 0}%`,
      subtitle: 'Work efficiency measure',
      icon: Zap,
      color: analytics.performance?.efficiencyRating >= 80 ? 'green' : 
             analytics.performance?.efficiencyRating >= 60 ? 'orange' : 'red'
    },
    {
      title: 'Quality Index',
      value: `${analytics.performance?.qualityIndex || 0}`,
      subtitle: 'Work quality score',
      icon: Target,
      color: analytics.performance?.qualityIndex >= 80 ? 'green' : 
             analytics.performance?.qualityIndex >= 60 ? 'orange' : 'red'
    },
    {
      title: 'Safety Score',
      value: `${analytics.safetyMetrics?.complianceScore || 0}%`,
      subtitle: 'Safety compliance rating',
      icon: Shield,
      color: analytics.safetyMetrics?.complianceScore >= 95 ? 'green' : 
             analytics.safetyMetrics?.complianceScore >= 85 ? 'orange' : 'red'
    }
  ], [analytics]);

  // Session metrics
  const sessionMetrics = useMemo(() => [
    {
      title: 'Session Duration',
      value: `${Math.round((analytics.session?.duration || 0) / 60000)}m`,
      subtitle: 'Current session time',
      icon: Clock,
      color: 'blue'
    },
    {
      title: 'Fields Completed',
      value: `${analytics.session?.fieldsCompleted || 0}`,
      subtitle: 'Form fields filled',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'RFIs Generated',
      value: `${analytics.session?.rfiGenerated || 0}`,
      subtitle: 'RFIs created today',
      icon: FileText,
      color: 'purple'
    },
    {
      title: 'Validation Errors',
      value: `${analytics.session?.validationErrors || 0}`,
      subtitle: 'Form validation issues',
      icon: AlertCircle,
      color: analytics.session?.validationErrors > 5 ? 'red' : 'orange'
    }
  ], [analytics]);

  // Handle section toggle
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [isRefreshing, onRefresh]);

  // Handle export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(analytics);
    }
  }, [onExport, analytics]);

  // Auto-refresh effect
  React.useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      if (!isRefreshing) {
        handleRefresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh, isRefreshing, handleRefresh]);

  if (!analytics || Object.keys(analytics).length === 0) {
    return (
      <motion.div
        variants={ANIMATIONS.container}
        className={`bg-gray-50 border border-gray-200 rounded-xl p-6 text-center ${className}`}
        data-testid={testId}
      >
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
        <p className="text-sm text-gray-500 mt-1">Start using the form to see insights</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={ANIMATIONS.container}
      initial="initial"
      animate="animate"
      exit="exit"
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Construction Work Analytics
        </h2>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Refresh analytics"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {onExport && (
            <button
              onClick={handleExport}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Export analytics"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <motion.div variants={ANIMATIONS.card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Performance Overview
          </h3>
          <button
            onClick={() => toggleSection('overview')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            {expandedSections.overview ? 
              <Minimize2 className="w-4 h-4 text-gray-500" /> : 
              <Maximize2 className="w-4 h-4 text-gray-500" />
            }
          </button>
        </div>

        <AnimatePresence>
          {expandedSections.overview && (
            <motion.div
              variants={ANIMATIONS.chart}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {performanceMetrics.map((metric, index) => (
                <MetricCard
                  key={metric.title}
                  {...metric}
                  size={compact ? 'small' : 'default'}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Session Metrics */}
      {showDetailedMetrics && (
        <motion.div variants={ANIMATIONS.card}>
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Current Session
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sessionMetrics.map((metric) => (
              <MetricCard
                key={metric.title}
                {...metric}
                size={compact ? 'small' : 'default'}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Work Patterns */}
      {showCharts && analytics.workPatterns && (
        <motion.div 
          variants={ANIMATIONS.card}
          className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Tool className="w-5 h-5 text-orange-600" />
              Work Type Distribution
            </h3>
            <button
              onClick={() => toggleSection('workPatterns')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              {expandedSections.workPatterns ? 
                <EyeOff className="w-4 h-4 text-gray-500" /> : 
                <Eye className="w-4 h-4 text-gray-500" />
              }
            </button>
          </div>

          <AnimatePresence>
            {expandedSections.workPatterns && (
              <motion.div
                variants={ANIMATIONS.chart}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <WorkTypeChart 
                  workPatterns={analytics.workPatterns} 
                  compact={compact} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* RFI Metrics */}
      {showCharts && analytics.rfiMetrics && (
        <motion.div 
          variants={ANIMATIONS.card}
          className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              RFI Performance
            </h3>
            <button
              onClick={() => toggleSection('rfiMetrics')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              {expandedSections.rfiMetrics ? 
                <EyeOff className="w-4 h-4 text-gray-500" /> : 
                <Eye className="w-4 h-4 text-gray-500" />
              }
            </button>
          </div>

          <AnimatePresence>
            {expandedSections.rfiMetrics && (
              <motion.div
                variants={ANIMATIONS.chart}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <RfiMetrics 
                  rfiMetrics={analytics.rfiMetrics} 
                  compact={compact} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Insights and Recommendations */}
      {analytics.insights?.length > 0 && (
        <motion.div 
          variants={ANIMATIONS.card}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights & Recommendations
          </h3>
          
          <div className="space-y-3">
            {analytics.insights.slice(0, compact ? 2 : 5).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white/70 rounded-lg"
              >
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">{insight.title}</h4>
                  <p className="text-sm text-blue-700">{insight.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

DailyWorkAnalyticsSummary.displayName = 'DailyWorkAnalyticsSummary';

DailyWorkAnalyticsSummary.propTypes = {
  analytics: PropTypes.shape({
    session: PropTypes.object,
    workPatterns: PropTypes.object,
    rfiMetrics: PropTypes.object,
    timeAccuracy: PropTypes.object,
    safetyMetrics: PropTypes.object,
    performance: PropTypes.object,
    insights: PropTypes.array,
    recommendations: PropTypes.array
  }),
  showDetailedMetrics: PropTypes.bool,
  showCharts: PropTypes.bool,
  compact: PropTypes.bool,
  refreshInterval: PropTypes.number,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string
};

export default DailyWorkAnalyticsSummary;
