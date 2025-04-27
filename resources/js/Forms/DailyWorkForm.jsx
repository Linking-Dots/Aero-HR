import React, {useEffect, useState} from 'react';
import {
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import LoadingButton from '@mui/lab/LoadingButton';
import {toast} from 'react-toastify';
import GlassDialog from '@/Components/GlassDialog.jsx';
import {useTheme} from "@mui/material/styles";
import {Button, Input, Select, SelectItem} from "@heroui/react";

const DailyWorkForm = ({ open, closeModal, currentRow, setData, modalType}) => {
    const theme = useTheme();
    const [dailyWorkData, setDailyWorkData] = useState({
        id: currentRow?.id || '',
        date: currentRow?.date || new Date().toISOString().split('T')[0],
        number: currentRow?.number || '',
        planned_time: currentRow?.planned_time || '',
        type: currentRow?.type || 'Structure',
        location: currentRow?.location || '',
        description: currentRow?.description || '',
        side: currentRow?.side || 'SR-R',
        qty_layer: currentRow?.qty_layer || '',
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
        setDataChanged(true);
    };

    async function handleSubmit(event) {
        event.preventDefault();
        setProcessing(true);
        const promise = new Promise(async (resolve, reject) => {
            try {

                const response = await axios.post(route(`dailyWorks.${modalType}`),{
                    ruleSet: 'details',
                    ...dailyWorkData
                });

                if (response.status === 200) {
                    setData(prevWorks => prevWorks.map(work =>
                        work.id === dailyWorkData.id ? {...work, ...dailyWorkData} : work
                    ));

                    closeModal();
                    resolve(response.data.message ? [response.data.message] : response.data.messages);
                    setProcessing(false);
                    closeModal();
                }
            } catch (error) {
                setProcessing(false);
                // setErrors(error.response.data.errors);
                console.error(error)
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
                            <Input
                                variant={"underlined"}
                                label="RFI Date"
                                type="date"
                                name="date"
                                fullWidth
                                value={dailyWorkData.date}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.date)}
                                errorMessage={errors.date}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                variant={"underlined"}
                                label="RFI Number"
                                name="number"
                                fullWidth
                                value={dailyWorkData.number}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.number)}
                                errorMessage={errors.number}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                variant={"underlined"}
                                label="Planned Time"
                                name="planned_time"
                                fullWidth
                                value={dailyWorkData.planned_time}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.planned_time)}
                                errorMessage={errors.planned_time}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Select
                                variant={'underlined'}
                                label="Type"
                                name="type"
                                fullWidth
                                value={dailyWorkData.type}
                                isInvalid={Boolean(errors.type)}
                                errorMessage={errors.type}
                                labelId="type-label"
                                selectedKeys={[dailyWorkData.type]}
                                popoverProps={{
                                    classNames: {
                                        content: "bg-transparent backdrop-blur-lg border-inherit",
                                    },
                                }}
                            >
                                <SelectItem key="Structure" value="Structure">Structure</SelectItem>
                                <SelectItem key="Embankment" value="Embankment">Embankment</SelectItem>
                                <SelectItem key="Pavement" value="Pavement">Pavement</SelectItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                variant={"underlined"}
                                label="Location"
                                name="location"
                                fullWidth
                                value={dailyWorkData.location}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.location)}
                                errorMessage={errors.location}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                variant={"underlined"}
                                label="Description"
                                name="description"
                                fullWidth
                                value={dailyWorkData.description}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.description)}
                                errorMessage={errors.description}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Select
                                variant={'underlined'}
                                select="true"
                                label="Road Type"
                                name="side"
                                fullWidth
                                value={dailyWorkData.side}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.side)}
                                errorMessage={errors.side}
                                selectedKeys={[dailyWorkData.side]}
                                popoverProps={{
                                    classNames: {
                                        content: "bg-transparent backdrop-blur-lg border-inherit",
                                    },
                                }}
                            >
                                <SelectItem key="SR-R" value="SR-R">SR-R</SelectItem>
                                <SelectItem key="SR-L" value="SR-L">SR-L</SelectItem>
                                <SelectItem key="TR-R" value="TR-R">TR-R</SelectItem>
                                <SelectItem key="TR-L" value="TR-L">TR-L</SelectItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                variant={"underlined"}
                                label="Quantity/Layer No."
                                name="qty_layer"
                                fullWidth
                                value={dailyWorkData.qty_layer}
                                onChange={handleChange}
                                isInvalid={Boolean(errors.qty_layer)}
                                errorMessage={errors.qty_layer}
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
                        disabled={!dataChanged}
                        radius={'lg'}
                        variant="bordered"
                        color="primary"
                        type="submit"
                        isLoading={processing}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </form>
        </GlassDialog>
    );
};

export default DailyWorkForm;
