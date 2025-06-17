import * as Yup from 'yup';

/**
 * Delete Picnic Participant Form Validation Schema
 * 
 * Comprehensive validation for picnic participant deletion with
 * security checks, impact assessment, and business rule enforcement.
 */

// Custom validation methods
Yup.addMethod(Yup.string, 'exactMatch', function(expectedValue, message) {
  return this.test('exact-match', message, function(value) {
    const { path, createError } = this;
    return value === expectedValue || createError({ path, message });
  });
});

Yup.addMethod(Yup.object, 'impactAssessment', function(requiredCategories, minimumAcknowledged, message) {
  return this.test('impact-assessment', message, function(value) {
    const { path, createError } = this;
    
    if (!value) {
      return createError({ path, message: 'Impact assessment is required' });
    }

    const acknowledgedCount = Object.values(value).filter(Boolean).length;
    
    if (acknowledgedCount < minimumAcknowledged) {
      return createError({ 
        path, 
        message: `Please acknowledge at least ${minimumAcknowledged} impact categories` 
      });
    }

    // Check if all required categories are acknowledged
    const missingCategories = requiredCategories.filter(category => !value[category]);
    if (missingCategories.length > 0) {
      return createError({ 
        path, 
        message: `Please acknowledge: ${missingCategories.join(', ')}` 
      });
    }

    return true;
  });
});

Yup.addMethod(Yup.string, 'participantDeletionReason', function(message) {
  return this.test('participant-deletion-reason', message, function(value) {
    const { path, createError } = this;
    
    if (!value) {
      return createError({ path, message: 'Deletion reason is required' });
    }

    // Valid reason categories
    const validReasons = [
      'duplicate_registration',
      'incorrect_information',
      'admin_error',
      'participant_withdrawal',
      'cannot_attend',
      'personal_reasons',
      'policy_violation',
      'eligibility_issue',
      'data_protection'
    ];

    if (!validReasons.includes(value)) {
      return createError({ path, message: 'Please select a valid deletion reason' });
    }

    return true;
  });
});

Yup.addMethod(Yup.string, 'picnicParticipantContext', function(message) {
  return this.test('picnic-participant-context', message, function(value) {
    const { path, createError } = this;
    
    if (!value || value.trim().length === 0) {
      return true; // Optional field
    }

    // Check for minimum meaningful content
    if (value.trim().length < 10) {
      return createError({ 
        path, 
        message: 'Additional details must be at least 10 characters if provided' 
      });
    }

    // Check for maximum length
    if (value.length > 500) {
      return createError({ 
        path, 
        message: 'Additional details cannot exceed 500 characters' 
      });
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['test', 'lorem ipsum', 'asdf'];
    const hasInappropriate = inappropriateWords.some(word => 
      value.toLowerCase().includes(word.toLowerCase())
    );

    if (hasInappropriate) {
      return createError({ 
        path, 
        message: 'Please provide meaningful details about the deletion reason' 
      });
    }

    return true;
  });
});

// Main validation schema
export const deletePicnicParticipantFormValidation = Yup.object().shape({
  // Step 1: Deletion reason
  reason: Yup.string()
    .participantDeletionReason('Please select a valid reason for participant deletion')
    .required('Deletion reason is required'),

  details: Yup.string()
    .picnicParticipantContext('Please provide meaningful additional details')
    .nullable(),

  // Step 2: Impact assessment
  impactAssessment: Yup.object()
    .impactAssessment(
      ['eventPlanning', 'financial', 'teamDynamics', 'communication'],
      4,
      'Please acknowledge all impact categories before proceeding'
    )
    .required('Impact assessment is required'),

  // Step 3: Security confirmation
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password confirmation is required for security'),

  confirmation: Yup.string()
    .exactMatch('DELETE PARTICIPANT', 'Type "DELETE PARTICIPANT" exactly to confirm')
    .required('Confirmation text is required'),

  acknowledgeConsequences: Yup.boolean()
    .oneOf([true], 'You must acknowledge the irreversible consequences')
    .required('Acknowledgment of consequences is required'),

  // Hidden fields for context
  participantId: Yup.number()
    .positive('Invalid participant ID')
    .required('Participant ID is required'),

  participantName: Yup.string()
    .min(2, 'Participant name is too short')
    .required('Participant name is required'),

  teamAssignment: Yup.string()
    .nullable(),

  registrationDate: Yup.date()
    .max(new Date(), 'Registration date cannot be in the future')
    .nullable(),

  paymentStatus: Yup.string()
    .oneOf(['paid', 'pending', 'refunded', 'waived'], 'Invalid payment status')
    .nullable()
});

// Step-specific validation schemas
export const stepValidationSchemas = {
  0: Yup.object().shape({
    reason: deletePicnicParticipantFormValidation.fields.reason,
    details: deletePicnicParticipantFormValidation.fields.details,
    participantId: deletePicnicParticipantFormValidation.fields.participantId,
    participantName: deletePicnicParticipantFormValidation.fields.participantName
  }),

  1: Yup.object().shape({
    impactAssessment: deletePicnicParticipantFormValidation.fields.impactAssessment,
    reason: deletePicnicParticipantFormValidation.fields.reason
  }),

  2: Yup.object().shape({
    password: deletePicnicParticipantFormValidation.fields.password,
    confirmation: deletePicnicParticipantFormValidation.fields.confirmation,
    acknowledgeConsequences: deletePicnicParticipantFormValidation.fields.acknowledgeConsequences,
    impactAssessment: deletePicnicParticipantFormValidation.fields.impactAssessment,
    reason: deletePicnicParticipantFormValidation.fields.reason
  })
};

// Business rule validations
export const businessRuleValidations = {
  // Check if participant can be deleted (not within 24 hours of event)
  canDeleteParticipant: (participantData, eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const timeDifference = event.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);

    return {
      isValid: hoursDifference > 24,
      message: hoursDifference <= 24 
        ? 'Cannot delete participant within 24 hours of the event'
        : null
    };
  },

  // Check if manager approval is required
  requiresManagerApproval: (reason, paymentStatus) => {
    const highSeverityReasons = ['policy_violation', 'eligibility_issue', 'data_protection'];
    const paidStatuses = ['paid'];

    const requiresApproval = highSeverityReasons.includes(reason) || paidStatuses.includes(paymentStatus);

    return {
      required: requiresApproval,
      message: requiresApproval 
        ? 'Manager approval required for this type of deletion'
        : null
    };
  },

  // Check refund eligibility
  refundEligibility: (paymentStatus, registrationDate, reason) => {
    const now = new Date();
    const registration = new Date(registrationDate);
    const daysSinceRegistration = (now - registration) / (1000 * 60 * 60 * 24);

    const isEligible = paymentStatus === 'paid' && 
                      daysSinceRegistration <= 30 && 
                      !['policy_violation'].includes(reason);

    return {
      eligible: isEligible,
      amount: isEligible ? 'full' : 'none',
      message: isEligible 
        ? 'Participant is eligible for full refund'
        : 'No refund applicable for this deletion'
    };
  },

  // Team impact validation
  teamImpact: (teamAssignment, teamSize, minTeamSize = 10) => {
    if (!teamAssignment || !teamSize) {
      return { hasImpact: false, message: null };
    }

    const newTeamSize = teamSize - 1;
    const hasImpact = newTeamSize < minTeamSize;

    return {
      hasImpact,
      newSize: newTeamSize,
      message: hasImpact 
        ? `Team will have only ${newTeamSize} members (minimum: ${minTeamSize})`
        : null
    };
  }
};

