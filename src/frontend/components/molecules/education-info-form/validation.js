/**
 * Education Information Form Validation Schema
 * 
 * Comprehensive validation using Yup for education management forms
 * Following ISO standards for data quality and validation
 * 
 * @version 1.0.0
 * @since 2024
 */

import * as Yup from 'yup';
import { educationFormConfig } from './config.js';

// Educational institution validation regex
const institutionRegex = /^[a-zA-Z0-9\s\-_.,&()]+$/;
const degreeRegex = /^[a-zA-Z0-9\s\-_.,()]+$/;
const subjectRegex = /^[a-zA-Z0-9\s\-_.,&()]+$/;
const gradeRegex = /^[a-zA-Z0-9\s\-_.,+%]+$/;

// Date validation helpers
const currentDate = new Date().toISOString().slice(0, 7);
const minDate = '1950-01';

/**
 * Single education entry validation schema
 */
const singleEducationSchema = Yup.object().shape({
  institution: Yup.string()
    .required('Institution name is required')
    .min(2, 'Institution name must be at least 2 characters')
    .max(255, 'Institution name cannot exceed 255 characters')
    .matches(institutionRegex, 'Institution name contains invalid characters')
    .trim()
    .transform((value) => value?.replace(/\s+/g, ' ')), // Normalize whitespace

  degree: Yup.string()
    .required('Degree is required')
    .min(2, 'Degree must be at least 2 characters')
    .max(100, 'Degree cannot exceed 100 characters')
    .matches(degreeRegex, 'Degree contains invalid characters')
    .trim()
    .transform((value) => value?.replace(/\s+/g, ' ')),

  subject: Yup.string()
    .required('Subject is required')
    .min(2, 'Subject must be at least 2 characters')
    .max(150, 'Subject cannot exceed 150 characters')
    .matches(subjectRegex, 'Subject contains invalid characters')
    .trim()
    .transform((value) => value?.replace(/\s+/g, ' ')),

  starting_date: Yup.string()
    .required('Start date is required')
    .matches(/^\d{4}-\d{2}$/, 'Please enter a valid date in YYYY-MM format')
    .test('not-future', 'Start date cannot be in the future', function(value) {
      if (!value) return true;
      return value <= currentDate;
    })
    .test('reasonable-date', 'Please enter a reasonable start date', function(value) {
      if (!value) return true;
      return value >= minDate;
    }),

  complete_date: Yup.string()
    .nullable()
    .optional()
    .matches(/^\d{4}-\d{2}$/, 'Please enter a valid date in YYYY-MM format')
    .test('not-future', 'Completion date cannot be in the future', function(value) {
      if (!value) return true;
      return value <= currentDate;
    })
    .test('after-start', 'Completion date must be after start date', function(value) {
      if (!value) return true; // Optional field
      const startDate = this.parent.starting_date;
      if (!startDate) return true;
      return value >= startDate;
    })
    .test('reasonable-duration', 'Education duration seems unrealistic', function(value) {
      if (!value) return true;
      const startDate = this.parent.starting_date;
      if (!startDate) return true;
      
      // Calculate duration in months
      const start = new Date(startDate + '-01');
      const end = new Date(value + '-01');
      const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      
      // Education should be between 1 month and 15 years (180 months)
      return monthsDiff >= 1 && monthsDiff <= 180;
    }),

  grade: Yup.string()
    .nullable()
    .optional()
    .max(50, 'Grade cannot exceed 50 characters')
    .matches(gradeRegex, 'Grade contains invalid characters')
    .trim()
    .test('valid-grade-format', 'Please enter a valid grade format', function(value) {
      if (!value) return true; // Optional field
      
      // Common grade formats validation
      const gradePatterns = [
        /^[A-F][+-]?$/i, // Letter grades (A, B+, C-, etc.)
        /^(10|[0-9])(\.[0-9]{1,2})?$/, // GPA (0.0 to 10.0)
        /^(100|[0-9]{1,2})(\.[0-9]{1,2})?%?$/, // Percentage (0-100%)
        /^(PASS|FAIL|DISTINCTION|MERIT|FIRST\s*CLASS|SECOND\s*CLASS|THIRD\s*CLASS)$/i, // Text grades
        /^[0-9]{1,3}\s*\/\s*[0-9]{1,3}$/ // Fraction format (85/100)
      ];
      
      return gradePatterns.some(pattern => pattern.test(value));
    }),

  // Hidden fields for backend compatibility
  id: Yup.number().nullable().optional(),
  user_id: Yup.number().nullable().optional()
});

/**
 * Complete education form validation schema
 */
