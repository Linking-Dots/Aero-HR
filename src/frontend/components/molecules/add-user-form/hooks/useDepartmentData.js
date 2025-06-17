import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * useDepartmentData Hook
 * 
 * Manages department, designation, and reporting structure data with:
 * - Dynamic loading of department-based designations
 * - Reporting structure management
 * - Data caching and optimization
 * - Dependency handling
 */
const useDepartmentData = ({
  departments = [],
  designations = [],
  allUsers = [],
  currentUserId = null,
  selectedDepartment = null
}) => {
  // State management
  const [departmentData, setDepartmentData] = useState(departments);
  const [designationData, setDesignationData] = useState(designations);
  const [usersData, setUsersData] = useState(allUsers);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState(new Map());

  // Memoized department options
  const departmentOptions = useMemo(() => {
    return departmentData.map(dept => ({
      id: dept.id || dept.value,
      name: dept.name || dept.label || dept.title,
      description: dept.description,
      manager: dept.manager
    }));
  }, [departmentData]);

  // Memoized designation options based on selected department
  const designationOptions = useMemo(() => {
    if (!selectedDepartment) {
      return designationData.map(designation => ({
        id: designation.id || designation.value,
        name: designation.name || designation.label || designation.title,
        department_id: designation.department_id,
        level: designation.level,
        description: designation.description
      }));
    }

    // Filter designations by department
    return designationData
      .filter(designation => 
        designation.department_id === selectedDepartment ||
        designation.department === selectedDepartment
      )
      .map(designation => ({
        id: designation.id || designation.value,
        name: designation.name || designation.label || designation.title,
        department_id: designation.department_id,
        level: designation.level,
        description: designation.description
      }));
  }, [designationData, selectedDepartment]);

  // Memoized report-to options
  const reportToOptions = useMemo(() => {
    return usersData
      .filter(user => {
        // Exclude current user (for edit mode)
        if (currentUserId && user.id === currentUserId) {
          return false;
        }

        // Filter by department if selected
        if (selectedDepartment) {
          return user.department_id === selectedDepartment || 
                 user.department === selectedDepartment;
        }

        return true;
      })
      .map(user => ({
        id: user.id,
        name: user.name,
        designation: user.designation_name || user.designation,
        department: user.department_name || user.department,
        email: user.email,
        level: user.designation_level
      }))
      .sort((a, b) => {
        // Sort by level (higher level first) then by name
        if (a.level !== b.level) {
          return (b.level || 0) - (a.level || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [usersData, currentUserId, selectedDepartment]);

  // Load department data
  const loadDepartmentData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Check cache first
      const cacheKey = 'departments';
      if (cache.has(cacheKey)) {
        setDepartmentData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      // If data is already provided, use it
      if (departments.length > 0) {
        setDepartmentData(departments);
        setCache(prev => new Map(prev).set(cacheKey, departments));
        setLoading(false);
        return;
      }

      // Fetch from API
      const response = await axios.get('/api/departments');
      const data = response.data.departments || response.data;
      
      setDepartmentData(data);
      setCache(prev => new Map(prev).set(cacheKey, data));
      
    } catch (error) {
      console.error('Error loading departments:', error);
      // Use fallback data if available
      if (departments.length > 0) {
        setDepartmentData(departments);
      }
    } finally {
      setLoading(false);
    }
  }, [departments, cache]);

  // Load designations for specific department
  const loadDesignationsForDepartment = useCallback(async (departmentId) => {
    if (!departmentId) {
      setDesignationData(designations);
      return;
    }

    setLoading(true);
    
    try {
      // Check cache first
      const cacheKey = `designations_${departmentId}`;
      if (cache.has(cacheKey)) {
        setDesignationData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Filter from existing data first
      const filteredDesignations = designations.filter(
        designation => 
          designation.department_id === departmentId ||
          designation.department === departmentId
      );

      if (filteredDesignations.length > 0) {
        setDesignationData(filteredDesignations);
        setCache(prev => new Map(prev).set(cacheKey, filteredDesignations));
        setLoading(false);
        return;
      }

      // Fetch from API if no local data
      const response = await axios.get(`/api/departments/${departmentId}/designations`);
      const data = response.data.designations || response.data;
      
      setDesignationData(data);
      setCache(prev => new Map(prev).set(cacheKey, data));
      
    } catch (error) {
      console.error('Error loading designations:', error);
      // Use fallback - filter from all designations
      const fallbackDesignations = designations.filter(
        designation => 
          designation.department_id === departmentId ||
          designation.department === departmentId
      );
      setDesignationData(fallbackDesignations);
    } finally {
      setLoading(false);
    }
  }, [designations, cache]);

  // Load users for report-to options
  const loadReportToOptions = useCallback(async (departmentId = null) => {
    setLoading(true);
    
    try {
      // Check cache first
      const cacheKey = departmentId ? `users_${departmentId}` : 'users_all';
      if (cache.has(cacheKey)) {
        setUsersData(cache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Use existing data if available
      if (allUsers.length > 0) {
        const filteredUsers = departmentId 
          ? allUsers.filter(user => 
              user.department_id === departmentId || 
              user.department === departmentId
            )
          : allUsers;
        
        setUsersData(filteredUsers);
        setCache(prev => new Map(prev).set(cacheKey, filteredUsers));
        setLoading(false);
        return;
      }

      // Fetch from API
      const endpoint = departmentId 
        ? `/api/departments/${departmentId}/users`
        : '/api/users/managers';
        
      const response = await axios.get(endpoint);
      const data = response.data.users || response.data;
      
      setUsersData(data);
      setCache(prev => new Map(prev).set(cacheKey, data));
      
    } catch (error) {
      console.error('Error loading users:', error);
      // Use fallback data
      if (allUsers.length > 0) {
        setUsersData(allUsers);
      }
    } finally {
      setLoading(false);
    }
  }, [allUsers, cache]);

  // Get department by ID
  const getDepartmentById = useCallback((departmentId) => {
    return departmentOptions.find(dept => dept.id === departmentId);
  }, [departmentOptions]);

  // Get designation by ID
  const getDesignationById = useCallback((designationId) => {
    return designationOptions.find(designation => designation.id === designationId);
  }, [designationOptions]);

  // Get user by ID
  const getUserById = useCallback((userId) => {
    return reportToOptions.find(user => user.id === userId);
  }, [reportToOptions]);

  // Validate department-designation combination
  const validateDepartmentDesignation = useCallback((departmentId, designationId) => {
    if (!departmentId || !designationId) {
      return { valid: true };
    }

    const designation = getDesignationById(designationId);
    if (!designation) {
      return { valid: false, message: 'Invalid designation selected' };
    }

    const isValid = designation.department_id === departmentId;
    return {
      valid: isValid,
      message: isValid ? null : 'Selected designation is not available for this department'
    };
  }, [getDesignationById]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    clearCache();
    await Promise.all([
      loadDepartmentData(),
      loadDesignationsForDepartment(selectedDepartment),
      loadReportToOptions(selectedDepartment)
    ]);
  }, [clearCache, loadDepartmentData, loadDesignationsForDepartment, loadReportToOptions, selectedDepartment]);

  // Auto-load data when dependencies change
  useEffect(() => {
    if (selectedDepartment) {
      loadDesignationsForDepartment(selectedDepartment);
      loadReportToOptions(selectedDepartment);
    }
  }, [selectedDepartment, loadDesignationsForDepartment, loadReportToOptions]);

  return {
    // Data
    departmentOptions,
    designationOptions,
    reportToOptions,
    
    // Loading state
    loading,
    
    // Actions
    loadDepartmentData,
    loadDesignationsForDepartment,
    loadReportToOptions,
    refreshData,
    clearCache,
    
    // Utilities
    getDepartmentById,
    getDesignationById,
    getUserById,
    validateDepartmentDesignation,
    
    // Raw data (for advanced usage)
    departmentData,
    designationData,
    usersData
  };
};

export default useDepartmentData;
