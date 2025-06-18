/**
 * Employee List Page Component
 * 
 * @file EmployeeListPage.jsx
 * @description Main employee listing page with search, filtering, and management capabilities
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Employee search and filtering
 * - Responsive table display
 * - Employee management actions
 * - Department and designation filtering
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
  Chip
} from "@heroui/react";
import { 
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

// Layout and Components
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";

// Feature Components
import EmployeeTable from '@/Components/organisms/employee-table/EmployeeTable';

/**
 * Employee List Page Component
 * 
 * Provides comprehensive employee management interface with search,
 * filtering, and table display capabilities.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {Array} props.allUsers - List of all employee users
 * @param {Array} props.departments - Available departments
 * @param {Array} props.designations - Available designations
 * @param {Array} props.attendanceTypes - Available attendance types
 * @returns {JSX.Element} Employee list page
 */
const EmployeeListPage = ({ 
  title, 
  allUsers, 
  departments, 
  designations, 
  attendanceTypes 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filtered data based on search and filters
  const filteredUsers = useMemo(() => {
    return allUsers?.filter(user => {
      const matchesSearch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || 
        user.department_id === selectedDepartment;
      
      const matchesDesignation = !selectedDesignation || 
        user.designation_id === selectedDesignation;
      
      return matchesSearch && matchesDepartment && matchesDesignation;
    }) || [];
  }, [allUsers, searchTerm, selectedDepartment, selectedDesignation]);

  // Search handler
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Filter handlers
  const handleDepartmentFilter = useCallback((departmentId) => {
    setSelectedDepartment(departmentId === selectedDepartment ? '' : departmentId);
  }, [selectedDepartment]);

  const handleDesignationFilter = useCallback((designationId) => {
    setSelectedDesignation(designationId === selectedDesignation ? '' : designationId);
  }, [selectedDesignation]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedDesignation('');
  }, []);

  // Statistics
  const totalEmployees = allUsers?.length || 0;
  const activeEmployees = filteredUsers.length;
  const departmentCount = departments?.length || 0;

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
                background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Employee Management
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Manage and view all employee information, departments, and designations
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
                  <UserIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalEmployees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Employees
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <BuildingOfficeIcon className="h-8 w-8 text-green-500 mr-3" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {departmentCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Departments
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <BriefcaseIcon className="h-8 w-8 text-purple-500 mr-3" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {activeEmployees}
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
                  placeholder="Search employees by name, email, or ID..."
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

                {(searchTerm || selectedDepartment || selectedDesignation) && (
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

                    {/* Designation Filter */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Designations
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {designations?.map((designation) => (
                          <Chip
                            key={designation.id}
                            variant={selectedDesignation === designation.id ? "solid" : "bordered"}
                            color={selectedDesignation === designation.id ? "primary" : "default"}
                            onClick={() => handleDesignationFilter(designation.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {designation.name}
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

        {/* Employee Table */}
        <Grow in timeout={1200}>
          <GlassCard>
            <EmployeeTable 
              employees={filteredUsers}
              departments={departments}
              designations={designations}
              attendanceTypes={attendanceTypes}
            />
          </GlassCard>
        </Grow>
      </Box>
    </App>
  );
};

export default EmployeeListPage;
