/**
 * Salary Information Form Configuration
 * 
 * Centralized configuration for salary, PF, and ESI management forms following:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security) 
 * - ISO 9001 (Quality Management)
 * 
 * @version 1.0.0
 * @since 2024
 */

export const salaryFormConfig = {
  // Form identification and metadata
  formId: 'salary-information-form',
  formName: 'Salary Information Form',
  version: '1.0.0',
  
  // Field definitions with validation rules and UI settings
  fields: {
    salary_basis: {
      name: 'salary_basis',
      label: 'Salary Basis',
      type: 'select',
      required: true,
      options: [
        { value: 'Hourly', label: 'Hourly' },
        { value: 'Daily', label: 'Daily' },
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' }
      ],
      gridSize: { xs: 12, md: 4 },
      validation: {
        required: 'Salary basis is required',
        notEqual: { value: 'na', message: 'Please select a valid salary basis' }
      }
    },
    
    salary_amount: {
      name: 'salary_amount',
      label: 'Salary Amount',
      type: 'number',
      required: true,
      placeholder: 'Type your salary amount',
      currency: true,
      currencySymbol: '$',
      gridSize: { xs: 12, md: 4 },
      validation: {
        required: 'Salary amount is required',
        min: { value: 0, message: 'Salary amount must be positive' },
        max: { value: 1000000, message: 'Salary amount cannot exceed $1,000,000' },
        pattern: {
          value: /^\d+(\.\d{1,2})?$/,
          message: 'Please enter a valid amount (up to 2 decimal places)'
        }
      }
    },
    
    payment_type: {
      name: 'payment_type',
      label: 'Payment Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Bank transfer', label: 'Bank Transfer' },
        { value: 'Check', label: 'Check' },
        { value: 'Cash', label: 'Cash' }
      ],
      gridSize: { xs: 12, md: 4 },
      validation: {
        required: 'Payment type is required',
        notEqual: { value: 'na', message: 'Please select a valid payment type' }
      }
    },
    
    pf_contribution: {
      name: 'pf_contribution',
      label: 'PF Contribution',
      type: 'select',
      required: false,
      options: [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
      ],
      gridSize: { xs: 12, md: 4 },
      validation: {
        notEqual: { value: 'na', message: 'Please select PF contribution status' }
      }
    },
    
    pf_no: {
      name: 'pf_no',
      label: 'PF Number',
      type: 'text',
      required: false,
      placeholder: 'Enter PF No.',
      dependsOn: 'pf_contribution',
      dependsOnValue: 1,
      gridSize: { xs: 12, md: 4 },
      validation: {
        conditionalRequired: {
          field: 'pf_contribution',
          value: 1,
          message: 'PF number is required when PF contribution is enabled'
        },
        pattern: {
          value: /^[A-Z]{2}\/[A-Z]{3}\/\d{7}\/\d{3}\/\d{7}$/,
          message: 'Please enter a valid PF number format (e.g., DL/DLI/1234567/123/1234567)'
        }
      }
    },
    
    employee_pf_rate: {
      name: 'employee_pf_rate',
      label: 'Employee PF Rate',
      type: 'select',
      required: false,
      options: Array.from({ length: 11 }, (_, i) => ({ 
        value: i, 
        label: `${i}%` 
      })),
      dependsOn: 'pf_contribution',
      dependsOnValue: 1,
      gridSize: { xs: 12, md: 4 },
      validation: {
        min: { value: 0, message: 'Rate cannot be negative' },
        max: { value: 10, message: 'Rate cannot exceed 10%' }
      }
    },
    
    additional_pf_rate: {
      name: 'additional_pf_rate',
      label: 'Additional PF Rate',
      type: 'select',
      required: false,
      options: Array.from({ length: 11 }, (_, i) => ({ 
        value: i, 
        label: `${i}%` 
      })),
      dependsOn: 'pf_contribution',
      dependsOnValue: 1,
      gridSize: { xs: 12, md: 4 },
      validation: {
        min: { value: 0, message: 'Rate cannot be negative' },
        max: { value: 10, message: 'Rate cannot exceed 10%' }
      }
    },
    
    total_pf_rate: {
      name: 'total_pf_rate',
      label: 'Total PF Rate',
      type: 'text',
      required: false,
      readOnly: true,
      calculated: true,
      calculationFields: ['employee_pf_rate', 'additional_pf_rate'],
      gridSize: { xs: 12, md: 4 },
      format: 'percentage'
    },
    
    esi_contribution: {
      name: 'esi_contribution',
      label: 'ESI Contribution',
      type: 'select',
      required: false,
      options: [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
      ],
      gridSize: { xs: 12, md: 4 },
      validation: {
        notEqual: { value: 'na', message: 'Please select ESI contribution status' }
      }
    },
    
    esi_no: {
      name: 'esi_no',
      label: 'ESI Number',
      type: 'text',
      required: false,
      placeholder: 'Enter ESI No.',
      dependsOn: 'esi_contribution',
      dependsOnValue: 1,
      gridSize: { xs: 12, md: 4 },
      validation: {
        conditionalRequired: {
          field: 'esi_contribution',
          value: 1,
          message: 'ESI number is required when ESI contribution is enabled'
        },
        pattern: {
          value: /^\d{10}$/,
          message: 'Please enter a valid 10-digit ESI number'
        }
      }
    },
    
    employee_esi_rate: {
      name: 'employee_esi_rate',
      label: 'Employee ESI Rate',
      type: 'select',
      required: false,
      options: Array.from({ length: 11 }, (_, i) => ({ 
        value: i, 
        label: `${i}%` 
      })),
      dependsOn: 'esi_contribution',
      dependsOnValue: 1,
      gridSize: { xs: 12, md: 4 },
      validation: {
        min: { value: 0, message: 'Rate cannot be negative' },
        max: { value: 10, message: 'Rate cannot exceed 10%' }
      }
    },
    
    additional_esi_rate: {
      name: 'additional_esi_rate',
      label: 'Additional ESI Rate',
      type: 'select',
      required: false,
      options: Array.from({ length: 11 }, (_, i) => ({ 
        value: i, 
        label: `${i}%` 
      })),
      dependsOn: 'esi_contribution',
      dependsOnValue: 1,
      gridSize: { xs: 12, md: 4 },
      validation: {
        min: { value: 0, message: 'Rate cannot be negative' },
        max: { value: 10, message: 'Rate cannot exceed 10%' }
      }
    },
    
    total_esi_rate: {
      name: 'total_esi_rate',
      label: 'Total ESI Rate',
      type: 'text',
      required: false,
      readOnly: true,
      calculated: true,
      calculationFields: ['employee_esi_rate', 'additional_esi_rate'],
      gridSize: { xs: 12, md: 4 },
      format: 'percentage'
    }
  },

  // Form behavior settings
  behavior: {
    enableAutoSave: true,
    autoSaveDelay: 1000,
    enableDirtyCheck: true,
    showProgressIndicator: true,
    enableFieldLevelValidation: true,
    enableFormLevelValidation: true,
    submitOnEnter: false,
    resetOnCancel: true,
    confirmOnExit: true,
    resetOnSubmit: false,
    persistDrafts: false
  },

  // Business rules configuration
  businessRules: {
    // PF calculation rules
    pfCalculation: {
      enabled: true,
      autoCalculateTotal: true,
      maxTotalRate: 20,
      clearFieldsOnDisable: true
    },
    
    // ESI calculation rules
    esiCalculation: {
      enabled: true,
      autoCalculateTotal: true,
      maxTotalRate: 20,
      clearFieldsOnDisable: true
    },
    
    // Salary validation rules
    salaryValidation: {
      minAmount: 0,
      maxAmount: 1000000,
      allowDecimals: true,
      decimalPlaces: 2
    },
    
    // Compliance rules
    compliance: {
      enforceIndianPFRules: true,
      enforceIndianESIRules: true,
      validateStatutoryNumbers: true,
      enableComplianceWarnings: true
    }
  },

  // Validation settings
  validation: {
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    shouldUnregister: false,
    shouldUseNativeValidation: false,
    criteriaMode: 'firstError',
    delayError: 300
  },

  // UI settings
  ui: {
    layout: 'sections',
    sections: [
      {
        id: 'salary-section',
        title: 'Salary Information',
        fields: ['salary_basis', 'salary_amount', 'payment_type'],
        icon: 'AccountBalance',
        collapsible: false,
        expanded: true
      },
      {
        id: 'pf-section',
        title: 'PF Information',
        fields: ['pf_contribution', 'pf_no', 'employee_pf_rate', 'additional_pf_rate', 'total_pf_rate'],
        icon: 'Savings',
        collapsible: true,
        expanded: true
      },
      {
        id: 'esi-section',
        title: 'ESI Information',
        fields: ['esi_contribution', 'esi_no', 'employee_esi_rate', 'additional_esi_rate', 'total_esi_rate'],
        icon: 'HealthAndSafety',
        collapsible: true,
        expanded: true
      }
    ],
    
    theme: {
      glassEffect: true,
      borderRadius: 12,
      spacing: 3,
      showSectionDividers: true
    },
    
    accessibility: {
      enableAriaLabels: true,
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      highContrastMode: false,
      focusManagement: true,
      announceChanges: true
    },
    
    responsive: {
      breakpoints: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536
      },
      gridBehavior: {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 4,
        xl: 3
      }
    }
  },

  // Error messages
  errorMessages: {
    general: {
      required: 'This field is required',
      invalid: 'Please enter a valid value',
      network: 'Network error. Please try again.',
      server: 'Server error. Please contact support.',
      unauthorized: 'You are not authorized to perform this action'
    },
    
    salary: {
      invalidAmount: 'Please enter a valid salary amount',
      amountTooLow: 'Salary amount is too low',
      amountTooHigh: 'Salary amount exceeds maximum limit',
      invalidBasis: 'Please select a valid salary basis'
    },
    
    pf: {
      invalidNumber: 'Please enter a valid PF number',
      invalidRate: 'Please select a valid PF rate',
      ratesTooHigh: 'Total PF rate cannot exceed maximum limit',
      missingNumber: 'PF number is required when PF contribution is enabled'
    },
    
    esi: {
      invalidNumber: 'Please enter a valid ESI number',
      invalidRate: 'Please select a valid ESI rate',
      ratesTooHigh: 'Total ESI rate cannot exceed maximum limit',
      missingNumber: 'ESI number is required when ESI contribution is enabled'
    }
  },

  // Analytics and insights
  analytics: {
    enabled: true,
    
    calculations: {
      salaryBreakdown: true,
      statutoryDeductions: true,
      takeHomePay: true,
      employerContributions: true,
      totalCost: true
    },
    
    insights: {
      pfBenefits: true,
      esiBenefits: true,
      complianceStatus: true,
      optimizationSuggestions: true
    },
    
    visualization: {
      salaryChart: true,
      deductionsChart: true,
      benefitsChart: true,
      comparisonChart: true
    }
  }
};

export default salaryFormConfig;
