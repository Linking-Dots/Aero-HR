/**
 * UsersTable Organism Component
 * 
 * A comprehensive user management table component with advanced features:
 * - User CRUD operations (Create, Read, Update, Delete)
 * - Role management with multi-select capability
 * - Status toggling (Active/Inactive)
 * - Responsive design with mobile-first approach
 * - Real-time loading states and error handling
 * - Accessibility features with ARIA labels
 * 
 * @component
 * @example
 * <UsersTable 
 *   allUsers={users}
 *   roles={roles}
 *   setUsers={setUsers}
 *   isMobile={false}
 *   isTablet={false}
 * />
 */

import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { useUsersTable } from "./hooks/useUsersTable";
import { UserTableCell } from "./components/UserTableCell";
import { UserActions } from "./components/UserActions";
import { UserMobileCard } from "./components/UserMobileCard";
import { getResponsiveColumns } from "./utils/usersTableUtils";
import { USERS_TABLE_CONFIG } from "./config";

const UsersTable = ({ 
  allUsers = [], 
  roles = [], 
  setUsers, 
  isMobile = false, 
  isTablet = false 
}) => {
  const [users, setLocalUsers] = useState(allUsers);
  
  const {
    loadingStates,
    handleRoleChange,
    handleStatusToggle,
    handleDelete,
    isLoading,
    setLoading
  } = useUsersTable(users, setLocalUsers, setUsers);

  // Sync with parent component's filtered data
  useEffect(() => {
    setLocalUsers(allUsers);
  }, [allUsers]);

  // Get responsive columns based on screen size
  const columns = getResponsiveColumns(isMobile, isTablet);

  const renderCell = (user, columnKey, index) => {
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

      case "user":
      case "contact":
      case "status":
      case "role":
        return (
          <UserTableCell
            user={user}
            columnKey={columnKey}
            roles={roles}
            isMobile={isMobile}
            isLoading={isLoading}
            onRoleChange={handleRoleChange}
            loadingStates={loadingStates}
          />
        );

      case "actions":
        return (
          <UserActions
            user={user}
            isMobile={isMobile}
            isLoading={isLoading}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            loadingStates={loadingStates}
          />
        );

      default:
        return user[columnKey] || "N/A";
    }
  };

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        {users.map((user, index) => (
          <UserMobileCard
            key={user.id}
            user={user}
            index={index}
            roles={roles}
            isLoading={isLoading}
            onRoleChange={handleRoleChange}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            loadingStates={loadingStates}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table
        aria-label="Users management table with role management and CRUD operations"
        classNames={{
          wrapper: "bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
          th: "bg-white/10 backdrop-blur-md text-foreground font-semibold",
          td: "border-b border-white/10",
          tbody: "divide-y divide-white/10"
        }}
        removeWrapper={false}
        isHeaderSticky
        isCompact={isMobile}
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
        <TableBody 
          items={users} 
          emptyContent={
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-6xl text-default-300 mb-4">👥</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Users Found
              </h3>
              <p className="text-default-500 max-w-md">
                There are no users to display. Users will appear here once they are added to the system.
              </p>
            </div>
          }
        >
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
  );
};

export default UsersTable;
