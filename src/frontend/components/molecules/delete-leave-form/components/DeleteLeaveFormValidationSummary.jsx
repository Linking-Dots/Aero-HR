/**
 * Delete Leave Form Validation Summary Component
 * Comprehensive validation feedback with interactive field navigation
 * 
 * Features:
 * - Real-time validation status display
 * - Error categorization by severity
 * - Interactive field navigation
 * - Accessibility compliance
 * - Progress tracking
 * - Security validation status
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Delete Leave Form Validation Summary Component
 * @param {Object} props - Component props
 * @param {Object} props.validationState - Current validation state
 * @param {Object} props.formState - Current form state
 * @param {Function} props.onFieldFocus - Field focus handler
 * @param {boolean} props.showDetails - Whether to show detailed validation info
 * @param {string} props.layout - Layout mode ('compact', 'detailed', 'minimal')
 * @param {Object} props.config - Validation configuration
 * @returns {JSX.Element} - Validation summary component
 */
export const DeleteLeaveFormValidationSummary = React.memo(({
  validationState = {},
  formState = {},
  onFieldFocus = () => {},
  showDetails = true,
  layout = 'detailed',
  config = {}
}) => {
  /**
   * Get severity icon and color
   */
  const getSeverityStyle = useCallback((severity) => {
    const styles = {
      critical: {
        icon: '🚫',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      high: {
        icon: '⚠️',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      medium: {
        icon: '⚡',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      low: {
        icon: 'ℹ️',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    };
    return styles[severity] || styles.medium;
  }, []);

  /**
   * Categorized validation errors
   */
  const categorizedErrors = useMemo(() => {
    const errors = validationState.errors || {};
    const criticalErrors = validationState.criticalErrors || [];
    const warnings = validationState.warnings || [];

    return {
      critical: criticalErrors.filter(error => error.severity === 'critical'),
      high: criticalErrors.filter(error => error.severity === 'high') || [],
      medium: Object.keys(errors).filter(field => 
        !criticalErrors.some(error => error.field === field)
      ).map(field => ({
        field,
        message: errors[field],
        severity: 'medium'
      })),
      warnings: warnings
    };
  }, [validationState.errors, validationState.criticalErrors, validationState.warnings]);

  /**
   * Security validation status
   */
  const securityStatus = useMemo(() => {
    const security = validationState.securityValidation || {};
    return {
      confirmationValid: security.confirmationValid || false,
      acknowledgmentValid: security.acknowledgmentValid || false,
      permissionValid: security.permissionValid || false,
      reasonValid: security.reasonValid || true
    };
  }, [validationState.securityValidation]);

  /**
   * Overall validation progress
   */
  const validationProgress = useMemo(() => {
    const totalSteps = [
      securityStatus.permissionValid,
      securityStatus.confirmationValid,
      securityStatus.acknowledgmentValid,
      securityStatus.reasonValid
    ];
    
    const completedSteps = totalSteps.filter(Boolean).length;
    return Math.round((completedSteps / totalSteps.length) * 100);
  }, [securityStatus]);

  /**
   * Handle field focus navigation
   */
  const handleFieldNavigation = useCallback((field) => {
    onFieldFocus(field);
    
    // Find and focus the field element
    const fieldElement = document.getElementById(`${field}-input`) || 
                        document.getElementById(`${field}-textarea`) ||
                        document.querySelector(`[name="${field}"]`);
    
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [onFieldFocus]);

  /**
   * Render minimal layout
   */
  if (layout === 'minimal') {
    const hasErrors = Object.keys(validationState.errors || {}).length > 0;
    
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          validationState.isValid ? 'bg-green-500' : hasErrors ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
        <span className="text-xs text-gray-600">
          {validationState.isValid ? 'Valid' : hasErrors ? 'Invalid' : 'Validating...'}
        </span>
      </div>
    );
  }

  /**
   * Render compact layout
   */
  if (layout === 'compact') {
    const errorCount = Object.keys(validationState.errors || {}).length;
    const warningCount = (validationState.warnings || []).length;
    
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            validationState.isValid ? 'bg-green-500' : 
            errorCount > 0 ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            Validation: {validationProgress}%
          </span>
        </div>
        
        {errorCount > 0 && (
          <span className="text-xs text-red-600">
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
        
        {warningCount > 0 && (
          <span className="text-xs text-yellow-600">
            {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  // Detailed layout (default)
  return (
    <div className="space-y-4">
      {/* Validation Progress Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Validation Status
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {validationProgress}% Complete
          </span>
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                validationState.isValid ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${validationProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Security Validation Checklist */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          Security Requirements
        </h4>
        
        <div className="space-y-1">
          {[
            { 
              key: 'permission', 
              label: 'Permission Check', 
              status: securityStatus.permissionValid,
              description: 'Verify user can delete this leave'
            },
            { 
              key: 'confirmation', 
              label: 'Confirmation Text', 
              status: securityStatus.confirmationValid,
              description: 'Type confirmation text to proceed'
            },
            { 
              key: 'acknowledgment', 
              label: 'User Acknowledgment', 
              status: securityStatus.acknowledgmentValid,
              description: 'Acknowledge deletion consequences'
            },
            { 
              key: 'reason', 
              label: 'Deletion Reason', 
              status: securityStatus.reasonValid,
              description: 'Provide reason for deletion'
            }
          ].map((requirement) => (
            <div 
              key={requirement.key}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                requirement.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {requirement.status ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-current rounded-full" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${requirement.status ? 'text-gray-900' : 'text-gray-600'}`}>
                    {requirement.label}
                  </span>
                  {!requirement.status && (
                    <button
                      onClick={() => handleFieldNavigation(requirement.key)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Complete
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {requirement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Messages */}
      {showDetails && (
        <div className="space-y-3">
          {/* Critical Errors */}
          {categorizedErrors.critical.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-red-700 uppercase tracking-wide">
                Critical Issues
              </h4>
              
              {categorizedErrors.critical.map((error, index) => {
                const style = getSeverityStyle(error.severity);
                return (
                  <div
                    key={`critical-${index}`}
                    className={`p-3 rounded-lg border ${style.bgColor} ${style.borderColor}`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-sm">{style.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${style.color}`}>
                            {error.message}
                          </p>
                          <button
                            onClick={() => handleFieldNavigation(error.field)}
                            className={`text-xs underline ${style.color} hover:opacity-75`}
                          >
                            Fix
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Field: {error.field}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other Errors */}
          {categorizedErrors.medium.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-yellow-700 uppercase tracking-wide">
                Validation Errors
              </h4>
              
              {categorizedErrors.medium.map((error, index) => {
                const style = getSeverityStyle(error.severity);
                return (
                  <div
                    key={`medium-${index}`}
                    className={`p-2 rounded border ${style.bgColor} ${style.borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{style.icon}</span>
                        <p className={`text-xs ${style.color}`}>
                          {error.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFieldNavigation(error.field)}
                        className={`text-xs underline ${style.color} hover:opacity-75`}
                      >
                        Fix
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Warnings */}
          {categorizedErrors.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                Warnings
              </h4>
              
              {categorizedErrors.warnings.map((warning, index) => {
                const style = getSeverityStyle('low');
                return (
                  <div
                    key={`warning-${index}`}
                    className={`p-2 rounded border ${style.bgColor} ${style.borderColor}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">{style.icon}</span>
                      <p className={`text-xs ${style.color}`}>
                        {warning.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Success State */}
          {validationState.isValid && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-800">
                  All validation requirements met
                </p>
              </div>
              <p className="text-xs text-green-700 mt-1">
                You can now proceed with the deletion
              </p>
            </div>
          )}
        </div>
      )}

      {/* Performance Information */}
      {showDetails && validationState.validationTime && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Validation completed in {validationState.validationTime.toFixed(1)}ms
            </span>
            {validationState.validationCount && (
              <span>
                {validationState.validationCount} validation{validationState.validationCount !== 1 ? 's' : ''} performed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

DeleteLeaveFormValidationSummary.displayName = 'DeleteLeaveFormValidationSummary';

DeleteLeaveFormValidationSummary.propTypes = {
  validationState: PropTypes.shape({
    isValid: PropTypes.bool,
    isValidating: PropTypes.bool,
    errors: PropTypes.object,
    criticalErrors: PropTypes.array,
    warnings: PropTypes.array,
    validationTime: PropTypes.number,
    validationCount: PropTypes.number,
    securityValidation: PropTypes.shape({
      confirmationValid: PropTypes.bool,
      acknowledgmentValid: PropTypes.bool,
      permissionValid: PropTypes.bool,
      reasonValid: PropTypes.bool
    })
  }),
  formState: PropTypes.object,
  onFieldFocus: PropTypes.func,
  showDetails: PropTypes.bool,
  layout: PropTypes.oneOf(['compact', 'detailed', 'minimal']),
  config: PropTypes.object
};

export default DeleteLeaveFormValidationSummary;
