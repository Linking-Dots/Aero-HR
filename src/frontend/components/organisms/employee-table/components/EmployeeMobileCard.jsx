/**
 * Employee Mobile Card Component
 * 
 * Responsive card component for displaying employee information
 * in mobile view with compact layout and essential actions.
 * 
 * @component
 * @example
 * ```jsx
 * <EmployeeMobileCard
 *   user={user}
 *   index={0}
 *   departments={departments}
 *   designations={designations}
 *   attendanceTypes={attendanceTypes}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 *   onConfigure={handleConfigure}
 *   isLoading={isLoading}
 * />
 * ```
 */

import React from 'react';
import {
  Card,
  CardBody,
  User,
  Chip,
  Button,
  Divider,
  Select,
  SelectItem,
  Spinner
} from "@heroui/react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  CogIcon
} from "@heroicons/react/24/outline";

/**
 * Employee Mobile Card Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.user - User data object
 * @param {number} props.index - Card index
 * @param {Array} props.departments - Available departments
 * @param {Array} props.designations - Available designations
 * @param {Array} props.attendanceTypes - Available attendance types
 * @param {Function} props.onUpdate - Update handler function
 * @param {Function} props.onDelete - Delete handler function
 * @param {Function} props.onConfigure - Configuration handler function
 * @param {Function} props.isLoading - Loading state checker
 * @returns {JSX.Element} Rendered mobile card
 */
const EmployeeMobileCard = ({
  user,
  index,
  departments = [],
  designations = [],
  attendanceTypes = [],
  onUpdate,
  onDelete,
  onConfigure,
  isLoading
}) => {

  /**
   * Handle field updates
   */
  const handleChange = (field, userId, newValue) => {
    if (onUpdate) {
      onUpdate(field, userId, newValue);
    }
  };

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
    window.location.href = route('profile', { user: user.id });
  };

  /**
   * Handle configuration modal
   */
  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure(user);
    }
  };

  /**
   * Get filtered designations for current department
   */
  const getFilteredDesignations = () => {
    if (!user.department || !designations) return [];
    return designations.filter(desig => desig.department_id === user.department);
  };

  /**
   * Get department name
   */
  const getDepartmentName = () => {
    const dept = departments.find(d => d.id === user.department);
    return dept?.name || 'Not assigned';
  };

  /**
   * Get designation name
   */
  const getDesignationName = () => {
    const desig = designations.find(d => d.id === user.designation);
    return desig?.title || 'Not assigned';
  };

  /**
   * Get attendance type display
   */
  const getAttendanceTypeDisplay = () => {
    let attendanceType;
    
    if (user.attendance_type_id) {
      attendanceType = attendanceTypes?.find(type => type.id === user.attendance_type_id);
    } else if (user.attendance_type?.id) {
      attendanceType = attendanceTypes?.find(type => type.id === user.attendance_type.id);
    }
    
    return attendanceType || null;
  };

  const attendanceTypeDisplay = getAttendanceTypeDisplay();

  return (
    <Card className="mb-4 bg-white/5 backdrop-blur-md border border-white/20">
      <CardBody className="p-4">
        {/* Header with User Info and Index */}
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
                size: "md",
                src: user?.profile_image,
                fallback: <UserIcon className="w-6 h-6" />
              }}
              name={
                <div className="font-semibold text-foreground">
                  {user?.name}
                </div>
              }
              description={
                <div className="text-default-500 text-sm">
                  ID: {user?.employee_id || 'N/A'}
                </div>
              }
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
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
            
            {attendanceTypeDisplay && (
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
            )}
            
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
          </div>
        </div>

        <Divider className="my-3" />

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
            <span className="text-foreground">
              Joined: {user?.date_of_joining || 'N/A'}
            </span>
          </div>
        </div>

        <Divider className="my-3" />

        {/* Department Selection */}
        <div className="space-y-3">
          <div className="space-y-2">
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
                trigger: "bg-white/10 backdrop-blur-md border-white/20",
                value: "text-foreground",
                popoverContent: "bg-white/10 backdrop-blur-md border-white/20"
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

          {/* Designation Selection */}
          <div className="space-y-2">
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
                trigger: "bg-white/10 backdrop-blur-md border-white/20",
                value: "text-foreground",
                popoverContent: "bg-white/10 backdrop-blur-md border-white/20"
              }}
              startContent={
                isLoading(user.id, 'designation') ? (
                  <Spinner size="sm" />
                ) : (
                  <BriefcaseIcon className="w-4 h-4" />
                )
              }
            >
              {getFilteredDesignations().map((desig) => (
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

          {/* Attendance Type Selection */}
          <div className="space-y-2">
            <Select
              size="sm"
              label="Attendance Type"
              aria-label={`Select attendance type for ${user?.name}`}
              placeholder="Select type"
              selectedKeys={
                user.attendance_type_id ? new Set([user.attendance_type_id.toString()]) :
                user.attendance_type?.id ? new Set([user.attendance_type.id.toString()]) :
                new Set()
              }
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                if (selectedKey) {
                  handleChange('attendance_type', user.id, parseInt(selectedKey));
                }
              }}
              isDisabled={isLoading(user.id, 'attendance_type')}
              classNames={{
                trigger: "bg-white/10 backdrop-blur-md border-white/20",
                value: "text-foreground",
                popoverContent: "bg-white/10 backdrop-blur-md border-white/20"
              }}
              startContent={
                isLoading(user.id, 'attendance_type') ? (
                  <Spinner size="sm" />
                ) : (
                  <ClockIcon className="w-4 h-4" />
                )
              }
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
        </div>

        {/* Current Values Display */}
        {(getDepartmentName() !== 'Not assigned' || 
          getDesignationName() !== 'Not assigned' || 
          attendanceTypeDisplay) && (
          <>
            <Divider className="my-3" />
            <div className="flex flex-wrap gap-2">
              {getDepartmentName() !== 'Not assigned' && (
                <Chip size="sm" variant="flat" color="primary">
                  {getDepartmentName()}
                </Chip>
              )}
              {getDesignationName() !== 'Not assigned' && (
                <Chip size="sm" variant="flat" color="secondary">
                  {getDesignationName()}
                </Chip>
              )}
              {attendanceTypeDisplay && (
                <Chip size="sm" variant="flat" color="success">
                  {attendanceTypeDisplay.name}
                </Chip>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default EmployeeMobileCard;
