/**
 * Employee Table Organism
 * 
 * Complete employee management table with advanced features including
 * CRUD operations, attendance configuration, responsive design,
 * and comprehensive data management following atomic design principles.
 * 
 * @component
 * @example
 * ```jsx
 * <EmployeeTable
 *   employees={employees}
 *   departments={departments}
 *   designations={designations}
 *   attendanceTypes={attendanceTypes}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 *   isMobile={false}
 *   isTablet={false}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  useDisclosure
} from "@heroui/react";
import { useMediaQuery } from "@mui/material";

// Sub-components
import EmployeeTableCell from './components/EmployeeTableCell';
import EmployeeActions from './components/EmployeeActions';
import EmployeeMobileCard from './components/EmployeeMobileCard';
import AttendanceConfigModal from './components/AttendanceConfigModal';

// Hooks and utilities
import { useEmployeeTable } from './hooks/useEmployeeTable';
import {
  sortEmployees,
  getEmployeeStatistics,
  paginateEmployees
} from './utils/employeeTableUtils';

/**
 * Employee Table Organism Component
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.employees - Array of employee objects
 * @param {Array} props.departments - Available departments
 * @param {Array} props.designations - Available designations
 * @param {Array} props.attendanceTypes - Available attendance types
 * @param {Function} props.onUpdate - Update callback function
 * @param {Function} props.onDelete - Delete callback function
 * @param {Function} props.onRefresh - Refresh callback function
 * @param {boolean} props.isMobile - Mobile view flag
 * @param {boolean} props.isTablet - Tablet view flag
 * @param {boolean} props.isLoading - Global loading state
 * @param {Object} props.pagination - Pagination configuration
 * @param {Object} props.sorting - Sorting configuration
 * @returns {JSX.Element} Rendered EmployeeTable component
 */