export const educationFormValidationSchema = Yup.object().shape({
  educations: Yup.array()
    .of(singleEducationSchema)
    .min(educationFormConfig.businessRules.minEntries, 
         `At least ${educationFormConfig.businessRules.minEntries} education record is required`)
    .max(educationFormConfig.businessRules.maxEntries,
         `Cannot add more than ${educationFormConfig.businessRules.maxEntries} education records`)
    .test('no-duplicates', 'Duplicate education records are not allowed', function(educations) {
      if (!educations || educations.length <= 1) return true;
      
      const uniqueKeys = new Set();
      
      for (const education of educations) {
        // Create a unique key based on institution, degree, and start date
        const key = `${education.institution?.toLowerCase()?.trim()}-${education.degree?.toLowerCase()?.trim()}-${education.starting_date}`;
        
        if (uniqueKeys.has(key)) {
          return this.createError({
            message: 'Duplicate education records found. Please ensure each education entry is unique.',
            path: 'educations'
          });
        }
        
        uniqueKeys.add(key);
      }
      
      return true;
    })
    .test('chronological-order', 'Education records should be in chronological order', function(educations) {
      if (!educations || educations.length <= 1) return true;
      
      // Sort by start date and check for logical progression
      const sortedEducations = [...educations].sort((a, b) => {
        if (!a.starting_date || !b.starting_date) return 0;
        return a.starting_date.localeCompare(b.starting_date);
      });
      
      // Check for overlapping education periods
      for (let i = 0; i < sortedEducations.length - 1; i++) {
        const current = sortedEducations[i];
        const next = sortedEducations[i + 1];
        
        if (current.complete_date && next.starting_date) {
          if (current.complete_date > next.starting_date) {
            return this.createError({
              message: 'Overlapping education periods detected. Please check your dates.',
              path: 'educations'
            });
          }
        }
      }
      
      return true;
    }),

  // User identification (for form context)
  user_id: Yup.number()
    .required('User ID is required')
    .positive('Invalid user ID')
});

/**
 * Validation schema for education deletion
 */
export const educationDeleteValidationSchema = Yup.object().shape({
  id: Yup.number()
    .required('Education record ID is required')
    .positive('Invalid education record ID'),
    
  user_id: Yup.number()
    .required('User ID is required')
    .positive('Invalid user ID')
});

/**
 * Real-time field validation schemas
 */
export const fieldValidationSchemas = {
  institution: singleEducationSchema.pick(['institution']),
  degree: singleEducationSchema.pick(['degree']),
  subject: singleEducationSchema.pick(['subject']),
  starting_date: singleEducationSchema.pick(['starting_date']),
  complete_date: singleEducationSchema.pick(['complete_date']),
  grade: singleEducationSchema.pick(['grade'])
};

/**
 * Custom validation functions for specific business rules
 */
export const customValidations = {
  /**
   * Validate educational progression (basic to advanced)
   */
  validateEducationalProgression: (educations) => {
    if (!educations || educations.length <= 1) return { isValid: true };
    
    const educationLevels = educationFormConfig.businessRules.progressionRules.levels;
    const errors = [];
    
    // Sort by start date
    const sortedEducations = [...educations]
      .filter(edu => edu.starting_date)
      .sort((a, b) => a.starting_date.localeCompare(b.starting_date));
    
    for (let i = 0; i < sortedEducations.length - 1; i++) {
      const currentLevel = getEducationLevel(sortedEducations[i].degree);
      const nextLevel = getEducationLevel(sortedEducations[i + 1].degree);
      
      if (currentLevel !== -1 && nextLevel !== -1 && nextLevel < currentLevel) {
        errors.push({
          index: i + 1,
          message: 'Education progression appears inconsistent (advanced to basic level)'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate institution legitimacy (basic check)
   */
  validateInstitutionLegitimacy: async (institutionName) => {
    try {
      // This would typically call an external API to verify the institution
      // For now, we'll do basic validation
      const commonWords = ['university', 'college', 'institute', 'school', 'academy'];
      const hasCommonWord = commonWords.some(word => 
        institutionName.toLowerCase().includes(word)
      );
      
      return {
        isValid: hasCommonWord || institutionName.length > 10,
        message: hasCommonWord ? null : 'Please verify the institution name'
      };
    } catch (error) {
      return { isValid: true, message: null }; // Fail open for validation
    }
  },

  /**
   * Validate grade consistency with degree level
   */
  validateGradeConsistency: (degree, grade) => {
    if (!grade) return { isValid: true };
    
    // Basic grade consistency checks based on degree level
    const degreeLevel = getEducationLevel(degree);
    const errors = [];
    
    // PhD typically doesn't have traditional grades
    if (degreeLevel === 6 && /^[A-F]$/i.test(grade)) {
      errors.push('PhD programs typically use Pass/Fail or no grades');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Helper function to determine education level
 */
function getEducationLevel(degree) {
  if (!degree) return -1;
  
  const degreeLower = degree.toLowerCase();
  const levels = educationFormConfig.businessRules.progressionRules.levels;
  
  for (let i = 0; i < levels.length; i++) {
    if (degreeLower.includes(levels[i].toLowerCase())) {
      return i;
    }
  }
  
  return -1; // Unknown level
}

/**
 * Transform and sanitize form data before submission
 */
export const transformEducationData = (formData) => {
  return {
    ...formData,
    educations: formData.educations?.map(education => ({
      ...education,
      institution: education.institution?.trim().replace(/\s+/g, ' '),
      degree: education.degree?.trim().replace(/\s+/g, ' '),
      subject: education.subject?.trim().replace(/\s+/g, ' '),
      grade: education.grade?.trim() || null,
      complete_date: education.complete_date?.trim() || null
    }))
  };
};

export default educationFormValidationSchema;
