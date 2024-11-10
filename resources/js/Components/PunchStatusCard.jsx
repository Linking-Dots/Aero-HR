import React, {useEffect, useState} from 'react';
import {Box, CardContent, CardHeader, Chip, CircularProgress, Collapse, Grid, Typography} from '@mui/material';
import {usePage} from "@inertiajs/react";
import {toast} from "react-toastify";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import {useTheme} from "@mui/material/styles";
import L from "leaflet";



const PunchStatusCard = ({handlePunchSuccess }) => {
    const [position, setPosition] = useState(null);
    const [punched, setPunched] = useState(null);

    const theme = useTheme();
    const { auth } = usePage().props;
    const [attendanceData, setAttendanceData] = useState('');
    const [punchInTime, setPunchInTime] = useState('');
    const [punchOutTime, setPunchOutTime] = useState('');
    const [elapsedTime, setElapsedTime] = useState(null);

    const { todayLeaves } = usePage().props;
    const isUserOnLeave = todayLeaves.find(leave => String(leave.user_id) === String(auth.user.id));
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
    const handleLocationError = (error, reject) => {
        console.log('Location error:', error);
        if (error.code === error.PERMISSION_DENIED) {
            toast.error('Location permission denied. Please enable location services in your browser settings and try again.', {
                icon: '🔴',
                style: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    color: theme.palette.text.primary,
                }
            });
        } else {
            toast.error('Unable to retrieve location. Please try again.', {
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
    const processPunch = async (action) => {
        const promise = new Promise(async (resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const position = L.latLng(pos.coords.latitude, pos.coords.longitude);
                        console.log(`Location retrieved: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`);

                        const endpoint = action === 'punchin' ? '/punchIn' : '/punchOut';
                        const startLocation = { lat: 23.987057, lng: 90.361908 };
                        const endLocation = { lat: 23.690618, lng: 90.546729 };

                        // Use L.Routing.OSRMv1 to calculate the route without displaying it
                        const router = new L.Routing.OSRMv1();
                        router.route(
                            [
                                L.Routing.waypoint(L.latLng(startLocation)),
                                L.Routing.waypoint(L.latLng(endLocation))
                            ],
                            async (error, routes) => {
                                if (error || routes.length === 0) {
                                    console.error("Routing error:", error);
                                    reject(["Failed to calculate route."]);
                                    return;
                                }

                                const routeCoordinates = routes[0].coordinates;

                                // Check if the user's location is within 500 meters of any point on the route
                                const tolerance = 200;  // 500 meters
                                if (!isPointOnRoute(routeCoordinates, position, tolerance)) {
                                    reject(['You are out of the project area.']);
                                    return;
                                }

                                // Send the punch request
                                try {
                                    const response = await axios.post(endpoint, {
                                        user_id: auth.user.id,
                                        location: `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`,
                                    });

                                    if (response.status === 200) {
                                        await fetchData();
                                        handlePunchSuccess();
                                        resolve([response.data.success ? response.data.message : 'Punch completed successfully']);
                                    } else {
                                        reject(['Failed to set attendance. Please try again.']);
                                    }
                                } catch (error) {
                                    console.log(error);
                                    reject([error.response?.data?.message || 'Failed to set attendance. Please try again.']);
                                }
                            }
                        );
                    },
                    (error) => {
                        handleLocationError(error);
                        reject([`Error retrieving location: ${error.message}`]);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            } else {
                toast.error('Geolocation is not supported by this browser.', {
                    icon: '🔴',
                    style: {
                        backdropFilter: 'blur(16px) saturate(200%)',
                        backgroundColor: theme.glassCard.backgroundColor,
                        border: theme.glassCard.border,
                        color: theme.palette.text.primary,
                    },
                });
                reject(['Geolocation is not supported by this browser.']);
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
                                <span style={{ marginLeft: '8px' }}>{action === 'punchin' ? 'Punching in...' : 'Punching out...'}</span>
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

// Utility function to check if the user's position is within the route
    function isPointOnRoute(routeCoordinates, targetPoint, tolerance) {
        for (let coord of routeCoordinates) {
            let routeLatLng = L.latLng(coord.lat, coord.lng);
            if (targetPoint.distanceTo(routeLatLng) < tolerance) {
                return true;
            }
        }
        return false;
    }

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

    useEffect(() => {
        if (punched) {
            processPunch(punched);
        }
    }, [punched]);

    return (
        <Box sx={{ display: 'flex', height: '100%', justifyContent: 'center', p: 2}}>
            <Grow in>
                <GlassCard>
                    <CardHeader
                        title={
                            <Typography sx={{ fontSize: { xs: '1.0rem', sm: '1.4rem', md: '1.8rem' } }}>
                                Today's Punch Status
                            </Typography>
                        }
                    />
                    <CardContent>
                        {
                            isUserOnLeave ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography color="error" sx={{ fontSize: { xs: '1.0rem', sm: '1.2rem', md: '1.4rem' } }}>{"You are on " + isUserOnLeave.leave_type + " leave today."}</Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            p: 2,
                                            backdropFilter: 'blur(16px) saturate(200%)',
                                            borderRadius: '25px',
                                            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                                        }}
                                    >
                                        <Typography variant="body2" id="punch-in">
                                            {punchInTime ? 'Punched In At' : 'Not Yet Punched In'}
                                        </Typography>
                                        <Collapse in={!!punchInTime} timeout={1000}>
                                            <Typography variant="h6">
                                                {punchInTime}
                                            </Typography>
                                        </Collapse>
                                    </Box>
                                    <Box  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Grow in timeout={1000}>
                                            <Box
                                                onClick={() => {
                                                    if (!punchInTime) {
                                                        setPunched('punchin');
                                                    } else if (punchInTime && !punchOutTime) {
                                                        setPunched('punchout');
                                                    }
                                                }}
                                                sx={{
                                                    m: 4,
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
                                                    cursor: punchInTime && punchOutTime ? 'not-allowed' : 'pointer',
                                                    borderRadius: '50%', // Make the box circular
                                                    pointerEvents: punchInTime && punchOutTime ? 'none' : 'auto',
                                                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                                                }}
                                            >
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="body1">
                                                        <span>
                                                            {!punchInTime ? 'Punch In' : `${elapsedTime}`} {punchInTime && <><br />hrs</>}
                                                        </span>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grow>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 2,
                                            backdropFilter: 'blur(16px) saturate(200%)',
                                            borderRadius: '25px',
                                            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
                                        }}
                                    >
                                        <Typography variant="body2" id="punch-out">
                                            {punchOutTime ? 'Punched Out At' : 'Not Yet Punched Out'}
                                        </Typography>
                                        <Collapse in={!!punchOutTime} timeout={1000}>
                                            <Typography variant="h6" id="punch-out-time">
                                                {punchOutTime}
                                            </Typography>
                                        </Collapse>
                                    </Box>
                                </>
                            )
                        }


                    </CardContent>
                </GlassCard>
            </Grow>
        </Box>
    );
};

export default PunchStatusCard;
