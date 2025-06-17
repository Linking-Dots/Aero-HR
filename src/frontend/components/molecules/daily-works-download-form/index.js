/**
 * @fileoverview Daily Works Download Form Component Index
 * @description Main export file for daily works download form components and utilities
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author Development Team
 * 
 * @module DailyWorksDownloadForm
 * 
 * @example
 * // Import main component
 * import DailyWorksDownloadForm from './daily-works-download-form';
 * 
 * @example
 * // Import specific components
 * import { 
 *   DailyWorksDownloadFormCore,
 *   DailyWorksDownloadFormValidationSummary,
 *   DAILY_WORKS_DOWNLOAD_CONFIG
 * } from './daily-works-download-form';
 * 
 * @example
 * // Usage in parent component
 * function DailyWorksManagement() {
 *   return (
 *     <DailyWorksDownloadForm
 *       workData={workData}
 *       onExportComplete={handleExportComplete}
 *       onExportError={handleExportError}
 *     />
 *   );
 * }
 */

// Main component (default export)
export { default } from './DailyWorksDownloadForm';

// Core components
export { default as DailyWorksDownloadFormCore } from './DailyWorksDownloadFormCore';
export { default as DailyWorksDownloadFormValidationSummary } from './DailyWorksDownloadFormValidationSummary';

// Configuration and validation
export { 
  DAILY_WORKS_DOWNLOAD_CONFIG,
  EXPORT_COLUMNS,
  COLUMN_CATEGORIES,
  EXPORT_FORMATS,
  VALIDATION_RULES,
  PERFORMANCE_THRESHOLDS,
  ANALYTICS_CONFIG
} from './config';

export {
  dailyWorksDownloadFormValidationSchema,
  createStepValidationSchema,
  customValidationMethods
} from './validation';

// Hooks
export {
  useDailyWorksDownloadForm,
  useDailyWorksDownloadFormValidation,
  useDailyWorksDownloadFormAnalytics,
  useCompleteDailyWorksDownloadForm,
  HOOK_CATEGORIES,
  AVAILABLE_HOOKS
} from './hooks';

/**
 * Component metadata for development and documentation
 */
export const COMPONENT_INFO = {
  name: 'DailyWorksDownloadForm',
  version: '1.0.0',
  category: 'Molecules',
  type: 'Export Form',
  description: 'Enterprise-grade daily works data export form with multi-format support',
  
  features: [
    'Multi-format export (Excel, CSV, PDF)',
    'Configurable column selection',
    'Real-time validation',
    'Performance optimization',
    'GDPR-compliant analytics',
    'Construction industry business rules',
    'Progress tracking',
    'Error handling and recovery',
    'User preference persistence',
    'Glass morphism design'
  ],
  
  dependencies: [
    '@mui/material',
    '@mui/icons-material',
    'react-hook-form',
    'yup',
    '@hookform/resolvers/yup',
    'lodash'
  ],
  
  relatedComponents: [
    'DailyWorkSummaryDownloadForm',
    'ExportDialog',
    'ColumnSelector',
    'ValidationSummary'
  ]
};

/**
 * Export format specifications
 */
export const EXPORT_FORMAT_SPECS = {
  excel: {
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    features: ['Formatting', 'Multiple sheets', 'Charts', 'Formulas'],
    maxRows: 1000000,
    recommended: true
  },
  csv: {
    extension: '.csv',
    mimeType: 'text/csv',
    features: ['Universal compatibility', 'Lightweight', 'Fast processing'],
    maxRows: 500000,
    recommended: false
  },
  pdf: {
    extension: '.pdf',
    mimeType: 'application/pdf',
    features: ['Print-ready', 'Professional appearance', 'Secure'],
    maxRows: 10000,
    recommended: false
  }
};

/**
 * Usage examples for different scenarios
 */
export const USAGE_EXAMPLES = {
  basic: `
    <DailyWorksDownloadForm
      workData={dailyWorksData}
      onExportComplete={(result) => console.log('Export complete:', result)}
    />
  `,
  
  withCustomColumns: `
    <DailyWorksDownloadForm
      workData={dailyWorksData}
      defaultSelectedColumns={['work_date', 'work_type', 'progress']}
      onExportComplete={handleExportComplete}
      onExportError={handleExportError}
    />
  `,
  
  withAnalytics: `
    <DailyWorksDownloadForm
      workData={dailyWorksData}
      enableAnalytics={true}
      analyticsConfig={{
        trackUserBehavior: true,
        trackPerformance: true,
        gdprCompliant: true
      }}
      onExportComplete={handleExportComplete}
    />
  `,
  
  withValidation: `
    <DailyWorksDownloadForm
      workData={dailyWorksData}
      validationConfig={{
        enforceBusinessRules: true,
        validateDataIntegrity: true,
        checkPerformanceLimits: true
      }}
      onValidationError={handleValidationError}
      onExportComplete={handleExportComplete}
    />
  `
};
