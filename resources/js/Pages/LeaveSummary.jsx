import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Box, Typography, useMediaQuery, useTheme, Grow, Fade } from '@mui/material';
import { 
    CalendarIcon, 
    PlusIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Button,
    Input,
    Select,
    SelectItem,
    Pagination,
    ButtonGroup,
    Card,
    CardBody,
    Progress,
    Tabs,
    Tab
} from "@heroui/react";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from "@/Components/PageHeader.jsx";
import StatsCards from "@/Components/StatsCards.jsx";
import { GRADIENT_PRESETS } from '@/utils/gradientUtils.js';
import App from "@/Layouts/App.jsx";
import { Inertia } from '@inertiajs/inertia';

const LeaveSummary = ({ title, summaryData }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Destructure summary data
    const {
        users = [],
        departments = [],
        leave_types = [],
        columns = [],
        data = [],
        department_summary = [],
        stats = {},
        year = new Date().getFullYear(),
        filters = {}
    } = summaryData || {};

    // State management
    const [loading, setLoading] = useState(false);
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTab, setSelectedTab] = useState('employee');
    const [searchValue, setSearchValue] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // Filter data based on search
    const filteredData = useMemo(() => {
        let filtered = data;
        
        if (searchValue) {
            filtered = filtered.filter(row => 
                row.employee_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                row.department?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
        
        return filtered;
    }, [data, searchValue]);

    // Paginated data
    const paginatedData = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredData.slice(start, end);
    }, [filteredData, page, rowsPerPage]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Statistics data for cards
    const statsData = useMemo(() => [
        {
            title: 'Total Employees',
            value: stats.total_employees || 0,
            icon: <UserGroupIcon className="w-5 h-5" />,
            color: 'text-blue-400',
            iconBg: 'bg-blue-500/20',
            description: 'Active employees'
        },
        {
            title: 'Approved Leaves',
            value: stats.total_approved_leaves || 0,
            icon: <CheckCircleIcon className="w-5 h-5" />,
            color: 'text-green-400',
            iconBg: 'bg-green-500/20',
            description: 'Total approved days'
        },
        {
            title: 'Pending Leaves',
            value: stats.total_pending_leaves || 0,
            icon: <ClockIcon className="w-5 h-5" />,
            color: 'text-orange-400',
            iconBg: 'bg-orange-500/20',
            description: 'Awaiting approval'
        },
        {
            title: 'Departments',
            value: stats.departments_count || 0,
            icon: <BuildingOfficeIcon className="w-5 h-5" />,
            color: 'text-purple-400',
            iconBg: 'bg-purple-500/20',
            description: 'Active departments'
        }
    ], [stats]);

    // Handle filter changes
    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...currentFilters, [key]: value };
        setCurrentFilters(newFilters);
        fetchSummaryData(newFilters);
    }, [currentFilters]);

    const fetchSummaryData = useCallback((filters) => {
        setLoading(true);
        Inertia.get(route('leave-summary'), filters, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    }, []);

    const clearFilters = useCallback(() => {
        const defaultFilters = { year: new Date().getFullYear() };
        setCurrentFilters(defaultFilters);
        setSearchValue('');
        fetchSummaryData(defaultFilters);
    }, []);

    // Action buttons configuration
    const actionButtons = [
        {
            label: "Export Data",
            icon: <DocumentArrowDownIcon className="w-4 h-4" />,
            onPress: () => {
                // Export functionality would be implemented here
                console.log('Export functionality');
            },
            className: GRADIENT_PRESETS.primaryButton
        },
        {
            label: "Current Year",
            icon: <CalendarIcon className="w-4 h-4" />,
            onPress: () => handleFilterChange('year', new Date().getFullYear()),
            className: GRADIENT_PRESETS.secondaryButton
        }
    ];

    // Render employee cell content
    const renderEmployeeCell = useCallback((employee, columnKey) => {
        const cellValue = employee[columnKey];

        switch (columnKey) {
            case "employee_name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-foreground">
                            {employee.employee_name}
                        </p>
                        <p className="text-tiny text-default-400">
                            {employee.department}
                        </p>
                        {employee.designation && (
                            <p className="text-tiny text-default-500">
                                {employee.designation}
                            </p>
                        )}
                    </div>
                );
            
            case "total_approved":
            case "total_pending":
            case "total_rejected":
                const colorMap = {
                    total_approved: 'success',
                    total_pending: 'warning',
                    total_rejected: 'danger'
                };
                return cellValue > 0 ? (
                    <Chip
                        size="sm"
                        variant="flat"
                        color={colorMap[columnKey]}
                        className="min-w-12"
                    >
                        {cellValue}
                    </Chip>
                ) : '';

            case "usage_percentage":
                const percentage = cellValue || 0;
                const color = percentage > 80 ? 'danger' : percentage > 60 ? 'warning' : 'success';
                return (
                    <div className="flex flex-col items-center gap-1">
                        <Progress
                            size="sm"
                            value={percentage}
                            color={color}
                            className="w-16"
                        />
                        <span className="text-tiny">{percentage}%</span>
                    </div>
                );

            case "total_balance":
                return (
                    <div className="text-center">
                        <span className={cellValue < 5 ? 'text-danger' : 'text-foreground'}>
                            {cellValue}
                        </span>
                    </div>
                );

            default:
                return cellValue !== undefined && cellValue !== null && cellValue !== '' ? cellValue : '';
        }
    }, []);

    // Generate years for dropdown
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, i) => currentYear - i);
    }, []);

    return (
        <>
            <Head title={title} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <PageHeader
                            title="Leave Summary"
                            subtitle="Comprehensive employee leave analytics and reporting"
                            icon={<PresentationChartLineIcon className="w-8 h-8" />}
                            variant="gradient"
                            actionButtons={actionButtons}
                        >
                            <div className="p-6">
                                {/* Enhanced Stats */}
                                <StatsCards stats={statsData} className="mb-6" />
                                
                                {/* Filters and Search */}
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <Input
                                                isClearable
                                                label="Search Employees"
                                                variant="bordered"
                                                placeholder="Search by name or department..."
                                                startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
                                                value={searchValue}
                                                onClear={() => setSearchValue("")}
                                                onValueChange={setSearchValue}
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

                                    {/* Advanced Filters Panel */}
                                    {showFilters && (
                                        <Fade in={true} timeout={300}>
                                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <Select
                                                        label="Year"
                                                        variant="bordered"
                                                        selectedKeys={[String(currentFilters.year || year)]}
                                                        onSelectionChange={(keys) => {
                                                            const selectedYear = Array.from(keys)[0];
                                                            if (selectedYear) {
                                                                handleFilterChange('year', parseInt(selectedYear));
                                                            }
                                                        }}
                                                        classNames={{
                                                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                            popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                        }}
                                                    >
                                                        {years.map((yr) => (
                                                            <SelectItem key={yr} value={yr} textValue={String(yr)}>
                                                                {yr}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>

                                                    <Select
                                                        label="Department"
                                                        variant="bordered"
                                                        selectedKeys={currentFilters.department_id ? [String(currentFilters.department_id)] : []}
                                                        onSelectionChange={(keys) => {
                                                            const deptId = Array.from(keys)[0];
                                                            handleFilterChange('department_id', deptId || null);
                                                        }}
                                                        classNames={{
                                                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                            popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                        }}
                                                    >
                                                        <SelectItem key="" value="" textValue="All Departments">
                                                            All Departments
                                                        </SelectItem>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id} textValue={dept.name}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>

                                                    <Select
                                                        label="Leave Status"
                                                        variant="bordered"
                                                        selectedKeys={currentFilters.status ? [currentFilters.status] : []}
                                                        onSelectionChange={(keys) => {
                                                            const status = Array.from(keys)[0];
                                                            handleFilterChange('status', status || null);
                                                        }}
                                                        classNames={{
                                                            trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                                                            popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                                                        }}
                                                    >
                                                        <SelectItem key="" value="" textValue="All Status">All Status</SelectItem>
                                                        <SelectItem key="Approved" value="Approved" textValue="Approved">Approved</SelectItem>
                                                        <SelectItem key="Pending" value="Pending" textValue="Pending">Pending</SelectItem>
                                                        <SelectItem key="Declined" value="Declined" textValue="Declined">Declined</SelectItem>
                                                    </Select>

                                                    <div className="flex gap-2 items-end">
                                                        <Button
                                                            color="primary"
                                                            variant="flat"
                                                            onPress={clearFilters}
                                                            size={isMobile ? "sm" : "md"}
                                                        >
                                                            Clear Filters
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Fade>
                                    )}
                                </div>

                                {/* Tab Navigation */}
                                <div className="mb-6">
                                    <Tabs
                                        selectedKey={selectedTab}
                                        onSelectionChange={setSelectedTab}
                                        variant="underlined"
                                        classNames={{
                                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                            cursor: "w-full bg-primary",
                                            tab: "max-w-fit px-0 h-12",
                                        }}
                                    >
                                        <Tab
                                            key="employee"
                                            title={
                                                <div className="flex items-center space-x-2">
                                                    <UserGroupIcon className="w-4 h-4" />
                                                    <span>Employee Summary</span>
                                                </div>
                                            }
                                        />
                                        <Tab
                                            key="department"
                                            title={
                                                <div className="flex items-center space-x-2">
                                                    <BuildingOfficeIcon className="w-4 h-4" />
                                                    <span>Department Summary</span>
                                                </div>
                                            }
                                        />
                                    </Tabs>
                                </div>

                                {/* Content based on selected tab */}
                                {selectedTab === 'employee' ? (
                                    <div className="space-y-4">
                                        {/* Results count */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-default-400 text-small">
                                                Total {filteredData.length} employees
                                                {searchValue && ` (filtered from ${data.length})`}
                                            </span>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-tiny text-default-400">Rows per page:</span>
                                                <Select
                                                    size="sm"
                                                    selectedKeys={[String(rowsPerPage)]}
                                                    onSelectionChange={(keys) => {
                                                        const newRowsPerPage = Number(Array.from(keys)[0]);
                                                        setRowsPerPage(newRowsPerPage);
                                                        setPage(1);
                                                    }}
                                                    className="w-20"
                                                    classNames={{
                                                        trigger: "bg-white/10 backdrop-blur-md border-white/20",
                                                    }}
                                                >
                                                    <SelectItem key="10" value="10" textValue="10">10</SelectItem>
                                                    <SelectItem key="15" value="15" textValue="15">15</SelectItem>
                                                    <SelectItem key="25" value="25" textValue="25">25</SelectItem>
                                                    <SelectItem key="50" value="50" textValue="50">50</SelectItem>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Employee Summary Table */}
                                        {filteredData.length > 0 ? (
                                            <>
                                                <Table
                                                    aria-label="Employee leave summary table"
                                                    isHeaderSticky
                                                    classNames={{
                                                        wrapper: "max-h-[600px] bg-white/5 backdrop-blur-md border-white/10",
                                                        th: "bg-white/20 text-foreground border-b border-white/10",
                                                        td: "border-b border-white/5"
                                                    }}
                                                >
                                                    <TableHeader>
                                                        <TableColumn key="employee_name">Employee</TableColumn>
                                                        <TableColumn key="JAN" align="center">JAN</TableColumn>
                                                        <TableColumn key="FEB" align="center">FEB</TableColumn>
                                                        <TableColumn key="MAR" align="center">MAR</TableColumn>
                                                        <TableColumn key="APR" align="center">APR</TableColumn>
                                                        <TableColumn key="MAY" align="center">MAY</TableColumn>
                                                        <TableColumn key="JUN" align="center">JUN</TableColumn>
                                                        <TableColumn key="JUL" align="center">JUL</TableColumn>
                                                        <TableColumn key="AUG" align="center">AUG</TableColumn>
                                                        <TableColumn key="SEP" align="center">SEP</TableColumn>
                                                        <TableColumn key="OCT" align="center">OCT</TableColumn>
                                                        <TableColumn key="NOV" align="center">NOV</TableColumn>
                                                        <TableColumn key="DEC" align="center">DEC</TableColumn>
                                                        <TableColumn key="total_approved" align="center">Approved</TableColumn>
                                                        <TableColumn key="total_pending" align="center">Pending</TableColumn>
                                                        <TableColumn key="total_balance" align="center">Balance</TableColumn>
                                                        <TableColumn key="usage_percentage" align="center">Usage</TableColumn>
                                                    </TableHeader>
                                                    <TableBody items={paginatedData} isLoading={loading}>
                                                        {(item) => (
                                                            <TableRow key={item.id}>
                                                                {(columnKey) => (
                                                                    <TableCell>
                                                                        {renderEmployeeCell(item, columnKey)}
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>

                                                {/* Pagination */}
                                                {totalPages > 1 && (
                                                    <div className="flex justify-center mt-4">
                                                        <Pagination
                                                            total={totalPages}
                                                            page={page}
                                                            onChange={setPage}
                                                            showControls
                                                            showShadow
                                                            color="primary"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                                <CardBody className="text-center py-12">
                                                    <PresentationChartLineIcon className="w-16 h-16 mx-auto mb-4 text-default-300" />
                                                    <Typography variant="h6" className="mb-2 text-white">
                                                        No Leave Data Found
                                                    </Typography>
                                                    <Typography variant="body2" className="text-gray-400">
                                                        {searchValue 
                                                            ? `No employees found matching "${searchValue}"`
                                                            : `No leave summary data available for ${currentFilters.year || year}.`
                                                        }
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>
                                ) : (
                                    /* Department Summary Tab */
                                    <div className="space-y-4">
                                        <Typography variant="h6" className="mb-4 text-white">
                                            Department-wise Leave Summary
                                        </Typography>
                                        
                                        {department_summary.length > 0 ? (
                                            <Table
                                                aria-label="Department leave summary table"
                                                classNames={{
                                                    wrapper: "bg-white/5 backdrop-blur-md border-white/10",
                                                    th: "bg-white/20 text-foreground",
                                                    td: "border-b border-white/5"
                                                }}
                                            >
                                                <TableHeader>
                                                    <TableColumn>Department</TableColumn>
                                                    <TableColumn align="center">Employees</TableColumn>
                                                    <TableColumn align="center">Total Leaves</TableColumn>
                                                    <TableColumn align="center">Approved</TableColumn>
                                                    <TableColumn align="center">Pending</TableColumn>
                                                    <TableColumn align="center">Avg per Employee</TableColumn>
                                                </TableHeader>
                                                <TableBody>
                                                    {department_summary.map((dept, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <BuildingOfficeIcon className="w-4 h-4 text-default-400" />
                                                                    <span className="font-medium">{dept.department}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Chip size="sm" variant="flat" color="default">
                                                                    {dept.employee_count}
                                                                </Chip>
                                                            </TableCell>
                                                            <TableCell className="text-center">{dept.total_leaves}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Chip size="sm" variant="flat" color="success">
                                                                    {dept.total_approved}
                                                                </Chip>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Chip size="sm" variant="flat" color="warning">
                                                                    {dept.total_pending}
                                                                </Chip>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {dept.avg_leaves_per_employee}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Card className="bg-white/5 backdrop-blur-md border-white/10">
                                                <CardBody className="text-center py-8">
                                                    <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-4 text-default-300" />
                                                    <Typography variant="body1" className="text-white">
                                                        No department data available
                                                    </Typography>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        </PageHeader>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

LeaveSummary.layout = (page) => <App>{page}</App>;

export default LeaveSummary;
