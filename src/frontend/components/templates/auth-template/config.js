/**
 * @fileoverview Authentication Template Configuration
 * @description Centralized configuration for authentication template
 * 
 * @version 1.0.0
 * @since 2024-12-19
 */

// Authentication template configuration
export const AUTH_TEMPLATE_CONFIG = {
  // Template metadata
  templateId: 'auth-template',
  version: '1.0.0',
  category: 'authentication',
  
  // Layout configuration
  layout: {
    maxWidth: {
      mobile: '100%',
      tablet: 480,
      desktop: 520
    },
    spacing: {
      mobile: 2,
      tablet: 4,
      desktop: 6
    },
    borderRadius: 16,
    elevation: 8
  },

  // Authentication types configuration
  authTypes: {
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account to continue',
      icon: 'login',
      features: ['email', 'password', 'remember', 'forgot'],
      socialLogin: true,
      redirectOnSuccess: '/dashboard'
    },
    register: {
      title: 'Create Account',
      subtitle: 'Join us to get started with your journey',
      icon: 'person_add',
      features: ['name', 'email', 'password', 'confirm', 'terms'],
      socialLogin: true,
      redirectOnSuccess: '/verify-email'
    },
    reset: {
      title: 'Reset Password',
      subtitle: 'Enter your email to receive reset instructions',
      icon: 'lock_reset',
      features: ['email'],
      socialLogin: false,
      redirectOnSuccess: '/login'
    },
    verify: {
      title: 'Verify Email',
      subtitle: 'Check your email for verification code',
      icon: 'mark_email_read',
      features: ['code', 'resend'],
      socialLogin: false,
      redirectOnSuccess: '/dashboard'
    },
    'two-factor': {
      title: 'Two-Factor Authentication',
      subtitle: 'Enter the code from your authenticator app',
      icon: 'security',
      features: ['code', 'backup'],
      socialLogin: false,
      redirectOnSuccess: '/dashboard'
    },
    social: {
      title: 'Social Login',
      subtitle: 'Continue with your preferred social account',
      icon: 'account_circle',
      features: ['providers'],
      socialLogin: true,
      redirectOnSuccess: '/dashboard'
    }
  },

  // Glass morphism design configuration
  glassStyle: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    // Performance optimizations
    contain: 'layout style paint',
    willChange: 'backdrop-filter',
    transform: 'translateZ(0)'
  },

  // Background configurations
  backgrounds: {
    default: {
      type: 'gradient',
      colors: ['primary.main', 'secondary.main'],
      direction: '135deg',
      opacity: 0.1
    },
    corporate: {
      type: 'pattern',
      pattern: 'dots',
      color: 'primary.main',
      opacity: 0.05
    },
    minimal: {
      type: 'solid',
      color: 'background.default',
      opacity: 1
    }
  },

  // Animation configuration
  animations: {
    enabled: true,
    duration: {
      fast: 0.2,
      normal: 0.3,
      slow: 0.6
    },
    easing: {
      default: [0.25, 0.46, 0.45, 0.94],
      bounce: [0.68, -0.55, 0.265, 1.55],
      smooth: [0.4, 0, 0.2, 1]
    },
    variants: {
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      },
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 }
      }
    }
  },

  // Security configuration
  security: {
    enableCSRF: true,
    enableRateLimit: true,
    sessionTimeout: 30, // minutes
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    twoFactorEnabled: true,
    socialLoginProviders: ['google', 'github', 'microsoft']
  },

  // Accessibility configuration
  accessibility: {
    enableHighContrast: true,
    enableReducedMotion: true,
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    focusManagement: true,
    ariaLabels: {
      authForm: 'Authentication form',
      submitButton: 'Submit authentication form',
      socialLogin: 'Sign in with social provider',
      forgotPassword: 'Reset password link',
      togglePassword: 'Toggle password visibility'
    }
  },

  // Performance configuration
  performance: {
    enableLazyLoading: true,
    enablePreloading: true,
    cacheStrategy: 'stale-while-revalidate',
    bundleSizeLimit: 50000, // 50KB
    renderTimeTarget: 16, // ms (60fps)
    metrics: {
      trackLoadTime: true,
      trackInteractionTime: true,
      trackErrorRate: true,
      trackConversionRate: true
    }
  },

  // Analytics configuration
  analytics: {
    enabled: true,
    gdprCompliant: true,
    trackingEvents: {
      templateLoad: 'auth.template.load',
      formSubmit: 'auth.form.submit',
      socialLogin: 'auth.social.login',
      errorOccurred: 'auth.error.occurred',
      conversionComplete: 'auth.conversion.complete'
    },
    userBehavior: {
      trackFieldFocus: true,
      trackFieldBlur: true,
      trackFormProgress: true,
      trackErrorRecovery: true
    }
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 600,
    tablet: 960,
    desktop: 1280,
    wide: 1920
  },

  // Theme integration
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    glassTint: 'rgba(255, 255, 255, 0.1)',
    glassBlur: '20px'
  },

  // Feature flags
  features: {
    enableSocialLogin: true,
    enableTwoFactor: true,
    enablePasswordStrength: true,
    enableRememberMe: true,
    enableAccountLockout: true,
    enableAuditLog: true,
    enableBiometric: false, // Future feature
    enableSSO: false // Future feature
  },

  // Error handling
  errorHandling: {
    showDetailedErrors: false, // Only in development
    maxRetryAttempts: 3,
    retryDelay: 1000, // ms
    fallbackMessage: 'An unexpected error occurred. Please try again.',
    errorCategories: {
      network: 'Network connection error',
      validation: 'Please check your input',
      authentication: 'Invalid credentials',
      authorization: 'Access denied',
      server: 'Server error occurred'
    }
  },

  // Localization support
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'ja'],
    rtlSupport: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  }
};

// Default props for template components
export const AUTH_TEMPLATE_DEFAULTS = {
  authType: 'login',
  enableAnalytics: true,
  enableAnimations: true,
  enableAccessibility: true,
  securityLevel: 'standard',
  theme: 'default'
};

// Validation schemas for configuration
export const AUTH_TEMPLATE_VALIDATION = {
  authType: ['login', 'register', 'reset', 'verify', 'two-factor', 'social'],
  variant: ['mobile', 'tablet', 'desktop'],
  securityLevel: ['basic', 'standard', 'enhanced', 'enterprise'],
  theme: ['default', 'corporate', 'minimal', 'dark']
};

// Export types for TypeScript
export const AUTH_TEMPLATE_TYPES = {
  AuthType: 'login | register | reset | verify | two-factor | social',
  Variant: 'mobile | tablet | desktop',
  SecurityLevel: 'basic | standard | enhanced | enterprise',
  Theme: 'default | corporate | minimal | dark'
};
