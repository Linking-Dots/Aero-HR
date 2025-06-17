/**
 * UserMobileCard Component
 * 
 * Mobile-optimized card component for displaying user information.
 * Provides compact layout with all essential user management features.
 * 
 * @component
 * @param {Object} user - User object
 * @param {number} index - User index in list
 * @param {Array} roles - Available roles array
 * @param {Function} isLoading - Loading state checker
 * @param {Function} onRoleChange - Role change handler
 * @param {Function} onStatusToggle - Status toggle handler
 * @param {Function} onDelete - Delete handler
 * @param {Object} loadingStates - Loading states object
 */

import React from "react";
import { Link } from '@inertiajs/react';
import {
  Card,
  CardBody,
  User,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Select,
  SelectItem,
  Switch,
  Divider,
  Spinner
} from "@heroui/react";
import {
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

export const UserMobileCard = ({
  user,
  index,
  roles,
  isLoading,
  onRoleChange,
  onStatusToggle,
  onDelete,
  loadingStates
}) => {
  const statusColorMap = {
    active: "success",
    inactive: "danger",
  };

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-lg">
      <CardBody className="p-4">
        {/* Header with user info and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <span className="text-sm font-semibold text-foreground">
                {index + 1}
              </span>
            </div>
            <User
              avatarProps={{
                radius: "lg",
                src: user?.profile_image,
                size: "md",
                fallback: <UserIcon className="w-5 h-5" />
              }}
              name={
                <span className="font-semibold text-foreground">
                  {user?.name}
                </span>
              }
              description={null}
              classNames={{
                wrapper: "justify-start"
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Chip
              className="capitalize"
              color={statusColorMap[user.active ? "active" : "inactive"]}
              size="sm"
              variant="flat"
            >
              {user.active ? "Active" : "Inactive"}
            </Chip>
            
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
                  onPress={() => onStatusToggle(user.id, !user.active)}
                  isDisabled={isLoading(user.id, 'status')}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onPress={() => onDelete(user.id)}
                  isDisabled={isLoading(user.id, 'delete')}
                >
                  Delete User
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
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
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-default-400" />
            <span className="text-default-500">{user?.created_at || "N/A"}</span>
          </div>
        </div>

        <Divider className="my-3" />

        {/* Role Management */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>User Roles</span>
          </div>
          
          <Select
            size="sm"
            label="Select Roles"
            aria-label={`Select roles for ${user?.name}`}
            placeholder="Choose user roles"
            selectionMode="multiple"
            selectedKeys={new Set(user.roles)}
            onSelectionChange={(keys) => onRoleChange(user.id, Array.from(keys))}
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

          {/* Current Roles Display */}
          {user.roles && user.roles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user.roles.map((role, roleIndex) => (
                <Chip
                  key={roleIndex}
                  size="sm"
                  variant="bordered"
                  color="primary"
                  className="text-xs"
                >
                  {role}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
