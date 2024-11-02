import DataTable from 'react-data-table-component';
import {
    Avatar,
    Box, Button, CardContent, CardHeader, Chip,
    CircularProgress, Collapse,
    GlobalStyles,
    Grid,
    IconButton,
    MenuItem,
    TextField, Typography,
} from '@mui/material';
import {styled, useTheme} from '@mui/material/styles';
import { usePage} from "@inertiajs/react";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewIcon from '@mui/icons-material/FiberNew'; // Example icon for "New"
import ResubmissionIcon from '@mui/icons-material/Replay'; // Example icon for "Resubmission"
import CompletedIcon from '@mui/icons-material/CheckCircle'; // Example icon for "Completed"
import EmergencyIcon from '@mui/icons-material/Error';
import {toast} from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Pagination, SelectItem, Select, User, Input, Link} from "@nextui-org/react";
import Loader from "@/Components/Loader.jsx";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from "@mui/icons-material/Close";

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
            maxHeight: '52vh',
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

const DailyWorksTable = ({ allData, setData, loading, handleClickOpen, allInCharges, reports, juniors, reports_with_daily_works, openModal, setCurrentRow, filteredData, setFilteredData }) => {
    const { auth } = usePage().props;
    const theme = useTheme();

    const userIsAdmin = auth.roles.includes('Administrator');
    const userIsSe = auth.roles.includes('Supervision Engineer');

    const allStatuses = [
        { value: 'new', label: 'New', icon: <NewIcon /> },
        { value: 'resubmission', label: 'Resubmission', icon: <ResubmissionIcon /> },
        { value: 'completed', label: 'Completed', icon: <CompletedIcon /> },
        { value: 'emergency', label: 'Emergency', icon: <EmergencyIcon /> },
    ];

    const columns = [
        {
            name: 'Date',
            selector: row => row.date,
            sortable: 'true',
            center: "true",
            width: '110px'
        },
        {
            name: 'RFI NO',
            selector: row => row.number,
            sortable: 'true',
            center: 'true',
            width: '140px',
            cell: row => (

                <>
                    {row.status === 'completed' && row.file ? (
                        <Link
                            isBlock
                            showAnchorIcon
                            anchorIcon={<AssignmentTurnedInIcon />}
                            href={row.file}
                            color="success"
                            size={'sm'}
                        >
                            {row.number}
                        </Link>
                    ) : row.status === 'completed' && !row.file ? (
                        <Link
                            isBlock
                            showAnchorIcon
                            anchorIcon={<CloseIcon />}
                            href="#"
                            color="danger"
                            size={'sm'}
                            onClick={async (e) => {
                                e.preventDefault(); // Prevent default link behavior
                                const imageFile = await captureImage();
                                if (imageFile) {
                                    await uploadImage(row.id, imageFile); // Use row.id to get the taskId
                                }
                            }}
                        >
                            {row.number}
                        </Link>
                    ) : (row.number)}

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
            sortable: 'true',
            center: 'true',
            width: '220px',
            style: { padding: '0px 10px 0px 10px' },
            cell: row => (
                <Select
                    items={allStatuses}
                    aria-label="Status"
                    fullWidth
                    value={row.status || 'na'} // Set the value to 'na' if no status is assigned
                    onChange={(e) => handleChange(row.id, 'status', e.target.value)}
                    selectedKeys={[String(row.status)]}
                    style={{
                        minWidth: '220px',  // Optionally set a minimum width
                    }}
                    color={getStatusColor(row.status)}
                    popoverProps={{
                        classNames: {
                            content: 'bg-transparent backdrop-blur-lg border-inherit',
                        },
                        style: {
                            whiteSpace: 'nowrap', // Ensure content wraps
                            minWidth: 'fit-content',  // Optionally set a minimum width
                        },
                    }}
                    placeholder="Select Status"
                    renderValue={(selectedStatuses) => {
                        return selectedStatuses.map((selectedStatus) => (
                            <div key={selectedStatus.key} className="flex items-center gap-2 m-1">
                                {allStatuses.find(status => status.value === selectedStatus.data.value)?.icon} {/* Get the icon */}
                                <span>
                                    {selectedStatus.data.label}
                                </span>
                            </div>
                        ));
                    }}
                >
                    {(status) => (
                        <SelectItem key={status.value} textValue={status.value}>
                            <div className="flex items-center gap-2">
                                {status.icon} {/* Directly display the icon */}
                                <span style={{ color: getStatusColor(status.value) }}>
                                {status.label} {/* Display status label */}
                            </span>
                            </div>
                        </SelectItem>
                    )}
                </Select>
            ),
        },
        ...(userIsSe ? [{
            name: 'Assigned',
            selector: row => row.assigned,
            sortable: 'true',
            center: 'true',
            cell: row => (
                <Select
                    items={juniors}
                    variant="outlined"
                    aria-label="Assigned"
                    fullWidth
                    size="small"
                    value={row.assigned || 'na'}
                    style={{
                        minWidth: '260px',  // Optionally set a minimum width
                    }}
                    onChange={(e) => handleChange(row.id, 'assigned', e.target.value)}
                    popoverProps={{
                        classNames: {
                            content: 'bg-transparent backdrop-blur-lg border-inherit',
                        },
                        style: {
                            whiteSpace: 'nowrap', // Ensure content wraps
                            minWidth: 'fit-content',  // Optionally set a minimum width
                        },
                    }}
                    placeholder="Select a junior"
                    renderValue={(selectedJuniors) => {
                        // Handle display of selected value(s)
                        return selectedJuniors.map((selectedJunior) => (
                            <div key={selectedJunior.key} className="flex items-center gap-2 m-1">
                                <User
                                    style={{
                                        whiteSpace: 'nowrap',  // Ensure content wraps
                                    }}
                                    size="sm"
                                    name={selectedJunior.data.name}
                                    avatarProps={{
                                        radius: "sm",
                                        size: "sm",
                                        src: selectedJunior.data.profile_image,
                                    }}
                                />
                            </div>
                        ));
                    }}
                >
                    {(junior) => (
                        <SelectItem key={junior.id} textValue={junior.id}>
                            <Box sx={{ display: 'flex' }}>
                                <Avatar
                                    src={junior.profile_image}
                                    alt={junior.name || 'Not assigned'}
                                    sx={{
                                        borderRadius: '50%',
                                        width: 23,
                                        height: 23,
                                        display: 'flex',
                                        marginRight: 1,
                                    }}
                                />
                                {junior.name}
                            </Box>
                        </SelectItem>
                    )}
                </Select>

            ),
        }] : []),
        {
            name: 'Type',
            selector: row => row.type,
            sortable: 'true',
            center: 'true',
            width: '140px',
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: 'true',
            left: 'true',
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
            sortable: 'true',
            center: 'true',
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
            name: 'Results',
            selector: row => row.inspection_details,
            sortable: 'true',
            width: '200px',
            center: 'true',
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
            sortable: 'true',
            center: 'true',
            width: '120px',
        },
        {
            name: 'Quantity/Layer No.',
            selector: row => row.qty_layer,
            sortable: 'true',
            center: 'true',
            width: '150px',
        },
        ...(userIsAdmin ? [{
            name: 'In charge',
            selector: row => row.incharge,
            sortable: 'true',
            center: 'true',
            cell: row => (
                <Select
                    items={allInCharges}
                    variant="underlined"
                    aria-label="Incharge"
                    fullWidth
                    value={row.incharge || 'na'}  // Set the value to 'na' if no incharge is assigned
                    onChange={(e) => handleChange(row.id, 'incharge', e.target.value)}
                    selectedKeys={[String(row.incharge)]}
                    style={{
                        minWidth: '260px',  // Optionally set a minimum width
                    }}
                    popoverProps={{
                        classNames: {
                            content: 'bg-transparent backdrop-blur-lg border-inherit',
                        },
                        style: {
                            whiteSpace: 'nowrap', // Ensure content wraps
                            minWidth: 'fit-content',  // Optionally set a minimum width
                        },
                    }}
                    placeholder="Select Incharge"
                    renderValue={(selectedIncharges) => {
                        // Handle display of selected value(s)
                        return selectedIncharges.map((selectedIncharge) => (
                            <div key={selectedIncharge.key} className="flex items-center gap-2 m-1">
                                <User
                                    style={{
                                        whiteSpace: 'nowrap',  // Ensure content wraps
                                    }}
                                    size="sm"
                                    name={selectedIncharge.data.name}
                                    avatarProps={{
                                        radius: "sm",
                                        size: "sm",
                                        src: selectedIncharge.data.profile_image,
                                    }}
                                />
                            </div>
                        ));
                    }}
                >
                    {(incharge) => (
                        <SelectItem key={incharge.id} textValue={incharge.id}>
                            <User
                                style={{
                                    whiteSpace: 'nowrap',  // Ensure content wraps
                                }}
                                size="sm"
                                name={incharge.name}
                                description={incharge.designation?.title || 'Incharge'}
                                avatarProps={{
                                    radius: "sm",
                                    size: "sm",
                                    src: incharge.profile_image,
                                }}
                            />
                        </SelectItem>
                    )}
                </Select>

            ),
        }] : []),
        {
            name: 'Planned Time',
            selector: row => row.planned_time,
            sortable: 'true',
            center: 'true',
            width: '130px',
        },
        {
            name: 'Completion Time',
            selector: row => row.completion_time,
            sortable: 'true',
            center: 'true',
            width: '250px',
            cell: row => (
                <Input
                    fullWidth
                    size="sm"
                    variant={'underlined'}
                    type={'datetime-local'}
                    value={row.completion_time ? new Date(row.completion_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleChange(row.id, 'completion_time', e.target.value)}
                    inputProps={{
                        placeholder: 'YYYY-MM-DDTHH:MM',
                    }}
                />
            ),
        },
        {
            name: 'Resubmission Count',
            selector: row => row.resubmission_count,
            sortable: 'true',
            center: 'true',
            width: '160px',
            cell: row => (
                <>
                    {
                        row.resubmission_count
                            ? `${row.resubmission_count} ${row.resubmission_count > 1 ? 'times' : 'time'}`
                            : ''
                    }
                </>
            ),
        },
        ...(userIsAdmin ? [{
            name: 'RFI Submission Date',
            selector: row => row.rfi_submission_date,
            sortable: 'true',
            center: 'true',
            width: '180px',
            cell: row => (
                <Input
                    fullWidth
                    size="sm"
                    type="date"
                    variant={'underlined'}
                    onChange={(e) => handleChange(row.id, 'rfi_submission_date', e.target.value)}
                    value={row.rfi_submission_date ? new Date(row.rfi_submission_date).toISOString().slice(0, 10) : ''}
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                    inputProps={{
                        placeholder: 'yyyy-MM-dd'
                    }}
                />
            ),
        }] : []),
        ...(userIsAdmin ? [{
            name: 'Actions',
            center: 'true',
            width: '150px',
            cell: row => (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <IconButton
                        sx={{m:1}}
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => {
                            setCurrentRow(row);
                            openModal('editDailyWork');
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        sx={{ m: 1 }}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleClickOpen(row.id, 'deleteDailyWork')}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        }] : []),
    ];

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

    const captureImage = () => {
        return new Promise((resolve, reject) => {
            // Create a file input element
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.capture = "camera"; // Open the camera directly

            // Append the file input to the body (it won't be visible)
            document.body.appendChild(fileInput);

            // Handle the file selection
            fileInput.onchange = () => {
                const file = fileInput.files[0];
                if (file) {
                    // Resolve the promise with the captured file
                    resolve(file);
                } else {
                    reject(new Error("No file selected"));
                }

                // Clean up
                document.body.removeChild(fileInput);
            };

            // Trigger the file input click to open the camera
            fileInput.click();
        });
    };


    const uploadImage = async (taskId, imageFile) => {
        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("file", imageFile);

            const response = await axios.post(route('dailyWorks.uploadRFI'), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                console.log(response.data.message ? [response.data.message] : response.data.messages);
            }
        } catch (error) {
            console.error(error)
        }
    };

    const handleChange = async (taskId, key, value) => {
        try {
            if (key === 'status' && value === 'completed') {
                // Open camera and capture image
                const imageFile = await captureImage();
                if (imageFile) {
                    // Send image to the backend
                    await uploadImage(taskId, imageFile);
                }
            }


            const response = await axios.post(route('dailyWorks.update'), {
                id: taskId,
                [key]: value,
            });


            if (response.status === 200) {
                setData(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, [key]: value } : task
                    )
                );

                toast.success(...response.data.messages || `Task updated successfully`, {
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            } else {
                toast.error(response.data.error || `Failed to update task ${[key]}.`, {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An unexpected error occurred.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        }
    };





    return (
        <div>
            <GlobalStyles
                styles={{
                    '& .cgTKyH': {
                        backgroundColor: 'transparent !important',
                        color: theme.palette.text.primary
                    },
                }}
            />
            <CustomDataTable
                classNames={{
                    base: "max-h-[84vh] overflow-scroll",
                    table: "min-h-[84vh]",
                }}
                columns={columns}
                data={allData}
                loading={loading}
                loadingComponent={<CircularProgress />}
                defaultSortField="date"
                highlightOnHover
                responsive
                dense
            />

        </div>

    );
};

export default DailyWorksTable;
