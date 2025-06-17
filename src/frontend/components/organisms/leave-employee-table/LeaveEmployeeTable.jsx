/**
 * LeaveEmployeeTable Organism Component
 * 
 * A comprehensive leave management table component with features:
 * - Leave request listing with status management
 * - Real-time status updates (New, Pending, Approved, Declined)
 * - Employee information display (admin view)
 * - Date range formatting and duration calculation
 * - Responsive design with mobile cards
 * - Pagination support
 * - CRUD operations (edit, delete)
 * - Role-based access control
 * 
 * @component
 * @example
 * <LeaveEmployeeTable 
 *   leaves={leaves}
 *   allUsers={users}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onStatusUpdate={handleStatusUpdate}
 *   currentPage={1}
 *   totalRows={100}
 *   perPage={10}
 * />
 */

import React, { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, ScrollShadow, Box, Pagination } from "@heroui/react";
import { useLeaveTable } from "./hooks/useLeaveTable";
import { LeaveTableCell, LeaveActions, LeaveStatusChip, LeaveMobileCard } from "./components";
import { getLeaveColumns, getResponsiveColumns } from "./utils";
import { LEAVE_TABLE_CONFIG } from "./config";

const LeaveEmployeeTable = ({
  leaves = [],
  allUsers = [],
  handleClickOpen,
  setCurrentLeave,
  openModal,
  setLeaves,
  setCurrentPage,
  currentPage = 1,
  totalRows = 0,
  lastPage = 1,
  perPage = 10,
  selectedMonth,
  employee,
  isMobile = false,
  isTablet = false
}) => {
  
  const {
    isUpdating,
    updateLeaveStatus,
    getStatusChip,
    getUserInfo,
    formatDate,
    getLeaveDuration,
    handlePageChange
  } = useLeaveTable({
    setLeaves,
    setCurrentPage,
    allUsers
  });

  // Get responsive columns based on screen size and user role
  const columns = getResponsiveColumns(isMobile, isTablet);

  const renderCell = (leave, columnKey) => {
    switch (columnKey) {
      case "employee":
      case "leave_type":
      case "from_date":
      case "to_date":
      case "reason":
        return (
          <LeaveTableCell
            leave={leave}
            columnKey={columnKey}
            getUserInfo={getUserInfo}
            formatDate={formatDate}
            getLeaveDuration={getLeaveDuration}
          />
        );

      case "status":
        return (
          <LeaveStatusChip
            leave={leave}
            getStatusChip={getStatusChip}
            updateLeaveStatus={updateLeaveStatus}
            isUpdating={isUpdating}
          />
        );

      case "actions":
        return (
          <LeaveActions
            leave={leave}
            onEdit={() => {
              setCurrentLeave(leave);
              openModal("edit_leave");
            }}
            onDelete={() => handleClickOpen(leave.id, "delete_leave")}
          />
        );

      default:
        return leave[columnKey] || "N/A";
    }
  };

  // Mobile view with cards
  if (isMobile) {
    return (
      <Box className="space-y-4">
        <ScrollShadow className="max-h-[70vh]">
          {leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-6xl text-default-300 mb-4">📝</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Leave Requests
              </h3>
              <p className="text-default-500 max-w-md">
                {employee ? `No leaves found for "${employee}"` : "No leave requests for the selected period"}
              </p>
            </div>
          ) : (
            leaves.map((leave) => (
              <LeaveMobileCard
                key={leave.id}
                leave={leave}
                getUserInfo={getUserInfo}
                getStatusChip={getStatusChip}
                formatDate={formatDate}
                getLeaveDuration={getLeaveDuration}
                updateLeaveStatus={updateLeaveStatus}
                isUpdating={isUpdating}
                onEdit={() => {
                  setCurrentLeave(leave);
                  openModal("edit_leave");
                }}
                onDelete={() => handleClickOpen(leave.id, "delete_leave")}
              />
            ))
          )}
        </ScrollShadow>
        {totalRows > perPage && (
          <Box className="flex justify-center pt-4">
            <Pagination
              initialPage={1}
              isCompact
              showControls
              showShadow
              color="primary"
              variant="bordered"
              page={currentPage}
              total={lastPage}
              onChange={handlePageChange}
              size="sm"
            />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: "84vh", overflowY: "auto" }}>
      <ScrollShadow className="max-h-[70vh]">
        <Table
          isStriped
          selectionMode="multiple"
          selectionBehavior="toggle"
          isCompact={!isTablet}
          isHeaderSticky
          removeWrapper
          aria-label="Leave management table with status updates and CRUD operations"
          classNames={{
            wrapper: "min-h-[222px] bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
            table: "min-h-[400px]",
            thead: "[&>tr]:first:shadow-small bg-white/10 backdrop-blur-md",
            tbody: "divide-y divide-default-200/50",
            tr: "group hover:bg-white/5 transition-colors duration-200"
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn 
                key={column.uid} 
                align={column.uid === "actions" ? "center" : "start"}
                className="bg-white/10 backdrop-blur-md text-foreground font-semibold"
              >
                <Box className="flex items-center gap-2">
                  {column.icon && <column.icon className="w-4 h-4" />}
                  <span>{column.name}</span>
                </Box>
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            items={leaves}
            emptyContent={
              <Box className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-6xl text-default-300 mb-4">📝</div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  No Leave Requests Found
                </h3>
                <p className="text-default-500 max-w-md">
                  {employee ? `No leaves found for "${employee}"` : "No leave requests for the selected period. Leave requests will appear here once submitted."}
                </p>
              </Box>
            }
          >
            {(leave) => (
              <TableRow 
                key={leave.id}
                className="hover:bg-white/5 transition-colors duration-200"
              >
                {(columnKey) => (
                  <TableCell className="py-3 border-b border-white/10">
                    {renderCell(leave, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollShadow>
      {totalRows > perPage && (
        <Box className="py-4 flex justify-center">
          <Pagination
            initialPage={1}
            isCompact
            showControls
            showShadow
            color="primary"
            variant="bordered"
            page={currentPage}
            total={lastPage}
            onChange={handlePageChange}
            size={isTablet ? "sm" : "md"}
            aria-label="Leave table pagination"
          />
        </Box>
      )}
    </Box>
  );
};

export default LeaveEmployeeTable;
