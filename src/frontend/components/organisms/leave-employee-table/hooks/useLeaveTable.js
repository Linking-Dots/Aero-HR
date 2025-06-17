/**
 * useLeaveTable Custom Hook
 * 
 * Manages the state and operations for the LeaveEmployeeTable component.
 * Handles status updates, user information, and formatting functions.
 * 
 * @hook
 * @param {Object} params - Hook parameters
 * @param {Function} params.setLeaves - Leaves state setter
 * @param {Function} params.setCurrentPage - Page state setter
 * @param {Array} params.allUsers - All users array
 * @returns {Object} Hook interface with operations and state
 */

import { useState, useCallback } from 'react';
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { useTheme, alpha } from "@mui/material/styles";
import { Chip } from "@heroui/react";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
  ClockIcon as ClockSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid
} from '@heroicons/react/24/solid';
import axios from 'axios';

export const useLeaveTable = ({ setLeaves, setCurrentPage, allUsers }) => {
  const { auth } = usePage().props;
  const theme = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const userIsAdmin = auth.roles.includes("Administrator");
  const userIsSE = auth.roles.includes("Supervision Engineer");

  // Status configuration
  const statusConfig = {
    'New': {
      color: 'primary',
      icon: ExclamationTriangleSolid,
      bgColor: alpha(theme.palette.primary.main, 0.1),
      textColor: theme.palette.primary.main
    },
    'Pending': {
      color: 'warning',
      icon: ClockSolid,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      textColor: theme.palette.warning.main
    },
    'Approved': {
      color: 'success',
      icon: CheckCircleSolid,
      bgColor: alpha(theme.palette.success.main, 0.1),
      textColor: theme.palette.success.main
    },
    'Declined': {
      color: 'danger',
      icon: XCircleSolid,
      bgColor: alpha(theme.palette.error.main, 0.1),
      textColor: theme.palette.error.main
    }
  };

  /**
   * Handle pagination page change
   * @param {number} page - New page number
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  /**
   * Update leave status
   * @param {Object} leave - Leave object
   * @param {string} newStatus - New status value
   */
  const updateLeaveStatus = useCallback(async (leave, newStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route("leave-update-status"), {
          id: leave.id,
          status: newStatus
        });

        if (response.status === 200) {
          setLeaves((prevLeaves) => {
            return prevLeaves.map((l) =>
              l.id === leave.id ? { ...l, status: newStatus } : l
            );
          });
          resolve(response.data.message || "Leave status updated successfully");
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 
          error.response?.statusText || 
          "Failed to update leave status";
        reject(errorMsg);
        console.error(error);
      } finally {
        setIsUpdating(false);
      }
    });

    toast.promise(promise, {
      pending: "Updating leave status...",
      success: "Leave status updated successfully!",
      error: "Failed to update leave status"
    });
  }, [setLeaves, isUpdating]);

  /**
   * Get status chip component
   * @param {string} status - Leave status
   * @returns {JSX.Element} Status chip component
   */
  const getStatusChip = (status) => {
    const config = statusConfig[status] || statusConfig['New'];
    const StatusIcon = config.icon;
    
    return (
      <Chip
        size="sm"
        variant="flat"
        color={config.color}
        startContent={<StatusIcon className="w-3 h-3" />}
        classNames={{
          base: "h-6",
          content: "text-xs font-medium"
        }}
      >
        {status}
      </Chip>
    );
  };

  /**
   * Calculate leave duration
   * @param {string} fromDate - Start date
   * @param {string} toDate - End date
   * @returns {string} Formatted duration
   */
  const getLeaveDuration = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  /**
   * Format date for display
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  /**
   * Get user information by ID
   * @param {string|number} userId - User ID
   * @returns {Object|undefined} User object
   */
  const getUserInfo = (userId) => {
    return allUsers.find((u) => String(u.id) === String(userId));
  };

  return {
    isUpdating,
    updateLeaveStatus,
    getStatusChip,
    getUserInfo,
    formatDate,
    getLeaveDuration,
    handlePageChange,
    statusConfig,
    userIsAdmin,
    userIsSE
  };
};
