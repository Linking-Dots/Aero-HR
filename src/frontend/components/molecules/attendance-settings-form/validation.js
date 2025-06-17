/**
 * Attendance Settings Form Validation Schema
 * 
 * @fileoverview Comprehensive validation schema for attendance settings form.
 * Provides real-time validation with business rule enforcement and cross-field dependencies.
 * 
 * @version 1.0.0
 * @since 2024
 * 
 * @module AttendanceSettingsValidation
 * @namespace Components.Molecules.AttendanceSettingsForm
 * 
 * @requires yup ^1.0.0
 * 
 * @author glassERP Development Team
 * @maintainer development@glasserp.com
 * 
 * @description
 * Validation features:
 * - Time format validation with business logic
 * - Cross-field dependency validation
 * - IP address format validation
 * - Weekend day selection validation
 * - Conditional field validation
 * - Performance-optimized validation rules
 * 
 * @example
 * ```javascript
 * import { attendanceSettingsValidationSchema } from './validation';
 * 
 * const result = await attendanceSettingsValidationSchema.validate(formData);
 * ```
 */

import * as Yup from 'yup';
import { BUSINESS_RULES, ERROR_MESSAGES, VALIDATION_TYPES } from './config';

/**
 * Custom time validation function
 * Validates time format and business rules
 */
const timeValidator = (value, context) => {
  if (!value) return true; // Allow empty for optional fields
  
  // Check time format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) {
    return false;
  }
  
  return true;
};

/**
 * Custom IP addresses validation function
 * Validates comma-separated IP addresses
 */
const ipAddressesValidator = (value) => {
  if (!value || value.trim() === '') return true; // Allow empty
  
  const ips = value.split(',').map(ip => ip.trim());
  const ipRegex = BUSINESS_RULES.validation.ipFormat;
  
  return ips.every(ip => ipRegex.test(ip));
};

/**
 * Office timing validation function
 * Ensures end time is after start time
 */
const officeTimingValidator = (endTime, context) => {
  const startTime = context.parent.office_start_time;
  
  if (!startTime || !endTime) return true;
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  return end > start;
};

/**
 * Work hours calculation and validation
 */
const workHoursValidator = (endTime, context) => {
  const startTime = context.parent.office_start_time;
  const breakDuration = context.parent.break_time_duration || 0;
  
  if (!startTime || !endTime) return true;
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  const totalMinutes = (end - start) / (1000 * 60);
  const workMinutes = totalMinutes - breakDuration;
  const workHours = workMinutes / 60;
  
  return workHours >= BUSINESS_RULES.timing.minWorkHours && 
         workHours <= BUSINESS_RULES.timing.maxWorkHours;
};

/**
 * Weekend days validation function
 */
const weekendDaysValidator = (value) => {
  if (!Array.isArray(value)) return false;
  
  return value.length >= BUSINESS_RULES.weekend.minWeekendDays && 
         value.length <= BUSINESS_RULES.weekend.maxWeekendDays;
};

/**
 * Conditional field validation
 * Validates fields based on other field values
 */
const conditionalValidator = (fieldName, dependentField, requiredValues) => {
  return function(value, context) {
    const dependentValue = context.parent[dependentField];
    
    if (requiredValues.includes(dependentValue)) {
      return value !== null && value !== undefined && value !== '';
    }
    
    return true;
  };
};

/**
 * Main attendance settings validation schema
 */
