/**
 * Delete Leave Form Hooks Index
 * Centralized exports for all delete leave form hooks
 * 
 * Features:
 * - Organized hook exports with metadata
 * - Performance monitoring utilities
 * - Usage patterns and best practices
 * - Hook composition helpers
 * - Development utilities
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

// Core hooks
export { useDeleteLeaveForm } from './useDeleteLeaveForm';
export { useDeleteLeaveFormValidation } from './useDeleteLeaveFormValidation';
export { useDeleteLeaveFormAnalytics } from './useDeleteLeaveFormAnalytics';
export { useCompleteDeleteLeaveForm } from './useCompleteDeleteLeaveForm';

/**
 * Hook Metadata
 * Information about each hook for documentation and development
 */
export const HOOK_METADATA = {
  useDeleteLeaveForm: {
    name: 'useDeleteLeaveForm',
    description: 'Core state management hook for leave deletion functionality',
    category: 'state-management',
    complexity: 'medium',
    features: [
      'Leave deletion state management',
      'Security confirmation handling',
      'Permission validation',
      'Audit trail management',
      'Real-time validation integration',
      'Performance optimization'
    ],
    dependencies: ['config', 'validation'],
    performance: {
      renderCount: 'low',
      memoryUsage: 'low',
      computationCost: 'medium'
    },
    accessibility: {
      screenReaderSupport: true,
      keyboardNavigation: true,
      focusManagement: true
    }
  },

  useDeleteLeaveFormValidation: {
    name: 'useDeleteLeaveFormValidation',
    description: 'Advanced validation hook with real-time feedback and performance optimization',
    category: 'validation',
    complexity: 'high',
    features: [
      'Real-time validation with debouncing',
      'Error categorization by severity',
      'Field-specific validation',
      'Performance monitoring',
      'Accessibility compliance',
      'Security validation'
    ],
    dependencies: ['validation', 'yup'],
    performance: {
      renderCount: 'medium',
      memoryUsage: 'medium',
      computationCost: 'high'
    },
    accessibility: {
      screenReaderSupport: true,
      keyboardNavigation: true,
      focusManagement: true
    }
  },

  useDeleteLeaveFormAnalytics: {
    name: 'useDeleteLeaveFormAnalytics',
    description: 'Advanced analytics and tracking for leave deletion operations',
    category: 'analytics',
    complexity: 'high',
    features: [
      'User behavior analytics',
      'Deletion pattern analysis',
      'Performance metrics tracking',
      'Security compliance monitoring',
      'Accessibility usage tracking',
      'Business intelligence insights'
    ],
    dependencies: ['config'],
    performance: {
      renderCount: 'low',
      memoryUsage: 'medium',
      computationCost: 'medium'
    },
    accessibility: {
      screenReaderSupport: false,
      keyboardNavigation: false,
      focusManagement: false
    }
  },

  useCompleteDeleteLeaveForm: {
    name: 'useCompleteDeleteLeaveForm',
    description: 'Integration hook that combines all delete leave form functionality',
    category: 'integration',
    complexity: 'very-high',
    features: [
      'Complete form state management',
      'Integrated validation and analytics',
      'Auto-save functionality',
      'Error handling and recovery',
      'Performance monitoring',
      'Accessibility compliance'
    ],
    dependencies: ['all-hooks', 'config'],
    performance: {
      renderCount: 'high',
      memoryUsage: 'high',
      computationCost: 'very-high'
    },
    accessibility: {
      screenReaderSupport: true,
      keyboardNavigation: true,
      focusManagement: true
    }
  }
};

/**
 * Usage Patterns
 * Common patterns for using the delete leave form hooks
 */
