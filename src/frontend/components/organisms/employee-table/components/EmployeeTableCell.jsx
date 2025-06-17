/**
 * Employee Table Cell Component
 * 
 * Specialized table cell component for rendering different
 * employee data types with appropriate formatting and controls.
 * 
 * @component
 * @example
 * ```jsx
 * <EmployeeTableCell
 *   columnKey="department"
 *   user={user}
 *   value={user.department}
 *   index={0}
 *   departments={departments}
 *   onUpdate={handleUpdate}
 *   isLoading={false}
 *   isMobile={false}
 * />
 * ```
 */

import React from 'react';
import {
  User,
  Select,
  SelectItem,
  Spinner,
  Chip
} from "@heroui/react";
import {
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";

/**
 * Employee Table Cell Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.columnKey - Column identifier
 * @param {Object} props.user - User data object
 * @param {*} props.value - Cell value
 * @param {number} props.index - Row index
 * @param {Array} props.departments - Available departments
 * @param {Array} props.designations - Available designations
 * @param {Array} props.attendanceTypes - Available attendance types
 * @param {Function} props.onUpdate - Update handler function
 * @param {Function} props.isLoading - Loading state checker
 * @param {boolean} props.isMobile - Mobile view flag
 * @returns {JSX.Element} Rendered table cell
 */
const EmployeeTableCell = ({
  columnKey,
  user,
  value,
  index,
  departments = [],
  designations = [],
  attendanceTypes = [],
  onUpdate,
  isLoading,
  isMobile = false
}) => {
  
  /**
   * Handle change for select inputs
   */
  const handleChange = (field, userId, newValue) => {
    if (onUpdate) {
      onUpdate(field, userId, newValue);
    }
  };

  /**
   * Filter designations by department
   */
  const getFilteredDesignations = () => {
    if (!user.department || !designations) return [];
    return designations.filter(desig => desig.department_id === user.department);
  };

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

    case "employee":
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
            description={isMobile ? null : `ID: ${user?.employee_id || 'N/A'}`}
            classNames={{
              name: "font-semibold text-foreground text-left",
              description: "text-default-500 text-left text-xs",
              wrapper: "justify-start"
            }}
          />
          {isMobile && (
            <div className="flex flex-col gap-1 text-xs text-default-500 ml-10">
              <div className="flex items-center gap-1">
                <span className="font-medium">ID:</span>
                {user?.employee_id || 'N/A'}
              </div>
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

    case "department":
      return (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Select
            size="sm"
            label="Department"
            aria-label={`Select department for ${user?.name}`}
            placeholder="Select department"
            selectedKeys={user.department ? new Set([user.department.toString()]) : new Set()}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0];
              if (selectedKey) {
                handleChange('department', user.id, parseInt(selectedKey));
              }
            }}
            isDisabled={isLoading(user.id, 'department')}
            classNames={{
              trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
              value: "text-foreground",
              popoverContent: "bg-white/10 backdrop-blur-md border-white/20",
              label: "text-xs text-default-500"
            }}
            startContent={
              isLoading(user.id, 'department') ? (
                <Spinner size="sm" />
              ) : (
                <BuildingOfficeIcon className="w-4 h-4" />
              )
            }
          >
            {departments.map((dept) => (
              <SelectItem 
                key={dept.id.toString()} 
                value={dept.id.toString()}
                textValue={dept.name}
              >
                {dept.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      );

    case "designation":
      const filteredDesignations = getFilteredDesignations();
      
      return (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Select
            size="sm"
            label="Designation"
            aria-label={`Select designation for ${user?.name}`}
            placeholder="Select designation"
            selectedKeys={user.designation ? new Set([user.designation.toString()]) : new Set()}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0];
              if (selectedKey) {
                handleChange('designation', user.id, parseInt(selectedKey));
              }
            }}
            isDisabled={!user.department || isLoading(user.id, 'designation')}
            classNames={{
              trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
              value: "text-foreground",
              popoverContent: "bg-white/10 backdrop-blur-md border-white/20",
              label: "text-xs text-default-500"
            }}
            startContent={
              isLoading(user.id, 'designation') ? (
                <Spinner size="sm" />
              ) : (
                <BriefcaseIcon className="w-4 h-4" />
              )
            }
          >
            {filteredDesignations.map((desig) => (
              <SelectItem 
                key={desig.id.toString()} 
                value={desig.id.toString()}
                textValue={desig.title}
              >
                {desig.title}
              </SelectItem>
            ))}
          </Select>
        </div>
      );

    case "attendance_type":
      // Get the selected key - handle both direct ID and nested object
      const getSelectedKey = () => {
        if (user.attendance_type_id) {
          return new Set([user.attendance_type_id.toString()]);
        }
        if (user.attendance_type?.id) {
          return new Set([user.attendance_type.id.toString()]);
        }
        return new Set();
      };

      return (
        <div className="flex flex-col gap-2 min-w-[150px]">
          <Select
            size="sm"
            label="Attendance Type"
            aria-label={`Select attendance type for ${user?.name}`}
            placeholder="Select type"
            selectedKeys={getSelectedKey()}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0];
              if (selectedKey) {
                handleChange('attendance_type', user.id, parseInt(selectedKey));
              }
            }}
            isDisabled={isLoading(user.id, 'attendance_type')}
            classNames={{
              trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
              value: "text-foreground",
              popoverContent: "bg-white/10 backdrop-blur-md border-white/20",
              label: "text-xs text-default-500"
            }}
            startContent={
              isLoading(user.id, 'attendance_type') ? (
                <Spinner size="sm" />
              ) : (
                <ClockIcon className="w-4 h-4" />
              )
            }
            renderValue={(items) => {
              if (!items || items.length === 0) {
                return <span className="text-default-400">Select type</span>;
              }
              
              const selectedId = parseInt(Array.from(items)[0]?.key);
              const attendanceType = attendanceTypes?.find(type => type.id === selectedId);
              
              return attendanceType ? (
                <div className="flex items-center gap-2">
                  {attendanceType.icon && <span className="text-sm">{attendanceType.icon}</span>}
                  <span>{attendanceType.name}</span>
                </div>
              ) : (
                <span className="text-default-400">Unknown type</span>
              );
            }}
          >
            {attendanceTypes?.map((type) => (
              <SelectItem 
                key={type.id.toString()} 
                value={type.id.toString()}
                textValue={type.name}
              >
                <div className="flex items-center gap-2">
                  {type.icon && <span>{type.icon}</span>}
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>
      );

    case "joining_date":
      return (
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="w-4 h-4 text-default-400" />
          <span className="text-foreground">{user?.date_of_joining || 'N/A'}</span>
        </div>
      );

    default:
      return <span className="text-foreground">{value || 'N/A'}</span>;
  }
};

export default EmployeeTableCell;
