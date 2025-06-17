/**
 * Employee Management Custom Hooks
 * ISO 25010 Quality Characteristic: Maintainability - Reusability
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'react-toastify';
import { 
  Employee, 
  EmployeeTableFilter, 
  EmployeeTableSort, 
  EmployeeFormData,
  EmployeeValidationErrors,
  UseEmployeeTableReturn,
  UseEmployeeFormReturn 
} from '../types';
import { 
  filterEmployees, 
  sortEmployees, 
  validateEmployeeEmail, 
  validateEmployeeId, 
  validateEmployeePhone 
} from '../utils';

/**
 * useEmployeeTable Hook
 * 
 * Manages employee table state including filtering, sorting, and CRUD operations.
 * Provides a comprehensive interface for employee data management.
 * 
 * @param {Employee[]} initialEmployees - Initial employee data
 * @param {Object} options - Configuration options
 * @returns {UseEmployeeTableReturn} Table management functions and state
 */
export const useEmployeeTable = (
  initialEmployees: Employee[] = [],
  options = {}
): UseEmployeeTableReturn => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<EmployeeTableFilter>({});
  const [sort, setSortState] = useState<EmployeeTableSort>({
    field: 'created_at',
    direction: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: options.perPage || 10,
    total: initialEmployees.length
  });

  // Sync with external data changes
  useEffect(() => {
    setEmployees(initialEmployees);
    setPagination(prev => ({ ...prev, total: initialEmployees.length }));
  }, [initialEmployees]);

  // Filtered and sorted employees
  const processedEmployees = useMemo(() => {
    let result = [...employees];

    // Apply filters
    if (filters.search) {
      result = filterEmployees(result, filters.search);
    }
    if (filters.department?.length) {
      result = result.filter(emp => 
        emp.department_id && filters.department.includes(emp.department_id)
      );
    }
    if (filters.designation?.length) {
      result = result.filter(emp => 
        emp.designation_id && filters.designation.includes(emp.designation_id)
      );
    }
    if (filters.status?.length) {
      result = result.filter(emp => filters.status.includes(emp.status));
    }

    // Apply sorting
    result = sortEmployees(result, sort.field, sort.direction);

    return result;
  }, [employees, filters, sort]);

  // Update employee
  const updateEmployee = useCallback(async (id: number, data: Partial<Employee>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(route('employees.update', { id }), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      const result = await response.json();
      
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, ...result.employee } : emp
      ));

      toast.success('Employee updated successfully');
      return result.employee;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update employee';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete employee
  const deleteEmployee = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(route('employees.destroy', { id }), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete employee';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<EmployeeTableFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Set sort
  const setSort = useCallback((newSort: EmployeeTableSort) => {
    setSortState(newSort);
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Using Inertia.js to refresh the current page data
      router.reload({ only: ['employees'] });
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees: processedEmployees,
    loading,
    error,
    filters,
    sort,
    pagination: {
      ...pagination,
      total: processedEmployees.length
    },
    updateEmployee,
    deleteEmployee,
    setFilters,
    setSort,
    setPage,
    refreshData
  };
};

/**
 * useEmployeeForm Hook
 * 
 * Manages employee form state, validation, and submission.
 * Provides real-time validation and error handling.
 * 
 * @param {Employee} initialEmployee - Initial employee data for editing
 * @param {Function} onSubmit - Submit handler function
 * @returns {UseEmployeeFormReturn} Form management functions and state
 */
export const useEmployeeForm = (
  initialEmployee: Employee | null = null,
  onSubmit: (data: EmployeeFormData) => Promise<void>
): UseEmployeeFormReturn => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: initialEmployee?.first_name || '',
    last_name: initialEmployee?.last_name || '',
    email: initialEmployee?.email || '',
    phone: initialEmployee?.phone || '',
    department_id: initialEmployee?.department_id || undefined,
    designation_id: initialEmployee?.designation_id || undefined,
    attendance_type_id: initialEmployee?.attendance_type_id || undefined,
    employee_id: initialEmployee?.employee_id || '',
    hire_date: initialEmployee?.hire_date || '',
    roles: initialEmployee?.roles?.map(role => role.id) || []
  });

  const [errors, setErrors] = useState<EmployeeValidationErrors>({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Validate individual field
  const validateField = useCallback((field: keyof EmployeeFormData): boolean => {
    const value = formData[field];
    let fieldError: string | null = null;

    switch (field) {
      case 'first_name':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          fieldError = 'First name is required';
        } else if (value.trim().length < 2) {
          fieldError = 'First name must be at least 2 characters';
        }
        break;

      case 'last_name':
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          fieldError = 'Last name is required';
        } else if (value.trim().length < 2) {
          fieldError = 'Last name must be at least 2 characters';
        }
        break;

      case 'email':
        fieldError = validateEmployeeEmail(value as string);
        break;

      case 'phone':
        if (value) {
          fieldError = validateEmployeePhone(value as string);
        }
        break;

      case 'employee_id':
        if (value) {
          fieldError = validateEmployeeId(value as string);
        }
        break;

      case 'hire_date':
        if (value && new Date(value as string) > new Date()) {
          fieldError = 'Hire date cannot be in the future';
        }
        break;
    }

    if (fieldError) {
      setErrors(prev => ({ ...prev, [field]: [fieldError] }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
      return true;
    }
  }, [formData]);

  // Validate all fields
  const validateAllFields = useCallback((): boolean => {
    const fields: (keyof EmployeeFormData)[] = [
      'first_name', 'last_name', 'email', 'phone', 'employee_id', 'hire_date'
    ];
    
    const validationResults = fields.map(field => validateField(field));
    return validationResults.every(result => result);
  }, [validateField]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return formData.first_name.trim().length >= 2 &&
           formData.last_name.trim().length >= 2 &&
           formData.email.trim().length > 0 &&
           Object.values(errors).every(error => !error || error.length === 0);
  }, [formData, errors]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateAllFields()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(initialEmployee ? 'Employee updated successfully' : 'Employee created successfully');
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      toast.error('Failed to save employee');
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, validateAllFields, initialEmployee]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      first_name: initialEmployee?.first_name || '',
      last_name: initialEmployee?.last_name || '',
      email: initialEmployee?.email || '',
      phone: initialEmployee?.phone || '',
      department_id: initialEmployee?.department_id || undefined,
      designation_id: initialEmployee?.designation_id || undefined,
      attendance_type_id: initialEmployee?.attendance_type_id || undefined,
      employee_id: initialEmployee?.employee_id || '',
      hire_date: initialEmployee?.hire_date || '',
      roles: initialEmployee?.roles?.map(role => role.id) || []
    });
    setErrors({});
  }, [initialEmployee]);

  // Update form data when initial employee changes
  useEffect(() => {
    resetForm();
  }, [initialEmployee, resetForm]);

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    resetForm,
    validateField,
    isValid
  };
};

