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
  ButtonGroup,
  Card,
  CardBody,
  User,
  Divider,
  Switch
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
  PencilIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import UsersTable from '@/Tables/UsersTable.jsx';
import AddUserForm from "@/Forms/AddUserForm.jsx";

const UsersList = ({ title, roles, departments, designations }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [openModalType, setOpenModalType] = useState(null);
  const [users, setUsers] = useState(usePage().props.allUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(false);

  // Memoized filtered users for performance
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || 
        user.roles.some(role => role.toLowerCase() === roleFilter.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.active) ||
        (statusFilter === 'inactive' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Modal handlers
  const openModal = useCallback((modalType) => {
    setOpenModalType(modalType);
  }, []);

  const closeModal = useCallback(() => {
    setOpenModalType(null);
  }, []);

  // Filter handlers
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleRoleFilterChange = useCallback((value) => {
    setRoleFilter(value);
  }, []);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
  }, []);

  // Stable setUsers callback - this is the key fix
  const handleUsersUpdate = useCallback((updatedUsers) => {
    setUsers(updatedUsers);
  }, []);

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length,
    filtered: filteredUsers.length
  }), [users, filteredUsers]);

  // Statistics with proper icons and colors
  const statsData = useMemo(() => [
    {
      title: 'Total',
      value: stats.total,
      icon: <ChartBarIcon className="w-5 h-5" />,
      color: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      description: 'All employees'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'text-green-400',
      iconBg: 'bg-green-500/20',
      description: 'Active employees'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: <XCircleIcon className="w-5 h-5" />,
      color: 'text-red-400',
      iconBg: 'bg-red-500/20',
      description: 'Inactive employees'
    },
    {
      title: 'Filtered',
      value: stats.filtered,
      icon: <FunnelIcon className="w-5 h-5" />,
      color: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      description: 'Current results'
    }
  ], [stats]);  // Action buttons configuration
  const actionButtons = [
    {
      label: isMobile ? "Add" : "Add Employee",
      icon: <UserPlusIcon className="w-4 h-4" />,
      onPress: () => openModal('add'),
      className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
    }
  ];
  // Grid card component for user display
  const UserCard = ({ user, index }) => (
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
            description={user?.email}
            classNames={{
              name: "font-semibold text-foreground text-left text-sm",
              description: "text-default-500 text-left text-xs",
              wrapper: "justify-start"
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <Chip
                className="capitalize"
                color={user.active ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {user.active ? "Active" : "Inactive"}
              </Chip>
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
            <div className="flex flex-wrap gap-1 mb-2">
              {user.roles?.map((role, roleIndex) => (
                <Chip
                  key={roleIndex}
                  size="sm"
                  variant="bordered"
                  className="text-xs"
                >
                  {role}
                </Chip>
              ))}
            </div>
            {user?.phone && (
              <Typography variant="caption" className="text-default-500 block">
                {user.phone}
              </Typography>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <>
      <Head title={title} />
      
      {/* Add User Modal */}
      {openModalType === 'add' && (
        <AddUserForm
          allUsers={users}
          departments={departments}
          designations={designations}
          open={openModalType === 'add'}
          setUsers={handleUsersUpdate}
          closeModal={closeModal}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Grow in>
          <GlassCard>            <PageHeader
              title="Employee Management"
              subtitle="Manage employee accounts, roles, and permissions"
              icon={<UsersIcon className="w-8 h-8" />}
              actionButtons={actionButtons}
            >
              <div className="p-4 sm:p-6">
                {/* Quick Stats */}
                <StatsCards stats={statsData} className="mb-6" />
                
                {/* View Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      label="Search Employees"
                      placeholder="Enter name or email..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                      variant="bordered"
                      classNames={{
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
                      <div className="flex flex-wrap gap-2">
                        <Chip
                          variant={roleFilter === 'all' ? 'solid' : 'bordered'}
                          color="primary"
                          onPress={() => handleRoleFilterChange('all')}
                          className="cursor-pointer"
                        >
                          All Roles
                        </Chip>
                        {roles?.map(role => (
                          <Chip
                            key={role.name}
                            variant={roleFilter === role.name ? 'solid' : 'bordered'}
                            color="secondary"
                            onPress={() => handleRoleFilterChange(role.name)}
                            className="cursor-pointer"
                          >
                            {role.name}
                          </Chip>
                        ))}
                        <Divider orientation="vertical" className="mx-2" />
                        <Chip
                          variant={statusFilter === 'active' ? 'solid' : 'bordered'}
                          color="success"
                          onPress={() => handleStatusFilterChange('active')}
                          className="cursor-pointer"
                        >
                          Active
                        </Chip>
                        <Chip
                          variant={statusFilter === 'inactive' ? 'solid' : 'bordered'}
                          color="danger"
                          onPress={() => handleStatusFilterChange('inactive')}
                          className="cursor-pointer"
                        >
                          Inactive
                        </Chip>
                      </div>
                    </div>
                  </Fade>
                )}                {/* Content Area */}
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
                      <UsersTable 
                        allUsers={filteredUsers}
                        roles={roles}
                        departments={departments}
                        designations={designations}
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
                            <UserCard key={user.id} user={user} index={index} />
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

UsersList.layout = (page) => <App>{page}</App>;
export default UsersList;