export const attendanceSettingsValidationSchema = Yup.object().shape({
  // Office Timing Section
  office_start_time: Yup.string()
    .required(ERROR_MESSAGES.required)
    .test('valid-time', ERROR_MESSAGES.invalidTime, timeValidator),
    
  office_end_time: Yup.string()
    .required(ERROR_MESSAGES.required)
    .test('valid-time', ERROR_MESSAGES.invalidTime, timeValidator)
    .test('after-start-time', ERROR_MESSAGES.timingConflict, officeTimingValidator)
    .test('valid-work-hours', 'Invalid work hours duration', workHoursValidator),
    
  break_time_duration: Yup.number()
    .required(ERROR_MESSAGES.required)
    .integer('Break time must be a whole number')
    .min(BUSINESS_RULES.timing.minBreakTime, `Minimum break time is ${BUSINESS_RULES.timing.minBreakTime} minutes`)
    .max(BUSINESS_RULES.timing.maxBreakTime, `Maximum break time is ${BUSINESS_RULES.timing.maxBreakTime} minutes`),
    
  late_mark_after: Yup.number()
    .required(ERROR_MESSAGES.required)
    .integer('Late mark threshold must be a whole number')
    .min(0, 'Late mark threshold cannot be negative')
    .max(BUSINESS_RULES.timing.maxLateMark, `Maximum late mark threshold is ${BUSINESS_RULES.timing.maxLateMark} minutes`),

  // Attendance Rules Section
  early_leave_before: Yup.number()
    .required(ERROR_MESSAGES.required)
    .integer('Early leave threshold must be a whole number')
    .min(0, 'Early leave threshold cannot be negative')
    .max(BUSINESS_RULES.timing.maxEarlyLeave, `Maximum early leave threshold is ${BUSINESS_RULES.timing.maxEarlyLeave} minutes`),
    
  overtime_after: Yup.number()
    .required(ERROR_MESSAGES.required)
    .integer('Overtime threshold must be a whole number')
    .min(0, 'Overtime threshold cannot be negative')
    .max(BUSINESS_RULES.timing.maxOvertimeThreshold, `Maximum overtime threshold is ${BUSINESS_RULES.timing.maxOvertimeThreshold} minutes`),
    
  attendance_validation_type: Yup.string()
    .required(ERROR_MESSAGES.required)
    .oneOf(
      VALIDATION_TYPES.map(type => type.value),
      'Please select a valid attendance validation type'
    ),
    
  location_radius: Yup.number()
    .integer('Location radius must be a whole number')
    .min(BUSINESS_RULES.location.minRadius, `Minimum location radius is ${BUSINESS_RULES.location.minRadius} meters`)
    .max(BUSINESS_RULES.location.maxRadius, `Maximum location radius is ${BUSINESS_RULES.location.maxRadius} meters`)
    .test(
      'conditional-required',
      'Location radius is required for location-based validation',
      conditionalValidator('location_radius', 'attendance_validation_type', ['location', 'both'])
    ),
    
  allowed_ips: Yup.string()
    .test('valid-ips', ERROR_MESSAGES.invalidIP, ipAddressesValidator)
    .test(
      'conditional-required',
      'IP addresses are required for IP-based validation',
      conditionalValidator('allowed_ips', 'attendance_validation_type', ['ip', 'both'])
    ),

  // Weekend Settings Section
  weekend_days: Yup.array()
    .of(Yup.string())
    .required(ERROR_MESSAGES.required)
    .test('valid-weekend-count', ERROR_MESSAGES.insufficientWeekends, weekendDaysValidator),

  // Mobile Settings Section
  allow_punch_from_mobile: Yup.boolean()
    .required(ERROR_MESSAGES.required),
    
  require_location_services: Yup.boolean()
    .required(ERROR_MESSAGES.required),
    
  auto_punch_out: Yup.boolean()
    .required(ERROR_MESSAGES.required),
    
  auto_punch_out_time: Yup.string()
    .test('valid-time', ERROR_MESSAGES.invalidTime, timeValidator)
    .test(
      'conditional-required',
      'Auto punch out time is required when auto punch out is enabled',
      conditionalValidator('auto_punch_out_time', 'auto_punch_out', [true])
    ),

  // Validation Types Section
  active_validation_types: Yup.array()
    .of(Yup.string())
    .max(BUSINESS_RULES.validation.maxValidationTypes, `Maximum ${BUSINESS_RULES.validation.maxValidationTypes} validation types allowed`)
});

/**
 * Field-level validation functions for real-time validation
 */
