/**
 * @fileoverview Authentication Template - Main Layout
 * @description Enterprise-grade authentication template with glass morphism design
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author glassERP Development Team
 * 
 * @compliance
 * - ISO 25010: Usability, accessibility, performance efficiency
 * - ISO 27001: Authentication security, session management
 * - WCAG 2.1 AA: Full accessibility compliance
 * 
 * @features
 * - Glass morphism design system integration
 * - Responsive layout for all device sizes
 * - Multi-step authentication flow support
 * - Social login integration points
 * - Security-focused UI patterns
 * - Accessibility-first design
 */

import React, { Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Template components
import AuthTemplateHeader from './AuthTemplateHeader';
import AuthTemplateFooter from './AuthTemplateFooter';
import AuthTemplateCard from './AuthTemplateCard';

// Hooks and utilities
import { useAuthTemplate } from './hooks/useAuthTemplate';
import { usePerformanceProfiler } from '@shared/hooks/usePerformanceProfiler';
import { AUTH_TEMPLATE_CONFIG } from './config';

/**
 * Authentication Template Component
 * 
 * Provides the main layout structure for all authentication pages
 * including login, register, password reset, and verification flows.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Authentication form content
 * @param {string} props.title - Page title for accessibility
 * @param {string} props.subtitle - Page subtitle/description
 * @param {string} props.authType - Type of authentication (login/register/reset/verify)
 * @param {boolean} props.isLoading - Loading state for async operations
 * @param {Object} props.backgroundConfig - Background customization options
 * @param {Function} props.onAuthSuccess - Callback for successful authentication
 * @param {Function} props.onAuthError - Callback for authentication errors
 * @param {boolean} props.enableAnalytics - Enable performance and user analytics
 */
const AuthTemplate = ({
  children,
  title = 'Authentication',
  subtitle = '',
  authType = 'login',
  isLoading = false,
  backgroundConfig = {},
  onAuthSuccess,
  onAuthError,
  enableAnalytics = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // Performance profiling
  usePerformanceProfiler('AuthTemplate', enableAnalytics);
  
  // Template state and configuration
  const {
    templateState,
    handleAuthFlow,
    securityMetrics,
    accessibilityState
  } = useAuthTemplate({
    authType,
    onSuccess: onAuthSuccess,
    onError: onAuthError,
    enableAnalytics
  });

  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);

  // Template initialization
  useEffect(() => {
    const initializeTemplate = async () => {
      try {
        // Preload critical resources
        await Promise.all([
          // Preload authentication scripts
          import('@features/authentication'),
          // Initialize security context
          securityMetrics.initialize(),
          // Setup accessibility features
          accessibilityState.initialize()
        ]);
        
        setIsTemplateLoaded(true);
        
        if (enableAnalytics) {
          // Track template load performance
          const loadTime = performance.now();
          analytics.track('auth.template.load', {
            authType,
            loadTime,
            deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
          });
        }
      } catch (error) {
        console.error('Auth template initialization failed:', error);
        onAuthError?.(error);
      }
    };

    initializeTemplate();
  }, [authType, enableAnalytics, isMobile, isTablet]);

  // Template variants for different screen sizes
  const templateVariants = {
    mobile: {
      container: {
        padding: theme.spacing(2),
        minHeight: '100vh'
      },
      card: {
        maxWidth: '100%',
        margin: 0
      }
    },
    tablet: {
      container: {
        padding: theme.spacing(4),
        minHeight: '100vh'
      },
      card: {
        maxWidth: 480,
        margin: '0 auto'
      }
    },
    desktop: {
      container: {
        padding: theme.spacing(6),
        minHeight: '100vh'
      },
      card: {
        maxWidth: 520,
        margin: '0 auto'
      }
    }
  };

  const currentVariant = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  const styles = templateVariants[currentVariant];

  // Glass morphism background styles
  const backgroundStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.1)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
      ${alpha(theme.palette.primary.dark, 0.1)} 100%
    )`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: -1,
    ...backgroundConfig
  };

  // Animation variants
  const animationVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <LinearProgress 
        sx={{ 
          width: '200px',
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            background: `linear-gradient(90deg, 
              ${theme.palette.primary.main}, 
              ${theme.palette.secondary.main}
            )`
          }
        }} 
      />
      <Typography 
        variant="body2" 
        sx={{ 
          color: theme.palette.text.secondary,
          fontWeight: 500
        }}
      >
        Loading authentication...
      </Typography>
    </Box>
  );

  // Error boundary fallback
  if (templateState.hasError) {
    return (
      <Box sx={backgroundStyles}>
        <Container maxWidth="sm" sx={styles.container}>
          <AuthTemplateCard
            title="Authentication Error"
            subtitle="An error occurred while loading the authentication system."
            authType="error"
            variant={currentVariant}
          >
            <Typography color="error" align="center">
              {templateState.error?.message || 'Unknown error occurred'}
            </Typography>
          </AuthTemplateCard>
        </Container>
      </Box>
    );
  }

  // Main template render
  return (
    <>
      {/* Glass morphism background */}
      <Box sx={backgroundStyles} />
      
      {/* Skip link for accessibility */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          top: -40,
          left: theme.spacing(2),
          zIndex: 9999,
          padding: theme.spacing(1, 2),
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          textDecoration: 'none',
          borderRadius: 1,
          '&:focus': {
            top: theme.spacing(2)
          }
        }}
      >
        Skip to main content
      </Box>

      {/* Template header */}
      <AuthTemplateHeader
        authType={authType}
        title={title}
        isMobile={isMobile}
        enableAnalytics={enableAnalytics}
      />

      {/* Main content area */}
      <Container 
        maxWidth="lg" 
        sx={styles.container}
        component="main"
        id="main-content"
        role="main"
        aria-label={`${title} page`}
      >
        <AnimatePresence mode="wait">
          {!isTemplateLoaded ? (
            <motion.div
              key="loading"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LoadingFallback />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              <AuthTemplateCard
                title={title}
                subtitle={subtitle}
                authType={authType}
                variant={currentVariant}
                isLoading={isLoading}
                securityLevel={securityMetrics.level}
                accessibilityFeatures={accessibilityState.features}
                enableAnalytics={enableAnalytics}
                sx={styles.card}
                {...props}
              >
                <Suspense fallback={<LoadingFallback />}>
                  {children}
                </Suspense>
              </AuthTemplateCard>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Template footer */}
      <AuthTemplateFooter
        authType={authType}
        isMobile={isMobile}
        securityInfo={securityMetrics.publicInfo}
        enableAnalytics={enableAnalytics}
      />

      {/* Performance monitoring */}
      {enableAnalytics && (
        <Box
          sx={{
            position: 'fixed',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
            zIndex: 1000,
            opacity: process.env.NODE_ENV === 'development' ? 1 : 0,
            pointerEvents: 'none'
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 10 }}>
            Template: {templateState.renderTime}ms
          </Typography>
        </Box>
      )}
    </>
  );
};

AuthTemplate.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  authType: PropTypes.oneOf([
    'login', 
    'register', 
    'reset', 
    'verify', 
    'two-factor',
    'social'
  ]),
  isLoading: PropTypes.bool,
  backgroundConfig: PropTypes.object,
  onAuthSuccess: PropTypes.func,
  onAuthError: PropTypes.func,
  enableAnalytics: PropTypes.bool
};

// Display name for debugging
AuthTemplate.displayName = 'AuthTemplate';

// Memoize for performance
export default React.memo(AuthTemplate);

// Named exports for testing
export {
  AuthTemplateHeader,
  AuthTemplateFooter,
  AuthTemplateCard
};
