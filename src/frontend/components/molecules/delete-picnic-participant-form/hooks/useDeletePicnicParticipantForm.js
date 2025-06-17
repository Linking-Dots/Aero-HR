import { useState, useCallback, useRef, useEffect } from 'react';
import { deletePicnicParticipantFormConfig } from '../config.js';

/**
 * Hook for managing delete picnic participant form state and operations
 * 
 * Features:
 * - Multi-step form state management
 * - Participant data handling
 * - Security and confirmation logic
 * - Integration with picnic management system
 * - Comprehensive error handling
 */
export const useDeletePicnicParticipantForm = (config = {}) => {
  // Form state
  const [formData, setFormData] = useState({
    reason: '',
    details: '',
    impactAssessment: {
      eventPlanning: false,
      financial: false,
      teamDynamics: false,
      communication: false
    },
    password: '',
    confirmation: '',
    acknowledgeConsequences: false,
    participantId: null,
    participantName: '',
    teamAssignment: '',
    registrationDate: null,
    paymentStatus: null
  });

  // Processing state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);

  // Participant and event data
  const [participantData, setParticipantData] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [teamData, setTeamData] = useState(null);

  // Security and audit
  const [securityAttempts, setSecurityAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Performance tracking
  const performanceRef = useRef({
    formStartTime: Date.now(),
    stepStartTimes: {},
    interactionCount: 0,
    validationCount: 0
  });

  const abortControllerRef = useRef(null);

  // Configuration
  const { 
    security, 
    endpoints, 
    businessRules,
    validation: validationConfig 
  } = { ...deletePicnicParticipantFormConfig, ...config };

  // Initialize participant data
  const initializeParticipant = useCallback(async (participantId) => {
    if (!participantId) {
      setLastError(new Error('Participant ID is required'));
      return false;
    }

    setIsLoading(true);
    setLastError(null);

    try {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        endpoints.getParticipantInfo.replace('{id}', participantId),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch participant data: ${response.statusText}`);
      }

      const data = await response.json();
      
      setParticipantData(data.participant);
      setEventData(data.event);
      setTeamData(data.team);
      
      // Update form data with participant info
      setFormData(prev => ({
        ...prev,
        participantId: data.participant.id,
        participantName: data.participant.name,
        teamAssignment: data.participant.team_assignment,
        registrationDate: data.participant.registration_date,
        paymentStatus: data.participant.payment_status
      }));

      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        setLastError(error);
        console.error('Error initializing participant:', error);
      }
      return false;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [endpoints.getParticipantInfo]);

  // Update form field
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => {
      // Handle nested object updates (e.g., impactAssessment.financial)
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });

    // Track interaction
    performanceRef.current.interactionCount++;
    
    // Clear related errors when field changes
    if (field === 'password') {
      setSecurityAttempts(0);
    }
  }, []);

  // Validate deletion eligibility
  const validateDeletionEligibility = useCallback(async () => {
    if (!participantData || !eventData) {
      return { canDelete: false, reasons: ['Participant or event data not loaded'] };
    }

    try {
      const response = await fetch(endpoints.validate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          participant_id: formData.participantId,
          reason: formData.reason,
          event_date: eventData.date
        })
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating deletion eligibility:', error);
      return { 
        canDelete: false, 
        reasons: ['Failed to validate deletion eligibility'],
        error: error.message 
      };
    }
  }, [participantData, eventData, formData.participantId, formData.reason, endpoints.validate]);

  // Verify security credentials
  const verifySecurityCredentials = useCallback(async (password) => {
    if (isLockedOut) {
      throw new Error('Account is temporarily locked due to failed attempts');
    }

    try {
      const response = await fetch(endpoints.checkSecurity, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        setSecurityAttempts(prev => prev + 1);
        
        if (securityAttempts + 1 >= security.maxAttempts) {
          setIsLockedOut(true);
          setLockoutTime(Date.now() + security.lockoutDuration);
        }
        
        throw new Error('Invalid password');
      }

      setSecurityAttempts(0);
      return true;
    } catch (error) {
      throw error;
    }
  }, [isLockedOut, securityAttempts, security.maxAttempts, security.lockoutDuration, endpoints.checkSecurity]);

  // Submit deletion request
  const submitDeletion = useCallback(async () => {
    if (isSubmitting) return false;

    setIsSubmitting(true);
    setSubmitAttempts(prev => prev + 1);
    setLastError(null);

    try {
      // Final validation
      const eligibilityCheck = await validateDeletionEligibility();
      if (!eligibilityCheck.canDelete) {
        throw new Error(`Deletion not allowed: ${eligibilityCheck.reasons.join(', ')}`);
      }

      // Security verification
      await verifySecurityCredentials(formData.password);

      // Confirmation check
      if (formData.confirmation !== security.matchPhrase) {
        throw new Error('Confirmation text does not match');
      }

      // Submit deletion
      const response = await fetch(endpoints.delete, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          participant_id: formData.participantId,
          reason: formData.reason,
          details: formData.details,
          impact_assessment: formData.impactAssessment,
          session_data: {
            start_time: performanceRef.current.formStartTime,
            interaction_count: performanceRef.current.interactionCount,
            attempt_number: submitAttempts
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deletion failed');
      }

      const result = await response.json();

      // Log audit trail
      if (security.auditLogging) {
        await logAuditEvent('participant_deleted', {
          participant_id: formData.participantId,
          participant_name: formData.participantName,
          reason: formData.reason,
          details: formData.details,
          impact_assessment: formData.impactAssessment,
          timestamp: new Date().toISOString(),
          session_duration: Date.now() - performanceRef.current.formStartTime
        });
      }

      return {
        success: true,
        data: result,
        message: 'Participant deleted successfully'
      };
    } catch (error) {
      setLastError(error);
      
      // Log security events
      if (security.suspiciousActivityDetection && submitAttempts > 2) {
        await logAuditEvent('suspicious_deletion_attempts', {
          participant_id: formData.participantId,
          attempt_count: submitAttempts,
          error_message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: false,
        error: error.message,
        message: `Deletion failed: ${error.message}`
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting, 
    formData, 
    security, 
    endpoints.delete, 
    submitAttempts,
    validateDeletionEligibility,
    verifySecurityCredentials
  ]);

  // Log audit events
  const logAuditEvent = useCallback(async (eventType, eventData) => {
    try {
      await fetch(endpoints.auditLog, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to log audit event:', error);
    }
  }, [endpoints.auditLog]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      reason: '',
      details: '',
      impactAssessment: {
        eventPlanning: false,
        financial: false,
        teamDynamics: false,
        communication: false
      },
      password: '',
      confirmation: '',
      acknowledgeConsequences: false,
      participantId: null,
      participantName: '',
      teamAssignment: '',
      registrationDate: null,
      paymentStatus: null
    });
    
    setIsSubmitting(false);
    setSubmitAttempts(0);
    setLastError(null);
    setSecurityAttempts(0);
    setIsLockedOut(false);
    setLockoutTime(null);
    
    performanceRef.current = {
      formStartTime: Date.now(),
      stepStartTimes: {},
      interactionCount: 0,
      validationCount: 0
    };
  }, []);

  // Check lockout status
  useEffect(() => {
    if (isLockedOut && lockoutTime) {
      const timer = setTimeout(() => {
        if (Date.now() >= lockoutTime) {
          setIsLockedOut(false);
          setLockoutTime(null);
          setSecurityAttempts(0);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLockedOut, lockoutTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Form state
    formData,
    updateFormData,
    resetForm,
    
    // Participant data
    participantData,
    eventData,
    teamData,
    initializeParticipant,
    
    // Processing state
    isLoading,
    isSubmitting,
    submitAttempts,
    lastError,
    
    // Security state
    securityAttempts,
    isLockedOut,
    lockoutTime,
    maxAttempts: security.maxAttempts,
    
    // Operations
    validateDeletionEligibility,
    verifySecurityCredentials,
    submitDeletion,
    
    // Performance data
    getPerformanceMetrics: () => ({
      sessionDuration: Date.now() - performanceRef.current.formStartTime,
      interactionCount: performanceRef.current.interactionCount,
      validationCount: performanceRef.current.validationCount,
      submitAttempts
    }),
    
    // Computed values
    canSubmit: !isSubmitting && !isLockedOut && formData.participantId,
    hasParticipantData: !!participantData,
    remainingAttempts: Math.max(0, security.maxAttempts - securityAttempts)
  };
};

export default useDeletePicnicParticipantForm;
