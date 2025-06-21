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
  Select,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea
} from "@heroui/react";
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CogIcon
} from "@heroicons/react/24/outline";

const EmployeeTable = ({ allUsers, departments, designations, attendanceTypes, setUsers, isMobile, isTablet }) => {
  const [users, setLocalUsers] = useState(allUsers || []);
  const [loadingStates, setLoadingStates] = useState({});
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceConfig, setAttendanceConfig] = useState({});
  const theme = useTheme();

  // Sync with parent component's filtered data
  useEffect(() => {
    setLocalUsers(allUsers);
  }, [allUsers]);

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

  const handleChange = async (key, userId, valueId) => {
    setLoading(userId, key, true);
    
    const promise = new Promise(async (resolve, reject) => {
      try {
        let routeName;
        let requestBody = {};
        
        switch (key) {
          case 'department':
            routeName = 'user.updateDepartment';
            requestBody = { department: valueId };
            break;
          case 'designation':
            routeName = 'user.updateDesignation';
            requestBody = { designation: valueId };
            break;
          case 'attendance_type':
            routeName = 'user.updateAttendanceType';
            requestBody = { attendance_type_id: valueId };
            break;
          default:
            routeName = 'user.updateDepartment';
            requestBody = { [key]: valueId };
        }

        const response = await fetch(route(routeName, { id: userId }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          const updatedUsers = users.map((user) => {
            if (String(user.id) === String(userId)) {
              const updatedUser = { ...user };

              if (key === 'department' && user.department !== valueId) {
                // Clear designation when department changes
                updatedUser.designation = null;
              }

              if (key === 'attendance_type') {
                updatedUser.attendance_type_id = valueId;
                // Also update the attendance_type object if it exists
                const attendanceType = attendanceTypes?.find(type => type.id === valueId);
                if (attendanceType) {
                  updatedUser.attendance_type = attendanceType;
                }
              } else {
                updatedUser[key] = valueId;
              }

              return updatedUser;
            }
            return user;
          });
          
          setLocalUsers(updatedUsers);
          
          if (setUsers) {
            setUsers(prevUsers => 
              prevUsers.map((user) => {
                if (String(user.id) === String(userId)) {
                  const updatedUser = { ...user };
                  
                  if (key === 'department' && user.department !== valueId) {
                    updatedUser.designation = null;
                  }
                  
                  if (key === 'attendance_type') {
                    updatedUser.attendance_type_id = valueId;
                    const attendanceType = attendanceTypes?.find(type => type.id === valueId);
                    if (attendanceType) {
                      updatedUser.attendance_type = attendanceType;
                    }
                  } else {
                    updatedUser[key] = valueId;
                  }
                  
                  return updatedUser;
                }
                return user;
              })
            );
          }
          
          resolve([data.messages || data.message || 'Updated successfully']);
        } else {
          reject([data.messages || data.message || 'Failed to update information.']);
        }
      } catch (error) {
        console.error(`Error updating ${key}:`, error);
        reject(['An unexpected error occurred.']);
      } finally {
        setLoading(userId, key, false);
      }
    });

    toast.promise(promise, {
      pending: `Updating ${key.replace('_', ' ')}...`,
      success: {
        render({ data }) {
          return Array.isArray(data) ? data.join(', ') : data;
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
          
          if (setUsers) {
            setUsers(updatedUsers);
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

  const handleAttendanceConfig = (user) => {
    setSelectedUser(user);
    setAttendanceConfig(user.attendance_config || {});
    setConfigModalOpen(true);
  };

  const saveAttendanceConfig = async () => {
    try {
      const response = await fetch(route('user.updateAttendanceType', { id: selectedUser.id }), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          attendance_type_id: selectedUser.attendance_type_id,
          attendance_config: attendanceConfig,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, attendance_config: attendanceConfig }
            : user
        );
        
        setLocalUsers(updatedUsers);
        
        if (setUsers) {
          setUsers(updatedUsers);
        }
        
        setConfigModalOpen(false);
        toast.success('Attendance configuration updated successfully!');
      } else {
        toast.error('Failed to update attendance configuration.');
      }
    } catch (error) {
      toast.error('An error occurred while updating configuration.');
    }
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
              {departments?.map((dept) => (
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
        const filteredDesignations = designations?.filter(d => d.department_id === user.department) || [];
        
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
              <DropdownMenu aria-label="Employee actions">
                <DropdownItem
                  key="edit"
                  startContent={<PencilIcon className="w-4 h-4" />}
                  onPress={() => window.location.href = route('profile', { user: user.id })}
                >
                  Edit Employee
                </DropdownItem>
               
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onPress={() => handleDelete(user.id)}
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
                as={Link}
                href={route('profile', { user: user.id })}
                aria-label={`Edit ${user?.name}`}
              >
                <PencilIcon className="w-4 h-4" />
              </Button>
            </Tooltip>
            
           
            
            <Tooltip content="Delete Employee" color="danger" placement="top">
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
        { name: "Employee", uid: "employee" },
        { name: "Department", uid: "department" },
        { name: "Actions", uid: "actions" }
      ];
    }
    
    if (isTablet) {
      return [
        { name: "Sl", uid: "sl" },
        { name: "Employee", uid: "employee" },
        { name: "Department", uid: "department" },
        { name: "Designation", uid: "designation" },
        { name: "Actions", uid: "actions" }
      ];
    }

    return [
      { name: "Sl", uid: "sl" },
      { name: "Employee", uid: "employee" },
      { name: "Contact", uid: "contact" },
      { name: "Department", uid: "department" },
      { name: "Designation", uid: "designation" },
      { name: "Attendance Type", uid: "attendance_type" },
      { name: "Join Date", uid: "joining_date" },
      { name: "Actions", uid: "actions" }
    ];
  }, [isMobile, isTablet]);

  return (
    <>
      <div className="w-full">
        <Table
          aria-label="Employees table with custom cells"
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
          <TableBody items={users} emptyContent="No employees found">
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

      {/* Attendance Configuration Modal */}
      <Modal 
        isOpen={configModalOpen} 
        onClose={() => setConfigModalOpen(false)}
        size="2xl"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white/10 backdrop-blur-md border border-white/20",
          header: "border-b border-white/20",
          body: "py-6",
          footer: "border-t border-white/20"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CogIcon className="w-5 h-5" />
              Configure Attendance Settings
            </div>
            <p className="text-sm text-default-500">
              Employee: {selectedUser?.name}
              {selectedUser?.attendance_type && (
                <Chip 
                  size="sm"
                  variant="flat"
                  className="ml-2"
                >
                  {selectedUser.attendance_type.name}
                </Chip>
              )}
            </p>
          </ModalHeader>
          <ModalBody>
            {selectedUser?.attendance_type?.slug === 'geo_polygon' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Polygon Configuration</h4>
                <Textarea
                  label="Polygon Coordinates (JSON)"
                  placeholder="Enter polygon coordinates..."
                  value={JSON.stringify(attendanceConfig.polygon || [], null, 2)}
                  onValueChange={(value) => {
                    try {
                      const polygon = JSON.parse(value);
                      setAttendanceConfig({...attendanceConfig, polygon});
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  description="Enter polygon coordinates as JSON array: [{'lat': 23.123, 'lng': 90.456}, ...]"
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
                  }}
                />
              </div>
            )}
            
            {selectedUser?.attendance_type?.slug === 'wifi_ip' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">WiFi/IP Configuration</h4>
                <Input
                  label="Allowed IP Addresses"
                  placeholder="192.168.1.1, 10.0.0.1"
                  value={(attendanceConfig.allowed_ips || []).join(', ')}
                  onValueChange={(value) => {
                    const ips = value.split(',').map(ip => ip.trim()).filter(ip => ip);
                    setAttendanceConfig({...attendanceConfig, allowed_ips: ips});
                  }}
                  description="Enter allowed IP addresses separated by commas"
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
                  }}
                />
                <Input
                  label="Allowed IP Ranges (CIDR)"
                  placeholder="192.168.1.0/24, 10.0.0.0/8"
                  value={(attendanceConfig.allowed_ranges || []).join(', ')}
                  onValueChange={(value) => {
                    const ranges = value.split(',').map(range => range.trim()).filter(range => range);
                    setAttendanceConfig({...attendanceConfig, allowed_ranges: ranges});
                  }}
                  description="Enter IP ranges like: 192.168.1.0/24, 10.0.0.0/8"
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
                  }}
                />
              </div>
            )}

            {selectedUser?.attendance_type?.slug === 'route_waypoint' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Route Waypoint Configuration</h4>
                <Input
                  label="Tolerance (meters)"
                  type="number"
                  value={attendanceConfig.tolerance?.toString() || '200'}
                  onValueChange={(value) => setAttendanceConfig({...attendanceConfig, tolerance: parseInt(value)})}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
                  }}
                />
                <Textarea
                  label="Waypoints (JSON)"
                  placeholder="Enter waypoints..."
                  value={attendanceConfig.waypointsText || JSON.stringify(attendanceConfig.waypoints || [], null, 2)}
                  onValueChange={(value) => {
                    setAttendanceConfig(prev => ({
                      ...prev, 
                      waypointsText: value
                    }));
                    
                    try {
                      const waypoints = JSON.parse(value);
                      if (Array.isArray(waypoints)) {
                        setAttendanceConfig(prev => ({
                          ...prev,
                          waypoints: waypoints,
                          waypointsText: value
                        }));
                      }
                    } catch (error) {
                      // Invalid JSON, but allow editing
                    }
                  }}
                  description="Enter waypoints as JSON array: [{'lat': 23.123, 'lng': 90.456}, ...]"
                  isInvalid={(() => {
                    try {
                      const text = attendanceConfig.waypointsText || JSON.stringify(attendanceConfig.waypoints || [], null, 2);
                      JSON.parse(text);
                      return false;
                    } catch {
                      return true;
                    }
                  })()}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
                  }}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={() => setConfigModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={saveAttendanceConfig}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmployeeTable;
