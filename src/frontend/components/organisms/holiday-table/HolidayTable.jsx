/**
 * HolidayTable Organism Component
 * 
 * A holiday management table component with features:
 * - Holiday listing with date formatting
 * - Edit and delete operations
 * - Responsive design with mobile optimization
 * - Empty state handling
 * - Accessibility features
 * 
 * @component
 * @example
 * <HolidayTable 
 *   holidaysData={holidays}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   isMobile={false}
 * />
 */

import React from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { HolidayTableCell } from "./components/HolidayTableCell";
import { HolidayActions } from "./components/HolidayActions";
import { HolidayMobileCard } from "./components/HolidayMobileCard";
import { formatHolidayData, getHolidayColumns } from "./utils/holidayTableUtils";
import { HOLIDAY_TABLE_CONFIG } from "./config";

const HolidayTable = ({ 
  holidaysData = [], 
  handleClickOpen, 
  setCurrentHoliday, 
  openModal, 
  setHolidaysData,
  isMobile = false 
}) => {
  
  // Get column configuration
  const columns = getHolidayColumns();

  const renderCell = (holiday, columnKey) => {
    switch (columnKey) {
      case "title":
      case "from_date":
      case "to_date":
        return (
          <HolidayTableCell
            holiday={holiday}
            columnKey={columnKey}
          />
        );

      case "actions":
        return (
          <HolidayActions
            holiday={holiday}
            onEdit={() => {
              setCurrentHoliday(holiday);
              openModal('edit_holiday');
            }}
            onDelete={() => handleClickOpen(holiday.id, 'delete_holiday')}
          />
        );

      default:
        return holiday[columnKey] || "N/A";
    }
  };

  // Mobile view with cards
  if (isMobile) {
    return (
      <div className="space-y-4 max-h-[84vh] overflow-y-auto">
        {holidaysData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-6xl text-default-300 mb-4">🏖️</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Holidays Found
            </h3>
            <p className="text-default-500 max-w-md">
              There are no holidays scheduled. Holidays will appear here once they are added to the system.
            </p>
          </div>
        ) : (
          holidaysData.map((holiday, index) => (
            <HolidayMobileCard
              key={holiday.id}
              holiday={holiday}
              index={index}
              onEdit={() => {
                setCurrentHoliday(holiday);
                openModal('edit_holiday');
              }}
              onDelete={() => handleClickOpen(holiday.id, 'delete_holiday')}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="max-h-[84vh] overflow-y-auto">
      {holidaysData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl text-default-300 mb-4">🏖️</div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            No Holidays Scheduled
          </h3>
          <p className="text-default-500 max-w-md">
            There are no holidays to display. Add holidays to help your team plan their time off effectively.
          </p>
        </div>
      ) : (
        <Table
          isStriped
          selectionMode="multiple"
          selectionBehavior="toggle"
          isHeaderSticky
          removeWrapper
          aria-label="Holiday management table"
          classNames={{
            wrapper: "bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
            th: "bg-white/10 backdrop-blur-md text-foreground font-semibold",
            td: "border-b border-white/10 whitespace-nowrap",
            tbody: "divide-y divide-white/10"
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn 
                key={column.uid} 
                align={column.uid === "actions" ? "center" : "start"}
                className="bg-white/10 backdrop-blur-md"
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody 
            items={holidaysData}
            emptyContent={
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-6xl text-default-300 mb-4">🏖️</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Holidays Found
                </h3>
                <p className="text-default-500 max-w-md">
                  There are no holidays to display. Holidays will appear here once they are added to the system.
                </p>
              </div>
            }
          >
            {(holiday) => (
              <TableRow 
                key={holiday.id}
                className="hover:bg-white/5 transition-colors duration-200"
              >
                {(columnKey) => (
                  <TableCell className="py-3">
                    {renderCell(holiday, columnKey)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default HolidayTable;
