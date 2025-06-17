/**
 * Delete Leave Form Components Index
 * Centralized exports for all delete leave form components
 * 
 * Features:
 * - Organized component exports with metadata
 * - Usage patterns and examples
 * - Performance monitoring utilities
 * - Component composition helpers
 * - Development utilities
 * 
 * @author glassERP Development Team
 * @version 2.1.0
 * @since 2024-01-15
 */

// Core components
export { DeleteLeaveFormCore } from './DeleteLeaveFormCore';
export { DeleteLeaveFormValidationSummary } from './DeleteLeaveFormValidationSummary';

/**
 * Component Metadata
 * Information about each component for documentation and development
 */
export const COMPONENT_METADATA = {
  DeleteLeaveFormCore: {
    name: 'DeleteLeaveFormCore',
    description: 'Core confirmation dialog for leave deletion with glass morphism design',
    category: 'form-dialog',
    complexity: 'high',
    features: [
      'Glass morphism confirmation dialog',
      'Multi-step confirmation process',
      'Real-time validation feedback',
      'Accessibility compliance (WCAG 2.1 AA)',
      'Security confirmation requirements',
      'Progress tracking'
    ],
    dependencies: ['React', 'PropTypes'],
    performance: {
      renderCount: 'medium',
      memoryUsage: 'medium',
      bundleSize: 'large'
    },
    accessibility: {
      screenReaderSupport: true,
      keyboardNavigation: true,
      focusManagement: true,
      ariaLabels: true,
      colorContrast: 'AA'
    },
    responsive: {
      mobile: true,
      tablet: true,
      desktop: true
    }
  },

  DeleteLeaveFormValidationSummary: {
    name: 'DeleteLeaveFormValidationSummary',
    description: 'Comprehensive validation feedback with interactive field navigation',
    category: 'validation-display',
    complexity: 'medium',
    features: [
      'Real-time validation status display',
      'Error categorization by severity',
      'Interactive field navigation',
      'Accessibility compliance',
      'Progress tracking',
      'Security validation status'
    ],
    dependencies: ['React', 'PropTypes'],
    performance: {
      renderCount: 'low',
      memoryUsage: 'low',
      bundleSize: 'medium'
    },
    accessibility: {
      screenReaderSupport: true,
      keyboardNavigation: true,
      focusManagement: true,
      ariaLabels: true,
      colorContrast: 'AA'
    },
    responsive: {
      mobile: true,
      tablet: true,
      desktop: true
    }
  }
};

/**
 * Usage Patterns
 * Common patterns for using the delete leave form components
 */
export const USAGE_PATTERNS = {
  // Basic modal dialog
  basicDialog: {
    name: 'Basic Delete Confirmation Dialog',
    description: 'Simple deletion confirmation with minimal validation',
    components: ['DeleteLeaveFormCore'],
    example: `
      <DeleteLeaveFormCore
        formState={formState}
        validationState={validationState}
        leaveData={leaveData}
        updateField={updateField}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        canSubmit={canSubmit}
      />
    `,
    useCase: 'Quick deletion confirmation without detailed feedback',
    complexity: 'low',
    performance: 'optimal'
  },

  // Enhanced validation feedback
  withValidationSummary: {
    name: 'Delete Dialog with Validation Summary',
    description: 'Deletion dialog with comprehensive validation feedback',
    components: ['DeleteLeaveFormCore', 'DeleteLeaveFormValidationSummary'],
    example: `
      <div>
        <DeleteLeaveFormCore {...coreProps} />
        <DeleteLeaveFormValidationSummary
          validationState={validationState}
          formState={formState}
          onFieldFocus={handleFieldFocus}
          showDetails={true}
        />
      </div>
    `,
    useCase: 'Enhanced user experience with detailed validation feedback',
    complexity: 'medium',
    performance: 'good'
  },

  // Embedded form
  embedded: {
    name: 'Embedded Delete Form',
    description: 'Inline deletion form without modal overlay',
    components: ['DeleteLeaveFormCore'],
    example: `
      <DeleteLeaveFormCore
        {...props}
        config={{
          ...config,
          ui: {
            ...config.ui,
            dialog: {
              ...config.ui.dialog,
              overlay: false,
              embedded: true
            }
          }
        }}
      />
    `,
    useCase: 'Inline deletion within existing interface',
    complexity: 'medium',
    performance: 'good'
  },

  // Mobile optimized
  mobileOptimized: {
    name: 'Mobile-Optimized Delete Dialog',
    description: 'Touch-friendly deletion dialog for mobile devices',
    components: ['DeleteLeaveFormCore'],
    example: `
      <DeleteLeaveFormCore
        {...props}
        config={{
          ...config,
          ui: {
            ...config.ui,
            dialog: {
              ...config.ui.dialog,
              mobileOptimized: true,
              touchFriendly: true
            }
          }
        }}
      />
    `,
    useCase: 'Mobile-first deletion experience',
    complexity: 'medium',
    performance: 'good'
  }
};

