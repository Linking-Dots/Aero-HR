/**
 * Salary Information Form Validation Schema
 * 
 * Comprehensive validation rules for salary, PF, and ESI management
 * Implements Indian compliance standards and business rules
 * 
 * @version 1.0.0
 * @since 2024
 */

import * as Yup from 'yup';

// Indian PF number validation pattern
const PF_NUMBER_PATTERN = /^[A-Z]{2}\/[A-Z]{3}\/\d{7}\/\d{3}\/\d{7}$/;

// Indian ESI number validation pattern (10 digits)
const ESI_NUMBER_PATTERN = /^\d{10}$/;

// Salary amount validation (supports decimals up to 2 places)
const SALARY_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * Main salary form validation schema
 */
export const salaryValidationSchema = Yup.object().shape({
  // Salary Information Section
  salary_basis: Yup.string()
    .required('Salary basis is required')
    .notOneOf(['na'], 'Please select a valid salary basis')
    .oneOf(['Hourly', 'Daily', 'Weekly', 'Monthly'], 'Invalid salary basis selected'),

  salary_amount: Yup.number()
    .required('Salary amount is required')
    .positive('Salary amount must be positive')
    .min(1, 'Salary amount must be at least 1')
    .max(1000000, 'Salary amount cannot exceed $1,000,000')
    .test('decimal-places', 'Amount can have maximum 2 decimal places', (value) => {
      if (!value) return true;
      const decimalPlaces = (value.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }),

  payment_type: Yup.string()
    .required('Payment type is required')
    .notOneOf(['na'], 'Please select a valid payment type')
    .oneOf(['Bank transfer', 'Check', 'Cash'], 'Invalid payment type selected'),

  // PF Information Section
  pf_contribution: Yup.mixed()
    .notOneOf(['na'], 'Please select PF contribution status')
    .test('valid-boolean', 'Invalid PF contribution value', (value) => {
      return value === 0 || value === 1 || value === false || value === true;
    }),

  pf_no: Yup.string()
    .when('pf_contribution', {
      is: (val) => val === 1 || val === true,
      then: (schema) => schema
        .required('PF number is required when PF contribution is enabled')
        .matches(PF_NUMBER_PATTERN, 'Please enter a valid PF number format (e.g., DL/DLI/1234567/123/1234567)')
        .min(20, 'PF number is too short')
        .max(25, 'PF number is too long'),
      otherwise: (schema) => schema.nullable()
    }),

  employee_pf_rate: Yup.number()
    .when('pf_contribution', {
      is: (val) => val === 1 || val === true,
      then: (schema) => schema
        .min(0, 'PF rate cannot be negative')
        .max(12, 'Employee PF rate cannot exceed 12%')
        .integer('PF rate must be a whole number'),
      otherwise: (schema) => schema.nullable()
    }),

  additional_pf_rate: Yup.number()
    .when('pf_contribution', {
      is: (val) => val === 1 || val === true,
      then: (schema) => schema
        .min(0, 'Additional PF rate cannot be negative')
        .max(10, 'Additional PF rate cannot exceed 10%')
        .integer('Additional PF rate must be a whole number'),
      otherwise: (schema) => schema.nullable()
    }),

  total_pf_rate: Yup.number()
    .when(['pf_contribution', 'employee_pf_rate', 'additional_pf_rate'], {
      is: (pf_contribution, employee_rate, additional_rate) => 
        (pf_contribution === 1 || pf_contribution === true) && 
        (employee_rate || additional_rate),
      then: (schema) => schema
        .max(20, 'Total PF rate cannot exceed 20%')
        .test('rate-calculation', 'Total rate calculation error', function(value) {
          const { employee_pf_rate = 0, additional_pf_rate = 0 } = this.parent;
          const expected = Number(employee_pf_rate) + Number(additional_pf_rate);
          return Math.abs(Number(value) - expected) < 0.01; // Allow for floating point precision
        }),
      otherwise: (schema) => schema.nullable()
    }),

  // ESI Information Section
  esi_contribution: Yup.mixed()
    .notOneOf(['na'], 'Please select ESI contribution status')
    .test('valid-boolean', 'Invalid ESI contribution value', (value) => {
      return value === 0 || value === 1 || value === false || value === true;
    }),

  esi_no: Yup.string()
    .when('esi_contribution', {
      is: (val) => val === 1 || val === true,
      then: (schema) => schema
        .required('ESI number is required when ESI contribution is enabled')
        .matches(ESI_NUMBER_PATTERN, 'Please enter a valid 10-digit ESI number')
        .length(10, 'ESI number must be exactly 10 digits'),
      otherwise: (schema) => schema.nullable()
    }),

  employee_esi_rate: Yup.number()
    .when('esi_contribution', {
      is: (val) => val === 1 || val === true,
      then: (schema) => schema
        .min(0, 'ESI rate cannot be negative')
        .max(4, 'Employee ESI rate cannot exceed 4%')
        .integer('ESI rate must be a whole number'),
      otherwise: (schema) => schema.nullable()
    }),

  additional_esi_rate: Yup.number()
    .when('esi_contribution', {
      is: (val) => val === 1 || val === true,
      then: (schema) => schema
        .min(0, 'Additional ESI rate cannot be negative')
        .max(5, 'Additional ESI rate cannot exceed 5%')
        .integer('Additional ESI rate must be a whole number'),
      otherwise: (schema) => schema.nullable()
    }),

  total_esi_rate: Yup.number()
    .when(['esi_contribution', 'employee_esi_rate', 'additional_esi_rate'], {
      is: (esi_contribution, employee_rate, additional_rate) => 
        (esi_contribution === 1 || esi_contribution === true) && 
        (employee_rate || additional_rate),
      then: (schema) => schema
        .max(10, 'Total ESI rate cannot exceed 10%')
        .test('rate-calculation', 'Total rate calculation error', function(value) {
          const { employee_esi_rate = 0, additional_esi_rate = 0 } = this.parent;
          const expected = Number(employee_esi_rate) + Number(additional_esi_rate);
          return Math.abs(Number(value) - expected) < 0.01; // Allow for floating point precision
        }),
      otherwise: (schema) => schema.nullable()
    })
});

/**
 * Individual field validation functions
 */
export const validateSalaryAmount = (amount) => {
  if (!amount || amount === '') return 'Salary amount is required';
  if (isNaN(amount)) return 'Please enter a valid number';
  if (Number(amount) <= 0) return 'Salary amount must be positive';
  if (Number(amount) > 1000000) return 'Salary amount cannot exceed $1,000,000';
  if (!SALARY_AMOUNT_PATTERN.test(amount.toString())) {
    return 'Amount can have maximum 2 decimal places';
  }
  return null;
};

export const validatePFNumber = (pfNumber, pfContribution) => {
  if (!pfContribution) return null;
  if (!pfNumber || pfNumber === '') return 'PF number is required when PF contribution is enabled';
  if (!PF_NUMBER_PATTERN.test(pfNumber)) {
    return 'Please enter a valid PF number format (e.g., DL/DLI/1234567/123/1234567)';
  }
  return null;
};

export const validateESINumber = (esiNumber, esiContribution) => {
  if (!esiContribution) return null;
  if (!esiNumber || esiNumber === '') return 'ESI number is required when ESI contribution is enabled';
  if (!ESI_NUMBER_PATTERN.test(esiNumber)) {
    return 'Please enter a valid 10-digit ESI number';
  }
  return null;
};

export const validateRatePercentage = (rate, maxRate = 10, fieldName = 'Rate') => {
  if (rate === null || rate === undefined || rate === '') return null;
  if (isNaN(rate)) return `${fieldName} must be a valid number`;
  if (Number(rate) < 0) return `${fieldName} cannot be negative`;
  if (Number(rate) > maxRate) return `${fieldName} cannot exceed ${maxRate}%`;
  if (!Number.isInteger(Number(rate))) return `${fieldName} must be a whole number`;
  return null;
};

/**
 * Business rule validation functions
 */
export const validatePFCalculation = (employeeRate, additionalRate) => {
  const employee = Number(employeeRate) || 0;
  const additional = Number(additionalRate) || 0;
  const total = employee + additional;
  
  if (total > 20) {
    return {
      isValid: false,
      error: 'Total PF rate cannot exceed 20%',
      total: total
    };
  }
  
  return {
    isValid: true,
    total: total
  };
};

export const validateESICalculation = (employeeRate, additionalRate) => {
  const employee = Number(employeeRate) || 0;
  const additional = Number(additionalRate) || 0;
  const total = employee + additional;
  
  if (total > 10) {
    return {
      isValid: false,
      error: 'Total ESI rate cannot exceed 10%',
      total: total
    };
  }
  
  return {
    isValid: true,
    total: total
  };
};

export const validateSalaryCompliance = (formData) => {
  const warnings = [];
  const errors = [];
  
  // Check for minimum wage compliance (example)
  if (formData.salary_amount && Number(formData.salary_amount) < 1000) {
    warnings.push('Salary amount is below typical minimum wage standards');
  }
  
  // Check for PF compliance
  if (formData.pf_contribution && formData.salary_amount) {
    const salaryAmount = Number(formData.salary_amount);
    if (salaryAmount > 15000 && !formData.pf_contribution) {
      warnings.push('PF contribution is mandatory for salaries above ₹15,000');
    }
  }
  
  // Check for ESI compliance
  if (formData.esi_contribution && formData.salary_amount) {
    const salaryAmount = Number(formData.salary_amount);
    if (salaryAmount <= 21000 && !formData.esi_contribution) {
      warnings.push('ESI contribution is available for salaries up to ₹21,000');
    }
  }
  
  return { errors, warnings };
};

/**
 * Utility functions for validation
 */
export const validationUtils = {
  formatCurrency: (amount, currency = '$') => {
    if (!amount || isNaN(amount)) return '';
    return `${currency}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },
  
  formatPercentage: (rate) => {
    if (rate === null || rate === undefined || rate === '') return '';
    return `${Number(rate)}%`;
  },
  
  calculateTakeHome: (salary, pfRate = 0, esiRate = 0) => {
    const salaryAmount = Number(salary) || 0;
    const pfDeduction = (salaryAmount * Number(pfRate)) / 100;
    const esiDeduction = (salaryAmount * Number(esiRate)) / 100;
    return salaryAmount - pfDeduction - esiDeduction;
  },
  
  calculateEmployerContribution: (salary, pfRate = 0, esiRate = 0) => {
    const salaryAmount = Number(salary) || 0;
    const employerPF = (salaryAmount * Number(pfRate)) / 100;
    const employerESI = (salaryAmount * (Number(esiRate) * 3.25)) / 100; // Employer ESI is typically 3.25%
    return employerPF + employerESI;
  },
  
  cleanNumericValue: (value) => {
    if (!value) return 0;
    return Number(value.toString().replace(/[^0-9.-]/g, ''));
  },
  
  isValidIndianSalary: (amount, basis = 'Monthly') => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    
    // Basic range checks based on salary basis
    switch (basis) {
      case 'Hourly':
        return numAmount >= 50 && numAmount <= 5000;
      case 'Daily':
        return numAmount >= 500 && numAmount <= 50000;
      case 'Weekly':
        return numAmount >= 3500 && numAmount <= 350000;
      case 'Monthly':
        return numAmount >= 15000 && numAmount <= 1500000;
      default:
        return true;
    }
  }
};

export default salaryValidationSchema;
