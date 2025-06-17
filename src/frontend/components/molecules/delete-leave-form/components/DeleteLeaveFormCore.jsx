/**
 * Delete Leave Form Core Component
 * Core confirmation dialog for leave deletion with glass morphism design
 * 
 * Features:
 * - Glass morphism confirmation dialog
 * - Multi-step confirmation process
 * - Real-time validation feedback
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Security confirmation requirements
 * - Progress tracking
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { DELETE_LEAVE_FORM_CONFIG } from '../config';

/**
 * Delete Leave Form Core Component
 * @param {Object} props - Component props
 * @param {Object} props.formState - Current form state
 * @param {Object} props.validationState - Current validation state
 * @param {Object} props.leaveData - Leave data to delete
 * @param {Function} props.updateField - Field update handler
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onCancel - Form cancellation handler
 * @param {Function} props.onFieldInteraction - Field interaction tracker
 * @param {Object} props.currentStep - Current step information
 * @param {number} props.formProgress - Form completion progress (0-100)
 * @param {boolean} props.canSubmit - Whether form can be submitted
 * @param {Array} props.notifications - Current notifications
 * @param {Object} props.config - Component configuration
 * @returns {JSX.Element} - Delete leave form core component
 */
export const DeleteLeaveFormCore = React.memo(({
  formState = {},
  validationState = {},
  leaveData = null,
  updateField = () => {},
  onSubmit = () => {},
  onCancel = () => {},
  onFieldInteraction = () => {},
  currentStep = { step: 1, title: '', description: '' },
  formProgress = 0,
  canSubmit = false,
  notifications = [],
  config = DELETE_LEAVE_FORM_CONFIG
}) => {
  // Refs for accessibility and focus management
  const dialogRef = useRef(null);
  const confirmationInputRef = useRef(null);
  const reasonTextareaRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const initialFocusRef = useRef(null);

  /**
   * Handle field change with validation and analytics
   */
  const handleFieldChange = useCallback((field, value) => {
    updateField(field, value);
    onFieldInteraction(field, 'change', value);
  }, [updateField, onFieldInteraction]);

  /**
   * Handle field focus events
   */
  const handleFieldFocus = useCallback((field) => {
    onFieldInteraction(field, 'focus');
  }, [onFieldInteraction]);

  /**
   * Handle field blur events
   */
  const handleFieldBlur = useCallback((field) => {
    onFieldInteraction(field, 'blur');
  }, [onFieldInteraction]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event) => {
    // Handle Escape key
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }

    // Handle Enter key on confirmation input
    if (event.key === 'Enter' && event.target === confirmationInputRef.current) {
      event.preventDefault();
      if (formState.securityPassed && canSubmit) {
        onSubmit();
      }
    }

    // Track accessibility usage
    onFieldInteraction('keyboard', 'navigation', {
      key: event.key,
      target: event.target.name || event.target.id
    });
  }, [formState.securityPassed, canSubmit, onSubmit, onCancel, onFieldInteraction]);

  /**
   * Focus management on mount and state changes
   */
  useEffect(() => {
    if (formState.isVisible) {
      // Focus the appropriate field based on current step
      const focusTarget = 
        !formState.securityPassed ? confirmationInputRef.current :
        formState.showReasonField && !formState.reason ? reasonTextareaRef.current :
        deleteButtonRef.current;

      if (focusTarget) {
        setTimeout(() => {
          focusTarget.focus();
          initialFocusRef.current = focusTarget;
        }, 100);
      }
    }
  }, [formState.isVisible, formState.securityPassed, formState.showReasonField, formState.reason]);

  /**
   * Trap focus within dialog
   */
  useEffect(() => {
    const handleFocusTrap = (event) => {
      if (!dialogRef.current || !formState.isVisible) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (formState.isVisible) {
      document.addEventListener('keydown', handleFocusTrap);
      return () => document.removeEventListener('keydown', handleFocusTrap);
    }
  }, [formState.isVisible]);

  // Don't render if not visible
  if (!formState.isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-leave-title"
      aria-describedby="delete-leave-description"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md mx-4 p-6 bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-30"
        style={{
          background: config.ui.dialog.background,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)'
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Dialog Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 
              id="delete-leave-title"
              className="text-xl font-semibold text-gray-900"
            >
              Delete Leave Request
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 hover:bg-opacity-50"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p 
            id="delete-leave-description"
            className="text-sm text-gray-600"
          >
            {leaveData && (
              <>
                Leave from {new Date(leaveData.start_date).toLocaleDateString()} to{' '}
                {new Date(leaveData.end_date).toLocaleDateString()}
                {leaveData.type && ` (${leaveData.type})`}
              </>
            )}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStep.title}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(formProgress)}% Complete
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 bg-opacity-50">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${formProgress}%` }}
              role="progressbar"
              aria-valuenow={formProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Form completion progress: ${Math.round(formProgress)}%`}
            />
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            {currentStep.description}
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {/* Step 1: Confirmation Text */}
          {!formState.securityPassed && (
            <div className="space-y-2">
              <label 
                htmlFor="confirmation-input"
                className="block text-sm font-medium text-gray-700"
              >
                Type <code className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-mono">
                  {config.security.confirmationText}
                </code> to confirm deletion
              </label>
              
              <input
                ref={confirmationInputRef}
                id="confirmation-input"
                type="text"
                value={formState.confirmation || ''}
                onChange={(e) => handleFieldChange('confirmation', e.target.value)}
                onFocus={() => handleFieldFocus('confirmation')}
                onBlur={() => handleFieldBlur('confirmation')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white bg-opacity-70 ${
                  validationState.fieldErrors?.confirmation ? 
                    'border-red-300 bg-red-50 bg-opacity-70' : 
                    'border-gray-300'
                }`}
                placeholder={`Type "${config.security.confirmationText}" here`}
                autoComplete="off"
                spellCheck="false"
                aria-invalid={!!validationState.fieldErrors?.confirmation}
                aria-describedby={validationState.fieldErrors?.confirmation ? 'confirmation-error' : undefined}
              />
              
              {validationState.fieldErrors?.confirmation && (
                <p 
                  id="confirmation-error"
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {validationState.fieldErrors.confirmation}
                </p>
              )}
            </div>
          )}

          {/* Step 2: User Acknowledgment */}
          {formState.securityPassed && !formState.userAcknowledgment && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 bg-opacity-70 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Warning: Permanent Action
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>This action cannot be undone</li>
                        <li>All associated data will be removed</li>
                        <li>Approval history will be preserved for audit</li>
                        {formState.cascadeDelete && (
                          <li>Related records will also be deleted</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formState.userAcknowledgment || false}
                  onChange={(e) => handleFieldChange('userAcknowledgment', e.target.checked)}
                  onFocus={() => handleFieldFocus('userAcknowledgment')}
                  onBlur={() => handleFieldBlur('userAcknowledgment')}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  aria-describedby="acknowledgment-description"
                />
                <span 
                  id="acknowledgment-description"
                  className="text-sm text-gray-700"
                >
                  I understand the consequences and want to proceed with deleting this leave request
                </span>
              </label>
              
              {validationState.fieldErrors?.userAcknowledgment && (
                <p className="text-sm text-red-600" role="alert">
                  {validationState.fieldErrors.userAcknowledgment}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Deletion Reason (if required) */}
          {formState.showReasonField && formState.userAcknowledgment && (
            <div className="space-y-2">
              <label 
                htmlFor="reason-textarea"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Deletion {formState.showReasonField && <span className="text-red-500">*</span>}
              </label>
              
              <textarea
                ref={reasonTextareaRef}
                id="reason-textarea"
                value={formState.reason || ''}
                onChange={(e) => handleFieldChange('reason', e.target.value)}
                onFocus={() => handleFieldFocus('reason')}
                onBlur={() => handleFieldBlur('reason')}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white bg-opacity-70 resize-none ${
                  validationState.fieldErrors?.reason ? 
                    'border-red-300 bg-red-50 bg-opacity-70' : 
                    'border-gray-300'
                }`}
                placeholder="Please explain why you are deleting this leave request..."
                aria-invalid={!!validationState.fieldErrors?.reason}
                aria-describedby={validationState.fieldErrors?.reason ? 'reason-error' : 'reason-help'}
              />
              
              <div className="flex justify-between items-center">
                {validationState.fieldErrors?.reason ? (
                  <p 
                    id="reason-error"
                    className="text-sm text-red-600"
                    role="alert"
                  >
                    {validationState.fieldErrors.reason}
                  </p>
                ) : (
                  <p 
                    id="reason-help"
                    className="text-xs text-gray-500"
                  >
                    Minimum 10 characters required
                  </p>
                )}
                <span className="text-xs text-gray-400">
                  {(formState.reason || '').length}/500
                </span>
              </div>
            </div>
          )}

          {/* Advanced Options */}
          {formState.userAcknowledgment && (
            <div className="space-y-3 pt-2 border-t border-gray-200 border-opacity-50">
              <h4 className="text-sm font-medium text-gray-700">Options</h4>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formState.notifyUser || false}
                    onChange={(e) => handleFieldChange('notifyUser', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Notify user about deletion
                  </span>
                </label>
                
                {config.deletion.allowCascade && (
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formState.cascadeDelete || false}
                      onChange={(e) => handleFieldChange('cascadeDelete', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Delete related records
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mt-4 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                } bg-opacity-70`}
                role="alert"
              >
                {notification.message}
              </div>
            ))}
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200 border-opacity-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white bg-opacity-70 border border-gray-300 rounded-lg hover:bg-gray-50 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          
          <button
            ref={deleteButtonRef}
            onClick={onSubmit}
            disabled={!canSubmit || formState.isSubmitting}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all ${
              canSubmit && !formState.isSubmitting
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            aria-describedby="delete-button-status"
          >
            {formState.isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </div>
            ) : (
              'Delete Leave'
            )}
          </button>
        </div>
        
        <p 
          id="delete-button-status"
          className="sr-only"
          aria-live="polite"
        >
          {canSubmit ? 'Delete button is enabled' : 'Complete all required fields to enable delete button'}
        </p>
      </div>
    </div>
  );
});

DeleteLeaveFormCore.displayName = 'DeleteLeaveFormCore';

DeleteLeaveFormCore.propTypes = {
  formState: PropTypes.shape({
    confirmation: PropTypes.string,
    reason: PropTypes.string,
    userAcknowledgment: PropTypes.bool,
    deleteType: PropTypes.string,
    cascadeDelete: PropTypes.bool,
    notifyUser: PropTypes.bool,
    isVisible: PropTypes.bool,
    isSubmitting: PropTypes.bool,
    showReasonField: PropTypes.bool,
    securityPassed: PropTypes.bool
  }),
  validationState: PropTypes.shape({
    isValid: PropTypes.bool,
    fieldErrors: PropTypes.object
  }),
  leaveData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string
  }),
  updateField: PropTypes.func,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onFieldInteraction: PropTypes.func,
  currentStep: PropTypes.shape({
    step: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    isComplete: PropTypes.bool
  }),
  formProgress: PropTypes.number,
  canSubmit: PropTypes.bool,
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    message: PropTypes.string,
    duration: PropTypes.number
  })),
  config: PropTypes.object
};

export default DeleteLeaveFormCore;
