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
  UserIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
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
                        Employee Management
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Manage employee accounts, roles, and permissions
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
                      onPress={() => openModal('add')}
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
                            Total Users
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <UserIcon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-bold text-green-400">
                            {stats.active}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Active
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <UserIcon className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <Typography variant="h6" className="font-bold text-red-400">
                            {stats.inactive}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Inactive
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
                            placeholder="Search by name or email..."
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
                              value={roleFilter}
                              onChange={(e) => handleRoleFilterChange(e.target.value)}
                            >
                              <option value="all">All Roles</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.name}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1 sm:min-w-[120px]">
                            <select
                              className="w-full px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              value={statusFilter}
                              onChange={(e) => handleStatusFilterChange(e.target.value)}
                            >
                              <option value="all">All Status</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Active Filters */}
                      {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
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
                          {roleFilter !== 'all' && (
                            <Chip
                              variant="flat"
                              color="secondary"
                              size="sm"
                              onClose={() => setRoleFilter('all')}
                            >
                              Role: {roleFilter}
                            </Chip>
                          )}
                          {statusFilter !== 'all' && (
                            <Chip
                              variant="flat"
                              color="warning"
                              size="sm"
                              onClose={() => setStatusFilter('all')}
                            >
                              Status: {statusFilter}
                            </Chip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Fade>

                {/* Users Table */}
                <Fade in timeout={1400}>
                  <div className="overflow-hidden rounded-lg">
                    <UsersTable 
                      allUsers={filteredUsers} 
                      roles={roles}
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

UsersList.layout = (page) => <App>{page}</App>;
export default UsersList;
