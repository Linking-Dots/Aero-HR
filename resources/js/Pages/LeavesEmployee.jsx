import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  CircularProgress,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Select, 
  SelectItem, 
  Card, 
  CardBody, 
  CardHeader,
  Divider,
  Chip,
  Button,
  Spacer
} from "@heroui/react";
import { 
  CalendarIcon, 
  ChartBarIcon, 
  ClockIcon,
  UserIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';
import axios from 'axios';

const LeavesEmployee = ({ title, allUsers }) => {
  const { auth } = usePage().props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [leavesData, setLeavesData] = useState({ 
    leaveTypes: [], 
    leaveCountsByUser: {} 
  });
  const [pagination, setPagination] = useState({ 
    page: 1, 
    perPage: 30, 
    total: 0, 
    lastPage: 0 
  });
  const [filters, setFilters] = useState({ 
    employee: '', 
    selectedMonth: dayjs().format('YYYY-MM'),
    year: new Date().getFullYear() 
  });

  // Memoized year options following ISO standard (1900-current year)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, index) => {
      const year = 1900 + index;
      return { key: year.toString(), label: year.toString(), value: year };
    }).reverse();
  }, []);

  // Filter change handler with ISO-compliant validation
  const handleFilterChange = useCallback((filterKey, filterValue) => {
    // Validate year input according to ISO 8601
    if (filterKey === 'year') {
      const year = Number(filterValue);
      if (year < 1900 || year > new Date().getFullYear()) {
        console.warn('Invalid year selected. Must be between 1900 and current year.');
        return;
      }
    }

    setFilters(previousFilters => ({ 
      ...previousFilters, 
      [filterKey]: filterValue 
    }));

    // Reset pagination when year filter changes
    if (filterKey === 'year') {
      setPagination(previousPagination => ({ 
        ...previousPagination, 
        page: 1 
      }));
    }
  }, []);

  // Modal state
  const [modalStates, setModalStates] = useState({
    add_leave: false,
    edit_leave: false,
    delete_leave: false,
  });

  // Modal handlers
  const handleOpenModal = useCallback((modalType, itemId = null) => {
    setModalStates(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const closeModal = useCallback(() => {
    setModalStates({ add_leave: false, edit_leave: false, delete_leave: false });
  }, []);

  const openModal = useCallback((modalType) => {
    setModalStates(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const handleClickOpen = useCallback((leaveId, modalType) => {
    setCurrentLeave({ id: leaveId });
    setModalStates(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const [currentLeave, setCurrentLeave] = useState(null);

  const handleSetCurrentLeave = useCallback((leave) => {
    setCurrentLeave(leave);
  }, []);

  // Fetch leaves data with error handling
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const { page, perPage } = pagination;
      const { year } = filters;

      const response = await axios.get(route('leaves.paginate'), {
        params: { page, perPage, year },
        timeout: 10000, // 10 second timeout
      });

      if (response.status === 200) {
        const { leaves: leavesPage, leavesData: responseData } = response.data;

        setLeaves(leavesPage.data || []);
        setLeavesData(responseData || { leaveTypes: [], leaveCountsByUser: {} });
        setPagination(previousPagination => ({
          ...previousPagination,
          total: leavesPage.total || 0,
          lastPage: leavesPage.last_page || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      // TODO: Add user notification for error
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Effect for data fetching
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  // Extract user-specific leave counts and calculate stats
  const userLeaveCounts = useMemo(() => {
    return leavesData.leaveCountsByUser[auth.user.id] || [];
  }, [leavesData.leaveCountsByUser, auth.user.id]);


  // Action buttons for the header
  const actionButtons = [
    {
      label: "Current Year",
      icon: <CalendarIcon className="w-4 h-4" />,
      onPress: () => handleFilterChange('year', new Date().getFullYear()),
      className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
    },
    {
      label: "Refresh",
      icon: <ChartBarIcon className="w-4 h-4" />,
      onPress: fetchLeaves,
      className: "bg-gradient-to-r from-[rgba(var(--theme-success-rgb),0.8)] to-[rgba(var(--theme-success-rgb),1)] text-white font-medium hover:opacity-90"
    }
  ];

  // Render leave type cards with responsive design
  const renderLeaveTypeCards = () => {
    if (!leavesData.leaveTypes.length) {
      return (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardBody className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <Typography variant="body1" color="textSecondary">
              No leave types available
            </Typography>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1' 
          : isTablet 
            ? 'grid-cols-2' 
            : 'grid-cols-4'
      }`}>
        {leavesData.leaveTypes.map(({ type }) => {
          const leaveCount = userLeaveCounts.find(count => count.leave_type === type) || {};
          const usedDays = leaveCount.days_used || 0;
          const remainingDays = leaveCount.remaining_days || 0;
          const totalDays = usedDays + remainingDays;

          return (
            <Card 
              key={type} 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    className="font-semibold truncate"
                  >
                    {type}
                  </Typography>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <Typography variant="caption" color="textSecondary">
                        Used
                      </Typography>
                      <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        className="font-bold text-red-400"
                      >
                        {usedDays}
                      </Typography>
                    </div>
                    <Divider orientation="vertical" className="h-8" />
                    <div className="text-center">
                      <Typography variant="caption" color="textSecondary">
                        Remaining
                      </Typography>
                      <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        className="font-bold text-green-400"
                      >
                        {remainingDays}
                      </Typography>
                    </div>
                  </div>
                  {totalDays > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(usedDays / totalDays) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    );
  };
  const leaveTableRef = useRef(null);

  return (
    <>
      <Head title={title} />
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>        <Grow in>
          <GlassCard>
            <PageHeader
              title="My Leaves"
              subtitle="Your leave requests and balances"
              icon={<PresentationChartLineIcon className="w-8 h-8" />}
              variant="gradient"
              actionButtons={[
                {
                  label: "Current Year",
                  icon: <CalendarIcon className="w-4 h-4" />,
                  onPress: () => handleFilterChange('year', new Date().getFullYear()),
                  className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                },
                {
                  label: "Refresh",
                  icon: <ChartBarIcon className="w-4 h-4" />,
                  onPress: fetchLeaves,
                  isDisabled: loading,
                  variant: "bordered",
                  className: "border-[rgba(var(--theme-primary-rgb),0.3)] bg-[rgba(var(--theme-primary-rgb),0.05)] hover:bg-[rgba(var(--theme-primary-rgb),0.1)]"
                }
              ]}
            >
              <div className="p-6">

                {/* Filters Section - Matching LeavesAdmin */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
                      <Select
                        label="Select Year"
                        variant="bordered"
                        selectedKeys={[String(filters.year)]}
                        onSelectionChange={(keys) => {
                          const selectedYear = Array.from(keys)[0];
                          if (selectedYear) {
                            handleFilterChange('year', Number(selectedYear));
                          }
                        }}
                        startContent={<CalendarIcon className="w-4 h-4" />}
                        classNames={{
                          trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                          popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                        }}
                        size={isMobile ? "sm" : "md"}
                      >
                        {yearOptions.map((year) => (
                          <SelectItem key={year.key} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="flat"
                        color="primary"
                        size={isMobile ? "sm" : "md"}
                        onPress={fetchLeaves}
                        isLoading={loading}
                        startContent={!loading && <ChartBarIcon className="w-4 h-4" />}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Leave Types Summary */}
                <div className="mb-6">
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Leave Balance Summary
                  </Typography>
                  {renderLeaveTypeCards()}
                </div>

                {/* Leave History Table */}
                <div className="min-h-96">
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Leave History
                  </Typography>

                  {loading ? (
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardBody className="text-center py-12">
                        <CircularProgress size={40} />
                        <Typography className="mt-4" color="textSecondary">
                          Loading leave data...
                        </Typography>
                      </CardBody>
                    </Card>
                  ) : leaves.length > 0 ? (
                    <div className="overflow-hidden rounded-lg">
                      <LeaveEmployeeTable
                        ref={leaveTableRef}
                        leaves={leaves}
                        allUsers={allUsers || []}
                        handleClickOpen={handleClickOpen}
                        setCurrentLeave={handleSetCurrentLeave}
                        openModal={openModal}
                        setLeaves={setLeaves}
                        setCurrentPage={handlePageChange}
                        currentPage={pagination.page}
                        totalRows={pagination.total}
                        lastPage={pagination.lastPage}
                        perPage={pagination.perPage}
                        selectedMonth={filters.selectedMonth}
                        employee={''}
                        isAdminView={false}
                    />
                    </div>
                  ) : (
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardBody className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <Typography variant="h6" className="mb-2">
                          No Leave Records Found
                        </Typography>
                        <Typography color="textSecondary">
                          You haven't submitted any leave requests for {filters.year}.
                        </Typography>                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            </PageHeader>
          </GlassCard>
        </Grow>
      </Box>
    </>
  );
};

LeavesEmployee.layout = (page) => <App>{page}</App>;

export default LeavesEmployee;