/**
 * UserActions Component
 * 
 * Renders action buttons for user management including edit, status toggle, and delete.
 * Provides both desktop and mobile-optimized interfaces.
 * 
 * @component
 * @param {Object} user - User object
 * @param {boolean} isMobile - Mobile view flag
 * @param {Function} isLoading - Loading state checker
 * @param {Function} onStatusToggle - Status toggle handler
 * @param {Function} onDelete - Delete handler
 * @param {Object} loadingStates - Loading states object
 */

import React from "react";
import { Link } from '@inertiajs/react';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Switch, 
  Tooltip,
  Spinner 
} from "@heroui/react";
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

export const UserActions = ({
  user,
  isMobile,
  isLoading,
  onStatusToggle,
  onDelete,
  loadingStates
}) => {
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
          onValueChange={() => onStatusToggle(user.id, !user.active)}
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
          onPress={() => onDelete(user.id)}
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
};
