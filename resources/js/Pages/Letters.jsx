import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    CardContent,
    CardHeader, CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    useMediaQuery,
} from '@mui/material';
import { AddBox, Download, Upload } from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import App from "@/Layouts/App.jsx";
import Grow from "@mui/material/Grow";
import LettersTable from '@/Tables/LettersTable.jsx';
import GlassCard from "@/Components/GlassCard.jsx";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
// import LetterForm from "@/Forms/LetterForm.jsx";
// import DeleteLetterForm from "@/Forms/DeleteLetterForm.jsx";
// import LettersDownloadForm from "@/Forms/LettersDownloadForm.jsx";
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search";
// import LettersUploadForm from "@/Forms/LettersUploadForm.jsx";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import {toast} from "react-toastify";
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import {Input, Pagination} from "@heroui/react";
dayjs.extend(minMax);


const Letters = React.memo(({ auth, title, users }) => {
    const theme = useTheme();


    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
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

    const fetchData = async (page, perPage, search) => {
        try {
            const response = await axios.get(route('letters.paginate'), {
                params: {
                    page,
                    perPage,
                    search: search, // Assuming 'report' is the search field
                }
            });

            setData(response.data.data);
            setTotalRows(response.data.total);
            setLastPage(response.data.last_page);
            setLoading(false);
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

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearch(value);
    };



    useEffect(() => {
        setLoading(true);
        fetchData(currentPage, perPage, search);
    }, [currentPage, perPage, search]);


    const handlePageChange = (page) => {
        setCurrentPage(page);
    };


    return (
        <>
            <Head title={title}/>
            {openModalType === 'editLetter' && (
                <LetterForm
                    open={openModalType === 'editLetter'}
                    currentRow={currentRow}
                    setData={setData}
                    closeModal={closeModal}
                />
            )}
            {openModalType === 'deleteLetter' && (
                <DeleteLetterForm
                    open={openModalType === 'deleteLetter'}
                    handleClose={handleClose}
                    handleDelete={handleDelete}
                    setData={setData}
                />
            )}
            {openModalType === 'importLetters' && (
                <LettersUploadForm
                    open={openModalType === 'importLetters'}
                    closeModal={closeModal}
                    setData={setData}
                    setTotalRows={setTotalRows}
                />
            )}
            {openModalType === 'exportLetters' && (
                <LettersDownloadForm
                    open={openModalType === 'exportLetters'}
                    closeModal={closeModal}
                    data={data}
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
                                    {auth.permissions.includes('addTask'||'addTaskSE') && (
                                        <IconButton title="Add Task" color="primary" id="showAddModalBtn">
                                            <AddBox />
                                        </IconButton>
                                    )}
                                    {auth.roles.includes('Administrator') && (
                                        <>
                                            {isMobile ? (
                                                <>
                                                    <IconButton
                                                        title="Import Letters"
                                                        color="warning"
                                                        onClick={() => openModal('importLetters')} // Handle opening the modal
                                                    >
                                                        <Upload />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Export Letters"
                                                        color="success"
                                                        onClick={() => openModal('exportLetters')}
                                                    >
                                                        <Download />
                                                    </IconButton>
                                                </>

                                            ) : (
                                                <>
                                                    <Button
                                                        title="Import Letters"
                                                        variant="outlined"
                                                        color="warning"
                                                        startIcon={<Upload />}
                                                        onClick={() => openModal('importLetters')} // Handle opening the modal
                                                    >
                                                        Import
                                                    </Button>
                                                    <Button
                                                        title="Export Letters"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<Download />}
                                                        onClick={() => openModal('exportLetters')}
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
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Input
                                            label="Search"
                                            type={'text'}
                                            fullWidth
                                            variant="bordered"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={handleSearch}
                                            endContent={<SearchIcon />}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>

                        <CardContent >
                            <LettersTable
                                setData={setData}
                                setCurrentRow={setCurrentRow}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                setLoading={setLoading}
                                handleClickOpen={handleClickOpen}
                                openModal={openModal}
                                totalRows={totalRows}
                                lastPage={lastPage}
                                loading={loading}
                                allData={data}
                                users={users}
                                search={search}
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

Letters.layout = (page) => <App>{page}</App>;

export default Letters;
