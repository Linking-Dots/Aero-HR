/**
 * Molecules Component Index
 * 
 * Centralized exports for all molecule-level components
 * Implements atomic design principles and ISO standards
 * 
 * @version 1.0.0
 * @since 2024
 * @atomicDesign Molecule Level Components
 */

// Form Components (ISO-compliant migrations)
export { default as ProfileForm } from './profile-form';
export { default as PersonalInformationForm } from './personal-info-form';
export { default as LeaveForm } from './leave-form';
export { default as AddUserForm } from './add-user-form';
export { default as CompanyInformationForm } from './company-info-form';
export { default as BankInformationForm } from './bank-info-form';
export { default as EducationInformationForm } from './education-info-form';
export { default as ExperienceInformationForm } from './experience-info-form';
export { default as SalaryInformationForm } from './salary-info-form';
export { default as EmergencyContactForm } from './emergency-contact-form';

// UI Components
export { default as GlassCard } from './GlassCard.jsx';
export { default as StatisticCard } from './StatisticCard.jsx';

// Navigation Components
export { default as Breadcrumb } from './breadcrumb';

// Card Components
export { default as LeaveCard } from './leave-card';
export { default as ProjectCard } from './project-card';
export { default as StatisticCardComponent } from './statistic-card';

// Utility Components
export { default as NoticeBoard } from './notice-board';
export { default as ThemeSettingDrawer } from './theme-setting-drawer';

// Component metadata for development and documentation
export const moleculeMetadata = {
  // Form Components
  ProfileForm: {
    category: 'form',
    complexity: 'high',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'glass-morphism', 'user-profile-management']
  },
  PersonalInformationForm: {
    category: 'form',
    complexity: 'medium',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'personal-data-management']
  },
  LeaveForm: {
    category: 'form',
    complexity: 'medium',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'leave-management']
  },
  AddUserForm: {
    category: 'form',
    complexity: 'medium',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'user-creation']
  },
  CompanyInformationForm: {
    category: 'form',
    complexity: 'medium',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'company-settings']
  },
  BankInformationForm: {
    category: 'form',
    complexity: 'medium',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'financial-data']
  },
  EducationInformationForm: {
    category: 'form',
    complexity: 'medium',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: ['validation', 'accessibility', 'education-management']
  },
  ExperienceInformationForm: {
    category: 'form',
    complexity: 'high',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: [
      'validation', 
      'accessibility', 
      'experience-management',
      'career-analytics',
      'progression-analysis',
      'timeline-visualization',
      'recommendation-engine'
    ]
  },
  SalaryInformationForm: {
    category: 'form',
    complexity: 'very-high',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: [
      'advanced-validation',
      'accessibility-compliant',
      'glass-morphism-design', 
      'pf-calculation-engine',
      'esi-calculation-engine',
      'indian-statutory-compliance',
      'real-time-analytics',
      'auto-save',      'salary-breakdown',
      'ctc-calculation',
      'statutory-validation'
    ]
  },
  EmergencyContactForm: {
    category: 'form',
    complexity: 'high',
    migrationStatus: 'complete',
    isoCompliant: true,
    features: [
      'dual-contact-support',
      'advanced-validation',
      'accessibility-compliant',
      'glass-morphism-design',
      'indian-phone-validation',
      'relationship-categorization',
      'duplicate-detection',
      'auto-save-functionality',
      'real-time-analytics',
      'behavior-tracking',
      'error-categorization',
      'progress-tracking',
      'keyboard-shortcuts'
    ]
  },

  // UI Components
  GlassCard: {
    category: 'ui',
    complexity: 'low',
    features: ['glass-morphism', 'responsive-design']
  },
  StatisticCard: {
    category: 'ui',
    complexity: 'low',
    features: ['data-visualization', 'responsive-design']
  },

  // Navigation Components
  Breadcrumb: {
    category: 'navigation',
    complexity: 'low',
    features: ['navigation', 'accessibility']
  },

  // Card Components
  LeaveCard: {
    category: 'card',
    complexity: 'medium',
    features: ['data-display', 'interactive']
  },
  ProjectCard: {
    category: 'card',
    complexity: 'medium',
    features: ['data-display', 'interactive']
  },

  // Utility Components
  NoticeBoard: {
    category: 'utility',
    complexity: 'medium',
    features: ['notifications', 'real-time-updates']
  },
  ThemeSettingDrawer: {
    category: 'utility',
    complexity: 'medium',
    features: ['theme-management', 'user-preferences']
  }
};

// Migration progress tracking
export const migrationProgress = {
  totalComponents: Object.keys(moleculeMetadata).length,
  completedForms: 10, // Updated to include EmergencyContactForm
  totalForms: 10,
  formCompletionPercentage: 100,
  overallProgress: 78, // Updated with new form completion
    completedComponents: [
    'ProfileForm',
    'PersonalInformationForm', 
    'LeaveForm',
    'AddUserForm',
    'CompanyInformationForm',
    'BankInformationForm',
    'EducationInformationForm',
    'ExperienceInformationForm',
    'SalaryInformationForm',
    'EmergencyContactForm'
  ],
  
  pendingComponents: [
    // Add any remaining components that need migration
  ],
    isoCompliantComponents: [
    'ProfileForm',
    'PersonalInformationForm',
    'LeaveForm', 
    'AddUserForm',
    'CompanyInformationForm',
    'BankInformationForm',
    'EducationInformationForm',
    'ExperienceInformationForm',
    'SalaryInformationForm',
    'EmergencyContactForm'
  ]
};

// Development utilities
export const getMoleculeComponent = (name) => {
  // This would return the actual component - implementation depends on dynamic imports
  return null;
};

export const getMoleculeMetadata = (name) => {
  return moleculeMetadata[name] || null;
};

export const getAllMoleculeMetadata = () => moleculeMetadata;

export const getMigrationProgress = () => migrationProgress;

export const getFormComponents = () => {
  return Object.entries(moleculeMetadata)
    .filter(([name, metadata]) => metadata.category === 'form')
    .reduce((acc, [name, metadata]) => {
      acc[name] = metadata;
      return acc;
    }, {});
};

export const getISOCompliantComponents = () => {
  return Object.entries(moleculeMetadata)
    .filter(([name, metadata]) => metadata.isoCompliant)
    .map(([name]) => name);
};
