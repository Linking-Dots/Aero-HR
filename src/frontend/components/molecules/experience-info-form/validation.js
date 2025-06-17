/**
 * Experience Information Form Validation Schema
 * 
 * Comprehensive validation rules for work experience management
 * Following business logic and data integrity standards
 * 
 * @version 1.0.0
 * @since 2024
 */

import * as Yup from 'yup';
import { experienceFormConfig } from './config.js';

/**
 * Custom validation functions for experience data
 */
export const customValidations = {
  /**
   * Validate experience date ranges
   */
  validateDateRange: (experience) => {
    const { period_from, period_to } = experience;
    
    if (!period_from) return { isValid: false, error: 'Start date is required' };
    
    const startDate = new Date(period_from);
    const endDate = period_to ? new Date(period_to) : new Date();
    const currentDate = new Date();
    
    // Check if start date is in the future
    if (startDate > currentDate) {
      return { isValid: false, error: 'Start date cannot be in the future' };
    }
    
    // Check if end date is before start date
    if (period_to && endDate < startDate) {
      return { isValid: false, error: 'End date must be after start date' };
    }
    
    // Check for reasonable duration (not more than 50 years)
    const durationYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
    if (durationYears > 50) {
      return { isValid: false, error: 'Experience duration seems unrealistic (more than 50 years)' };
    }
    
    return { isValid: true };
  },

  /**
   * Validate for overlapping employment periods
   */
  validateNoOverlaps: (experiences) => {
    const errors = [];
    
    for (let i = 0; i < experiences.length; i++) {
      for (let j = i + 1; j < experiences.length; j++) {
        const exp1 = experiences[i];
        const exp2 = experiences[j];
        
        // Skip if either experience doesn't have valid dates
        if (!exp1.period_from || !exp2.period_from) continue;
        
        const start1 = new Date(exp1.period_from);
        const end1 = exp1.period_to ? new Date(exp1.period_to) : new Date();
        const start2 = new Date(exp2.period_from);
        const end2 = exp2.period_to ? new Date(exp2.period_to) : new Date();
        
        // Check for overlap
        if ((start1 <= end2 && end1 >= start2)) {
          errors.push({
            indices: [i, j],
            message: `Experience periods overlap between "${exp1.company_name}" and "${exp2.company_name}"`
          });
        }
      }
    }
    
    return { hasOverlaps: errors.length > 0, errors };
  },

  /**
   * Detect career gaps
   */
  detectCareerGaps: (experiences) => {
    const gaps = [];
    
    // Sort experiences by start date
    const sortedExperiences = experiences
      .filter(exp => exp.period_from)
      .sort((a, b) => new Date(a.period_from) - new Date(b.period_from));
    
    for (let i = 0; i < sortedExperiences.length - 1; i++) {
      const current = sortedExperiences[i];
      const next = sortedExperiences[i + 1];
      
      const currentEnd = current.period_to ? new Date(current.period_to) : new Date();
      const nextStart = new Date(next.period_from);
      
      const gapDays = (nextStart - currentEnd) / (1000 * 60 * 60 * 24);
      const gapMonths = gapDays / 30;
      
      if (gapMonths > experienceFormConfig.businessRules.progressionRules.maxGapMonths) {
        gaps.push({
          between: [i, i + 1],
          months: Math.round(gapMonths),
          description: `${Math.round(gapMonths)} month gap between ${current.company_name} and ${next.company_name}`
        });
      }
    }
    
    return gaps;
  },

  /**
   * Calculate total work experience
   */
  calculateTotalExperience: (experiences) => {
    let totalDays = 0;
    
    experiences.forEach(exp => {
      if (exp.period_from) {
        const startDate = new Date(exp.period_from);
        const endDate = exp.period_to ? new Date(exp.period_to) : new Date();
        const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
        totalDays += Math.max(0, duration);
      }
    });
    
    const totalYears = Math.floor(totalDays / 365);
    const remainingMonths = Math.floor((totalDays % 365) / 30);
    
    return {
      totalDays,
      totalYears,
      totalMonths: remainingMonths,
      formatted: totalYears > 0 ? 
        `${totalYears} year${totalYears !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` :
        `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
    };
  },

  /**
   * Validate experience progression
   */
  validateCareerProgression: (experiences) => {
    const errors = [];
    
    // Sort by start date
    const sortedExperiences = experiences
      .filter(exp => exp.period_from)
      .sort((a, b) => new Date(a.period_from) - new Date(b.period_from));
    
    // Check for logical progression patterns
    const seniorityLevels = [
      'intern', 'trainee', 'junior', 'associate', 'senior', 'lead', 'principal', 
      'manager', 'director', 'vp', 'ceo', 'cto', 'cfo'
    ];
    
    for (let i = 0; i < sortedExperiences.length - 1; i++) {
      const current = sortedExperiences[i];
      const next = sortedExperiences[i + 1];
      
      // Check for significant step-downs that might indicate data entry errors
      const currentLevel = getSeniorityLevel(current.job_position, seniorityLevels);
      const nextLevel = getSeniorityLevel(next.job_position, seniorityLevels);
      
      if (currentLevel > nextLevel && (currentLevel - nextLevel) > 2) {
        errors.push({
          index: i + 1,
          message: `Potential career step-down detected: from ${current.job_position} to ${next.job_position}`
        });
      }
    }
    
    return { errors, hasIssues: errors.length > 0 };
  },

  /**
   * Detect duplicate experiences
   */
  detectDuplicates: (experiences) => {
    const duplicates = [];
    const seen = new Map();
    
    experiences.forEach((experience, index) => {
      if (!experience.company_name || !experience.job_position) return;
      
      const key = `${experience.company_name.toLowerCase().trim()}-${experience.job_position.toLowerCase().trim()}-${experience.period_from || 'no-date'}`;
      
      if (seen.has(key)) {
        duplicates.push({
          indices: [seen.get(key), index],
          experience,
          message: `Potential duplicate: ${experience.job_position} at ${experience.company_name}`
        });
      } else {
        seen.set(key, index);
      }
    });
    
    return duplicates;
  }
};

/**
 * Helper function to determine seniority level
 */
function getSeniorityLevel(jobTitle, levels) {
  if (!jobTitle) return -1;
  
  const titleLower = jobTitle.toLowerCase();
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (titleLower.includes(levels[i])) {
      return i;
    }
  }
  
  return -1; // Unknown level
}

/**
 * Main validation schema for experience form
 */
export const experienceFormValidationSchema = Yup.object().shape({
  experiences: Yup.array()
    .of(
      Yup.object().shape({
        company_name: Yup.string()
          .required(experienceFormConfig.fields.company_name.validation.required)
          .min(
            experienceFormConfig.fields.company_name.validation.minLength.value,
            experienceFormConfig.fields.company_name.validation.minLength.message
          )
          .max(
            experienceFormConfig.fields.company_name.validation.maxLength.value,
            experienceFormConfig.fields.company_name.validation.maxLength.message
          )
          .matches(
            experienceFormConfig.fields.company_name.validation.pattern.value,
            experienceFormConfig.fields.company_name.validation.pattern.message
          ),
        
        location: Yup.string()
          .required(experienceFormConfig.fields.location.validation.required)
          .min(
            experienceFormConfig.fields.location.validation.minLength.value,
            experienceFormConfig.fields.location.validation.minLength.message
          )
          .max(
            experienceFormConfig.fields.location.validation.maxLength.value,
            experienceFormConfig.fields.location.validation.maxLength.message
          )
          .matches(
            experienceFormConfig.fields.location.validation.pattern.value,
            experienceFormConfig.fields.location.validation.pattern.message
          ),
        
        job_position: Yup.string()
          .required(experienceFormConfig.fields.job_position.validation.required)
          .min(
            experienceFormConfig.fields.job_position.validation.minLength.value,
            experienceFormConfig.fields.job_position.validation.minLength.message
          )
          .max(
            experienceFormConfig.fields.job_position.validation.maxLength.value,
            experienceFormConfig.fields.job_position.validation.maxLength.message
          )
          .matches(
            experienceFormConfig.fields.job_position.validation.pattern.value,
            experienceFormConfig.fields.job_position.validation.pattern.message
          ),
        
        period_from: Yup.date()
          .required(experienceFormConfig.fields.period_from.validation.required)
          .max(new Date(), 'Start date cannot be in the future')
          .min(new Date('1950-01-01'), 'Please enter a reasonable start date'),
        
        period_to: Yup.date()
          .nullable()
          .when('period_from', (period_from, schema) => {
            return period_from
              ? schema.min(period_from, 'End date must be after start date')
              : schema;
          })
          .max(new Date(), 'End date cannot be in the future'),
        
        description: Yup.string()
          .max(
            experienceFormConfig.fields.description.validation.maxLength.value,
            experienceFormConfig.fields.description.validation.maxLength.message
          )
          .matches(
            experienceFormConfig.fields.description.validation.pattern.value,
            experienceFormConfig.fields.description.validation.pattern.message
          )
      })
    )
    .min(experienceFormConfig.businessRules.minEntries, 'At least one experience record is required')
    .max(experienceFormConfig.businessRules.maxEntries, `Maximum ${experienceFormConfig.businessRules.maxEntries} experience records allowed`)
    .test('no-overlaps', 'Employment periods cannot overlap', function(experiences) {
      if (!experiences) return true;
      
      const validation = customValidations.validateNoOverlaps(experiences);
      if (validation.hasOverlaps) {
        return this.createError({
          message: validation.errors[0].message,
          path: 'experiences'
        });
      }
      
      return true;
    })
});

/**
 * Transform and sanitize experience data before submission
 */
export const transformExperienceData = (formData) => {
  const { experiences, user_id } = formData;
  
  return {
    user_id,
    experiences: experiences.map(experience => ({
      ...experience,
      // Sanitize text fields
      company_name: experience.company_name?.trim(),
      location: experience.location?.trim(),
      job_position: experience.job_position?.trim(),
      description: experience.description?.trim(),
      
      // Ensure dates are in correct format
      period_from: experience.period_from || null,
      period_to: experience.period_to || null,
      
      // Add calculated fields
      is_current: !experience.period_to,
      duration_days: experience.period_from ? 
        Math.max(0, (
          (experience.period_to ? new Date(experience.period_to) : new Date()) - 
          new Date(experience.period_from)
        ) / (1000 * 60 * 60 * 24)) : 0
    }))
  };
};

/**
 * Async validation for experience uniqueness
 */
export const validateExperienceUniqueness = async (experience, existingExperiences) => {
  // Check against existing experiences in the form
  const duplicates = customValidations.detectDuplicates([...existingExperiences, experience]);
  
  if (duplicates.length > 0) {
    return {
      isValid: false,
      error: 'This experience record appears to be a duplicate'
    };
  }
  
  return { isValid: true };
};

export default experienceFormValidationSchema;
