/**
 * Experience Analytics Hook
 * 
 * Custom hook for analyzing work experience data and providing career insights
 * Provides advanced analytics for career progression and recommendations
 * 
 * @version 1.0.0
 * @since 2024
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { experienceFormConfig } from '../config.js';
import { customValidations } from '../validation.js';

/**
 * Hook for managing experience analytics and career insights
 */
export const useExperienceAnalytics = (experienceList = []) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [careerInsights, setCareerInsights] = useState(null);
  const [overlapWarnings, setOverlapWarnings] = useState([]);
  const [careerGaps, setCareerGaps] = useState([]);

  /**
   * Analyze career progression and generate insights
   */
  const analyzeCareerProgression = useCallback(async () => {
    if (!experienceList.length) {
      setAnalyticsData(null);
      setCareerInsights(null);
      return;
    }

    try {
      // Sort experiences by start date
      const sortedExperiences = [...experienceList]
        .filter(exp => exp.period_from)
        .sort((a, b) => new Date(a.period_from) - new Date(b.period_from));

      // Calculate total experience
      const totalExperience = customValidations.calculateTotalExperience(experienceList);

      // Detect career gaps
      const gaps = customValidations.detectCareerGaps(experienceList);
      setCareerGaps(gaps);

      // Check for overlapping employment
      const overlapValidation = customValidations.validateNoOverlaps(experienceList);
      setOverlapWarnings(overlapValidation.errors || []);

      // Validate career progression
      const progressionValidation = customValidations.validateCareerProgression(experienceList);

      // Calculate career timeline
      const timeline = sortedExperiences.map((exp, index) => {
        const startDate = new Date(exp.period_from);
        const endDate = exp.period_to ? new Date(exp.period_to) : new Date();
        const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const durationMonths = Math.round(duration / 30);

        return {
          index,
          experience: exp,
          startDate,
          endDate,
          duration: durationMonths,
          isCurrent: !exp.period_to,
          company: exp.company_name,
          position: exp.job_position,
          location: exp.location
        };
      });

      // Calculate average job duration
      const completedJobs = timeline.filter(t => !t.isCurrent);
      const averageDuration = completedJobs.length > 0 ? 
        completedJobs.reduce((sum, t) => sum + t.duration, 0) / completedJobs.length : 0;

      // Analyze industries and companies
      const companies = [...new Set(experienceList.map(exp => exp.company_name).filter(Boolean))];
      const positions = [...new Set(experienceList.map(exp => exp.job_position).filter(Boolean))];

      // Calculate career progression metrics
      const careerSpan = timeline.length > 0 ? {
        startDate: timeline[0].startDate,
        endDate: timeline[timeline.length - 1].endDate,
        totalYears: (timeline[timeline.length - 1].endDate - timeline[0].startDate) / (1000 * 60 * 60 * 24 * 365)
      } : null;

      const analytics = {
        timeline,
        totalExperience,
        averageDuration: Math.round(averageDuration),
        careerSpan,
        gaps,
        progressionValidation,
        companies,
        positions,
        totalJobs: experienceList.length,
        currentJobs: timeline.filter(t => t.isCurrent).length,
        completedJobs: completedJobs.length,
        longestJob: completedJobs.length > 0 ? 
          Math.max(...completedJobs.map(t => t.duration)) : 0,
        shortestJob: completedJobs.length > 0 ? 
          Math.min(...completedJobs.map(t => t.duration)) : 0
      };

      setAnalyticsData(analytics);

      // Generate career insights
      const insights = generateCareerInsights(analytics);
      setCareerInsights(insights);

      return analytics;
    } catch (error) {
      console.error('Error analyzing career progression:', error);
      return null;
    }
  }, [experienceList]);

  /**
   * Generate career recommendations and insights
   */
  const generateCareerInsights = useCallback((analytics) => {
    const recommendations = [];
    const achievements = [];
    const warnings = [];

    // Experience volume insights
    if (analytics.totalJobs >= 5) {
      achievements.push({
        type: 'experience',
        message: `Extensive experience with ${analytics.totalJobs} different roles`
      });
    } else if (analytics.totalJobs < 2) {
      recommendations.push({
        type: 'experience',
        priority: 'medium',
        message: 'Consider gaining experience in different roles or companies to broaden your skillset'
      });
    }

    // Career stability insights
    if (analytics.averageDuration >= 24) { // 2+ years average
      achievements.push({
        type: 'stability',
        message: 'Good career stability with average job duration of ' + Math.round(analytics.averageDuration / 12) + ' years'
      });
    } else if (analytics.averageDuration < 12) { // Less than 1 year average
      warnings.push({
        type: 'stability',
        message: 'Short average job duration may indicate career instability'
      });
    }

    // Career gaps insights
    if (analytics.gaps.length > 0) {
      warnings.push({
        type: 'gaps',
        message: `${analytics.gaps.length} career gap(s) detected. Consider adding explanations for employment gaps.`
      });
    } else if (analytics.totalJobs > 1) {
      achievements.push({
        type: 'continuity',
        message: 'Good career continuity with no significant employment gaps'
      });
    }

    // Career progression insights
    if (analytics.progressionValidation.hasIssues) {
      warnings.push({
        type: 'progression',
        message: 'Review career progression for any inconsistencies in role seniority'
      });
    }

    // Total experience insights
    if (analytics.totalExperience.totalYears >= 10) {
      achievements.push({
        type: 'experience',
        message: `Seasoned professional with ${analytics.totalExperience.formatted} of experience`
      });
    } else if (analytics.totalExperience.totalYears >= 5) {
      achievements.push({
        type: 'experience',
        message: `Experienced professional with ${analytics.totalExperience.formatted} of experience`
      });
    }

    // Company diversity insights
    if (analytics.companies.length >= 3) {
      achievements.push({
        type: 'diversity',
        message: `Diverse experience across ${analytics.companies.length} different companies`
      });
    } else if (analytics.companies.length === 1 && analytics.totalJobs > 1) {
      recommendations.push({
        type: 'diversity',
        priority: 'low',
        message: 'Consider gaining experience in different company environments'
      });
    }

    // Current employment status
    if (analytics.currentJobs > 1) {
      warnings.push({
        type: 'employment',
        message: 'Multiple current positions detected. Verify employment dates are accurate.'
      });
    }

    return {
      recommendations,
      achievements,
      warnings,
      overallScore: calculateCareerScore(analytics, achievements, warnings),
      profileCompleteness: calculateProfileCompleteness(experienceList)
    };
  }, []);

  /**
   * Calculate career profile score
   */
  const calculateCareerScore = useCallback((analytics, achievements, warnings) => {
    let score = 50; // Base score

    // Add points for achievements
    score += achievements.length * 10;

    // Deduct points for warnings
    score -= warnings.length * 5;

    // Add points for experience duration
    score += Math.min(analytics.totalExperience.totalYears * 2, 20);

    // Add points for career stability
    if (analytics.averageDuration >= 24) score += 10;
    if (analytics.averageDuration >= 36) score += 5;

    // Add points for company diversity
    score += Math.min(analytics.companies.length * 3, 15);

    // Deduct points for career gaps
    score -= analytics.gaps.length * 5;

    return Math.max(0, Math.min(100, score));
  }, []);

  /**
   * Calculate profile completeness percentage
   */
  const calculateProfileCompleteness = useCallback((experiences) => {
    let totalFields = 0;
    let completedFields = 0;

    experiences.forEach(exp => {
      totalFields += 6; // Total possible fields
      
      if (exp.company_name) completedFields++;
      if (exp.location) completedFields++;
      if (exp.job_position) completedFields++;
      if (exp.period_from) completedFields++;
      if (exp.period_to || !exp.period_from) completedFields++; // Current job doesn't need end date
      if (exp.description) completedFields++;
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }, []);

  /**
   * Get experience duration in human readable format
   */
  const getExperienceDuration = useCallback((experience) => {
    if (!experience.period_from) return null;
    
    const startDate = new Date(experience.period_from);
    const endDate = experience.period_to ? new Date(experience.period_to) : new Date();
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
                  + (endDate.getMonth() - startDate.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years}y ${remainingMonths}m`;
      }
    }
  }, []);

  /**
   * Get career phase based on total experience
   */
  const getCareerPhase = useMemo(() => {
    if (!analyticsData?.totalExperience) return 'Entry Level';
    
    const years = analyticsData.totalExperience.totalYears;
    
    if (years < 2) return 'Entry Level';
    if (years < 5) return 'Junior Professional';
    if (years < 10) return 'Mid-Level Professional';
    if (years < 15) return 'Senior Professional';
    if (years < 25) return 'Expert Professional';
    return 'Veteran Professional';
  }, [analyticsData]);

  /**
   * Get industry analysis
   */
  const getIndustryAnalysis = useMemo(() => {
    if (!experienceList.length) return null;

    // Basic industry detection based on company names and job titles
    const industries = new Map();
    
    experienceList.forEach(exp => {
      // Simple industry classification (could be enhanced with ML/API)
      let industry = 'General';
      
      const companyLower = (exp.company_name || '').toLowerCase();
      const positionLower = (exp.job_position || '').toLowerCase();
      
      if (companyLower.includes('tech') || positionLower.includes('software') || positionLower.includes('developer')) {
        industry = 'Technology';
      } else if (companyLower.includes('bank') || positionLower.includes('finance') || positionLower.includes('accounting')) {
        industry = 'Finance';
      } else if (companyLower.includes('health') || positionLower.includes('medical') || positionLower.includes('nurse')) {
        industry = 'Healthcare';
      } else if (positionLower.includes('marketing') || positionLower.includes('sales')) {
        industry = 'Marketing & Sales';
      } else if (positionLower.includes('engineer') && !positionLower.includes('software')) {
        industry = 'Engineering';
      }
      
      const duration = getExperienceDuration(exp);
      const current = industries.get(industry) || { count: 0, totalDuration: 0 };
      industries.set(industry, {
        count: current.count + 1,
        totalDuration: current.totalDuration + (duration ? parseInt(duration) : 0)
      });
    });

    return Array.from(industries.entries()).map(([industry, data]) => ({
      industry,
      ...data,
      percentage: Math.round((data.count / experienceList.length) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [experienceList, getExperienceDuration]);

  // Auto-run analysis when experience list changes
  useEffect(() => {
    analyzeCareerProgression();
  }, [analyzeCareerProgression]);

  return {
    // Analysis results
    analyticsData,
    careerInsights,
    overlapWarnings,
    careerGaps,
    careerPhase: getCareerPhase,
    industryAnalysis: getIndustryAnalysis,

    // Analysis functions
    analyzeCareerProgression,
    getExperienceDuration,

    // Computed values
    hasWarnings: overlapWarnings.length > 0 || careerGaps.length > 0,
    isAnalysisComplete: analyticsData !== null,
    
    // Helper functions
    calculateProfileCompleteness
  };
};

export default useExperienceAnalytics;