// Error message helpers
export const getValidationErrorMessage = (error, context = {}) => {
  const { field, value, participantName } = context;

  const errorMessages = {
    'reason': 'Please select a valid reason for removing this participant',
    'details': 'Additional details should provide meaningful context',
    'impactAssessment': 'Please review and acknowledge all impact categories',
    'password': 'Password verification is required for security',
    'confirmation': 'Type "DELETE PARTICIPANT" exactly to confirm',
    'acknowledgeConsequences': 'You must acknowledge this action is irreversible'
  };

  // Personalized error messages
  if (participantName && field === 'confirmation') {
    return `Type "DELETE PARTICIPANT" to confirm removal of ${participantName}`;
  }

  return errorMessages[field] || error.message || 'Please correct this field';
};

// Validation helpers
export const validateStep = async (stepIndex, formData) => {
  try {
    const schema = stepValidationSchemas[stepIndex];
    if (!schema) {
      throw new Error(`No validation schema found for step ${stepIndex}`);
    }

    await schema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    
    if (error.inner) {
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
    }

    return { isValid: false, errors };
  }
};

export const validateBusinessRules = (formData, participantData, eventData) => {
  const results = {
    canDelete: businessRuleValidations.canDeleteParticipant(participantData, eventData.date),
    managerApproval: businessRuleValidations.requiresManagerApproval(formData.reason, participantData.paymentStatus),
    refund: businessRuleValidations.refundEligibility(participantData.paymentStatus, participantData.registrationDate, formData.reason),
    teamImpact: businessRuleValidations.teamImpact(participantData.teamAssignment, eventData.teamSizes?.[participantData.teamAssignment])
  };

  const isValid = results.canDelete.isValid && 
                  (!results.managerApproval.required || eventData.hasManagerApproval);

  return {
    isValid,
    results,
    warnings: [
      results.teamImpact.hasImpact ? results.teamImpact.message : null,
      results.refund.eligible ? results.refund.message : null
    ].filter(Boolean),
    blockers: [
      !results.canDelete.isValid ? results.canDelete.message : null,
      results.managerApproval.required && !eventData.hasManagerApproval ? results.managerApproval.message : null
    ].filter(Boolean)
  };
};

export default deletePicnicParticipantFormValidation;
