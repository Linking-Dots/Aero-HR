import React, { useState, useEffect, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Button,
    CardContent,
    CardHeader,
    Grid, Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import Grow from '@mui/material/Grow';
import {Input, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/react';
import SearchIcon from '@mui/icons-material/Search';
import GlassCard from '@/Components/GlassCard.jsx';
import App from '@/Layouts/App.jsx';
import PicnicParticipantForm from '@/Forms/PicnicParticipantForm.jsx';
import DeletePicnicParticipantForm from '@/Forms/DeletePicnicParticipantForm.jsx';
import dayjs from 'dayjs';

const PicnicParticipants = ({ title, allUsers }) => {
    const { auth, props } = usePage();
    const [openModalType, setOpenModalType] = useState(null);
    const [leavesData, setPicnicParticipantsData] = useState(props.leavesData);
    const [leaves, setPicnicParticipants] = useState();
    const [totalRows, setTotalRows] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [leaveIdToDelete, setPicnicParticipantIdToDelete] = useState(null);
    const [employee, setEmployee] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(
        dayjs().format('YYYY-MM')
    );
    const [perPage, setPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPicnicParticipant, setCurrentPicnicParticipant] = useState();
    const [error, setError] = useState('');

    const openModal = (modalType) => setOpenModalType(modalType);

    const handleClickOpen = useCallback((leaveId, modalType) => {
        setPicnicParticipantIdToDelete(leaveId);
        setOpenModalType(modalType);
    }, []);

    const handleClose = useCallback(() => {
        setOpenModalType(null);
        setPicnicParticipantIdToDelete(null);
    }, []);

    const handleSearch = (event) => setEmployee(event.target.value.toLowerCase());

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const fetchPicnicParticipantsData = async () => {

        try {
            const response = await axios.get(route('leaves.paginate'), {
                params: {
                    page: currentPage,
                    perPage,
                    employee,
                    month: selectedMonth,
                },
            });

            if (response.status === 200) {
                const { data, total, last_page } = response.data.leaves;
                setPicnicParticipants(data);
                setTotalRows(total);
                setLastPage(last_page);
            }
        } catch (error) {
            console.error('Error fetching leaves data:', error);
            setError(error.response?.data?.message || 'Error retrieving data.');
        }
    };

    useEffect(() => {
        fetchPicnicParticipantsData();
    }, [selectedMonth, currentPage, perPage, employee]);

    return (
        <>
            <Head title={title} />

            {['add_leave', 'edit_leave'].includes(openModalType) && (
                <PicnicParticipantForm
                    setTotalRows={setTotalRows}
                    setLastPage={setLastPage}
                    setPicnicParticipants={setPicnicParticipants}
                    perPage={perPage}
                    employee={employee}
                    currentPage={currentPage}
                    selectedMonth={selectedMonth}
                    allUsers={allUsers}
                    open={true}
                    setPicnicParticipantsData={setPicnicParticipantsData}
                    closeModal={() => setOpenModalType(null)}
                    leavesData={leavesData}
                    currentPicnicParticipant={openModalType === 'edit_leave' ? currentPicnicParticipant : null}
                    handleMonthChange={handleMonthChange}
                />
            )}

            {openModalType === 'delete_leave' && (
                <DeletePicnicParticipantForm
                    open={true}
                    handleClose={handleClose}
                    leaveIdToDelete={leaveIdToDelete}
                    setPicnicParticipantsData={setPicnicParticipantsData}
                />
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Grow in>
                    <GlassCard>
                        <CardHeader
                            title="Picnic Participants"
                            sx={{ padding: '24px' }}
                            action={
                                <Button
                                    title="Add Picnic Participant"
                                    variant="outlined"
                                    color="success"
                                    startIcon={<Add />}
                                    onClick={() => openModal('add_leave')}
                                >
                                    Add Picnic Participant
                                </Button>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Input
                                        label="Search"
                                        fullWidth
                                        variant="bordered"
                                        placeholder="Employee..."
                                        value={employee}
                                        onChange={handleSearch}
                                        endContent={<SearchIcon />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <Input
                                        label="Select Month"
                                        type="month"
                                        variant="bordered"
                                        onChange={handleMonthChange}
                                        value={selectedMonth}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardContent>
                            <div style={{maxHeight: "84vh", overflowY: "auto"}}>
                                <Table
                                    isStriped
                                    selectionMode="multiple"
                                    selectionBehavior="toggle"
                                    isCompact
                                    isHeaderSticky
                                    removeWrapper
                                    aria-label="Picnic Participant Employee Table"
                                >
                                    <TableHeader columns={columns}>
                                        {(column) => (
                                            <TableColumn key={column.uid}
                                                         align={column.uid === "actions" ? "center" : "start"}>
                                                {column.name}
                                            </TableColumn>
                                        )}
                                    </TableHeader>
                                    <TableBody items={leaves}>
                                        {(leave) => (
                                            <TableRow key={leave.id}>
                                                {(columnKey) => (
                                                    <TableCell style={{whiteSpace: "nowrap"}}>
                                                        {renderCell(leave, columnKey)}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                {totalRows > 10 && (
                                    <div className="py-2 px-2 flex justify-center items-end" style={{height: "100%"}}>
                                        <Pagination
                                            initialPage={1}
                                            isCompact
                                            showControls
                                            showShadow
                                            color="primary"
                                            variant="bordered"
                                            page={currentPage}
                                            total={lastPage}
                                            onChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Box>
        </>
    );
};

PicnicParticipants.layout = (page) => <App>{page}</App>;

export default PicnicParticipants;
