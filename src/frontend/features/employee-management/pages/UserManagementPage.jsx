/**
 * User Management Page Component
 * 
 * @file UserManagementPage.jsx
 * @description Administrative user management page with role assignment and user creation
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - User search and filtering
 * - Role-based user management
 * - User creation and editing
 * - Department and designation assignment
 * - Material-UI with HeroUI integration
 * 
 * @dependencies
 * - React 18+
 * - Inertia.js
 * - Material-UI
 * - HeroUI
 * - Heroicons
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Head, usePage } from "@inertiajs/react";
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Grow, 
  Fade,
  useTheme 
} from '@mui/material';
import { 
  Button,
  Input,
  Chip,
  Spacer
} from "@heroui/react";
import { 
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  ShieldCheckIcon,
  CogIcon
} from "@heroicons/react/24/outline";

// Layout and Components
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";

// Feature Components
import UsersTable from '@/Components/organisms/UsersTable';
import AddUserForm from "@/Components/molecules/AddUserForm";

/**
 * User Management Page Component
 * 
 * Provides administrative interface for user management including
 * role assignment, user creation, and system access control.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {Array} props.roles - Available user roles
 * @param {Array} props.departments - Available departments
 * @param {Array} props.designations - Available designations
 * @returns {JSX.Element} User management page
 */
const UserManagementPage = ({ title, roles, departments, designations }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // Get users from Inertia page props
  const { users = [] } = usePage().props;

  // Filtered data based on search and filters
  const filteredUsers = useMemo(() => {
    return users?.filter(user => {
      const matchesSearch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !selectedRole || 
        user.roles?.some(role => role.id === selectedRole);
      
      const matchesDepartment = !selectedDepartment || 
        user.department_id === selectedDepartment;
      
      return matchesSearch && matchesRole && matchesDepartment;
    }) || [];
  }, [users, searchTerm, selectedRole, selectedDepartment]);

  // Search handler
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Filter handlers
  const handleRoleFilter = useCallback((roleId) => {
    setSelectedRole(roleId === selectedRole ? '' : roleId);
  }, [selectedRole]);

  const handleDepartmentFilter = useCallback((departmentId) => {
    setSelectedDepartment(departmentId === selectedDepartment ? '' : departmentId);
  }, [selectedDepartment]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedDepartment('');
  }, []);

  // Form handlers
  const handleAddUser = useCallback(() => {
    setShowAddUserForm(true);
  }, []);

  const handleCloseAddUserForm = useCallback(() => {
    setShowAddUserForm(false);
  }, []);

  // Statistics
  const totalUsers = users?.length || 0;
  const activeUsers = filteredUsers.length;
  const adminUsers = users?.filter(user => 
    user.roles?.some(role => role.name?.toLowerCase().includes('admin'))
  ).length || 0;

  return (
    <App title={title}>
      <Head title={title} />
      
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
        py: 3,
        px: { xs: 2, md: 3 }
      }}>
        {/* Page Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #7c3aed 30%, #a855f7 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              User Management
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Manage user accounts, roles, and system access permissions
            </Typography>

            {/* Statistics Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(3, 1fr)' 
              }, 
              gap: 2, 
              mb: 3 
            }}>
              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <UsersIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-3" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {adminUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admin Users
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <UserIcon className="h-8 w-8 text-purple-500 mr-3" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {activeUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Filtered Results
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Box>
          </Box>
        </Fade>

        {/* Action Bar */}
        <Grow in timeout={900}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              System Users
            </Typography>
            
            <Button
              color="primary"
              variant="solid"
              startContent={<UserPlusIcon className="h-4 w-4" />}
              onPress={handleAddUser}
            >
              Add New User
            </Button>
          </Box>
        </Grow>

        {/* Search and Filters */}
        <Grow in timeout={1000}>
          <GlassCard sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              {/* Search Bar */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: showFilters ? 3 : 0,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}>
                <Input
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onValueChange={handleSearchChange}
                  startContent={<MagnifyingGlassIcon className="h-4 w-4 text-default-400" />}
                  classNames={{
                    input: "text-small",
                    inputWrapper: "h-unit-10"
                  }}
                  style={{ flex: 1 }}
                />
                
                <Button
                  variant={showFilters ? "solid" : "bordered"}
                  color={showFilters ? "primary" : "default"}
                  startContent={<FunnelIcon className="h-4 w-4" />}
                  onPress={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>

                {(searchTerm || selectedRole || selectedDepartment) && (
                  <Button
                    variant="flat"
                    color="warning"
                    onPress={clearFilters}
                  >
                    Clear All
                  </Button>
                )}
              </Box>

              {/* Filters Section */}
              {showFilters && (
                <Fade in={showFilters}>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    {/* Role Filter */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        User Roles
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {roles?.map((role) => (
                          <Chip
                            key={role.id}
                            variant={selectedRole === role.id ? "solid" : "bordered"}
                            color={selectedRole === role.id ? "secondary" : "default"}
                            onClick={() => handleRoleFilter(role.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {role.name}
                          </Chip>
                        ))}
                      </Box>
                    </Box>

                    {/* Department Filter */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Departments
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {departments?.map((dept) => (
                          <Chip
                            key={dept.id}
                            variant={selectedDepartment === dept.id ? "solid" : "bordered"}
                            color={selectedDepartment === dept.id ? "primary" : "default"}
                            onClick={() => handleDepartmentFilter(dept.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {dept.name}
                          </Chip>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>
          </GlassCard>
        </Grow>

        {/* Users Table */}
        <Grow in timeout={1200}>
          <GlassCard>
            <UsersTable 
              users={filteredUsers}
              roles={roles}
              departments={departments}
              designations={designations}
            />
          </GlassCard>
        </Grow>

        {/* Add User Form Modal */}
        {showAddUserForm && (
          <AddUserForm 
            roles={roles}
            departments={departments}
            designations={designations}
            onClose={handleCloseAddUserForm}
          />
        )}
      </Box>
    </App>
  );
};

export default UserManagementPage;