export const USAGE_PATTERNS = {
  // Basic usage with minimal features
  basic: {
    name: 'Basic Delete Leave Form',
    description: 'Simple deletion dialog with basic validation',
    hooks: ['useDeleteLeaveForm'],
    example: `
      const { formState, showDialog, hideDialog, submitDeletion } = useDeleteLeaveForm({
        leaveData,
        userPermissions,
        onSuccess: handleSuccess,
        onError: handleError
      });
    `,
    useCase: 'Simple deletion confirmation without advanced features',
    performance: 'optimal',
    complexity: 'low'
  },

  // Enhanced validation
  withValidation: {
    name: 'Delete Leave Form with Validation',
    description: 'Deletion dialog with comprehensive validation',
    hooks: ['useDeleteLeaveForm', 'useDeleteLeaveFormValidation'],
    example: `
      const form = useDeleteLeaveForm({ leaveData, userPermissions });
      const validation = useDeleteLeaveFormValidation({
        formData: form.formState,
        leaveData,
        userPermissions
      });
    `,
    useCase: 'Enhanced deletion with real-time validation feedback',
    performance: 'good',
    complexity: 'medium'
  },

  // Full analytics tracking
  withAnalytics: {
    name: 'Delete Leave Form with Analytics',
    description: 'Complete deletion workflow with behavior tracking',
    hooks: ['useDeleteLeaveForm', 'useDeleteLeaveFormValidation', 'useDeleteLeaveFormAnalytics'],
    example: `
      const form = useDeleteLeaveForm({ leaveData, userPermissions });
      const validation = useDeleteLeaveFormValidation({ formData: form.formState });
      const analytics = useDeleteLeaveFormAnalytics({ leaveData, userPermissions });
    `,
    useCase: 'Business intelligence and user behavior analysis',
    performance: 'fair',
    complexity: 'high'
  },

  // Complete integration (recommended)
  complete: {
    name: 'Complete Delete Leave Form',
    description: 'Full-featured deletion workflow with all enhancements',
    hooks: ['useCompleteDeleteLeaveForm'],
    example: `
      const {
        form,
        validation,
        analytics,
        showDialog,
        submitDeletion,
        notifications
      } = useCompleteDeleteLeaveForm({
        leaveData,
        userPermissions,
        enableAnalytics: true,
        enableAutoSave: true
      });
    `,
    useCase: 'Production-ready deletion with enterprise features',
    performance: 'good',
    complexity: 'high'
  }
};

/**
 * Performance Monitoring Utilities
 * Tools for monitoring hook performance and optimization
 */
export const PerformanceMonitor = {
  /**
   * Monitor hook render performance
   * @param {string} hookName - Name of the hook to monitor
   * @param {Function} hookFunction - Hook function to monitor
   * @returns {Function} - Wrapped hook with performance monitoring
   */
  monitorHook: (hookName, hookFunction) => {
    return (...args) => {
      const startTime = performance.now();
      const result = hookFunction(...args);
      const endTime = performance.now();
      
      // Log performance metrics
      console.debug(`Hook ${hookName} execution time:`, endTime - startTime, 'ms');
      
      return result;
    };
  },

  /**
   * Create performance benchmark for hooks
   * @param {Object} hooks - Object containing hooks to benchmark
   * @returns {Object} - Benchmark results
   */
  benchmark: (hooks) => {
    const results = {};
    
    Object.entries(hooks).forEach(([name, hook]) => {
      const iterations = 100;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        hook();
        const end = performance.now();
        times.push(end - start);
      }
      
      results[name] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        iterations
      };
    });
    
    return results;
  },

  /**
   * Get hook performance recommendations
   * @param {string} hookName - Name of the hook
   * @returns {Object} - Performance recommendations
   */
  getRecommendations: (hookName) => {
    const metadata = HOOK_METADATA[hookName];
    if (!metadata) return null;
    
    const recommendations = [];
    
    if (metadata.performance.computationCost === 'high') {
      recommendations.push('Consider memoization for expensive computations');
    }
    
    if (metadata.performance.renderCount === 'high') {
      recommendations.push('Use React.memo or useMemo to reduce re-renders');
    }
    
    if (metadata.performance.memoryUsage === 'high') {
      recommendations.push('Review data structures and consider cleanup on unmount');
    }
    
    return {
      hookName,
      complexity: metadata.complexity,
      recommendations,
      optimizations: [
        'Use debouncing for frequent updates',
        'Implement proper cleanup in useEffect',
        'Consider lazy loading for non-critical features',
        'Use useMemo for complex calculations'
      ]
    };
  }
};

/**
 * Hook Composition Helpers
 * Utilities for composing and combining hooks effectively
 */