const EmployeeTable = ({
  employees = [],
  departments = [],
  designations = [],
  attendanceTypes = [],
  onUpdate,
  onDelete,
  onRefresh,
  isMobile = false,
  isTablet = false,
  isLoading = false,
  pagination = null,
  sorting = null
}) => {
  
  // Responsive design detection
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const isMediumScreen = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isLargeScreen = useMediaQuery('(min-width: 1025px)');
  
  // Use custom hook for employee table management
  const {
    users,
    loadingStates,
    setLoading,
    isLoading: isOperationLoading,
    handleEmployeeUpdate,
    handleEmployeeDelete,
    handleAttendanceConfigSave,
    getUserStats
  } = useEmployeeTable(employees);

  // Modal state for attendance configuration
  const { isOpen: isConfigModalOpen, onOpen: openConfigModal, onClose: closeConfigModal } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);

  // Local state for sorting and pagination
  const [sortConfig, setSortConfig] = useState(sorting || { field: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  /**
   * Handle column sorting
   */
  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  /**
   * Handle field updates
   */
  const handleFieldUpdate = useCallback(async (field, userId, value) => {
    const success = await handleEmployeeUpdate(field, userId, value);
    if (success && onUpdate) {
      onUpdate(field, userId, value);
    }
  }, [handleEmployeeUpdate, onUpdate]);

  /**
   * Handle employee deletion
   */
  const handleDelete = useCallback(async (userId) => {
    const success = await handleEmployeeDelete(userId);
    if (success && onDelete) {
      onDelete(userId);
    }
  }, [handleEmployeeDelete, onDelete]);

  /**
   * Handle attendance configuration
   */
  const handleConfigureAttendance = useCallback((user) => {
    setSelectedUser(user);
    openConfigModal();
  }, [openConfigModal]);

  /**
   * Handle attendance configuration save
   */
  const handleConfigSave = useCallback(async (userId, config) => {
    const success = await handleAttendanceConfigSave(userId, config);
    if (success) {
      closeConfigModal();
      if (onRefresh) {
        onRefresh();
      }
    }
    return success;
  }, [handleAttendanceConfigSave, closeConfigModal, onRefresh]);

  /**
   * Process and sort employees data
   */
  const processedEmployees = useMemo(() => {
    let processed = [...users];
    
    // Apply sorting
    if (sortConfig.field) {
      processed = sortEmployees(processed, sortConfig.field, sortConfig.direction);
    }
    
    return processed;
  }, [users, sortConfig]);

  /**
   * Paginate employees if pagination is enabled
   */
  const paginatedData = useMemo(() => {
    if (pagination) {
      return paginateEmployees(processedEmployees, currentPage, perPage);
    }
    return {
      data: processedEmployees,
      total: processedEmployees.length,
      currentPage: 1,
      lastPage: 1,
      perPage: processedEmployees.length,
      from: 1,
      to: processedEmployees.length
    };
  }, [processedEmployees, currentPage, perPage, pagination]);

  /**
   * Define table columns
   */
  const columns = useMemo(() => {
    const baseColumns = [
      { name: "No.", uid: "sl", width: 60, sortable: false },
      { name: "Employee", uid: "employee", sortable: true },
      { name: "Contact", uid: "contact", sortable: false },
      { name: "Department", uid: "department", sortable: true },
      { name: "Designation", uid: "designation", sortable: true },
      { name: "Attendance Type", uid: "attendance_type", sortable: false },
      { name: "Join Date", uid: "joining_date", sortable: true },
      { name: "Actions", uid: "actions", width: 120, sortable: false }
    ];

    // Remove some columns for smaller screens
    if (isSmallScreen) {
      return baseColumns.filter(col => 
        ['sl', 'employee', 'department', 'actions'].includes(col.uid)
      );
    }
    
    if (isMediumScreen) {
      return baseColumns.filter(col => col.uid !== 'contact');
    }
    
    return baseColumns;
  }, [isSmallScreen, isMediumScreen]);

  /**
   * Render table cell content
   */
  const renderCell = useCallback((user, columnKey, index) => {
    if (columnKey === 'actions') {
      return (
        <EmployeeActions
          user={user}
          isMobile={isSmallScreen}
          onEdit={() => window.location.href = route('profile', { user: user.id })}
          onDelete={() => handleDelete(user.id)}
          onConfigure={() => handleConfigureAttendance(user)}
          isLoading={isOperationLoading}
        />
      );
    }

    return (
      <EmployeeTableCell
        columnKey={columnKey}
        user={user}
        value={user[columnKey]}
        index={index}
        departments={departments}
        designations={designations}
        attendanceTypes={attendanceTypes}
        onUpdate={handleFieldUpdate}
        isLoading={isOperationLoading}
        isMobile={isSmallScreen}
      />
    );
  }, [
    departments,
    designations,
    attendanceTypes,
    handleFieldUpdate,
    handleDelete,
    handleConfigureAttendance,
    isOperationLoading,
    isSmallScreen
  ]);

  /**
   * Loading state component
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" color="primary" />
        <span className="ml-2 text-foreground">Loading employees...</span>
      </div>
    );
  }

  /**
   * Mobile view - render cards instead of table
   */
  if (isSmallScreen) {
    return (
      <div className="space-y-4">
        {paginatedData.data.map((user, index) => (
          <EmployeeMobileCard
            key={user.id}
            user={user}
            index={index}
            departments={departments}
            designations={designations}
            attendanceTypes={attendanceTypes}
            onUpdate={handleFieldUpdate}
            onDelete={handleDelete}
            onConfigure={handleConfigureAttendance}
            isLoading={isOperationLoading}
          />
        ))}
        
        {paginatedData.data.length === 0 && (
          <div className="text-center py-8 text-default-500">
            No employees found
          </div>
        )}

        {/* Attendance Configuration Modal */}
        <AttendanceConfigModal
          isOpen={isConfigModalOpen}
          onClose={closeConfigModal}
          selectedUser={selectedUser}
          onSave={handleConfigSave}
          isLoading={isOperationLoading(selectedUser?.id, 'attendance_config')}
        />
      </div>
    );
  }

  /**
   * Desktop/Tablet view - render table
   */
  return (
    <div className="w-full">
      <Table
        aria-label="Employees table with advanced features"
        classNames={{
          wrapper: "bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
          th: "bg-white/10 backdrop-blur-md text-foreground font-semibold",
          td: "border-b border-white/10",
          tbody: "divide-y divide-white/10"
        }}
        removeWrapper={false}
        isHeaderSticky
        isCompact={isMediumScreen}
        sortDescriptor={{
          column: sortConfig.field,
          direction: sortConfig.direction
        }}
        onSortChange={(descriptor) => {
          if (descriptor.column) {
            handleSort(descriptor.column);
          }
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn 
              key={column.uid} 
              align={column.uid === "actions" ? "center" : column.uid === "sl" ? "center" : "start"}
              className="bg-white/10 backdrop-blur-md"
              width={column.width}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        
        <TableBody 
          items={paginatedData.data} 
          emptyContent="No employees found"
          isLoading={isLoading}
          loadingContent={<Spinner size="lg" color="primary" />}
        >
          {paginatedData.data.map((user, index) => (
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

      {/* Attendance Configuration Modal */}
      <AttendanceConfigModal
        isOpen={isConfigModalOpen}
        onClose={closeConfigModal}
        selectedUser={selectedUser}
        onSave={handleConfigSave}
        isLoading={isOperationLoading(selectedUser?.id, 'attendance_config')}
      />
    </div>
  );
};

export default EmployeeTable;
