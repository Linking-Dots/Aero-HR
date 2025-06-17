/**
 * Employee Table Utilities
 * 
 * Utility functions for employee table operations including
 * data processing, filtering, and formatting.
 * 
 * @module EmployeeTableUtils
 */

/**
 * Filter employees by department
 * @param {Array} employees - Array of employee objects
 * @param {number} departmentId - Department ID to filter by
 * @returns {Array} Filtered employees
 */
export const filterEmployeesByDepartment = (employees, departmentId) => {
  if (!employees || !departmentId) return employees || [];
  return employees.filter(emp => emp.department === departmentId);
};

/**
 * Filter employees by designation
 * @param {Array} employees - Array of employee objects
 * @param {number} designationId - Designation ID to filter by
 * @returns {Array} Filtered employees
 */
export const filterEmployeesByDesignation = (employees, designationId) => {
  if (!employees || !designationId) return employees || [];
  return employees.filter(emp => emp.designation === designationId);
};

/**
 * Filter employees by attendance type
 * @param {Array} employees - Array of employee objects
 * @param {number} attendanceTypeId - Attendance type ID to filter by
 * @returns {Array} Filtered employees
 */
export const filterEmployeesByAttendanceType = (employees, attendanceTypeId) => {
  if (!employees || !attendanceTypeId) return employees || [];
  return employees.filter(emp => 
    emp.attendance_type_id === attendanceTypeId || 
    emp.attendance_type?.id === attendanceTypeId
  );
};

/**
 * Search employees by name, email, or employee ID
 * @param {Array} employees - Array of employee objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered employees
 */
export const searchEmployees = (employees, searchTerm) => {
  if (!employees || !searchTerm) return employees || [];
  
  const term = searchTerm.toLowerCase().trim();
  return employees.filter(emp => 
    emp.name?.toLowerCase().includes(term) ||
    emp.email?.toLowerCase().includes(term) ||
    emp.employee_id?.toLowerCase().includes(term) ||
    emp.phone?.includes(term)
  );
};

/**
 * Sort employees by field
 * @param {Array} employees - Array of employee objects
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted employees
 */
export const sortEmployees = (employees, field, direction = 'asc') => {
  if (!employees || !field) return employees || [];
  
  const sorted = [...employees].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Handle nested objects
    if (field.includes('.')) {
      const keys = field.split('.');
      aVal = keys.reduce((obj, key) => obj?.[key], a);
      bVal = keys.reduce((obj, key) => obj?.[key], b);
    }
    
    // Handle null/undefined values
    if (!aVal && !bVal) return 0;
    if (!aVal) return direction === 'asc' ? 1 : -1;
    if (!bVal) return direction === 'asc' ? -1 : 1;
    
    // Handle different data types
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // Convert to string for comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    return direction === 'asc' 
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });
  
  return sorted;
};

/**
 * Get employee statistics
 * @param {Array} employees - Array of employee objects
 * @param {Array} departments - Array of department objects
 * @param {Array} designations - Array of designation objects
 * @param {Array} attendanceTypes - Array of attendance type objects
 * @returns {Object} Employee statistics
 */
export const getEmployeeStatistics = (employees, departments = [], designations = [], attendanceTypes = []) => {
  if (!employees || !Array.isArray(employees)) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      departments: {},
      designations: {},
      attendanceTypes: {},
      withoutDepartment: 0,
      withoutDesignation: 0,
      withoutAttendanceType: 0
    };
  }
  
  const stats = {
    total: employees.length,
    active: 0,
    inactive: 0,
    departments: {},
    designations: {},
    attendanceTypes: {},
    withoutDepartment: 0,
    withoutDesignation: 0,
    withoutAttendanceType: 0
  };
  
  employees.forEach(emp => {
    // Active/inactive count
    if (emp.active !== false) {
      stats.active++;
    } else {
      stats.inactive++;
    }
    
    // Department stats
    if (emp.department) {
      const dept = departments.find(d => d.id === emp.department);
      const deptName = dept?.name || `Department ${emp.department}`;
      stats.departments[deptName] = (stats.departments[deptName] || 0) + 1;
    } else {
      stats.withoutDepartment++;
    }
    
    // Designation stats
    if (emp.designation) {
      const desig = designations.find(d => d.id === emp.designation);
      const desigName = desig?.title || `Designation ${emp.designation}`;
      stats.designations[desigName] = (stats.designations[desigName] || 0) + 1;
    } else {
      stats.withoutDesignation++;
    }
    
    // Attendance type stats
    const attendanceTypeId = emp.attendance_type_id || emp.attendance_type?.id;
    if (attendanceTypeId) {
      const type = attendanceTypes.find(t => t.id === attendanceTypeId);
      const typeName = type?.name || `Type ${attendanceTypeId}`;
      stats.attendanceTypes[typeName] = (stats.attendanceTypes[typeName] || 0) + 1;
    } else {
      stats.withoutAttendanceType++;
    }
  });
  
  return stats;
};

