/**
 * Employee Table Management Hook
 * 
 * Custom hook for managing employee table operations including
 * data updates, loading states, and CRUD operations.
 * 
 * @hook
 * @param {Array} initialUsers - Initial users data
 * @returns {Object} Employee table utilities and state
 * 
 * @example
 * ```jsx
 * const {
 *   users,
 *   loadingStates,
 *   setLoading,
 *   isLoading,
 *   handleEmployeeUpdate,
 *   handleEmployeeDelete
 * } = useEmployeeTable(allUsers);
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export const useEmployeeTable = (initialUsers = []) => {
  const [users, setUsers] = useState(initialUsers);
  const [loadingStates, setLoadingStates] = useState({});

  // Sync with parent component's data
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  /**
   * Set loading state for specific operations
   */
  const setLoading = useCallback((userId, operation, loading) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${userId}-${operation}`]: loading
    }));
  }, []);

  /**
   * Check if a specific operation is loading
   */
  const isLoading = useCallback((userId, operation) => {
    return loadingStates[`${userId}-${operation}`] || false;
  }, [loadingStates]);

  /**
   * Handle employee data updates
   */
  const handleEmployeeUpdate = useCallback(async (key, userId, valueId) => {
    if (!userId || valueId === undefined) {
      console.warn('handleEmployeeUpdate: Missing required parameters');
      return;
    }

    setLoading(userId, key, true);

    try {
      const updateData = { [key]: valueId };
      
      const response = await axios.put(route('employee.update', userId), updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, [key]: valueId }
              : user
          )
        );

        toast.success(`Employee ${key} updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating employee ${key}:`, error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          `Failed to update employee ${key}`;
                          
      toast.error(errorMessage);
    } finally {
      setLoading(userId, key, false);
    }
  }, [setLoading]);

  /**
   * Handle employee deletion
   */
  const handleEmployeeDelete = useCallback(async (userId) => {
    if (!userId) {
      console.warn('handleEmployeeDelete: Missing userId parameter');
      return;
    }

    setLoading(userId, 'delete', true);

    try {
      const response = await axios.delete(route('employee.destroy', userId), {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        // Remove from local state
        setUsers(prevUsers => 
          prevUsers.filter(user => user.id !== userId)
        );

        toast.success('Employee deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to delete employee';
                          
      toast.error(errorMessage);
    } finally {
      setLoading(userId, 'delete', false);
    }
  }, [setLoading]);

  /**
   * Handle role changes
   */
  const handleRoleChange = useCallback(async (userId, roles) => {
    if (!userId || !Array.isArray(roles)) {
      console.warn('handleRoleChange: Invalid parameters');
      return;
    }

    setLoading(userId, 'role', true);

    try {
      const response = await axios.put(route('user.update-roles', userId), {
        roles: roles
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, roles: roles }
              : user
          )
        );

        toast.success('User roles updated successfully');
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to update user roles';
                          
      toast.error(errorMessage);
    } finally {
      setLoading(userId, 'role', false);
    }
  }, [setLoading]);

  /**
   * Handle attendance configuration save
   */
  const handleAttendanceConfigSave = useCallback(async (userId, config) => {
    if (!userId || !config) {
      console.warn('handleAttendanceConfigSave: Invalid parameters');
      return;
    }

    setLoading(userId, 'attendance_config', true);

    try {
      const response = await axios.post(route('employee.attendance-config', userId), {
        config: config
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        toast.success('Attendance configuration saved successfully');
        return true;
      }
    } catch (error) {
      console.error('Error saving attendance configuration:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to save attendance configuration';
                          
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(userId, 'attendance_config', false);
    }
  }, [setLoading]);

  /**
   * Refresh employees data
   */
  const refreshEmployees = useCallback(async () => {
    try {
      const response = await axios.get(route('employees.index'), {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 && response.data.users) {
        setUsers(response.data.users);
        toast.success('Employee data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing employees:', error);
      toast.error('Failed to refresh employee data');
    }
  }, []);

  /**
   * Get user by ID
   */
  const getUserById = useCallback((userId) => {
    return users.find(user => user.id === userId);
  }, [users]);

  /**
   * Filter users by department
   */
  const getUsersByDepartment = useCallback((departmentId) => {
    return users.filter(user => user.department === departmentId);
  }, [users]);

  /**
   * Get user statistics
   */
  const getUserStats = useCallback(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.active).length;
    const departments = [...new Set(users.map(user => user.department))].filter(Boolean);
    
    return {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      departments: departments.length
    };
  }, [users]);

  return {
    // State
    users,
    loadingStates,
    
    // Loading utilities
    setLoading,
    isLoading,
    
    // CRUD operations
    handleEmployeeUpdate,
    handleEmployeeDelete,
    handleRoleChange,
    handleAttendanceConfigSave,
    
    // Utilities
    refreshEmployees,
    getUserById,
    getUsersByDepartment,
    getUserStats
  };
};
