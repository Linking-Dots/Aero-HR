/**
 * Family Member Form Validation Schema
 * 
 * @fileoverview Comprehensive validation schema for family member forms using Yup.
 * Provides robust validation for family member information including relationship validation,
 * age verification, phone number formatting, and business rule enforcement.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module FamilyMemberFormValidation
 * @namespace Components.Molecules.FamilyMemberForm
 * 
 * @requires yup ^1.0.0
 * @requires date-fns ^2.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Advanced validation system with:
 * - Relationship-specific validation rules
 * - Age calculation and validation
 * - Indian phone number validation
 * - Name format and uniqueness validation
 * - Business rule enforcement
 * - Real-time validation support
 * 
 * @compliance
 * - ISO 25010 (Software Quality): Input validation, Data integrity
 * - ISO 27001 (Information Security): Data validation, Input sanitization
 * - GDPR: Data protection and privacy validation
 * 
 * @security
 * - Input sanitization and validation
 * - XSS prevention through strict validation
 * - Data type enforcement
 * - Length and format restrictions
 */

import * as Yup from 'yup';
import { 
  RELATIONSHIP_TYPES, 
  PHONE_CONFIG, 
  DATE_CONFIG, 
  BUSINESS_RULES,
  getAllRelationships 
} from './config.js';
import { differenceInYears, parseISO, isValid, isFuture, isPast } from 'date-fns';

/**
 * Custom validation methods
 */
