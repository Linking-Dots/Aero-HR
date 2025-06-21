import React, { useState, useCallback, useMemo } from 'react';
import { Head, usePage } from "@inertiajs/react";
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Grow, 
  Fade 
} from '@mui/material';
import { 
  Button, 
  Input, 
  Chip, 
  ButtonGroup,
  Card,
  CardBody,
  User,
  Divider,
  Select,
  SelectItem
} from "@heroui/react";

import { 
  UserPlusIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  BriefcaseIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  UserIcon,
  ClockIcon,
  Squares2X2Icon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import EmployeeTable from "@/Tables/EmployeeTable.jsx";



const EmployeesList = ({ title, allUsers, departments, designations, attendanceTypes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState(allUsers || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(false);

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

  // Prepare stats data for StatsCards component
  const statsData = useMemo(() => [
    {
      title: "Total Employees",
      value: stats.total,
      icon: <UsersIcon />,
      color: "text-blue-400",
      iconBg: "bg-blue-500/20",
      description: "Total Employees"
    },
    {
      title: "With Department", 
      value: stats.withDepartment,
      icon: <BuildingOfficeIcon />,
      color: "text-green-400",
      iconBg: "bg-green-500/20", 
      description: "With Department"
    },
    {
      title: "With Designation",
      value: stats.withDesignation,
      icon: <BriefcaseIcon />,
      color: "text-orange-400",
      iconBg: "bg-orange-500/20",
      description: "With Designation"
    },
    {
      title: "Filtered",
      value: stats.filtered,
      icon: <FunnelIcon />,
      color: "text-purple-400", 
      iconBg: "bg-purple-500/20",
      description: "Filtered"
    }
  ], [stats]);

  // Grid card component for employee display
  const EmployeeCard = ({ user, index }) => {
    const department = departments?.find(d => d.id === user.department);
    const designation = designations?.find(d => d.id === user.designation);
    const attendanceType = attendanceTypes?.find(a => a.id === user.attendance_type_id);

    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer"
            onPress={() => window.location.href = route('profile', { user: user.id })}>
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <User
              avatarProps={{ 
                radius: "lg", 
                src: user?.profile_image,
                size: "md",
                fallback: <UserIcon className="w-4 h-4" />
              }}
              name={user?.name}
              description={`ID: ${user?.employee_id || 'N/A'}`}
              classNames={{
                name: "font-semibold text-foreground text-left text-sm",
                description: "text-default-500 text-left text-xs",
                wrapper: "justify-start"
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-end mb-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-default-400 hover:text-foreground"
                  onPress={(e) => {
                    e.stopPropagation();
                    window.location.href = route('profile', { user: user.id });
                  }}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {/* Contact Info */}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1 text-default-500">
                    <EnvelopeIcon className="w-3 h-3" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-1 text-default-500">
                      <PhoneIcon className="w-3 h-3" />
                      <span>{user?.phone}</span>
                    </div>
                  )}
                </div>
                
                {/* Department & Designation */}
                <div className="flex flex-wrap gap-1">
                  {department && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="text-xs"
                      startContent={<BuildingOfficeIcon className="w-3 h-3" />}
                    >
                      {department.name}
                    </Chip>
                  )}
                  {designation && (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="text-xs"
                      startContent={<BriefcaseIcon className="w-3 h-3" />}
                    >
                      {designation.title}
                    </Chip>
                  )}
                </div>
                
                {/* Attendance Type */}
                {attendanceType && (
                  <Chip
                    size="sm"
                    variant="bordered"
                    className="text-xs"
                    startContent={<ClockIcon className="w-3 h-3" />}
                  >
                    {attendanceType.name}
                  </Chip>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <Head title={title} />

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Grow in timeout={800}>
          <GlassCard>
            <PageHeader
              title="Employee Directory"
              subtitle="Manage employee information, departments, and designations"
              icon={<UsersIcon className="w-8 h-8" />}
              variant="default"
              actionButtons={[
                {
                  label: isMobile ? "Add" : "Add Employee",
                  icon: <UserPlusIcon className="w-4 h-4" />,
                  className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                }
              ]}
            >
              <div className="p-4 sm:p-6">
                {/* Statistics Cards */}
                <StatsCards stats={statsData} className="mb-6" />

                {/* View Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
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

                  <div className="flex gap-2 items-end">
                    {/* View Toggle */}
                    <ButtonGroup variant="bordered" className="bg-white/5">
                      <Button
                        isIconOnly={isMobile}
                        color={viewMode === 'table' ? 'primary' : 'default'}
                        onPress={() => setViewMode('table')}
                        className={viewMode === 'table' ? 'bg-blue-500/20' : ''}
                      >
                        <TableCellsIcon className="w-4 h-4" />
                        {!isMobile && <span className="ml-1">Table</span>}
                      </Button>
                      <Button
                        isIconOnly={isMobile}
                        color={viewMode === 'grid' ? 'primary' : 'default'}
                        onPress={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-blue-500/20' : ''}
                      >
                        <Squares2X2Icon className="w-4 h-4" />
                        {!isMobile && <span className="ml-1">Grid</span>}
                      </Button>
                    </ButtonGroup>
                    
                    {/* Filter Toggle */}
                    <Button
                      isIconOnly={isMobile}
                      variant="bordered"
                      onPress={() => setShowFilters(!showFilters)}
                      className={showFilters ? 'bg-purple-500/20' : 'bg-white/5'}
                    >
                      <AdjustmentsHorizontalIcon className="w-4 h-4" />
                      {!isMobile && <span className="ml-1">Filters</span>}
                    </Button>
                  </div>
                </div>

                {/* Filters Section */}
                {showFilters && (
                  <Fade in timeout={300}>
                    <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select
                          label="Department"
                          variant="bordered"
                          selectedKeys={departmentFilter !== 'all' ? [departmentFilter] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] || 'all';
                            handleDepartmentFilterChange(value);
                          }}
                          classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                          }}
                        >
                          <SelectItem key="all" value="all">All Departments</SelectItem>
                          {departments?.map(dept => (
                            <SelectItem key={dept.id.toString()} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </Select>

                        <Select
                          label="Designation"
                          variant="bordered"
                          selectedKeys={designationFilter !== 'all' ? [designationFilter] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] || 'all';
                            handleDesignationFilterChange(value);
                          }}
                          classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                          }}
                        >
                          <SelectItem key="all" value="all">All Designations</SelectItem>
                          {filteredDesignations?.map(desig => (
                            <SelectItem key={desig.id.toString()} value={desig.id.toString()}>
                              {desig.title}
                            </SelectItem>
                          ))}
                        </Select>

                        {!isMobile && (
                          <Select
                            label="Attendance Type"
                            variant="bordered"
                            selectedKeys={attendanceTypeFilter !== 'all' ? [attendanceTypeFilter] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0] || 'all';
                              handleAttendanceTypeFilterChange(value);
                            }}
                            classNames={{
                              trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            }}
                          >
                            <SelectItem key="all" value="all">All Attendance Types</SelectItem>
                            {attendanceTypes?.map(type => (
                              <SelectItem key={type.id.toString()} value={type.id.toString()}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      </div>

                      {/* Active Filters */}
                      {(searchQuery || departmentFilter !== 'all' || designationFilter !== 'all' || attendanceTypeFilter !== 'all') && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
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
                  </Fade>
                )}

                {/* Content Area */}
                <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <Typography variant="h6" className="font-semibold text-foreground">
                      {viewMode === 'table' ? 'Employee Table' : 'Employee Grid'} 
                      <span className="text-sm text-default-500 ml-2">
                        ({filteredUsers.length} {filteredUsers.length === 1 ? 'employee' : 'employees'})
                      </span>
                    </Typography>
                  </div>
                  
                  <div className="max-h-[60vh] overflow-y-auto p-4">
                    {viewMode === 'table' ? (
                      <EmployeeTable 
                        allUsers={filteredUsers} 
                        departments={departments}
                        designations={designations}
                        attendanceTypes={attendanceTypes}
                        setUsers={handleUsersUpdate}
                        isMobile={isMobile}
                        isTablet={isTablet}
                      />
                    ) : (
                      <div>
                        <div className={`grid gap-4 ${
                          isMobile 
                            ? 'grid-cols-1' 
                            : isTablet 
                              ? 'grid-cols-2' 
                              : 'grid-cols-3 xl:grid-cols-4'
                        }`}>
                          {filteredUsers.map((user, index) => (
                            <EmployeeCard key={user.id} user={user} index={index} />
                          ))}
                        </div>
                        {filteredUsers.length === 0 && (
                          <div className="text-center py-8">
                            <UsersIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                            <Typography variant="body1" color="textSecondary">
                              No employees found
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Try adjusting your search or filters
                            </Typography>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </PageHeader>
          </GlassCard>
        </Grow>
      </Box>
    </>
  );
};

EmployeesList.layout = (page) => <App>{page}</App>;
export default EmployeesList;
