/**
 * @fileoverview Authentication Template Module Exports
 * @description Central export file for authentication template components
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author glassERP Development Team
 */

// Main template component
export { default as AuthTemplate } from './AuthTemplate';

// Sub-components
export { default as AuthTemplateHeader } from './AuthTemplateHeader';
export { default as AuthTemplateFooter } from './AuthTemplateFooter';
export { default as AuthTemplateCard } from './AuthTemplateCard';

// Configuration
export { AUTH_TEMPLATE_CONFIG } from './config';

// Hooks
export { useAuthTemplate } from './hooks/useAuthTemplate';

/**
 * Re-export for backward compatibility and easier imports
 */
export {
  AuthTemplate as default,
  AuthTemplate,
  AuthTemplateHeader,
  AuthTemplateFooter,
  AuthTemplateCard
};
