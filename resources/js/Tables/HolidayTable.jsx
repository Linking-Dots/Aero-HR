import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Typography,
    useTheme,
    useMediaQuery,
    Box,
    Chip as MuiChip,
    Fade
} from '@mui/material';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    ButtonGroup
} from "@heroui/react";
import {
    CalendarDaysIcon,
    MagnifyingGlassIcon,
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { format, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';

const HolidayTable = ({ 
    holidaysData, 
    onEdit, 
    onDelete,
    onFilteredDataChange,
    isLoading = false 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // State for filtering and pagination
    const [filterValue, setFilterValue] = useState('');
    const [typeFilter, setTypeFilter] = useState([]);
    const [statusFilter, setStatusFilter] = useState([]);
    const [yearFilter, setYearFilter] = useState([new Date().getFullYear().toString()]); // Default to current year
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

    // Holiday type configurations
    const holidayTypes = {
        public: { label: 'Public', color: 'danger', icon: '🏛️' },
        religious: { label: 'Religious', color: 'secondary', icon: '🕌' },
        national: { label: 'National', color: 'primary', icon: '🇧🇩' },
        company: { label: 'Company', color: 'warning', icon: '🏢' },
        optional: { label: 'Optional', color: 'default', icon: '📅' }
    };

    // Status configurations
    const getHolidayStatus = useCallback((holiday) => {
        const today = new Date();
        const fromDate = new Date(holiday.from_date);
        const toDate = new Date(holiday.to_date);
        
        if (isBefore(today, fromDate)) {
            return { status: 'upcoming', label: 'Upcoming', color: 'primary', icon: ClockIcon };
        } else if (isAfter(today, toDate)) {
            return { status: 'past', label: 'Past', color: 'default', icon: CheckCircleIcon };
        } else {
            return { status: 'ongoing', label: 'Ongoing', color: 'success', icon: CheckCircleIcon };
        }
    }, []);

    // Filter holidays
    const filteredHolidays = useMemo(() => {
        let filtered = holidaysData;

        // Text filter
        if (filterValue) {
            filtered = filtered.filter(holiday =>
                holiday.title?.toLowerCase().includes(filterValue.toLowerCase()) ||
                holiday.description?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        // Type filter
        if (Array.isArray(typeFilter) && typeFilter.length > 0) {
            filtered = filtered.filter(holiday => typeFilter.includes(holiday.type));
        }

        // Status filter
        if (Array.isArray(statusFilter) && statusFilter.length > 0) {
            filtered = filtered.filter(holiday => {
                const status = getHolidayStatus(holiday);
                return statusFilter.includes(status.status);
            });
        }

        // Year filter
        if (Array.isArray(yearFilter) && yearFilter.length > 0) {
            filtered = filtered.filter(holiday => {
                const holidayYear = new Date(holiday.from_date).getFullYear().toString();
                return yearFilter.includes(holidayYear);
            });
        }

        return filtered;
    }, [holidaysData, filterValue, typeFilter, statusFilter, yearFilter, getHolidayStatus]);

    // Notify parent component of filtered data changes
    useEffect(() => {
        if (onFilteredDataChange) {
            onFilteredDataChange(filteredHolidays);
        }
    }, [filteredHolidays, onFilteredDataChange]);

    // Pagination
    const pages = Math.ceil(filteredHolidays.length / rowsPerPage);
    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredHolidays.slice(start, end);
    }, [page, filteredHolidays, rowsPerPage]);

    // Table columns
    const columns = [
        { name: "Holiday", uid: "title", sortable: true },
        { name: "Duration", uid: "duration", sortable: true },
        { name: "Type", uid: "type", sortable: true },
        { name: "Status", uid: "status", sortable: true },
        { name: "Actions", uid: "actions" }
    ];

    // Render cell content
    const renderCell = useCallback((holiday, columnKey) => {
        const cellValue = holiday[columnKey];

        switch (columnKey) {
            case "title":
                const duration = differenceInDays(new Date(holiday.to_date), new Date(holiday.from_date)) + 1;
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize text-foreground">
                            {holiday.title}
                        </p>
                        <div className="flex items-center gap-2 text-tiny text-default-400">
                            <CalendarDaysIcon className="w-3 h-3" />
                            <span>
                                {format(new Date(holiday.from_date), 'MMM dd, yyyy')}
                                {duration > 1 && (
                                    <> - {format(new Date(holiday.to_date), 'MMM dd, yyyy')}</>
                                )}
                            </span>
                        </div>
                        {holiday.description && (
                            <p className="text-tiny text-default-500 mt-1 line-clamp-2">
                                {holiday.description}
                            </p>
                        )}
                    </div>
                );
            
            case "duration":
                const days = differenceInDays(new Date(holiday.to_date), new Date(holiday.from_date)) + 1;
                return (
                    <div className="flex flex-col items-center">
                        <span className="text-bold text-sm text-foreground">
                            {days} {days === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                );

            case "type":
                const typeConfig = holidayTypes[holiday.type] || holidayTypes.company;
                return (
                    <Chip
                        className="capitalize"
                        color={typeConfig.color}
                        size="sm"
                        variant="flat"
                        startContent={<span className="text-xs">{typeConfig.icon}</span>}
                    >
                        {typeConfig.label}
                    </Chip>
                );

            case "status":
                const statusConfig = getHolidayStatus(holiday);
                const StatusIcon = statusConfig.icon;
                return (
                    <Chip
                        className="capitalize"
                        color={statusConfig.color}
                        size="sm"
                        variant="flat"
                        startContent={<StatusIcon className="w-3 h-3" />}
                    >
                        {statusConfig.label}
                    </Chip>
                );

            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <EllipsisVerticalIcon className="w-4 h-4" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    key="view"
                                    startContent={<EyeIcon className="w-4 h-4" />}
                                >
                                    View Details
                                </DropdownItem>
                                <DropdownItem
                                    key="edit"
                                    startContent={<PencilIcon className="w-4 h-4" />}
                                    onPress={() => onEdit(holiday)}
                                >
                                    Edit Holiday
                                </DropdownItem>
                                <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    startContent={<TrashIcon className="w-4 h-4" />}
                                    onPress={() => onDelete(holiday.id)}
                                >
                                    Delete Holiday
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                );

            default:
                return cellValue;
        }
    }, [getHolidayStatus, onEdit, onDelete]);

    // Top content with filters
    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                {/* Main search and filter toggle - Matching Leave page */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            isClearable
                            label="Search Holidays"
                            variant="bordered"
                            placeholder="Search by title or description..."
                            startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                            value={filterValue}
                            onClear={() => setFilterValue("")}
                            onValueChange={setFilterValue}
                            classNames={{
                                input: "bg-transparent",
                                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                            }}
                            size={isMobile ? "sm" : "md"}
                        />
                    </div>
                    <div className="flex gap-2 items-end">
                        <ButtonGroup variant="bordered" className="bg-white/5">
                            <Button
                                isIconOnly={isMobile}
                                color={showFilters ? 'primary' : 'default'}
                                onPress={() => setShowFilters(!showFilters)}
                                className={showFilters ? 'bg-purple-500/20' : 'bg-white/5'}
                            >
                                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                {!isMobile && <span className="ml-1">Filters</span>}
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                {/* Advanced filters panel - Matching Leave page */}
                {showFilters && (
                    <Fade in={true} timeout={300}>
                        <div className="p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Select
                                    label="Holiday Type"
                                    selectionMode="multiple"
                                    variant="bordered"
                                    selectedKeys={new Set(typeFilter)}
                                    onSelectionChange={(keys) => setTypeFilter(Array.from(keys))}
                                    classNames={{ 
                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                    }}
                                >
                                    {Object.entries(holidayTypes).map(([key, config]) => (
                                        <SelectItem key={key} value={key} textValue={config.label}>
                                            <div className="flex items-center gap-2">
                                                <span>{config.icon}</span>
                                                <span>{config.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Holiday Status"
                                    selectionMode="multiple"
                                    variant="bordered"
                                    selectedKeys={new Set(statusFilter)}
                                    onSelectionChange={(keys) => setStatusFilter(Array.from(keys))}
                                    classNames={{ 
                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                    }}
                                >
                                    <SelectItem key="upcoming" value="upcoming" textValue="Upcoming">
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-3 h-3" />
                                            <span>Upcoming</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem key="ongoing" value="ongoing" textValue="Ongoing">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-3 h-3" />
                                            <span>Ongoing</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem key="past" value="past" textValue="Past">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-3 h-3" />
                                            <span>Past</span>
                                        </div>
                                    </SelectItem>
                                </Select>

                                <Select
                                    label="Year"
                                    selectionMode="multiple"
                                    variant="bordered"
                                    selectedKeys={new Set(yearFilter)}
                                    onSelectionChange={(keys) => setYearFilter(Array.from(keys))}
                                    classNames={{ 
                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                    }}
                                >
                                    {/* Generate year options from 2020 to current year + 2 */}
                                    {Array.from({ length: new Date().getFullYear() - 2019 + 3 }, (_, i) => {
                                        const year = (2020 + i).toString();
                                        return (
                                            <SelectItem key={year} value={year} textValue={year}>
                                                <div className="flex items-center gap-2">
                                                    <span>📅</span>
                                                    <span>{year}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </Select>
                            </div>

                            {/* Second row for additional controls */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                <Select
                                    label="Rows per page"
                                    variant="bordered"
                                    selectedKeys={new Set([rowsPerPage.toString()])}
                                    onSelectionChange={(keys) => setRowsPerPage(Number(Array.from(keys)[0]))}
                                    classNames={{ 
                                        trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                        popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                    }}
                                >
                                    <SelectItem key="5" value="5" textValue="5">5</SelectItem>
                                    <SelectItem key="10" value="10" textValue="10">10</SelectItem>
                                    <SelectItem key="15" value="15" textValue="15">15</SelectItem>
                                    <SelectItem key="25" value="25" textValue="25">25</SelectItem>
                                </Select>
                            </div>

                            {/* Active Filters as Chips - Matching Leave page */}
                            {(filterValue || 
                              (Array.isArray(typeFilter) && typeFilter.length > 0) || 
                              (Array.isArray(statusFilter) && statusFilter.length > 0) ||
                              (Array.isArray(yearFilter) && yearFilter.length > 0)) && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex flex-wrap gap-2">
                                        {filterValue && (
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onClose={() => setFilterValue('')}
                                            >
                                                Search: {filterValue}
                                            </Chip>
                                        )}
                                        {Array.isArray(typeFilter) && typeFilter.map(type => (
                                            <Chip
                                                key={type}
                                                size="sm"
                                                variant="flat"
                                                color="secondary"
                                                onClose={() => setTypeFilter(prev => prev.filter(t => t !== type))}
                                            >
                                                {holidayTypes[type]?.icon} {holidayTypes[type]?.label}
                                            </Chip>
                                        ))}
                                        {Array.isArray(statusFilter) && statusFilter.map(status => (
                                            <Chip
                                                key={status}
                                                size="sm"
                                                variant="flat"
                                                color="warning"
                                                onClose={() => setStatusFilter(prev => prev.filter(s => s !== status))}
                                            >
                                                {status === 'upcoming' && '🕐'} 
                                                {status === 'ongoing' && '✅'} 
                                                {status === 'past' && '📋'} 
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Chip>
                                        ))}
                                        {Array.isArray(yearFilter) && yearFilter.map(year => (
                                            <Chip
                                                key={year}
                                                size="sm"
                                                variant="flat"
                                                color="secondary"
                                                onClose={() => setYearFilter(prev => prev.filter(y => y !== year))}
                                            >
                                                📅 {year}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Fade>
                )}

                {/* Results count */}
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">
                        Total {filteredHolidays.length} holidays
                        {(Array.isArray(typeFilter) && typeFilter.length > 0) || 
                         (Array.isArray(statusFilter) && statusFilter.length > 0) || 
                         filterValue ? ` (filtered from ${holidaysData.length})` : ''}
                    </span>
                </div>
            </div>
        );
    }, [filterValue, typeFilter, statusFilter, filteredHolidays.length, holidaysData.length, rowsPerPage, showFilters, isMobile]);

    // Bottom content with pagination
    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filteredHolidays.length)} of ${filteredHolidays.length}`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(1)}
                    >
                        First
                    </Button>
                    <Button
                        isDisabled={pages === 1}
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(pages)}
                    >
                        Last
                    </Button>
                </div>
            </div>
        );
    }, [page, pages, filteredHolidays.length, rowsPerPage]);

    if (holidaysData.length === 0) {
        return (
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardBody className="text-center py-12">
                    <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 text-default-300" />
                    <Typography variant="h6" className="mb-2">
                        No Holidays Found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        No company holidays have been configured yet.
                    </Typography>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Table
                aria-label="Holiday management table"
                isHeaderSticky
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    wrapper: "max-h-[382px] bg-white/5 backdrop-blur-md border-white/10",
                }}
                selectedKeys={[]}
                selectionMode="none"
                sortDescriptor={{}}
                topContent={topContent}
                topContentPlacement="outside"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody 
                    emptyContent={"No holidays found"} 
                    items={items}
                    isLoading={isLoading}
                    loadingContent={<div>Loading holidays...</div>}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default HolidayTable;
