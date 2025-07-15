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
  PresentationChartLineIcon,
  PlusIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import {
  XCircleIcon as XCircleSolid
} from '@heroicons/react/24/solid';
import GlassCard from '@/Components/GlassCard.jsx';
import PageHeader from '@/Components/PageHeader.jsx';
import App from '@/Layouts/App.jsx';
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';
import LeaveForm from '@/Forms/LeaveForm.jsx';
import DeleteLeaveForm from '@/Forms/DeleteLeaveForm.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';

const LeavesEmployee = ({ title, allUsers }) => {
  const { auth } = usePage().props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [totalRows, setTotalRows] = useState(0);
      const [lastPage, setLastPage] = useState(0);
  // State management
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [leavesData, setLeavesData] = useState({ 
    leaveTypes: [], 
    leaveCountsByUser: {} 
  });
    // Table-level loading spinner
  const [tableLoading, setTableLoading] = useState(false);

  const [error, setError] = useState('');
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

  // Function to update pagination metadata
  const updatePaginationMetadata = useCallback((metadata) => {
    if (metadata) {
      setTotalRows(metadata.total || 0);
      setLastPage(metadata.last_page || 1);
      setPagination(prev => ({
        ...prev,
        total: metadata.total || 0,
        lastPage: metadata.last_page || 1
      }));
    }
  }, []);

   // Fetch leaves data with error handling
  const fetchLeaves = useCallback(async () => {
 setTableLoading(true); // Use tableLoading for table refresh
    try {
      const { page, perPage } = pagination;
      const { year } = filters;
      
      console.log('Fetching leaves for user:', auth.user.id, 'with year:', year);
      
      const response = await axios.get(route('leaves.paginate'), {
        params: { 
          page, 
          perPage, 
          year,
          user_id: auth.user.id // Explicitly pass the current user ID
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.status === 200) {
        const { leaves, leavesData } = response.data;

        if (leaves.data && Array.isArray(leaves.data)) {
                setLeaves(leaves.data);
                // Update pagination metadata
                updatePaginationMetadata({
                  total: leaves.total || leaves.data.length,
                  last_page: leaves.last_page || 1,
                  current_page: leaves.current_page || 1,
                  per_page: leaves.per_page || pagination.perPage
                });
            } else if (Array.isArray(leaves)) {
                // Handle direct array response
                setLeaves(leaves);
                updatePaginationMetadata({
                  total: leaves.length,
                  last_page: 1,
                  current_page: 1,
                  per_page: pagination.perPage
                });
            } else {
                console.error('Unexpected leaves data format:', leaves);
                setLeaves([]);
                updatePaginationMetadata({
                  total: 0,
                  last_page: 1,
                  current_page: 1,
                  per_page: pagination.perPage
                });
            }
            
            setLeavesData(leavesData);
            setError('');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      if (error.response?.status === 404) {
        const { leavesData } = error.response.data;
        setLeavesData(leavesData);
        setError(error.response?.data?.message || 'No leaves found for the selected criteria.');
      } else {
        setError('Error retrieving leaves data. Please try again.');
        toast.error('Failed to load leave data. Please try again.');
      }
      setLeaves([]);
      updatePaginationMetadata({
        total: 0,
        last_page: 1,
        current_page: 1,
        per_page: pagination.perPage
      });
    } finally {
 setTableLoading(false); // Reset tableLoading
    }
  }, [pagination.page, pagination.perPage, filters, auth.user.id, updatePaginationMetadata]);

  // Function to fetch additional items if needed after operations
  const fetchAdditionalItemsIfNeeded = useCallback((currentItems, totalItems, operation) => {
    const { page, perPage } = pagination;
    
    // If we're not on the last page, or we have exactly enough items to fill the current page,
    // we don't need to fetch more data
    if (currentItems.length >= perPage || page < lastPage) {
      return;
    }
    
    // If we're on the last page and have fewer items than perPage after an operation,
    // fetch new data to fill the gap
    fetchLeaves();
  }, [pagination, lastPage, fetchLeaves]);

  
 // Memoized year options
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

 

  // Fetch leave statistics
  const fetchLeavesStats = useCallback(async () => {
    try {
      const response = await axios.get(route('leaves.stats'), {
        params: {
          year: filters.year,
        },
      });

      if (response.status === 200) {
        // Update the leave counts data to reflect the changes
        const { stats, leaveCounts } = response.data;
        
        if (leaveCounts) {
          // Update the leave counts in the leavesData
          setLeavesData(prevData => ({
            ...prevData,
            leaveCountsByUser: {
              ...prevData.leaveCountsByUser,
              [auth.user.id]: leaveCounts
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching leaves stats:', error.response);
      // We don't want to disrupt the user experience if stats fail to load
      // so we just log the error and don't show an error message
    }
  }, [filters.year, auth.user.id]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage) => {
    // Only change page if it's different from the current page
    if (newPage !== pagination.page) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.page]);

  // Effect for data fetching
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  
  // Separate effect for fetching leave stats to avoid unnecessary refetches
  useEffect(() => {
    fetchLeavesStats();
  }, [fetchLeavesStats]);
  // Extract user-specific leave counts and calculate stats
  const userLeaveCounts = useMemo(() => {
    return leavesData.leaveCountsByUser[auth.user.id] || [];
  }, [leavesData.leaveCountsByUser, auth.user.id]);

  // Optimized data manipulation functions
  const sortLeavesByFromDate = useCallback((leavesArray) => {
    return [...leavesArray].sort((a, b) => new Date(a.from_date) - new Date(b.from_date));
  }, []);

  const leaveMatchesFilters = useCallback((leave) => {
    // Year filter
    const leaveYear = new Date(leave.from_date).getFullYear();
    if (filters.year && leaveYear !== filters.year) return false;
    // Employee filter (for future extensibility, currently always own)
    if (filters.employee) {
      const user = allUsers?.find(u => String(u.id) === String(leave.user_id));
      const filterValue = filters.employee.trim().toLowerCase();
      if (!user) {
        if (String(filters.employee) !== String(leave.user_id)) return false;
      } else if (
        String(user.id) !== filterValue &&
        !(user.name && user.name.trim().toLowerCase().includes(filterValue))
      ) {
        return false;
      }
    }
    // Month filter
    if (filters.selectedMonth) {
      const leaveMonth = dayjs(leave.from_date).format('YYYY-MM');
      if (leaveMonth !== filters.selectedMonth) return false;
    }
    // Status filter
    if (filters.status && filters.status !== 'all' && String(leave.status).toLowerCase() !== String(filters.status).toLowerCase()) return false;
    // Leave type filter
    if (filters.leaveType && filters.leaveType !== 'all' && String(leave.leave_type).toLowerCase() !== String(filters.leaveType).toLowerCase()) return false;
    // Department filter
    if (filters.department && filters.department !== 'all') {
      const user = allUsers?.find(u => String(u.id) === String(leave.user_id));
      if (!user || String(user.department).toLowerCase() !== String(filters.department).toLowerCase()) return false;
    }
    return true;
  }, [filters, allUsers]);

  // Memoize leaves for table rendering
  const memoizedLeaves = useMemo(() => leaves || [], [leaves]);

  // Optimistic UI for add/edit
  const addLeaveOptimized = useCallback((newLeave) => {
    if (!leaveMatchesFilters(newLeave)) return;
    setTableLoading(true);
    setLeaves(prevLeaves => {
      const updatedLeaves = [...prevLeaves, newLeave];
      return sortLeavesByFromDate(updatedLeaves).slice(0, pagination.perPage);
    });
    updatePaginationMetadata({
      total: totalRows + 1,
      last_page: Math.ceil((totalRows + 1) / pagination.perPage),
      current_page: pagination.page,
      per_page: pagination.perPage
    });

    setTableLoading(false);
    if (pagination.page !== 1) {
      fetchLeaves();
    }
    fetchLeavesStats();
  }, [leaveMatchesFilters, sortLeavesByFromDate, pagination, totalRows, updatePaginationMetadata, fetchLeaves, fetchLeavesStats]);

  const updateLeaveOptimized = useCallback((updatedLeave) => {
    const leaveExistsInCurrentPage = leaves.some(leave => leave.id === updatedLeave.id);
    setTableLoading(true);
    if (!leaveMatchesFilters(updatedLeave) && leaveExistsInCurrentPage) {
      setLeaves(prevLeaves => {
        return prevLeaves.filter(leave => leave.id !== updatedLeave.id);
      });
      toast.info('Leave removed from filtered view.');
      setTableLoading(false);
      return;
    }
    if (!leaveExistsInCurrentPage && !leaveMatchesFilters(updatedLeave)) {
      setTableLoading(false);
      return;
    }
    setLeaves(prevLeaves => {
      const exists = prevLeaves.some(leave => leave.id === updatedLeave.id);
      let updatedLeaves;
      if (exists) {
        updatedLeaves = prevLeaves.map(leave =>
          leave.id === updatedLeave.id ? updatedLeave : leave
        );
      } else {
        updatedLeaves = [...prevLeaves, updatedLeave];
      }
      return sortLeavesByFromDate(updatedLeaves).slice(0, pagination.perPage);
    });
    toast.success('Leave updated!');
    setTableLoading(false);
    if (pagination.page !== 1) {
      fetchLeaves();
    }
    fetchLeavesStats();
  }, [leaveMatchesFilters, sortLeavesByFromDate, leaves, pagination, fetchLeaves, fetchLeavesStats]);

  const deleteLeaveOptimized = useCallback((leaveId) => {
    setLeaves(prevLeaves => {
      const updatedLeaves = prevLeaves.filter(leave => leave.id !== leaveId);
      // After removing a leave, check if we need to fetch more data
      const newTotal = Math.max(0, totalRows - 1);
      fetchAdditionalItemsIfNeeded(updatedLeaves, newTotal, 'delete');
      return updatedLeaves;
    });
    // Update pagination metadata
    const newTotal = Math.max(0, totalRows - 1);
    updatePaginationMetadata({
      total: newTotal,
      last_page: Math.max(1, Math.ceil(newTotal / pagination.perPage)),
      current_page: pagination.page,
      per_page: pagination.perPage
    });
    // Only fetch leave stats to update the balance cards
    fetchLeavesStats();
  }, [fetchLeavesStats, totalRows, pagination, updatePaginationMetadata, fetchAdditionalItemsIfNeeded]);

  // Action buttons for the header
  const actionButtons = [
    {
      label: "Add Leave",
      icon: <PlusIcon className="w-4 h-4" />,
      onPress: () => openModal('add_leave'),
      className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
    },
    {
      label: "Current Year",
      icon: <CalendarIcon className="w-4 h-4" />,
      onPress: () => handleFilterChange('year', new Date().getFullYear()),
      className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
    },
    {
      label: "Refresh",
      icon: <ArrowPathIcon className="w-4 h-4" />,
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
      
      {/* Modals for Leave Management */}
      {modalStates.add_leave && (
        <LeaveForm
          open={modalStates.add_leave}
          closeModal={() => closeModal()}
          leavesData={leavesData}
          setLeavesData={setLeavesData}
          currentLeave={null}
          allUsers={allUsers}
          setTotalRows={setTotalRows}
          setLastPage={setLastPage}
          setLeaves={setLeaves}
          employee={''}  // In employee mode, we hide the employee selector
          selectedMonth={filters.selectedMonth}
          addLeaveOptimized={addLeaveOptimized}
          updatePaginationMetadata={updatePaginationMetadata}
          fetchLeavesStats={fetchLeavesStats}
        />
      )}
      
      {modalStates.edit_leave && (
        <LeaveForm
          open={modalStates.edit_leave}
          closeModal={() => closeModal()}
          leavesData={leavesData}
          setLeavesData={setLeavesData}
          currentLeave={currentLeave}
          allUsers={allUsers}
          setTotalRows={setTotalRows}
          setLastPage={setLastPage}
          setLeaves={setLeaves}
          employee={''}  // In employee mode, we hide the employee selector
          selectedMonth={filters.selectedMonth}
          updateLeaveOptimized={updateLeaveOptimized}
          updatePaginationMetadata={updatePaginationMetadata}
          fetchLeavesStats={fetchLeavesStats}
        />
      )}

      {modalStates.delete_leave && (
        <DeleteLeaveForm
          open={modalStates.delete_leave}
          closeModal={() => closeModal()}
          leaveId={currentLeave?.id}
          setLeaves={setLeaves}
          setTotalRows={setTotalRows}
          setLastPage={setLastPage}
          deleteLeaveOptimized={deleteLeaveOptimized}
          updatePaginationMetadata={updatePaginationMetadata}
          fetchLeavesStats={fetchLeavesStats}
        />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>        <Grow in>
          <GlassCard>
            <PageHeader
              title="My Leaves"
              subtitle="Your leave requests and balances"
              icon={<PresentationChartLineIcon className="w-8 h-8" />}
              variant="gradient"
              actionButtons={[
                {
                  label: "Add Leave",
                  icon: <PlusIcon className="w-4 h-4" />,
                  onPress: () => openModal('add_leave'),
                  className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                },
                {
                  label: "Current Year",
                  icon: <CalendarIcon className="w-4 h-4" />,
                  onPress: () => handleFilterChange('year', new Date().getFullYear()),
                  className: "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white font-medium hover:opacity-90"
                },
                {
                  label: "Refresh",
                  icon: <ArrowPathIcon className="w-4 h-4" />,
                  onPress: fetchLeaves,
                  className: "bg-gradient-to-r from-[rgba(var(--theme-success-rgb),0.8)] to-[rgba(var(--theme-success-rgb),1)] text-white font-medium hover:opacity-90"
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
                        startContent={!loading && !tableLoading && <ArrowPathIcon className="w-4 h-4" />}
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

                  {tableLoading ? ( // Use tableLoading for the table spinner
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardBody className="text-center py-12">
                        <CircularProgress size={40} />
                        <Typography className="mt-4" color="textSecondary">
                          Loading leave data...
                        </Typography>
                      </CardBody>
                    </Card>
                  ) : error ? (
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardBody className="text-center py-12">
                        <XCircleSolid className="w-16 h-16 mx-auto mb-4 text-red-400" />
                        <Typography variant="h6" className="mb-2">
                          Error Loading Data
                        </Typography>
                        <Typography color="textSecondary">
                          {error}
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
                        totalRows={totalRows}
                        lastPage={lastPage}
                        perPage={pagination.perPage}
                        selectedMonth={filters.selectedMonth}
                        employee={''}
                        isAdminView={false}
                        fetchLeavesStats={fetchLeavesStats}
                        updatePaginationMetadata={updatePaginationMetadata}
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