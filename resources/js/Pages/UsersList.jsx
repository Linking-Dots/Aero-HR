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
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import ActionButtons from "@/Components/ActionButtons.jsx";
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

  // Statistics with proper icons and colors
  const statsData = useMemo(() => [
    {
      title: 'Total',
      value: stats.total,
      icon: <ChartBarIcon className="w-5 h-5" />,
      color: 'text-blue-600',
      description: 'All employees'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'text-green-600',
      description: 'Active employees'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: <XCircleIcon className="w-5 h-5" />,
      color: 'text-red-600',
      description: 'Inactive employees'
    },
    {
      title: 'Filtered',
      value: stats.filtered,
      icon: <FunnelIcon className="w-5 h-5" />,
      color: 'text-purple-600',
      description: 'Current results'
    }
  ], [stats]);

  // Action buttons configuration
  const actionButtons = [
    {
      label: "Add Employee",
      icon: <UserPlusIcon className="w-4 h-4" />,
      onPress: () => openModal('add'),
      className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
    }
  ];

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
          <GlassCard>
            <PageHeader
              title="Employee Management"
              subtitle="Manage employee accounts, roles, and permissions"
              icon={<UsersIcon className="w-8 h-8 text-blue-600" />}
              actionButtons={actionButtons}
            >
              <div className="p-6">
                {/* Quick Stats */}
                <StatsCards stats={statsData} />
                
                {/* Filters Section */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
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
                    
                    <div className="flex gap-2 flex-wrap">
                      <Chip
                        variant={roleFilter === 'all' ? 'solid' : 'bordered'}
                        color="primary"
                        onClose={roleFilter !== 'all' ? () => handleRoleFilterChange('all') : undefined}
                        className="cursor-pointer"
                      >
                        All Roles
                      </Chip>
                      <Chip
                        variant={statusFilter === 'active' ? 'solid' : 'bordered'}
                        color="success"
                        onClose={statusFilter !== 'all' ? () => handleStatusFilterChange('all') : undefined}
                        className="cursor-pointer"
                      >
                        Active
                      </Chip>
                      <Chip
                        variant={statusFilter === 'inactive' ? 'solid' : 'bordered'}
                        color="danger"
                        onClose={statusFilter !== 'all' ? () => handleStatusFilterChange('all') : undefined}
                        className="cursor-pointer"
                      >
                        Inactive
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <UsersTable 
                  allUsers={filteredUsers}
                  roles={roles}
                  departments={departments}
                  designations={designations}
                  setUsers={handleUsersUpdate}
                />
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
