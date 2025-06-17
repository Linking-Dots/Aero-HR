import { useState, useEffect, useCallback, useRef } from 'react';
import { useDailyWorksUploadForm } from './useDailyWorksUploadForm.js';
import { useDailyWorksUploadFormValidation } from './useDailyWorksUploadFormValidation.js';
import { useDailyWorksUploadFormAnalytics } from './useDailyWorksUploadFormAnalytics.js';

/**
 * Complete integration hook for DailyWorksUploadForm
 * 
 * Features:
 * - Unified state management
 * - Coordinated validation and analytics
 * - Multi-step workflow orchestration
 * - Comprehensive error handling
 * - Enterprise-grade upload processing
 * - Real-time progress tracking
 */
export const useCompleteDailyWorksUploadForm = (config = {}) => {
  // Integration state
  const [currentStep, setCurrentStep] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [uploadResults, setUploadResults] = useState(null);

  // Form completion tracking
  const [completionState, setCompletionState] = useState({
    isComplete: false,
    completedSteps: [],
    skippedSteps: [],
    totalFiles: 0,
    processedFiles: 0,
    successfulFiles: 0,
    failedFiles: []
  });

  // Integration refs
  const integrationRef = useRef({
    uploadStartTime: null,
    lastStepChange: Date.now(),
    processingQueue: [],
    abortController: null
  });

  // Initialize core hooks
  const formHook = useDailyWorksUploadForm({
    ...config,
    onFileProcessed: (file, result) => {
      handleFileProcessed(file, result);
      analyticsHook.trackFileProcessing(file, Date.now() - integrationRef.current.uploadStartTime, result.success ? 'success' : 'error');
    },
    onValidationChange: (isValid, errors) => {
      handleValidationChange(isValid, errors);
    },
    onUploadProgress: (progress) => {
      handleUploadProgress(progress);
    }
  });

  const validationHook = useDailyWorksUploadFormValidation(
    formHook.formData,
    formHook.uploadedFiles,
    formHook.parsedData,
    currentStep
  );

  const analyticsHook = useDailyWorksUploadFormAnalytics({
    ...config.analytics,
    sessionConfig: {
      trackFileOperations: true,
      trackValidation: true,
      trackStepNavigation: true,
      trackErrors: true
    }
  }, config.enableAnalytics !== false);

  // Step management
  const steps = [
    {
      id: 0,
      name: 'file-selection',
      title: 'Select Files',
      description: 'Choose files to upload',
      isRequired: true,
      canSkip: false
    },
    {
      id: 1,
      name: 'data-preview',
      title: 'Preview Data',
      description: 'Review and validate file contents',
      isRequired: true,
      canSkip: false
    },
    {
      id: 2,
      name: 'configuration',
      title: 'Configure Upload',
      description: 'Set upload preferences and mapping',
      isRequired: false,
      canSkip: true
    },
    {
      id: 3,
      name: 'confirmation',
      title: 'Confirm Upload',
      description: 'Final review before processing',
      isRequired: true,
      canSkip: false
    }
  ];

  // Handle file processing
  const handleFileProcessed = useCallback((file, result) => {
    setCompletionState(prev => ({
      ...prev,
      processedFiles: prev.processedFiles + 1,
      successfulFiles: result.success ? prev.successfulFiles + 1 : prev.successfulFiles,
      failedFiles: result.success ? prev.failedFiles : [...prev.failedFiles, { file, error: result.error }]
    }));

    // Update processing status
    setProcessingStatus(`Processed ${completionState.processedFiles + 1} of ${completionState.totalFiles} files`);
  }, [completionState.processedFiles, completionState.totalFiles]);

  // Handle validation changes
  const handleValidationChange = useCallback((isValid, errors) => {
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        analyticsHook.trackError('validation', { message: error, field });
      });
    }
  }, [analyticsHook]);

  // Handle upload progress
  const handleUploadProgress = useCallback((progress) => {
    analyticsHook.trackUploadProgress(progress.fileIndex, progress.percentage, progress.speed);
    
    if (progress.percentage === 100) {
      setProcessingStatus('Upload complete, processing files...');
    } else {
      setProcessingStatus(`Uploading... ${Math.round(progress.percentage)}%`);
    }
  }, [analyticsHook]);

  // Step navigation
  const goToNextStep = useCallback(async () => {
    if (currentStep >= steps.length - 1) return false;

    // Validate current step
    const stepValidation = await validationHook.validateStep(currentStep);
    if (!stepValidation.isValid) {
      analyticsHook.trackError('navigation', { 
        message: 'Step validation failed', 
        step: currentStep,
        errors: stepValidation.errors 
      });
      return false;
    }

    const nextStep = currentStep + 1;
    
    // Track step navigation
    analyticsHook.trackStepNavigation(currentStep, nextStep, 'next');
    
    setCurrentStep(nextStep);
    setCompletionState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, currentStep]
    }));

    integrationRef.current.lastStepChange = Date.now();
    return true;
  }, [currentStep, steps.length, validationHook, analyticsHook]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep <= 0) return false;

    const previousStep = currentStep - 1;
    
    // Track step navigation
    analyticsHook.trackStepNavigation(currentStep, previousStep, 'previous');
    
    setCurrentStep(previousStep);
    integrationRef.current.lastStepChange = Date.now();
    return true;
  }, [currentStep, analyticsHook]);

  const goToStep = useCallback(async (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return false;
    if (stepIndex === currentStep) return true;

    // Validate intermediate steps if moving forward
    if (stepIndex > currentStep) {
      for (let i = currentStep; i < stepIndex; i++) {
        const stepValidation = await validationHook.validateStep(i);
        if (!stepValidation.isValid && !steps[i].canSkip) {
          analyticsHook.trackError('navigation', { 
            message: 'Cannot skip required step with validation errors', 
            step: i 
          });
          return false;
        }
      }
    }

    // Track step navigation
    analyticsHook.trackStepNavigation(currentStep, stepIndex, 'direct');
    
    setCurrentStep(stepIndex);
    integrationRef.current.lastStepChange = Date.now();
    return true;
  }, [currentStep, steps, validationHook, analyticsHook]);

  // Form submission
  const submitForm = useCallback(async () => {
    setIsProcessing(true);
    setProcessingStatus('Preparing upload...');
    integrationRef.current.uploadStartTime = Date.now();

    try {
      // Final validation
      const finalValidation = await validationHook.validateForm();
      if (!finalValidation.isValid) {
        throw new Error('Form validation failed');
      }

      // Set up abort controller for cancellation
      integrationRef.current.abortController = new AbortController();

      // Initialize completion tracking
      setCompletionState(prev => ({
        ...prev,
        totalFiles: formHook.uploadedFiles.length,
        processedFiles: 0,
        successfulFiles: 0,
        failedFiles: []
      }));

      // Process upload
      const result = await formHook.processUpload({
        abortSignal: integrationRef.current.abortController.signal,
        onProgress: handleUploadProgress,
        onFileProcessed: handleFileProcessed
      });

      // Handle results
      setUploadResults(result);
      setCompletionState(prev => ({
        ...prev,
        isComplete: true,
        completedSteps: [...prev.completedSteps, currentStep]
      }));

      // Track completion
      analyticsHook.trackCompletion(
        result.success, 
        currentStep, 
        result.successfulFiles || 0
      );

      setProcessingStatus(result.success ? 'Upload completed successfully!' : 'Upload completed with errors');
      
      return result;
    } catch (error) {
      analyticsHook.trackError('upload', error);
      setProcessingStatus(`Upload failed: ${error.message}`);
      
      setCompletionState(prev => ({
        ...prev,
        isComplete: false
      }));

      throw error;
    } finally {
      setIsProcessing(false);
      integrationRef.current.abortController = null;
    }
  }, [formHook, validationHook, analyticsHook, currentStep, handleUploadProgress, handleFileProcessed]);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (integrationRef.current.abortController) {
      integrationRef.current.abortController.abort();
    }
    
    setIsProcessing(false);
    setProcessingStatus('Upload cancelled');
    
    analyticsHook.trackCompletion(false, currentStep);
  }, [analyticsHook, currentStep]);

  // Reset form
  const resetForm = useCallback(() => {
    formHook.resetForm();
    setCurrentStep(0);
    setIsProcessing(false);
    setProcessingStatus('');
    setUploadResults(null);
    setCompletionState({
      isComplete: false,
      completedSteps: [],
      skippedSteps: [],
      totalFiles: 0,
      processedFiles: 0,
      successfulFiles: 0,
      failedFiles: []
    });

    validationHook.clearErrors();
  }, [formHook, validationHook]);

  // Open/close form
  const openForm = useCallback(() => {
    setIsFormOpen(true);
    analyticsHook.trackFieldInteraction('form', 'open');
  }, [analyticsHook]);

  const closeForm = useCallback(() => {
    if (isProcessing) {
      const confirmClose = window.confirm('Upload in progress. Are you sure you want to close?');
      if (!confirmClose) return false;
      
      cancelUpload();
    }

    setIsFormOpen(false);
    analyticsHook.trackFieldInteraction('form', 'close');
    
    // Track abandonment if not completed
    if (!completionState.isComplete) {
      analyticsHook.trackCompletion(false, currentStep);
    }

    return true;
  }, [isProcessing, completionState.isComplete, currentStep, cancelUpload, analyticsHook]);

  // Get current step info
  const getCurrentStepInfo = useCallback(() => {
    const step = steps[currentStep];
    const isStepValid = completionState.completedSteps.includes(currentStep) || 
                       validationHook.validationState.isValid;
    
    return {
      ...step,
      isValid: isStepValid,
      canProceed: isStepValid || step.canSkip,
      isFirst: currentStep === 0,
      isLast: currentStep === steps.length - 1,
      progress: ((currentStep + 1) / steps.length) * 100
    };
  }, [currentStep, steps, completionState.completedSteps, validationHook.validationState.isValid]);

  // Auto-save progress (if enabled)
  useEffect(() => {
    if (config.autoSave && formHook.formData) {
      const saveData = {
        step: currentStep,
        formData: formHook.formData,
        timestamp: Date.now()
      };
      
      localStorage.setItem('dailyWorksUpload_autoSave', JSON.stringify(saveData));
    }
  }, [currentStep, formHook.formData, config.autoSave]);

  // Restore auto-saved progress
  const restoreProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem('dailyWorksUpload_autoSave');
      if (saved) {
        const { step, formData, timestamp } = JSON.parse(saved);
        
        // Only restore if less than 24 hours old
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          formHook.updateFormData(formData);
          setCurrentStep(step);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to restore progress:', error);
    }
    
    return false;
  }, [formHook]);

  // Clear auto-saved progress
  const clearSavedProgress = useCallback(() => {
    localStorage.removeItem('dailyWorksUpload_autoSave');
  }, []);

  return {
    // Form state
    isFormOpen,
    currentStep,
    isProcessing,
    processingStatus,
    uploadResults,
    completionState,
    
    // Step management
    steps,
    getCurrentStepInfo,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    
    // Form operations
    openForm,
    closeForm,
    submitForm,
    cancelUpload,
    resetForm,
    
    // Progress management
    restoreProgress,
    clearSavedProgress,
    
    // Delegated hooks
    form: formHook,
    validation: validationHook,
    analytics: analyticsHook,
    
    // Computed state
    canProceed: getCurrentStepInfo().canProceed && !isProcessing,
    isStepValid: getCurrentStepInfo().isValid,
    progressPercentage: getCurrentStepInfo().progress,
    
    // File operations (delegated)
    uploadedFiles: formHook.uploadedFiles,
    parsedData: formHook.parsedData,
    addFiles: formHook.addFiles,
    removeFile: formHook.removeFile,
    clearFiles: formHook.clearFiles,
    
    // Validation (delegated)
    errors: validationHook.errors,
    fileErrors: validationHook.fileErrors,
    dataErrors: validationHook.dataErrors,
    hasErrors: validationHook.validationState.hasErrors,
    
    // Analytics (delegated)
    getAnalyticsReport: analyticsHook.generateReport,
    trackCustomEvent: analyticsHook.trackFieldInteraction
  };
};

export default useCompleteDailyWorksUploadForm;
