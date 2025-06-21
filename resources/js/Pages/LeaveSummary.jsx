import React, { useEffect, useState, useMemo } from 'react';
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
  Card, 
  CardBody, 
  CardHeader,
  Divider,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from "@heroui/react";
import { Inertia } from '@inertiajs/inertia';
import { 
  ChartBarIcon, 
  CalendarDaysIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  UsersIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';

const LeaveSummary = ({ title, allUsers, columns, data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1900 + 1 }, (_, i) => 1900 + i).reverse();
  }, []);

  // Calculate stats from the data
  const statsData = useMemo(() => {
    const totalEmployees = data ? data.length : 0;
    const totalLeaves = data ? data.reduce((sum, row) => {
      // Sum all numeric columns except SL NO and Name
      return sum + Object.values(row).reduce((rowSum, value) => {
        if (typeof value === 'number' && value > 0) {
          return rowSum + value;
        }
        return rowSum;
      }, 0);
    }, 0) : 0;

    return [
      {
        title: 'Total Employees',
        value: totalEmployees,
        icon: <UsersIcon className="w-5 h-5" />,
        color: 'text-blue-600',
        description: 'Employees in summary'
      },
      {
        title: 'Total Leaves',
        value: totalLeaves,
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        color: 'text-orange-600',
        description: 'Leave days taken'
      },
      {
        title: 'Year',
        value: year,
        icon: <CalendarDaysIcon className="w-5 h-5" />,
        color: 'text-green-600',
        description: 'Current year view'
      },
      {
        title: 'Leave Types',
        value: columns ? columns.length - 2 : 0, // Exclude SL NO and Name columns
        icon: <DocumentChartBarIcon className="w-5 h-5" />,
        color: 'text-purple-600',
        description: 'Available leave types'
      }
    ];
  }, [data, year, columns]);

  const handleYearChange = (selectedYear) => {
    setYear(Number(selectedYear));
    fetchLeaveData(Number(selectedYear));
  };

  const fetchLeaveData = (selectedYear) => {
    setLoading(true);
    Inertia.get(route('leave.summary'), { year: selectedYear }, {
      preserveState: true,
      replace: true,
      onFinish: () => setLoading(false),
    });
  };

  useEffect(() => {
    // Initial render already has data
  }, []);

  return (
    <>
      <Head title={title || "Leave Summary"} />
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Grow in>
          <GlassCard>
            <div className="overflow-hidden">
              {/* Header Section - Matching LeavesAdmin */}
              <div className="bg-gradient-to-br from-slate-50/50 to-white/30 backdrop-blur-sm border-b border-white/20">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                        <ChartBarIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <Typography 
                          variant={isMobile ? "h5" : "h4"} 
                          className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                        >
                          Leave Summary
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Annual leave analytics and employee summaries
                        </Typography>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        color="primary"
                        startContent={<CalendarDaysIcon className="w-4 h-4" />}
                        onPress={() => handleYearChange(new Date().getFullYear())}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
                      >
                        Current Year
                      </Button>
                      
                      <Button
                        variant="bordered"
                        startContent={<ArrowPathIcon className="w-4 h-4" />}
                        onPress={() => fetchLeaveData(year)}
                        isLoading={loading}
                        className="border-white/20 bg-white/5 hover:bg-white/10"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Divider className="border-white/10" />

              <div className="p-6">
                {/* Quick Stats - Matching LeavesAdmin pattern */}
                <div className="mb-6">
                  <div className={`grid gap-4 ${
                    isMobile 
                      ? 'grid-cols-1' 
                      : isTablet 
                        ? 'grid-cols-2' 
                        : 'grid-cols-4'
                  }`}>
                    {statsData.map((stat, index) => (
                      <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            {stat.icon}
                            <Typography 
                              variant={isMobile ? "subtitle1" : "h6"} 
                              className={`font-semibold ${stat.color}`}
                            >
                              {stat.title}
                            </Typography>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <Typography 
                            variant={isMobile ? "h4" : "h3"} 
                            className={`font-bold ${stat.color}`}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {stat.description}
                          </Typography>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Filters Section - Matching LeavesAdmin */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
                      <Select
                        label="Select Year"
                        variant="bordered"
                        selectedKeys={[String(year)]}
                        onSelectionChange={(keys) => {
                          const selectedYear = Array.from(keys)[0];
                          if (selectedYear) {
                            handleYearChange(selectedYear);
                          }
                        }}
                        startContent={<CalendarDaysIcon className="w-4 h-4" />}
                        classNames={{
                          trigger: "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15",
                          popoverContent: "bg-white/10 backdrop-blur-lg border-white/20",
                        }}
                        size={isMobile ? "sm" : "md"}
                      >
                        {years.map((yr) => (
                          <SelectItem key={yr} value={yr}>
                            {String(yr)}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Chip
                        startContent={<DocumentChartBarIcon className="w-4 h-4" />}
                        variant="flat"
                        color="primary"
                        size={isMobile ? "sm" : "md"}
                        className="bg-white/10 backdrop-blur-md border-white/20"
                      >
                        {data ? data.length : 0} employees
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Leave Summary Table */}
                <div className="min-h-96">
                  <Typography variant="h6" className="mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    Employee Leave Summary
                  </Typography>
                  
                  {loading ? (
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardBody className="text-center py-12">
                        <CircularProgress size={40} />
                        <Typography className="mt-4" color="textSecondary">
                          Loading leave summary...
                        </Typography>
                      </CardBody>
                    </Card>
                  ) : data && data.length > 0 ? (
                    <div className="overflow-hidden rounded-lg">
                      <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
                        <Table
                          selectionMode="multiple"
                          selectionBehavior="toggle"
                          isStriped
                          removeWrapper
                          isHeaderSticky
                          aria-label="Leave Summary Table"
                          classNames={{
                            wrapper: "bg-white/10 backdrop-blur-md border-white/20",
                            th: "bg-white/20 text-default-foreground",
                            td: "border-white/10"
                          }}
                        >
                          <TableHeader columns={columns.map((col) => ({ name: col, uid: col }))}>
                            {(column) => (
                              <TableColumn key={column.uid} align="center">
                                {column.name}
                              </TableColumn>
                            )}
                          </TableHeader>
                          <TableBody items={data}>
                            {(row) => (
                              <TableRow key={row['SL NO']}>
                                {(columnKey) => (
                                  <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                                    {row[columnKey] !== undefined && row[columnKey] !== null ? row[columnKey] : ''}
                                  </TableCell>
                                )}
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardBody className="text-center py-12">
                        <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <Typography variant="h6" className="mb-2">
                          No Leave Data Found
                        </Typography>
                        <Typography color="textSecondary">
                          No leave summary data available for {year}.
                        </Typography>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </Grow>
      </Box>
    </>
  );
};

LeaveSummary.layout = (page) => <App>{page}</App>;

export default LeaveSummary;
