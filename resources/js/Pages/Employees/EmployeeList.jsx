import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, usePage } from "@inertiajs/react";
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  Grow, 
  Fade,
  CircularProgress
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
  SelectItem,
  Pagination
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
  PencilIcon,
  CheckCircleIcon,
  TrophyIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import EmployeeTable from "@/Tables/EmployeeTable.jsx";
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeesList = ({ title, departments, designations, attendanceTypes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for employee data with server-side pagination
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    designation: 'all',
    attendanceType: 'all'
  });
  
  // View mode (table or grid)
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0
  });

  // Stats - Updated to match comprehensive backend stats structure
  const [stats, setStats] = useState({
    overview: {
      total_employees: 0,
      active_employees: 0,
      inactive_employees: 0,
      total_departments: 0,
      total_designations: 0,
      total_attendance_types: 0
    },
    distribution: {
      by_department: [],
      by_designation: [],
      by_attendance_type: []
    },
    hiring_trends: {
      recent_hires: {
        last_30_days: 0,
        last_90_days: 0,
        last_year: 0
      },
      monthly_growth_rate: 0,
      current_month_hires: 0
    },
    workforce_health: {
      status_ratio: {
        active_percentage: 0,
        inactive_percentage: 0,
        retention_rate: 0
      },
      retention_rate: 0,
      turnover_rate: 0
    },
    quick_metrics: {
      headcount: 0,
      active_ratio: 0,
      department_diversity: 0,
      role_diversity: 0,
      recent_activity: 0
    }
  });

  // Fetch employees with pagination and filters
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(route('employees.paginate'), {
        params: {
          page: pagination.currentPage,
          perPage: pagination.perPage,
          search: filters.search,
          department: filters.department,
          designation: filters.designation,
          attendanceType: filters.attendanceType
        }
      });

      console.log(data)
      
      setEmployees(data.employees.data);
      setTotalRows(data.employees.total);
      setLastPage(data.employees.last_page);
      setPagination(prev => ({
        ...prev,
        total: data.employees.total
      }));
      
      // Update stats if included in response
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees data');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, filters]);

  // Fetch employee stats separately
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(route('employees.stats'));
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching employee stats:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [fetchEmployees, fetchStats]);

  // Handle filter changes
  const handleSearchChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on search
  }, []);

  const handleDepartmentFilterChange = useCallback((value) => {
    setFilters(prev => ({ 
      ...prev, 
      department: value,
      designation: value !== 'all' ? 'all' : prev.designation // Reset designation when department changes
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleDesignationFilterChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, designation: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleAttendanceTypeFilterChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, attendanceType: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle pagination changes
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleRowsPerPageChange = useCallback((perPage) => {
    setPagination(prev => ({ ...prev, perPage: perPage, currentPage: 1 }));
  }, []);

  // Optimistic updates
  const updateEmployeeOptimized = useCallback((id, updatedFields) => {
    setEmployees(prev => 
      prev.map(employee => 
        employee.id === id ? { ...employee, ...updatedFields } : employee
      )
    );
  }, []);

  const deleteEmployeeOptimized = useCallback((id) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
    setTotalRows(prev => prev - 1);
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1
    }));
    fetchStats(); // Refresh stats after deletion
  }, [fetchStats]);



  // Get filtered designations based on selected department
  const filteredDesignations = useMemo(() => {
    if (filters.department === 'all') return designations;
    return designations.filter(d => d.department_id === parseInt(filters.department));
  }, [designations, filters.department]);

  // Prepare comprehensive stats data for StatsCards component
  const statsData = useMemo(() => [
    {
      title: "Total Employees",
      value: stats.overview?.total_employees || 0,
      icon: <UsersIcon />,
      color: "text-blue-400",
      iconBg: "bg-blue-500/20",
      description: "Total Headcount"
    },
    {
      title: "Active Employees", 
      value: stats.overview?.active_employees || 0,
      icon: <CheckCircleIcon />,
      color: "text-green-400",
      iconBg: "bg-green-500/20", 
      description: `${stats.workforce_health?.status_ratio?.active_percentage || 0}% Active`
    },
    {
      title: "Departments",
      value: stats.overview?.total_departments || 0,
      icon: <BuildingOfficeIcon />,
      color: "text-purple-400", 
      iconBg: "bg-purple-500/20",
      description: "Department Diversity"
    },
    {
      title: "Designations",
      value: stats.overview?.total_designations || 0,
      icon: <BriefcaseIcon />,
      color: "text-orange-400",
      iconBg: "bg-orange-500/20",
      description: "Role Diversity"
    },
    {
      title: "Retention Rate",
      value: `${stats.workforce_health?.retention_rate || 0}%`,
      icon: <TrophyIcon />,
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
      description: "Employee Retention"
    },
    {
      title: "Recent Hires",
      value: stats.hiring_trends?.recent_hires?.last_30_days || 0,
      icon: <UserPlusIcon />,
      color: "text-cyan-400",
      iconBg: "bg-cyan-500/20",
      description: "Last 30 Days"
    },
    {
      title: "Growth Rate",
      value: `${stats.hiring_trends?.monthly_growth_rate || 0}%`,
      icon: <ChartBarIcon />,
      color: "text-pink-400",
      iconBg: "bg-pink-500/20",
      description: "Monthly Growth"
    },
    {
      title: "Attendance Types",
      value: stats.overview?.total_attendance_types || 0,
      icon: <ClockIcon />,
      color: "text-indigo-400",
      iconBg: "bg-indigo-500/20",
      description: "Available Types"
    }
  ], [stats]);

  // Grid card component for employee display
  const EmployeeCard = ({ user, index }) => {
    const department = departments?.find(d => d.id === user.department_id);
    const designation = designations?.find(d => d.id === user.designation_id);
    const attendanceType = attendanceTypes?.find(a => a.id === user.attendance_type_id);

    return (
      <Card 
        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer h-full"
        onPress={() => window.location.href = route('profile', { user: user.id })}
      >
        <CardBody className="p-4 flex flex-col h-full">
          {/* Card Header with Employee Info */}
          <div className="flex items-start gap-3 mb-3 pb-3 border-b border-white/10">
            <div className="flex-shrink-0">
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
            </div>
            <div className="flex-1 min-w-0 flex justify-end">
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
          </div>
          
          {/* Card Content */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Contact Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <EnvelopeIcon className="w-4 h-4 text-default-400 flex-shrink-0" />
                <span className="text-default-600 text-xs truncate">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <PhoneIcon className="w-4 h-4 text-default-400 flex-shrink-0" />
                  <span className="text-default-600 text-xs">{user?.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Card Footer with Tags */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
            {/* Department */}
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
            
            {/* Designation */}
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

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Department Distribution */}
                  <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                    <Typography variant="h6" className="font-semibold text-foreground mb-4">
                      Department Distribution
                    </Typography>
                    <div className="space-y-3">
                      {stats.distribution?.by_department?.slice(0, 5).map((dept, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-default-600">{dept.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${dept.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-default-500 w-8">{dept.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hiring Trends */}
                  <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                    <Typography variant="h6" className="font-semibold text-foreground mb-4">
                      Hiring Trends
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-600">Last 30 Days</span>
                        <span className="text-sm font-medium text-foreground">
                          {stats.hiring_trends?.recent_hires?.last_30_days || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-600">Last 90 Days</span>
                        <span className="text-sm font-medium text-foreground">
                          {stats.hiring_trends?.recent_hires?.last_90_days || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-600">This Year</span>
                        <span className="text-sm font-medium text-foreground">
                          {stats.hiring_trends?.recent_hires?.last_year || 0}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-default-600">Monthly Growth</span>
                          <span className={`text-sm font-medium ${(stats.hiring_trends?.monthly_growth_rate || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.hiring_trends?.monthly_growth_rate || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workforce Health */}
                  <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                    <Typography variant="h6" className="font-semibold text-foreground mb-4">
                      Workforce Health
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-600">Retention Rate</span>
                        <span className="text-sm font-medium text-green-400">
                          {stats.workforce_health?.retention_rate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-600">Turnover Rate</span>
                        <span className="text-sm font-medium text-orange-400">
                          {stats.workforce_health?.turnover_rate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-default-600">Active Employees</span>
                        <span className="text-sm font-medium text-blue-400">
                          {stats.workforce_health?.status_ratio?.active_percentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Type Distribution */}
                  <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
                    <Typography variant="h6" className="font-semibold text-foreground mb-4">
                      Attendance Types
                    </Typography>
                    <div className="space-y-3">
                      {stats.distribution?.by_attendance_type?.map((type, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-default-600">{type.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                style={{ width: `${type.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-default-500 w-8">{type.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      label="Search Employees"
                      variant="bordered"
                      placeholder="Search by name, email, or employee ID..."
                      value={filters.search}
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
                          selectedKeys={filters.department !== 'all' ? [filters.department] : []}
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
                          selectedKeys={filters.designation !== 'all' ? [filters.designation] : []}
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
                            selectedKeys={filters.attendanceType !== 'all' ? [filters.attendanceType] : []}
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
                      {(filters.search || filters.department !== 'all' || filters.designation !== 'all' || filters.attendanceType !== 'all') && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                          {filters.search && (
                            <Chip
                              variant="flat"
                              color="primary"
                              size="sm"
                              onClose={() => setFilters(prev => ({ ...prev, search: '' }))}
                            >
                              Search: {filters.search}
                            </Chip>
                          )}
                          {filters.department !== 'all' && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              size="sm"
                              onClose={() => setFilters(prev => ({ ...prev, department: 'all' }))}
                            >
                              Department: {departments?.find(d => d.id === parseInt(filters.department))?.name}
                            </Chip>
                          )}
                          {filters.designation !== 'all' && (
                            <Chip
                              variant="flat"
                              color="warning"
                              size="sm"
                              onClose={() => setFilters(prev => ({ ...prev, designation: 'all' }))}
                            >
                              Designation: {designations?.find(d => d.id === parseInt(filters.designation))?.title}
                            </Chip>
                          )}
                          {filters.attendanceType !== 'all' && (
                            <Chip
                              variant="flat"
                              color="success"
                              size="sm"
                              onClose={() => setFilters(prev => ({ ...prev, attendanceType: 'all' }))}
                            >
                              Attendance: {attendanceTypes?.find(t => t.id === parseInt(filters.attendanceType))?.name}
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
                        ({totalRows} {totalRows === 1 ? 'employee' : 'employees'})
                      </span>
                    </Typography>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <CircularProgress size={40} />
                      <Typography className="mt-4" color="textSecondary">
                        Loading employees data...
                      </Typography>
                    </div>
                  ) : viewMode === 'table' ? (
                    <EmployeeTable 
                      allUsers={employees} 
                      departments={departments}
                      designations={designations}
                      attendanceTypes={attendanceTypes}
                      setUsers={setEmployees}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      pagination={pagination}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handleRowsPerPageChange}
                      totalUsers={totalRows}
                      loading={loading}
                      updateEmployeeOptimized={updateEmployeeOptimized}
                      deleteEmployeeOptimized={deleteEmployeeOptimized}
                    />
                  ) : (
                    <div className="p-4">
                      {employees.length > 0 ? (
                        <div className={`grid gap-4 ${
                          isMobile 
                            ? 'grid-cols-1' 
                            : isTablet 
                              ? 'grid-cols-2' 
                              : 'grid-cols-3 xl:grid-cols-4'
                        }`}>
                          {employees.map((user, index) => (
                            <EmployeeCard key={user.id} user={user} index={index} />
                          ))}
                        </div>
                      ) : (
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
                      
                      {/* Pagination for Grid View */}
                      {employees.length > 0 && (
                        <div className="flex justify-center mt-6 border-t border-white/10 pt-4">
                          <Pagination
                            total={Math.ceil(totalRows / pagination.perPage)}
                            initialPage={pagination.currentPage}
                            page={pagination.currentPage}
                            onChange={handlePageChange}
                            size={isMobile ? "sm" : "md"}
                            variant="bordered"
                            showControls
                            classNames={{
                              item: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                              cursor: "bg-white/20 backdrop-blur-md border-white/20",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
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
