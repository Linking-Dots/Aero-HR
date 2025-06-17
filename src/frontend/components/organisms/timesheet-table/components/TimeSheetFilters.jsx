/**
 * TimeSheetFilters Component
 * 
 * Filter controls for the timesheet table including search,
 * date selection, and other filtering options.
 * 
 * @component
 * @example
 * <TimeSheetFilters
 *   auth={auth}
 *   url={url}
 *   employee={employee}
 *   filterData={filterData}
 *   selectedDate={selectedDate}
 *   handleSearch={handleSearch}
 *   handleDateChange={handleDateChange}
 *   handleFilterChange={handleFilterChange}
 * />
 */

import React from "react";
import { Box, Grid } from "@mui/material";
import { Input } from "@heroui/react";
import { 
    MagnifyingGlassIcon,
    CalendarDaysIcon
} from "@heroicons/react/24/outline";
import { TIMESHEET_TABLE_CONFIG } from "../config";

const TimeSheetFilters = ({
    auth,
    url,
    employee,
    filterData,
    selectedDate,
    handleSearch,
    handleDateChange,
    handleFilterChange
}) => {
    const { search, validation } = TIMESHEET_TABLE_CONFIG;
    const isAdminView = auth.roles.includes('Administrator') && url !== '/attendance-employee';
    const isEmployeeView = url === '/attendance-employee';

    return (
        <Box 
            component="section"
            role="search"
            aria-label="Timesheet filters"
        >
            <Grid container spacing={3}>
                {/* Employee Search - Only for Admin Daily View */}
                {isAdminView && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <Input
                                label="Search Employee"
                                type="text"
                                fullWidth
                                variant="bordered"
                                placeholder={search.placeholder}
                                value={employee}
                                onChange={handleSearch}
                                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                                aria-label="Search employees"
                                classNames={{
                                    input: "text-small",
                                    inputWrapper: "h-unit-10 min-h-unit-10"
                                }}
                            />
                        </Grid>
                        
                        {/* Date Selection for Admin Daily View */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Input
                                label="Select Date"
                                type="date"
                                variant="bordered"
                                onChange={handleDateChange}
                                value={new Date(selectedDate).toISOString().slice(0, 10) || ''}
                                startContent={<CalendarDaysIcon className="w-4 h-4 text-default-400" />}
                                aria-label="Select date for timesheet"
                                classNames={{
                                    input: "text-small",
                                    inputWrapper: "h-unit-10 min-h-unit-10"
                                }}
                            />
                        </Grid>
                    </>
                )}

                {/* Month Selection for Employee View */}
                {isEmployeeView && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Input
                            label="Select Month"
                            type="month"
                            fullWidth
                            variant="bordered"
                            placeholder="Select month..."
                            value={filterData.currentMonth}
                            onChange={(e) => handleFilterChange('currentMonth', e.target.value)}
                            startContent={<CalendarDaysIcon className="w-4 h-4 text-default-400" />}
                            aria-label="Select month for timesheet"
                            classNames={{
                                input: "text-small",
                                inputWrapper: "h-unit-10 min-h-unit-10"
                            }}
                        />
                    </Grid>
                )}

                {/* Additional Filter Placeholders */}
                {/* These can be expanded based on future requirements */}
                
                {/* Department Filter - Future Enhancement */}
                {/* 
                {isAdminView && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Select
                            label="Department"
                            placeholder="All Departments"
                            variant="bordered"
                            selectionMode="single"
                            aria-label="Filter by department"
                        >
                            <SelectItem key="all" value="all">All Departments</SelectItem>
                        </Select>
                    </Grid>
                )}
                */}

                {/* Status Filter - Future Enhancement */}
                {/*
                {isAdminView && (
                    <Grid item xs={12} sm={6} md={4}>
                        <Select
                            label="Status"
                            placeholder="All Status"
                            variant="bordered"
                            selectionMode="single"
                            aria-label="Filter by status"
                        >
                            <SelectItem key="all" value="all">All Status</SelectItem>
                            <SelectItem key="present" value="present">Present</SelectItem>
                            <SelectItem key="absent" value="absent">Absent</SelectItem>
                            <SelectItem key="incomplete" value="incomplete">Incomplete</SelectItem>
                        </Select>
                    </Grid>
                )}
                */}
            </Grid>
        </Box>
    );
};

export default TimeSheetFilters;
