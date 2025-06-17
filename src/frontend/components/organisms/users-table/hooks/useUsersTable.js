/**
 * useUsersTable Custom Hook
 * 
 * Manages the state and operations for the UsersTable component.
 * Handles CRUD operations, loading states, and API interactions.
 * 
 * @hook
 * @param {Array} users - Current users array
 * @param {Function} setLocalUsers - Local state setter
 * @param {Function} setUsers - Parent state setter
 * @returns {Object} Hook interface with operations and state
 */

import { useState } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';

export const useUsersTable = (users, setLocalUsers, setUsers) => {
  const [loadingStates, setLoadingStates] = useState({});

  /**
   * Set loading state for specific user operations
   * @param {string|number} userId - User ID
   * @param {string} operation - Operation type (role, status, delete)
   * @param {boolean} loading - Loading state
   */
  const setLoading = (userId, operation, loading) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${userId}-${operation}`]: loading
    }));
  };

  /**
   * Check if specific operation is loading
   * @param {string|number} userId - User ID
   * @param {string} operation - Operation type
   * @returns {boolean} Loading state
   */
  const isLoading = (userId, operation) => {
    return loadingStates[`${userId}-${operation}`] || false;
  };

  /**
   * Update user roles
   * @param {string|number} userId - User ID
   * @param {Array} newRoles - Array of new role names
   */
  const handleRoleChange = async (userId, newRoles) => {
    setLoading(userId, 'role', true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route('user.updateRole', { id: userId }), {
          roles: newRoles,
        });

        if (response.status === 200) {
          const updatedUsers = users.map((user) => {
            if (user.id === userId) {
              return { ...user, roles: newRoles };
            }
            return user;
          });
          
          setLocalUsers(updatedUsers);
          
          // Update parent only when necessary
          if (setUsers) {
            setUsers(prevUsers => 
              prevUsers.map((user) => {
                if (user.id === userId) {
                  return { ...user, roles: newRoles };
                }
                return user;
              })
            );
          }

          resolve([response.data.messages || 'Role updated successfully']);
        }
      } catch (error) {
        if (error.response?.status === 422) {
          reject(error.response.data.errors || ['Failed to update user role.']);
        } else {
          reject(['An unexpected error occurred. Please try again later.']);
        }
      } finally {
        setLoading(userId, 'role', false);
      }
    });

    toast.promise(promise, {
      pending: 'Updating employee role...',
      success: {
        render({ data }) {
          return data.join(', ');
        },
      },
      error: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
        },
      },
    });
  };

  /**
   * Toggle user active status
   * @param {string|number} userId - User ID
   * @param {boolean} value - New active status
   */
  const handleStatusToggle = async (userId, value) => {
    setLoading(userId, 'status', true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.put(route('user.toggleStatus', { id: userId }), {
          active: value,
        });

        if (response.status === 200) {
          const updatedUsers = users.map((user) => {
            if (user.id === userId) {
              return { ...user, active: value };
            }
            return user;
          });
          
          setLocalUsers(updatedUsers);
          
          // Update parent only when necessary
          if (setUsers) {
            setUsers(prevUsers => 
              prevUsers.map((user) => {
                if (user.id === userId) {
                  return { ...user, active: value };
                }
                return user;
              })
            );
          }
          
          resolve([response.data.message || 'User status updated successfully']);
        }
      } catch (error) {
        if (error.response?.status === 422) {
          reject(error.response.data.errors || ['Failed to update user status.']);
        } else {
          reject(['An unexpected error occurred. Please try again later.']);
        }
      } finally {
        setLoading(userId, 'status', false);
      }
    });

    toast.promise(promise, {
      pending: 'Updating user status...',
      success: {
        render({ data }) {
          return data.join(', ');
        },
      },
      error: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
        },
      },
    });
  };

  /**
   * Delete user from system
   * @param {string|number} userId - User ID to delete
   */
  const handleDelete = async (userId) => {
    setLoading(userId, 'delete', true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route('profile.delete'), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
          },
          body: JSON.stringify({ user_id: userId }),
        });

        const data = await response.json();

        if (response.ok) {
          const updatedUsers = users.filter(user => user.id !== userId);
          setLocalUsers(updatedUsers);
          
          // Update parent only when necessary
          if (setUsers) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
          }
          
          resolve([data.message]);
        } else {
          reject([data.message]);
        }
      } catch (error) {
        reject(['An error occurred while deleting user. Please try again.']);
      } finally {
        setLoading(userId, 'delete', false);
      }
    });

    toast.promise(promise, {
      pending: 'Deleting user...',
      success: {
        render({ data }) {
          return data.join(', ');
        },
      },
      error: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
        },
      },
    });
  };

  return {
    loadingStates,
    handleRoleChange,
    handleStatusToggle,
    handleDelete,
    isLoading,
    setLoading
  };
};
