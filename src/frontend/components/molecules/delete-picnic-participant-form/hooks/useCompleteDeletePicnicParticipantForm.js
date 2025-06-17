import { useState, useCallback, useRef } from 'react';
import { useDeletePicnicParticipantForm } from './useDeletePicnicParticipantForm.js';
import { useDeletePicnicParticipantFormValidation } from './useDeletePicnicParticipantFormValidation.js';
import { useDeletePicnicParticipantFormAnalytics } from './useDeletePicnicParticipantFormAnalytics.js';

/**
 * Complete integration hook for delete picnic participant form
 * 
 * Features:
 * - Complete form workflow management
 * - Multi-step process coordination
 * - Validation and analytics integration
 * - Error handling and recovery
 * - Security and audit logging
 * - Business rule enforcement
 */
export const useCompleteDeletePicnicParticipantForm = (
  participantData = null,
  eventData = null,
  options = {}
) => {
  const {
    onSuccess = () => {},
    onError = () => {},
    onCancel = () => {},
    enableAnalytics = true,
    autoValidate = true,
    securityLevel = 'high', // 'standard', 'high', 'maximum'
    auditTrail = true
  } = options;

  // Integration state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [workflow, setWorkflow] = useState({
    stage: 'initial', // 'initial', 'reason', 'impact', 'security', 'confirmation', 'processing', 'complete'
    progress: 0,
    canProceed: false,
    blockers: []
  });

  // Security tracking
  const securityRef = useRef({
    attempts: 0,
    lockoutUntil: null,
    suspiciousActivity: []
  });

  // Initialize core hooks
  const formHook = useDeletePicnicParticipantForm(participantData, eventData, {
    autoSave: false,
    validateOnChange: autoValidate
  });

  const validationHook = useDeletePicnicParticipantFormValidation(
    formHook.formData,
    formHook.currentStep,
    participantData,
    eventData
  );

  const analyticsHook = useDeletePicnicParticipantFormAnalytics(
    participantData,
    eventData,
    {
      enableAnalytics,
      trackingLevel: enableAnalytics ? 'detailed' : 'minimal'
    }
  );

  // Process deletion workflow
  const processDeletion = useCallback(async () => {
    if (isProcessing) return { success: false, error: 'Already processing' };

    // Security check
    if (securityRef.current.lockoutUntil && Date.now() < securityRef.current.lockoutUntil) {
      const lockoutRemaining = Math.ceil((securityRef.current.lockoutUntil - Date.now()) / 1000);
      return { 
        success: false, 
        error: `Account locked for ${lockoutRemaining} seconds due to security violations` 
      };
    }

    setIsProcessing(true);
    setLastError(null);

    try {
      // Track deletion attempt
      analyticsHook.trackDeletionAttempt('initiated');
      analyticsHook.startPerformanceTimer('deletion_process');

      // Stage 1: Final validation
      setProcessingStage('validation');
      setWorkflow(prev => ({ ...prev, stage: 'validation', progress: 10 }));

      const finalValidation = await validationHook.validateForm();
      
      if (!finalValidation.isValid) {
        analyticsHook.trackDeletionAttempt('validation_failed', {
          success: false,
          errorType: 'validation',
          errors: finalValidation.errors
        });
        
        throw new Error('Form validation failed: ' + Object.values(finalValidation.errors).join(', '));
      }

      analyticsHook.trackValidation('final', null, {
        isValid: true,
        errorCount: 0,
        businessRulesPassed: finalValidation.businessRuleErrors.length === 0 ? 1 : 0
      });

      // Stage 2: Security verification
      setProcessingStage('security');
      setWorkflow(prev => ({ ...prev, stage: 'security', progress: 25 }));

      const securityCheck = await verifySecurityCredentials();
      
      if (!securityCheck.success) {
        securityRef.current.attempts += 1;
        
        analyticsHook.trackSecurity('deletion_security_failed', {
          success: false,
          attemptCount: securityRef.current.attempts,
          severity: securityRef.current.attempts > 3 ? 'high' : 'medium'
        });

        // Implement progressive lockout
        if (securityRef.current.attempts >= 5) {
          securityRef.current.lockoutUntil = Date.now() + (15 * 60 * 1000); // 15 minute lockout
          analyticsHook.trackSecurity('account_lockout', {
            success: false,
            attemptCount: securityRef.current.attempts,
            severity: 'critical'
          });
          
          throw new Error('Account locked due to repeated security failures');
        }

        throw new Error(securityCheck.error || 'Security verification failed');
      }

      analyticsHook.trackSecurity('deletion_security_passed', {
        success: true,
        attemptCount: securityRef.current.attempts + 1,
        severity: 'low'
      });

      // Stage 3: Business rule compliance
      setProcessingStage('business_rules');
      setWorkflow(prev => ({ ...prev, stage: 'business_rules', progress: 40 }));

      const businessRulesCheck = await validateDeletionEligibility();
      
      if (!businessRulesCheck.eligible) {
        analyticsHook.trackDeletionAttempt('business_rules_failed', {
          success: false,
          errorType: 'business_rules',
          reasons: businessRulesCheck.reasons
        });
        
        throw new Error('Deletion not permitted: ' + businessRulesCheck.reasons.join(', '));
      }

      // Stage 4: Impact assessment verification
      setProcessingStage('impact_assessment');
      setWorkflow(prev => ({ ...prev, stage: 'impact_assessment', progress: 55 }));

      const impactCheck = validationHook.validateImpactAssessment();
      
      if (!impactCheck.isValid) {
        throw new Error('Impact assessment incomplete: ' + impactCheck.missing.join(', '));
      }

      // Stage 5: Execute deletion
      setProcessingStage('deletion');
      setWorkflow(prev => ({ ...prev, stage: 'deletion', progress: 70 }));

      const deletionResult = await executeParticipantDeletion();
      
      if (!deletionResult.success) {
        analyticsHook.trackDeletionAttempt('deletion_failed', {
          success: false,
          errorType: 'execution',
          error: deletionResult.error
        });
        
        throw new Error(deletionResult.error || 'Deletion execution failed');
      }

      // Stage 6: Cleanup and notifications
      setProcessingStage('cleanup');
      setWorkflow(prev => ({ ...prev, stage: 'cleanup', progress: 85 }));

      await performPostDeletionCleanup(deletionResult);

      // Stage 7: Complete
      setProcessingStage('complete');
      setWorkflow(prev => ({ ...prev, stage: 'complete', progress: 100 }));

      const processingTime = analyticsHook.endPerformanceTimer('deletion_process');

      analyticsHook.trackDeletionAttempt('completed', {
        success: true,
        processingTime,
        impactAssessmentComplete: true,
        securityVerificationPassed: true
      });

      analyticsHook.trackCompletion('completed', {
        stepsCompleted: 3,
        validationAttempts: securityRef.current.attempts + 1,
        securityAttempts: securityRef.current.attempts + 1,
        finalStep: 'deletion_complete'
      });

      // Reset security tracking on success
      securityRef.current.attempts = 0;
      securityRef.current.lockoutUntil = null;

      setIsProcessing(false);
      onSuccess(deletionResult);

      return { 
        success: true, 
        data: deletionResult,
        processingTime,
        workflow: workflow.stage
      };

    } catch (error) {
      setLastError(error.message);
      setIsProcessing(false);
      
      analyticsHook.trackDeletionAttempt('failed', {
        success: false,
        errorType: 'process_error',
        error: error.message,
        stage: processingStage
      });

      analyticsHook.trackCompletion('failed', {
        reason: error.message,
        finalStep: processingStage
      });

      onError(error);

      return { 
        success: false, 
        error: error.message,
        stage: processingStage 
      };
    }
  }, [
    isProcessing,
    formHook.formData,
    validationHook,
    analyticsHook,
    participantData,
    eventData,
    processingStage,
    workflow,
    onSuccess,
    onError
  ]);

  // Verify security credentials
  const verifySecurityCredentials = useCallback(async () => {
    try {
      // Simulate password verification API call
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
          password: formHook.formData.password,
          action: 'delete_participant',
          participant_id: participantData?.id
        })
      });

      if (!response.ok) {
        throw new Error('Password verification failed');
      }

      const result = await response.json();
      return { success: true, data: result };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [formHook.formData.password, participantData?.id]);

  // Validate deletion eligibility
  const validateDeletionEligibility = useCallback(async () => {
    const eligibility = validationHook.validateDeletionEligibility();
    
    // Additional async checks could be performed here
    // e.g., checking with external systems, financial implications, etc.
    
    return eligibility;
  }, [validationHook]);

  // Execute participant deletion
  const executeParticipantDeletion = useCallback(async () => {
    try {
      const response = await fetch('/api/picnic-participants/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
          participant_id: participantData?.id,
          event_id: eventData?.id,
          reason: formHook.formData.reason,
          details: formHook.formData.details,
          impact_assessment: formHook.formData.impactAssessment,
          confirmation: formHook.formData.confirmation,
          audit_trail: auditTrail ? {
            deleted_by: 'current_user', // This would come from auth context
            deleted_at: new Date().toISOString(),
            reason: formHook.formData.reason,
            session_id: analyticsHook.sessionId
          } : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deletion request failed');
      }

      const result = await response.json();
      return { success: true, data: result };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [
    participantData?.id,
    eventData?.id,
    formHook.formData,
    auditTrail,
    analyticsHook.sessionId
  ]);

  // Perform post-deletion cleanup
  const performPostDeletionCleanup = useCallback(async (deletionResult) => {
    // Send notifications, update caches, etc.
    // This is where you'd integrate with other systems
    
    try {
      // Example: Send notification
      await fetch('/api/notifications/participant-deleted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
          participant_id: participantData?.id,
          event_id: eventData?.id,
          deletion_id: deletionResult.data?.id
        })
      });

      // Clear form data
      formHook.resetForm();

    } catch (error) {
      console.warn('Post-deletion cleanup warning:', error.message);
      // Non-critical errors in cleanup shouldn't fail the deletion
    }
  }, [participantData?.id, eventData?.id, formHook]);

  // Cancel deletion process
  const cancelDeletion = useCallback(() => {
    if (isProcessing) {
      analyticsHook.trackCompletion('cancelled', {
        reason: 'user_cancellation',
        finalStep: processingStage
      });
    }

    setIsProcessing(false);
    setProcessingStage(null);
    setLastError(null);
    setWorkflow({
      stage: 'initial',
      progress: 0,
      canProceed: false,
      blockers: []
    });

    onCancel();
  }, [isProcessing, processingStage, analyticsHook, onCancel]);

  // Check if deletion can proceed
  const canProceedWithDeletion = useCallback(() => {
    if (isProcessing) return false;
    if (securityRef.current.lockoutUntil && Date.now() < securityRef.current.lockoutUntil) return false;
    
    const validation = validationHook.validationState;
    const eligibility = validationHook.validateDeletionEligibility();
    
    return validation.isValid && eligibility.eligible;
  }, [isProcessing, validationHook]);

  return {
    // Form management
    ...formHook,
    
    // Validation
    validation: validationHook,
    
    // Analytics
    analytics: analyticsHook,
    
    // Processing state
    isProcessing,
    processingStage,
    lastError,
    workflow,
    
    // Security state
    securityAttempts: securityRef.current.attempts,
    isLockedOut: securityRef.current.lockoutUntil && Date.now() < securityRef.current.lockoutUntil,
    lockoutRemaining: securityRef.current.lockoutUntil 
      ? Math.max(0, Math.ceil((securityRef.current.lockoutUntil - Date.now()) / 1000))
      : 0,
    
    // Actions
    processDeletion,
    cancelDeletion,
    canProceedWithDeletion,
    
    // Utility methods
    clearError: () => setLastError(null),
    resetSecurity: () => {
      securityRef.current.attempts = 0;
      securityRef.current.lockoutUntil = null;
      securityRef.current.suspiciousActivity = [];
    },
    
    // Status checks
    isSecure: () => validationHook.validateSecurity().isValid,
    hasBusinessRuleViolations: () => validationHook.validateDeletionEligibility().eligible === false,
    getProgressPercentage: () => workflow.progress,
    
    // Summary for confirmation
    getDeletionSummary: () => ({
      participant: {
        id: participantData?.id,
        name: participantData?.name
      },
      event: {
        id: eventData?.id,
        name: eventData?.name
      },
      reason: formHook.formData.reason,
      details: formHook.formData.details,
      impactAssessment: formHook.formData.impactAssessment,
      securityVerified: validationHook.validateSecurity().isValid,
      businessRulesCompliant: validationHook.validateDeletionEligibility().eligible
    })
  };
};

export default useCompleteDeletePicnicParticipantForm;
