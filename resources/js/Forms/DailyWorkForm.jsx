import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import GlassDialog from '@/Components/GlassDialog.jsx';

const DailyWorkForm = ({ open, closeModal, dailyWork }) => {
    const [dailyWorkData, setDailyWorkData] = useState({
        id: dailyWork.id || '',
        date: dailyWork.date || '',
        number: dailyWork.number || '',
        time: dailyWork.time || '',
        type: dailyWork.type || 'Structure',
        location: dailyWork.location || '',
        description: dailyWork.description || '',
        side: dailyWork.side || 'SR-R',
        qty_layer: dailyWork.qty_layer || '',
        completion_time: dailyWork.completion_time || '',
        status: dailyWork.status || 'completed',
        inspection_details: dailyWork.inspection_details || '',
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [dataChanged, setDataChanged] = useState(false);

    useEffect(() => {
        // Check if any field is changed
        const hasChanges = Object.values(dailyWorkData).some(value => value !== '');
        setDataChanged(hasChanges);
    }, [dailyWorkData]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setDailyWorkData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        try {
            const response = await fetch('/path/to/your/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(dailyWorkData),
            });

            const data = await response.json();

            if (response.ok) {
                setProcessing(false);
                closeModal();
                toast.success('Task added successfully!');
            } else {
                setProcessing(false);
                setErrors(data.errors);
                toast.error('Failed to add task.');
            }
        } catch (error) {
            setProcessing(false);
            toast.error('An unexpected error occurred.');
        }
    };

    return (
        <GlassDialog open={open} onClose={closeModal}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                <Typography>Add Task</Typography>
                <IconButton
                    variant="outlined"
                    color="primary"
                    onClick={closeModal}
                    sx={{ position: 'absolute', top: 8, right: 16 }}
                >
                    <ClearIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="RFI Date"
                                type="date"
                                name="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={dailyWorkData.date}
                                onChange={handleChange}
                                error={Boolean(errors.date)}
                                helperText={errors.date}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="RFI Number"
                                name="number"
                                fullWidth
                                value={dailyWorkData.number}
                                onChange={handleChange}
                                error={Boolean(errors.number)}
                                helperText={errors.number}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Planned Time"
                                type="time"
                                name="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={dailyWorkData.time}
                                onChange={handleChange}
                                error={Boolean(errors.time)}
                                helperText={errors.time}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Type"
                                name="type"
                                fullWidth
                                value={dailyWorkData.type}
                                onChange={handleChange}
                                error={Boolean(errors.type)}
                                helperText={errors.type}
                            >
                                <MenuItem value="Structure">Structure</MenuItem>
                                <MenuItem value="Embankment">Embankment</MenuItem>
                                <MenuItem value="Pavement">Pavement</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Location"
                                name="location"
                                fullWidth
                                value={dailyWorkData.location}
                                onChange={handleChange}
                                error={Boolean(errors.location)}
                                helperText={errors.location}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Description"
                                name="description"
                                fullWidth
                                value={dailyWorkData.description}
                                onChange={handleChange}
                                error={Boolean(errors.description)}
                                helperText={errors.description}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Road Type"
                                name="side"
                                fullWidth
                                value={dailyWorkData.side}
                                onChange={handleChange}
                                error={Boolean(errors.side)}
                                helperText={errors.side}
                            >
                                <MenuItem value="SR-R">SR-R</MenuItem>
                                <MenuItem value="SR-L">SR-L</MenuItem>
                                <MenuItem value="TR-R">TR-R</MenuItem>
                                <MenuItem value="TR-L">TR-L</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Quantity/Layer No."
                                name="qty_layer"
                                fullWidth
                                value={dailyWorkData.qty_layer}
                                onChange={handleChange}
                                error={Boolean(errors.qty_layer)}
                                helperText={errors.qty_layer}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Completion Date/Time"
                                type="datetime-local"
                                name="completion_time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={dailyWorkData.completion_time}
                                onChange={handleChange}
                                error={Boolean(errors.completion_time)}
                                helperText={errors.completion_time}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Status"
                                name="status"
                                fullWidth
                                value={dailyWorkData.status}
                                onChange={handleChange}
                                error={Boolean(errors.status)}
                                helperText={errors.status}
                            >
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="resubmission">Resubmission</MenuItem>
                                <MenuItem value="emergency">Emergency</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Results"
                                name="inspection_details"
                                multiline
                                rows={3}
                                fullWidth
                                value={dailyWorkData.inspection_details}
                                onChange={handleChange}
                                error={Boolean(errors.inspection_details)}
                                helperText={errors.inspection_details}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '16px',
                    }}
                >
                    <Button
                        variant="outlined"
                        color="light"
                        onClick={closeModal}
                    >
                        Close
                    </Button>
                    <LoadingButton
                        disabled={!dataChanged}
                        variant="contained"
                        color="success"
                        type="submit"
                        loading={processing}
                    >
                        Add Task
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default DailyWorkForm;
