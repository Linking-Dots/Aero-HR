/**
 * Employee Actions Component
 * 
 * Action buttons and dropdown menus for employee table rows,
 * including edit, delete, and configuration options.
 * 
 * @component
 * @example
 * ```jsx
 * <EmployeeActions
 *   user={user}
 *   isMobile={false}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onConfigure={handleConfigure}
 *   isLoading={isLoading}
 * />
 * ```
 */

import React from 'react';
import { Link } from '@inertiajs/react';
import {
  Button,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner
} from "@heroui/react";
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  CogIcon
} from "@heroicons/react/24/outline";

/**
 * Employee Actions Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.user - User data object
 * @param {boolean} props.isMobile - Mobile view flag
 * @param {Function} props.onEdit - Edit handler function
 * @param {Function} props.onDelete - Delete handler function
 * @param {Function} props.onConfigure - Configuration handler function
 * @param {Function} props.isLoading - Loading state checker
 * @returns {JSX.Element} Rendered actions component
 */
const EmployeeActions = ({
  user,
  isMobile = false,
  onEdit,
  onDelete,
  onConfigure,
  isLoading
}) => {

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete ${user?.name}?`)) {
      onDelete(user.id);
    }
  };

  /**
   * Handle edit navigation
   */
  const handleEdit = () => {
    if (onEdit) {
      onEdit(user);
    } else {
      // Default to Inertia navigation
      window.location.href = route('profile', { user: user.id });
    }
  };

  /**
   * Handle configuration modal
   */
  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure(user);
    }
  };

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
        <DropdownMenu aria-label="Employee actions">
          <DropdownItem
            key="edit"
            startContent={<PencilIcon className="w-4 h-4" />}
            onPress={handleEdit}
          >
            Edit Employee
          </DropdownItem>
          
          {user?.attendance_type && (
            <DropdownItem
              key="configure"
              startContent={<CogIcon className="w-4 h-4" />}
              onPress={handleConfigure}
            >
              Configure Attendance
            </DropdownItem>
          )}
          
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<TrashIcon className="w-4 h-4" />}
            onPress={handleDelete}
            isDisabled={isLoading(user.id, 'delete')}
          >
            Delete Employee
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <Tooltip content="Edit Employee" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-default-400 hover:text-foreground"
          onPress={handleEdit}
          aria-label={`Edit ${user?.name}`}
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
      </Tooltip>
      
      {user?.attendance_type && (
        <Tooltip content="Configure Attendance" placement="top">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-primary-400 hover:text-primary"
            onPress={handleConfigure}
            isDisabled={isLoading(user.id, 'attendance_config')}
            aria-label={`Configure attendance for ${user?.name}`}
          >
            {isLoading(user.id, 'attendance_config') ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <CogIcon className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>
      )}
      
      <Tooltip content="Delete Employee" color="danger" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-danger-400 hover:text-danger"
          onPress={handleDelete}
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

export default EmployeeActions;
