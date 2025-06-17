import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person,
  ContactPhone,
  Work,
  Security,
  AccountCircle
} from '@mui/icons-material';

/**
 * FormProgress Component
 * 
 * Visual progress indicator for multi-step forms with:
 * - Step navigation
 * - Progress bar
 * - Current step highlighting
 * - Mobile-responsive design
 * - Accessibility support
 */
const FormProgress = ({
  currentStep = 1,
  totalSteps = 5,
  progress = 0,
  isLoading = false,
  showSteps = true,
  showPercentage = true,
  orientation = 'horizontal'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Define step configurations
  const stepConfigs = [
    {
      label: 'Personal Info',
      icon: <Person />,
      description: 'Basic personal details'
    },
    {
      label: 'Contact',
      icon: <ContactPhone />,
      description: 'Contact information'
    },
    {
      label: 'Employment',
      icon: <Work />,
      description: 'Job details'
    },
    {
      label: 'Security',
      icon: <Security />,
      description: 'Login credentials'
    },
    {
      label: 'Profile',
      icon: <AccountCircle />,
      description: 'Profile setup'
    }
  ];

  // Calculate actual progress percentage
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  const displayProgress = progress || progressPercentage;

  // Get step status
  const getStepStatus = (stepIndex) => {
    const stepNumber = stepIndex + 1;
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'pending';
  };

  // Custom step icon component
  const StepIcon = ({ stepIndex, status }) => {
    const config = stepConfigs[stepIndex];
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isCompleted
            ? theme.palette.success.main
            : isActive
            ? theme.palette.primary.main
            : theme.palette.action.disabled,
          color: isCompleted || isActive
            ? theme.palette.common.white
            : theme.palette.text.secondary,
          transition: 'all 0.3s ease',
          border: isActive
            ? `3px solid ${theme.palette.primary.light}`
            : 'none',
          ...(isActive && {
            boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`
          })
        }}
      >
        {config?.icon || <Person />}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Step {currentStep} of {totalSteps}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {displayProgress}% complete
            </Typography>
          )}
        </Box>

        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant={isLoading ? 'indeterminate' : 'determinate'}
            value={isLoading ? undefined : displayProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.action.hover,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: theme.palette.primary.main,
                transition: 'transform 0.4s ease'
              }
            }}
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'transparent',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: `${theme.palette.secondary.main}60`
                }
              }}
            />
          )}
        </Box>
      </Box>

      {/* Step Navigation */}
      {showSteps && !isMobile && (
        <Stepper
          activeStep={currentStep - 1}
          orientation={orientation}
          sx={{
            '& .MuiStepConnector-root': {
              top: 20,
              left: 'calc(-50% + 20px)',
              right: 'calc(50% + 20px)',
              '& .MuiStepConnector-line': {
                borderColor: theme.palette.divider,
                borderTopWidth: 2
              }
            },
            '& .MuiStepConnector-active .MuiStepConnector-line': {
              borderColor: theme.palette.primary.main
            },
            '& .MuiStepConnector-completed .MuiStepConnector-line': {
              borderColor: theme.palette.success.main
            }
          }}
        >
          {stepConfigs.slice(0, totalSteps).map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <StepIcon stepIndex={index} status={status} />
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: status === 'active' ? 600 : 400,
                      color: status === 'active'
                        ? theme.palette.primary.main
                        : status === 'completed'
                        ? theme.palette.success.main
                        : theme.palette.text.secondary,
                      mt: 1
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: status === 'active' ? 600 : 400,
                        color: status === 'active'
                          ? theme.palette.primary.main
                          : status === 'completed'
                          ? theme.palette.success.main
                          : theme.palette.text.secondary
                      }}
                    >
                      {step.label}
                    </Typography>
                    {!isMobile && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: theme.palette.text.secondary,
                          fontSize: '0.75rem',
                          mt: 0.5
                        }}
                      >
                        {step.description}
                      </Typography>
                    )}
                  </Box>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      )}

      {/* Mobile Step Indicator */}
      {showSteps && isMobile && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mt: 2
          }}
        >
          {stepConfigs.slice(0, totalSteps).map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <Box
                key={step.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: status === 'pending' ? 0.5 : 1
                }}
              >
                <StepIcon stepIndex={index} status={status} />
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: status === 'active' ? 600 : 400,
                    color: status === 'active'
                      ? theme.palette.primary.main
                      : status === 'completed'
                      ? theme.palette.success.main
                      : theme.palette.text.secondary
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default FormProgress;
