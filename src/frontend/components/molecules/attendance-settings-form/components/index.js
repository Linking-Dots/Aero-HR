/**
 * Attendance Settings Form Components Index
 * 
 * Centralized export for all AttendanceSettingsForm components following
 * ISO 25010 (Software Quality) standards for maintainability and modularity.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 */

// Core Components
export { default as AttendanceSettingsFormCore } from './AttendanceSettingsFormCore.jsx';
export { default as AttendanceSettingsFormValidationSummary } from './AttendanceSettingsFormValidationSummary.jsx';
export { default as AttendanceSettingsAnalyticsSummary } from './AttendanceSettingsAnalyticsSummary.jsx';

/**
 * Component Metadata for Development Tools
 */
export const componentMetadata = {
  category: 'molecules',
  subcategory: 'attendance-settings-form',
  complexity: 'high',
  components: {
    AttendanceSettingsFormCore: {
      description: 'Main form component with multi-section accordion layout',
      complexity: 'high',
      dependencies: ['react', 'framer-motion', 'lucide-react'],
      features: [
        'Multi-section accordion layout',
        'Glass morphism design',
        'Real-time validation feedback',
        'Conditional field rendering',
        'Progress visualization',
        'Accessibility support'
      ],
      props: {
        required: ['config', 'formState', 'validation', 'onFieldChange'],
        optional: ['className', 'disabled', 'showAnalytics', 'analytics']
      }
    },
    AttendanceSettingsFormValidationSummary: {
      description: 'Validation summary with error categorization and navigation',
      complexity: 'medium',
      dependencies: ['react', 'framer-motion', 'lucide-react'],
      features: [
        'Error categorization display',
        'Interactive error navigation',
        'Performance metrics',
        'Section breakdown',
        'Actionable suggestions'
      ],
      props: {
        required: ['validation', 'config', 'onNavigateToField'],
        optional: ['className', 'showMetrics', 'showSuggestions']
      }
    },
    AttendanceSettingsAnalyticsSummary: {
      description: 'Analytics dashboard with behavior tracking and insights',
      complexity: 'high',
      dependencies: ['react', 'framer-motion', 'lucide-react'],
      features: [
        'User behavior visualization',
        'Performance metrics display',
        'Field interaction analysis',
        'Real-time insights',
        'Data export functionality'
      ],
      props: {
        required: ['analytics', 'config'],
        optional: ['className', 'showExport', 'onExport']
      }
    }
  },
  integration: {
    patterns: {
      basic: 'Use AttendanceSettingsFormCore for simple form implementation',
      withValidation: 'Combine Core + ValidationSummary for validation feedback',
      withAnalytics: 'Combine Core + AnalyticsSummary for behavior tracking',
      complete: 'Use all three components for full-featured form experience'
    },
    performance: {
      recommendations: [
        'Lazy load analytics components when not immediately needed',
        'Use React.memo for validation summary to prevent unnecessary re-renders',
        'Implement virtualization for large validation error lists',
        'Cache analytics data to reduce computation overhead'
      ],
      bundleSize: {
        core: '~45KB (gzipped)',
        validation: '~15KB (gzipped)',
        analytics: '~25KB (gzipped)',
        total: '~85KB (gzipped)'
      }
    }
  },
  testing: {
    coverage: {
      target: '95%',
      critical: ['form submission', 'validation logic', 'error handling'],
      performance: ['render time', 'memory usage', 'interaction responsiveness']
    },
    scenarios: [
      'Form initialization with default values',
      'Field validation and error display',
      'Section expansion and progress tracking',
      'Auto-save functionality',
      'Analytics data collection',
      'Accessibility compliance',
      'Mobile responsiveness'
    ]
  }
};

/**
 * Usage Examples
 */
export const usageExamples = {
  basic: `
import { AttendanceSettingsFormCore } from './components';
import { useAttendanceSettingsForm } from './hooks';

function BasicForm() {
  const { config, formState, validation, handleFieldChange } = useAttendanceSettingsForm();
  
  return (
    <AttendanceSettingsFormCore
      config={config}
      formState={formState}
      validation={validation}
      onFieldChange={handleFieldChange}
    />
  );
}`,

  withValidation: `
import { 
  AttendanceSettingsFormCore, 
  AttendanceSettingsFormValidationSummary 
} from './components';
import { useCompleteAttendanceSettingsForm } from './hooks';

function FormWithValidation() {
  const {
    config,
    formState,
    validation,
    handleFieldChange,
    navigateToField
  } = useCompleteAttendanceSettingsForm();
  
  return (
    <div className="space-y-6">
      <AttendanceSettingsFormValidationSummary
        validation={validation}
        config={config}
        onNavigateToField={navigateToField}
        showMetrics
        showSuggestions
      />
      <AttendanceSettingsFormCore
        config={config}
        formState={formState}
        validation={validation}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
}`,

  complete: `
import { 
  AttendanceSettingsFormCore, 
  AttendanceSettingsFormValidationSummary,
  AttendanceSettingsAnalyticsSummary 
} from './components';
import { useCompleteAttendanceSettingsForm } from './hooks';

function CompleteForm() {
  const {
    config,
    formState,
    validation,
    analytics,
    handleFieldChange,
    navigateToField,
    exportAnalytics
  } = useCompleteAttendanceSettingsForm();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AttendanceSettingsFormCore
          config={config}
          formState={formState}
          validation={validation}
          onFieldChange={handleFieldChange}
          showAnalytics
          analytics={analytics}
        />
      </div>
      <div className="space-y-6">
        <AttendanceSettingsFormValidationSummary
          validation={validation}
          config={config}
          onNavigateToField={navigateToField}
          showMetrics
          showSuggestions
        />
        <AttendanceSettingsAnalyticsSummary
          analytics={analytics}
          config={config}
          showExport
          onExport={exportAnalytics}
        />
      </div>
    </div>
  );
}`
};
