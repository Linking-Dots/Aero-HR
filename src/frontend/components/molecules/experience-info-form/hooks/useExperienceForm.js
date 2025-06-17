/**
 * Experience Form Management Hook
 * 
 * Custom hook for managing work experience form state, validation, and submission
 * Following React best practices and ISO standards
 * 
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFormValidation } from '../../../shared/hooks/useFormValidation';
import { experienceFormConfig } from '../config.js';
import { experienceFormValidationSchema, transformExperienceData } from '../validation.js';

/**
 * Main experience form management hook
 */
export const useExperienceForm = (initialData = {}) => {
  // Extract user and initial experiences
  const { user, onSuccess, onError } = initialData;
  const initialExperiences = user?.experiences?.length > 0 ? user.experiences : [experienceFormConfig.defaultExperienceEntry];

  // Form state management
  const [experienceList, setExperienceList] = useState(initialExperiences);
  const [dataChanged, setDataChanged] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalExperiences] = useState(user?.experiences || []);

  // Form validation hook
  const {
    validateField,
    validateForm,
    clearFieldError,
    fieldErrors
  } = useFormValidation(experienceFormValidationSchema);

  /**
   * Handle changes to experience entries
   */
  const handleExperienceChange = useCallback((index, field, value) => {
    setExperienceList(prevList => {
      const updatedList = [...prevList];
      updatedList[index] = { ...updatedList[index], [field]: value };
      
      // Clear field-specific errors
      if (fieldErrors[`experiences.${index}.${field}`]) {
        clearFieldError(`experiences.${index}.${field}`);
      }
      
      return updatedList;
    });

    // Real-time field validation
    validateField(`experiences.${index}.${field}`, value);
  }, [fieldErrors, clearFieldError, validateField]);

  /**
   * Check if data has changed from original
   */
  const checkDataChanged = useCallback(() => {
    const changedExperiences = experienceList.filter((entry, i) => {
      const originalEntry = originalExperiences[i] || {};
      
      // Check if this is a new entry or modified existing entry
      const hasChanged = (
        !originalEntry.id ||
        entry.company_name !== (originalEntry.company_name || '') ||
        entry.location !== (originalEntry.location || '') ||
        entry.job_position !== (originalEntry.job_position || '') ||
        entry.period_from !== (originalEntry.period_from || '') ||
        entry.period_to !== (originalEntry.period_to || '') ||
        entry.description !== (originalEntry.description || '')
      );

      // Check if reverted to original value
      const hasReverted = (
        originalEntry.id &&
        entry.company_name === (originalEntry.company_name || '') &&
        entry.location === (originalEntry.location || '') &&
        entry.job_position === (originalEntry.job_position || '') &&
        entry.period_from === (originalEntry.period_from || '') &&
        entry.period_to === (originalEntry.period_to || '') &&
        entry.description === (originalEntry.description || '')
      );

      return hasChanged && !hasReverted;
    });

    const hasChanges = changedExperiences.length > 0;
    setDataChanged(hasChanges);
    
    return { hasChanges, changedExperiences };
  }, [experienceList, originalExperiences]);

  /**
   * Add new experience entry
   */
  const handleAddMore = useCallback(() => {
    if (experienceList.length < experienceFormConfig.businessRules.maxEntries) {
      setExperienceList(prev => [...prev, { ...experienceFormConfig.defaultExperienceEntry }]);
    }
  }, [experienceList.length]);

  /**
   * Remove experience entry
   */
  const handleExperienceRemove = useCallback(async (index) => {
    const removedExperience = experienceList[index];
    
    // If it's an existing experience record, call delete API
    if (removedExperience.id) {
      return await deleteExperienceRecord(removedExperience.id, index);
    } else {
      // Just remove from local state for new entries
      const updatedList = experienceList.filter((_, i) => i !== index);
      setExperienceList(updatedList.length > 0 ? updatedList : [experienceFormConfig.defaultExperienceEntry]);
      return { success: true, message: 'Experience record removed' };
    }
  }, [experienceList]);

  /**
   * Delete experience record from server
   */
  const deleteExperienceRecord = useCallback(async (experienceId, index) => {
    try {
      setProcessing(true);
      
      const response = await fetch(experienceFormConfig.api.endpoints.delete, {
        method: experienceFormConfig.api.methods.delete,
        headers: {
          ...experienceFormConfig.api.headers,
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ 
          id: experienceId, 
          user_id: user.id 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with server response
        if (data.experiences) {
          setExperienceList(data.experiences.length > 0 ? data.experiences : [experienceFormConfig.defaultExperienceEntry]);
        } else {
          // Remove from local state
          const updatedList = experienceList.filter((_, i) => i !== index);
          setExperienceList(updatedList.length > 0 ? updatedList : [experienceFormConfig.defaultExperienceEntry]);
        }

        onSuccess?.(data.message || 'Experience record deleted successfully');
        return { success: true, data };
      } else {
        setErrors(data.errors || {});
        const errorMessage = data.error || 'Failed to delete experience record';
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred while deleting experience record';
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  }, [experienceList, user?.id, onSuccess, onError]);

  /**
   * Submit experience form
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    try {
      setProcessing(true);
      setErrors({});

      // Validate form data
      const formData = { experiences: experienceList, user_id: user?.id };
      const validation = await validateForm(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        onError?.('Please correct the highlighted fields and try again');
        return { success: false, errors: validation.errors };
      }

      // Transform and sanitize data
      const transformedData = transformExperienceData(formData);

      // Prepare experience entries for submission
      const experiencesForSubmission = transformedData.experiences.map(entry => ({
        ...entry,
        user_id: user.id
      }));

      const response = await fetch(experienceFormConfig.api.endpoints.update, {
        method: experienceFormConfig.api.methods.update,
        headers: {
          ...experienceFormConfig.api.headers,
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ experiences: experiencesForSubmission }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with server response
        if (data.experiences) {
          setExperienceList(data.experiences);
        }

        setDataChanged(false);
        
        const messages = Array.isArray(data.messages) ? data.messages : [data.message || 'Experience records updated successfully'];
        onSuccess?.(messages);
        
        return { success: true, data, messages };
      } else {
        setErrors(data.errors || {});
        const errorMessage = data.error || 'Failed to update experience records';
        onError?.(errorMessage);
        return { success: false, error: errorMessage, errors: data.errors };
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred while updating experience records';
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  }, [experienceList, user?.id, validateForm, onSuccess, onError]);

  /**
   * Reset form to original state
   */
  const resetForm = useCallback(() => {
    setExperienceList(originalExperiences.length > 0 ? originalExperiences : [experienceFormConfig.defaultExperienceEntry]);
    setDataChanged(false);
    setErrors({});
  }, [originalExperiences]);

  /**
   * Check if form can be submitted
   */
  const canSubmit = useMemo(() => {
    return dataChanged && !processing && experienceList.length > 0;
  }, [dataChanged, processing, experienceList.length]);

  /**
   * Check if more experience entries can be added
   */
  const canAddMore = useMemo(() => {
    return experienceList.length < experienceFormConfig.businessRules.maxEntries;
  }, [experienceList.length]);

  /**
   * Get form summary statistics
   */
  const formStats = useMemo(() => {
    return {
      totalExperiences: experienceList.length,
      maxExperiences: experienceFormConfig.businessRules.maxEntries,
      changedExperiences: experienceList.filter((entry, i) => {
        const original = originalExperiences[i] || {};
        return JSON.stringify(entry) !== JSON.stringify(original);
      }).length,
      hasErrors: Object.keys(errors).length > 0 || Object.keys(fieldErrors).length > 0
    };
  }, [experienceList, originalExperiences, errors, fieldErrors]);

  // Update data changed status when experience list changes
  useEffect(() => {
    checkDataChanged();
  }, [experienceList, checkDataChanged]);

  return {
    // Form data
    experienceList,
    dataChanged,
    processing,
    errors: { ...errors, ...fieldErrors },
    
    // Form actions
    handleExperienceChange,
    handleAddMore,
    handleExperienceRemove,
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

export default useExperienceForm;
