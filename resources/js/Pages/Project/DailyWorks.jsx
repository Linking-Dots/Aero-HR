import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    CardContent,
    CardHeader, CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    TextField,
    useMediaQuery,
} from '@mui/material';
import { AddBox, Download, Upload } from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import DailyWorksTable from '@/Tables/DailyWorksTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import DailyWorkForm from "@/Forms/DailyWorkForm.jsx";
import DeleteDailyWorkForm from "@/Forms/DeleteDailyWorkForm.jsx";
import DailyWorksDownloadForm from "@/Forms/DailyWorksDownloadForm.jsx";
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search";
import DailyWorksUploadForm from "@/Forms/DailyWorksUploadForm.jsx";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import {toast} from "react-toastify";
import { DatePicker } from "@heroui/react";

import {Pagination, SelectItem, Select, Input, Button} from "@heroui/react";
dayjs.extend(minMax);
import {getLocalTimeZone, parseDate, today} from "@internationalized/date";


const DailyWorks = React.memo(({ auth, title, allData, jurisdictions, users, reports, reports_with_daily_works, overallEndDate, overallStartDate }) => {
    const theme = useTheme();

    // const [dailyWorks, setDailyWorks] = useState(allData.dailyWorks);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteringByStatus, setFilteringByStatus] = useState(false);
    const [filteringByIncharge, setFilteringByIncharge] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [filteredData, setFilteredData] = useState([]);

    const [currentRow, setCurrentRow] = useState();
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [openModalType, setOpenModalType] = useState(null);
    const [search, setSearch] = useState('');
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async (page, perPage, filterData) => {
        try {
            const response = await axios.get(route('dailyWorks.paginate'), {
                params: {
                    page,
                    perPage,
                    search: search, // Assuming 'report' is the search field
                    status: filterData.status !== 'all' ? filterData.status : '',
                    inCharge: filterData.incharge !== 'all' ? filterData.incharge : '',
                    startDate: filterData.startDate, // Send startDate in proper format
                    endDate: filterData.endDate,
                }
            });

            setData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            setLoading(false);
            setFilteringByIncharge(false);
            setFilteringByStatus(false);
        } catch (error) {
            console.error(error)
            toast.error('Failed to fetch data.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    background: theme.glassCard.background,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
            setLoading(false);
            setFilteringByIncharge(false);
            setFilteringByStatus(false);
        }
    };

    const handleDelete = () => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`/delete-daily-work`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        id: taskIdToDelete,
                        page: currentPage,
                        perPage,
                        search: search, // Assuming 'report' is the search field
                        status: filterData.status !== 'all' ? filterData.status : '',
                        inCharge: filterData.incharge !== 'all' ? filterData.incharge : '',
                        startDate: filterData.startDate?.format('YYYY-MM-DD'), // Send startDate in proper format
                        endDate: filterData.endDate?.format('YYYY-MM-DD'),
                    }),
                });

                const data = await response.json();


                if (response.ok) {
                    setData(data.data);
                    setTotalRows(data.total);
                    resolve('Daily work deleted successfully');
                } else {
                    reject(data.error || 'Failed to delete task');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                reject('An error occurred while deleting the task');
            } finally {
                handleClose();
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CircularProgress />
                                <span style={{ marginLeft: '8px' }}>Deleting task...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                success: {
                    render({ data }) {
                        return <>{data}</>;
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                error: {
                    render({ data }) {
                        return <>{data}</>;
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        background: theme.glassCard.background,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    };

    const handleClickOpen = useCallback((taskId, modalType) => {
        setTaskIdToDelete(taskId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setTaskIdToDelete(null);
    }, []);

    const openModal = useCallback((modalType) => {
        setOpenModalType(modalType);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModalType(null);
    }, []);

    const [filterData, setFilterData] = useState({
        startDate: null,
        endDate: null,
        status: 'all',
        incharge: 'all',
        report: '',
    });

    const handleFilterChange = useCallback((key, value) => {

        // Handle date range changes
        if (key === 'startDate' || key === 'endDate') {
            handlePageChange(1); // Reset to the first page on filter change
            const startDate = key === 'startDate' ? value : filterData.startDate;
            const endDate = key === 'endDate' ? value : filterData.endDate;

            setFilterData(prevState => ({
                ...prevState,
                startDate,
                endDate: key === 'endDate' ? (endDate < startDate ? '' : endDate) : prevState.endDate,
            }));


        } else {
            key === 'status' ? setFilteringByStatus(true) : key === 'incharge' ? setFilteringByIncharge(true) : '';
            setFilterData(prevState => ({
                ...prevState,
                [key]: value,
            }));
        }
    }, [filterData]);
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearch(value);
    };


    useEffect(() => {
        setLoading(true);
        fetchData(currentPage, perPage, filterData);
    }, [currentPage, perPage, filterData, search]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'primary';
            case 'resubmission':
                return 'warning';
            case 'completed':
                return 'success';
            case 'emergency':
                return 'danger';
            default:
                return '';
        }
    };


    return (
        <>
            <Head title={title}/>
            {openModalType === 'addDailyWork' && (
                <DailyWorkForm
                    modalType="add"
                    open={openModalType === 'addDailyWork'}
                    setData={setData}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'editDailyWork' && (
                <DailyWorkForm
                    modalType="update"
                    open={openModalType === 'editDailyWork'}
                    currentRow={currentRow}
                    setData={setData}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'deleteDailyWork' && (
                <DeleteDailyWorkForm
                    open={openModalType === 'deleteDailyWork'}
                    handleClose={handleClose}
                    handleDelete={handleDelete}
                    setData={setData}
                />
            )}
            {openModalType === 'importDailyWorks' && (
                <DailyWorksUploadForm
                    open={openModalType === 'importDailyWorks'}
                    closeModal={closeModal}
                    setData={setData}
                    setTotalRows={setTotalRows}
                />
            )}
            {openModalType === 'exportDailyWorks' && (
                <DailyWorksDownloadForm
                    open={openModalType === 'exportDailyWorks'}
                    closeModal={closeModal}
                    filterData={filterData}
                    search={search}
                    users={users}
                />
            )}


            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title={title}
                            sx={{padding: '24px'}}
                            action={
                                <Box display="flex" gap={2}>
                                    {auth.roles.includes('Administrator' || 'Supervision Engineer') && (
                                        <>
                                            {isMobile ? (
                                                <Button
                                                    variant={'faded'}
                                                    isIconOnly
                                                    title="Add Daily Work"
                                                    color="primary"
                                                    onClick={() => openModal('addDailyWork')} // Handle opening the modal
                                                >
                                                    <AddBox />
                                                </Button>
                                            ) : (
                                                <Button
                                                    title="Add Daily Work"
                                                    variant="bordered"
                                                    color="primary"
                                                    startContent={<AddBox />}
                                                    onClick={() => openModal('addDailyWork')} // Handle opening the modal
                                                >
                                                    Add
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {auth.roles.includes('Administrator') && (
                                        <>
                                            {isMobile ? (
                                                <>
                                                    <Button
                                                        variant={'faded'}
                                                        isIconOnly
                                                        title="Import Daily Works"
                                                        color="warning"
                                                        onClick={() => openModal('importDailyWorks')} // Handle opening the modal
                                                    >
                                                        <Upload />
                                                    </Button>
                                                    <Button
                                                        variant={'faded'}
                                                        isIconOnly
                                                        title="Export Daily Works"
                                                        color="success"
                                                        onClick={() => openModal('exportDailyWorks')}
                                                    >
                                                        <Download />
                                                    </Button>
                                                </>

                                            ) : (
                                                <>
                                                    <Button
                                                        title="Import Daily Works"
                                                        variant="bordered"
                                                        color="warning"
                                                        startContent={<Upload />}
                                                        onClick={() => openModal('importDailyWorks')} // Handle opening the modal
                                                    >
                                                        Import
                                                    </Button>
                                                    <Button
                                                        title="Export Daily Works"
                                                        variant="bordered"
                                                        color="success"
                                                        startContent={<Download />}
                                                        onClick={() => openModal('exportDailyWorks')}
                                                    >
                                                        Export
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Box>
                            }
                        />
                        <CardContent>
                            <Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Box display="flex" alignItems="center">
                                            {/* Start Date Picker */}
                                            <Input
                                                isLoading={loading}
                                                label={'Start Date'}
                                                type={'text'}
                                                onFocus={(e) => e.target.type = 'date'}
                                                onBlur={(e) => e.target.type = 'text'}
                                                aria-label={'Start Date'}
                                                variant="bordered" // Next UI style
                                                value={filterData.startDate || ''}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                placeholder="Select Start Date" // Add placeholder
                                                min={overallStartDate} // Set min date for End Date picker to Start Date
                                                max={filterData.endDate || overallEndDate} // Set max date for Start Date picker
                                            />
                                            <Box mx={1}>to</Box>
                                            {/* End Date Picker */}
                                            <Input
                                                isLoading={loading}
                                                label={'End Date'}
                                                disabled={!filterData.startDate}
                                                type={'text'}
                                                onFocus={(e) => e.target.type = 'date'}
                                                onBlur={(e) => e.target.type = 'text'}
                                                variant="bordered" // Next UI style
                                                value={filterData.endDate || ''}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                placeholder="Select End Date" // Add placeholder
                                                min={filterData.startDate || overallStartDate} // Set min date for End Date picker to Start Date
                                                max={overallEndDate} // Set max date for Start Date picker
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={3}>
                                        <Select
                                            isLoading={filteringByStatus}
                                            label={'Status'}
                                            fullWidth
                                            variant={'bordered'}
                                            aria-label={'Status'}
                                            color={getStatusColor(filterData.status)}
                                            placeholder="Select Status"
                                            value={filterData.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            selectedKeys={[filterData.status]}
                                            popoverProps={{
                                                classNames: {
                                                    content: "bg-transparent backdrop-blur-lg border-inherit",
                                                },
                                            }}
                                        >
                                            <SelectItem key='all' value='all'>All</SelectItem>
                                            <SelectItem key="completed" value="completed">Completed</SelectItem>
                                            <SelectItem key="new" value="new">New</SelectItem>
                                            <SelectItem key="resubmission" value="resubmission">Resubmission</SelectItem>
                                            <SelectItem key="emergency" value="emergency">Emergency</SelectItem>
                                        </Select>
                                    </Grid>
                                    {auth.roles.includes('Administrator') && (
                                        <Grid item xs={6} sm={4} md={3}>
                                            <Select
                                                isLoading={filteringByIncharge}
                                                label={'Incharge'}
                                                fullWidth
                                                aria-label={'Incharge'}
                                                variant={'bordered'}
                                                placeholder="Select Incharge"
                                                name="incharge"
                                                value={filterData.incharge}
                                                onChange={(e) => handleFilterChange('incharge', e.target.value)}
                                                selectedKeys={[filterData.incharge]}
                                                popoverProps={{
                                                    classNames: {
                                                        content: "bg-transparent backdrop-blur-lg border-inherit",
                                                    },
                                                }}
                                            >
                                                <SelectItem key='all' value='all'>All</SelectItem>
                                                {allData.allInCharges.map(inCharge => (
                                                    <SelectItem key={inCharge.id} value={inCharge.id}>
                                                        {inCharge.name}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                    )}
                                    {/*<Grid item xs={6} sm={4} md={3}>*/}
                                    {/*    <FormControl fullWidth>*/}
                                    {/*        <InputLabel id="report-label">Report</InputLabel>*/}
                                    {/*        <Select*/}
                                    {/*            variant="outlined"*/}
                                    {/*            labelId="report-label"*/}
                                    {/*            label="Report"*/}
                                    {/*            name="report"*/}
                                    {/*            value={filterData.report}*/}
                                    {/*            onChange={(e) => handleFilterChange('report', e.target.value)}*/}
                                    {/*            MenuProps={{*/}
                                    {/*                PaperProps: {*/}
                                    {/*                    sx: {*/}
                                    {/*                        backdropFilter: 'blur(16px) saturate(200%)',*/}
                                    {/*                        background: theme.glassCard.background,*/}
                                    {/*                        border: theme.glassCard.border,*/}
                                    {/*                        borderRadius: 2,*/}
                                    {/*                        boxShadow:*/}
                                    {/*                            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',*/}
                                    {/*                    },*/}
                                    {/*                },*/}
                                    {/*            }}*/}
                                    {/*        >*/}
                                    {/*            <MenuItem value="" disabled>Select Report</MenuItem>*/}
                                    {/*            /!* Add your report options here *!/*/}
                                    {/*        </Select>*/}
                                    {/*    </FormControl>*/}
                                    {/*</Grid>*/}
                                    <Grid item xs={12} sm={12} md={12}>
                                        <Input
                                            isLoading={loading}
                                            size={'lg'}
                                            aria-label="Search"
                                            fullWidth
                                            variant="bordered"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={handleSearch}
                                            startContent={<SearchIcon />}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>

                        <CardContent >
                            <DailyWorksTable
                                setData={setData}
                                filteredData={filteredData}
                                setFilteredData={setFilteredData}
                                reports={reports}
                                setCurrentRow={setCurrentRow}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                setLoading={setLoading}
                                handleClickOpen={handleClickOpen}
                                openModal={openModal}
                                juniors={allData.juniors}
                                totalRows={totalRows}
                                lastPage={lastPage}
                                loading={loading}
                                allData={data}
                                allInCharges={allData.allInCharges}
                                jurisdictions={jurisdictions}
                                users={users}
                                reports_with_daily_works={reports_with_daily_works}
                            />
                            {totalRows >= 30 && (
                                <div className="py-2 px-2 flex justify-center items-center">
                                    <Pagination
                                        initialPage={1}
                                        isCompact
                                        showControls
                                        showShadow
                                        color="primary"
                                        variant={'bordered'}
                                        page={currentPage}
                                        total={lastPage}
                                        onChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>

    );
});

DailyWorks.layout = (page) => <App>{page}</App>;

export default DailyWorks;
