import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Avatar,
    Typography,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Button
} from '@mui/material';
import { AccountCircle, Edit, Delete } from '@mui/icons-material';
import {useTheme} from "@mui/material/styles";
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import EditIcon from "@mui/icons-material/Edit.js";
import DeleteIcon from "@mui/icons-material/Delete.js";
import React from "react";

const LeaveEmployeeTable = ({ allLeaves, allUsers, handleClickOpen, setCurrentLeave, openModal}) => {
    const theme = useTheme();
    return (
        <TableContainer style={{ maxHeight: '84vh', overflowY: 'auto' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Leave Type</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>From</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>To</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>No of Days</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Reason</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Status</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>Approved by</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {allLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{leave.leave_type}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(leave.from_date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(leave.to_date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{leave.no_of_days}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{leave.reason}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{ borderRadius: '50px' }}

                                >
                                    <RadioButtonCheckedIcon/> {leave.status}
                                </Button>

                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {leave.approved_by ? (
                                    <Typography sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        <Avatar src={allUsers.find(user => user.id === leave.approved_by).avatar} alt={allUsers.find(user => user.id === leave.approved_by).name} />
                                        <Typography sx={{ marginLeft: '10px' }}>
                                            <Link
                                                href="#"
                                                sx={{ textDecoration: 'none', color: theme.palette.text.primary, fontWeight: 'bold' }}
                                            >
                                                {allUsers.find(user => user.id === leave.approved_by).name}
                                            </Link>
                                        </Typography>
                                    </Typography>
                                ) : null}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }} align="center">
                                <IconButton
                                    sx={{m:1}}
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    onClick={() => {
                                        setCurrentLeave(leave);
                                        openModal('edit_leave');
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    sx={{ m: 1 }}
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleClickOpen(leave.id, 'delete_leave')}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LeaveEmployeeTable;
