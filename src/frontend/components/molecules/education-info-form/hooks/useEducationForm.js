/**
 * Education Form Management Hook
 * 
 * Custom hook for managing education form state, validation, and submission
 * Following React best practices and ISO standards
 * 
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { educationFormConfig } from '../config.js';
import { educationFormValidationSchema, transformEducationData } from '../validation.js';

/**
 * Main education form management hook
 */
export const useEducationForm = (initialData = {}) => {
  // Extract user and initial educations
  const { user, onSuccess, onError } = initialData;
  const initialEducations = user?.educations || [educationFormConfig.defaultEducationEntry];

  // Form state management
  const [educationList, setEducationList] = useState(initialEducations);
  const [dataChanged, setDataChanged] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalEducations] = useState(user?.educations || []);

  // Form validation hook
  const {
    validateField,
    validateForm,
    clearFieldError,
    fieldErrors
  } = useFormValidation(educationFormValidationSchema);

  /**
   * Handle changes to education entries
   */
  const handleEducationChange = useCallback((index, field, value) => {
    setEducationList(prevList => {
      const updatedList = [...prevList];
      updatedList[index] = { ...updatedList[index], [field]: value };
      
      // Clear field-specific errors
      if (fieldErrors[`educations.${index}.${field}`]) {
        clearFieldError(`educations.${index}.${field}`);
      }
      
      return updatedList;
    });

    // Real-time field validation
    validateField(`educations.${index}.${field}`, value);
  }, [fieldErrors, clearFieldError, validateField]);

  /**
   * Check if data has changed from original
   */
  const checkDataChanged = useCallback(() => {
    const changedEducations = educationList.filter((entry, i) => {
      const originalEntry = originalEducations[i] || {};
      
      // Check if this is a new entry or modified existing entry
      const hasChanged = (
        !originalEntry.id ||
        entry.institution !== (originalEntry.institution || '') ||
        entry.subject !== (originalEntry.subject || '') ||
        entry.degree !== (originalEntry.degree || '') ||
        entry.starting_date !== (originalEntry.starting_date || '') ||
        entry.complete_date !== (originalEntry.complete_date || '') ||
        entry.grade !== (originalEntry.grade || '')
      );

      // Check if reverted to original value
      const hasReverted = (
        originalEntry.id &&
        entry.institution === (originalEntry.institution || '') &&
        entry.subject === (originalEntry.subject || '') &&
        entry.degree === (originalEntry.degree || '') &&
        entry.starting_date === (originalEntry.starting_date || '') &&
        entry.complete_date === (originalEntry.complete_date || '') &&
        entry.grade === (originalEntry.grade || '')
      );

      return hasChanged && !hasReverted;
    });

    const hasChanges = changedEducations.length > 0;
    setDataChanged(hasChanges);
    
    return { hasChanges, changedEducations };
  }, [educationList, originalEducations]);

  /**
   * Add new education entry
   */
  const handleAddMore = useCallback(() => {
    if (educationList.length < educationFormConfig.businessRules.maxEntries) {
      setEducationList(prev => [...prev, { ...educationFormConfig.defaultEducationEntry }]);
    }
  }, [educationList.length]);

  /**
   * Remove education entry
   */
  const handleEducationRemove = useCallback(async (index) => {
    const removedEducation = educationList[index];
    
    // If it's an existing education record, call delete API
    if (removedEducation.id) {
      return await deleteEducationRecord(removedEducation.id, index);
    } else {
      // Just remove from local state for new entries
      const updatedList = educationList.filter((_, i) => i !== index);
      setEducationList(updatedList.length > 0 ? updatedList : [educationFormConfig.defaultEducationEntry]);
      return { success: true, message: 'Education record removed' };
    }
  }, [educationList]);

  /**
   * Delete education record from server
   */
  const deleteEducationRecord = useCallback(async (educationId, index) => {
    try {
      setProcessing(true);
      
      const response = await fetch(educationFormConfig.api.endpoints.delete, {
        method: educationFormConfig.api.methods.delete,
        headers: {
          ...educationFormConfig.api.headers,
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ 
          id: educationId, 
          user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with server response
        if (data.educations) {
          setEducationList(data.educations.length > 0 ? data.educations : [educationFormConfig.defaultEducationEntry]);
        } else {
          // Remove from local state
          const updatedList = educationList.filter((_, i) => i !== index);
          setEducationList(updatedList.length > 0 ? updatedList : [educationFormConfig.defaultEducationEntry]);
        }

        onSuccess?.(data.message || 'Education record deleted successfully');
        return { success: true, data };
      } else {
        setErrors(data.errors || {});
        const errorMessage = data.error || 'Failed to delete education record';
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred while deleting education record';
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  }, [educationList, user?.id, onSuccess, onError]);

  /**
   * Submit education form
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    try {
      setProcessing(true);
      setErrors({});

      // Validate form data
      const formData = { educations: educationList, user_id: user?.id };
      const validation = await validateForm(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        onError?.('Please correct the highlighted fields and try again');
        return { success: false, errors: validation.errors };
      }

      // Transform and sanitize data
      const transformedData = transformEducationData(formData);

      // Prepare education entries for submission
      const educationsForSubmission = transformedData.educations.map(entry => ({
        ...entry,
        user_id: user.id
      }));

      const response = await fetch(educationFormConfig.api.endpoints.update, {
        method: educationFormConfig.api.methods.update,
        headers: {
          ...educationFormConfig.api.headers,
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ educations: educationsForSubmission }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with server response
        if (data.educations) {
          setEducationList(data.educations);
        }

        setDataChanged(false);
        
        const messages = Array.isArray(data.messages) ? data.messages : [data.message || 'Education records updated successfully'];
        onSuccess?.(messages);
        
        return { success: true, data, messages };
      } else {
        setErrors(data.errors || {});
        const errorMessage = data.error || 'Failed to update education records';
        onError?.(errorMessage);
        return { success: false, error: errorMessage, errors: data.errors };
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred while updating education records';
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  }, [educationList, user?.id, validateForm, onSuccess, onError]);

  /**
   * Reset form to original state
   */
  const resetForm = useCallback(() => {
    setEducationList(originalEducations.length > 0 ? originalEducations : [educationFormConfig.defaultEducationEntry]);
    setDataChanged(false);
    setErrors({});
  }, [originalEducations]);

  /**
   * Check if form can be submitted
   */
  const canSubmit = useMemo(() => {
    return dataChanged && !processing && educationList.length > 0;
  }, [dataChanged, processing, educationList.length]);

  /**
   * Check if more education entries can be added
   */
  const canAddMore = useMemo(() => {
    return educationList.length < educationFormConfig.businessRules.maxEntries;
  }, [educationList.length]);

  /**
   * Get form summary statistics
   */
  const formStats = useMemo(() => {
    return {
      totalEducations: educationList.length,
      maxEducations: educationFormConfig.businessRules.maxEntries,
      changedEducations: educationList.filter((entry, i) => {
        const original = originalEducations[i] || {};
        return JSON.stringify(entry) !== JSON.stringify(original);
      }).length,
      hasErrors: Object.keys(errors).length > 0 || Object.keys(fieldErrors).length > 0
    };
  }, [educationList, originalEducations, errors, fieldErrors]);

  // Update data changed status when education list changes
  useEffect(() => {
    checkDataChanged();
  }, [educationList, checkDataChanged]);

  return {
    // Form data
    educationList,
    dataChanged,
    processing,
    errors: { ...errors, ...fieldErrors },
    
    // Form actions
    handleEducationChange,
    handleAddMore,
    handleEducationRemove,
    handleSubmit,
    resetForm,
    
    // Form state
    canSubmit,
    canAddMore,
    formStats,
    
    // Utilities
    validateField,
    clearFieldError
  };
};

export default useEducationForm;
