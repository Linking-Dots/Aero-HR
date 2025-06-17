/**
 * Leave Balance Management Hook
 * 
 * Manages leave balance calculations and validations
 * 
 * @fileoverview Hook for leave balance calculations and leave type management
 * @version 1.0.0
 * @since 2024
 * 
 * Features:
 * - Leave balance calculations
 * - Leave type information management
 * - Usage tracking and warnings
 * - Balance validation logic
 * - Dynamic balance updates
 * - Multi-user balance support
 * 
 * @author glassERP Development Team
 * @module hooks/useLeaveBalance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Leave Balance Management Hook
 * 
 * @param {Object} leavesData - Leave data from server
 * @param {string|number} currentUserId - Current user ID
 * @returns {Object} Leave balance state and methods
 */
export const useLeaveBalance = (leavesData = {}, currentUserId = null) => {
  // Extract leave data
  const {
    leaveTypes = [],
    leaveCounts = [],
    leaveCountsByUser = {}
  } = leavesData;

  // State for computed values
  const [balanceCache, setBalanceCache] = useState(new Map());
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // Get leave counts for current user
  const currentUserLeaveCounts = useMemo(() => {
    if (!currentUserId) return [];
    return leaveCountsByUser[currentUserId] || leaveCounts || [];
  }, [currentUserId, leaveCountsByUser, leaveCounts]);

  // Create leave type lookup map
  const leaveTypeMap = useMemo(() => {
    const map = new Map();
    leaveTypes.forEach(type => {
      map.set(type.type, type);
    });
    return map;
  }, [leaveTypes]);

  // Create leave counts lookup map
  const leaveCountsMap = useMemo(() => {
    const map = new Map();
    currentUserLeaveCounts.forEach(count => {
      map.set(count.leave_type, count);
    });
    return map;
  }, [currentUserLeaveCounts]);

  /**
   * Get leave type information
   */
  const getLeaveTypeInfo = useCallback((leaveType) => {
    if (!leaveType) return null;
    return leaveTypeMap.get(leaveType) || null;
  }, [leaveTypeMap]);

  /**
   * Get days used for a leave type
   */
  const getDaysUsed = useCallback((leaveType, userId = currentUserId) => {
    if (!leaveType) return 0;
    
    // Use current user counts by default
    let counts = currentUserLeaveCounts;
    
    // Use specific user counts if provided and different
    if (userId && userId !== currentUserId && leaveCountsByUser[userId]) {
      counts = leaveCountsByUser[userId];
    }
    
    const leaveCount = counts.find(count => count.leave_type === leaveType);
    return leaveCount?.days_used || 0;
  }, [currentUserLeaveCounts, leaveCountsByUser, currentUserId]);

  /**
   * Calculate remaining balance for a leave type
   */
  const calculateBalance = useCallback((leaveType, userId = currentUserId) => {
    if (!leaveType) return 0;
    
    const leaveTypeInfo = getLeaveTypeInfo(leaveType);
    if (!leaveTypeInfo) return 0;
    
    const totalDays = leaveTypeInfo.days || 0;
    const usedDays = getDaysUsed(leaveType, userId);
    
    return Math.max(0, totalDays - usedDays);
  }, [getLeaveTypeInfo, getDaysUsed]);

  /**
   * Check if requested days exceed balance
   */
  const isBalanceExceeded = useCallback((leaveType, requestedDays, userId = currentUserId) => {
    if (!leaveType || !requestedDays) return false;
    
    const remainingBalance = calculateBalance(leaveType, userId);
    return requestedDays > remainingBalance;
  }, [calculateBalance]);

  /**
   * Get balance warning message
   */
  const getBalanceWarning = useCallback((leaveType, requestedDays, userId = currentUserId) => {
    if (!leaveType || !requestedDays) return '';
    
    const remainingBalance = calculateBalance(leaveType, userId);
    const balanceAfterRequest = remainingBalance - requestedDays;
    
    if (requestedDays > remainingBalance) {
      return `Insufficient leave balance. You have ${remainingBalance} days remaining but requested ${requestedDays} days.`;
    }
    
    if (balanceAfterRequest <= 2 && balanceAfterRequest >= 0) {
      return `This request will leave you with only ${balanceAfterRequest} days remaining for ${leaveType}.`;
    }
    
    if (balanceAfterRequest < 0) {
      const exceeded = Math.abs(balanceAfterRequest);
      return `This request exceeds your balance by ${exceeded} days.`;
    }
    
    return '';
  }, [calculateBalance]);

  /**
   * Get comprehensive balance information
   */
  const getBalanceInfo = useCallback((leaveType, userId = currentUserId) => {
    if (!leaveType) return null;
    
    const leaveTypeInfo = getLeaveTypeInfo(leaveType);
    const daysUsed = getDaysUsed(leaveType, userId);
    const remainingBalance = calculateBalance(leaveType, userId);
    const totalDays = leaveTypeInfo?.days || 0;
    const usagePercentage = totalDays > 0 ? (daysUsed / totalDays) * 100 : 0;
    
    return {
      leaveType,
      leaveTypeInfo,
      totalDays,
      daysUsed,
      remainingBalance,
      usagePercentage,
      isLowBalance: remainingBalance <= 5,
      isExhausted: remainingBalance === 0
    };
  }, [getLeaveTypeInfo, getDaysUsed, calculateBalance]);

  /**
   * Get all balances for current user
   */
  const getAllBalances = useCallback((userId = currentUserId) => {
    return leaveTypes.map(leaveType => 
      getBalanceInfo(leaveType.type, userId)
    ).filter(Boolean);
  }, [leaveTypes, getBalanceInfo]);

  /**
   * Validate leave request
   */
  const validateLeaveRequest = useCallback((leaveType, requestedDays, userId = currentUserId) => {
    if (!leaveType || !requestedDays) {
      return {
        isValid: false,
        errors: ['Leave type and days are required'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];
    
    // Check if leave type exists
    const leaveTypeInfo = getLeaveTypeInfo(leaveType);
    if (!leaveTypeInfo) {
      errors.push('Invalid leave type selected');
    }
    
    // Check balance
    const remainingBalance = calculateBalance(leaveType, userId);
    const balanceAfterRequest = remainingBalance - requestedDays;
    
    if (requestedDays > remainingBalance) {
      errors.push(`Insufficient leave balance. ${remainingBalance} days available, ${requestedDays} requested.`);
    } else if (balanceAfterRequest <= 2) {
      warnings.push(`Low balance warning: Only ${balanceAfterRequest} days will remain after this request.`);
    }
    
    // Check maximum consecutive days (if configured)
    if (leaveTypeInfo?.maxConsecutiveDays && requestedDays > leaveTypeInfo.maxConsecutiveDays) {
      errors.push(`Cannot request more than ${leaveTypeInfo.maxConsecutiveDays} consecutive days for ${leaveType}.`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      balanceInfo: getBalanceInfo(leaveType, userId)
    };
  }, [getLeaveTypeInfo, calculateBalance, getBalanceInfo]);

  /**
   * Update balance cache
   */
  const updateBalanceCache = useCallback((leaveType, userId, balance) => {
    const key = `${userId}-${leaveType}`;
    setBalanceCache(prev => new Map(prev.set(key, {
      balance,
      timestamp: Date.now()
    })));
    setLastUpdateTime(Date.now());
  }, []);

  /**
   * Clear balance cache
   */
  const clearBalanceCache = useCallback(() => {
    setBalanceCache(new Map());
    setLastUpdateTime(Date.now());
  }, []);

  /**
   * Get cached balance or calculate new one
   */
  const getCachedBalance = useCallback((leaveType, userId = currentUserId) => {
    const key = `${userId}-${leaveType}`;
    const cached = balanceCache.get(key);
    
    // Use cache if less than 1 minute old
    if (cached && (Date.now() - cached.timestamp) < 60000) {
      return cached.balance;
    }
    
    // Calculate new balance and cache it
    const balance = calculateBalance(leaveType, userId);
    updateBalanceCache(leaveType, userId, balance);
    
    return balance;
  }, [balanceCache, calculateBalance, updateBalanceCache]);

  // Clear cache when leave data changes
  useEffect(() => {
    clearBalanceCache();
  }, [leavesData, clearBalanceCache]);

  // Return computed values and methods
  const remainingBalance = useMemo(() => {
    if (!currentUserId) return 0;
    // This will be set by the form when leave type is selected
    return 0;
  }, [currentUserId]);

  const daysUsed = useMemo(() => {
    if (!currentUserId) return 0;
    // This will be set by the form when leave type is selected
    return 0;
  }, [currentUserId]);

  return {
    // Data
    leaveTypes,
    leaveCounts: currentUserLeaveCounts,
    leaveTypeMap,
    leaveCountsMap,
    
    // Computed values
    remainingBalance,
    daysUsed,
    
    // Methods
    getLeaveTypeInfo,
    getDaysUsed,
    calculateBalance,
    getCachedBalance,
    isBalanceExceeded,
    getBalanceWarning,
    getBalanceInfo,
    getAllBalances,
    validateLeaveRequest,
    
    // Cache management
    updateBalanceCache,
    clearBalanceCache,
    lastUpdateTime,
    
    // Utility
    isDataLoaded: leaveTypes.length > 0
  };
};

export default useLeaveBalance;
