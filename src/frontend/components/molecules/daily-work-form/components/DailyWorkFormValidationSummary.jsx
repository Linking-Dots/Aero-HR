/**
 * DailyWorkForm Validation Summary Component
 * Comprehensive validation feedback for construction work management
 * 
 * @component DailyWorkFormValidationSummary
 * @version 1.0.0
 * 
 * Features:
 * - Real-time validation status display with construction-specific categorization
 * - Error severity levels and improvement suggestions
 * - Performance metrics and validation analytics
 * - Interactive error navigation and field highlighting
 * - Accessibility-compliant error reporting (WCAG 2.1 AA)
 * 
 * ISO Compliance:
 * - ISO 25010: Usability, reliability, maintainability
 * - ISO 27001: Data validation security, error handling
 * - ISO 9001: Quality assurance, process improvement
 */

import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  TrendingUp,
  Target,
  Shield,
  FileText,
  Navigation,
  BarChart3,
  Lightbulb,
  Settings
} from 'lucide-react';

/**
 * Animation configurations for smooth transitions
 */
const ANIMATIONS = {
  container: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  },
  item: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2 }
  },
  metric: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  }
};

/**
 * Validation severity configuration
 */
const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    priority: 1,
    description: 'Critical errors that prevent form submission'
  },
  high: {
    icon: AlertTriangle,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600',
    priority: 2,
    description: 'High priority issues requiring attention'
  },
  medium: {
    icon: Info,
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    priority: 3,
    description: 'Medium priority warnings and suggestions'
  },
  low: {
    icon: Lightbulb,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    priority: 4,
    description: 'Low priority suggestions for improvement'
  }
};

/**
 * Category configuration for construction-specific validation
 */
const CATEGORY_CONFIG = {
  format: {
    icon: FileText,
    label: 'Format',
    description: 'Data format and structure validation'
  },
  business_rule: {
    icon: Settings,
    label: 'Business Rules',
    description: 'Construction industry business logic validation'
  },
  cross_field: {
    icon: Target,
    label: 'Cross-field',
    description: 'Field dependency and relationship validation'
  },
  safety: {
    icon: Shield,
    label: 'Safety',
    description: 'Safety compliance and risk assessment'
  },
  performance: {
    icon: TrendingUp,
    label: 'Performance',
    description: 'Performance optimization suggestions'
  },
  uniqueness: {
    icon: CheckCircle,
    label: 'Uniqueness',
    description: 'Data uniqueness and duplication checks'
  }
};

/**
 * Individual validation item component
 */