export const fieldValidators = {
  office_start_time: (value) => {
    const schema = Yup.string()
      .required(ERROR_MESSAGES.required)
      .test('valid-time', ERROR_MESSAGES.invalidTime, timeValidator);
    
    try {
      schema.validateSync(value);
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  },
  
  office_end_time: (value, formData) => {
    const schema = Yup.string()
      .required(ERROR_MESSAGES.required)
      .test('valid-time', ERROR_MESSAGES.invalidTime, timeValidator)
      .test('after-start-time', ERROR_MESSAGES.timingConflict, (endTime) => {
        return officeTimingValidator(endTime, { parent: formData });
      });
    
    try {
      schema.validateSync(value);
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  },
  
  break_time_duration: (value) => {
    const schema = Yup.number()
      .required(ERROR_MESSAGES.required)
      .integer('Break time must be a whole number')
      .min(BUSINESS_RULES.timing.minBreakTime)
      .max(BUSINESS_RULES.timing.maxBreakTime);
    
    try {
      schema.validateSync(value);
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  },
  
  location_radius: (value, formData) => {
    const validationType = formData.attendance_validation_type;
    
    if (!['location', 'both'].includes(validationType)) {
      return { isValid: true, error: null };
    }
    
    const schema = Yup.number()
      .required('Location radius is required for location-based validation')
      .integer('Location radius must be a whole number')
      .min(BUSINESS_RULES.location.minRadius)
      .max(BUSINESS_RULES.location.maxRadius);
    
    try {
      schema.validateSync(value);
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  },
  
  allowed_ips: (value, formData) => {
    const validationType = formData.attendance_validation_type;
    
    if (!['ip', 'both'].includes(validationType)) {
      return { isValid: true, error: null };
    }
    
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'IP addresses are required for IP-based validation' };
    }
    
    if (!ipAddressesValidator(value)) {
      return { isValid: false, error: ERROR_MESSAGES.invalidIP };
    }
    
    return { isValid: true, error: null };
  },
  
  weekend_days: (value) => {
    const schema = Yup.array()
      .of(Yup.string())
      .required(ERROR_MESSAGES.required)
      .test('valid-weekend-count', ERROR_MESSAGES.insufficientWeekends, weekendDaysValidator);
    
    try {
      schema.validateSync(value);
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }
};

/**
 * Cross-field validation function
 * Validates dependencies between multiple fields
 */
export const validateCrossFieldDependencies = (formData) => {
  const errors = {};
  
  // Validate office timing consistency
  if (formData.office_start_time && formData.office_end_time) {
    const start = new Date(`2000-01-01T${formData.office_start_time}:00`);
    const end = new Date(`2000-01-01T${formData.office_end_time}:00`);
    
    if (end <= start) {
      errors.office_end_time = ERROR_MESSAGES.timingConflict;
    }
    
    // Validate work hours vs break time
    const totalMinutes = (end - start) / (1000 * 60);
    const breakTime = formData.break_time_duration || 0;
    
    if (breakTime >= totalMinutes) {
      errors.break_time_duration = ERROR_MESSAGES.excessiveBreakTime;
    }
  }
  
  // Validate conditional fields
  if (formData.attendance_validation_type === 'location' || formData.attendance_validation_type === 'both') {
    if (!formData.location_radius) {
      errors.location_radius = 'Location radius is required for location-based validation';
    }
  }
  
  if (formData.attendance_validation_type === 'ip' || formData.attendance_validation_type === 'both') {
    if (!formData.allowed_ips || formData.allowed_ips.trim() === '') {
      errors.allowed_ips = 'IP addresses are required for IP-based validation';
    }
  }
  
  if (formData.auto_punch_out && !formData.auto_punch_out_time) {
    errors.auto_punch_out_time = 'Auto punch out time is required when auto punch out is enabled';
  }
  
  return errors;
};

/**
 * Performance-optimized validation for real-time updates
 */
export const quickValidateField = (fieldName, value, formData = {}) => {
  if (fieldValidators[fieldName]) {
    return fieldValidators[fieldName](value, formData);
  }
  
  // Default validation for simple fields
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: ERROR_MESSAGES.required };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validation utility functions
 */
export const validationUtils = {
  isTimeValid: timeValidator,
  areIPsValid: ipAddressesValidator,
  isValidWorkHours: workHoursValidator,
  isValidWeekendCount: weekendDaysValidator,
  validateTimingConflict: officeTimingValidator,
  
  /**
   * Get validation errors for a specific section
   */
  getSectionErrors: (formData, sectionFields) => {
    const errors = {};
    
    sectionFields.forEach(fieldName => {
      const validation = quickValidateField(fieldName, formData[fieldName], formData);
      if (!validation.isValid) {
        errors[fieldName] = validation.error;
      }
    });
    
    return errors;
  },
  
  /**
   * Check if form section is valid
   */
  isSectionValid: (formData, sectionFields) => {
    return sectionFields.every(fieldName => {
      const validation = quickValidateField(fieldName, formData[fieldName], formData);
      return validation.isValid;
    });
  },
  
  /**
   * Get form completion percentage
   */
  getCompletionPercentage: (formData, requiredFields) => {
    const completedFields = requiredFields.filter(fieldName => {
      const value = formData[fieldName];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
};

export default attendanceSettingsValidationSchema;
