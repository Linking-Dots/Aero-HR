import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Grow,
} from '@mui/material';
import { Select, SelectItem } from "@heroui/react";
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';
import LeaveEmployeeTable from '@/Tables/LeaveEmployeeTable.jsx';

const LeavesEmployee = ({ title, allUsers }) => {
  const { auth } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [leavesData, setLeavesData] = useState({ leaveTypes: [], leaveCountsByUser: {} });
  const [pagination, setPagination] = useState({ page: 1, perPage: 30, total: 0, lastPage: 0 });
  const [filters, setFilters] = useState({ employee: '', year: new Date().getFullYear() });

  
  // Memoize year options
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1900 + 1 }, (_, i) => 1900 + i).reverse();
  }, []);

  // Combined handler
  // Update a specific filter and reset page if year changes
  const handleFilterChange = useCallback((key, value) => {
    console.log(key, value)
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'year') {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, []);

  const handleOpenModal = useCallback((type, id = null) => {
    setOpenModalType(type);
    setDeleteLeaveId(id);
  }, []);

  const closeModal = useCallback(() => {
    setOpenModalType(null);
    setDeleteLeaveId(null);
  }, []);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const { page, perPage } = pagination;
      const { employee, year } = filters;
      const response = await axios.get(route('leaves.paginate'), {
        params: { page, perPage, employee, year },
      });
      if (response.status === 200) {
        const { leaves: leavesPage, leavesData } = response.data;
        setLeaves(leavesPage.data);
        setLeavesData(leavesData);
        setPagination((prev) => ({
          ...prev,
          total: leavesPage.total,
          lastPage: leavesPage.last_page,
        }));
      }
    } catch (err) {
      console.error('Fetch leaves error', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Extract counts for current user
  const userCounts = leavesData.leaveCountsByUser[auth.user.id] || [];

  return (
    <>
      <Head title={title} />
      <Box display="flex" justifyContent="center" p={2}>
        <Grow in>
          <GlassCard>
            <CardHeader title="Leaves" sx={{ p: 3 }} />
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                    <Select
                    label="Year"
                    variant="bordered"
                    selectedKeys={[String(filters.year)]}
                    onChange={(val) => handleFilterChange('year', Number(val))}
                    
                    popoverProps={{ classNames: { content: 'bg-transparent backdrop-blur-lg border-inherit' } }}
                    >
                    {years.map((yr) => (
                        <SelectItem key={yr} value={yr}>
                        {String(yr)}
                        </SelectItem>
                    ))}
                    </Select>
                </Grid>
              </Grid>
            </CardContent>
            <CardContent>
              <Grid container spacing={2}>
                {leavesData.leaveTypes.map(({ type }) => {
                  const countObj = userCounts.find((c) => c.leave_type === type) || {};
                  return (
                    <Grid key={type} item xs={12} sm={6} md={3}>
                      <GlassCard>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ mb: 2, fontSize: ['1rem', '1.25rem', '1.5rem'] }}>
                            {type}
                          </Typography>
                          <Box display="flex" justifyContent="center" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2">Used</Typography>
                              <Typography variant="h4">{countObj.days_used || 0}</Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                            <Box>
                              <Typography variant="subtitle2">Remaining</Typography>
                              <Typography variant="h4">{countObj.remaining_days || 0}</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </GlassCard>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
            <CardContent>
              {loading ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress />
                  <Typography mt={2}>Loading leaves...</Typography>
                </Box>
              ) : leaves.length > 0 ? (
                <LeaveEmployeeTable
                  leaves={leaves}
                  allUsers={allUsers}
                  onDelete={(id) => handleOpenModal('delete', id)}
                  onEdit={(leave) => handleOpenModal('edit', leave.id)}
                />
              ) : (
                <Typography align="center">No leaves found.</Typography>
              )}
            </CardContent>
          </GlassCard>
        </Grow>
      </Box>
    </>
  );
};

LeavesEmployee.layout = (page) => <App>{page}</App>;

export default LeavesEmployee;
