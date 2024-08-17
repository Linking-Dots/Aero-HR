import React, {useState} from 'react';
import DataTable, { createTheme } from 'react-data-table-component';
import {
    Select,
    MenuItem,
    TextField,
    Avatar,
    CircularProgress, Box, IconButton
} from '@mui/material';
import {styled, useTheme} from '@mui/material/styles';
import {usePage} from "@inertiajs/react";
import NewIcon from '@mui/icons-material/FiberNew'; // Example icon for "New"
import ResubmissionIcon from '@mui/icons-material/Replay'; // Example icon for "Resubmission"
import CompletedIcon from '@mui/icons-material/CheckCircle'; // Example icon for "Completed"
import EmergencyIcon from '@mui/icons-material/Error';
import {toast} from "react-toastify";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProfileForm from "@/Forms/ProfileForm.jsx";
import DailyWorkForm from "@/Forms/DailyWorkForm.jsx";


const CustomDataTable = styled(DataTable)(({ theme }) => ({

    '& .rdt_Table': {
        backgroundColor: 'transparent',
        '& .rdt_TableHead': {
            '& .rdt_TableHeadRow': {
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
            },
            top: 0,
            zIndex: 1, // Ensure header is above the scrollable body
        },
        '& .rdt_TableBody': {
            overflowY: 'auto',
            maxHeight: 'calc(500px - 56px)',
            '& .rdt_TableRow': {
                minHeight: 'auto',
                backgroundColor: 'transparent',
                color: theme.palette.text.primary,
                '& .rdt_TableCol': {
                    backgroundColor: 'transparent',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    width: 'auto', // Ensure columns can grow to fit content
                    whiteSpace: 'nowrap', // Prevent wrapping, adjust based on your needs
                },
            },
            '& .rdt_TableRow:hover': {
                backgroundColor: theme.palette.action.hover,
            },
        },
    },


}));



