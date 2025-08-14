import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage, router } from "@inertiajs/react";
import { 
  Box, 
  Typography, 
  useMediaQuery, 
  Grow, 
  Fade,
  useTheme,
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
  Switch,
  Select,
  SelectItem,
  Pagination
} from "@heroui/react";
import { 
  UserPlusIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  Squares2X2Icon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  SignalIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import UsersTable from '@/Tables/UsersTable.jsx';
import AddEditUserForm from "@/Forms/AddEditUserForm.jsx";
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersList = ({ title, roles }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for users data with server-side pagination
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Modal states
  const [openModalType, setOpenModalType] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    department: 'all'
  });
  
  // Show/Hide filters panel
  const [showFilters, setShowFilters] = useState(false);
  
  // View mode (table or grid)
  const [viewMode, setViewMode] = useState('table');
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: users.length
  });

  // Stats - Updated to match comprehensive backend stats structure
  const [stats, setStats] = useState({
    overview: {
      total_users: 0,
      active_users: 0,
      inactive_users: 0,
      deleted_users: 0,
      total_roles: 0,
      total_departments: 0
    },
    distribution: {
      by_role: [],
      by_department: [],
      by_status: []
    },
    activity: {
      recent_registrations: {
        new_users_30_days: 0,
        new_users_90_days: 0,
        new_users_year: 0,
        recently_active: 0
      },
      user_growth_rate: 0,
      current_month_registrations: 0
    },
    security: {
      access_metrics: {
        users_with_roles: 0,
        users_without_roles: 0,
        admin_users: 0,
        regular_users: 0
      },
      role_distribution: []
    },
    health: {
      status_ratio: {
        active_percentage: 0,
        inactive_percentage: 0,
        deleted_percentage: 0
      },
      system_metrics: {
        user_activation_rate: 0,
        role_coverage: 0,
        department_coverage: 0
      }
    },
    quick_metrics: {
      total_users: 0,
      active_ratio: 0,
      role_diversity: 0,
      department_diversity: 0,
      recent_activity: 0,
      system_health_score: 0
    }
  });

  // Calculate paginated users
  const paginatedUsers = useMemo(() => {
    return {
      data: users,
      total: totalRows,
      current_page: pagination.currentPage,
      per_page: pagination.perPage,
      last_page: lastPage
    };
  }, [users, totalRows, pagination.currentPage, pagination.perPage, lastPage]);

  // Fetch user stats separately
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(route('users.stats'));
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, []);

  // Fetch users data with server-side pagination
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(route('users.paginate'), {
        params: {
          page: pagination.currentPage,
          perPage: pagination.perPage,
          search: filters.search || undefined,
          role: filters.role !== 'all' ? filters.role : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          department: filters.department !== 'all' ? filters.department : undefined
        },
      });

      if (response.status === 200) {
        const { users } = response.data;
        
        // Handle paginated data
        if (users.data && Array.isArray(users.data)) {
          setUsers(users.data);
          setTotalRows(users.total || users.data.length);
          setLastPage(users.last_page || 1);
        } else if (Array.isArray(users)) {
          // Handle direct array response
          setUsers(users);
          setTotalRows(users.length);
          setLastPage(1);
        } else {
          console.error('Unexpected users data format:', users);
          setUsers([]);
          setTotalRows(0);
          setLastPage(1);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users data');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.perPage]);

  // Effect to fetch data when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Effect to fetch stats initially and then periodically
  useEffect(() => {
    fetchStats();
    // Optionally set up a refresh interval for stats
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter change
  };
  
  // Handle pagination changes
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (rowsPerPage) => {
    setPagination(prev => ({ ...prev, currentPage: 1, perPage: rowsPerPage }));
  };

  // Modal handlers
  const openModal = useCallback((modalType, user = null) => {
    setOpenModalType(modalType);
    setSelectedUser(user);
  }, []);

  const closeModal = useCallback(() => {
    setOpenModalType(null);
    setSelectedUser(null);
  }, []);

  // Stable setUsers callback
  const handleUsersUpdate = useCallback((updatedUsers) => {
    setUsers(updatedUsers);
  }, []);

  // Optimized update for a single user (edit, role, status)
  const updateUserOptimized = useCallback((updatedUser) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? { ...user, ...updatedUser } : user));
  }, []);

  // Optimized delete for a single user
  const deleteUserOptimized = useCallback((userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    // Update stats after delete
    fetchStats();
  }, [fetchStats]);

  // Optimized status toggle
  const toggleUserStatusOptimized = useCallback((userId, newStatus) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, active: newStatus } : user));
    // Update stats after status change
    fetchStats();
  }, [fetchStats]);

  // Optimized roles update
  const updateUserRolesOptimized = useCallback((userId, newRoles) => {
    // Update the user with new roles without triggering a full reload
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === userId ? { ...user, roles: newRoles } : user
    ));
    
    // No need to set loading state or fetch data again
  }, []);

  // User Card component for grid view
  const UserCard = ({ user, index }) => (
    <Card 
      className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer h-full"
      onPress={() => router.visit(route('profile', { user: user.id }))}
    >
      <CardBody className="p-4 flex flex-col h-full">
        {/* Card Header with User Info */}
        <div className="flex items-start gap-3 mb-3 pb-3 border-b border-white/10">
          <User
            avatarProps={{ 
              radius: "lg", 
              src: user?.profile_image,
              size: "md",
              fallback: <UserIcon className="w-5 h-5" />
            }}
            classNames={{
              name: "font-semibold text-foreground text-sm",
              description: "text-default-500 text-xs",
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm line-clamp-1">{user.name}</h3>
                <p className="text-default-500 text-xs">{user.email}</p>
              </div>
              
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-default-400 hover:text-foreground ml-2"
                onPress={(e) => {
                  e.stopPropagation();
                  router.visit(route('profile', { user: user.id }));
                }}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Phone */}
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="w-4 h-4 text-default-400 flex-shrink-0" />
              <span className="text-default-600 text-xs line-clamp-1">{user.phone}</span>
            </div>
          )}
          
          {/* Department */}
          {(user.department || user.department_id) && (
            <div className="flex items-center gap-2 text-sm">
              <BuildingOfficeIcon className="w-4 h-4 text-default-400 flex-shrink-0" />
              <span className="text-default-600 text-xs">
                {typeof user.department === 'string' 
                  ? user.department
                  : 'N/A'}
              </span>
            </div>
          )}
        </div>
        
        {/* Card Footer with Tags */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
          {/* Status */}
          <Chip
            size="sm"
            variant={user.active ? "solid" : "bordered"}
            color={user.active ? "success" : "danger"}
            className="text-xs"
            startContent={user.active ? 
              <CheckCircleIcon className="w-3 h-3" /> : 
              <XCircleIcon className="w-3 h-3" />
            }
          >
            {user.active ? 'Active' : 'Inactive'}
          </Chip>
          
          {/* Roles */}
          {user.roles?.map((role, roleIndex) => (
            <Chip
              key={roleIndex}
              size="sm"
              variant="flat"
              color="secondary"
              className="text-xs"
              startContent={<UserIcon className="w-3 h-3" />}
            >
              {role}
            </Chip>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  // Statistics cards
  const statsCards = useMemo(() => [
    {
      title: 'Total Users',
      value: stats?.overview?.total_users || 0,
      icon: <UsersIcon className="w-5 h-5" />,
      color: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      description: 'All users'
    },
    {
      title: 'Active Users',
      value: stats?.overview?.active_users || 0,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'text-green-400',
      iconBg: 'bg-green-500/20',
      description: `${stats?.health?.status_ratio?.active_percentage || 0}% Active`
    },
    {
      title: 'Inactive Users',
      value: stats?.overview?.inactive_users || 0,
      icon: <XCircleIcon className="w-5 h-5" />,
      color: 'text-red-400',
      iconBg: 'bg-red-500/20',
      description: `${stats?.health?.status_ratio?.inactive_percentage || 0}% Inactive`
    },
    {
      title: 'Total Roles',
      value: stats?.overview?.total_roles || 0,
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      color: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      description: 'Role diversity'
    },
    {
      title: 'Role Coverage',
      value: `${stats?.health?.system_metrics?.role_coverage || 0}%`,
      icon: <TrophyIcon className="w-5 h-5" />,
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20',
      description: 'Users with roles'
    },
    {
      title: 'Recent Activity',
      value: stats?.activity?.recent_registrations?.recently_active || 0,
      icon: <ClockIcon className="w-5 h-5" />,
      color: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20',
      description: 'Active last 7 days'
    },
    {
      title: 'System Health',
      value: `${stats?.quick_metrics?.system_health_score || 0}%`,
      icon: <SignalIcon className="w-5 h-5" />,
      color: 'text-pink-400',
      iconBg: 'bg-pink-500/20',
      description: 'Overall health'
    },
    {
      title: 'Departments',
      value: stats?.overview?.total_departments || 0,
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      color: 'text-indigo-400',
      iconBg: 'bg-indigo-500/20',
      description: 'Department diversity'
    }
  ], [stats]);

  // Action buttons for page header
  const actionButtons = useMemo(() => {
    const buttons = [];
    
    // Check if user has permission to add users
    // In a real implementation, you would check permissions here
    const canCreateUser = true;
    
    if (canCreateUser) {
      buttons.push({
        label: isMobile ? "Add" : "Add User",
        icon: <UserPlusIcon className="w-4 h-4" />,
        onPress: () => openModal('add'),
        className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
      });
    }

    buttons.push({
      label: isMobile ? "" : "Export",
      isIconOnly: isMobile,
      icon: <ChartBarIcon className="w-4 h-4" />,
      variant: "bordered",
      className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
    });
    
    return buttons;
  }, [isMobile, openModal]);

  return (
    <>
      <Head title={title} />
      
      {/* Add User Modal */}
      {openModalType === 'add' && (
        <AddEditUserForm
          user={null}
          open={openModalType === 'add'}
          setUsers={handleUsersUpdate}
          closeModal={closeModal}
          editMode={false}
        />
      )}
      
      {/* Edit User Modal */}
      {openModalType === 'edit' && selectedUser && (
        <AddEditUserForm
          user={selectedUser}
          open={openModalType === 'edit'}
          setUsers={handleUsersUpdate}
          closeModal={closeModal}
          editMode={true}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Grow in>
          <GlassCard>
            <PageHeader
              title="Users Management"
              subtitle="Manage users accounts and roles"
              icon={<UsersIcon className="w-8 h-8" />}
              actionButtons={actionButtons}
            >
              <div className="p-4 sm:p-6">
                {/* Statistics Cards */}
                <StatsCards stats={statsCards} className="mb-6" />
                
                {/* Comprehensive Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                  {/* Role Distribution */}
                  <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <ChartPieIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-foreground">
                            Role Distribution
                          </Typography>
                          <Typography variant="caption" className="text-default-500">
                            User roles breakdown
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {stats?.distribution?.by_role?.slice(0, 5).map((role, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                              <span className="text-sm text-foreground truncate">{role.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-foreground">{role.count}</span>
                              <span className="text-xs text-default-500 ml-1">({role.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Department Distribution */}
                  <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <BuildingOfficeIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-foreground">
                            Department Distribution
                          </Typography>
                          <Typography variant="caption" className="text-default-500">
                            Users by department
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {stats?.distribution?.by_department?.slice(0, 5).map((dept, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                              <span className="text-sm text-foreground truncate">{dept.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-foreground">{dept.count}</span>
                              <span className="text-xs text-default-500 ml-1">({dept.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Security & Access Control */}
                  <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-foreground">
                            Security Metrics
                          </Typography>
                          <Typography variant="caption" className="text-default-500">
                            Access control overview
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Users with Roles</span>
                          <span className="text-sm font-medium text-green-400">
                            {stats?.security?.access_metrics?.users_with_roles || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Users without Roles</span>
                          <span className="text-sm font-medium text-red-400">
                            {stats?.security?.access_metrics?.users_without_roles || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Admin Users</span>
                          <span className="text-sm font-medium text-orange-400">
                            {stats?.security?.access_metrics?.admin_users || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Role Coverage</span>
                          <span className="text-sm font-medium text-blue-400">
                            {stats?.health?.system_metrics?.role_coverage || 0}%
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Activity & Growth Trends */}
                  <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <ChartBarIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-foreground">
                            Activity Trends
                          </Typography>
                          <Typography variant="caption" className="text-default-500">
                            Recent user activity
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Recently Active</span>
                          <span className="text-sm font-medium text-green-400">
                            {stats?.activity?.recent_registrations?.recently_active || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">New (30 days)</span>
                          <span className="text-sm font-medium text-blue-400">
                            {stats?.activity?.recent_registrations?.new_users_30_days || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">New (90 days)</span>
                          <span className="text-sm font-medium text-cyan-400">
                            {stats?.activity?.recent_registrations?.new_users_90_days || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Growth Rate</span>
                          <span className="text-sm font-medium text-purple-400">
                            {stats?.activity?.user_growth_rate || 0}%
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* System Health Overview */}
                  <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-teal-500/20 rounded-lg">
                          <SignalIcon className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-foreground">
                            System Health
                          </Typography>
                          <Typography variant="caption" className="text-default-500">
                            Overall system metrics
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Health Score</span>
                          <span className="text-sm font-medium text-teal-400">
                            {stats?.quick_metrics?.system_health_score || 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Activation Rate</span>
                          <span className="text-sm font-medium text-green-400">
                            {stats?.health?.system_metrics?.user_activation_rate || 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Dept. Coverage</span>
                          <span className="text-sm font-medium text-blue-400">
                            {stats?.health?.system_metrics?.department_coverage || 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Total Departments</span>
                          <span className="text-sm font-medium text-purple-400">
                            {stats?.overview?.total_departments || 0}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Status Distribution */}
                  <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-semibold text-foreground">
                            Status Breakdown
                          </Typography>
                          <Typography variant="caption" className="text-default-500">
                            User status distribution
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {stats?.distribution?.by_status?.map((status, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                status.name === 'Active' ? 'bg-green-400' :
                                status.name === 'Inactive' ? 'bg-red-400' :
                                'bg-gray-400'
                              }`} />
                              <span className="text-sm text-foreground">{status.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-foreground">{status.count}</span>
                              <span className="text-xs text-default-500 ml-1">({status.percentage}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
                
                {/* View Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      label="Search Users"
                      variant="bordered"
                      placeholder="Search by name, email or phone..."
                      value={filters.search}
                      onValueChange={(value) => handleFilterChange('search', value)}
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
                  <Fade in={true} timeout={300}>
                    <div className="mb-6 p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select
                          label="Status"
                          variant="bordered"
                          selectedKeys={filters.status !== 'all' ? [filters.status] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] || 'all';
                            handleFilterChange('status', value);
                          }}
                          classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                          }}
                        >
                          <SelectItem key="all" value="all">All Statuses</SelectItem>
                          <SelectItem key="active" value="active">Active Only</SelectItem>
                          <SelectItem key="inactive" value="inactive">Inactive Only</SelectItem>
                        </Select>

                        <Select
                          label="Role"
                          variant="bordered"
                          selectedKeys={filters.role !== 'all' ? [filters.role] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] || 'all';
                            handleFilterChange('role', value);
                          }}
                          classNames={{
                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                          }}
                        >
                          <SelectItem key="all" value="all">All Roles</SelectItem>
                          {roles?.map(role => (
                            <SelectItem key={role.toLowerCase()} value={role.toLowerCase()}>
                              {role}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>

                      {/* Active Filters */}
                      {(filters.search || filters.status !== 'all' || filters.role !== 'all') && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                          {filters.search && (
                            <Chip
                              variant="flat"
                              color="primary"
                              size="sm"
                              onClose={() => handleFilterChange('search', '')}
                            >
                              Search: {filters.search}
                            </Chip>
                          )}
                          {filters.status !== 'all' && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              size="sm"
                              onClose={() => handleFilterChange('status', 'all')}
                            >
                              Status: {filters.status === 'active' ? 'Active' : 'Inactive'}
                            </Chip>
                          )}
                          {filters.role !== 'all' && (
                            <Chip
                              variant="flat"
                              color="warning"
                              size="sm"
                              onClose={() => handleFilterChange('role', 'all')}
                            >
                              Role: {filters.role}
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
                      {viewMode === 'table' ? 'User Table' : 'User Grid'} 
                      <span className="text-sm text-default-500 ml-2">
                        ({paginatedUsers.total || 0} {paginatedUsers.total === 1 ? 'user' : 'users'})
                      </span>
                    </Typography>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <CircularProgress size={40} />
                      <Typography className="mt-4" color="textSecondary">
                        Loading users data...
                      </Typography>
                    </div>
                  ) : viewMode === 'table' ? (
                    <UsersTable 
                      allUsers={paginatedUsers.data}
                      roles={roles}
                      setUsers={handleUsersUpdate}
                      isMobile={isMobile}
                      isTablet={isTablet}
                      pagination={pagination}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handleRowsPerPageChange}
                      totalUsers={paginatedUsers.total}
                      loading={loading}
                      onEdit={(user) => openModal('edit', user)}
                      updateUserOptimized={updateUserOptimized}
                      deleteUserOptimized={deleteUserOptimized}
                      toggleUserStatusOptimized={toggleUserStatusOptimized}
                      updateUserRolesOptimized={updateUserRolesOptimized}
                    />
                  ) : (
                    <div className="p-4">
                      {paginatedUsers.data && paginatedUsers.data.length > 0 ? (
                        <div className={`grid gap-4 ${
                          isMobile 
                            ? 'grid-cols-1' 
                            : isTablet 
                              ? 'grid-cols-2' 
                              : 'grid-cols-3 xl:grid-cols-4'
                        }`}>
                          {paginatedUsers.data.map((user, index) => (
                            <UserCard key={user.id} user={user} index={index} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UsersIcon className="w-12 h-12 mx-auto text-default-300 mb-2" />
                          <Typography variant="body1" color="textSecondary">
                            No users found
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Try adjusting your search or filters
                          </Typography>
                        </div>
                      )}
                      
                      {/* Pagination for Grid View */}
                      {paginatedUsers.data && paginatedUsers.data.length > 0 && (
                        <div className="flex justify-center mt-6 border-t border-white/10 pt-4">
                          <Pagination
                            total={Math.ceil(paginatedUsers.total / pagination.perPage)}
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

UsersList.layout = (page) => <App>{page}</App>;
export default UsersList;
