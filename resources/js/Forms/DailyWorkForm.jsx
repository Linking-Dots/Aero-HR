import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle, FormControl, FormHelperText,
    Grid,
    IconButton, InputLabel,
    MenuItem, Select,
    TextField,
    Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import GlassDialog from '@/Components/GlassDialog.jsx';
import {useTheme} from "@mui/material/styles";

const DailyWorkForm = ({ open, closeModal, currentRow, setDailyWorks}) => {
    const theme = useTheme();
    const [dailyWorkData, setDailyWorkData] = useState({
        id: currentRow.id || '',
        date: currentRow.date || '',
        number: currentRow.number || '',
        planned_time: currentRow.planned_time || '',
        type: currentRow.type || 'Structure',
        location: currentRow.location || '',
        description: currentRow.description || '',
        side: currentRow.side || 'SR-R',
        qty_layer: currentRow.qty_layer || '',
    });
    console.log(dailyWorkData)

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

    async function handleSubmit(event) {
        event.preventDefault();
        setProcessing(true);
        const promise = new Promise(async (resolve, reject) => {
            try {

                const response = await fetch(route('dailyWorks.update'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        ruleSet: 'details',
                        ...dailyWorkData
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    setDailyWorks(prevWorks => prevWorks.map(work =>
                        work.id === dailyWorkData.id ? { ...work, ...dailyWorkData } : work
                    ));


                    closeModal();
                    resolve(data.message ? [data.message] : data.messages);
                    setProcessing(false);
                    closeModal();
                    console.log(data.message ? [data.message] : data.messages);
                } else {
                    setProcessing(false);
                    setErrors(data.errors);
                    reject(data.errors);
                    console.error(data.errors);
                }
            } catch (error) {
                setProcessing(false);
                closeModal();
                console.log(error)
                reject(['An unexpected error occurred.']);
            }
        });

        toast.promise(
            promise,
            {
                pending: {
                    render() {
                        return (
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <CircularProgress/>
                                <span style={{marginLeft: '8px'}}>Updating daily work ...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                success: {
                    render({data}) {
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
                    },
                    icon: '🟢',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                },
                error: {
                    render({data}) {
                        return (
                            <>
                                {data.map((message, index) => (
                                    <div key={index}>{message}</div>
                                ))}
                            </>
                        );
                    },
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary
                    }
                }
            }
        );
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
                                name="planned_time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={dailyWorkData.planned_time}
                                onChange={handleChange}
                                error={Boolean(errors.planned_time)}
                                helperText={errors.planned_time}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="type-label">Type</InputLabel>
                                <Select
                                    select
                                    label="Type"
                                    name="type"
                                    fullWidth
                                    value={dailyWorkData.type}
                                    onChange={handleChange}
                                    error={Boolean(errors.type)}
                                    helperText={errors.type}
                                    labelId="type-label"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backdropFilter: 'blur(16px) saturate(200%)',
                                                backgroundColor: theme.glassCard.backgroundColor,
                                                border: theme.glassCard.border,
                                                borderRadius: 2,
                                                boxShadow:
                                                    'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="Structure">Structure</MenuItem>
                                    <MenuItem value="Embankment">Embankment</MenuItem>
                                    <MenuItem value="Pavement">Pavement</MenuItem>
                                </Select>
                                <FormHelperText>{errors.type}</FormHelperText>
                            </FormControl>
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
                    <LoadingButton
                        disabled={!dataChanged}
                        sx={{
                            borderRadius: '50px',
                            padding: '6px 16px',
                        }}
                        variant="outlined"
                        color="primary"
                        type="submit"
                        loading={processing}
                    >
                        Submit
                    </LoadingButton>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default DailyWorkForm;
