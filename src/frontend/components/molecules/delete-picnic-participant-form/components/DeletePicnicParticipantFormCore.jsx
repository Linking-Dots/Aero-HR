import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Users,
  DollarSign,
  MessageSquare,
  Calendar
} from 'lucide-react';

/**
 * Core delete picnic participant form component
 * 
 * Features:
 * - Multi-step deletion workflow
 * - Security verification
 * - Impact assessment
 * - Real-time validation
 * - Accessibility compliance
 * - Enterprise security
 */
const DeletePicnicParticipantFormCore = ({
  formData,
  updateField,
  currentStep,
  setCurrentStep,
  validation,
  participantData,
  eventData,
  isProcessing,
  processingStage,
  workflow,
  onSubmit,
  onCancel,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationFocused, setConfirmationFocused] = useState(false);

  // Step configuration
  const steps = [
    {
      id: 0,
      title: 'Deletion Reason',
      description: 'Provide reason and details for participant deletion',
      icon: MessageSquare,
      fields: ['reason', 'details']
    },
    {
      id: 1,
      title: 'Impact Assessment',
      description: 'Acknowledge the impact of removing this participant',
      icon: Users,
      fields: ['impactAssessment']
    },
    {
      id: 2,
      title: 'Security Confirmation',
      description: 'Verify your identity and confirm the deletion',
      icon: Shield,
      fields: ['password', 'confirmation', 'acknowledgeConsequences']
    }
  ];

  // Impact categories with descriptions
  const impactCategories = [
    {
      key: 'eventPlanning',
      title: 'Event Planning Impact',
      description: 'Affects seating arrangements, activity groups, and logistics planning',
      icon: Calendar,
      severity: 'medium'
    },
    {
      key: 'financial',
      title: 'Financial Implications',
      description: 'May require refund processing and budget adjustments',
      icon: DollarSign,
      severity: 'high'
    },
    {
      key: 'teamDynamics',
      title: 'Team Dynamics',
      description: 'Could impact team composition and social dynamics',
      icon: Users,
      severity: 'medium'
    },
    {
      key: 'communication',
      title: 'Communication Requirements',
      description: 'Requires notification to relevant stakeholders and participants',
      icon: MessageSquare,
      severity: 'low'
    }
  ];

  // Handle step navigation
  const handleNext = () => {
    if (currentStep < steps.length - 1 && validation.canProceedToNextStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validation.validationState.isValid && currentStep === steps.length - 1) {
      onSubmit();
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        const hasError = validation.hasStepError(index);

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${isActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-50 text-green-600'
                    : hasError
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 bg-gray-50 text-gray-400'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : hasError ? (
                  <XCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                {isActive && (
                  <div className="text-xs text-gray-500 mt-1 max-w-32">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                currentStep > index ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // Render participant info banner
  const renderParticipantInfo = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            Participant Deletion Warning
          </h3>
          <div className="text-sm text-yellow-700">
            <p className="mb-2">
              You are about to delete <strong>{participantData?.name}</strong> from{' '}
              <strong>{eventData?.name}</strong>. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium">Participant ID:</span> {participantData?.id}
              </div>
              <div>
                <span className="font-medium">Registration Date:</span>{' '}
                {participantData?.registrationDate 
                  ? new Date(participantData.registrationDate).toLocaleDateString()
                  : 'Unknown'
                }
              </div>
              <div>
                <span className="font-medium">Status:</span> {participantData?.status || 'Active'}
              </div>
              <div>
                <span className="font-medium">Payment Status:</span> {participantData?.paymentStatus || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render step 1: Deletion Reason
  const renderReasonStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Deletion <span className="text-red-500">*</span>
        </label>
        <select
          id="reason"
          value={formData.reason || ''}
          onChange={(e) => updateField('reason', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            validation.hasFieldError('reason') ? 'border-red-300' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select a reason...</option>
          <option value="participant_request">Participant requested removal</option>
          <option value="payment_issues">Payment or billing issues</option>
          <option value="schedule_conflict">Schedule conflict</option>
          <option value="duplicate_registration">Duplicate registration</option>
          <option value="policy_violation">Policy violation</option>
          <option value="administrative_error">Administrative error</option>
          <option value="other">Other (specify in details)</option>
        </select>
        {validation.getFieldError('reason') && (
          <p className="mt-1 text-sm text-red-600">{validation.getFieldError('reason')}</p>
        )}
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
          Additional Details
        </label>
        <textarea
          id="details"
          value={formData.details || ''}
          onChange={(e) => updateField('details', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            validation.hasFieldError('details') ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Provide additional context or details about the deletion..."
        />
        {validation.getFieldError('details') && (
          <p className="mt-1 text-sm text-red-600">{validation.getFieldError('details')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Detailed documentation helps with audit trails and future reference.
        </p>
      </div>
    </div>
  );

  // Render step 2: Impact Assessment
  const renderImpactStep = () => {
    const assessmentProgress = validation.validateImpactAssessment();
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Impact Assessment</h3>
          <p className="text-sm text-gray-600 mb-6">
            Please acknowledge your understanding of how removing this participant will impact the event.
            You must acknowledge all categories to proceed.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Assessment Progress</span>
              <span className="text-sm text-blue-600">
                {assessmentProgress.acknowledged.length} of {impactCategories.length} completed
              </span>
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${assessmentProgress.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {impactCategories.map((category) => {
            const Icon = category.icon;
            const isAcknowledged = formData.impactAssessment?.[category.key] || false;
            
            return (
              <div 
                key={category.key}
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  isAcknowledged 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAcknowledged}
                    onChange={(e) => updateField('impactAssessment', {
                      ...formData.impactAssessment,
                      [category.key]: e.target.checked
                    })}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 mr-2 ${
                        category.severity === 'high' ? 'text-red-500' :
                        category.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <span className="font-medium text-gray-900">{category.title}</span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        category.severity === 'high' ? 'bg-red-100 text-red-800' :
                        category.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {category.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        {validation.getFieldError('impactAssessment') && (
          <p className="text-sm text-red-600">{validation.getFieldError('impactAssessment')}</p>
        )}
      </div>
    );
  };

  // Render step 3: Security Confirmation
  const renderSecurityStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Verification</h3>
        <p className="text-sm text-gray-600 mb-6">
          For security purposes, please verify your identity and confirm the deletion.
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Current Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={formData.password || ''}
            onChange={(e) => updateField('password', e.target.value)}
            className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validation.hasFieldError('password') ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your current password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        {validation.getFieldError('password') && (
          <p className="mt-1 text-sm text-red-600">{validation.getFieldError('password')}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmation Text <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Type <strong className="text-red-600">DELETE PARTICIPANT</strong> to confirm:
          </p>
          <input
            type="text"
            id="confirmation"
            value={formData.confirmation || ''}
            onChange={(e) => updateField('confirmation', e.target.value)}
            onFocus={() => setConfirmationFocused(true)}
            onBlur={() => setConfirmationFocused(false)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
              validation.hasFieldError('confirmation') ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="DELETE PARTICIPANT"
            required
          />
          {confirmationFocused && (
            <p className="text-xs text-gray-500">
              Must match exactly: DELETE PARTICIPANT
            </p>
          )}
        </div>
        {validation.getFieldError('confirmation') && (
          <p className="mt-1 text-sm text-red-600">{validation.getFieldError('confirmation')}</p>
        )}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acknowledgeConsequences || false}
            onChange={(e) => updateField('acknowledgeConsequences', e.target.checked)}
            className="mt-1 mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            required
          />
          <div className="text-sm">
            <span className="font-medium text-red-800">
              I understand that this action is irreversible
            </span>
            <p className="text-red-700 mt-1">
              By checking this box, I acknowledge that deleting this participant cannot be undone 
              and may have financial, logistical, and social implications for the event.
            </p>
          </div>
        </label>
        {validation.getFieldError('acknowledgeConsequences') && (
          <p className="mt-2 text-sm text-red-600">{validation.getFieldError('acknowledgeConsequences')}</p>
        )}
      </div>
    </div>
  );

  // Render processing overlay
  const renderProcessingOverlay = () => {
    if (!isProcessing) return null;

    return (
      <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 rounded-lg">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {processingStage === 'validation' && 'Validating form data...'}
            {processingStage === 'security' && 'Verifying security credentials...'}
            {processingStage === 'business_rules' && 'Checking business rules...'}
            {processingStage === 'impact_assessment' && 'Validating impact assessment...'}
            {processingStage === 'deletion' && 'Deleting participant...'}
            {processingStage === 'cleanup' && 'Performing cleanup...'}
            {processingStage === 'complete' && 'Deletion completed!'}
            {!processingStage && 'Processing deletion...'}
          </h3>
          <p className="text-sm text-gray-600">
            Please wait while we process your request.
          </p>
          <div className="mt-4 bg-gray-200 rounded-full h-2 w-64">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderReasonStep();
      case 1:
        return renderImpactStep();
      case 2:
        return renderSecurityStep();
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {renderProcessingOverlay()}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStepIndicator()}
        {renderParticipantInfo()}
        
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validation.canProceedToNextStep(currentStep) || isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!validation.validationState.isValid || isProcessing}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Participant
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Business rule violations */}
      {validation.hasBusinessRuleError() && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Business Rule Violations
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.getBusinessRuleErrors().map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletePicnicParticipantFormCore;
