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
  Select,
  SelectItem,
  Spinner
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
  HashtagIcon
} from "@heroicons/react/24/outline";

const UsersTable = ({ allUsers, roles, isMobile, isTablet, setUsers }) => {
  const [users, setLocalUsers] = useState(allUsers);
  const [loadingStates, setLoadingStates] = useState({});
  const theme = useTheme();

  // Sync with parent component's filtered data
  useEffect(() => {
    setLocalUsers(allUsers);
  }, [allUsers]);

  // Remove this problematic useEffect that causes infinite re-renders
  // useEffect(() => {
  //   if (setUsers) {
  //     setUsers(users);
  //   }
  // }, [users, setUsers]);

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

  async function handleRoleChange(userId, newRoles) {
    setLoading(userId, 'role', true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route('user.updateRole', { id: userId }), {
          roles: newRoles,
        });

        if (response.status === 200) {
          const updatedUsers = users.map((user) => {
            if (user.id === userId) {
              return { ...user, roles: newRoles };
            }
            return user;
          });
          
          setLocalUsers(updatedUsers);
          
          // Update parent only when necessary
          if (setUsers) {
            setUsers(prevUsers => 
              prevUsers.map((user) => {
                if (user.id === userId) {
                  return { ...user, roles: newRoles };
                }
                return user;
              })
            );
          }
          
          resolve([response.data.messages || 'Role updated successfully']);
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
  }

  const handleStatusToggle = async (userId, value) => {
    setLoading(userId, 'status', true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.put(route('user.toggleStatus', { id: userId }), {
          active: value,
        });

        if (response.status === 200) {
          const updatedUsers = users.map((user) => {
            if (user.id === userId) {
              return { ...user, active: value };
            }
            return user;
          });
          
          setLocalUsers(updatedUsers);
          
          // Update parent only when necessary
          if (setUsers) {
            setUsers(prevUsers => 
              prevUsers.map((user) => {
                if (user.id === userId) {
                  return { ...user, active: value };
                }
                return user;
              })
            );
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
          const updatedUsers = users.filter(user => user.id !== userId);
          setLocalUsers(updatedUsers);
          
          // Update parent only when necessary
          if (setUsers) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
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

  const renderCell = (user, columnKey, index) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "sl":
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <span className="text-sm font-semibold text-foreground">
                {index + 1}
              </span>
            </div>
          </div>
        );

      case "user":
        return (
          <div>
            <User
              avatarProps={{ 
                radius: "lg", 
                src: user?.profile_image,
                size: isMobile ? "sm" : "md",
                fallback: <UserIcon className="w-4 h-4" />
              }}
              name={user?.name}
              description={isMobile ? null : user?.email}
              classNames={{
                name: "font-semibold text-foreground text-left",
                description: "text-default-500 text-left",
                wrapper: "justify-start"
              }}
            />
            {isMobile && (
              <div className="flex flex-col gap-1 text-xs text-default-500 ml-10">
                <div className="flex items-center gap-1">
                  <EnvelopeIcon className="w-3 h-3" />
                  {user?.email}
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="w-3 h-3" />
                    {user?.phone}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case "contact":
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <EnvelopeIcon className="w-4 h-4 text-default-400" />
              <span className="text-foreground">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <PhoneIcon className="w-4 h-4 text-default-400" />
                <span className="text-foreground">{user?.phone}</span>
              </div>
            )}
          </div>
        );

      case "status":
        return (
          <div className="flex flex-col gap-2">
            <Chip
              className="capitalize"
              color={statusColorMap[user.active ? "active" : "inactive"]}
              size="sm"
              variant="flat"
            >
              {user.active ? "Active" : "Inactive"}
            </Chip>
            {!isMobile && (
              <div className="flex items-center gap-2 text-xs text-default-500">
                <CalendarIcon className="w-3 h-3" />
                {user?.created_at || "N/A"}
              </div>
            )}
          </div>
        );

      case "role":
        return (
          <div className="flex flex-col gap-2 min-w-[150px]">
            <Select
              size="sm"
              label="User Roles"
              aria-label={`Select roles for ${user?.name}`}
              placeholder="Select roles"
              selectionMode="multiple"
              selectedKeys={new Set(user.roles)}
              onSelectionChange={(keys) => handleRoleChange(user.id, Array.from(keys))}
              isDisabled={!user.active || isLoading(user.id, 'role')}
              classNames={{
                trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                value: "text-foreground",
                popoverContent: "bg-white/10 backdrop-blur-md border-white/20",
                label: "text-xs text-default-500"
              }}
              startContent={
                isLoading(user.id, 'role') ? (
                  <Spinner size="sm" />
                ) : (
                  <ShieldCheckIcon className="w-4 h-4" />
                )
              }
            >
              {roles.map((role) => (
                <SelectItem key={role.name} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        );

      case "actions":
        if (isMobile) {
          return (
            <Dropdown
              classNames={{
                content: "bg-white/10 backdrop-blur-md border-white/20"
              }}
            >
              <DropdownTrigger>
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light"
                  className="text-default-400"
                  aria-label={`Actions for ${user?.name}`}
                >
                  <EllipsisVerticalIcon className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User actions">
                <DropdownItem
                  key="edit"
                  startContent={<PencilIcon className="w-4 h-4" />}
                  onPress={() => window.location.href = route('profile', { user: user.id })}
                >
                  Edit User
                </DropdownItem>
                <DropdownItem
                  key="toggle"
                  startContent={<Switch size="sm" isSelected={user.active} />}
                  onPress={() => handleStatusToggle(user.id, !user.active)}
                  isDisabled={isLoading(user.id, 'status')}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onPress={() => handleDelete(user.id)}
                  isDisabled={isLoading(user.id, 'delete')}
                >
                  Delete User
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        }

        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Edit User" placement="top">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-default-400 hover:text-foreground"
                as={Link}
                href={route('profile', { user: user.id })}
                aria-label={`Edit ${user?.name}`}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            
            <Tooltip 
              content={user.active ? "Deactivate User" : "Activate User"} 
              placement="top"
            >
              <Switch
                size="sm"
                isSelected={user.active}
                onValueChange={() => handleStatusToggle(user.id, !user.active)}
                isDisabled={isLoading(user.id, 'status')}
                aria-label={`${user.active ? 'Deactivate' : 'Activate'} ${user?.name}`}
                classNames={{
                  wrapper: "bg-white/20 backdrop-blur-md"
                }}
              />
            </Tooltip>
            
            <Tooltip content="Delete User" color="danger" placement="top">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-danger-400 hover:text-danger"
                onPress={() => handleDelete(user.id)}
                isDisabled={isLoading(user.id, 'delete')}
                aria-label={`Delete ${user?.name}`}
              >
                {isLoading(user.id, 'delete') ? (
                  <Spinner size="sm" color="danger" />
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>
          </div>
        );

      default:
        return cellValue || "N/A";
    }
  };

  // Responsive columns based on screen size
  const columns = useMemo(() => {
    if (isMobile) {
      return [
        { name: "Sl", uid: "sl" },
        { name: "User", uid: "user" },
        { name: "Status", uid: "status" },
        { name: "Actions", uid: "actions" }
      ];
    }
    
    if (isTablet) {
      return [
        { name: "Sl", uid: "sl" },
        { name: "User", uid: "user" },
        { name: "Role", uid: "role" },
        { name: "Status", uid: "status" },
        { name: "Actions", uid: "actions" }
      ];
    }

    return [
      { name: "Sl", uid: "sl" },
      { name: "User", uid: "user" },
      { name: "Contact", uid: "contact" },
      { name: "Role", uid: "role" },
      { name: "Status", uid: "status" },
      { name: "Actions", uid: "actions" }
    ];
  }, [isMobile, isTablet]);

  return (
    <div className="w-full">
      <Table
        aria-label="Users table with custom cells"
        classNames={{
          wrapper: "bg-transparent",
          th: "bg-white/10 backdrop-blur-md text-foreground font-semibold",
          td: "border-b border-white/10",
          tbody: "divide-y divide-white/10"
        }}
        removeWrapper={true}
        isHeaderSticky
        isCompact={isMobile}
        className="min-h-[400px]"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn 
              key={column.uid} 
              align={column.uid === "actions" ? "center" : column.uid === "sl" ? "center" : "start"}
              className="bg-white/10 backdrop-blur-md"
              width={column.uid === "sl" ? 60 : undefined}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={users} emptyContent="No users found">
          {users.map((user, index) => (
            <TableRow 
              key={user.id}
              className="hover:bg-white/5 transition-colors duration-200"
            >
              {columns.map((column) => (
                <TableCell key={column.uid} className="py-3">
                  {renderCell(user, column.uid, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
