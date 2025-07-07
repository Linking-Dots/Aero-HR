import React, { useState } from 'react';
import { 
    Box, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    UserGroupIcon,
    FolderIcon,
    CalendarIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Button, Chip } from '@heroui/react';
import { format } from 'date-fns';

const TrainingSessionsTable = ({ data, loading, permissions, onView, onEdit, onDelete, onMaterials, onEnrollments }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    
    const handleMenuOpen = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };
    
    const getStatusChip = (status) => {
        switch (status) {
            case 'planned':
                return (
                    <Chip 
                        variant="flat" 
                        color="primary" 
                        size="sm"
                        startContent={<CalendarIcon className="w-4 h-4" />}
                    >
                        Planned
                    </Chip>
                );
            case 'active':
                return (
                    <Chip 
                        variant="flat" 
                        color="success" 
                        size="sm"
                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                    >
                        Active
                    </Chip>
                );
            case 'completed':
                return (
                    <Chip 
                        variant="flat" 
                        color="secondary" 
                        size="sm"
                        startContent={<CheckCircleIcon className="w-4 h-4" />}
                    >
                        Completed
                    </Chip>
                );
            case 'cancelled':
                return (
                    <Chip 
                        variant="flat" 
                        color="danger" 
                        size="sm"
                        startContent={<XMarkIcon className="w-4 h-4" />}
                    >
                        Cancelled
                    </Chip>
                );
            default:
                return (
                    <Chip 
                        variant="flat" 
                        color="default" 
                        size="sm"
                    >
                        {status}
                    </Chip>
                );
        }
    };
    
    return (
        <>
            <TableContainer component={Paper} elevation={0} className="glass-table">
                <Table sx={{ minWidth: 650 }} size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell>Training Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Dates</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Enrollments</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography>No training sessions found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">{row.title}</Typography>
                                        <Typography variant="caption" color="textSecondary">{row.instructor}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.category?.name || 'Uncategorized'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.duration} {row.duration_unit}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {row.start_date ? format(new Date(row.start_date), 'MMM dd, yyyy') : 'TBD'}
                                            {row.end_date ? ` - ${format(new Date(row.end_date), 'MMM dd, yyyy')}` : ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(row.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.enrollment_count || 0}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                            </svg>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderRadius: '12px',
                        mt: 1.5,
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {permissions.includes('training-sessions.view') && (
                    <MenuItem onClick={() => { onView(selectedRow); handleMenuClose(); }}>
                        <ListItemIcon>
                            <EyeIcon className="w-5 h-5" />
                        </ListItemIcon>
                        <ListItemText>View Details</ListItemText>
                    </MenuItem>
                )}
                
                {permissions.includes('training-sessions.update') && (
                    <MenuItem onClick={() => { onEdit(selectedRow); handleMenuClose(); }}>
                        <ListItemIcon>
                            <PencilIcon className="w-5 h-5" />
                        </ListItemIcon>
                        <ListItemText>Edit Training</ListItemText>
                    </MenuItem>
                )}
                
                {permissions.includes('training-materials.view') && (
                    <MenuItem onClick={() => { onMaterials(selectedRow); handleMenuClose(); }}>
                        <ListItemIcon>
                            <FolderIcon className="w-5 h-5" />
                        </ListItemIcon>
                        <ListItemText>Materials</ListItemText>
                    </MenuItem>
                )}
                
                {permissions.includes('training-enrollments.view') && (
                    <MenuItem onClick={() => { onEnrollments(selectedRow); handleMenuClose(); }}>
                        <ListItemIcon>
                            <UserGroupIcon className="w-5 h-5" />
                        </ListItemIcon>
                        <ListItemText>Participants</ListItemText>
                    </MenuItem>
                )}
                
                {permissions.includes('training-sessions.delete') && (
                    <MenuItem onClick={() => { onDelete(selectedRow); handleMenuClose(); }}>
                        <ListItemIcon>
                            <TrashIcon className="w-5 h-5" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export default TrainingSessionsTable;
