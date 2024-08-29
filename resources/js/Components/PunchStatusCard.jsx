import React, {useEffect, useState} from 'react';
import {Box, CardContent, CircularProgress, Collapse, Typography} from '@mui/material';
import {usePage} from "@inertiajs/react";
import {toast} from "react-toastify";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import {useTheme} from "@mui/material/styles";


const PunchStatusCard = () => {
    const theme = useTheme();
    const { auth } = usePage().props;
    const [attendanceData, setAttendanceData] = useState('');
    const [punchInTime, setPunchInTime] = useState('');
    const [punchOutTime, setPunchOutTime] = useState('');
    const [elapsedTime, setElapsedTime] = useState(null);


    const fetchData = async () => {
        const endpoint = route('getCurrentUserPunch');
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            setAttendanceData(data);
            if (data.punchin_time) {
                setPunchInTime(new Date(`${data.date}T${data.punchin_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }));
            } else {
                setPunchInTime('');
            }

            if (data.punchout_time) {
                setPunchOutTime(new Date(`${data.date}T${data.punchout_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }));
            } else {
                setPunchOutTime('');
            }
        } catch (error) {
            console.error('Error fetching user attendance:', error);
        }
    };
    const parseTimeString = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds, 0);
        return date;
    };
    const calculateElapsedTime = () => {
        if (!punchInTime) return '00:00:00';
        const punchIn = parseTimeString(attendanceData.punchin_time);
        const endTime = punchOutTime ? parseTimeString(attendanceData.punchout_time) : new Date();
        const elapsedTime = Math.abs(endTime - punchIn);
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    const handlePunch = async (action) => {

        const promise = new Promise(async (resolve, reject) => {
            try {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    const endpoint = action === 'punchin' ? 'punchin' : 'punchout';

                    const response = await fetch(route(endpoint), {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]').content,
                        },
                        body: JSON.stringify({
                            user_id: auth.user.id,
                            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        resolve([data.success ? data.message : '']);
                        await fetchData();
                    } else {
                        reject(['Failed to set attendance. Please try again.']);
                    }
                }, (error) => {
                    console.log(error)
                    reject([error.message]);
                });
            } catch (error) {
                console.error('Error setting attendance:', error);
                reject(['An unexpected error occurred.']);
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
                                <span style={{ marginLeft: '8px' }}>Punching{action === 'punchin' ? ' in' : ' out'}...</span>
                            </div>
                        );
                    },
                    icon: false,
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    }
                },
                success: {
                    render({ data }) {
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
                        color: theme.palette.text.primary,
                    }
                },
                error: {
                    render({ data }) {
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
                        color: theme.palette.text.primary,
                    }
                }
            }
        );
    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setElapsedTime(calculateElapsedTime());
    }, [elapsedTime,attendanceData, punchInTime, punchOutTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(calculateElapsedTime());
        }, 1000);
        return () => clearInterval(interval);
    }, [elapsedTime,attendanceData, punchInTime, punchOutTime]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Grow in>
                <GlassCard>
                    <CardContent>
                        <Box className="mb-4" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5">
                                Timesheet {new Date().toDateString()}
                            </Typography>
                        </Box>
                        <Box className="card-animate" sx={{
                            my: 2,
                            padding: '10px 15px',
                            backdropFilter: 'blur(16px) saturate(200%)',
                            border: '1px solid rgba(255, 255, 255, 0.125)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            borderRadius: '20px',
                            minWidth: '0px',
                            wordWrap: 'break-word',
                            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                            backgroundClip: 'border-box',
                        }}>
                            <Typography variant="body2" id="punch-in">
                                {punchInTime ? 'Punched In At' : 'Not Yet Punched In'}
                            </Typography>
                            <Collapse in={!!punchInTime} timeout={1000}>
                                <Typography variant="h6" id="punch-in-time">
                                    {punchInTime}
                                </Typography>
                            </Collapse>
                        </Box>
                        <Box  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Grow in timeout={1000}>
                                <Box
                                    className="card-animate"
                                    onClick={() => {
                                        if (!punchInTime) {
                                            handlePunch('punchin');
                                        } else if (punchInTime && !punchOutTime) {
                                            handlePunch('punchout');
                                        }
                                    }}
                                    sx={{
                                        backdropFilter: 'blur(16px) saturate(200%)',
                                        backgroundColor: !punchInTime ? 'rgba(0, 128, 0, 0.3)' :
                                            punchInTime && !punchOutTime ? 'rgba(255, 0, 0, 0.3)' :
                                                punchInTime && punchOutTime ? 'rgba(0, 0, 255, 0.3)' : '', // Color based on punch states
                                        border: '5px solid rgba(255, 255, 255, 0.125)',
                                        width: 100,
                                        height: 100,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderColor: 'inherit',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        minWidth: '0px',
                                        wordWrap: 'break-word',
                                        cursor: punchInTime && punchOutTime ? 'not-allowed' : 'pointer',
                                        borderRadius: '50%', // Make the box circular
                                        pointerEvents: punchInTime && punchOutTime ? 'none' : 'auto',
                                    }}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body1">
                                            {!punchInTime ? (
                                                <span>Punch In</span>
                                            ) : !punchOutTime ? (
                                                <span>{elapsedTime} <br/>hrs</span>
                                            ) : (
                                                <span>{elapsedTime} <br/>hrs</span>
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grow>
                        </Box>
                        <Box className="card-animate" sx={{
                            my: 2,
                            padding: '10px 15px',
                            backdropFilter: 'blur(16px) saturate(200%)',
                            border: '1px solid rgba(255, 255, 255, 0.125)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            borderRadius: '20px',
                            minWidth: '0px',
                            wordWrap: 'break-word',
                            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                            backgroundClip: 'border-box',
                        }}>
                            <Typography variant="body2" id="punch-out">
                                {punchOutTime ? 'Punched Out At' : 'Not Yet Punched Out'}
                            </Typography>
                            <Collapse in={!!punchOutTime} timeout={1000}>
                                <Typography variant="h6" id="punch-out-time">
                                    {punchOutTime}
                                </Typography>
                            </Collapse>
                        </Box>
                    </CardContent>
                </GlassCard>
            </Grow>
        </Box>
    );
};

export default PunchStatusCard;
