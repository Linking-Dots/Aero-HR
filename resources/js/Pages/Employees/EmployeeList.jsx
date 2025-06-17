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
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import EmployeeTable from '@/Tables/EmployeeTable.jsx';

const EmployeesList = ({ title, allUsers, departments, designations, attendanceTypes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState(allUsers || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState('all');

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || 
        user.department === parseInt(departmentFilter);
      
      const matchesDesignation = designationFilter === 'all' || 
        user.designation === parseInt(designationFilter);

      const matchesAttendanceType = attendanceTypeFilter === 'all' || 
        user.attendance_type_id === parseInt(attendanceTypeFilter);

      return matchesSearch && matchesDepartment && matchesDesignation && matchesAttendanceType;
    });
  }, [users, searchQuery, departmentFilter, designationFilter, attendanceTypeFilter]);

  // Filter handlers
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleDepartmentFilterChange = useCallback((value) => {
    setDepartmentFilter(value);
    if (value !== 'all') {
      setDesignationFilter('all'); // Reset designation when department changes
    }
  }, []);

  const handleDesignationFilterChange = useCallback((value) => {
    setDesignationFilter(value);
  }, []);

  const handleAttendanceTypeFilterChange = useCallback((value) => {
    setAttendanceTypeFilter(value);
  }, []);

  // Stable setUsers callback
  const handleUsersUpdate = useCallback((updatedUsers) => {
    setUsers(updatedUsers);
  }, []);

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    withDepartment: users.filter(u => u.department).length,
    withDesignation: users.filter(u => u.designation).length,
    filtered: filteredUsers.length
  }), [users, filteredUsers]);

  // Get filtered designations based on selected department
  const filteredDesignations = useMemo(() => {
    if (departmentFilter === 'all') return designations;
    return designations.filter(d => d.department_id === parseInt(departmentFilter));
  }, [designations, departmentFilter]);

  return (
    <>
      <Head title={title} />

      <Box 
        className="min-h-screen p-2 sm:p-4 md:p-6"
        sx={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        }}
      >
        <Grow in timeout={800}>
          <div className="max-w-7xl mx-auto">
            <GlassCard>
              {/* Header Section */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-8 h-8 text-blue-400" />
                    <div>
                      <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                      >
                        Employee Directory
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Manage employee information, departments, and designations
                      </Typography>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="flat"
                      color="primary"
                      size={isMobile ? "sm" : "md"}
                      startContent={<UserPlusIcon className="w-4 h-4" />}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    >
                      {isMobile ? "Add" : "Add Employee"}
                    </Button>
                  </div>
                </div>

                {/* Statistics Cards */}
                <Fade in timeout={1000}>
                  <div className={`grid gap-4 mb-6 ${
                    isMobile 
                      ? 'grid-cols-2' 
                      : isTablet 
                        ? 'grid-cols-3' 
                        : 'grid-cols-4'
                  }`}>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <UsersIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-bold text-blue-400">
                            {stats.total}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Total Employees
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <BuildingOfficeIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-bold text-green-400">
                            {stats.withDepartment}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            With Department
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <BriefcaseIcon className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-bold text-orange-400">
                            {stats.withDesignation}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            With Designation
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <FunnelIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-bold text-purple-400">
                            {stats.filtered}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Filtered
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fade>

                {/* Filters Section */}
                <Fade in timeout={1200}>
                  <div className="mb-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="w-full sm:flex-1">
                          <Input
                            label="Search Employees"
                            variant="bordered"
                            placeholder="Search by name, email, or employee ID..."
                            value={searchQuery}
                            onValueChange={handleSearchChange}
                            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                            classNames={{
                              input: "bg-transparent",
                              inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            }}
                            size={isMobile ? "sm" : "md"}
                          />
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <div className="flex-1 sm:min-w-[150px]">
                            <select
                              className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              value={departmentFilter}
                              onChange={(e) => handleDepartmentFilterChange(e.target.value)}
                            >
                              <option value="all">All Departments</option>
                              {departments?.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1 sm:min-w-[150px]">
                            <select
                              className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              value={designationFilter}
                              onChange={(e) => handleDesignationFilterChange(e.target.value)}
                              
                            >
                              <option value="all">All Designations</option>
                              {filteredDesignations?.map(desig => (
                                <option key={desig.id} value={desig.id}>
                                  {desig.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          {!isMobile && (
                            <div className="flex-1 sm:min-w-[150px]">
                              <select
                                className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={attendanceTypeFilter}
                                onChange={(e) => handleAttendanceTypeFilterChange(e.target.value)}
                              >
                                <option value="all">All Attendance Types</option>
                                {attendanceTypes?.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {type.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Active Filters */}
                      {(searchQuery || departmentFilter !== 'all' || designationFilter !== 'all' || attendanceTypeFilter !== 'all') && (
                        <div className="flex flex-wrap gap-2">
                          {searchQuery && (
                            <Chip
                              variant="flat"
                              color="primary"
                              size="sm"
                              onClose={() => setSearchQuery('')}
                            >
                              Search: {searchQuery}
                            </Chip>
                          )}
                          {departmentFilter !== 'all' && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              size="sm"
                              onClose={() => setDepartmentFilter('all')}
                            >
                              Department: {departments?.find(d => d.id === parseInt(departmentFilter))?.name}
                            </Chip>
                          )}
                          {designationFilter !== 'all' && (
                            <Chip
                              variant="flat"
                              color="warning"
                              size="sm"
                              onClose={() => setDesignationFilter('all')}
                            >
                              Designation: {designations?.find(d => d.id === parseInt(designationFilter))?.title}
                            </Chip>
                          )}
                          {attendanceTypeFilter !== 'all' && (
                            <Chip
                              variant="flat"
                              color="success"
                              size="sm"
                              onClose={() => setAttendanceTypeFilter('all')}
                            >
                              Attendance: {attendanceTypes?.find(t => t.id === parseInt(attendanceTypeFilter))?.name}
                            </Chip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Fade>

                {/* Employee Table */}
                <Fade in timeout={1400}>
                  <div className="overflow-hidden rounded-lg">
                    <EmployeeTable 
                      allUsers={filteredUsers} 
                      departments={departments}
                      designations={designations}
                      attendanceTypes={attendanceTypes}
                      setUsers={handleUsersUpdate}
                      isMobile={isMobile}
                      isTablet={isTablet}
                    />
                  </div>
                </Fade>
              </div>
            </GlassCard>
          </div>
        </Grow>
      </Box>
    </>
  );
};

EmployeesList.layout = (page) => <App>{page}</App>;
export default EmployeesList;
