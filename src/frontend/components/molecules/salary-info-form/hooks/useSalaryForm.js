/**
 * @fileoverview Custom hook for salary form management
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Provides comprehensive salary form state management with:
 * - Form state management and validation
 * - PF and ESI calculation integration
 * - Auto-save functionality
 * - Business rule enforcement
 * - Indian statutory compliance
 * 
 * Follows ISO 25010 (Software Quality) standards for:
 * - Maintainability through modular hook design
 * - Reliability with error handling and validation
 * - Usability with intuitive state management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { salaryFormConfig } from '../config';
import { salaryFormValidationSchema } from '../validation';
import { usePFCalculation } from './usePFCalculation';
import { useESICalculation } from './useESICalculation';
import { useFormValidation } from './useFormValidation';

/**
 * Custom hook for comprehensive salary form management
 * 
 * @param {Object} options - Configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {Function} options.onSubmit - Form submission handler
 * @param {Function} options.onSave - Auto-save handler
 * @param {boolean} options.autoSave - Enable auto-save functionality
 * @param {number} options.autoSaveDelay - Auto-save delay in milliseconds
 * @param {boolean} options.enableAnalytics - Enable salary analytics
 * @returns {Object} Salary form management interface
 */
export const useSalaryForm = ({
  initialData = {},
  onSubmit,
  onSave,
  autoSave = true,
  autoSaveDelay = salaryFormConfig.autoSave.delay,
  enableAnalytics = true
} = {}) => {
  // Form state management
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      ...salaryFormConfig.defaultValues,
      ...initialData
    },
    validationSchema: salaryFormValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        if (onSubmit) {
          await onSubmit(values);
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          toast.success('Salary information saved successfully');
        }
      } catch (error) {
        console.error('Error submitting salary form:', error);
        toast.error('Failed to save salary information');
      } finally {
        setIsLoading(false);
      }
    }
  });

  // PF calculation hook
  const {
    pfData,
    calculatePFRates,
    validatePFContribution,
    pfErrors
  } = usePFCalculation({
    salaryAmount: formik.values.salaryAmount,
    pfContribution: formik.values.pfContribution,
    pfEmployeeRate: formik.values.pfEmployeeRate,
    pfAdditionalRate: formik.values.pfAdditionalRate
  });

  // ESI calculation hook
  const {
    esiData,
    calculateESIRates,
    validateESIContribution,
    esiErrors
  } = useESICalculation({
    salaryAmount: formik.values.salaryAmount,
    esiContribution: formik.values.esiContribution,
    esiEmployeeRate: formik.values.esiEmployeeRate,
    esiAdditionalRate: formik.values.esiAdditionalRate
  });

  // Form validation hook
  const {
    validateField,
    validateForm,
    getFieldError,
    hasErrors
  } = useFormValidation({
    formik,
    additionalValidators: [
      validatePFContribution,
      validateESIContribution
    ]
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      if (onSave && formik.dirty && !hasErrors()) {
        setIsSaving(true);
        try {
          await onSave(formik.values);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          toast.info('Changes auto-saved');
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, autoSaveDelay);

    return () => clearTimeout(autoSaveTimer);
  }, [autoSave, hasUnsavedChanges, autoSaveDelay, onSave, formik.values, formik.dirty, hasErrors]);

  // Track form changes
  useEffect(() => {
    if (formik.dirty) {
      setHasUnsavedChanges(true);
    }
  }, [formik.dirty]);

  // Update PF rates when relevant fields change
  useEffect(() => {
    if (formik.values.pfContribution) {
      calculatePFRates();
    }
  }, [
    formik.values.pfContribution,
    formik.values.pfEmployeeRate,
    formik.values.pfAdditionalRate,
    calculatePFRates
  ]);

  // Update ESI rates when relevant fields change
  useEffect(() => {
    if (formik.values.esiContribution) {
      calculateESIRates();
    }
  }, [
    formik.values.esiContribution,
    formik.values.esiEmployeeRate,
    formik.values.esiAdditionalRate,
    calculateESIRates
  ]);

  // Salary analytics calculation
  const calculateSalaryAnalytics = useCallback(() => {
    if (!enableAnalytics || !formik.values.salaryAmount) return null;

    const grossSalary = parseFloat(formik.values.salaryAmount) || 0;
    const pfDeduction = pfData?.employeeContribution || 0;
    const esiDeduction = esiData?.employeeContribution || 0;
    const totalDeductions = pfDeduction + esiDeduction;
    const netSalary = grossSalary - totalDeductions;

    const pfEmployerContribution = pfData?.employerContribution || 0;
    const esiEmployerContribution = esiData?.employerContribution || 0;
    const totalEmployerContribution = pfEmployerContribution + esiEmployerContribution;
    const costToCompany = grossSalary + totalEmployerContribution;

    return {
      grossSalary,
      totalDeductions,
      netSalary,
      takeHomePercentage: grossSalary > 0 ? ((netSalary / grossSalary) * 100).toFixed(2) : 0,
      costToCompany,
      employerContribution: totalEmployerContribution,
      pfBreakdown: {
        employee: pfDeduction,
        employer: pfEmployerContribution,
        total: pfDeduction + pfEmployerContribution
      },
      esiBreakdown: {
        employee: esiDeduction,
        employer: esiEmployerContribution,
        total: esiDeduction + esiEmployerContribution
      }
    };
  }, [
    enableAnalytics,
    formik.values.salaryAmount,
    pfData,
    esiData
  ]);

  // Update analytics when relevant data changes
  useEffect(() => {
    if (enableAnalytics) {
      const analytics = calculateSalaryAnalytics();
      setAnalyticsData(analytics);
    }
  }, [enableAnalytics, calculateSalaryAnalytics]);

  // Handle PF contribution toggle
  const handlePFContributionChange = useCallback((enabled) => {
    formik.setFieldValue('pfContribution', enabled);
    if (!enabled) {
      // Clear PF-related fields when disabled
      formik.setFieldValue('pfNumber', '');
      formik.setFieldValue('pfEmployeeRate', salaryFormConfig.businessRules.pf.defaultEmployeeRate);
      formik.setFieldValue('pfAdditionalRate', 0);
    }
  }, [formik]);

  // Handle ESI contribution toggle
  const handleESIContributionChange = useCallback((enabled) => {
    formik.setFieldValue('esiContribution', enabled);
    if (!enabled) {
      // Clear ESI-related fields when disabled
      formik.setFieldValue('esiNumber', '');
      formik.setFieldValue('esiEmployeeRate', salaryFormConfig.businessRules.esi.defaultEmployeeRate);
      formik.setFieldValue('esiAdditionalRate', 0);
    }
  }, [formik]);

  // Handle salary amount formatting
  const handleSalaryAmountChange = useCallback((value) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    const formattedValue = numericValue ? parseFloat(numericValue).toFixed(2) : '';
    formik.setFieldValue('salaryAmount', formattedValue);
  }, [formik]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    formik.resetForm();
    setHasUnsavedChanges(false);
    setLastSaved(null);
    setAnalyticsData(null);
  }, [formik]);

  // Get form data for submission
  const getFormData = useCallback(() => {
    return {
      ...formik.values,
      pfCalculation: pfData,
      esiCalculation: esiData,
      analytics: analyticsData
    };
  }, [formik.values, pfData, esiData, analyticsData]);

  // Consolidated error state
  const formErrors = useMemo(() => ({
    ...formik.errors,
    ...pfErrors,
    ...esiErrors
  }), [formik.errors, pfErrors, esiErrors]);

  return {
    // Form state
    formik,
    isLoading,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    
    // Calculation data
    pfData,
    esiData,
    analyticsData,
    
    // Error states
    errors: formErrors,
    hasErrors: () => Object.keys(formErrors).length > 0,
    
    // Field handlers
    handlePFContributionChange,
    handleESIContributionChange,
    handleSalaryAmountChange,
    
    // Validation methods
    validateField,
    validateForm,
    getFieldError,
    
    // Utility methods
    resetForm,
    getFormData,
    
    // Configuration
    config: salaryFormConfig,
    
    // Status indicators
    isDirty: formik.dirty,
    isValid: formik.isValid && !hasErrors(),
    canSubmit: formik.isValid && !hasErrors() && !isLoading
  };
};

export default useSalaryForm;