const TaskTable = ({ dailyWorkData, allInCharges, reports, juniors, jurisdictions, users, reports_with_daily_works  }) => {
    console.log(dailyWorkData)
    console.log(allInCharges)
    const { auth } = usePage().props;

    const theme = useTheme();
    const [dailyWorks, setDailyWorks] = useState(dailyWorkData);
    const [openModalType, setOpenModalType] = useState(null);

    const userIsAdmin = auth.roles.includes('admin');
    const userIsSe = auth.roles.includes('se');
    const userIsQciAqci = auth.roles.includes('qci') || auth.roles.includes('aqci');


    const columns = [
        {
            name: 'Date',
            selector: row => row.date,
            sortable: true,
            center: true,
            grow: 0
        },
        {
            name: 'RFI NO',
            selector: row => row.number,
            sortable: true,
            center: true,
            width: '140px',
            cell: row => (
                <>
                    {row.number}
                    {row.reports && row.reports.map(report => (
                        <div key={report.ref_no}>
                        <span>
                            <i className="mdi mdi-circle-medium"></i> {report.ref_no}
                        </span>
                        </div>
                    ))}
                </>
            ),
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            center: true,
            width: '220px',
            cell: row => (
                <Select
                    size="small"
                    fullWidth
                    value={row.status}
                    onChange={(e) => handleChange(row.id, 'status', e.target.value)}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backdropFilter: 'blur(16px) saturate(200%)',
                                backgroundColor: theme.glassCard.backgroundColor,
                                border: theme.glassCard.border,
                                borderRadius: 2,
                                boxShadow: theme.glassCard.boxShadow,
                            },
                        },
                    }}
                >
                    <MenuItem value="new">
                        <Box sx={{display: 'flex'}}>
                            <NewIcon style={{ marginRight: 8, color: getStatusColor('new') }} /> New
                        </Box>
                    </MenuItem>
                    <MenuItem value="resubmission">
                        <Box sx={{display: 'flex'}}>
                            <ResubmissionIcon style={{ marginRight: 8, color: getStatusColor("resubmission") }} /> Resubmission
                        </Box>
                    </MenuItem>
                    <MenuItem value="completed">
                        <Box sx={{display: 'flex'}}>
                            <CompletedIcon style={{ marginRight: 8, color: getStatusColor("completed") }} /> Completed
                        </Box>
                    </MenuItem>
                    <MenuItem value="emergency">
                        <Box sx={{display: 'flex'}}>
                            <EmergencyIcon style={{ marginRight: 8, color: getStatusColor("emergency") }} /> Emergency
                        </Box>
                    </MenuItem>
                </Select>
            ),
        },
        ...(userIsSe ? [{
            name: 'Assigned',
            selector: row => row.assigned,
            sortable: true,
            center: true,
            width: '150px',
            cell: row => (
                <Select
                    fullWidth
                    size="small"
                    value={row.assigned || ''}
                    onChange={(e) => handleChange(row.id,'assigned', e.target.value)}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backdropFilter: 'blur(16px) saturate(200%)',
                                backgroundColor: theme.glassCard.backgroundColor,
                                border: theme.glassCard.border,
                                borderRadius: 2,
                                boxShadow: theme.glassCard.boxShadow,
                            },
                        },
                    }}
                >
                    <MenuItem value="" disabled>Please select</MenuItem>
                    {juniors.map(junior => (
                        <MenuItem key={junior.id} value={junior.id}>
                            <Box sx={{display: 'flex'}}>
                                <Avatar
                                    src={`/assets/images/users/${junior.user_name || 'user-dummy-img'}.jpg`}
                                    alt={junior.name || 'Not assigned'}
                                    sx={{
                                        borderRadius: '50%',
                                        width: 23,
                                        height: 23,
                                        display: 'flex',
                                        mr: 1,
                                    }}
                                />
                                {junior.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            ),
        }] : []),
        {
            name: 'Type',
            selector: row => row.type,
            sortable: true,
            center: true,
            width: '140px',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
            left: true,
            width: '260px',

            cell: row => (
                <Box sx={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}>
                    {row.description}
                </Box>
            ),
        },
        {
            name: 'Location',
            selector: row => row.location,
            sortable: true,
            center: true,
            width: '200px',
            cell: row => (
                <Box sx={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}>
                    {row.location}
                </Box>
            ),
        },
        {
            name: 'Comments',
            selector: row => row.inspection_details,
            sortable: true,
            width: '200px',
            center: true,
            cell: row => {
                const [isEditing, setIsEditing] = React.useState(false);
                const [inputValue, setInputValue] = React.useState(row.inspection_details || '');

                const handleClick = () => {
                    setIsEditing(true);
                };

                const handleInputChange = (event) => {
                    setInputValue(event.target.value);
                };

                const handleBlur = () => {
                    setIsEditing(false);
                    handleChange(row.id,'inspection_details', inputValue);
                };

                return (
                    <Box
                        sx={{
                            whiteSpace: 'normal',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                            cursor: 'pointer',
                        }}
                        onClick={!isEditing ? handleClick : undefined}
                    >
                        {!isEditing ? (
                            <>
                                {row.inspection_details || 'N/A'}
                            </>
                        ) : (
                            <TextField
                                fullWidth
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                autoFocus
                                variant="standard"
                                InputProps={{
                                    style: {
                                        marginBottom: 0,
                                        border: 'none',
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                        textAlign: 'center',
                                    },
                                }}
                            />
                        )}
                    </Box>
                );
            },
        },
        {
            name: 'Road Type',
            selector: row => row.side,
            sortable: true,
            center: true,
            width: '120px',
        },
        {
            name: 'Quantity/Layer No.',
            selector: row => row.qty_layer,
            sortable: true,
            center: true,
            width: '150px',
        },
        ...(userIsAdmin ? [{
            name: 'In charge',
            selector: row => row.incharge,
            sortable: true,
            center: true,
            cell: row => (
                <Select
                    fullWidth
                    size="small"
                    value={row.incharge || ''}
                    onChange={(e) => handleChange(row.id,'incharge', e.target.value)}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                backdropFilter: 'blur(16px) saturate(200%)',
                                backgroundColor: theme.glassCard.backgroundColor,
                                border: theme.glassCard.border,
                                borderRadius: 2,
                                boxShadow: theme.glassCard.boxShadow,
                            },
                        },
                    }}
                >
                    <MenuItem value="" disabled>Please select</MenuItem>
                    {allInCharges.map(incharge => (
                        <MenuItem key={incharge.id} value={incharge.id}>
                            <Box sx={{display: 'flex'}}>
                                <Avatar
                                    src={`/assets/images/users/${incharge.user_name || 'user-dummy-img'}.jpg`}
                                    alt={incharge.name || 'Not assigned'}
                                    sx={{
                                        borderRadius: '50%',
                                        width: 23,
                                        height: 23,
                                        display: 'flex',
                                        mr: 1,
                                    }}
                                />
                                {incharge.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            ),
        }] : []),
        {
            name: 'Completion Time',
            selector: row => row.completion_time,
            sortable: true,
            center: true,
            width: '250px',
            cell: row => (
                <TextField
                    size="small"
                    type="datetime-local"
                    value={row.completion_time || ''}
                    onChange={(e) => handleChange(row.id,'completion_time', e.target.value)}
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                />
            ),
        },
        {
            name: 'Resubmission Count',
            selector: row => row.resubmission_count,
            sortable: true,
            center: true,
            width: '160px',
            cell: row => (
                <>
                    {row.resubmission_count} {row.resubmission_count > 1 ? 'times' : 'time'}
                </>
            ),
        },
        ...(userIsAdmin ? [{
            name: 'RFI Submission Date',
            selector: row => row.rfi_submission_date,
            sortable: true,
            center: true,
            width: '180px',
            cell: row => (
                <TextField
                    size="small"
                    type="date"
                    defaultValue={row.rfi_submission_date}
                    onChange={(e) => handleChange(row.id,'rfi_submission_date', e.target.value)}
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                    disabled={!userIsAdmin}
                />
            ),
        }] : []),
        {
            name: 'Actions',
            center: true,
            width: '150px',
            cell: row => (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <IconButton
                        sx={{m:1}}
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => openModal('editDailyWork')}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        sx={{m:1}}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                    {/*{openModalType === 'editDailyWork' && (*/}
                    {/*    <DailyWorkForm*/}
                    {/*        user={user}*/}
                    {/*        allUsers={allUsers}*/}
                    {/*        departments={departments}*/}
                    {/*        designations={designations}*/}
                    {/*        open={openModalType === 'dailyWork'}*/}
                    {/*        setUser={setUser}*/}
                    {/*        closeModal={closeModal}*/}
                    {/*        handleImageChange={handleImageChange}*/}
                    {/*        selectedImage={selectedImage}*/}
                    {/*    />*/}
                    {/*)}*/}
                    {openModalType === 'editDailyWork' && (
                        <DailyWorkForm
                            open={openModalType === 'editDailyWork'}
                            setDailyWorks={setDailyWorks}
                            dailyWork={row}
                            closeModal={closeModal}
                        />
                    )}
                </Box>
            ),
        }
    ];


    const getStatusColor = (status) => {
        switch (status) {
            case 'new':
                return 'blue';
            case 'resubmission':
                return 'orange';
            case 'completed':
                return 'green';
            case 'emergency':
                return 'red';
            default:
                return '';
        }
    };

    const openModal = (modalType) => {
        setOpenModalType(modalType);
    };

    const closeModal = () => {
        setOpenModalType(null);
    };

    const handleChange = (taskId, key, value) => {
        const promise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(route('dailyWorks.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        id: taskId,
                        [key]: value,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setDailyWorks(prevTasks =>
                        prevTasks.map(task =>
                            task.id === taskId ? { ...task, [key]: value } : task
                        )
                    );
                    resolve([data.message]);
                } else {
                    reject(data.error || `Failed to update task ${[key]}.`);
                    console.error(data);
                }
            } catch (error) {
                console.log(error);
                reject(error.message || 'An unexpected error occurred.');
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
                                <span style={{ marginLeft: '8px' }}>Updating task status ...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                success: {
                    render({ data }) {
                        return (
                            <>
                               {data}
                            </>
                        );
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            <>
                                {data}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                },
            }
        );
    };


    const handleEdit = (taskId) => {
        console.log('Edit task:', taskId);
        // Handle edit task logic
    };

    const handleDelete = (taskId) => {
        console.log('Delete task:', taskId);
        // Handle delete task logic
    };

    return (
        <>

            <CustomDataTable
                columns={columns}
                data={dailyWorks}
                defaultSortField="date"
                defaultSortFieldId={1}
                defaultSortAsc={false}
                pagination
                fixedHeaderScrollHeight="500px"
                highlightOnHover
                responsive
                dense

            />
        </>


    );
};

export default TaskTable;
