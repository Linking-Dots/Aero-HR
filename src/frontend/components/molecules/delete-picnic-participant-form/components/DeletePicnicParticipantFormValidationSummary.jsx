import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Shield,
  Users,
  FileText,
  Eye,
  Lock
} from 'lucide-react';

/**
 * Validation summary component for delete picnic participant form
 * 
 * Features:
 * - Real-time validation status
 * - Security compliance indicators
 * - Business rule status
 * - Step-by-step progress
 * - Accessibility support
 */
const DeletePicnicParticipantFormValidationSummary = ({
  validation,
  currentStep,
  participantData,
  eventData,
  securityAttempts = 0,
  isLockedOut = false,
  className = ''
}) => {
  // Validation categories
  const validationCategories = [
    {
      id: 'form',
      title: 'Form Validation',
      icon: FileText,
      description: 'Required fields and data format validation',
      getStatus: () => {
        const hasErrors = Object.keys(validation.errors).length > 0;
        const hasStepErrors = validation.stepErrors.some(stepErrors => stepErrors.length > 0);
        
        return {
          status: hasErrors || hasStepErrors ? 'error' : 'success',
          message: hasErrors || hasStepErrors 
            ? `${Object.keys(validation.errors).length + validation.stepErrors.flat().length} validation errors`
            : 'All form fields are valid',
          details: hasErrors || hasStepErrors ? [
            ...Object.entries(validation.errors).map(([field, error]) => ({ field, error })),
            ...validation.stepErrors.flat().map(error => ({ field: 'general', error }))
          ] : []
        };
      }
    },
    {
      id: 'security',
      title: 'Security Verification',
      icon: Shield,
      description: 'Password and confirmation validation',
      getStatus: () => {
        const securityValidation = validation.validateSecurity();
        
        return {
          status: isLockedOut ? 'locked' : securityValidation.isValid ? 'success' : 'error',
          message: isLockedOut 
            ? 'Account temporarily locked due to failed attempts'
            : securityValidation.isValid 
              ? 'Security verification passed'
              : `Security verification failed (${securityAttempts} attempts)`,
          details: securityValidation.errors || []
        };
      }
    },
    {
      id: 'business',
      title: 'Business Rules',
      icon: Users,
      description: 'Deletion eligibility and business compliance',
      getStatus: () => {
        const eligibility = validation.validateDeletionEligibility();
        const hasBusinessErrors = validation.businessRuleErrors.length > 0;
        
        return {
          status: !eligibility.eligible || hasBusinessErrors ? 'error' : 'success',
          message: !eligibility.eligible || hasBusinessErrors
            ? 'Business rule violations detected'
            : 'All business rules satisfied',
          details: [...(eligibility.reasons || []), ...validation.businessRuleErrors]
        };
      }
    },
    {
      id: 'impact',
      title: 'Impact Assessment',
      icon: AlertTriangle,
      description: 'Acknowledgment of deletion consequences',
      getStatus: () => {
        const impactValidation = validation.validateImpactAssessment();
        
        return {
          status: impactValidation.isValid ? 'success' : 'warning',
          message: impactValidation.isValid 
            ? 'Impact assessment completed'
            : `${impactValidation.missing.length} categories need acknowledgment`,
          details: impactValidation.missing.map(category => `Missing: ${category}`)
        };
      }
    }
  ];

  // Get overall validation status
  const getOverallStatus = () => {
    const statuses = validationCategories.map(category => category.getStatus().status);
    
    if (statuses.includes('locked')) return 'locked';
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    return 'success';
  };

  // Render status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const badges = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      locked: 'bg-red-100 text-red-800'
    };

    const labels = {
      success: 'Valid',
      error: 'Invalid',
      warning: 'Incomplete',
      locked: 'Locked'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || 'Unknown'}
      </span>
    );
  };

  // Render validation progress
  const renderValidationProgress = () => {
    const progress = validation.getValidationProgress();
    const overallStatus = getOverallStatus();
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Validation Status</h3>
          {renderStatusBadge(overallStatus)}
        </div>
        
        <div className="bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              overallStatus === 'success' ? 'bg-green-600' :
              overallStatus === 'error' || overallStatus === 'locked' ? 'bg-red-600' :
              'bg-yellow-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Progress: {Math.round(progress)}%</span>
          <span>{validation.validationState.errorCount} errors</span>
        </div>
      </div>
    );
  };

  // Render participant summary
  const renderParticipantSummary = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Deletion Target</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-blue-700 font-medium">Participant:</span>
          <div className="text-blue-800">{participantData?.name || 'Unknown'}</div>
        </div>
        <div>
          <span className="text-blue-700 font-medium">Event:</span>
          <div className="text-blue-800">{eventData?.name || 'Unknown'}</div>
        </div>
        <div>
          <span className="text-blue-700 font-medium">Registration:</span>
          <div className="text-blue-800">
            {participantData?.registrationDate 
              ? new Date(participantData.registrationDate).toLocaleDateString()
              : 'Unknown'
            }
          </div>
        </div>
        <div>
          <span className="text-blue-700 font-medium">Status:</span>
          <div className="text-blue-800">{participantData?.status || 'Active'}</div>
        </div>
      </div>
    </div>
  );

  // Render validation category
  const renderValidationCategory = (category) => {
    const Icon = category.icon;
    const status = category.getStatus();
    
    return (
      <div key={category.id} className={`border rounded-lg p-4 transition-all duration-300 ${
        status.status === 'success' ? 'border-green-200 bg-green-50' :
        status.status === 'error' || status.status === 'locked' ? 'border-red-200 bg-red-50' :
        status.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <Icon className={`w-5 h-5 ${
              status.status === 'success' ? 'text-green-600' :
              status.status === 'error' || status.status === 'locked' ? 'text-red-600' :
              status.status === 'warning' ? 'text-yellow-600' :
              'text-gray-400'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900">{category.title}</h4>
              {renderStatusIcon(status.status)}
            </div>
            
            <p className="text-xs text-gray-600 mb-2">{category.description}</p>
            
            <p className={`text-sm font-medium ${
              status.status === 'success' ? 'text-green-800' :
              status.status === 'error' || status.status === 'locked' ? 'text-red-800' :
              status.status === 'warning' ? 'text-yellow-800' :
              'text-gray-800'
            }`}>
              {status.message}
            </p>
            
            {status.details && status.details.length > 0 && (
              <div className="mt-2">
                <details className="group">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    View details ({status.details.length})
                  </summary>
                  <div className="mt-2 space-y-1">
                    {status.details.map((detail, index) => (
                      <div key={index} className="text-xs text-gray-700 pl-4 border-l-2 border-gray-300">
                        {typeof detail === 'string' ? detail : `${detail.field}: ${detail.error}`}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render step validation status
  const renderStepValidation = () => {
    const steps = [
      { id: 0, title: 'Reason', fields: ['reason', 'details'] },
      { id: 1, title: 'Impact', fields: ['impactAssessment'] },
      { id: 2, title: 'Security', fields: ['password', 'confirmation', 'acknowledgeConsequences'] }
    ];

    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Step Validation</h4>
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step) => {
            const isCurrentStep = currentStep === step.id;
            const isCompletedStep = currentStep > step.id;
            const hasStepErrors = validation.hasStepError(step.id);
            const canProceed = validation.canProceedToNextStep(step.id);

            return (
              <div key={step.id} className={`text-center p-3 rounded-lg border ${
                isCurrentStep ? 'border-blue-300 bg-blue-50' :
                isCompletedStep && !hasStepErrors ? 'border-green-300 bg-green-50' :
                hasStepErrors ? 'border-red-300 bg-red-50' :
                'border-gray-300 bg-gray-50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentStep ? 'text-blue-800' :
                  isCompletedStep && !hasStepErrors ? 'text-green-800' :
                  hasStepErrors ? 'text-red-800' :
                  'text-gray-800'
                }`}>
                  Step {step.id + 1}: {step.title}
                </div>
                
                <div className="flex justify-center mb-2">
                  {isCompletedStep && !hasStepErrors ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : hasStepErrors ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : isCurrentStep ? (
                    <Clock className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                <div className={`text-xs ${
                  isCurrentStep ? 'text-blue-600' :
                  isCompletedStep && !hasStepErrors ? 'text-green-600' :
                  hasStepErrors ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {isCompletedStep && !hasStepErrors ? 'Complete' :
                   hasStepErrors ? 'Has errors' :
                   isCurrentStep ? 'Current' :
                   'Pending'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {renderValidationProgress()}
      {renderParticipantSummary()}
      {renderStepValidation()}
      
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Validation Categories</h4>
        <div className="space-y-4">
          {validationCategories.map(renderValidationCategory)}
        </div>
      </div>

      {/* Security warning for locked accounts */}
      {isLockedOut && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Account Temporarily Locked</h4>
              <p className="text-sm text-red-700">
                Your account has been temporarily locked due to multiple failed security attempts. 
                Please wait before trying again or contact an administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance metrics */}
      {validation.lastValidated && (
        <div className="text-xs text-gray-500 text-center">
          Last validated: {new Date(validation.lastValidated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default DeletePicnicParticipantFormValidationSummary;