export const HookComposer = {
  /**
   * Compose multiple hooks with error boundaries
   * @param {Array} hooks - Array of hook configurations
   * @returns {Object} - Composed hook result
   */
  composeHooks: (hooks) => {
    const results = {};
    const errors = [];
    
    hooks.forEach(({ name, hook, args, required = true }) => {
      try {
        results[name] = hook(...(args || []));
      } catch (error) {
        console.error(`Hook ${name} failed:`, error);
        errors.push({ name, error });
        
        if (required) {
          throw new Error(`Required hook ${name} failed: ${error.message}`);
        }
      }
    });
    
    return { results, errors };
  },

  /**
   * Create a hook factory for consistent configuration
   * @param {Object} defaultConfig - Default configuration for hooks
   * @returns {Object} - Hook factory functions
   */
  createHookFactory: (defaultConfig) => ({
    createDeleteLeaveForm: (overrides = {}) => ({
      ...defaultConfig,
      ...overrides
    }),
    
    createValidationHook: (overrides = {}) => ({
      ...defaultConfig.validation,
      ...overrides
    }),
    
    createAnalyticsHook: (overrides = {}) => ({
      ...defaultConfig.analytics,
      ...overrides
    })
  }),

  /**
   * Validate hook dependencies
   * @param {string} hookName - Name of the hook to validate
   * @param {Object} dependencies - Available dependencies
   * @returns {Object} - Validation result
   */
  validateDependencies: (hookName, dependencies) => {
    const metadata = HOOK_METADATA[hookName];
    if (!metadata) {
      return { valid: false, error: 'Hook metadata not found' };
    }
    
    const missing = metadata.dependencies.filter(
      dep => !dependencies.hasOwnProperty(dep)
    );
    
    return {
      valid: missing.length === 0,
      missing,
      satisfied: metadata.dependencies.filter(
        dep => dependencies.hasOwnProperty(dep)
      )
    };
  }
};

/**
 * Development Utilities
 * Tools for development and debugging
 */
export const DevUtils = {
  /**
   * Enable hook debugging
   * @param {boolean} enabled - Whether debugging is enabled
   */
  enableDebugging: (enabled = true) => {
    if (enabled && process.env.NODE_ENV === 'development') {
      console.log('Delete Leave Form Hooks debugging enabled');
      
      // Add global hook debugging utilities
      window.deleteLeaveFormHooks = {
        metadata: HOOK_METADATA,
        usagePatterns: USAGE_PATTERNS,
        performanceMonitor: PerformanceMonitor,
        hookComposer: HookComposer
      };
    }
  },

  /**
   * Log hook usage statistics
   * @param {Object} hookUsage - Hook usage data
   */
  logUsageStats: (hookUsage) => {
    if (process.env.NODE_ENV === 'development') {
      console.group('Delete Leave Form Hooks Usage Statistics');
      Object.entries(hookUsage).forEach(([hook, stats]) => {
        console.log(`${hook}:`, stats);
      });
      console.groupEnd();
    }
  },

  /**
   * Validate hook configuration
   * @param {Object} config - Hook configuration to validate
   * @returns {Object} - Validation result
   */
  validateConfig: (config) => {
    const errors = [];
    const warnings = [];
    
    // Validate required configuration
    if (!config.leaveData) {
      errors.push('leaveData is required');
    }
    
    if (!config.userPermissions) {
      errors.push('userPermissions is required');
    }
    
    // Validate optional configuration
    if (config.enableAnalytics && !config.analyticsConfig) {
      warnings.push('Analytics enabled but no analytics configuration provided');
    }
    
    if (config.enableAutoSave && !config.autoSaveConfig) {
      warnings.push('Auto-save enabled but no auto-save configuration provided');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};

/**
 * Hook Presets
 * Pre-configured hook combinations for common use cases
 */
export const HookPresets = {
  // Minimal preset for simple use cases
  minimal: {
    name: 'Minimal Delete Leave Form',
    description: 'Basic deletion functionality with minimal overhead',
    configuration: {
      enableAnalytics: false,
      enableAutoSave: false,
      validationLevel: 'basic'
    }
  },

  // Standard preset for most applications
  standard: {
    name: 'Standard Delete Leave Form',
    description: 'Balanced feature set for typical applications',
    configuration: {
      enableAnalytics: true,
      enableAutoSave: false,
      validationLevel: 'comprehensive'
    }
  },

  // Enterprise preset for advanced applications
  enterprise: {
    name: 'Enterprise Delete Leave Form',
    description: 'Full feature set for enterprise applications',
    configuration: {
      enableAnalytics: true,
      enableAutoSave: true,
      validationLevel: 'comprehensive',
      errorRecovery: true,
      performanceMonitoring: true
    }
  }
};

// Enable debugging in development
if (process.env.NODE_ENV === 'development') {
  DevUtils.enableDebugging(true);
}

export default {
  // Hooks
  useDeleteLeaveForm,
  useDeleteLeaveFormValidation,
  useDeleteLeaveFormAnalytics,
  useCompleteDeleteLeaveForm,
  
  // Metadata and utilities
  HOOK_METADATA,
  USAGE_PATTERNS,
  PerformanceMonitor,
  HookComposer,
  DevUtils,
  HookPresets
};
