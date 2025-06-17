/**
 * Users Table Utility Functions
 * 
 * Comprehensive utility functions for the UsersTable organism component.
 * Provides functions for data processing, validation, filtering, and responsive design.
 */

/**
 * Get responsive column configuration based on screen size
 * @param {boolean} isMobile - Mobile screen flag
 * @param {boolean} isTablet - Tablet screen flag
 * @returns {Array} Column configuration array
 */
export const getResponsiveColumns = (isMobile, isTablet) => {
  if (isMobile) {
    return [
      { name: "Sl", uid: "sl" },
      { name: "User", uid: "user" },
      { name: "Status", uid: "status" },
      { name: "Actions", uid: "actions" }
    ];
  }
  
  if (isTablet) {
    return [
      { name: "Sl", uid: "sl" },
      { name: "User", uid: "user" },
      { name: "Role", uid: "role" },
      { name: "Status", uid: "status" },
      { name: "Actions", uid: "actions" }
    ];
  }

  return [
    { name: "Sl", uid: "sl" },
    { name: "User", uid: "user" },
    { name: "Contact", uid: "contact" },
    { name: "Role", uid: "role" },
    { name: "Status", uid: "status" },
    { name: "Actions", uid: "actions" }
  ];
};

/**
 * Filter users based on search criteria
 * @param {Array} users - Users array
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered users array
 */
export const filterUsers = (users, searchTerm) => {
  if (!searchTerm) return users;
  
  const term = searchTerm.toLowerCase();
  return users.filter(user => 
    user.name?.toLowerCase().includes(term) ||
    user.email?.toLowerCase().includes(term) ||
    user.phone?.toLowerCase().includes(term) ||
    user.roles?.some(role => role.toLowerCase().includes(term))
  );
};

/**
 * Sort users by specified field
 * @param {Array} users - Users array
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction (asc/desc)
 * @returns {Array} Sorted users array
 */
export const sortUsers = (users, field, direction = 'asc') => {
  return [...users].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle string comparisons
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    // Handle date comparisons
    if (field === 'created_at') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }
    
    // Handle role arrays
    if (field === 'roles') {
      valueA = valueA?.join(', ') || '';
      valueB = valueB?.join(', ') || '';
    }
    
    if (direction === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

/**
 * Get user statistics
 * @param {Array} users - Users array
 * @returns {Object} User statistics object
 */
export const getUserStatistics = (users) => {
  const total = users.length;
  const active = users.filter(user => user.active).length;
  const inactive = total - active;
  
  // Role distribution
  const roleDistribution = {};
  users.forEach(user => {
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      });
    }
  });
  
  // Recent users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentUsers = users.filter(user => {
    if (!user.created_at) return false;
    const createdDate = new Date(user.created_at);
    return createdDate >= thirtyDaysAgo;
  }).length;
  
  return {
    total,
    active,
    inactive,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    inactivePercentage: total > 0 ? Math.round((inactive / total) * 100) : 0,
    roleDistribution,
    recentUsers
  };
};

/**
 * Validate user data
 * @param {Object} user - User object to validate
 * @returns {Object} Validation result with errors array
 */
export const validateUser = (user) => {
  const errors = [];
  
  if (!user.name || user.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!user.email || !isValidEmail(user.email)) {
    errors.push('Valid email address is required');
  }
  
  if (user.phone && !isValidPhone(user.phone)) {
    errors.push('Phone number format is invalid');
  }
  
  if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    errors.push('At least one role must be assigned');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if phone number is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Format user data for export
 * @param {Array} users - Users array
 * @returns {Array} Formatted data for export
 */
export const formatUsersForExport = (users) => {
  return users.map((user, index) => ({
    'No.': index + 1,
    'Name': user.name || 'N/A',
    'Email': user.email || 'N/A',
    'Phone': user.phone || 'N/A',
    'Status': user.active ? 'Active' : 'Inactive',
    'Roles': user.roles ? user.roles.join(', ') : 'No roles assigned',
    'Created Date': user.created_at || 'N/A'
  }));
};

/**
 * Export users data to CSV
 * @param {Array} users - Users array
 * @param {string} filename - Export filename
 */
export const exportUsersToCSV = (users, filename = 'users_export.csv') => {
  const formattedData = formatUsersForExport(users);
  
  if (formattedData.length === 0) {
    throw new Error('No users data to export');
  }
  
  const headers = Object.keys(formattedData[0]);
  const csvContent = [
    headers.join(','),
    ...formattedData.map(row => 
      headers.map(header => `"${row[header]}"`).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Get role color based on role name
 * @param {string} roleName - Role name
 * @returns {string} Color class
 */
export const getRoleColor = (roleName) => {
  const roleColors = {
    'Administrator': 'danger',
    'Manager': 'warning',
    'Supervisor': 'primary',
    'Employee': 'default',
    'HR': 'secondary'
  };
  
  return roleColors[roleName] || 'default';
};

/**
 * Get status badge props
 * @param {boolean} isActive - User active status
 * @returns {Object} Badge props object
 */
export const getStatusBadgeProps = (isActive) => {
  return {
    color: isActive ? 'success' : 'danger',
    variant: 'flat',
    children: isActive ? 'Active' : 'Inactive'
  };
};

/**
 * Paginate users array
 * @param {Array} users - Users array
 * @param {number} page - Current page (1-based)
 * @param {number} perPage - Items per page
 * @returns {Object} Pagination result
 */
export const paginateUsers = (users, page = 1, perPage = 10) => {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedUsers = users.slice(startIndex, endIndex);
  const totalPages = Math.ceil(users.length / perPage);
  
  return {
    data: paginatedUsers,
    currentPage: page,
    totalPages,
    totalItems: users.length,
    perPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