/**
 * useEmployeeSearch Hook
 * 
 * Manages employee search functionality with debouncing.
 * 
 * @param {Employee[]} employees - Employee list to search
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} Search state and functions
 */
export const useEmployeeSearch = (employees: Employee[], debounceMs = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    return filterEmployees(employees, debouncedSearchTerm);
  }, [employees, debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEmployees,
    isSearching: searchTerm !== debouncedSearchTerm
  };
};

/**
 * useEmployeePermissions Hook
 * 
 * Manages employee-related permissions based on current user context.
 * 
 * @param {Object} currentUser - Current authenticated user
 * @returns {Object} Permission flags
 */
export const useEmployeePermissions = (currentUser: any) => {
  return useMemo(() => {
    if (!currentUser) {
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canExport: false,
        canViewSalary: false
      };
    }

    const userRoles = currentUser.roles?.map(role => role.name) || [];
    const isSuperAdmin = userRoles.includes('super-admin');
    const isHRManager = userRoles.includes('hr-manager');
    const isDeptManager = userRoles.includes('department-manager');

    return {
      canCreate: isSuperAdmin || isHRManager,
      canEdit: isSuperAdmin || isHRManager || isDeptManager,
      canDelete: isSuperAdmin || isHRManager,
      canExport: isSuperAdmin || isHRManager || isDeptManager,
      canViewSalary: isSuperAdmin || isHRManager
    };
  }, [currentUser]);
};
