import React, { useEffect, useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Grow,
} from '@mui/material';
import { Inertia } from '@inertiajs/inertia';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import App from '@/Layouts/App.jsx';
import GlassCard from '@/Components/GlassCard.jsx';
import { Select, SelectItem } from "@heroui/react";

const LeaveSummary = ({ title, allUsers, columns, data }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1900 + 1 }, (_, i) => 1900 + i).reverse();
  }, []);

  const handleYearChange = (e) => {
    const selectedYear = e.target.value;
    setYear(selectedYear);
    fetchLeaveData(selectedYear);
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
        <Head title={title} />
        <Box display="flex" justifyContent="center" p={2}>
            <Grow in>
            <GlassCard>
                <CardHeader title={title} sx={{ p: 3 }} />
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <Select
                            label="Year"
                            variant="bordered"
                            selectedKeys={[String(year)]}
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
                    {loading ? (
                    <Box textAlign="center" py={4}>
                        <CircularProgress />
                        <Typography mt={2}>Loading leave summary...</Typography>
                    </Box>
                    ) : (
                    <>
                        {data && data.length > 0 ? (
                        <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
                            <Table
                            selectionMode="multiple"
                            selectionBehavior="toggle"
                            isStriped
                            removeWrapper
                            isHeaderSticky
                            aria-label="Leave Summary Table"
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
                        ) : (
                        <Typography align="center">No leave data found.</Typography>
                        )}
                    </>
                    )}
                </CardContent>
            </GlassCard>
            </Grow>
        </Box>
    </>
    
  );
};

LeaveSummary.layout = (page) => <App>{page}</App>;

export default LeaveSummary;