const ValidationMethods = {
  /**
   * Validate Indian phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Validation result
   */
  validateIndianPhone: (phone) => {
    if (!phone) return true; // Optional field
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check length and pattern
    return cleanPhone.length === 10 && PHONE_CONFIG.validation.pattern.test(cleanPhone);
  },

  /**
   * Calculate age from date of birth
   * @param {string} dateOfBirth - ISO date string
   * @returns {number|null} - Age in years or null if invalid
   */
  calculateAge: (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    try {
      const birthDate = parseISO(dateOfBirth);
      if (!isValid(birthDate)) return null;
      
      return differenceInYears(new Date(), birthDate);
    } catch (error) {
      return null;
    }
  },

  /**
   * Validate relationship-specific age requirements
   * @param {string} relationship - Relationship type
   * @param {number} age - Age in years
   * @returns {boolean} - Validation result
   */
  validateRelationshipAge: (relationship, age) => {
    if (!relationship || age === null) return true;
    
    const ageRequirement = BUSINESS_RULES.validation.ageValidations[relationship];
    if (!ageRequirement) return true;
    
    return age >= ageRequirement.minAge;
  },

  /**
   * Validate name format
   * @param {string} name - Name to validate
   * @returns {boolean} - Validation result
   */
  validateNameFormat: (name) => {
    if (!name) return false;
    
    // Check pattern: letters, spaces, dots, hyphens, apostrophes
    const namePattern = /^[a-zA-Z\s.'-]+$/;
    if (!namePattern.test(name)) return false;
    
    // Check word count (1-4 words)
    const words = name.trim().split(/\s+/);
    return words.length >= 1 && words.length <= 4;
  },

  /**
   * Validate date of birth constraints
   * @param {string} dateOfBirth - ISO date string
   * @returns {boolean} - Validation result
   */
  validateDateOfBirth: (dateOfBirth) => {
    if (!dateOfBirth) return false;
    
    try {
      const birthDate = parseISO(dateOfBirth);
      if (!isValid(birthDate)) return false;
      
      // Check if date is in the past (no future dates)
      if (!isPast(birthDate) && !ValidationMethods.isToday(birthDate)) return false;
      
      // Check age constraints
      const age = ValidationMethods.calculateAge(dateOfBirth);
      return age !== null && age >= DATE_CONFIG.validation.minAge && age <= DATE_CONFIG.validation.maxAge;
      
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if date is today
   * @param {Date} date - Date to check
   * @returns {boolean} - True if date is today
   */
  isToday: (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  /**
   * Validate unique relationship constraint
   * @param {string} relationship - Relationship type
   * @param {Array} existingMembers - Existing family members
   * @param {string} currentMemberId - Current member ID (for edit mode)
   * @returns {boolean} - Validation result
   */
  validateUniqueRelationship: (relationship, existingMembers = [], currentMemberId = null) => {
    if (!relationship) return true;
    
    // Check if this relationship should be unique
    if (!BUSINESS_RULES.validation.uniqueRelationships.includes(relationship)) {
      return true;
    }
    
    // Filter out current member in edit mode
    const otherMembers = existingMembers.filter(member => 
      member.id !== currentMemberId
    );
    
    // Check if relationship already exists
    return !otherMembers.some(member => 
      member.family_member_relationship === relationship
    );
  },

  /**
   * Validate duplicate phone numbers
   * @param {string} phone - Phone number to validate
   * @param {Array} existingMembers - Existing family members
   * @param {string} currentMemberId - Current member ID (for edit mode)
   * @returns {boolean} - Validation result
   */
  validateUniquePhone: (phone, existingMembers = [], currentMemberId = null) => {
    if (!phone || !BUSINESS_RULES.validation.phoneRules.preventDuplicates) {
      return true;
    }
    
    // Clean phone number for comparison
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Filter out current member in edit mode
    const otherMembers = existingMembers.filter(member => 
      member.id !== currentMemberId
    );
    
    // Check if phone already exists
    return !otherMembers.some(member => {
      const memberPhone = member.family_member_phone?.replace(/\D/g, '') || '';
      return memberPhone === cleanPhone;
    });
  },

  /**
   * Validate duplicate names
   * @param {string} name - Name to validate
   * @param {Array} existingMembers - Existing family members
   * @param {string} currentMemberId - Current member ID (for edit mode)
   * @returns {boolean} - Validation result
   */
  validateUniqueName: (name, existingMembers = [], currentMemberId = null) => {
    if (!name || !BUSINESS_RULES.validation.nameRules.preventDuplicates) {
      return true;
    }
    
    // Filter out current member in edit mode
    const otherMembers = existingMembers.filter(member => 
      member.id !== currentMemberId
    );
    
    // Check for exact duplicates (case-insensitive)
    const normalizedName = name.toLowerCase().trim();
    return !otherMembers.some(member => {
      const memberName = member.family_member_name?.toLowerCase().trim() || '';
      return memberName === normalizedName;
    });
  }
};

/**
 * Create validation schema with context
 * @param {Object} context - Validation context
 * @param {Array} context.existingMembers - Existing family members
 * @param {string} context.currentMemberId - Current member ID (for edit mode)
 * @param {boolean} context.isEdit - Whether this is an edit operation
 * @returns {Yup.ObjectSchema} - Validation schema
 */
export const createFamilyMemberValidationSchema = (context = {}) => {
  const { existingMembers = [], currentMemberId = null, isEdit = false } = context;
  
  return Yup.object().shape({
    // Family member name validation
    family_member_name: Yup.string()
      .required('Family member name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .test('name-format', 'Name contains invalid characters or format', (value) => {
        return ValidationMethods.validateNameFormat(value);
      })
      .test('unique-name', 'A family member with this name already exists', (value) => {
        return ValidationMethods.validateUniqueName(value, existingMembers, currentMemberId);
      }),

    // Relationship validation
    family_member_relationship: Yup.string()
      .required('Relationship is required')
      .oneOf(
        getAllRelationships().map(r => r.value),
        'Please select a valid relationship'
      )
      .test('unique-relationship', 'This relationship already exists for another family member', (value) => {
        return ValidationMethods.validateUniqueRelationship(value, existingMembers, currentMemberId);
      }),

    // Date of birth validation
    family_member_dob: Yup.string()
      .required('Date of birth is required')
      .test('valid-date', 'Please enter a valid date', (value) => {
        return ValidationMethods.validateDateOfBirth(value);
      })
      .test('age-range', `Age must be between ${DATE_CONFIG.validation.minAge} and ${DATE_CONFIG.validation.maxAge} years`, (value) => {
        if (!value) return false;
        const age = ValidationMethods.calculateAge(value);
        return age !== null && age >= DATE_CONFIG.validation.minAge && age <= DATE_CONFIG.validation.maxAge;
      })
      .test('relationship-age', 'Age does not meet the minimum requirement for this relationship', function(value) {
        const { family_member_relationship } = this.parent;
        if (!value || !family_member_relationship) return true;
        
        const age = ValidationMethods.calculateAge(value);
        return ValidationMethods.validateRelationshipAge(family_member_relationship, age);
      }),

    // Phone number validation (optional)
    family_member_phone: Yup.string()
      .nullable()
      .when('family_member_relationship', {
        is: (relationship) => BUSINESS_RULES.validation.phoneRules.requireForCertainRelationships.includes(relationship),
        then: () => Yup.string().required('Phone number is required for this relationship'),
        otherwise: () => Yup.string().nullable()
      })
      .test('phone-format', 'Please enter a valid 10-digit Indian mobile number', (value) => {
        return ValidationMethods.validateIndianPhone(value);
      })
      .test('unique-phone', 'This phone number is already used by another family member', (value) => {
        return ValidationMethods.validateUniquePhone(value, existingMembers, currentMemberId);
      })
  });
};

/**
 * Validation schema for single field validation
 * Used for real-time validation
 */
export const createFieldValidationSchema = (fieldName, context = {}) => {
  const fullSchema = createFamilyMemberValidationSchema(context);
  return Yup.reach(fullSchema, fieldName);
};

/**
 * Validate individual field
 * @param {string} fieldName - Field name to validate
 * @param {any} value - Field value
 * @param {Object} context - Validation context
 * @returns {Promise<Object>} - Validation result
 */
export const validateField = async (fieldName, value, context = {}) => {
  try {
    const fieldSchema = createFieldValidationSchema(fieldName, context);
    await fieldSchema.validate(value);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

/**
 * Validate entire form
 * @param {Object} values - Form values
 * @param {Object} context - Validation context
 * @returns {Promise<Object>} - Validation result
 */
export const validateForm = async (values, context = {}) => {
  try {
    const schema = createFamilyMemberValidationSchema(context);
    await schema.validate(values, { abortEarly: false });
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

/**
 * Get validation rules summary for a field
 * @param {string} fieldName - Field name
 * @returns {Object} - Validation rules summary
 */
export const getFieldValidationRules = (fieldName) => {
  const rules = {
    family_member_name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: 'Letters, spaces, dots, hyphens, and apostrophes only',
      unique: true
    },
    family_member_relationship: {
      required: true,
      options: getAllRelationships().map(r => r.label),
      unique: 'Some relationships allow only one entry'
    },
    family_member_dob: {
      required: true,
      format: 'YYYY-MM-DD',
      minAge: DATE_CONFIG.validation.minAge,
      maxAge: DATE_CONFIG.validation.maxAge,
      futureDate: false
    },
    family_member_phone: {
      required: 'Required for certain relationships',
      format: '10-digit Indian mobile number',
      pattern: 'Must start with 6, 7, 8, or 9',
      unique: true
    }
  };

  return rules[fieldName] || {};
};

/**
 * Format validation error for display
 * @param {string} error - Error message
 * @param {string} fieldName - Field name
 * @returns {Object} - Formatted error
 */
export const formatValidationError = (error, fieldName) => {
  return {
    message: error,
    field: fieldName,
    type: 'validation',
    severity: 'error',
    timestamp: new Date().toISOString(),
    category: getErrorCategory(error, fieldName)
  };
};

/**
 * Get error category for analytics
 * @param {string} error - Error message
 * @param {string} fieldName - Field name
 * @returns {string} - Error category
 */
const getErrorCategory = (error, fieldName) => {
  if (error.includes('required')) return 'required';
  if (error.includes('format') || error.includes('invalid')) return 'format';
  if (error.includes('already exists') || error.includes('duplicate')) return 'duplicate';
  if (error.includes('age') || error.includes('requirement')) return 'business-rule';
  return 'other';
};

/**
 * Phone number formatting utility
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXXXX XXXXX if 10 digits
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return cleaned;
};

/**
 * Calculate and format age
 * @param {string} dateOfBirth - ISO date string
 * @returns {Object} - Age information
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const birthDate = parseISO(dateOfBirth);
    if (!isValid(birthDate)) return null;
    
    const now = new Date();
    const years = differenceInYears(now, birthDate);
    
    // Calculate months for more precise age
    const monthsBirth = birthDate.getMonth();
    const monthsNow = now.getMonth();
    let months = monthsNow - monthsBirth;
    
    if (months < 0) {
      months += 12;
    }
    
    if (now.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) {
        months += 12;
      }
    }
    
    return {
      years,
      months,
      totalMonths: years * 12 + months,
      formatted: months > 0 ? `${years} years, ${months} months` : `${years} years`,
      isMinor: years < 18,
      isAdult: years >= 18,
      isSenior: years >= 60
    };
  } catch (error) {
    return null;
  }
};

/**
 * Export validation utilities
 */
export const ValidationUtils = {
  createSchema: createFamilyMemberValidationSchema,
  createFieldSchema: createFieldValidationSchema,
  validateField,
  validateForm,
  formatPhoneNumber,
  calculateAge,
  getFieldValidationRules,
  formatValidationError,
  methods: ValidationMethods
};

export default ValidationUtils;
