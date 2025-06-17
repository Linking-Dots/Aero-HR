import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
  UserIcon 
} from "@heroicons/react/24/outline";
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';

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

  // Modal handlers (placeholders for future implementation)
  const handleOpenModal = useCallback((modalType, itemId = null) => {
    // TODO: Implement modal functionality
    console.log(`Opening ${modalType} modal for item:`, itemId);
  }, []);

  const closeModal = useCallback(() => {
    // TODO: Implement modal close functionality
    console.log('Closing modal');
  }, []);

  // Fetch leaves data with error handling
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const { page, perPage } = pagination;
      const { employee, year } = filters;
      
      const response = await axios.get(route('leaves.paginate'), {
        params: { page, perPage, employee, year },
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

  // Effect for data fetching
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Extract user-specific leave counts
  const userLeaveCounts = useMemo(() => {
    return leavesData.leaveCountsByUser[auth.user.id] || [];
  }, [leavesData.leaveCountsByUser, auth.user.id]);

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

  return (
    <>
      <Head title={title} />
      <Box 
        className="min-h-screen p-2 sm:p-4 md:p-6"
        sx={{ 
          background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        }}
      >
        <Grow in timeout={800}>
          <div className="mx-auto">
            <GlassCard>
              {/* Header Section */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-8 h-8 text-blue-400" />
                    <div>
                      <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                      >
                        My Leaves
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Your leave requests and balances
                      </Typography>
                    </div>
                  </div>
                  <Chip
                    startContent={<ClockIcon className="w-4 h-4" />}
                    variant="flat"
                    color="primary"
                    size={isMobile ? "sm" : "md"}
                  >
                    {filters.year}
                  </Chip>
                </div>

                {/* Filters Section */}
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
                    <Spacer />
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
                <div>
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
                        leaves={leaves}
                        allUsers={allUsers}
                        onDelete={(id) => handleOpenModal('delete', id)}
                        onEdit={(leave) => handleOpenModal('edit', leave.id)}
                        pagination={pagination}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))
                        }
                        isMobile={isMobile}
                        setLeaves={setLeaves}
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
                        </Typography>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </Grow>
      </Box>
    </>
  );
};

LeavesEmployee.layout = (page) => <App>{page}</App>;

export default LeavesEmployee;
