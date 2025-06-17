// filepath: src/frontend/components/molecules/picnic-participant-form/hooks/usePicnicParticipantForm.js

/**
 * usePicnicParticipantForm Hook
 * 
 * Core form state management for picnic participant forms
 * Handles form data, validation states, team assignments, and payment tracking
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { generateRandomNumber } from '@/shared/utils/numberUtils';
import { PICNIC_PARTICIPANT_CONFIG } from '../config';
import { validateField, validateForm } from '../validation';

export const usePicnicParticipantForm = (initialData = {}, options = {}) => {
  const {
    autoSave = true,
    autoGenerateNumber = true,
    teamBalancing = true,
    validateOnChange = true,
    onDataChange,
    onValidationChange,
    onTeamChange
  } = options;

  // Form data state
  const [formData, setFormData] = useState(() => ({
    name: '',
    team: '',
    phone: '',
    random_number: autoGenerateNumber ? generateRandomNumber(4) : '',
    payment_amount: PICNIC_PARTICIPANT_CONFIG.payment.defaultAmount,
    ...initialData
  }));

  // Form states
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [changeHistory, setChangeHistory] = useState([]);
  
  // Team-related states
  const [teamCounts, setTeamCounts] = useState({});
  const [availableTeams, setAvailableTeams] = useState(
    PICNIC_PARTICIPANT_CONFIG.fields.team.options
  );
  
  // Payment-related states
  const [paymentValidation, setPaymentValidation] = useState({
    isValid: true,
    discountApplied: null,
    finalAmount: formData.payment_amount
  });

  // Auto-save functionality
  const autoSaveData = useCallback(async () => {
    if (!autoSave || !isDirty) return;
    
    try {
      // Simulate auto-save to localStorage
      const saveData = {
        formData,
        timestamp: new Date().toISOString(),
        version: PICNIC_PARTICIPANT_CONFIG.version
      };
      
      localStorage.setItem('picnic_participant_draft', JSON.stringify(saveData));
      setLastSaved(new Date());
      
      // Call external save handler if provided
      if (onDataChange) {
        await onDataChange(formData, { type: 'auto-save' });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [formData, isDirty, autoSave, onDataChange]);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(autoSaveData, 2000); // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timer);
  }, [autoSaveData]);

  // Form field update handler
  const updateField = useCallback(async (fieldName, value, options = {}) => {
    const { skipValidation = false, silent = false } = options;
    
    // Store previous value for history
    const previousValue = formData[fieldName];
    
    // Update form data
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    if (!silent) {
      setIsDirty(true);
      
      // Add to change history
      setChangeHistory(prev => [...prev, {
        field: fieldName,
        oldValue: previousValue,
        newValue: value,
        timestamp: new Date().toISOString()
      }]);
    }

    // Handle special field logic
    if (fieldName === 'team' && onTeamChange) {
      onTeamChange(value, previousValue);
    }

    // Auto-generate random number if team changes
    if (fieldName === 'team' && autoGenerateNumber && !formData.random_number) {
      setFormData(prev => ({
        ...prev,
        random_number: generateRandomNumber(4)
      }));
    }

    // Validate field if enabled
    if (validateOnChange && !skipValidation) {
      try {
        const validation = await validateField(fieldName, value, newFormData);
        if (onValidationChange) {
          onValidationChange(fieldName, validation);
        }
      } catch (error) {
        console.error('Validation error:', error);
      }
    }

    // Call external change handler
    if (onDataChange && !silent) {
      onDataChange(newFormData, { 
        field: fieldName, 
        oldValue: previousValue, 
        newValue: value 
      });
    }
  }, [formData, validateOnChange, onDataChange, onValidationChange, onTeamChange, autoGenerateNumber]);

  // Bulk update handler
  const updateFields = useCallback((updates, options = {}) => {
    const { skipValidation = false } = options;
    
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    setIsDirty(true);
    
    // Add bulk change to history
    setChangeHistory(prev => [...prev, {
      field: 'bulk_update',
      changes: updates,
      timestamp: new Date().toISOString()
    }]);

    if (onDataChange) {
      onDataChange(newFormData, { type: 'bulk_update', changes: updates });
    }
  }, [formData, onDataChange]);

  // Generate new random number
  const generateNewRandomNumber = useCallback(() => {
    const newNumber = generateRandomNumber(4);
    updateField('random_number', newNumber, { silent: true });
    return newNumber;
  }, [updateField]);

  // Reset form
  const resetForm = useCallback((newInitialData = {}) => {
    const resetData = {
      name: '',
      team: '',
      phone: '',
      random_number: autoGenerateNumber ? generateRandomNumber(4) : '',
      payment_amount: PICNIC_PARTICIPANT_CONFIG.payment.defaultAmount,
      ...newInitialData
    };
    
    setFormData(resetData);
    setIsDirty(false);
    setChangeHistory([]);
    setLastSaved(null);
    
    if (onDataChange) {
      onDataChange(resetData, { type: 'reset' });
    }
  }, [autoGenerateNumber, onDataChange]);

  // Validate entire form
  const validateAllFields = useCallback(async () => {
    try {
      const validation = await validateForm(formData);
      if (onValidationChange) {
        onValidationChange('form', validation);
      }
      return validation;
    } catch (error) {
      console.error('Form validation error:', error);
      return { valid: false, errors: { general: 'Validation failed' } };
    }
  }, [formData, onValidationChange]);

  // Submit handler
  const handleSubmit = useCallback(async (submitOptions = {}) => {
    const { skipValidation = false, additionalData = {} } = submitOptions;
    
    setIsSubmitting(true);
    
    try {
      // Validate if not skipped
      if (!skipValidation) {
        const validation = await validateAllFields();
        if (!validation.valid) {
          throw new Error('Form validation failed');
        }
      }
      
      // Prepare submission data
      const submissionData = {
        ...formData,
        ...additionalData,
        submitted_at: new Date().toISOString(),
        change_history: changeHistory
      };
      
      return submissionData;
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, additionalData, changeHistory, validateAllFields]);

  // Form statistics
  const formStats = useMemo(() => {
    const totalFields = Object.keys(PICNIC_PARTICIPANT_CONFIG.fields).length;
    const completedFields = Object.values(formData).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    
    return {
      totalFields,
      completedFields,
      completionPercentage: Math.round((completedFields / totalFields) * 100),
      isDirty,
      isSubmitting,
      lastSaved,
      hasChanges: changeHistory.length > 0
    };
  }, [formData, isDirty, isSubmitting, lastSaved, changeHistory]);

  // Team balancing suggestions
  const teamSuggestions = useMemo(() => {
    if (!teamBalancing) return null;
    
    // Find least populated team
    const sortedTeams = Object.entries(teamCounts)
      .sort(([,a], [,b]) => a - b)
      .map(([team]) => team);
    
    return {
      recommended: sortedTeams[0],
      alternatives: sortedTeams.slice(1, 3),
      balanceScore: calculateTeamBalance(teamCounts)
    };
  }, [teamCounts, teamBalancing]);

  // Calculate team balance (helper function)
  const calculateTeamBalance = (counts) => {
    const values = Object.values(counts);
    if (values.length === 0) return 100;
    
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    const maxPossibleRange = Math.max(...values) + 1;
    
    return Math.max(0, Math.round((1 - range / maxPossibleRange) * 100));
  };

  return {
    // Form data
    formData,
    
    // Form state
    isDirty,
    isSubmitting,
    lastSaved,
    changeHistory,
    
    // Form actions
    updateField,
    updateFields,
    resetForm,
    generateNewRandomNumber,
    handleSubmit,
    validateAllFields,
    
    // Team management
    teamCounts,
    availableTeams,
    teamSuggestions,
    
    // Payment handling
    paymentValidation,
    
    // Statistics and metadata
    formStats,
    
    // Configuration
    config: PICNIC_PARTICIPANT_CONFIG
  };
};

export default usePicnicParticipantForm;
