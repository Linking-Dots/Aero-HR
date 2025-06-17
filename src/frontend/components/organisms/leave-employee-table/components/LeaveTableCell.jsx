/**
 * LeaveTableCell Component
 * 
 * Renders specialized table cells for the LeaveEmployeeTable component.
 * Handles different types of leave data with appropriate formatting.
 * 
 * @component
 * @example
 * <LeaveTableCell
 *   leave={leave}
 *   columnKey="employee"
 *   getUserInfo={getUserInfo}
 *   formatDate={formatDate}
 *   getLeaveDuration={getLeaveDuration}
 * />
 */

import React from "react";
import { Box, Avatar, Chip } from "@heroui/react";
import { CalendarDaysIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { LEAVE_TABLE_CONFIG } from "../config";

const LeaveTableCell = ({
  leave,
  columnKey,
  getUserInfo,
  formatDate,
  getLeaveDuration
}) => {
  const renderEmployeeCell = () => {
    const user = getUserInfo(leave.employee_id);
    
    if (!user) {
      return (
        <Box className="flex items-center gap-3">
          <Avatar
            size="sm"
            name="Unknown"
            className="bg-default-100"
          />
          <Box>
            <p className="text-sm font-medium text-foreground">Unknown Employee</p>
            <p className="text-xs text-default-500">ID: {leave.employee_id}</p>
          </Box>
        </Box>
      );
    }

    return (
      <Box className="flex items-center gap-3">
        <Avatar
          size="sm"
          src={user.profile_photo_url}
          name={user.name}
          className="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <Box>
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-default-500">{user.email}</p>
        </Box>
      </Box>
    );
  };

  const renderLeaveTypeCell = () => {
    const typeConfig = LEAVE_TABLE_CONFIG.leaveTypes[leave.leave_type] || 
                      LEAVE_TABLE_CONFIG.leaveTypes.default;
    
    return (
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
    );
  };

  const renderDateCell = (dateField) => {
    const date = leave[dateField];
    if (!date) return <span className="text-default-400">N/A</span>;

    const formattedDate = formatDate(date);
    const dateObj = new Date(date);
    const isToday = dateObj.toDateString() === new Date().toDateString();
    const isPast = dateObj < new Date() && !isToday;
    const isFuture = dateObj > new Date() && !isToday;

    return (
      <Box className="flex items-center gap-2">
        <CalendarDaysIcon className="w-4 h-4 text-default-400" />
        <Box>
          <p className={`text-sm font-medium ${
            isToday ? 'text-warning-600' : 
            isPast ? 'text-default-500' : 
            isFuture ? 'text-primary-600' : 'text-foreground'
          }`}>
            {formattedDate}
          </p>
          <p className="text-xs text-default-400">
            {isToday ? 'Today' : 
             isPast ? 'Past' : 
             isFuture ? 'Upcoming' : ''}
          </p>
        </Box>
      </Box>
    );
  };

  const renderReasonCell = () => {
    const reason = leave.reason || '';
    const maxLength = LEAVE_TABLE_CONFIG.validation.reasonMaxLength;
    const truncated = reason.length > maxLength ? 
                     `${reason.substring(0, maxLength)}...` : reason;

    return (
      <Box className="flex items-start gap-2 max-w-xs">
        <DocumentTextIcon className="w-4 h-4 text-default-400 mt-0.5 flex-shrink-0" />
        <Box>
          <p className="text-sm text-foreground leading-relaxed">{truncated}</p>
          {reason.length > maxLength && (
            <p className="text-xs text-default-400 mt-1">
              {reason.length} characters
            </p>
          )}
        </Box>
      </Box>
    );
  };

  const renderDurationCell = () => {
    const duration = getLeaveDuration(leave.from_date, leave.to_date);
    const days = parseInt(duration);
    const isLongLeave = days > LEAVE_TABLE_CONFIG.validation.longLeaveDays;

    return (
      <Box className="flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-default-400" />
        <Box>
          <p className={`text-sm font-medium ${
            isLongLeave ? 'text-warning-600' : 'text-foreground'
          }`}>
            {duration}
          </p>
          {isLongLeave && (
            <p className="text-xs text-warning-500">Long leave</p>
          )}
        </Box>
      </Box>
    );
  };

  switch (columnKey) {
    case "employee":
      return renderEmployeeCell();
    
    case "leave_type":
      return renderLeaveTypeCell();
    
    case "from_date":
    case "to_date":
      return renderDateCell(columnKey);
    
    case "reason":
      return renderReasonCell();
    
    case "duration":
      return renderDurationCell();
    
    default:
      return (
        <span className="text-sm text-foreground">
          {leave[columnKey] || "N/A"}
        </span>
      );
  }
};

export default LeaveTableCell;
