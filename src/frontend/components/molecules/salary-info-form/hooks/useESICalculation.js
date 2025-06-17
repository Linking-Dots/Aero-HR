/**
 * @fileoverview Custom hook for ESI (Employee State Insurance) calculations
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Provides comprehensive ESI calculation functionality with:
 * - Employee and employer contribution calculations
 * - Indian ESI compliance validation
 * - Rate-based calculations with statutory limits
 * - Real-time validation and error handling
 * 
 * Follows ISO 25010 (Software Quality) standards for:
 * - Reliability through accurate calculations
 * - Usability with clear validation messages
 * - Compliance with Indian ESI regulations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { salaryFormConfig } from '../config';

/**
 * Custom hook for ESI (Employee State Insurance) calculations and validation
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.salaryAmount - Base salary amount
 * @param {boolean} options.esiContribution - ESI contribution enabled status
 * @param {number} options.esiEmployeeRate - Employee ESI contribution rate (%)
 * @param {number} options.esiAdditionalRate - Additional ESI contribution rate (%)
 * @returns {Object} ESI calculation and validation interface
 */
export const useESICalculation = ({
  salaryAmount = 0,
  esiContribution = false,
  esiEmployeeRate = 0,
  esiAdditionalRate = 0
} = {}) => {
  // ESI calculation state
  const [esiData, setEsiData] = useState({
    employeeRate: 0,
    additionalRate: 0,
    totalRate: 0,
    employeeContribution: 0,
    employerContribution: 0,
    totalContribution: 0,
    isValid: false
  });

  // ESI validation errors
  const [esiErrors, setEsiErrors] = useState({});

  // Get ESI business rules from config
  const esiRules = salaryFormConfig.businessRules.esi;

  /**
   * Validate ESI number format according to Indian standards
   * Format: 10-digit number (1234567890)
   */
  const validateESINumber = useCallback((esiNumber) => {
    if (!esiNumber) return { isValid: true, error: null };

    const esiPattern = esiRules.numberPattern;
    const isValid = esiPattern.test(esiNumber);
    
    return {
      isValid,
      error: isValid ? null : 'Invalid ESI number format. Must be a 10-digit number'
    };
  }, [esiRules.numberPattern]);

  /**
   * Validate ESI contribution rates
   */
  const validateESIRates = useCallback(() => {
    const errors = {};

    // Validate employee rate
    if (esiEmployeeRate < esiRules.minEmployeeRate || esiEmployeeRate > esiRules.maxEmployeeRate) {
      errors.esiEmployeeRate = `Employee ESI rate must be between ${esiRules.minEmployeeRate}% and ${esiRules.maxEmployeeRate}%`;
    }

    // Validate additional rate
    if (esiAdditionalRate < esiRules.minAdditionalRate || esiAdditionalRate > esiRules.maxAdditionalRate) {
      errors.esiAdditionalRate = `Additional ESI rate must be between ${esiRules.minAdditionalRate}% and ${esiRules.maxAdditionalRate}%`;
    }

    // Validate total rate
    const totalRate = esiEmployeeRate + esiAdditionalRate;
    if (totalRate > esiRules.maxTotalRate) {
      errors.esiTotalRate = `Total ESI rate cannot exceed ${esiRules.maxTotalRate}%`;
    }

    return errors;
  }, [esiEmployeeRate, esiAdditionalRate, esiRules]);

  /**
   * Calculate ESI contributions based on salary and rates
   */
  const calculateESIRates = useCallback(() => {
    if (!esiContribution || !salaryAmount) {
      setEsiData({
        employeeRate: 0,
        additionalRate: 0,
        totalRate: 0,
        employeeContribution: 0,
        employerContribution: 0,
        totalContribution: 0,
        isValid: false
      });
      return;
    }

    const salary = parseFloat(salaryAmount) || 0;
    const empRate = parseFloat(esiEmployeeRate) || 0;
    const addRate = parseFloat(esiAdditionalRate) || 0;
    const totalRate = empRate + addRate;

    // Calculate contributions
    const employeeContribution = (salary * empRate) / 100;
    const employerContribution = (salary * esiRules.employerRate) / 100;
    const totalContribution = employeeContribution + employerContribution;

    // Validate rates
    const rateErrors = validateESIRates();
    const isValid = Object.keys(rateErrors).length === 0;

    const calculatedData = {
      employeeRate: empRate,
      additionalRate: addRate,
      totalRate,
      employeeContribution: parseFloat(employeeContribution.toFixed(2)),
      employerContribution: parseFloat(employerContribution.toFixed(2)),
      totalContribution: parseFloat(totalContribution.toFixed(2)),
      isValid,
      calculationDate: new Date().toISOString()
    };

    setEsiData(calculatedData);
    setEsiErrors(rateErrors);

    return calculatedData;
  }, [
    esiContribution,
    salaryAmount,
    esiEmployeeRate,
    esiAdditionalRate,
    esiRules.employerRate,
    validateESIRates
  ]);

  /**
   * Validate ESI contribution requirements
   */
  const validateESIContribution = useCallback((formValues) => {
    const errors = {};

    if (formValues.esiContribution) {
      // ESI Number validation
      if (!formValues.esiNumber) {
        errors.esiNumber = 'ESI number is required when ESI contribution is enabled';
      } else {
        const esiNumberValidation = validateESINumber(formValues.esiNumber);
        if (!esiNumberValidation.isValid) {
          errors.esiNumber = esiNumberValidation.error;
        }
      }

      // Employee rate validation
      if (!formValues.esiEmployeeRate || formValues.esiEmployeeRate <= 0) {
        errors.esiEmployeeRate = 'Employee ESI rate is required';
      }

      // Salary amount validation for ESI eligibility
      const salary = parseFloat(formValues.salaryAmount) || 0;
      if (salary > esiRules.salaryThreshold) {
        errors.esiSalaryThreshold = `ESI is applicable for salary up to ₹${esiRules.salaryThreshold.toLocaleString()}`;
      }

      // Minimum salary validation
      if (salary < esiRules.minSalaryThreshold) {
        errors.esiMinSalaryThreshold = `ESI requires minimum salary of ₹${esiRules.minSalaryThreshold.toLocaleString()}`;
      }
    }

    return errors;
  }, [validateESINumber, esiRules.salaryThreshold, esiRules.minSalaryThreshold]);

  /**
   * Get ESI calculation summary
   */
  const getESISummary = useCallback(() => {
    if (!esiContribution || !esiData.isValid) {
      return null;
    }

    return {
      contribution: {
        employee: esiData.employeeContribution,
        employer: esiData.employerContribution,
        total: esiData.totalContribution
      },
      rates: {
        employee: esiData.employeeRate,
        employer: esiRules.employerRate,
        additional: esiData.additionalRate,
        total: esiData.totalRate
      },
      compliance: {
        withinLimits: esiData.totalRate <= esiRules.maxTotalRate,
        employeeRateValid: esiData.employeeRate >= esiRules.minEmployeeRate && esiData.employeeRate <= esiRules.maxEmployeeRate,
        additionalRateValid: esiData.additionalRate >= esiRules.minAdditionalRate && esiData.additionalRate <= esiRules.maxAdditionalRate
      },
      eligibility: {
        salaryWithinThreshold: parseFloat(salaryAmount) <= esiRules.salaryThreshold,
        salaryAboveMinimum: parseFloat(salaryAmount) >= esiRules.minSalaryThreshold,
        isEligible: parseFloat(salaryAmount) >= esiRules.minSalaryThreshold && parseFloat(salaryAmount) <= esiRules.salaryThreshold
      },
      metadata: {
        calculationDate: esiData.calculationDate,
        applicableThreshold: esiRules.salaryThreshold,
        minimumThreshold: esiRules.minSalaryThreshold,
        isStatutoryCompliant: Object.keys(esiErrors).length === 0
      }
    };
  }, [esiContribution, esiData, esiRules, esiErrors, salaryAmount]);

  /**
   * Format ESI amount with currency
   */
  const formatESIAmount = useCallback((amount) => {
    if (!amount || amount === 0) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }, []);

  /**
   * Check if ESI rates are within statutory limits
   */
  const isESICompliant = useMemo(() => {
    if (!esiContribution) return true;
    
    return (
      esiData.employeeRate >= esiRules.minEmployeeRate &&
      esiData.employeeRate <= esiRules.maxEmployeeRate &&
      esiData.additionalRate >= esiRules.minAdditionalRate &&
      esiData.additionalRate <= esiRules.maxAdditionalRate &&
      esiData.totalRate <= esiRules.maxTotalRate
    );
  }, [esiContribution, esiData, esiRules]);

  /**
   * Check if salary is eligible for ESI
   */
  const isESIEligible = useMemo(() => {
    const salary = parseFloat(salaryAmount) || 0;
    return salary >= esiRules.minSalaryThreshold && salary <= esiRules.salaryThreshold;
  }, [salaryAmount, esiRules]);

  /**
   * Get recommended ESI rate based on salary
   */
  const getRecommendedESIRate = useCallback((salary) => {
    const salaryAmount = parseFloat(salary) || 0;
    
    if (!isESIEligible) {
      return 0; // Not eligible for ESI
    }
    
    if (salaryAmount <= 15000) {
      return esiRules.defaultEmployeeRate; // Standard rate for lower salaries
    } else if (salaryAmount <= 20000) {
      return Math.min(esiRules.defaultEmployeeRate + 0.25, esiRules.maxEmployeeRate); // Slightly higher
    } else {
      return Math.min(esiRules.defaultEmployeeRate + 0.5, esiRules.maxEmployeeRate); // Higher for maximum eligible salary
    }
  }, [esiRules, isESIEligible]);

  /**
   * Get ESI benefits information
   */
  const getESIBenefits = useCallback(() => {
    if (!esiContribution || !isESIEligible) return null;

    return {
      medicalBenefits: {
        employee: 'Full medical care for self and dependents',
        family: 'Medical care for spouse and children',
        maternity: 'Maternity benefits for female employees',
        disability: 'Disability benefits in case of employment injury'
      },
      cashBenefits: {
        sickness: 'Sickness benefit up to 91 days',
        maternity: 'Maternity benefit for 26 weeks',
        disability: 'Disablement benefit for temporary/permanent disability',
        dependent: 'Dependent benefit for family members'
      },
      eligibilityPeriod: {
        immediate: 'Medical benefits available immediately',
        cashBenefits: 'Cash benefits after 78 days of contribution'
      }
    };
  }, [esiContribution, isESIEligible]);

  // Recalculate when dependencies change
  useEffect(() => {
    calculateESIRates();
  }, [calculateESIRates]);

  return {
    // ESI calculation data
    esiData,
    esiErrors,
    
    // Validation methods
    validateESINumber,
    validateESIRates,
    validateESIContribution,
    
    // Calculation methods
    calculateESIRates,
    getESISummary,
    
    // Utility methods
    formatESIAmount,
    getRecommendedESIRate,
    getESIBenefits,
    
    // Status indicators
    isESICompliant,
    isESIEligible,
    isESIEnabled: esiContribution,
    hasCalculationErrors: Object.keys(esiErrors).length > 0,
    
    // Configuration
    esiRules,
    
    // Quick access to calculated values
    employeeContribution: esiData.employeeContribution,
    employerContribution: esiData.employerContribution,
    totalContribution: esiData.totalContribution,
    totalRate: esiData.totalRate
  };
};

export default useESICalculation;