const ValidationItem = memo(({ 
  error, 
  onNavigate, 
  showMetrics = false,
  compact = false 
}) => {
  const severity = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.medium;
  const category = CATEGORY_CONFIG[error.category] || CATEGORY_CONFIG.format;
  const SeverityIcon = severity.icon;
  const CategoryIcon = category.icon;

  const handleNavigate = useCallback(() => {
    if (onNavigate && error.field) {
      onNavigate(error.field);
    }
  }, [onNavigate, error.field]);

  return (
    <motion.div
      variants={ANIMATIONS.item}
      className={`
        ${severity.bgColor} ${severity.borderColor} 
        border rounded-xl p-4 cursor-pointer transition-all duration-200
        hover:shadow-md hover:scale-[1.02]
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={handleNavigate}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${severity.iconColor}`}>
          <SeverityIcon size={compact ? 18 : 20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${severity.textColor} ${compact ? 'text-sm' : 'text-base'}`}>
              {error.field ? `${error.field}: ${error.message}` : error.message}
            </h4>
            <div className={`flex items-center gap-1 ${severity.textColor} opacity-70`}>
              <CategoryIcon size={compact ? 12 : 14} />
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>
                {category.label}
              </span>
            </div>
          </div>

          {error.suggestion && (
            <p className={`${severity.textColor} opacity-80 ${compact ? 'text-xs' : 'text-sm'}`}>
              💡 {error.suggestion}
            </p>
          )}

          {showMetrics && error.metrics && (
            <div className={`mt-2 flex items-center gap-4 ${compact ? 'text-xs' : 'text-sm'}`}>
              {error.metrics.validationTime && (
                <div className={`flex items-center gap-1 ${severity.textColor} opacity-70`}>
                  <Clock size={12} />
                  <span>{error.metrics.validationTime}ms</span>
                </div>
              )}
              {error.metrics.occurrences && (
                <div className={`flex items-center gap-1 ${severity.textColor} opacity-70`}>
                  <BarChart3 size={12} />
                  <span>{error.metrics.occurrences} times</span>
                </div>
              )}
            </div>
          )}
        </div>

        {onNavigate && error.field && (
          <div className={`flex-shrink-0 ${severity.iconColor} opacity-50`}>
            <Navigation size={compact ? 14 : 16} />
          </div>
        )}
      </div>
    </motion.div>
  );
});

ValidationItem.displayName = 'ValidationItem';

/**
 * Validation statistics component
 */
const ValidationStats = memo(({ validation, showDetails = true }) => {
  const stats = useMemo(() => {
    const errors = validation.errors || [];
    const warnings = validation.warnings || [];
    const allIssues = [...errors, ...warnings];

    const bySeverity = allIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});

    const byCategory = allIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: allIssues.length,
      errors: errors.length,
      warnings: warnings.length,
      critical: bySeverity.critical || 0,
      high: bySeverity.high || 0,
      medium: bySeverity.medium || 0,
      low: bySeverity.low || 0,
      categories: byCategory,
      validationTime: validation.performanceMetrics?.totalTime || 0,
      fieldsValidated: validation.performanceMetrics?.fieldsValidated || 0
    };
  }, [validation]);

  if (stats.total === 0) {
    return (
      <motion.div
        variants={ANIMATIONS.container}
        className="bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <h3 className="font-semibold text-green-800">Validation Passed</h3>
            <p className="text-sm text-green-600">
              All fields validated successfully in {stats.validationTime}ms
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={ANIMATIONS.container}
      className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={20} />
          Validation Summary
        </h3>
        <div className="text-sm text-gray-600">
          {stats.fieldsValidated} fields validated
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <motion.div 
          variants={ANIMATIONS.metric}
          className="text-center"
        >
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-xs text-gray-600">Critical</div>
        </motion.div>
        <motion.div 
          variants={ANIMATIONS.metric}
          className="text-center"
        >
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-xs text-gray-600">High</div>
        </motion.div>
        <motion.div 
          variants={ANIMATIONS.metric}
          className="text-center"
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
          <div className="text-xs text-gray-600">Medium</div>
        </motion.div>
        <motion.div 
          variants={ANIMATIONS.metric}
          className="text-center"
        >
          <div className="text-2xl font-bold text-blue-600">{stats.low}</div>
          <div className="text-xs text-gray-600">Low</div>
        </motion.div>
      </div>

      {showDetails && Object.keys(stats.categories).length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-700 mb-2">Issues by Category</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categories).map(([categoryKey, count]) => {
              const category = CATEGORY_CONFIG[categoryKey];
              if (!category) return null;

              const CategoryIcon = category.icon;
              return (
                <div
                  key={categoryKey}
                  className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-sm"
                >
                  <CategoryIcon size={14} className="text-gray-600" />
                  <span className="text-gray-700">{category.label}</span>
                  <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Validation completed in {stats.validationTime}ms</span>
          <span>{stats.total} total issues found</span>
        </div>
      </div>
    </motion.div>
  );
});

ValidationStats.displayName = 'ValidationStats';

/**
 * Main DailyWorkFormValidationSummary component
 */
const DailyWorkFormValidationSummary = memo(({
  validation = {},
  onNavigateToField,
  showStats = true,
  showMetrics = false,
  compact = false,
  maxItems = null,
  filterSeverity = null,
  filterCategory = null,
  groupBySeverity = false,
  className = '',
  testId = 'daily-work-form-validation-summary'
}) => {
  // Combine and sort validation issues
  const validationIssues = useMemo(() => {
    const errors = validation.errors || [];
    const warnings = validation.warnings || [];
    let allIssues = [...errors, ...warnings];

    // Apply filters
    if (filterSeverity) {
      allIssues = allIssues.filter(issue => issue.severity === filterSeverity);
    }

    if (filterCategory) {
      allIssues = allIssues.filter(issue => issue.category === filterCategory);
    }

    // Sort by severity priority
    allIssues.sort((a, b) => {
      const aPriority = SEVERITY_CONFIG[a.severity]?.priority || 999;
      const bPriority = SEVERITY_CONFIG[b.severity]?.priority || 999;
      return aPriority - bPriority;
    });

    // Limit items if specified
    if (maxItems && allIssues.length > maxItems) {
      allIssues = allIssues.slice(0, maxItems);
    }

    return allIssues;
  }, [validation, filterSeverity, filterCategory, maxItems]);

  // Group issues by severity if requested
  const groupedIssues = useMemo(() => {
    if (!groupBySeverity) return { all: validationIssues };

    return validationIssues.reduce((groups, issue) => {
      const severity = issue.severity || 'medium';
      if (!groups[severity]) {
        groups[severity] = [];
      }
      groups[severity].push(issue);
      return groups;
    }, {});
  }, [validationIssues, groupBySeverity]);

  // Handle field navigation
  const handleNavigateToField = useCallback((fieldName) => {
    if (onNavigateToField) {
      onNavigateToField(fieldName);
    } else {
      // Default behavior: scroll to field
      const element = document.getElementById(fieldName) || 
                    document.querySelector(`[name="${fieldName}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  }, [onNavigateToField]);

  if (!validation || (validationIssues.length === 0 && !showStats)) {
    return null;
  }

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      variants={ANIMATIONS.container}
      initial="initial"
      animate="animate"
      exit="exit"
      data-testid={testId}
    >
      {showStats && (
        <ValidationStats 
          validation={validation} 
          showDetails={!compact}
        />
      )}

      {validationIssues.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={20} />
              Validation Issues
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {validationIssues.length}
              </span>
            </h3>
            
            {maxItems && validation.errors?.length + validation.warnings?.length > maxItems && (
              <div className="text-sm text-gray-600">
                Showing {maxItems} of {validation.errors?.length + validation.warnings?.length} issues
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {groupBySeverity ? (
              <div className="space-y-6">
                {Object.entries(groupedIssues).map(([severity, issues]) => {
                  const severityConfig = SEVERITY_CONFIG[severity];
                  if (!severityConfig || issues.length === 0) return null;

                  return (
                    <motion.div
                      key={severity}
                      variants={ANIMATIONS.item}
                      className="space-y-3"
                    >
                      <h4 className={`font-medium ${severityConfig.textColor} flex items-center gap-2`}>
                        <severityConfig.icon size={18} />
                        {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                          {issues.length}
                        </span>
                      </h4>
                      <div className="space-y-2 ml-6">
                        {issues.map((issue, index) => (
                          <ValidationItem
                            key={`${severity}-${index}`}
                            error={issue}
                            onNavigate={handleNavigateToField}
                            showMetrics={showMetrics}
                            compact={compact}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {validationIssues.map((issue, index) => (
                  <ValidationItem
                    key={index}
                    error={issue}
                    onNavigate={handleNavigateToField}
                    showMetrics={showMetrics}
                    compact={compact}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
});

DailyWorkFormValidationSummary.displayName = 'DailyWorkFormValidationSummary';

DailyWorkFormValidationSummary.propTypes = {
  validation: PropTypes.shape({
    errors: PropTypes.array,
    warnings: PropTypes.array,
    performanceMetrics: PropTypes.object
  }),
  onNavigateToField: PropTypes.func,
  showStats: PropTypes.bool,
  showMetrics: PropTypes.bool,
  compact: PropTypes.bool,
  maxItems: PropTypes.number,
  filterSeverity: PropTypes.oneOf(['critical', 'high', 'medium', 'low']),
  filterCategory: PropTypes.oneOf(['format', 'business_rule', 'cross_field', 'safety', 'performance', 'uniqueness']),
  groupBySeverity: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string
};

export default DailyWorkFormValidationSummary;
