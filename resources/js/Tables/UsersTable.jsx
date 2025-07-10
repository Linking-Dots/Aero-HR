import React, { useState, useMemo, useEffect } from "react";
import { Link } from '@inertiajs/react';
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableColumn, 
  TableHeader, 
  TableRow, 
  User,
  Chip,
  Tooltip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Pagination,
  Spinner,
  Select,
  SelectItem
} from "@heroui/react";
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  HashtagIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon 
} from "@heroicons/react/24/outline";

const UsersTable = ({ 
  allUsers, 
  roles, 
  isMobile, 
  isTablet, 
  setUsers,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  totalUsers = 0,
  onEdit,
  loading = false,
  updateUserOptimized,
  deleteUserOptimized,
  toggleUserStatusOptimized,
  updateUserRolesOptimized,
}) => {
  const [loadingStates, setLoadingStates] = useState({});
  const theme = useTheme();

  const statusColorMap = {
    active: "success",
    inactive: "danger",
  };

  // Set loading state for specific operations
  const setLoading = (userId, operation, loading) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${userId}-${operation}`]: loading
    }));
  };

  const isLoading = (userId, operation) => {
    return loadingStates[`${userId}-${operation}`] || false;
  };

  async function handleRoleChange(userId, newRoleNames) {
    setLoading(userId, 'role', true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route('user.updateRole', { id: userId }), {
          roles: newRoleNames,
        });
        if (response.status === 200) {
          // Only update the affected user locally without refreshing the entire table
          if (updateUserRolesOptimized) {
            updateUserRolesOptimized(userId, newRoleNames);
          }
          resolve([response.data.message || 'Role updated successfully']);
        }
      } catch (error) {
        if (error.response?.status === 422) {
          reject(error.response.data.errors || ['Failed to update user role.']);
        } else {
          reject(['An unexpected error occurred. Please try again later.']);
        }
      } finally {
        setLoading(userId, 'role', false);
      }
    });
    toast.promise(promise, {
      pending: 'Updating employee role...',
      success: {
        render({ data }) {
          return data.join(', ');
        },
      },
      error: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
        },
      },
    });
    
    // Return the promise to allow parent components to track completion
    return promise;
  }

  const handleStatusToggle = async (userId, value) => {
    setLoading(userId, 'status', true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.put(route('user.toggleStatus', { id: userId }), {
          active: value,
        });
        if (response.status === 200) {
          if (toggleUserStatusOptimized) {
            toggleUserStatusOptimized(userId, value);
          }
          resolve([response.data.message || 'User status updated successfully']);
        }
      } catch (error) {
        if (error.response?.status === 422) {
          reject(error.response.data.errors || ['Failed to update user status.']);
        } else {
          reject(['An unexpected error occurred. Please try again later.']);
        }
      } finally {
        setLoading(userId, 'status', false);
      }
    });
    toast.promise(promise, {
      pending: 'Updating user status...',
      success: {
        render({ data }) {
          return data.join(', ');
        },
      },
      error: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
        },
      },
    });
  };

  const handleDelete = async (userId) => {
    setLoading(userId, 'delete', true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(route('profile.delete'), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
          },
          body: JSON.stringify({ user_id: userId }),
        });
        const data = await response.json();
        if (response.ok) {
          if (deleteUserOptimized) {
            deleteUserOptimized(userId);
          }
          resolve([data.message]);
        } else {
          reject([data.message]);
        }
      } catch (error) {
        reject(['An error occurred while deleting user. Please try again.']);
      } finally {
        setLoading(userId, 'delete', false);
      }
    });
    toast.promise(promise, {
      pending: 'Deleting user...',
      success: {
        render({ data }) {
          return data.join(', ');
        },
      },
      error: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
        },
      },
    });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { name: "#", uid: "sl" },
      { name: "USER", uid: "user" },
      { name: "EMAIL", uid: "email" },
      { name: "DEPARTMENT", uid: "department" },
      { name: "STATUS", uid: "status" },
      { name: "ROLES", uid: "roles" },
      { name: "ACTIONS", uid: "actions" }
    ];

    // Add or remove columns based on screen size
    if (!isMobile && !isTablet) {
      baseColumns.splice(3, 0, { name: "PHONE", uid: "phone" });
    } else if (isMobile) {
      // On mobile, remove phone and ensure roles column stays
      baseColumns.splice(baseColumns.findIndex(col => col.uid === "department"), 1);
    }
    
    return baseColumns;
  }, [isMobile, isTablet]);

  // Function to toggle user status - optimized to avoid full reloads
  const toggleUserStatus = async (userId, currentStatus) => {
    if (isLoading(userId, 'status')) return; // Prevent multiple calls
    
    setLoading(userId, 'status', true);
    try {
      // In this implementation, we use the handler passed from the parent
      if (toggleUserStatusOptimized) {
        toggleUserStatusOptimized(userId, !currentStatus);
        toast.success(`User status ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else if (setUsers) {
        // Fallback to the older method if the optimized handler is not available
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, active: !currentStatus } : user
          )
        );
        toast.success(`User status ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setLoading(userId, 'status', false);
    }
  };

  // Render cell content based on column type
  const renderCell = (user, columnKey, rowIndex) => {
    const cellValue = user[columnKey];
    
    switch (columnKey) {
      case "sl":
        // Calculate serial number based on pagination
        const startIndex = pagination?.currentPage && pagination?.perPage 
          ? Number((pagination.currentPage - 1) * pagination.perPage) 
          : 0;
        // Since rowIndex might be undefined, ensure it has a numeric value
        const safeIndex = typeof rowIndex === 'number' ? rowIndex : 0;
        const serialNumber = startIndex + safeIndex + 1;
        return <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <span className="text-sm font-semibold text-foreground">
                    {serialNumber}
                  </span>
                </div>
              </div>;
        
      case "user":
        
        return (
          <User
            avatarProps={{ 
              radius: "lg", 
              src: user?.profile_image,
              size: "sm",
              fallback: <UserIcon className="w-4 h-4" />
            }}
            name={user?.name || ""}
            classNames={{
              name: "font-semibold text-foreground",
              description: "text-default-500",
            }}
          />
        );
        
      case "email":
        return (
          <div className="flex items-center">
            <EnvelopeIcon className="w-4 h-4 text-default-400 mr-2" />
            <span className="text-sm">{user.email}</span>
          </div>
        );
        
      case "phone":
        return (
          <div className="flex items-center">
            <PhoneIcon className="w-4 h-4 text-default-400 mr-2" />
            <span className="text-sm">{user.phone || "N/A"}</span>
          </div>
        );
        
      case "department":
        
        return (
          <div className="flex items-center">
            <BuildingOfficeIcon className="w-4 h-4 text-default-400 mr-2" />
            <span className="text-sm">{user?.department || "N/A"}</span>
          </div>
        );
        
      case "status":
        return (
          <div className="flex items-center justify-center">
            <Switch
              size="sm"
              color={user.active ? "success" : "danger"}
              isSelected={user.active}
              isDisabled={isLoading(user.id, 'status')}
              startContent={isLoading(user.id, 'status') ? <Spinner size="sm" /> : null}
              onChange={() => toggleUserStatus(user.id, user.active)}
              classNames={{
                wrapper: "group-data-[selected=true]:bg-success-500 group-data-[selected=false]:bg-danger-500",
              }}
            />
            <span className="ml-2 text-xs">
              {user.active ? "Active" : "Inactive"}
            </span>
          </div>
        );
        
      case "roles":
        // Get simple role names for display
        const roleNames = user.roles?.map(role => 
          typeof role === 'object' && role !== null ? role.name : role
        ) || [];
        
        // Convert the role names to a Set for selection
        const roleSet = new Set(roleNames);
        
        // Create a simple string representation of roles
        const selectedValue = Array.from(roleSet).join(", ") || "No Roles";
        
        return (
          <div className="flex items-center">
            <Dropdown 
              isDisabled={isLoading(user.id, 'role')}
              className="max-w-[220px]"
            >
              <DropdownTrigger>
                <Button 
                  className="capitalize"
                  variant="bordered"
                  size="sm"
                  startContent={isLoading(user.id, 'role') ? <Spinner size="sm" /> : null}
                >
                  {selectedValue}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection={false}
                aria-label="Multiple selection example"
                closeOnSelect={false}
                selectedKeys={roleSet}
                selectionMode="multiple"
                variant="flat"
                onSelectionChange={(keys) => {
                  const newRoles = Array.from(keys);
                  handleRoleChange(user.id, newRoles);
                }}
              >
                {(roles || []).map((role) => (
                  <DropdownItem 
                    key={typeof role === 'object' && role !== null ? role.name : role}
                  >
                    {typeof role === 'object' && role !== null ? role.name : role}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
        
      case "actions":
        return (
          <div className="flex justify-center items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-default-400 hover:text-foreground"
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions">
                <DropdownItem 
                  textValue="View Profile"
                  href={route('profile', { user: user.id })}
                  as={Link}
                  className="text-blue-500"
                  startContent={<UserIcon className="w-4 h-4" />}
                >
                  View Profile
                </DropdownItem>
                <DropdownItem 
                  textValue="Edit User"
                  onPress={(e) => {
                    e.preventDefault();
                    if (onEdit) onEdit(user);
                  }}
                  className="text-amber-500"
                  startContent={<PencilIcon className="w-4 h-4" />}
                >
                  Edit
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
        
      default:
        return cellValue;
    }
  };

  const renderPagination = () => {
    if (!allUsers || !totalUsers || loading) return null;
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <span className="text-xs text-default-400 mb-3 sm:mb-0">
          Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {
            Math.min(pagination.currentPage * pagination.perPage, totalUsers)
          } of {totalUsers} users
        </span>
        
        <Pagination
          total={Math.ceil(totalUsers / pagination.perPage)}
          initialPage={pagination.currentPage}
          page={pagination.currentPage}
          onChange={onPageChange}
          size={isMobile ? "sm" : "md"}
          variant="bordered"
          showControls
          classNames={{
            item: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
            cursor: "bg-white/20 backdrop-blur-md border-white/20",
          }}
        />
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden flex flex-col border border-white/10 rounded-lg" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <div className="overflow-auto flex-grow">
        <Table
          aria-label="Users table"
          removeWrapper
          classNames={{
            base: "bg-transparent min-w-[800px]", // Set minimum width to prevent squishing on small screens
            th: "bg-white/5 backdrop-blur-md text-default-500 border-b border-white/10 font-medium text-xs sticky top-0 z-10",
            td: "border-b border-white/5 py-3",
            table: "border-collapse",
            thead: "bg-white/5",
            tr: "hover:bg-white/5"
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn 
                key={column.uid} 
                align={column.uid === "actions" ? "center" : column.uid === "sl" ? "center" : "start"}
                width={column.uid === "sl" ? 60 : undefined}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            items={allUsers || []} 
            emptyContent="No users found"
            loadingContent={<Spinner />}
            isLoading={loading}
          >
            {(item, index) => {
              // Find the index of this item in the allUsers array to ensure accurate serial numbers
              const itemIndex = allUsers ? allUsers.findIndex(user => user.id === item.id) : index;
              return (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey, itemIndex)}</TableCell>
                  )}
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>
      {/* Pagination is moved outside the scrollable area to make it sticky */}
      {renderPagination()}
    </div>
  );
};

export default UsersTable;