/**
 * Layout Configurations
 * Different layout options for components
 */
export const LAYOUT_CONFIGURATIONS = {
  // Validation summary layouts
  validationSummary: {
    minimal: {
      name: 'Minimal Validation Indicator',
      description: 'Simple validation status indicator',
      props: { layout: 'minimal', showDetails: false },
      useCase: 'Space-constrained interfaces'
    },
    compact: {
      name: 'Compact Validation Summary',
      description: 'Condensed validation information',
      props: { layout: 'compact', showDetails: false },
      useCase: 'Sidebar or secondary displays'
    },
    detailed: {
      name: 'Detailed Validation Summary',
      description: 'Complete validation information with interactive navigation',
      props: { layout: 'detailed', showDetails: true },
      useCase: 'Primary form validation feedback'
    }
  },

  // Dialog layouts
  dialog: {
    standard: {
      name: 'Standard Dialog',
      description: 'Default modal dialog appearance',
      className: 'max-w-md',
      useCase: 'General purpose deletion confirmation'
    },
    wide: {
      name: 'Wide Dialog',
      description: 'Wider dialog for detailed information',
      className: 'max-w-lg',
      useCase: 'Complex deletion with detailed explanations'
    },
    narrow: {
      name: 'Narrow Dialog',
      description: 'Compact dialog for simple confirmations',
      className: 'max-w-sm',
      useCase: 'Simple yes/no confirmations'
    }
  }
};

/**
 * Performance Monitoring Utilities
 * Tools for monitoring component performance
 */
