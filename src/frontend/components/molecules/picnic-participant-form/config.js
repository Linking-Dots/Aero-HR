// filepath: src/frontend/components/molecules/picnic-participant-form/config.js

/**
 * PicnicParticipantForm Configuration
 * 
 * Enterprise-grade configuration for picnic participant management forms
 * Supports event organization, team management, and participant tracking
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { generateRandomNumber } from '@/shared/utils/numberUtils';

// Field Configuration
export const PICNIC_PARTICIPANT_FIELDS = {
  name: {
    type: 'text',
    label: 'Participant Name',
    required: true,
    minLength: 2,
    maxLength: 100,
    placeholder: 'Enter participant full name',
    validation: {
      pattern: /^[a-zA-Z\s.'-]+$/,
      message: 'Name should only contain letters, spaces, dots, hyphens, and apostrophes'
    }
  },
  team: {
    type: 'select',
    label: 'Team Assignment',
    required: true,
    placeholder: 'Select team',
    options: [
      { value: 'red', label: 'Red Team', color: '#FF6B6B' },
      { value: 'blue', label: 'Blue Team', color: '#4DABF7' },
      { value: 'green', label: 'Green Team', color: '#51CF66' },
      { value: 'yellow', label: 'Yellow Team', color: '#FFD43B' },
      { value: 'purple', label: 'Purple Team', color: '#9775FA' },
      { value: 'orange', label: 'Orange Team', color: '#FF8787' }
    ]
  },
  phone: {
    type: 'tel',
    label: 'Contact Number',
    required: true,
    placeholder: '+91 XXXXX XXXXX',
    validation: {
      pattern: /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/,
      message: 'Please enter a valid Indian mobile number'
    },
    formatting: {
      mask: '+91 XXXXX XXXXX',
      autoFormat: true
    }
  },
  random_number: {
    type: 'text',
    label: 'Lucky Number',
    required: true,
    readOnly: true,
    placeholder: 'Auto-generated',
    generator: () => generateRandomNumber(4),
    description: 'Unique 4-digit number for games and prizes'
  },
  payment_amount: {
    type: 'currency',
    label: 'Contribution Amount',
    required: true,
    placeholder: '₹0.00',
    min: 0,
    max: 10000,
    step: 50,
    currency: 'INR',
    validation: {
      message: 'Amount should be between ₹0 and ₹10,000'
    }
  }
};

// Form Sections Configuration
export const FORM_SECTIONS = {
  participant: {
    title: 'Participant Information',
    icon: 'PersonIcon',
    fields: ['name', 'phone'],
    description: 'Basic participant details'
  },
  assignment: {
    title: 'Team & Game Assignment',
    icon: 'GroupIcon',
    fields: ['team', 'random_number'],
    description: 'Team assignment and lucky number'
  },
  payment: {
    title: 'Payment Information',
    icon: 'PaymentIcon',
    fields: ['payment_amount'],
    description: 'Contribution and payment details'
  }
};

// Team Configuration
export const TEAM_CONFIG = {
  maxParticipantsPerTeam: 50,
  teamColors: {
    red: { primary: '#FF6B6B', secondary: '#FFE3E3' },
    blue: { primary: '#4DABF7', secondary: '#E3F2FD' },
    green: { primary: '#51CF66', secondary: '#E8F5E8' },
    yellow: { primary: '#FFD43B', secondary: '#FFF9C4' },
    purple: { primary: '#9775FA', secondary: '#F3E5F5' },
    orange: { primary: '#FF8787', secondary: '#FFF4E6' }
  },
  teamFeatures: {
    allowTeamChange: true,
    autoBalance: true,
    teamCaptain: false
  }
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  defaultAmount: 500,
  currency: 'INR',
  paymentMethods: ['cash', 'upi', 'card', 'bank_transfer'],
  installments: {
    enabled: true,
    maxInstallments: 3,
    minAmount: 100
  },
  discounts: {
    earlyBird: { percentage: 10, deadline: '2025-03-01' },
    student: { percentage: 15, verification: true },
    employee: { percentage: 5, automatic: true }
  }
};

// Validation Configuration
export const VALIDATION_CONFIG = {
  debounceDelay: 300,
  realTimeValidation: true,
  strictMode: false,
  customValidators: {
    uniquePhone: true,
    uniqueName: false,
    teamCapacity: true
  },
  errorMessages: {
    required: 'This field is required',
    invalid: 'Please enter a valid value',
    duplicate: 'This value already exists',
    teamFull: 'Selected team has reached maximum capacity'
  }
};

// UI Configuration
export const UI_CONFIG = {
  layout: {
    mode: 'accordion', // 'accordion', 'tabs', 'steps'
    direction: 'vertical',
    spacing: 'comfortable',
    animations: true
  },
  theme: {
    primaryColor: '#6366F1',
    glassMorphism: true,
    borderRadius: '16px',
    backdrop: 'blur(20px)'
  },
  responsive: {
    breakpoints: {
      mobile: '(max-width: 768px)',
      tablet: '(max-width: 1024px)',
      desktop: '(min-width: 1025px)'
    },
    adaptiveLayout: true
  }
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enabled: true,
  events: {
    formStart: 'picnic_form_start',
    sectionComplete: 'picnic_section_complete',
    teamSelect: 'picnic_team_select',
    paymentInfo: 'picnic_payment_info',
    formSubmit: 'picnic_form_submit',
    formError: 'picnic_form_error'
  },
  tracking: {
    userBehavior: true,
    teamPreferences: true,
    paymentPatterns: true,
    completionTime: true
  },
  privacy: {
    anonymize: true,
    retention: '1 year',
    compliance: 'GDPR'
  }
};

// Export default configuration
export const PICNIC_PARTICIPANT_CONFIG = {
  fields: PICNIC_PARTICIPANT_FIELDS,
  sections: FORM_SECTIONS,
  teams: TEAM_CONFIG,
  payment: PAYMENT_CONFIG,
  validation: VALIDATION_CONFIG,
  ui: UI_CONFIG,
  analytics: ANALYTICS_CONFIG,
  
  // Form metadata
  version: '1.0.0',
  lastUpdated: '2025-01-20',
  author: 'glassERP Development Team',
  
  // Feature flags
  features: {
    autoSave: true,
    teamBalancing: true,
    paymentTracking: true,
    bulkImport: false,
    exportData: true,
    emailNotifications: true
  }
};

export default PICNIC_PARTICIPANT_CONFIG;
