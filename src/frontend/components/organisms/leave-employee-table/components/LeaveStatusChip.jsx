/**
 * LeaveStatusChip Component
 * 
 * Renders an interactive status chip for leave requests with admin controls.
 * Allows administrators to change leave status directly from the table.
 * 
 * @component
 * @example
 * <LeaveStatusChip
 *   leave={leave}
 *   getStatusChip={getStatusChip}
 *   updateLeaveStatus={updateLeaveStatus}
 *   isUpdating={isUpdating}
 * />
 */

import React, { useState } from "react";
import { 
  Box, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Button,
  Spinner
} from "@heroui/react";
import { usePage } from "@inertiajs/react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
  ClockIcon as ClockSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid
} from '@heroicons/react/24/solid';
import { LEAVE_TABLE_CONFIG } from "../config";

const LeaveStatusChip = ({
  leave,
  getStatusChip,
  updateLeaveStatus,
  isUpdating
}) => {
  const { auth } = usePage().props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const userIsAdmin = auth.roles.includes("Administrator");
  const userIsSE = auth.roles.includes("Supervision Engineer");
  const canUpdateStatus = userIsAdmin || userIsSE;

  const statusOptions = [
    {
      key: "New",
      label: "New",
      icon: ExclamationTriangleSolid,
      color: "primary",
      description: "Newly submitted request"
    },
    {
      key: "Pending",
      label: "Pending Review",
      icon: ClockSolid,
      color: "warning",
      description: "Under review"
    },
    {
      key: "Approved",
      label: "Approved",
      icon: CheckCircleSolid,
      color: "success",
      description: "Request approved"
    },
    {
      key: "Declined",
      label: "Declined",
      icon: XCircleSolid,
      color: "danger",
      description: "Request declined"
    }
  ];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === leave.status || isUpdating) return;
    
    setIsDropdownOpen(false);
    await updateLeaveStatus(leave, newStatus);
  };

  // Read-only chip for non-admin users
  if (!canUpdateStatus) {
    return (
      <Box className="flex items-center justify-center">
        {getStatusChip(leave.status)}
      </Box>
    );
  }

  // Interactive dropdown for admin users
  return (
    <Box className="flex items-center justify-center">
      <Dropdown
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        placement="bottom"
      >
        <DropdownTrigger>
          <Button
            variant="light"
            size="sm"
            isDisabled={isUpdating}
            endContent={
              isUpdating ? (
                <Spinner size="sm" />
              ) : (
                <ChevronDownIcon className="w-3 h-3" />
              )
            }
            className="h-auto p-1 min-w-fit"
          >
            {getStatusChip(leave.status)}
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu
          aria-label="Leave status options"
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={[leave.status]}
          onAction={(key) => handleStatusChange(key)}
          classNames={{
            base: "w-64",
            content: "py-2"
          }}
        >
          {statusOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = option.key === leave.status;
            
            return (
              <DropdownItem
                key={option.key}
                className={`py-3 ${isSelected ? 'bg-default-100' : ''}`}
                startContent={
                  <IconComponent 
                    className={`w-4 h-4 ${
                      option.color === 'primary' ? 'text-primary-500' :
                      option.color === 'warning' ? 'text-warning-500' :
                      option.color === 'success' ? 'text-success-500' :
                      option.color === 'danger' ? 'text-danger-500' :
                      'text-default-500'
                    }`}
                  />
                }
                description={option.description}
              >
                <Box className="flex flex-col">
                  <span className={`font-medium ${isSelected ? 'text-primary-600' : ''}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="text-xs text-success-500 font-medium">
                      Current Status
                    </span>
                  )}
                </Box>
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    </Box>
  );
};

export default LeaveStatusChip;
