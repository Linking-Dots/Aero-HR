import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  CircularProgress,
  Grow,
  useMediaQuery,
  Stack,
  Fade,
  Skeleton
} from "@mui/material";
import { toast } from "react-toastify";
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
  Spinner,
  Card,
  CardHeader,
  Divider,
  ScrollShadow,
  Pagination,
  Avatar
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
  CheckCircleIcon,
  XCircleIcon,
  HashtagIcon,
  SparklesIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid
} from "@heroicons/react/24/solid";
import GlassCard from '@/Components/GlassCard.jsx';

const EmployeeTableModern = ({ 
  allUsers = [], 
  departments = [], 
  designations = [], 
  attendanceTypes = [], 
  setUsers, 
  pagination,
  onPageChange,
  onRowsPerPageChange,
  totalUsers = 0,
  loading = false,
  updateEmployeeOptimized,
  deleteEmployeeOptimized
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Enhanced state management with optimistic updates
  const [updating, setUpdating] = useState({});
  const [recentlyUpdated, setRecentlyUpdated] = useState({});
  const [errors, setErrors] = useState({});
  const [retryAttempts, setRetryAttempts] = useState({});
  
  // Animation states for smoother transitions
  const [animatingRows, setAnimatingRows] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);

  // Helper functions with enhanced error handling
  const isLoading = useCallback((userId, action) => {
    return updating[`${userId}-${action}`] === true;
  }, [updating]);

  const isUserLoading = useCallback((userId) => {
    return Object.keys(updating).some(key => 
      key.startsWith(`${userId}-`) && updating[key] === true
    );
  }, [updating]);

  const wasRecentlyUpdated = useCallback((userId, action) => {
    return recentlyUpdated[`${userId}-${action}`] === true;
  }, [recentlyUpdated]);

  const hasError = useCallback((userId, action) => {
    return errors[`${userId}-${action}`] === true;
  }, [errors]);

  // Enhanced loading state with animation support
  const setLoadingState = useCallback((userId, action, isLoading, withAnimation = true) => {
    const key = `${userId}-${action}`;
    
    setUpdating(prev => ({
      ...prev,
      [key]: isLoading
    }));

    if (withAnimation && isLoading) {
      setAnimatingRows(prev => new Set(prev).add(userId));
    } else if (!isLoading) {
      setTimeout(() => {
        setAnimatingRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 300);
    }

    // Clear errors when starting new operation
    if (isLoading) {
      setErrors(prev => ({
        ...prev,
        [key]: false
      }));
    }
  }, []);

  // Enhanced success state with smooth animations
  const setSuccessState = useCallback((userId, action) => {
    const key = `${userId}-${action}`;
    
    setRecentlyUpdated(prev => ({
      ...prev,
      [key]: true
    }));
    
    // Clear success state after 3 seconds with fade out
    setTimeout(() => {
      setRecentlyUpdated(prev => ({
        ...prev,
        [key]: false
      }));
    }, 3000);
  }, []);

  // Error state management
  const setErrorState = useCallback((userId, action, errorMessage = null) => {
    const key = `${userId}-${action}`;
    
    setErrors(prev => ({
      ...prev,
      [key]: true
    }));
    
    if (errorMessage) {
      toast.error(errorMessage);
    }
    
    // Clear error state after 5 seconds
    setTimeout(() => {
      setErrors(prev => ({
        ...prev,
        [key]: false
      }));
    }, 5000);
  }, []);

  // Enhanced retry mechanism
  const retryOperation = useCallback(async (userId, action, operation) => {
    const retryKey = `${userId}-${action}`;
    const currentAttempts = retryAttempts[retryKey] || 0;
    
    if (currentAttempts >= 3) {
      toast.error('Maximum retry attempts reached. Please try again later.');
      return;
    }
    
    setRetryAttempts(prev => ({
      ...prev,
      [retryKey]: currentAttempts + 1
    }));
    
    await operation();
  }, [retryAttempts]);

  // Enhanced department change with optimistic updates and retry
  const handleDepartmentChange = useCallback(async (userId, departmentId) => {
    const operation = async () => {
      setLoadingState(userId, 'department', true);

      try {
        const response = await axios.post(route('user.updateDepartment', { id: userId }), {
          department: departmentId
        });

        if (response.status === 200) {
          const departmentObj = departments.find(d => d.id === parseInt(departmentId)) || null;
          
          // Optimistic update
          updateEmployeeOptimized?.(userId, {
            department_id: departmentId,
            department_name: departmentObj?.name || '',
            designation_id: null,
            designation_name: null
          });
          
          toast.success('Department updated successfully', {
            icon: <CheckCircleSolid className="w-5 h-5 text-green-500" />
          });
          setSuccessState(userId, 'department');
          
          // Reset retry attempts on success
          setRetryAttempts(prev => ({
            ...prev,
            [`${userId}-department`]: 0
          }));
        }
      } catch (error) {
        console.error('Error updating department:', error);
        setErrorState(userId, 'department', 'Failed to update department');
        
        // Offer retry option
        setTimeout(() => {
          if (window.confirm('Department update failed. Would you like to retry?')) {
            retryOperation(userId, 'department', operation);
          }
        }, 1000);
      } finally {
        setLoadingState(userId, 'department', false);
      }
    };

    await operation();
  }, [departments, updateEmployeeOptimized, setLoadingState, setSuccessState, setErrorState, retryOperation]);

  // Enhanced designation change
  const handleDesignationChange = useCallback(async (userId, designationId) => {
    const operation = async () => {
      setLoadingState(userId, 'designation', true);
      
      try {
        const response = await axios.post(route('user.updateDesignation', { id: userId }), {
          designation_id: designationId
        });

        if (response.status === 200) {
          const designationObj = designations.find(d => d.id === parseInt(designationId)) || null;
          
          updateEmployeeOptimized?.(userId, {
            designation_id: designationId,
            designation_name: designationObj?.title || ''
          });
          
          toast.success("Designation updated successfully", {
            icon: <CheckCircleSolid className="w-5 h-5 text-green-500" />
          });
          setSuccessState(userId, 'designation');
          
          setRetryAttempts(prev => ({
            ...prev,
            [`${userId}-designation`]: 0
          }));
        }
      } catch (error) {
        console.error('Error updating designation:', error);
        setErrorState(userId, 'designation', 'Failed to update designation');
        
        setTimeout(() => {
          if (window.confirm('Designation update failed. Would you like to retry?')) {
            retryOperation(userId, 'designation', operation);
          }
        }, 1000);
      } finally {
        setLoadingState(userId, 'designation', false);
      }
    };

    await operation();
  }, [designations, updateEmployeeOptimized, setLoadingState, setSuccessState, setErrorState, retryOperation]);

  // Enhanced attendance type change
  const handleAttendanceTypeChange = useCallback(async (userId, attendanceTypeId) => {
    const operation = async () => {
      setLoadingState(userId, 'attendance_type', true);
      
      try {
        const response = await axios.post(route('user.updateAttendanceType', { id: userId }), {
          attendance_type_id: attendanceTypeId
        });
        
        if (response.status === 200) {
          const attendanceTypeName = attendanceTypes.find(t => t.id === parseInt(attendanceTypeId))?.name || '';
          
          updateEmployeeOptimized?.(userId, { 
            attendance_type_id: attendanceTypeId,
            attendance_type_name: attendanceTypeName
          });
          
          toast.success('Attendance type updated successfully', {
            icon: <CheckCircleSolid className="w-5 h-5 text-green-500" />
          });
          setSuccessState(userId, 'attendance_type');
          
          setRetryAttempts(prev => ({
            ...prev,
            [`${userId}-attendance_type`]: 0
          }));
        }
      } catch (error) {
        console.error('Error updating attendance type:', error);
        setErrorState(userId, 'attendance_type', 'Failed to update attendance type');
        
        setTimeout(() => {
          if (window.confirm('Attendance type update failed. Would you like to retry?')) {
            retryOperation(userId, 'attendance_type', operation);
          }
        }, 1000);
      } finally {
        setLoadingState(userId, 'attendance_type', false);
      }
    };

    await operation();
  }, [attendanceTypes, updateEmployeeOptimized, setLoadingState, setSuccessState, setErrorState, retryOperation]);

  // Enhanced delete with confirmation and animation
  const handleDelete = useCallback(async (userId, userName) => {
    const confirmed = window.confirm(`Are you sure you want to delete employee "${userName}"? This action cannot be undone.`);
    if (!confirmed) return;

    setLoadingState(userId, 'delete', true);
    
    try {
      const response = await axios.delete(route('user.delete', { id: userId }));
      
      if (response.status === 200) {
        // Animate removal
        setAnimatingRows(prev => new Set(prev).add(userId));
        
        setTimeout(() => {
          deleteEmployeeOptimized?.(userId);
          toast.success(`Employee "${userName}" deleted successfully`);
        }, 300);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setErrorState(userId, 'delete', 'Failed to delete employee');
    } finally {
      setTimeout(() => {
        setLoadingState(userId, 'delete', false);
      }, 300);
    }
  }, [deleteEmployeeOptimized, setLoadingState, setErrorState]);

  // Dynamic columns based on screen size
  const columns = useMemo(() => {
    const baseColumns = [
      { name: "#", uid: "sl", width: 60 },
      { name: "EMPLOYEE", uid: "employee", sortable: true },
      { name: "DEPARTMENT", uid: "department", sortable: true },
      { name: "DESIGNATION", uid: "designation", sortable: true },
      { name: "ACTIONS", uid: "actions", width: 100 }
    ];

    if (!isMobile) {
      baseColumns.splice(2, 0, { name: "CONTACT", uid: "contact" });
    }
    
    if (!isMobile && !isTablet) {
      baseColumns.splice(-1, 0, { name: "ATTENDANCE TYPE", uid: "attendance_type", sortable: true });
    }
    
    return baseColumns;
  }, [isMobile, isTablet]);

  // Enhanced render cell with animations and better UX
  const renderCell = useCallback((user, columnKey, index) => {
    const startIndex = pagination?.currentPage && pagination?.perPage 
      ? Number((pagination.currentPage - 1) * pagination.perPage) 
      : 0;
    const serialNumber = startIndex + (index || 0) + 1;
    
    const isRowLoading = isUserLoading(user.id);
    const isRowAnimating = animatingRows.has(user.id);
      
    switch (columnKey) {
      case "sl":
        return (
          <Fade in={true} timeout={300 + index * 50}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip
                size="sm"
                variant="flat"
                color={isRowLoading ? "primary" : "default"}
                startContent={isRowLoading ? <Spinner size="sm" /> : null}
                classNames={{
                  base: "bg-white/10 backdrop-blur-md border-white/20",
                  content: "text-foreground font-semibold"
                }}
              >
                {isRowLoading ? "" : serialNumber}
              </Chip>
            </Box>
          </Fade>
        );

      case "employee":
        return (
          <Fade in={true} timeout={400 + index * 50}>
            <Box>
              <User
                avatarProps={{ 
                  radius: "lg", 
                  src: user?.profile_image,
                  size: isMobile ? "sm" : "md",
                  fallback: <UserIcon className="w-4 h-4" />,
                  classNames: {
                    base: `ring-2 ring-offset-2 ring-offset-background ${
                      isRowLoading ? 'ring-primary animate-pulse' : 'ring-transparent'
                    }`,
                  }
                }}
                name={
                  <Typography 
                    variant="body2" 
                    fontWeight="600"
                    className={`text-foreground ${isRowLoading ? 'animate-pulse' : ''}`}
                  >
                    {user?.name}
                  </Typography>
                }
                description={
                  !isMobile && (
                    <Typography variant="caption" className="text-default-500">
                      ID: {user?.employee_id || 'N/A'}
                    </Typography>
                  )
                }
                classNames={{
                  wrapper: "justify-start",
                  description: "text-left"
                }}
              />
              {isMobile && (
                <Stack spacing={0.5} sx={{ ml: 6, mt: 1 }}>
                  <Typography variant="caption" className="text-default-500 flex items-center gap-1">
                    <HashtagIcon className="w-3 h-3" />
                    {user?.employee_id || 'N/A'}
                  </Typography>
                  <Typography variant="caption" className="text-default-500 flex items-center gap-1">
                    <EnvelopeIcon className="w-3 h-3" />
                    {user?.email}
                  </Typography>
                  {user?.phone && (
                    <Typography variant="caption" className="text-default-500 flex items-center gap-1">
                      <PhoneIcon className="w-3 h-3" />
                      {user?.phone}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Fade>
        );

      case "contact":
        return (
          <Fade in={true} timeout={500 + index * 50}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EnvelopeIcon className="w-4 h-4 text-default-400" />
                <Typography variant="body2" className="text-foreground">
                  {user?.email}
                </Typography>
              </Box>
              {user?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon className="w-4 h-4 text-default-400" />
                  <Typography variant="body2" className="text-foreground">
                    {user?.phone}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Fade>
        );

      case "department":
        const isDeptLoading = isLoading(user.id, 'department');
        const isDeptSuccess = wasRecentlyUpdated(user.id, 'department');
        const isDeptError = hasError(user.id, 'department');
        
        return (
          <Fade in={true} timeout={600 + index * 50}>
            <Box sx={{ minWidth: 150 }}>
              <Dropdown isDisabled={isDeptLoading}>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    size="sm"
                    className={`justify-between backdrop-blur-md min-w-[150px] transition-all duration-500 ${
                      isDeptSuccess
                        ? 'bg-green-500/20 border-green-400/60 text-green-300 shadow-green-500/25 shadow-lg' 
                        : isDeptError
                        ? 'bg-red-500/20 border-red-400/60 text-red-300 shadow-red-500/25 shadow-lg'
                        : isDeptLoading
                        ? 'bg-blue-500/20 border-blue-400/60 animate-pulse shadow-blue-500/25 shadow-lg'
                        : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                    }`}
                    isDisabled={isDeptLoading}
                    startContent={
                      isDeptLoading ? (
                        <Spinner size="sm" color="primary" />
                      ) : isDeptSuccess ? (
                        <CheckCircleSolid className="w-4 h-4 text-green-400" />
                      ) : isDeptError ? (
                        <ExclamationTriangleSolid className="w-4 h-4 text-red-400" />
                      ) : (
                        <BuildingOfficeIcon className="w-4 h-4" />
                      )
                    }
                    endContent={!isDeptLoading && !isDeptSuccess && !isDeptError && (
                      <EllipsisVerticalIcon className="w-4 h-4 rotate-90" />
                    )}
                  >
                    <span className={`transition-all duration-300 ${
                      isDeptLoading ? 'animate-pulse' : ''
                    }`}>
                      {isDeptLoading ? 'Updating...' : 
                       isDeptSuccess ? 'Updated!' :
                       isDeptError ? 'Failed' :
                       (user.department_name || "Select Department")}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Department options"
                  className="bg-white/10 backdrop-blur-md border border-white/20"
                >
                  {departments?.map((dept) => (
                    <DropdownItem
                      key={dept.id.toString()}
                      onPress={() => handleDepartmentChange(user.id, dept.id)}
                      isDisabled={isDeptLoading}
                      className={`${isDeptLoading ? 'opacity-50' : 'hover:bg-white/10'} transition-all duration-200`}
                      startContent={<BuildingOfficeIcon className="w-4 h-4" />}
                    >
                      {dept.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Box>
          </Fade>
        );

      case "designation":
        const departmentId = user.department_id;
        const filteredDesignations = designations?.filter(d => d.department_id === parseInt(departmentId)) || [];
        const isDesigLoading = isLoading(user.id, 'designation');
        const isDesigSuccess = wasRecentlyUpdated(user.id, 'designation');
        const isDesigError = hasError(user.id, 'designation');

        return (
          <Fade in={true} timeout={700 + index * 50}>
            <Box sx={{ minWidth: 150 }}>
              <Dropdown isDisabled={!departmentId || isDesigLoading}>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    size="sm"
                    className={`justify-between backdrop-blur-md min-w-[150px] transition-all duration-500 ${
                      isDesigSuccess
                        ? 'bg-green-500/20 border-green-400/60 text-green-300 shadow-green-500/25 shadow-lg' 
                        : isDesigError
                        ? 'bg-red-500/20 border-red-400/60 text-red-300 shadow-red-500/25 shadow-lg'
                        : isDesigLoading
                        ? 'bg-blue-500/20 border-blue-400/60 animate-pulse shadow-blue-500/25 shadow-lg'
                        : !departmentId
                        ? 'bg-gray-500/20 border-gray-400/40 opacity-60'
                        : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                    }`}
                    isDisabled={!departmentId || isDesigLoading}
                    startContent={
                      isDesigLoading ? (
                        <Spinner size="sm" color="primary" />
                      ) : isDesigSuccess ? (
                        <CheckCircleSolid className="w-4 h-4 text-green-400" />
                      ) : isDesigError ? (
                        <ExclamationTriangleSolid className="w-4 h-4 text-red-400" />
                      ) : (
                        <BriefcaseIcon className="w-4 h-4" />
                      )
                    }
                    endContent={!isDesigLoading && !isDesigSuccess && !isDesigError && departmentId && (
                      <EllipsisVerticalIcon className="w-4 h-4 rotate-90" />
                    )}
                  >
                    <span className={`transition-all duration-300 ${
                      isDesigLoading ? 'animate-pulse' : ''
                    }`}>
                      {isDesigLoading ? 'Updating...' : 
                       isDesigSuccess ? 'Updated!' :
                       isDesigError ? 'Failed' :
                       !departmentId ? 'Select Department First' :
                       (user.designation_name || "Select Designation")}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Designation options"
                  className="bg-white/10 backdrop-blur-md border border-white/20"
                >
                  {filteredDesignations.map((desig) => (
                    <DropdownItem
                      key={desig.id.toString()}
                      onPress={() => handleDesignationChange(user.id, desig.id)}
                      isDisabled={isDesigLoading}
                      className={`${isDesigLoading ? 'opacity-50' : 'hover:bg-white/10'} transition-all duration-200`}
                      startContent={<BriefcaseIcon className="w-4 h-4" />}
                    >
                      {desig.title}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Box>
          </Fade>
        );

      case "attendance_type":
        const isAttendanceLoading = isLoading(user.id, 'attendance_type');
        const isAttendanceSuccess = wasRecentlyUpdated(user.id, 'attendance_type');
        const isAttendanceError = hasError(user.id, 'attendance_type');
        
        return (
          <Fade in={true} timeout={800 + index * 50}>
            <Box sx={{ minWidth: 150 }}>
              <Dropdown isDisabled={isAttendanceLoading}>
                <DropdownTrigger>
                  <Button 
                    variant="bordered"
                    size="sm"
                    className={`justify-between backdrop-blur-md min-w-[150px] transition-all duration-500 ${
                      isAttendanceSuccess
                        ? 'bg-green-500/20 border-green-400/60 text-green-300 shadow-green-500/25 shadow-lg' 
                        : isAttendanceError
                        ? 'bg-red-500/20 border-red-400/60 text-red-300 shadow-red-500/25 shadow-lg'
                        : isAttendanceLoading
                        ? 'bg-blue-500/20 border-blue-400/60 animate-pulse shadow-blue-500/25 shadow-lg'
                        : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                    }`}
                    isDisabled={isAttendanceLoading}
                    startContent={
                      isAttendanceLoading ? (
                        <Spinner size="sm" color="primary" />
                      ) : isAttendanceSuccess ? (
                        <CheckCircleSolid className="w-4 h-4 text-green-400" />
                      ) : isAttendanceError ? (
                        <ExclamationTriangleSolid className="w-4 h-4 text-red-400" />
                      ) : (
                        <ClockIcon className="w-4 h-4" />
                      )
                    }
                    endContent={!isAttendanceLoading && !isAttendanceSuccess && !isAttendanceError && (
                      <EllipsisVerticalIcon className="w-4 h-4 rotate-90" />
                    )}
                  >
                    <span className={`transition-all duration-300 ${
                      isAttendanceLoading ? 'animate-pulse' : ''
                    }`}>
                      {isAttendanceLoading ? 'Updating...' : 
                       isAttendanceSuccess ? 'Updated!' :
                       isAttendanceError ? 'Failed' :
                       (user.attendance_type_name || "Select Type")}
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Attendance Type options"
                  className="bg-white/10 backdrop-blur-md border border-white/20"
                >
                  {attendanceTypes?.map((type) => (
                    <DropdownItem
                      key={type.id.toString()}
                      onPress={() => handleAttendanceTypeChange(user.id, type.id)}
                      isDisabled={isAttendanceLoading}
                      className={`${isAttendanceLoading ? 'opacity-50' : 'hover:bg-white/10'} transition-all duration-200`}
                      startContent={<ClockIcon className="w-4 h-4" />}
                    >
                      {type.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Box>
          </Fade>
        );

      case "actions":
        const isDeleteLoading = isLoading(user.id, 'delete');
        
        return (
          <Fade in={true} timeout={900 + index * 50}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Dropdown isDisabled={isDeleteLoading}>
                <DropdownTrigger>
                  <Button 
                    isIconOnly 
                    variant="light" 
                    className={`transition-all duration-300 ${
                      isDeleteLoading 
                        ? 'animate-pulse bg-red-500/20 text-red-400' 
                        : 'text-default-400 hover:text-foreground hover:bg-white/10'
                    }`}
                    isDisabled={isDeleteLoading}
                  >
                    {isDeleteLoading ? (
                      <Spinner size="sm" color="danger" />
                    ) : (
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="Employee Actions"
                  className="bg-white/10 backdrop-blur-md border border-white/20"
                >
                  <DropdownItem 
                    key="edit" 
                    startContent={<PencilIcon className="w-4 h-4" />}
                    onPress={() => window.location.href = route('profile', { user: user.id })}
                    isDisabled={isDeleteLoading}
                    className={`${isDeleteLoading ? 'opacity-50' : 'hover:bg-white/10'} transition-all duration-200`}
                  >
                    Edit Profile
                  </DropdownItem>
                  
                  <DropdownItem 
                    key="delete" 
                    className={`text-danger ${isDeleteLoading ? 'opacity-50' : 'hover:bg-red-500/10'} transition-all duration-200`}
                    color="danger"
                    startContent={
                      isDeleteLoading ? 
                      <Spinner size="sm" color="danger" /> : 
                      <TrashIcon className="w-4 h-4" />
                    }
                    onPress={() => handleDelete(user.id, user.name)}
                    isDisabled={isDeleteLoading}
                  >
                    {isDeleteLoading ? 'Deleting...' : 'Delete'}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Box>
          </Fade>
        );
        
      default:
        return (
          <Typography variant="body2">
            {user[columnKey]}
          </Typography>
        );
    }
  }, [
    pagination, isUserLoading, animatingRows, isLoading, wasRecentlyUpdated, hasError,
    departments, designations, attendanceTypes, handleDepartmentChange, 
    handleDesignationChange, handleAttendanceTypeChange, handleDelete, isMobile
  ]);

  // Enhanced pagination with glass morphism
  const renderPagination = useCallback(() => {
    if (!pagination || loading) return null;
    
    return (
      <GlassCard className="p-4 m-0">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Typography variant="caption" className="text-default-400">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {
              Math.min(pagination.currentPage * pagination.perPage, pagination.total)
            } of {pagination.total} employees
          </Typography>
          
          <Pagination
            total={Math.ceil(pagination.total / pagination.perPage)}
            initialPage={pagination.currentPage}
            page={pagination.currentPage}
            onChange={onPageChange}
            size={isMobile ? "sm" : "md"}
            variant="bordered"
            showControls
            classNames={{
              item: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200",
              cursor: "bg-primary/20 backdrop-blur-md border-primary/40 text-primary shadow-primary/25 shadow-lg",
            }}
          />
        </Box>
      </GlassCard>
    );
  }, [pagination, loading, onPageChange, isMobile]);

  // Loading skeleton for better UX
  const renderLoadingSkeleton = () => (
    <GlassCard>
      <div className="p-4">
        <Stack spacing={2}>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="rectangular" width={120} height={32} />
              <Skeleton variant="rectangular" width={120} height={32} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
          ))}
        </Stack>
      </div>
    </GlassCard>
  );

  if (loading && (!allUsers || allUsers.length === 0)) {
    return renderLoadingSkeleton();
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main Table Card */}
      <GlassCard 
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 200px)',
        }}
      >
        {/* Global loading overlay with better design */}
        {loading && (
          <Fade in={loading}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}
            >
              <GlassCard className="p-6">
                <Stack alignItems="center" spacing={3}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" className="text-foreground">
                    Loading employees...
                  </Typography>
                </Stack>
              </GlassCard>
            </Box>
          </Fade>
        )}
        
        <div className="p-0">
          <ScrollShadow className="w-full h-full">
            <Table
              aria-label="Enhanced Employees table"
              removeWrapper
              classNames={{
                base: "bg-transparent min-w-[800px]",
                th: "bg-white/5 backdrop-blur-md text-default-500 border-b border-white/10 font-medium text-xs",
                td: "border-b border-white/5 py-4",
                table: "border-collapse",
                thead: "bg-white/5",
                tr: "transition-all duration-300"
              }}
              isHeaderSticky
              isCompact={isMobile}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn 
                    key={column.uid} 
                    align={["actions", "sl"].includes(column.uid) ? "center" : "start"}
                    width={column.width}
                    className="bg-white/5 backdrop-blur-md"
                  >
                    <Typography variant="overline" fontWeight="600">
                      {column.name}
                    </Typography>
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody 
                items={allUsers || []} 
                emptyContent={
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <UserIcon className="w-12 h-12 mx-auto text-default-300 mb-4" />
                    <Typography variant="body1" className="text-default-500">
                      No employees found
                    </Typography>
                  </Box>
                }
                loadingContent={<Spinner size="lg" />}
                isLoading={loading}
              >
                {(item, index) => {
                  const itemIndex = allUsers ? allUsers.findIndex(user => user.id === item.id) : index;
                  const userIsLoading = isUserLoading(item.id);
                  const isRowAnimating = animatingRows.has(item.id);
                  
                  return (
                    <TableRow 
                      key={item.id}
                      className={`transition-all duration-500 ${
                        userIsLoading 
                          ? 'bg-blue-500/10 border-blue-400/30 shadow-lg shadow-blue-500/20' 
                          : isRowAnimating
                          ? 'bg-red-500/10 border-red-400/30 shadow-lg shadow-red-500/20 animate-pulse'
                          : hoveredRow === item.id
                          ? 'bg-white/10 border-white/20 shadow-lg'
                          : 'hover:bg-white/5 border-transparent'
                      }`}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {(columnKey) => (
                        <TableCell 
                          className={`transition-all duration-300 ${
                            userIsLoading ? 'opacity-80' : ''
                          }`}
                        >
                          <Box 
                            className={`transition-all duration-200 ${
                              userIsLoading ? 'pointer-events-none' : ''
                            }`}
                          >
                            {renderCell(item, columnKey, itemIndex)}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </ScrollShadow>
        </div>
      </GlassCard>

      {/* Enhanced Pagination */}
      {renderPagination()}
    </Box>
  );
};

export default EmployeeTableModern;
