/**
 * Emergency Contact Analytics Hook
 * 
 * Advanced analytics hook for tracking emergency contact form interactions,
 * user behavior, completion rates, and performance metrics.
 * 
 * @version 1.0.0
 * @author glassERP Development Team
 * @since 2025-06-17
 * 
 * Standards Compliance:
 * - ISO 25010 (Software Quality)
 * - ISO 27001 (Information Security)
 * - ISO 9001 (Quality Management)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FORM_CONFIG, RELATIONSHIP_TYPES } from '../config.js';

export const useEmergencyContactAnalytics = (formValues, formErrors, isSubmitting) => {
  const [analytics, setAnalytics] = useState({
    sessionData: {
      startTime: Date.now(),
      endTime: null,
      totalDuration: 0,
      interactions: 0,
      formSubmissions: 0,
      validationAttempts: 0
    },
    
    formCompletion: {
      primaryContact: {
        completeness: 0,
        completedFields: [],
        totalFields: 3
      },
      secondaryContact: {
        completeness: 0,
        completedFields: [],
        totalFields: 3
      },
      overallCompleteness: 0,
      progressHistory: []
    },
    
    fieldInteractions: {
      focusEvents: {},
      changeEvents: {},
      errorEvents: {},
      timeSpent: {},
      lastInteraction: null
    },
    
    errorAnalytics: {
      totalErrors: 0,
      errorsByField: {},
      errorsByType: {},
      errorResolutionTime: {},
      persistentErrors: []
    },
    
    userBehavior: {
      mostEditedField: null,
      preferredContactType: null,
      relationshipChoices: [],
      phoneFormatPreference: null,
      editingPatterns: []
    },
    
    performanceMetrics: {
      averageFieldCompletionTime: {},
      formLoadTime: Date.now(),
      renderTime: 0,
      validationTime: 0,
      submissionTime: 0
    }
  });

  // Track form interactions
  const trackInteraction = useCallback((type, field, data = {}) => {
    setAnalytics(prev => ({
      ...prev,
      sessionData: {
        ...prev.sessionData,
        interactions: prev.sessionData.interactions + 1
      },
      fieldInteractions: {
        ...prev.fieldInteractions,
        [type]: {
          ...prev.fieldInteractions[type],
          [field]: (prev.fieldInteractions[type][field] || 0) + 1
        },
        lastInteraction: {
          type,
          field,
          timestamp: Date.now(),
          ...data
        }
      }
    }));
  }, []);

  // Track field focus
  const trackFieldFocus = useCallback((fieldName) => {
    trackInteraction('focusEvents', fieldName);
    
    // Start timing for this field
    setAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        timeSpent: {
          ...prev.fieldInteractions.timeSpent,
          [fieldName]: {
            startTime: Date.now(),
            totalTime: prev.fieldInteractions.timeSpent[fieldName]?.totalTime || 0
          }
        }
      }
    }));
  }, [trackInteraction]);

  // Track field blur
  const trackFieldBlur = useCallback((fieldName) => {
    setAnalytics(prev => {
      const currentFieldTime = prev.fieldInteractions.timeSpent[fieldName];
      if (!currentFieldTime?.startTime) return prev;

      const sessionTime = Date.now() - currentFieldTime.startTime;
      const totalTime = currentFieldTime.totalTime + sessionTime;

      return {
        ...prev,
        fieldInteractions: {
          ...prev.fieldInteractions,
          timeSpent: {
            ...prev.fieldInteractions.timeSpent,
            [fieldName]: {
              startTime: null,
              totalTime
            }
          }
        },
        performanceMetrics: {
          ...prev.performanceMetrics,
          averageFieldCompletionTime: {
            ...prev.performanceMetrics.averageFieldCompletionTime,
            [fieldName]: totalTime
          }
        }
      };
    });
  }, []);

  // Track field changes
  const trackFieldChange = useCallback((fieldName, newValue, oldValue) => {
    trackInteraction('changeEvents', fieldName, { newValue: newValue?.substring?.(0, 20), oldValue: oldValue?.substring?.(0, 20) });
    
    // Track relationship choices
    if (fieldName.includes('relationship')) {
      setAnalytics(prev => ({
        ...prev,
        userBehavior: {
          ...prev.userBehavior,
          relationshipChoices: [
            ...prev.userBehavior.relationshipChoices,
            {
              field: fieldName,
              value: newValue,
              timestamp: Date.now()
            }
          ].slice(-10) // Keep last 10 choices
        }
      }));
    }

    // Track phone format preferences
    if (fieldName.includes('phone') && newValue) {
      const hasCountryCode = newValue.startsWith('+91') || newValue.startsWith('91');
      const hasSpaces = newValue.includes(' ');
      const hasDashes = newValue.includes('-');
      
      setAnalytics(prev => ({
        ...prev,
        userBehavior: {
          ...prev.userBehavior,
          phoneFormatPreference: {
            hasCountryCode,
            hasSpaces,
            hasDashes,
            lastUsed: Date.now()
          }
        }
      }));
    }
  }, [trackInteraction]);

  // Track errors
  const trackError = useCallback((fieldName, error) => {
    trackInteraction('errorEvents', fieldName, { error });
    
    setAnalytics(prev => ({
      ...prev,
      errorAnalytics: {
        ...prev.errorAnalytics,
        totalErrors: prev.errorAnalytics.totalErrors + 1,
        errorsByField: {
          ...prev.errorAnalytics.errorsByField,
          [fieldName]: (prev.errorAnalytics.errorsByField[fieldName] || 0) + 1
        },
        errorsByType: {
          ...prev.errorAnalytics.errorsByType,
          [error]: (prev.errorAnalytics.errorsByType[error] || 0) + 1
        }
      }
    }));
  }, [trackInteraction]);

  // Calculate form completion metrics
  const calculateCompletion = useCallback(() => {
    const primaryFields = ['emergency_contact_primary_name', 'emergency_contact_primary_relationship', 'emergency_contact_primary_phone'];
    const secondaryFields = ['emergency_contact_secondary_name', 'emergency_contact_secondary_relationship', 'emergency_contact_secondary_phone'];
    
    const primaryCompleted = primaryFields.filter(field => 
      formValues[field] && formValues[field].trim() !== ''
    );
    
    const secondaryCompleted = secondaryFields.filter(field => 
      formValues[field] && formValues[field].trim() !== ''
    );
    
    const primaryCompleteness = Math.round((primaryCompleted.length / primaryFields.length) * 100);
    const secondaryCompleteness = Math.round((secondaryCompleted.length / secondaryFields.length) * 100);
    
    // Overall completeness considers primary as required, secondary as optional
    const totalRequired = primaryFields.length;
    const totalOptional = secondaryFields.length;
    const totalCompleted = primaryCompleted.length + (secondaryCompleted.length > 0 ? secondaryCompleted.length : 0);
    const totalPossible = secondaryCompleted.length > 0 ? totalRequired + totalOptional : totalRequired;
    const overallCompleteness = Math.round((totalCompleted / totalPossible) * 100);

    return {
      primaryContact: {
        completeness: primaryCompleteness,
        completedFields: primaryCompleted,
        totalFields: primaryFields.length
      },
      secondaryContact: {
        completeness: secondaryCompleteness,
        completedFields: secondaryCompleted,
        totalFields: secondaryFields.length
      },
      overallCompleteness
    };
  }, [formValues]);

  // Update completion metrics when form values change
  useEffect(() => {
    const completion = calculateCompletion();
    
    setAnalytics(prev => ({
      ...prev,
      formCompletion: {
        ...completion,
        progressHistory: [
          ...prev.formCompletion.progressHistory,
          {
            timestamp: Date.now(),
            completeness: completion.overallCompleteness
          }
        ].slice(-20) // Keep last 20 progress updates
      }
    }));
  }, [formValues, calculateCompletion]);

  // Analyze user behavior patterns
  const analyzeBehavior = useMemo(() => {
    const { fieldInteractions, userBehavior } = analytics;
    
    // Find most edited field
    const changeEvents = fieldInteractions.changeEvents || {};
    const mostEditedField = Object.keys(changeEvents).reduce((a, b) => 
      changeEvents[a] > changeEvents[b] ? a : b, null
    );
    
    // Determine preferred contact type (primary vs secondary)
    const primaryInteractions = Object.keys(changeEvents).filter(key => 
      key.includes('primary')
    ).reduce((sum, key) => sum + changeEvents[key], 0);
    
    const secondaryInteractions = Object.keys(changeEvents).filter(key => 
      key.includes('secondary')
    ).reduce((sum, key) => sum + changeEvents[key], 0);
    
    const preferredContactType = primaryInteractions >= secondaryInteractions ? 'primary' : 'secondary';
    
    // Analyze relationship choices
    const relationshipChoices = userBehavior.relationshipChoices || [];
    const mostChosenRelationship = relationshipChoices.reduce((acc, choice) => {
      acc[choice.value] = (acc[choice.value] || 0) + 1;
      return acc;
    }, {});
    
    return {
      mostEditedField,
      preferredContactType,
      mostChosenRelationship: Object.keys(mostChosenRelationship).reduce((a, b) => 
        mostChosenRelationship[a] > mostChosenRelationship[b] ? a : b, null
      ),
      editingPatterns: {
        totalEdits: Object.values(changeEvents).reduce((sum, count) => sum + count, 0),
        uniqueFieldsEdited: Object.keys(changeEvents).length,
        averageEditsPerField: Object.keys(changeEvents).length > 0 
          ? Object.values(changeEvents).reduce((sum, count) => sum + count, 0) / Object.keys(changeEvents).length 
          : 0
      }
    };
  }, [analytics]);

  // Performance insights
  const performanceInsights = useMemo(() => {
    const { performanceMetrics, fieldInteractions } = analytics;
    const timeSpent = fieldInteractions.timeSpent || {};
    
    const insights = {
      slowestField: null,
      fastestField: null,
      totalFormTime: Date.now() - performanceMetrics.formLoadTime,
      averageFieldTime: 0,
      fields: {}
    };
    
    const fieldTimes = Object.keys(timeSpent).map(field => ({
      field,
      time: timeSpent[field].totalTime
    })).filter(item => item.time > 0);
    
    if (fieldTimes.length > 0) {
      fieldTimes.sort((a, b) => b.time - a.time);
      insights.slowestField = fieldTimes[0];
      insights.fastestField = fieldTimes[fieldTimes.length - 1];
      insights.averageFieldTime = fieldTimes.reduce((sum, item) => sum + item.time, 0) / fieldTimes.length;
      
      fieldTimes.forEach(item => {
        insights.fields[item.field] = {
          time: item.time,
          percentage: Math.round((item.time / insights.totalFormTime) * 100)
        };
      });
    }
    
    return insights;
  }, [analytics]);

  // Error insights
  const errorInsights = useMemo(() => {
    const { errorAnalytics } = analytics;
    
    return {
      totalErrors: errorAnalytics.totalErrors,
      mostProblematicField: Object.keys(errorAnalytics.errorsByField).reduce((a, b) => 
        errorAnalytics.errorsByField[a] > errorAnalytics.errorsByField[b] ? a : b, null
      ),
      mostCommonError: Object.keys(errorAnalytics.errorsByType).reduce((a, b) => 
        errorAnalytics.errorsByType[a] > errorAnalytics.errorsByType[b] ? a : b, null
      ),
      errorRate: analytics.sessionData.interactions > 0 
        ? Math.round((errorAnalytics.totalErrors / analytics.sessionData.interactions) * 100)
        : 0
    };
  }, [analytics]);

  // Get completion percentage for progress indicators
  const getCompletionPercentage = useCallback((section = 'overall') => {
    if (section === 'primary') {
      return analytics.formCompletion.primaryContact.completeness;
    } else if (section === 'secondary') {
      return analytics.formCompletion.secondaryContact.completeness;
    }
    return analytics.formCompletion.overallCompleteness;
  }, [analytics.formCompletion]);

  // Track form submission
  const trackSubmission = useCallback((success = true, errors = {}) => {
    setAnalytics(prev => ({
      ...prev,
      sessionData: {
        ...prev.sessionData,
        formSubmissions: prev.sessionData.formSubmissions + 1,
        endTime: Date.now(),
        totalDuration: Date.now() - prev.sessionData.startTime
      },
      performanceMetrics: {
        ...prev.performanceMetrics,
        submissionTime: Date.now()
      }
    }));

    if (!success && Object.keys(errors).length > 0) {
      Object.keys(errors).forEach(field => {
        trackError(field, errors[field]);
      });
    }
  }, [trackError]);

  // Reset analytics
  const resetAnalytics = useCallback(() => {
    setAnalytics({
      sessionData: {
        startTime: Date.now(),
        endTime: null,
        totalDuration: 0,
        interactions: 0,
        formSubmissions: 0,
        validationAttempts: 0
      },
      formCompletion: {
        primaryContact: { completeness: 0, completedFields: [], totalFields: 3 },
        secondaryContact: { completeness: 0, completedFields: [], totalFields: 3 },
        overallCompleteness: 0,
        progressHistory: []
      },
      fieldInteractions: {
        focusEvents: {},
        changeEvents: {},
        errorEvents: {},
        timeSpent: {},
        lastInteraction: null
      },
      errorAnalytics: {
        totalErrors: 0,
        errorsByField: {},
        errorsByType: {},
        errorResolutionTime: {},
        persistentErrors: []
      },
      userBehavior: {
        mostEditedField: null,
        preferredContactType: null,
        relationshipChoices: [],
        phoneFormatPreference: null,
        editingPatterns: []
      },
      performanceMetrics: {
        averageFieldCompletionTime: {},
        formLoadTime: Date.now(),
        renderTime: 0,
        validationTime: 0,
        submissionTime: 0
      }
    });
  }, []);

  return {
    // Analytics data
    analytics,
    analyzeBehavior,
    performanceInsights,
    errorInsights,
    
    // Tracking functions
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackError,
    trackSubmission,
    
    // Utility functions
    getCompletionPercentage,
    resetAnalytics
  };
};

export default useEmergencyContactAnalytics;
