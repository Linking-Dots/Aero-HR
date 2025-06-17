/**
 * Education Progress Tracking Hook
 * 
 * Custom hook for tracking educational progression and validation
 * Provides advanced features for education management
 * 
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { educationFormConfig } from '../config.js';
import { customValidations } from '../validation.js';

/**
 * Hook for managing educational progression and analytics
 */
export const useEducationProgress = (educationList = []) => {
  const [progressAnalysis, setProgressAnalysis] = useState(null);
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);
  const [progressionWarnings, setProgressionWarnings] = useState([]);

  /**
   * Analyze educational progression
   */
  const analyzeProgression = useCallback(async () => {
    if (!educationList.length) {
      setProgressAnalysis(null);
      return;
    }

    try {
      // Sort educations by start date
      const sortedEducations = [...educationList]
        .filter(edu => edu.starting_date)
        .sort((a, b) => a.starting_date.localeCompare(b.starting_date));

      // Calculate timeline
      const timeline = sortedEducations.map((edu, index) => {
        const startYear = parseInt(edu.starting_date.split('-')[0]);
        const endYear = edu.complete_date ? parseInt(edu.complete_date.split('-')[0]) : null;
        const duration = endYear ? endYear - startYear : null;

        return {
          index,
          education: edu,
          startYear,
          endYear,
          duration,
          level: getEducationLevel(edu.degree),
          isOngoing: !edu.complete_date
        };
      });

      // Detect gaps in education
      const gaps = [];
      for (let i = 0; i < timeline.length - 1; i++) {
        const current = timeline[i];
        const next = timeline[i + 1];
        
        if (current.endYear && next.startYear) {
          const gapYears = next.startYear - current.endYear;
          if (gapYears > 1) {
            gaps.push({
              between: [current.index, next.index],
              years: gapYears,
              description: `${gapYears} year gap between ${current.education.degree} and ${next.education.degree}`
            });
          }
        }
      }

      // Validate progression logic
      const progressionValidation = customValidations.validateEducationalProgression(educationList);

      // Calculate education span
      const firstStart = timeline.length > 0 ? timeline[0].startYear : null;
      const lastEnd = timeline.length > 0 ? 
        Math.max(...timeline.map(t => t.endYear || new Date().getFullYear())) : null;
      const totalSpan = (firstStart && lastEnd) ? lastEnd - firstStart : null;

      const analysis = {
        timeline,
        gaps,
        totalEducations: educationList.length,
        completedEducations: educationList.filter(edu => edu.complete_date).length,
        ongoingEducations: educationList.filter(edu => !edu.complete_date).length,
        totalSpan,
        progressionValidation,
        averageDuration: timeline.length > 0 ? 
          timeline.filter(t => t.duration).reduce((sum, t) => sum + t.duration, 0) / 
          timeline.filter(t => t.duration).length : 0,
        highestLevel: Math.max(...timeline.map(t => t.level).filter(l => l >= 0)),
        institutions: [...new Set(educationList.map(edu => edu.institution).filter(Boolean))],
        subjects: [...new Set(educationList.map(edu => edu.subject).filter(Boolean))]
      };

      setProgressAnalysis(analysis);
      setProgressionWarnings(progressionValidation.errors || []);

      return analysis;
    } catch (error) {
      console.error('Error analyzing education progression:', error);
      return null;
    }
  }, [educationList]);

  /**
   * Detect duplicate educations
   */
  const detectDuplicates = useCallback(() => {
    const duplicates = [];
    const seen = new Map();

    educationList.forEach((education, index) => {
      if (!education.institution || !education.degree) return;

      const key = `${education.institution.toLowerCase().trim()}-${education.degree.toLowerCase().trim()}-${education.starting_date || 'no-date'}`;
      
      if (seen.has(key)) {
        duplicates.push({
          indices: [seen.get(key), index],
          education,
          message: `Potential duplicate: ${education.degree} from ${education.institution}`
        });
      } else {
        seen.set(key, index);
      }
    });

    setDuplicateWarnings(duplicates);
    return duplicates;
  }, [educationList]);

  /**
   * Validate education dates
   */
  const validateDates = useCallback(() => {
    const dateErrors = [];
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    educationList.forEach((education, index) => {
      const { starting_date, complete_date } = education;

      // Check for future start dates
      if (starting_date && starting_date > currentMonth) {
        dateErrors.push({
          index,
          field: 'starting_date',
          message: 'Start date cannot be in the future'
        });
      }

      // Check for future completion dates
      if (complete_date && complete_date > currentMonth) {
        dateErrors.push({
          index,
          field: 'complete_date',
          message: 'Completion date cannot be in the future'
        });
      }

      // Check if completion is before start
      if (starting_date && complete_date && complete_date < starting_date) {
        dateErrors.push({
          index,
          field: 'complete_date',
          message: 'Completion date must be after start date'
        });
      }

      // Check for unrealistic duration
      if (starting_date && complete_date) {
        const start = new Date(starting_date + '-01');
        const end = new Date(complete_date + '-01');
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

        if (monthsDiff < 1) {
          dateErrors.push({
            index,
            field: 'complete_date',
            message: 'Education duration is too short (less than 1 month)'
          });
        } else if (monthsDiff > 180) { // 15 years
          dateErrors.push({
            index,
            field: 'complete_date',
            message: 'Education duration seems unrealistic (more than 15 years)'
          });
        }
      }
    });

    return dateErrors;
  }, [educationList]);

  /**
   * Get education completion statistics
   */
  const getCompletionStats = useMemo(() => {
    if (!educationList.length) return null;

    const completed = educationList.filter(edu => edu.complete_date).length;
    const ongoing = educationList.filter(edu => !edu.complete_date && edu.starting_date).length;
    const notStarted = educationList.filter(edu => !edu.starting_date).length;

    return {
      completed,
      ongoing,
      notStarted,
      total: educationList.length,
      completionRate: Math.round((completed / educationList.length) * 100)
    };
  }, [educationList]);

  /**
   * Get subject distribution
   */
  const getSubjectDistribution = useMemo(() => {
    const subjects = educationList
      .map(edu => edu.subject)
      .filter(Boolean)
      .map(subject => subject.toLowerCase().trim());

    const distribution = subjects.reduce((acc, subject) => {
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  }, [educationList]);

  /**
   * Get recommendations for improvement
   */
  const getRecommendations = useMemo(() => {
    const recommendations = [];
    const stats = getCompletionStats;

    if (!stats) return recommendations;

    // Recommendation for incomplete educations
    if (stats.ongoing > 0) {
      recommendations.push({
        type: 'info',
        message: `You have ${stats.ongoing} ongoing education(s). Consider adding completion dates when finished.`
      });
    }

    // Recommendation for missing information
    const incompleteEntries = educationList.filter(edu => 
      !edu.institution || !edu.degree || !edu.subject || !edu.starting_date
    ).length;

    if (incompleteEntries > 0) {
      recommendations.push({
        type: 'warning',
        message: `${incompleteEntries} education record(s) have missing information. Complete all fields for better profile quality.`
      });
    }

    // Recommendation for gaps
    if (progressAnalysis?.gaps?.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Consider adding any additional education or training during gap periods to show continuous learning.`
      });
    }

    // Recommendation for duplicates
    if (duplicateWarnings.length > 0) {
      recommendations.push({
        type: 'error',
        message: `Remove duplicate education records to avoid confusion.`
      });
    }

    return recommendations;
  }, [educationList, progressAnalysis, duplicateWarnings, getCompletionStats]);

  // Auto-run analysis when education list changes
  useEffect(() => {
    analyzeProgression();
    detectDuplicates();
  }, [analyzeProgression, detectDuplicates]);

  return {
    // Analysis results
    progressAnalysis,
    duplicateWarnings,
    progressionWarnings,
    completionStats: getCompletionStats,
    subjectDistribution: getSubjectDistribution,
    recommendations: getRecommendations,

    // Analysis functions
    analyzeProgression,
    detectDuplicates,
    validateDates,

    // Computed values
    hasWarnings: duplicateWarnings.length > 0 || progressionWarnings.length > 0,
    isAnalysisComplete: progressAnalysis !== null
  };
};

/**
 * Helper function to determine education level
 */
function getEducationLevel(degree) {
  if (!degree) return -1;
  
  const degreeLower = degree.toLowerCase();
  const levels = educationFormConfig.businessRules.progressionRules.levels;
  
  for (let i = 0; i < levels.length; i++) {
    if (degreeLower.includes(levels[i].toLowerCase())) {
      return i;
    }
  }
  
  // Additional common degree patterns
  const patterns = [
    { pattern: /^(primary|elementary)/, level: 0 },
    { pattern: /^(high school|secondary|matric)/, level: 1 },
    { pattern: /^(higher secondary|intermediate|\+2|12th)/, level: 2 },
    { pattern: /^(diploma|certificate)/, level: 3 },
    { pattern: /^(bachelor|b\.|undergraduate|ug)/, level: 4 },
    { pattern: /^(master|m\.|postgraduate|pg)/, level: 5 },
    { pattern: /^(phd|doctorate|doctor)/, level: 6 },
    { pattern: /^(post.*doc|postdoc)/, level: 7 }
  ];

  for (const { pattern, level } of patterns) {
    if (pattern.test(degreeLower)) {
      return level;
    }
  }
  
  return -1; // Unknown level
}

export default useEducationProgress;
