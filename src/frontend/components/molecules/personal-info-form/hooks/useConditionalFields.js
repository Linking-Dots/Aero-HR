/**
 * useConditionalFields Hook
 * 
 * Custom hook for managing conditional field visibility based on form data.
 * Specifically handles marital status-dependent fields.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * useConditionalFields Hook
 */
export const useConditionalFields = ({
  formData = {},
  config = {},
  onFieldUpdate = () => {}
}) => {
  // State for tracking visible fields
  const [visibleFields, setVisibleFields] = useState({});

  /**
   * Determine if a field should be visible based on dependencies
   */
  const shouldShowField = useCallback((fieldName) => {
    // Get field configuration
    const fieldConfig = getFieldConfig(fieldName);
    if (!fieldConfig || !fieldConfig.dependsOn) {
      return true; // Show field if no dependencies
    }

    const dependentValue = formData[fieldConfig.dependsOn];
    const showWhenValues = fieldConfig.showWhen || [];

    return showWhenValues.includes(dependentValue);
  }, [formData]);

  /**
   * Get field configuration from config
   */
  const getFieldConfig = useCallback((fieldName) => {
    const fieldGroups = Object.values(config.FIELDS || {});
    for (const group of fieldGroups) {
      if (group[fieldName]) {
        return group[fieldName];
      }
    }
    return null;
  }, [config]);

  /**
   * Update visible fields based on form data changes
   */
  useEffect(() => {
    const newVisibleFields = {};
    
    // Check all fields for visibility
    Object.values(config.FIELDS || {}).forEach(fieldGroup => {
      Object.keys(fieldGroup).forEach(fieldName => {
        newVisibleFields[fieldName] = shouldShowField(fieldName);
      });
    });

    setVisibleFields(newVisibleFields);
  }, [formData, config, shouldShowField]);

  /**
   * Handle field change with conditional logic
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    // Update the field value
    onFieldUpdate(fieldName, value);

    // Apply conditional logic for specific fields
    if (fieldName === 'marital_status' && value === 'single') {
      // Auto-clear spouse and children fields when status changes to single
      const rules = config.BUSINESS_RULES?.maritalStatusRules;
      if (rules && rules.clearOnSingle) {
        rules.clearOnSingle.forEach(dependentField => {
          onFieldUpdate(dependentField, '');
        });
      }
    }
  }, [onFieldUpdate, config]);

  /**
   * Clear dependent fields
   */
  const clearDependentFields = useCallback((fieldNames = []) => {
    fieldNames.forEach(fieldName => {
      onFieldUpdate(fieldName, '');
    });
  }, [onFieldUpdate]);

  /**
   * Get list of conditional fields
   */
  const conditionalFields = useMemo(() => {
    const fields = [];
    
    Object.values(config.FIELDS || {}).forEach(fieldGroup => {
      Object.entries(fieldGroup).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig.dependsOn) {
          fields.push({
            name: fieldName,
            dependsOn: fieldConfig.dependsOn,
            showWhen: fieldConfig.showWhen || [],
            isVisible: shouldShowField(fieldName)
          });
        }
      });
    });

    return fields;
  }, [config, shouldShowField]);

  /**
   * Get dependent fields for a given field
   */
  const getDependentFields = useCallback((fieldName) => {
    return conditionalFields.filter(field => field.dependsOn === fieldName);
  }, [conditionalFields]);

  /**
   * Check if any conditional fields are currently visible
   */
  const hasVisibleConditionalFields = useMemo(() => {
    return conditionalFields.some(field => field.isVisible);
  }, [conditionalFields]);

  /**
   * Get summary of conditional field states
   */
  const getConditionalFieldSummary = useMemo(() => {
    const summary = {
      total: conditionalFields.length,
      visible: conditionalFields.filter(field => field.isVisible).length,
      hidden: conditionalFields.filter(field => !field.isVisible).length
    };

    return summary;
  }, [conditionalFields]);

  /**
   * Validate conditional field dependencies
   */
  const validateConditionalFields = useCallback(() => {
    const errors = [];
    
    conditionalFields.forEach(field => {
      const dependentValue = formData[field.dependsOn];
      
      // Check if dependent field has a value but dependency is not met
      if (formData[field.name] && !field.isVisible) {
        errors.push({
          field: field.name,
          message: `${field.name} should be cleared when ${field.dependsOn} is "${dependentValue}"`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [conditionalFields, formData]);

  return {
    // State
    visibleFields,
    conditionalFields,
    
    // Field visibility
    shouldShowField,
    hasVisibleConditionalFields,
    
    // Field actions
    handleFieldChange,
    clearDependentFields,
    
    // Field utilities
    getFieldConfig,
    getDependentFields,
    getConditionalFieldSummary,
    validateConditionalFields
  };
};
