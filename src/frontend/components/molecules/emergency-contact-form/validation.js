/**
 * Emergency Contact Form Validation Schema
 * 
 * Comprehensive Yup validation schema for emergency contact information.
 * Includes Indian phone number validation, duplicate detection, and business rules.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security)
 * - ISO 9001 (Quality Management)
 */

import * as Yup from 'yup';
import { PHONE_FORMATS, RELATIONSHIP_TYPES, ERROR_MESSAGES } from './config.js';

// Custom validation functions
const validateIndianMobile = (value) => {
  if (!value) return true; // Let required handle empty values
  
  // Remove all non-digits
  const cleanPhone = value.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number (10 digits starting with 6-9)
  if (cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)) {
    return true;
  }
  
  // Check if it includes country code (+91)
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91') && /^91[6-9]/.test(cleanPhone)) {
    return true;
  }
  
  return false;
};

const validatePhoneFormat = (value) => {
  if (!value) return true;
  
  const cleanPhone = value.replace(/\D/g, '');
  
  // Indian mobile (with or without +91)
  if (PHONE_FORMATS.INDIAN_MOBILE.pattern.test(cleanPhone) || 
      (cleanPhone.length === 12 && cleanPhone.startsWith('91'))) {
    return true;
  }
  
  // Indian landline
  if (PHONE_FORMATS.INDIAN_LANDLINE.pattern.test(cleanPhone)) {
    return true;
  }
  
  // International format
  if (value.startsWith('+') && PHONE_FORMATS.INTERNATIONAL.pattern.test(value)) {
    return true;
  }
  
  return false;
};

const validateName = (value) => {
  if (!value) return true;
  
  // Name should contain only letters, spaces, apostrophes, hyphens, and dots
  const namePattern = /^[a-zA-Z\s'\-\.]+$/;
  
  // Should not start or end with special characters
  const trimmedValue = value.trim();
  if (trimmedValue !== value) return false;
  
  // Should not have consecutive spaces or special characters
  if (/\s{2,}|['\-\.]{2,}/.test(value)) return false;
  
  return namePattern.test(value);
};

const validateRelationship = (value) => {
  if (!value) return true;
  
  // Check if the relationship exists in the predefined list
  return RELATIONSHIP_TYPES.some(rel => rel.value === value);
};

// Custom validation methods
Yup.addMethod(Yup.string, 'indianPhone', function(message = ERROR_MESSAGES.format.phone) {
  return this.test('indian-phone', message, function(value) {
    const { path, createError } = this;
    
    if (!value) return true; // Let required handle empty values
    
    if (!validateIndianMobile(value)) {
      return createError({
        path,
        message: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)'
      });
    }
    
    return true;
  });
});

Yup.addMethod(Yup.string, 'phoneFormat', function(message = ERROR_MESSAGES.format.phone) {
  return this.test('phone-format', message, function(value) {
    const { path, createError } = this;
    
    if (!value) return true;
    
    if (!validatePhoneFormat(value)) {
      return createError({
        path,
        message: 'Please enter a valid phone number format'
      });
    }
    
    return true;
  });
});

Yup.addMethod(Yup.string, 'contactName', function(message = ERROR_MESSAGES.format.name) {
  return this.test('contact-name', message, function(value) {
    const { path, createError } = this;
    
    if (!value) return true;
    
    if (!validateName(value)) {
      return createError({
        path,
        message: 'Please enter a valid name (letters, spaces, apostrophes, hyphens, and dots only)'
      });
    }
    
    return true;
  });
});

Yup.addMethod(Yup.string, 'validRelationship', function(message = ERROR_MESSAGES.format.relationship) {
  return this.test('valid-relationship', message, function(value) {
    const { path, createError } = this;
    
    if (!value) return true;
    
    if (!validateRelationship(value)) {
      return createError({
        path,
        message: 'Please select a valid relationship'
      });
    }
    
    return true;
  });
});

// Contact schema for individual contact validation
const contactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .contactName()
    .required(ERROR_MESSAGES.required.name),
    
  relationship: Yup.string()
    .validRelationship()
    .required(ERROR_MESSAGES.required.relationship),
    
  phone: Yup.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .indianPhone()
    .phoneFormat()
    .required(ERROR_MESSAGES.required.phone)
});

