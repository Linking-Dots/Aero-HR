/**
 * LeaveMobileCard Component
 * 
 * Mobile-optimized card component for displaying leave information.
 * Provides a comprehensive view with all actions accessible on mobile devices.
 * 
 * @component
 * @example
 * <LeaveMobileCard
 *   leave={leave}
 *   getUserInfo={getUserInfo}
 *   getStatusChip={getStatusChip}
 *   formatDate={formatDate}
 *   getLeaveDuration={getLeaveDuration}
 *   updateLeaveStatus={updateLeaveStatus}
 *   isUpdating={isUpdating}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */

import React from "react";
import { 
  Card, 
  CardBody, 
  Box, 
  Avatar, 
  Chip,
  Divider,
  Button
} from "@heroui/react";
import { usePage } from "@inertiajs/react";
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  DocumentTextIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { LeaveStatusChip } from "./LeaveStatusChip";
import { LEAVE_TABLE_CONFIG } from "../config";

const LeaveMobileCard = ({
  leave,
  getUserInfo,
  getStatusChip,
  formatDate,
  getLeaveDuration,
  updateLeaveStatus,
  isUpdating,
  onEdit,
  onDelete
}) => {
  const { auth } = usePage().props;
  
  const user = getUserInfo(leave.employee_id);
  const userIsAdmin = auth.roles.includes("Administrator");
  const userIsSE = auth.roles.includes("Supervision Engineer");
  const isOwnLeave = auth.user.id === leave.employee_id;
  
  // Determine permissions
  const canEdit = userIsAdmin || userIsSE || (isOwnLeave && leave.status === 'New');
  const canDelete = userIsAdmin || userIsSE || (isOwnLeave && leave.status === 'New');

  const typeConfig = LEAVE_TABLE_CONFIG.leaveTypes[leave.leave_type] || 
                    LEAVE_TABLE_CONFIG.leaveTypes.default;

  const duration = getLeaveDuration(leave.from_date, leave.to_date);
  const days = parseInt(duration);
  const isLongLeave = days > LEAVE_TABLE_CONFIG.validation.longLeaveDays;

  return (
    <Card className="mb-4 bg-white/5 backdrop-blur-md border border-white/20 shadow-lg">
      <CardBody className="p-4">
        {/* Header with Employee Info and Status */}
        <Box className="flex items-start justify-between mb-4">
          <Box className="flex items-center gap-3 flex-1">
            <Avatar
              size="md"
              src={user?.profile_photo_url}
              name={user?.name || "Unknown"}
              className="bg-gradient-to-br from-primary-400 to-primary-600"
            />
            <Box className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">
                {user?.name || "Unknown Employee"}
              </h4>
              <p className="text-xs text-default-500">{user?.email}</p>
            </Box>
          </Box>
          
          <LeaveStatusChip
            leave={leave}
            getStatusChip={getStatusChip}
            updateLeaveStatus={updateLeaveStatus}
            isUpdating={isUpdating}
          />
        </Box>

        {/* Leave Type */}
        <Box className="mb-3">
          <Chip
            size="sm"
            variant="flat"
            color={typeConfig.color}
            startContent={<typeConfig.icon className="w-3 h-3" />}
            classNames={{
              base: "h-6",
              content: "text-xs font-medium"
            }}
          >
            {leave.leave_type}
          </Chip>
        </Box>

        <Divider className="my-3" />

        {/* Date Range and Duration */}
        <Box className="space-y-3 mb-4">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-default-400" />
              <span className="text-sm text-default-600">From:</span>
            </Box>
            <span className="text-sm font-medium text-foreground">
              {formatDate(leave.from_date)}
            </span>
          </Box>
          
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-default-400" />
              <span className="text-sm text-default-600">To:</span>
            </Box>
            <span className="text-sm font-medium text-foreground">
              {formatDate(leave.to_date)}
            </span>
          </Box>
          
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-default-400" />
              <span className="text-sm text-default-600">Duration:</span>
            </Box>
            <span className={`text-sm font-medium ${
              isLongLeave ? 'text-warning-600' : 'text-foreground'
            }`}>
              {duration}
              {isLongLeave && (
                <span className="text-xs text-warning-500 ml-1">(Long)</span>
              )}
            </span>
          </Box>
        </Box>

        {/* Reason */}
        {leave.reason && (
          <>
            <Divider className="my-3" />
            <Box className="mb-4">
              <Box className="flex items-start gap-2 mb-2">
                <DocumentTextIcon className="w-4 h-4 text-default-400 mt-0.5" />
                <span className="text-sm text-default-600 font-medium">Reason:</span>
              </Box>
              <p className="text-sm text-foreground leading-relaxed pl-6">
                {leave.reason}
              </p>
            </Box>
          </>
        )}

        {/* Actions */}
        {(canEdit || canDelete) && (
          <>
            <Divider className="my-3" />
            <Box className="flex gap-2 justify-end">
              {canEdit && (
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<PencilIcon className="w-4 h-4" />}
                  onPress={onEdit}
                  className="font-medium"
                >
                  Edit
                </Button>
              )}
              
              {canDelete && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onPress={onDelete}
                  className="font-medium"
                >
                  Delete
                </Button>
              )}
            </Box>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default LeaveMobileCard;
