import React, { useState, useMemo } from "react";
import { Link } from '@inertiajs/react';
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import axios from 'axios';
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
  Switch,
  Pagination
} from "@heroui/react";
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  HashtagIcon
} from "@heroicons/react/24/outline";

const EmployeeTable = ({ 
  allUsers, 
  departments, 
  designations, 
  attendanceTypes, 
  setUsers, 
  isMobile, 
  isTablet,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  totalUsers = 0,
  loading = false,
  updateEmployeeOptimized,
  deleteEmployeeOptimized
}) => {
  const theme = useTheme();
  
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceConfig, setAttendanceConfig] = useState({});

  const handleDepartmentChange = async (userId, departmentId) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route('user.updateDepartment', { id: userId }), {
          department: departmentId
        });

        if (response.status === 200) {
          const departmentObj = departments.find(d => d.id === parseInt(departmentId)) || null;
          updateEmployeeOptimized?.(userId, {
            department_id: departmentId,
            department_name: departmentObj?.name || null,
            designation_id: null,
            designation_name: null
          });
          
          resolve('Department updated successfully');
        }
      } catch (error) {
        console.error('Error updating department:', error);
        reject('Failed to update department');
      }
    });

    toast.promise(promise, {
      pending: {
        render() {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} />
              <span style={{ marginLeft: '8px' }}>Updating department...</span>
            </div>
          );
        },
        icon: false,
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      success: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🟢',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      error: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
    });
  };

  const handleDesignationChange = async (userId, designationId) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route('user.updateDesignation', { id: userId }), {
          designation_id: designationId
        });

        if (response.status === 200) {
          const designationObj = designations.find(d => d.id === parseInt(designationId)) || null;
          updateEmployeeOptimized?.(userId, {
            designation_id: designationId,
            designation_name: designationObj?.title || null
          });
          
          resolve("Designation updated successfully");
        }
      } catch (err) {
        console.error('Error updating designation:', err);
        reject("Failed to update designation");
      }
    });

    toast.promise(promise, {
      pending: {
        render() {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} />
              <span style={{ marginLeft: '8px' }}>Updating designation...</span>
            </div>
          );
        },
        icon: false,
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      success: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🟢',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      error: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
    });
  };

  // Handle attendance type change
  const handleAttendanceTypeChange = async (userId, attendanceTypeId) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(route('user.updateAttendanceType', { id: userId }), {
          attendance_type_id: attendanceTypeId
        });
        
        if (response.status === 200) {
          // Get the attendance type object
          const attendanceTypeObj = attendanceTypes.find(t => t.id === parseInt(attendanceTypeId)) || null;
          
          // Update optimistically
          if (updateEmployeeOptimized) {
            updateEmployeeOptimized(userId, { 
              attendance_type_id: attendanceTypeId,
              attendance_type_name: attendanceTypeObj?.name || null
            });
          }
          
          resolve('Attendance type updated successfully');
        }
      } catch (error) {
        console.error('Error updating attendance type:', error);
        reject('Failed to update attendance type');
      }
    });

    toast.promise(promise, {
      pending: {
        render() {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} />
              <span style={{ marginLeft: '8px' }}>Updating attendance type...</span>
            </div>
          );
        },
        icon: false,
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      success: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🟢',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      error: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
    });
  };

  // Delete employee
  const handleDelete = async (userId) => {
    const confirmed = confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.delete(route('user.delete', { id: userId }));
        
        if (response.status === 200) {
          // Update optimistically
          if (deleteEmployeeOptimized) {
            deleteEmployeeOptimized(userId);
          }
          
          resolve('Employee deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        reject('Failed to delete employee');
      }
    });

    toast.promise(promise, {
      pending: {
        render() {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} />
              <span style={{ marginLeft: '8px' }}>Deleting employee...</span>
            </div>
          );
        },
        icon: false,
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      success: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🟢',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
      error: {
        render({ data }) {
          return <div>{data}</div>;
        },
        icon: '🔴',
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard?.background || 'rgba(15, 20, 25, 0.15)',
          border: theme.glassCard?.border || '1px solid rgba(255, 255, 255, 0.2)',
          color: theme.palette?.text?.primary || '#ffffff',
        },
      },
    });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      { name: "#", uid: "sl" },
      { name: "EMPLOYEE", uid: "employee" },
      { name: "DEPARTMENT", uid: "department" },
      { name: "DESIGNATION", uid: "designation" },
      { name: "ACTIONS", uid: "actions" }
    ];

    // Add or remove columns based on screen size
    if (!isMobile) {
      baseColumns.splice(2, 0, { name: "CONTACT", uid: "contact" });
    }
    
    if (!isMobile && !isTablet) {
      baseColumns.splice(baseColumns.length - 1, 0, { name: "ATTENDANCE TYPE", uid: "attendance_type" });
    }
    
    return baseColumns;
  }, [isMobile, isTablet]);

  // Render cell content based on column type
  const renderCell = (user, columnKey, index) => {
    const cellValue = user[columnKey];
    
    // Calculate serial number based on pagination
    const startIndex = pagination?.currentPage && pagination?.perPage 
      ? Number((pagination.currentPage - 1) * pagination.perPage) 
      : 0;
    // Since index might be undefined, ensure it has a numeric value
    const safeIndex = typeof index === 'number' ? index : 0;
    const serialNumber = startIndex + safeIndex + 1;
      
    switch (columnKey) {
      case "sl":
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <span className="text-sm font-semibold text-foreground">
                {serialNumber}
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
                  <HashtagIcon className="w-3 h-3" />
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
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    size="sm"
                    className="justify-between backdrop-blur-md border-white/20 min-w-[150px] bg-white/10 hover:bg-white/15 transition-all duration-300"
                    startContent={<BuildingOfficeIcon className="w-4 h-4" />}
                    endContent={<EllipsisVerticalIcon className="w-4 h-4 rotate-90" />}
                  >
                    <span>
                      {user.department_name || "Select Department"}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Department options">
                  {departments?.map((dept) => (
                    <DropdownItem
                      key={dept.id.toString()}
                      onPress={() => handleDepartmentChange(user.id, dept.id)}
                    >
                      {dept.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

        case "designation":
          const departmentId = user.department_id;
          const filteredDesignations = designations?.filter(d => d.department_id === parseInt(departmentId)) || [];

          return (
            <div className="flex flex-col gap-2 min-w-[150px]">
              <Dropdown isDisabled={!departmentId}>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    size="sm"
                    className={`justify-between backdrop-blur-md border-white/20 min-w-[150px] transition-all duration-300 ${
                      !departmentId
                        ? 'bg-gray-500/20 border-gray-400/40 opacity-50'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                    isDisabled={!departmentId}
                    startContent={<BriefcaseIcon className="w-4 h-4" />}
                    endContent={departmentId && <EllipsisVerticalIcon className="w-4 h-4 rotate-90" />}
                  >
                    <span>
                      {!departmentId ? 'Select Department First' :
                       (user.designation_name || "Select Designation")}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Designation options">
                  {filteredDesignations.map((desig) => (
                    <DropdownItem
                      key={desig.id.toString()}
                      onPress={() => handleDesignationChange(user.id, desig.id)}
                    >
                      {desig.title}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          );

      case "attendance_type":
        return (
          <div className="flex flex-col gap-2 min-w-[150px]">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="bordered"
                  size="sm"
                  className="justify-between backdrop-blur-md border-white/20 min-w-[150px] bg-white/10 hover:bg-white/15 transition-all duration-300"
                  startContent={<ClockIcon className="w-4 h-4" />}
                  endContent={<EllipsisVerticalIcon className="w-4 h-4 rotate-90" />}
                >
                  <span>
                    {user.attendance_type_name || "Select Type"}
                  </span>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Attendance Type options">
                {attendanceTypes?.map((type) => (
                  <DropdownItem
                    key={type.id.toString()}
                    onPress={() => handleAttendanceTypeChange(user.id, type.id)}
                  >
                    {type.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      case "actions":
        return (
          <div className="relative flex justify-center items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  isIconOnly 
                  variant="light" 
                  className="text-default-400 hover:text-foreground transition-all duration-300"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Employee Actions">
                <DropdownItem 
                  key="edit" 
                  startContent={<PencilIcon className="w-4 h-4" />}
                  onPress={() => window.location.href = route('profile', { user: user.id })}
                >
                  Edit Profile
                </DropdownItem>
                
                <DropdownItem 
                  key="delete" 
                  className="text-danger"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onPress={() => handleDelete(user.id)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  };

  // Render pagination information and controls
  const renderPagination = () => {
    if (!pagination || loading) return null;
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <span className="text-xs text-default-400 mb-3 sm:mb-0">
          Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {
            Math.min(pagination.currentPage * pagination.perPage, pagination.total)
          } of {pagination.total} employees
        </span>
        
        <Pagination
          total={Math.ceil(pagination.total / pagination.perPage)}
          initialPage={pagination.currentPage}
          page={pagination.currentPage}
          onChange={onPageChange}
          size={isMobile ? "sm" : "md"}
          variant="bordered"
          showControls
          classNames={{
            item: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
            cursor: "bg-white/20 backdrop-blur-md border-white/20",
          }}
        />
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden flex flex-col border border-white/10 rounded-lg relative" style={{ maxHeight: 'calc(100vh - 200px)' }}>
      {/* Global loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
            <Spinner size="lg" color="primary" />
            <span className="text-sm text-foreground">Loading employees...</span>
          </div>
        </div>
      )}
      
      <div className="overflow-auto flex-grow">
        <Table
          aria-label="Employees table"
          removeWrapper
          classNames={{
            base: "bg-transparent min-w-[800px]", // Set minimum width to prevent squishing on small screens
            th: "bg-white/5 backdrop-blur-md text-default-500 border-b border-white/10 font-medium text-xs sticky top-0 z-10",
            td: "border-b border-white/5 py-3",
            table: "border-collapse",
            thead: "bg-white/5",
            tr: "hover:bg-white/5"
          }}
          isHeaderSticky
          isCompact={isMobile}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn 
                key={column.uid} 
                align={column.uid === "actions" ? "center" : column.uid === "sl" ? "center" : "start"}
                width={column.uid === "sl" ? 60 : undefined}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            items={allUsers || []} 
            emptyContent="No employees found"
            loadingContent={<Spinner />}
            isLoading={loading}
          >
            {(item, index) => {
              // Find the index of this item in the allUsers array to ensure accurate serial numbers
              const itemIndex = allUsers ? allUsers.findIndex(user => user.id === item.id) : index;
              
              return (
                <TableRow 
                  key={item.id}
                  className="transition-all duration-300 hover:bg-white/5"
                >
                  {(columnKey) => (
                    <TableCell className="transition-all duration-300">
                      <div className="transition-all duration-200">
                        {renderCell(item, columnKey, itemIndex)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>
      {/* Pagination is moved outside the scrollable area to make it sticky */}
      {renderPagination()}
    </div>
  );
};

export default EmployeeTable;
                