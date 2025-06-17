import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import DeletePicnicParticipantFormCore from './components/DeletePicnicParticipantFormCore.jsx';
import DeletePicnicParticipantFormValidationSummary from './components/DeletePicnicParticipantFormValidationSummary.jsx';
import { useCompleteDeletePicnicParticipantForm } from './hooks/useCompleteDeletePicnicParticipantForm.js';

/**
 * Main delete picnic participant form component with dialog interface
 * 
 * Features:
 * - Modal dialog presentation
 * - Complete workflow integration
 * - Real-time validation
 * - Security compliance
 * - Analytics tracking
 * - Accessibility support
 * - Responsive design
 */
const DeletePicnicParticipantForm = ({
  isOpen = false,
  onClose = () => {},
  participantData = null,
  eventData = null,
  onSuccess = () => {},
  onError = () => {},
  options = {}
}) => {
  const {
    enableAnalytics = true,
    securityLevel = 'high',
    showValidationSummary = true,
    autoValidate = true,
    confirmBeforeClose = true
  } = options;

  // Local state
  const [showValidationPanel, setShowValidationPanel] = useState(showValidationSummary);
  const [isClosing, setIsClosing] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // Initialize complete form hook
  const {
    // Form state
    formData,
    currentStep,
    setCurrentStep,
    updateField,
    resetForm,
    
    // Validation
    validation,
    
    // Analytics
    analytics,
    
    // Processing
    isProcessing,
    processingStage,
    workflow,
    lastError,
    
    // Security
    securityAttempts,
    isLockedOut,
    lockoutRemaining,
    
    // Actions
    processDeletion,
    cancelDeletion,
    canProceedWithDeletion,
    clearError,
    
    // Utils
    getDeletionSummary
  } = useCompleteDeletePicnicParticipantForm(
    participantData,
    eventData,
    {
      enableAnalytics,
      securityLevel,
      autoValidate,
      onSuccess: (result) => {
        analytics.trackCompletion('completed');
        onSuccess(result);
        handleClose();
      },
      onError: (error) => {
        analytics.trackCompletion('failed', { reason: error.message });
        onError(error);
      },
      onCancel: () => {
        analytics.trackCompletion('cancelled');
        handleClose();
      }
    }
  );

  // Handle form submission
  const handleSubmit = async () => {
    if (!canProceedWithDeletion()) {
      return;
    }

    await processDeletion();
  };

  // Handle close with confirmation
  const handleClose = () => {
    if (confirmBeforeClose && !isProcessing && (
      Object.keys(formData).some(key => formData[key]) || 
      currentStep > 0
    )) {
      setShowConfirmClose(true);
      return;
    }

    performClose();
  };

  // Perform actual close
  const performClose = () => {
    setIsClosing(true);
    
    // Track session end if analytics enabled
    if (analytics.isTracking) {
      analytics.trackCompletion('abandoned', {
        finalStep: currentStep,
        reason: 'dialog_close'
      });
    }

    // Reset form and close
    setTimeout(() => {
      resetForm();
      setCurrentStep(0);
      setShowConfirmClose(false);
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isProcessing, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Track analytics on open
  useEffect(() => {
    if (isOpen && analytics.isTracking) {
      analytics.trackSessionStart();
    }
  }, [isOpen, analytics]);

  // Don't render if not open
  if (!isOpen) return null;

  // Render confirmation close dialog
  const renderConfirmCloseDialog = () => {
    if (!showConfirmClose) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Close
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You have unsaved changes. Are you sure you want to close without completing the deletion?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmClose(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continue Editing
                </button>
                <button
                  onClick={performClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close Without Saving
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render lockout warning
  const renderLockoutWarning = () => {
    if (!isLockedOut) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Account Temporarily Locked
            </h3>
            <p className="text-sm text-red-700 mb-2">
              Too many failed security attempts. Please wait {lockoutRemaining} seconds before trying again.
            </p>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-xs text-red-600 font-mono">
                {Math.floor(lockoutRemaining / 60)}:{String(lockoutRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render error banner
  const renderErrorBanner = () => {
    if (!lastError) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Deletion Failed
              </h3>
              <p className="text-sm text-red-700">
                {lastError}
              </p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main modal backdrop */}
      <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      } z-50`}>
        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className={`relative bg-white rounded-lg shadow-xl transition-all duration-300 ${
              isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            } ${showValidationPanel ? 'max-w-7xl w-full' : 'max-w-4xl w-full'}`}>
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mr-4">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Delete Participant
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Remove participant from {eventData?.name || 'event'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {showValidationSummary && (
                    <button
                      onClick={() => setShowValidationPanel(!showValidationPanel)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {showValidationPanel ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                      Validation
                    </button>
                  )}
                  
                  <button
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`${showValidationPanel ? 'grid grid-cols-3 gap-6' : ''} p-6`}>
                {/* Main form */}
                <div className={showValidationPanel ? 'col-span-2' : ''}>
                  {renderLockoutWarning()}
                  {renderErrorBanner()}
                  
                  <DeletePicnicParticipantFormCore
                    formData={formData}
                    updateField={updateField}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    validation={validation}
                    participantData={participantData}
                    eventData={eventData}
                    isProcessing={isProcessing}
                    processingStage={processingStage}
                    workflow={workflow}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                  />
                </div>

                {/* Validation panel */}
                {showValidationPanel && (
                  <div className="col-span-1 border-l border-gray-200 pl-6">
                    <div className="sticky top-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Validation Status
                      </h3>
                      
                      <DeletePicnicParticipantFormValidationSummary
                        validation={validation}
                        currentStep={currentStep}
                        participantData={participantData}
                        eventData={eventData}
                        securityAttempts={securityAttempts}
                        isLockedOut={isLockedOut}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with summary */}
              {currentStep === 2 && validation.validationState.isValid && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Deletion Summary
                    </h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        Participant: <span className="font-medium">{participantData?.name}</span>
                      </div>
                      <div>
                        Event: <span className="font-medium">{eventData?.name}</span>
                      </div>
                      <div>
                        Reason: <span className="font-medium">{formData.reason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation close dialog */}
      {renderConfirmCloseDialog()}
    </>
  );
};

export default DeletePicnicParticipantForm;