export const PerformanceMonitor = {
  /**
   * Monitor component render performance
   * @param {string} componentName - Name of the component
   * @param {React.Component} Component - Component to monitor
   * @returns {React.Component} - Wrapped component with performance monitoring
   */
  monitorComponent: (componentName, Component) => {
    return React.memo((props) => {
      const renderStart = performance.now();
      
      React.useEffect(() => {
        const renderEnd = performance.now();
        console.debug(`${componentName} render time:`, renderEnd - renderStart, 'ms');
      });
      
      return <Component {...props} />;
    });
  },

  /**
   * Track component usage analytics
   * @param {string} componentName - Name of the component
   * @param {Object} usage - Usage data
   */
  trackUsage: (componentName, usage) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} usage:`, usage);
    }
    
    // Send to analytics service in production
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('component_usage', {
        component: componentName,
        ...usage
      });
    }
  },

  /**
   * Measure component bundle size impact
   * @param {Array} components - List of component names
   * @returns {Object} - Bundle size analysis
   */
  analyzeBundleImpact: (components) => {
    const metadata = components.map(name => COMPONENT_METADATA[name]);
    const totalComplexity = metadata.reduce((sum, meta) => {
      const complexityScore = {
        low: 1,
        medium: 2,
        high: 3,
        'very-high': 4
      }[meta?.complexity] || 2;
      return sum + complexityScore;
    }, 0);
    
    return {
      componentCount: components.length,
      totalComplexity,
      averageComplexity: totalComplexity / components.length,
      recommendations: totalComplexity > 6 ? [
        'Consider code splitting for complex components',
        'Use lazy loading for non-critical components',
        'Implement component-level caching'
      ] : [
        'Current bundle size is optimal',
        'Components are well-balanced'
      ]
    };
  }
};

/**
 * Component Composition Helpers
 * Utilities for composing components effectively
 */
export const ComponentComposer = {
  /**
   * Create a composed delete form with validation
   * @param {Object} options - Composition options
   * @returns {React.Component} - Composed component
   */
  createDeleteFormWithValidation: (options = {}) => {
    const {
      showValidationSummary = true,
      validationLayout = 'detailed',
      dialogLayout = 'standard',
      ...props
    } = options;
    
    return React.memo((componentProps) => {
      return (
        <div className="delete-leave-form-container">
          <DeleteLeaveFormCore
            {...props}
            {...componentProps}
            config={{
              ...props.config,
              ui: {
                ...props.config?.ui,
                dialog: {
                  ...props.config?.ui?.dialog,
                  ...LAYOUT_CONFIGURATIONS.dialog[dialogLayout]
                }
              }
            }}
          />
          
          {showValidationSummary && (
            <DeleteLeaveFormValidationSummary
              {...componentProps}
              layout={validationLayout}
              {...LAYOUT_CONFIGURATIONS.validationSummary[validationLayout]?.props}
            />
          )}
        </div>
      );
    });
  },

  /**
   * Create a responsive delete form
   * @param {Object} options - Responsive options
   * @returns {React.Component} - Responsive component
   */
  createResponsiveDeleteForm: (options = {}) => {
    const {
      breakpoints = {
        mobile: 640,
        tablet: 768,
        desktop: 1024
      },
      ...props
    } = options;
    
    return React.memo((componentProps) => {
      const [screenSize, setScreenSize] = React.useState('desktop');
      
      React.useEffect(() => {
        const handleResize = () => {
          const width = window.innerWidth;
          if (width < breakpoints.mobile) {
            setScreenSize('mobile');
          } else if (width < breakpoints.tablet) {
            setScreenSize('tablet');
          } else {
            setScreenSize('desktop');
          }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);
      
      const responsiveConfig = {
        ...props.config,
        ui: {
          ...props.config?.ui,
          dialog: {
            ...props.config?.ui?.dialog,
            responsive: true,
            screenSize,
            mobileOptimized: screenSize === 'mobile'
          }
        }
      };
      
      return (
        <DeleteLeaveFormCore
          {...props}
          {...componentProps}
          config={responsiveConfig}
        />
      );
    });
  }
};

/**
 * Development Utilities
 * Tools for development and debugging
 */
export const DevUtils = {
  /**
   * Enable component debugging
   * @param {boolean} enabled - Whether debugging is enabled
   */
  enableDebugging: (enabled = true) => {
    if (enabled && process.env.NODE_ENV === 'development') {
      console.log('Delete Leave Form Components debugging enabled');
      
      window.deleteLeaveFormComponents = {
        metadata: COMPONENT_METADATA,
        usagePatterns: USAGE_PATTERNS,
        layoutConfigurations: LAYOUT_CONFIGURATIONS,
        performanceMonitor: PerformanceMonitor,
        componentComposer: ComponentComposer
      };
    }
  },

  /**
   * Validate component props
   * @param {string} componentName - Name of the component
   * @param {Object} props - Props to validate
   * @returns {Object} - Validation result
   */
  validateProps: (componentName, props) => {
    const metadata = COMPONENT_METADATA[componentName];
    if (!metadata) {
      return { valid: false, error: 'Component metadata not found' };
    }
    
    const errors = [];
    const warnings = [];
    
    // Check required props based on component type
    if (componentName === 'DeleteLeaveFormCore') {
      if (!props.formState) errors.push('formState is required');
      if (!props.validationState) errors.push('validationState is required');
      if (!props.onSubmit) errors.push('onSubmit callback is required');
      if (!props.onCancel) errors.push('onCancel callback is required');
    }
    
    if (componentName === 'DeleteLeaveFormValidationSummary') {
      if (!props.validationState) errors.push('validationState is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Generate component usage report
   * @param {Object} usageData - Component usage data
   * @returns {Object} - Usage report
   */
  generateUsageReport: (usageData) => {
    const report = {
      totalComponents: Object.keys(usageData).length,
      mostUsed: null,
      leastUsed: null,
      averageComplexity: 0,
      recommendations: []
    };
    
    const sortedUsage = Object.entries(usageData)
      .sort(([,a], [,b]) => b.count - a.count);
    
    if (sortedUsage.length > 0) {
      report.mostUsed = sortedUsage[0];
      report.leastUsed = sortedUsage[sortedUsage.length - 1];
    }
    
    const complexityScores = Object.keys(usageData).map(name => {
      const metadata = COMPONENT_METADATA[name];
      return {
        low: 1,
        medium: 2,
        high: 3,
        'very-high': 4
      }[metadata?.complexity] || 2;
    });
    
    report.averageComplexity = complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length;
    
    // Generate recommendations
    if (report.averageComplexity > 2.5) {
      report.recommendations.push('Consider simplifying component complexity');
    }
    
    if (report.mostUsed && report.mostUsed[1].count > report.totalComponents * 0.7) {
      report.recommendations.push('Consider optimizing the most used component');
    }
    
    return report;
  }
};

// Enable debugging in development
if (process.env.NODE_ENV === 'development') {
  DevUtils.enableDebugging(true);
}

export default {
  // Components
  DeleteLeaveFormCore,
  DeleteLeaveFormValidationSummary,
  
  // Metadata and utilities
  COMPONENT_METADATA,
  USAGE_PATTERNS,
  LAYOUT_CONFIGURATIONS,
  PerformanceMonitor,
  ComponentComposer,
  DevUtils
};
