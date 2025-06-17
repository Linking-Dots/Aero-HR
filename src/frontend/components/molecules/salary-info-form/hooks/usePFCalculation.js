/**
 * @fileoverview Custom hook for PF (Provident Fund) calculations
 * @author glassERP Development Team
 * @version 1.0.0
 * 
 * Provides comprehensive PF calculation functionality with:
 * - Employee and employer contribution calculations
 * - Indian PF compliance validation
 * - Rate-based calculations with statutory limits
 * - Real-time validation and error handling
 * 
 * Follows ISO 25010 (Software Quality) standards for:
 * - Reliability through accurate calculations
 * - Usability with clear validation messages
 * - Compliance with Indian PF regulations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { salaryFormConfig } from '../config';

/**
 * Custom hook for PF (Provident Fund) calculations and validation
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.salaryAmount - Base salary amount
 * @param {boolean} options.pfContribution - PF contribution enabled status
 * @param {number} options.pfEmployeeRate - Employee PF contribution rate (%)
 * @param {number} options.pfAdditionalRate - Additional PF contribution rate (%)
 * @returns {Object} PF calculation and validation interface
 */
export const usePFCalculation = ({
  salaryAmount = 0,
  pfContribution = false,
  pfEmployeeRate = 0,
  pfAdditionalRate = 0
} = {}) => {
  // PF calculation state
  const [pfData, setPfData] = useState({
    employeeRate: 0,
    additionalRate: 0,
    totalRate: 0,
    employeeContribution: 0,
    employerContribution: 0,
    totalContribution: 0,
    isValid: false
  });

  // PF validation errors
  const [pfErrors, setPfErrors] = useState({});

  // Get PF business rules from config
  const pfRules = salaryFormConfig.businessRules.pf;

  /**
   * Validate PF number format according to Indian standards
   * Format: DL/DLI/1234567/123/1234567
   */
  const validatePFNumber = useCallback((pfNumber) => {
    if (!pfNumber) return { isValid: true, error: null };

    const pfPattern = pfRules.numberPattern;
    const isValid = pfPattern.test(pfNumber);
    
    return {
      isValid,
      error: isValid ? null : 'Invalid PF number format. Expected format: DL/DLI/1234567/123/1234567'
    };
  }, [pfRules.numberPattern]);

  /**
   * Validate PF contribution rates
   */
  const validatePFRates = useCallback(() => {
    const errors = {};

    // Validate employee rate
    if (pfEmployeeRate < pfRules.minEmployeeRate || pfEmployeeRate > pfRules.maxEmployeeRate) {
      errors.pfEmployeeRate = `Employee PF rate must be between ${pfRules.minEmployeeRate}% and ${pfRules.maxEmployeeRate}%`;
    }

    // Validate additional rate
    if (pfAdditionalRate < pfRules.minAdditionalRate || pfAdditionalRate > pfRules.maxAdditionalRate) {
      errors.pfAdditionalRate = `Additional PF rate must be between ${pfRules.minAdditionalRate}% and ${pfRules.maxAdditionalRate}%`;
    }

    // Validate total rate
    const totalRate = pfEmployeeRate + pfAdditionalRate;
    if (totalRate > pfRules.maxTotalRate) {
      errors.pfTotalRate = `Total PF rate cannot exceed ${pfRules.maxTotalRate}%`;
    }

    return errors;
  }, [pfEmployeeRate, pfAdditionalRate, pfRules]);

  /**
   * Calculate PF contributions based on salary and rates
   */
  const calculatePFRates = useCallback(() => {
    if (!pfContribution || !salaryAmount) {
      setPfData({
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
    const empRate = parseFloat(pfEmployeeRate) || 0;
    const addRate = parseFloat(pfAdditionalRate) || 0;
    const totalRate = empRate + addRate;

    // Calculate contributions
    const employeeContribution = (salary * empRate) / 100;
    const employerContribution = (salary * pfRules.employerRate) / 100;
    const totalContribution = employeeContribution + employerContribution;

    // Validate rates
    const rateErrors = validatePFRates();
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

    setPfData(calculatedData);
    setPfErrors(rateErrors);

    return calculatedData;
  }, [
    pfContribution,
    salaryAmount,
    pfEmployeeRate,
    pfAdditionalRate,
    pfRules.employerRate,
    validatePFRates
  ]);

  /**
   * Validate PF contribution requirements
   */
  const validatePFContribution = useCallback((formValues) => {
    const errors = {};

    if (formValues.pfContribution) {
      // PF Number validation
      if (!formValues.pfNumber) {
        errors.pfNumber = 'PF number is required when PF contribution is enabled';
      } else {
        const pfNumberValidation = validatePFNumber(formValues.pfNumber);
        if (!pfNumberValidation.isValid) {
          errors.pfNumber = pfNumberValidation.error;
        }
      }

      // Employee rate validation
      if (!formValues.pfEmployeeRate || formValues.pfEmployeeRate <= 0) {
        errors.pfEmployeeRate = 'Employee PF rate is required';
      }

      // Salary amount validation for PF eligibility
      const salary = parseFloat(formValues.salaryAmount) || 0;
      if (salary > pfRules.salaryThreshold) {
        errors.pfSalaryThreshold = `PF is applicable for salary up to ₹${pfRules.salaryThreshold.toLocaleString()}`;
      }
    }

    return errors;
  }, [validatePFNumber, pfRules.salaryThreshold]);

  /**
   * Get PF calculation summary
   */
  const getPFSummary = useCallback(() => {
    if (!pfContribution || !pfData.isValid) {
      return null;
    }

    return {
      contribution: {
        employee: pfData.employeeContribution,
        employer: pfData.employerContribution,
        total: pfData.totalContribution
      },
      rates: {
        employee: pfData.employeeRate,
        employer: pfRules.employerRate,
        additional: pfData.additionalRate,
        total: pfData.totalRate
      },
      compliance: {
        withinLimits: pfData.totalRate <= pfRules.maxTotalRate,
        employeeRateValid: pfData.employeeRate >= pfRules.minEmployeeRate && pfData.employeeRate <= pfRules.maxEmployeeRate,
        additionalRateValid: pfData.additionalRate >= pfRules.minAdditionalRate && pfData.additionalRate <= pfRules.maxAdditionalRate
      },
      metadata: {
        calculationDate: pfData.calculationDate,
        applicableThreshold: pfRules.salaryThreshold,
        isStatutoryCompliant: Object.keys(pfErrors).length === 0
      }
    };
  }, [pfContribution, pfData, pfRules, pfErrors]);

  /**
   * Format PF amount with currency
   */
  const formatPFAmount = useCallback((amount) => {
    if (!amount || amount === 0) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }, []);

  /**
   * Check if PF rates are within statutory limits
   */
  const isPFCompliant = useMemo(() => {
    if (!pfContribution) return true;
    
    return (
      pfData.employeeRate >= pfRules.minEmployeeRate &&
      pfData.employeeRate <= pfRules.maxEmployeeRate &&
      pfData.additionalRate >= pfRules.minAdditionalRate &&
      pfData.additionalRate <= pfRules.maxAdditionalRate &&
      pfData.totalRate <= pfRules.maxTotalRate
    );
  }, [pfContribution, pfData, pfRules]);

  /**
   * Get recommended PF rate based on salary
   */
  const getRecommendedPFRate = useCallback((salary) => {
    const salaryAmount = parseFloat(salary) || 0;
    
    if (salaryAmount <= 15000) {
      return pfRules.defaultEmployeeRate; // Standard rate for lower salaries
    } else if (salaryAmount <= 25000) {
      return Math.min(pfRules.defaultEmployeeRate + 1, pfRules.maxEmployeeRate); // Slightly higher
    } else {
      return pfRules.maxEmployeeRate; // Maximum for higher salaries
    }
  }, [pfRules]);

  // Recalculate when dependencies change
  useEffect(() => {
    calculatePFRates();
  }, [calculatePFRates]);

  return {
    // PF calculation data
    pfData,
    pfErrors,
    
    // Validation methods
    validatePFNumber,
    validatePFRates,
    validatePFContribution,
    
    // Calculation methods
    calculatePFRates,
    getPFSummary,
    
    // Utility methods
    formatPFAmount,
    getRecommendedPFRate,
    
    // Status indicators
    isPFCompliant,
    isPFEnabled: pfContribution,
    hasCalculationErrors: Object.keys(pfErrors).length > 0,
    
    // Configuration
    pfRules,
    
    // Quick access to calculated values
    employeeContribution: pfData.employeeContribution,
    employerContribution: pfData.employerContribution,
    totalContribution: pfData.totalContribution,
    totalRate: pfData.totalRate
  };
};

export default usePFCalculation;