/**
 * Validate employee data
 * @param {Object} employee - Employee object to validate
 * @returns {Object} Validation result with errors
 */
export const validateEmployeeData = (employee) => {
  const errors = {};
  
  if (!employee.name || employee.name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  
  if (!employee.email || !isValidEmail(employee.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (employee.phone && !isValidPhone(employee.phone)) {
    errors.phone = 'Valid phone number is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if phone number is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
const isValidPhone = (phone) => {
  // Basic phone validation - adjust as needed
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Format employee data for display
 * @param {Object} employee - Employee object
 * @param {Array} departments - Available departments
 * @param {Array} designations - Available designations
 * @param {Array} attendanceTypes - Available attendance types
 * @returns {Object} Formatted employee data
 */
export const formatEmployeeData = (employee, departments = [], designations = [], attendanceTypes = []) => {
  if (!employee) return null;
  
  const dept = departments.find(d => d.id === employee.department);
  const desig = designations.find(d => d.id === employee.designation);
  const attendanceTypeId = employee.attendance_type_id || employee.attendance_type?.id;
  const attendanceType = attendanceTypes.find(t => t.id === attendanceTypeId);
  
  return {
    ...employee,
    departmentName: dept?.name || 'Not assigned',
    designationName: desig?.title || 'Not assigned',
    attendanceTypeName: attendanceType?.name || 'Not assigned',
    fullName: employee.name,
    displayId: employee.employee_id || `ID-${employee.id}`,
    joinDate: employee.date_of_joining || 'Not specified',
    isActive: employee.active !== false
  };
};

/**
 * Export employees data to CSV format
 * @param {Array} employees - Array of employee objects
 * @param {Array} departments - Available departments
 * @param {Array} designations - Available designations
 * @param {Array} attendanceTypes - Available attendance types
 * @returns {string} CSV formatted string
 */
export const exportEmployeesToCSV = (employees, departments = [], designations = [], attendanceTypes = []) => {
  if (!employees || employees.length === 0) return '';
  
  const headers = [
    'Name',
    'Employee ID',
    'Email',
    'Phone',
    'Department',
    'Designation',
    'Attendance Type',
    'Join Date',
    'Status'
  ];
  
  const rows = employees.map(emp => {
    const formatted = formatEmployeeData(emp, departments, designations, attendanceTypes);
    return [
      formatted.name || '',
      formatted.displayId || '',
      formatted.email || '',
      formatted.phone || '',
      formatted.departmentName || '',
      formatted.designationName || '',
      formatted.attendanceTypeName || '',
      formatted.joinDate || '',
      formatted.isActive ? 'Active' : 'Inactive'
    ].map(value => `"${String(value).replace(/"/g, '""')}"`);
  });
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

/**
 * Get filtered designations for a department
 * @param {Array} designations - All designations
 * @param {number} departmentId - Department ID
 * @returns {Array} Filtered designations
 */
export const getDesignationsForDepartment = (designations, departmentId) => {
  if (!designations || !departmentId) return [];
  return designations.filter(desig => desig.department_id === departmentId);
};

/**
 * Paginate employees array
 * @param {Array} employees - Array of employees
 * @param {number} page - Current page (1-based)
 * @param {number} perPage - Items per page
 * @returns {Object} Pagination result
 */
export const paginateEmployees = (employees, page = 1, perPage = 10) => {
  if (!employees || !Array.isArray(employees)) {
    return {
      data: [],
      total: 0,
      currentPage: page,
      lastPage: 1,
      perPage,
      from: 0,
      to: 0
    };
  }
  
  const total = employees.length;
  const lastPage = Math.ceil(total / perPage);
  const currentPage = Math.max(1, Math.min(page, lastPage));
  const from = (currentPage - 1) * perPage;
  const to = Math.min(from + perPage, total);
  const data = employees.slice(from, to);
  
  return {
    data,
    total,
    currentPage,
    lastPage,
    perPage,
    from: from + 1, // 1-based
    to
  };
};
