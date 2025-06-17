// filepath: src/frontend/components/molecules/picnic-participant-form/components/index.js

/**
 * PicnicParticipantForm Components Index
 * 
 * Centralized export for all form sub-components
 * Provides component metadata and usage guidelines
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

// Component exports
export { default as PicnicParticipantFormCore } from './PicnicParticipantFormCore';
export { default as PicnicParticipantFormValidationSummary } from './PicnicParticipantFormValidationSummary';

// Component metadata
export const PICNIC_PARTICIPANT_FORM_COMPONENTS = {
  PicnicParticipantFormCore: {
    name: 'PicnicParticipantFormCore',
    description: 'Core form component with glass morphism design and team selection',
    category: 'form-input',
    complexity: 'medium',
    features: [
      'Glass morphism design',
      'Accordion/standard layout modes',
      'Team color indicators',
      'Phone number formatting',
      'Currency input handling',
      'Real-time validation feedback',
      'Team balancing suggestions'
    ],
    props: {
      formData: {
        type: 'object',
        required: true,
        description: 'Current form data object'
      },
      errors: {
        type: 'object',
        required: false,
        description: 'Validation errors object'
      },
      fieldValidationStates: {
        type: 'object',
        required: false,
        description: 'Individual field validation states'
      },
      updateField: {
        type: 'function',
        required: true,
        description: 'Function to update form field values'
      },
      generateNewRandomNumber: {
        type: 'function',
        required: false,
        description: 'Function to generate new lucky number'
      },
      teamSuggestions: {
        type: 'object',
        required: false,
        description: 'Team balancing suggestions'
      },
      onFieldFocus: {
        type: 'function',
        required: false,
        description: 'Field focus event handler'
      },
      onFieldBlur: {
        type: 'function',
        required: false,
        description: 'Field blur event handler'
      },
      disabled: {
        type: 'boolean',
        required: false,
        description: 'Disable all form inputs'
      },
      layout: {
        type: 'string',
        required: false,
        description: 'Layout mode: "accordion" or "standard"'
      }
    },
    examples: {
      basic: `
        <PicnicParticipantFormCore
          formData={formData}
          errors={errors}
          updateField={updateField}
          layout="accordion"
        />
      `,
      withValidation: `
        <PicnicParticipantFormCore
          formData={formData}
          errors={validation.errors}
          fieldValidationStates={validation.fieldStates}
          updateField={updateField}
          onFieldFocus={analytics.trackFieldInteraction}
          teamSuggestions={teams.suggestions}
        />
      `
    }
  },

  PicnicParticipantFormValidationSummary: {
    name: 'PicnicParticipantFormValidationSummary',
    description: 'Interactive validation feedback with error navigation and progress tracking',
    category: 'validation-display',
    complexity: 'medium',
    features: [
      'Error categorization by severity',
      'Progress tracking visualization',
      'Interactive error navigation',
      'Expandable error sections',
      'Field status indicators',
      'Glass morphism design',
      'Compact display mode'
    ],
    props: {
      errors: {
        type: 'object',
        required: false,
        description: 'Current validation errors'
      },
      validationStatus: {
        type: 'object',
        required: false,
        description: 'Overall validation status and progress'
      },
      errorSummary: {
        type: 'object',
        required: false,
        description: 'Categorized error summary'
      },
      fieldValidationStates: {
        type: 'object',
        required: false,
        description: 'Individual field validation states'
      },
      onFieldFocus: {
        type: 'function',
        required: false,
        description: 'Function to focus on specific field'
      },
      onErrorClick: {
        type: 'function',
        required: false,
        description: 'Error click handler for navigation'
      },
      showProgress: {
        type: 'boolean',
        required: false,
        description: 'Show progress indicator'
      },
      showDetails: {
        type: 'boolean',
        required: false,
        description: 'Show detailed field status'
      },
      compactMode: {
        type: 'boolean',
        required: false,
        description: 'Enable compact display mode'
      }
    },
    examples: {
      basic: `
        <PicnicParticipantFormValidationSummary
          errors={validation.errors}
          validationStatus={validation.status}
          errorSummary={validation.summary}
        />
      `,
      interactive: `
        <PicnicParticipantFormValidationSummary
          errors={validation.errors}
          validationStatus={validation.status}
          errorSummary={validation.summary}
          fieldValidationStates={validation.fieldStates}
          onFieldFocus={focusField}
          onErrorClick={handleErrorNavigation}
          showProgress={true}
          showDetails={true}
        />
      `,
      compact: `
        <PicnicParticipantFormValidationSummary
          errors={validation.errors}
          validationStatus={validation.status}
          compactMode={true}
          showProgress={false}
        />
      `
    }
  }
};

// Layout configurations
export const LAYOUT_CONFIGURATIONS = {
  accordion: {
    name: 'Accordion Layout',
    description: 'Sections organized in expandable accordions',
    suitable: ['Complex forms', 'Mobile devices', 'Step-by-step guidance'],
    features: ['Section organization', 'Space efficient', 'Progressive disclosure']
  },
  standard: {
    name: 'Standard Layout',
    description: 'All sections visible simultaneously',
    suitable: ['Simple forms', 'Desktop devices', 'Quick data entry'],
    features: ['Full visibility', 'Quick navigation', 'Familiar layout']
  },
  tabs: {
    name: 'Tabbed Layout',
    description: 'Sections organized in tabs',
    suitable: ['Multi-step forms', 'Clear workflows', 'Desktop interfaces'],
    features: ['Step indication', 'Workflow guidance', 'Clean separation']
  }
};

// Validation severity levels
export const VALIDATION_SEVERITY_LEVELS = {
  critical: {
    level: 'critical',
    description: 'Critical errors that prevent form submission',
    color: 'error',
    icon: 'ErrorIcon',
    priority: 1,
    examples: ['Required field missing', 'Invalid format', 'Duplicate values']
  },
  high: {
    level: 'high',
    description: 'High priority issues that should be addressed',
    color: 'warning',
    icon: 'WarningIcon',
    priority: 2,
    examples: ['Business rule violations', 'Capacity limits', 'Format warnings']
  },
  medium: {
    level: 'medium',
    description: 'Medium priority issues for user attention',
    color: 'info',
    icon: 'InfoIcon',
    priority: 3,
    examples: ['Suggestions', 'Optional improvements', 'Best practices']
  },
  low: {
    level: 'low',
    description: 'Low priority informational messages',
    color: 'success',
    icon: 'CheckCircleIcon',
    priority: 4,
    examples: ['Confirmations', 'Tips', 'Additional information']
  }
};

// Form field groupings
export const FORM_FIELD_GROUPS = {
  participant: {
    name: 'Participant Information',
    icon: 'PersonIcon',
    fields: ['name', 'phone'],
    description: 'Basic participant details and contact information',
    validation: 'All fields required for participant identification'
  },
  assignment: {
    name: 'Team & Game Assignment',
    icon: 'GroupIcon',
    fields: ['team', 'random_number'],
    description: 'Team assignment and lucky number for games',
    validation: 'Team selection affects group activities and competitions'
  },
  payment: {
    name: 'Payment Information',
    icon: 'PaymentIcon',
    fields: ['payment_amount'],
    description: 'Contribution amount and payment details',
    validation: 'Amount must be within specified range and increments'
  }
};

// Component usage guidelines
export const USAGE_GUIDELINES = {
  formCore: {
    bestPractices: [
      'Use accordion layout for mobile and complex forms',
      'Provide real-time validation feedback',
      'Include team balancing suggestions',
      'Format phone numbers automatically',
      'Show currency symbols for payment fields'
    ],
    accessibility: [
      'Ensure proper label associations',
      'Provide keyboard navigation',
      'Include ARIA attributes',
      'Support screen readers',
      'Maintain proper color contrast'
    ],
    performance: [
      'Debounce validation calls',
      'Memoize expensive calculations',
      'Lazy load team data if large',
      'Optimize re-renders with React.memo'
    ]
  },
  validationSummary: {
    bestPractices: [
      'Categorize errors by severity',
      'Provide navigation to error fields',
      'Show progress for user motivation',
      'Use compact mode for limited space',
      'Include helpful error messages'
    ],
    accessibility: [
      'Announce validation changes',
      'Provide keyboard navigation to errors',
      'Use semantic HTML elements',
      'Include descriptive error text',
      'Support screen reader announcements'
    ],
    performance: [
      'Virtualize large error lists',
      'Debounce error updates',
      'Memoize error categorization',
      'Optimize list rendering'
    ]
  }
};

// Export all configurations
export default {
  PICNIC_PARTICIPANT_FORM_COMPONENTS,
  LAYOUT_CONFIGURATIONS,
  VALIDATION_SEVERITY_LEVELS,
  FORM_FIELD_GROUPS,
  USAGE_GUIDELINES
};
