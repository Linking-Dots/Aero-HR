import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Alert,
  AlertDescription,
  Badge,
  Separator,
  ScrollArea
} from '@/components/ui';
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  Download,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { DailyWorksUploadFormCore } from './components/DailyWorksUploadFormCore.jsx';
import { DailyWorksUploadFormValidationSummary } from './components/DailyWorksUploadFormValidationSummary.jsx';
import { useCompleteDailyWorksUploadForm } from './hooks/useCompleteDailyWorksUploadForm.js';

/**
 * Main DailyWorksUploadForm component with dialog interface
 * 
 * Features:
 * - Dialog-based upload interface
 * - Multi-step workflow
 * - Comprehensive validation
 * - Analytics integration
 * - Progress tracking
 * - Enterprise-grade file upload
 */
export const DailyWorksUploadForm = ({
  // Dialog control
  isOpen = false,
  onOpenChange,
  
  // Form configuration
  config = {},
  
  // Event handlers
  onUploadComplete,
  onUploadError,
  onValidationChange,
  onStepChange,
  
  // Styling
  className = '',
  
  // Advanced options
  enableAnalytics = true,
  enableValidationSummary = true,
  enableAutoSave = true,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  allowedFileTypes = ['.xlsx', '.xls', '.csv', '.pdf'],
  
  // Authentication & permissions
  userPermissions = {},
  
  // Custom validation rules
  customValidationRules = {},
  
  // API configuration
  uploadEndpoint = '/api/daily-works/upload',
  validateEndpoint = '/api/daily-works/validate'
}) => {
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [autoSaveNotification, setAutoSaveNotification] = useState(false);

  // Initialize the complete form hook
  const {
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
    canProceed,
    progressPercentage,
    
    // Form operations
    openForm,
    closeForm,
    submitForm,
    cancelUpload,
    resetForm,
    
    // Progress management
    restoreProgress,
    clearSavedProgress,
    
    // File operations
    uploadedFiles,
    parsedData,
    addFiles,
    removeFile,
    clearFiles,
    
    // Form data
    form,
    
    // Validation
    validation,
    errors,
    fileErrors,
    dataErrors,
    hasErrors,
    
    // Analytics
    analytics,
    getAnalyticsReport,
    trackCustomEvent
  } = useCompleteDailyWorksUploadForm({
    ...config,
    enableAnalytics,
    autoSave: enableAutoSave,
    maxFileSize,
    allowedFileTypes,
    uploadEndpoint,
    validateEndpoint,
    customValidationRules,
    userPermissions,
    
    // Event handlers
    onComplete: handleUploadComplete,
    onError: handleUploadError,
    onValidationChange: handleValidationChange,
    onStepChange: handleStepChange,
    onAutoSave: handleAutoSave
  });

  // Sync dialog state
  useEffect(() => {
    if (isOpen && !isFormOpen) {
      openForm();
    } else if (!isOpen && isFormOpen) {
      closeForm();
    }
  }, [isOpen, isFormOpen, openForm, closeForm]);

  // Handle upload completion
  function handleUploadComplete(results) {
    trackCustomEvent('upload_complete', 'success', results.processedRecords);
    
    if (onUploadComplete) {
      onUploadComplete(results);
    }
    
    // Show success notification
    setTimeout(() => {
      if (results.success) {
        // Auto-close dialog after successful upload
        if (onOpenChange) {
          onOpenChange(false);
        }
      }
    }, 2000);
  }

  // Handle upload error
  function handleUploadError(error) {
    trackCustomEvent('upload_error', 'error', error.message);
    
    if (onUploadError) {
      onUploadError(error);
    }
  }

  // Handle validation changes
  function handleValidationChange(isValid, validationErrors) {
    if (onValidationChange) {
      onValidationChange(isValid, validationErrors);
    }
  }

  // Handle step changes
  function handleStepChange(fromStep, toStep) {
    if (onStepChange) {
      onStepChange(fromStep, toStep);
    }
  }

  // Handle auto-save
  function handleAutoSave() {
    setAutoSaveNotification(true);
    setTimeout(() => setAutoSaveNotification(false), 3000);
  }

  // Check for saved progress on open
  useEffect(() => {
    if (isOpen && enableAutoSave) {
      const hasRestored = restoreProgress();
      if (hasRestored) {
        setAutoSaveNotification(true);
        setTimeout(() => setAutoSaveNotification(false), 5000);
      }
    }
  }, [isOpen, enableAutoSave, restoreProgress]);

  // Handle dialog close
  const handleDialogClose = () => {
    const canClose = closeForm();
    if (canClose && onOpenChange) {
      onOpenChange(false);
    }
  };

  // Get current step info
  const stepInfo = getCurrentStepInfo();

  // Handle form reset
  const handleReset = () => {
    resetForm();
    clearSavedProgress();
    setShowValidationSummary(false);
    trackCustomEvent('form_reset', 'action');
  };

  // Export validation report
  const handleExportValidationReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      validation: {
        errors,
        fileErrors,
        dataErrors,
        summary: validation.validationState
      },
      analytics: getAnalyticsReport(),
      files: uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    trackCustomEvent('export_report', 'download');
  };

  // Toggle validation summary
  const toggleValidationSummary = () => {
    setShowValidationSummary(!showValidationSummary);
    trackCustomEvent('validation_summary', showValidationSummary ? 'hide' : 'show');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className={`max-w-6xl max-h-[90vh] ${className}`}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl">Daily Works Upload</DialogTitle>
                <DialogDescription>
                  Upload and process daily work data files with validation and tracking
                </DialogDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Status indicators */}
                {isProcessing && (
                  <Badge variant="secondary" className="animate-pulse">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Processing
                  </Badge>
                )}
                
                {hasErrors && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {Object.keys(errors).length + Object.keys(fileErrors).length + Object.keys(dataErrors).length} Errors
                  </Badge>
                )}
                
                {!hasErrors && uploadedFiles.length > 0 && (
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                )}

                {/* Action buttons */}
                {enableValidationSummary && (hasErrors || validation.validationState.hasErrors) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleValidationSummary}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {showValidationSummary ? 'Hide' : 'Show'} Summary
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isProcessing}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress and notifications */}
            <div className="space-y-2">
              {/* Auto-save notification */}
              {autoSaveNotification && (
                <Alert className="py-2">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Progress saved automatically
                  </AlertDescription>
                </Alert>
              )}

              {/* Upload completion notification */}
              {uploadResults && (
                <Alert variant={uploadResults.success ? 'default' : 'destructive'}>
                  {uploadResults.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {uploadResults.success 
                      ? `Upload completed successfully! ${uploadResults.processedRecords || 0} records processed.`
                      : `Upload failed: ${uploadResults.error || 'Unknown error'}`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </DialogHeader>

          {/* Help section */}
          {showHelp && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Upload Process</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">Supported Files:</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Excel files (.xlsx, .xls)</li>
                    <li>• CSV files (.csv)</li>
                    <li>• PDF files (.pdf)</li>
                    <li>• Maximum size: 50MB per file</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Required Columns:</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Date (YYYY-MM-DD format)</li>
                    <li>• Work Type</li>
                    <li>• Location</li>
                    <li>• Quantity</li>
                  </ul>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Follow the multi-step process to upload your files. Each step validates your data 
                to ensure accuracy before final submission.
              </p>
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 min-h-0">
            {showValidationSummary ? (
              <ScrollArea className="h-full">
                <DailyWorksUploadFormValidationSummary
                  errors={errors}
                  fileErrors={fileErrors}
                  dataErrors={dataErrors}
                  validationState={validation.validationState}
                  uploadedFiles={uploadedFiles}
                  parsedData={parsedData}
                  analytics={analytics.analytics}
                  onValidateField={validation.validateField}
                  onValidateForm={validation.validateForm}
                  onClearErrors={validation.clearErrors}
                  onExportReport={handleExportValidationReport}
                />
              </ScrollArea>
            ) : (
              <ScrollArea className="h-full">
                <DailyWorksUploadFormCore
                  // Form state
                  currentStep={currentStep}
                  isProcessing={isProcessing}
                  processingStatus={processingStatus}
                  uploadResults={uploadResults}
                  completionState={completionState}
                  
                  // Files and data
                  uploadedFiles={uploadedFiles}
                  parsedData={parsedData}
                  
                  // Validation
                  errors={errors}
                  fileErrors={fileErrors}
                  dataErrors={dataErrors}
                  hasErrors={hasErrors}
                  
                  // Step management
                  steps={steps}
                  getCurrentStepInfo={getCurrentStepInfo}
                  goToNextStep={goToNextStep}
                  goToPreviousStep={goToPreviousStep}
                  canProceed={canProceed}
                  
                  // File operations
                  addFiles={addFiles}
                  removeFile={removeFile}
                  clearFiles={clearFiles}
                  
                  // Form operations
                  submitForm={submitForm}
                  cancelUpload={cancelUpload}
                  resetForm={handleReset}
                  
                  // Form data
                  formData={form.formData}
                  updateFormData={form.updateFormData}
                  
                  // Analytics
                  trackCustomEvent={trackCustomEvent}
                  
                  // Configuration
                  config={config}
                />
              </ScrollArea>
            )}
          </div>

          {/* Footer with statistics */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Files: {uploadedFiles.length}</span>
                <span>•</span>
                <span>Records: {parsedData.reduce((sum, data) => sum + (data?.length || 0), 0)}</span>
                <span>•</span>
                <span>Step: {currentStep + 1}/{steps.length}</span>
                {enableAnalytics && analytics.getSessionDuration && (
                  <>
                    <span>•</span>
                    <span>Session: {Math.floor(analytics.getSessionDuration() / 1000)}s</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {enableAnalytics && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const report = getAnalyticsReport();
                      console.log('Analytics Report:', report);
                      trackCustomEvent('analytics_view', 'action');
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleDialogClose}>
                  {isProcessing ? 'Minimize' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyWorksUploadForm;
