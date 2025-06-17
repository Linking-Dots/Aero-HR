/**
 * UserTableCell Component
 * 
 * Renders different types of table cells for the UsersTable component.
 * Handles user information, contact details, status, and role management.
 * 
 * @component
 * @param {Object} user - User object
 * @param {string} columnKey - Column identifier
 * @param {Array} roles - Available roles array
 * @param {boolean} isMobile - Mobile view flag
 * @param {Function} isLoading - Loading state checker
 * @param {Function} onRoleChange - Role change handler
 * @param {Object} loadingStates - Loading states object
 */

import React from "react";
import { 
  User, 
  Chip, 
  Select, 
  SelectItem, 
  Spinner 
} from "@heroui/react";
import {
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";

export const UserTableCell = ({
  user,
  columnKey,
  roles,
  isMobile,
  isLoading,
  onRoleChange,
  loadingStates
}) => {
  const statusColorMap = {
    active: "success",
    inactive: "danger",
  };

  switch (columnKey) {
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
        </div>
      );

    default:
      return user[columnKey] || "N/A";
  }
};
