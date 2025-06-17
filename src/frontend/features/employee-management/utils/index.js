/**
 * Employee Management Utilities
 * ISO 25010 Quality Characteristic: Maintainability - Reusability
 */

import { Employee, Department, Designation, AttendanceType, EmployeeStatus } from '../types';

// Employee Status Utilities
export const getEmployeeStatusColor = (status: string) => {
  const statusColors = {
    active: 'success',
    inactive: 'warning', 
    suspended: 'danger',
    terminated: 'default'
  };
  return statusColors[status] || 'default';
};

export const getEmployeeStatusLabel = (status: string) => {
  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended', 
    terminated: 'Terminated'
  };
  return statusLabels[status] || status;
};

// Employee Name Utilities
export const getEmployeeFullName = (employee: Employee) => {
  if (!employee) return '';
  return `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
};

export const getEmployeeInitials = (employee: Employee) => {
  if (!employee) return '';
  const firstName = employee.first_name || '';
  const lastName = employee.last_name || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getEmployeeDisplayName = (employee: Employee) => {
  const fullName = getEmployeeFullName(employee);
  return fullName || employee.email || 'Unknown Employee';
};

// Employee Avatar Utilities
export const getEmployeeAvatarUrl = (employee: Employee) => {
  if (employee.profile_image) {
    // Check if it's a full URL or relative path
    if (employee.profile_image.startsWith('http')) {
      return employee.profile_image;
    }
    return `/storage/${employee.profile_image}`;
  }
  return null;
};

export const getEmployeeAvatarFallback = (employee: Employee) => {
  return getEmployeeInitials(employee) || '?';
};

// Department & Designation Utilities
export const getDepartmentName = (employee: Employee, departments: Department[]) => {
  if (employee.department) {
    return employee.department.name;
  }
  if (employee.department_id) {
    const department = departments.find(d => d.id === employee.department_id);
    return department?.name || 'Unknown Department';
  }
  return 'No Department';
};

export const getDesignationTitle = (employee: Employee, designations: Designation[]) => {
  if (employee.designation) {
    return employee.designation.title;
  }
  if (employee.designation_id) {
    const designation = designations.find(d => d.id === employee.designation_id);
    return designation?.title || 'Unknown Designation';
  }
  return 'No Designation';
};

export const getAttendanceTypeName = (employee: Employee, attendanceTypes: AttendanceType[]) => {
  if (employee.attendance_type) {
    return employee.attendance_type.name;
  }
  if (employee.attendance_type_id) {
    const attendanceType = attendanceTypes.find(at => at.id === employee.attendance_type_id);
    return attendanceType?.name || 'Unknown Type';
  }
  return 'No Attendance Type';
};

// Date Utilities
export const formatEmployeeHireDate = (employee: Employee) => {
  if (!employee.hire_date) return 'Not specified';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(employee.hire_date));
};

export const getEmployeeTenure = (employee: Employee) => {
  if (!employee.hire_date) return 'Unknown';
  
  const hireDate = new Date(employee.hire_date);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - hireDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
};

// Search and Filter Utilities
export const filterEmployees = (employees: Employee[], searchTerm: string) => {
  if (!searchTerm) return employees;
  
  const term = searchTerm.toLowerCase();
  return employees.filter(employee => 
    getEmployeeFullName(employee).toLowerCase().includes(term) ||
    employee.email.toLowerCase().includes(term) ||
    employee.employee_id?.toLowerCase().includes(term) ||
    employee.phone?.toLowerCase().includes(term)
  );
};

export const sortEmployees = (employees: Employee[], sortField: string, sortDirection: 'asc' | 'desc') => {
  return [...employees].sort((a, b) => {
    let aValue: any = '';
    let bValue: any = '';
    
    switch (sortField) {
      case 'name':
        aValue = getEmployeeFullName(a);
        bValue = getEmployeeFullName(b);
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'employee_id':
        aValue = a.employee_id || '';
        bValue = b.employee_id || '';
        break;
      case 'hire_date':
        aValue = a.hire_date ? new Date(a.hire_date) : new Date(0);
        bValue = b.hire_date ? new Date(b.hire_date) : new Date(0);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a[sortField] || '';
        bValue = b[sortField] || '';
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Validation Utilities
export const validateEmployeeEmail = (email: string, existingEmployees: Employee[] = [], currentEmployeeId?: number) => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  
  const existingEmployee = existingEmployees.find(emp => 
    emp.email.toLowerCase() === email.toLowerCase() && emp.id !== currentEmployeeId
  );
  if (existingEmployee) return 'Email already exists';
  
  return null;
};

export const validateEmployeeId = (employeeId: string, existingEmployees: Employee[] = [], currentEmployeeId?: number) => {
  if (!employeeId) return null; // Employee ID is optional
  
  const existingEmployee = existingEmployees.find(emp => 
    emp.employee_id === employeeId && emp.id !== currentEmployeeId
  );
  if (existingEmployee) return 'Employee ID already exists';
  
  return null;
};

export const validateEmployeePhone = (phone: string) => {
  if (!phone) return null; // Phone is optional
  
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) return 'Invalid phone number format';
  
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
  
  return null;
};

// Export Utilities
export const prepareEmployeeExportData = (employees: Employee[], departments: Department[], designations: Designation[]) => {
  return employees.map(employee => ({
    'Employee ID': employee.employee_id || '',
    'First Name': employee.first_name,
    'Last Name': employee.last_name,
    'Full Name': getEmployeeFullName(employee),
    'Email': employee.email,
    'Phone': employee.phone || '',
    'Department': getDepartmentName(employee, departments),
    'Designation': getDesignationTitle(employee, designations),
    'Hire Date': formatEmployeeHireDate(employee),
    'Tenure': getEmployeeTenure(employee),
    'Status': getEmployeeStatusLabel(employee.status),
    'Created At': new Date(employee.created_at).toLocaleDateString(),
    'Updated At': new Date(employee.updated_at).toLocaleDateString()
  }));
};

// Permission Utilities
export const canEditEmployee = (currentUser: any, targetEmployee: Employee) => {
  // Implement permission logic based on roles and policies
  if (!currentUser) return false;
  
  // Super admin can edit all
  if (currentUser.roles?.some(role => role.name === 'super-admin')) return true;
  
  // HR can edit employees in their department
  if (currentUser.roles?.some(role => role.name === 'hr-manager')) return true;
  
  // Department managers can edit employees in their department
  if (currentUser.roles?.some(role => role.name === 'department-manager')) {
    return currentUser.department_id === targetEmployee.department_id;
  }
  
  // Users can only edit their own profile
  return currentUser.id === targetEmployee.id;
};

export const canDeleteEmployee = (currentUser: any, targetEmployee: Employee) => {
  // Implement permission logic for deletion
  if (!currentUser) return false;
  
  // Super admin can delete all (except themselves)
  if (currentUser.roles?.some(role => role.name === 'super-admin')) {
    return currentUser.id !== targetEmployee.id;
  }
  
  // HR managers can delete employees (except themselves)
  if (currentUser.roles?.some(role => role.name === 'hr-manager')) {
    return currentUser.id !== targetEmployee.id;
  }
  
  return false;
};

// Batch Operations
export const getBatchUpdatePayload = (employeeIds: number[], updateData: Partial<Employee>) => {
  return {
    employee_ids: employeeIds,
    update_data: updateData
  };
};

export const groupEmployeesByDepartment = (employees: Employee[], departments: Department[]) => {
  const grouped = {};
  
  departments.forEach(dept => {
    grouped[dept.name] = employees.filter(emp => emp.department_id === dept.id);
  });
  
  // Add employees without department
  const noDepartment = employees.filter(emp => !emp.department_id);
  if (noDepartment.length > 0) {
    grouped['No Department'] = noDepartment;
  }
  
  return grouped;
};