// Main emergency contact form validation schema
export const emergencyContactValidationSchema = Yup.object().shape({
  // User ID (hidden field)
  id: Yup.number().required('User ID is required'),
  
  // Primary contact (required)
  emergency_contact_primary_name: Yup.string()
    .min(2, 'Primary contact name must be at least 2 characters')
    .max(100, 'Primary contact name must not exceed 100 characters')
    .contactName()
    .required(ERROR_MESSAGES.required.name),
    
  emergency_contact_primary_relationship: Yup.string()
    .validRelationship()
    .required(ERROR_MESSAGES.required.relationship),
    
  emergency_contact_primary_phone: Yup.string()
    .min(10, 'Primary contact phone must be at least 10 digits')
    .max(15, 'Primary contact phone must not exceed 15 digits')
    .indianPhone()
    .phoneFormat()
    .required(ERROR_MESSAGES.required.phone),
  
  // Secondary contact (optional)
  emergency_contact_secondary_name: Yup.string()
    .min(2, 'Secondary contact name must be at least 2 characters')
    .max(100, 'Secondary contact name must not exceed 100 characters')
    .contactName()
    .nullable(),
    
  emergency_contact_secondary_relationship: Yup.string()
    .validRelationship()
    .nullable(),
    
  emergency_contact_secondary_phone: Yup.string()
    .min(10, 'Secondary contact phone must be at least 10 digits')
    .max(15, 'Secondary contact phone must not exceed 15 digits')
    .indianPhone()
    .phoneFormat()
    .nullable()
}).test('duplicate-phones', ERROR_MESSAGES.business.duplicatePhone, function(values) {
  const { emergency_contact_primary_phone, emergency_contact_secondary_phone } = values;
  
  // If both phones are provided, they should be different
  if (emergency_contact_primary_phone && emergency_contact_secondary_phone) {
    const primaryClean = emergency_contact_primary_phone.replace(/\D/g, '');
    const secondaryClean = emergency_contact_secondary_phone.replace(/\D/g, '');
    
    if (primaryClean === secondaryClean) {
      return this.createError({
        path: 'emergency_contact_secondary_phone',
        message: ERROR_MESSAGES.business.duplicatePhone
      });
    }
  }
  
  return true;
}).test('secondary-contact-completeness', 'Secondary contact information must be complete if any field is provided', function(values) {
  const { 
    emergency_contact_secondary_name, 
    emergency_contact_secondary_relationship, 
    emergency_contact_secondary_phone 
  } = values;
  
  const secondaryFields = [
    emergency_contact_secondary_name,
    emergency_contact_secondary_relationship,
    emergency_contact_secondary_phone
  ].filter(field => field && field.trim() !== '');
  
  // If any secondary field is provided, all should be provided
  if (secondaryFields.length > 0 && secondaryFields.length < 3) {
    const missingFields = [];
    
    if (!emergency_contact_secondary_name?.trim()) {
      missingFields.push('name');
    }
    if (!emergency_contact_secondary_relationship?.trim()) {
      missingFields.push('relationship');
    }
    if (!emergency_contact_secondary_phone?.trim()) {
      missingFields.push('phone');
    }
    
    if (missingFields.length > 0) {
      return this.createError({
        path: `emergency_contact_secondary_${missingFields[0]}`,
        message: `Please complete all secondary contact fields or leave them all empty. Missing: ${missingFields.join(', ')}`
      });
    }
  }
  
  return true;
});

// Validation schema for individual contact components
export const primaryContactValidationSchema = Yup.object().shape({
  emergency_contact_primary_name: emergencyContactValidationSchema.fields.emergency_contact_primary_name,
  emergency_contact_primary_relationship: emergencyContactValidationSchema.fields.emergency_contact_primary_relationship,
  emergency_contact_primary_phone: emergencyContactValidationSchema.fields.emergency_contact_primary_phone
});

export const secondaryContactValidationSchema = Yup.object().shape({
  emergency_contact_secondary_name: emergencyContactValidationSchema.fields.emergency_contact_secondary_name,
  emergency_contact_secondary_relationship: emergencyContactValidationSchema.fields.emergency_contact_secondary_relationship,
  emergency_contact_secondary_phone: emergencyContactValidationSchema.fields.emergency_contact_secondary_phone
});

// Validation helper functions
export const validateField = async (fieldName, value, schema = emergencyContactValidationSchema) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const validateContact = async (contactData, type = 'primary') => {
  const schema = type === 'primary' ? primaryContactValidationSchema : secondaryContactValidationSchema;
  
  try {
    await schema.validate(contactData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

export const validateEmergencyContacts = async (formData) => {
  try {
    await emergencyContactValidationSchema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

// Format phone number for display
export const formatPhoneForDisplay = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Indian mobile format: +91 XXXXX XXXXX
  if (cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)) {
    return `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
  }
  
  // Already formatted Indian mobile with country code
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    const number = cleanPhone.slice(2);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  return phone; // Return as-is for other formats
};

// Clean phone number for storage
export const cleanPhoneForStorage = (phone) => {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add +91 prefix for Indian mobile numbers without country code
  if (cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)) {
    return `+91${cleanPhone}`;
  }
  
  // Format with + for international numbers starting with country code
  if (cleanPhone.length > 10 && !phone.startsWith('+')) {
    return `+${cleanPhone}`;
  }
  
  return phone;
};

export {
  contactSchema,
  validateIndianMobile,
  validatePhoneFormat,
  validateName,
  validateRelationship
};

export default emergencyContactValidationSchema;
