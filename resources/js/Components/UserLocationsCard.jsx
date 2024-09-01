import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, CardContent, CardHeader, CircularProgress } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { usePage } from "@inertiajs/react";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import L from 'leaflet';
import 'leaflet-routing-machine';

const RoutingMachine = ({ startLocation, endLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            L.Routing.control({
                waypoints: [
                    L.latLng(startLocation),
                    L.latLng(endLocation)
                ],
                routeWhileDragging: true,
            }).addTo(map);
        }
    }, [map, startLocation, endLocation]);

    return null;
};

const UserMarkers = ({ users }) => {
    const map = useMap();

    useEffect(() => {
        if (map && users) {
            users.map(user => {
                const userIcon = L.icon({
                    iconUrl: "assets/images/users/" + user.user_name + ".jpg",
                    iconSize: [30, 30],
                    className: 'user-icon',
                });

                const punchinPosition = user.punchin_location ? {
                    lat: parseFloat(user.punchin_location.split(',')[0]),
                    lng: parseFloat(user.punchin_location.split(',')[1]),
                } : null;

                const punchoutPosition = user.punchout_location ? {
                    lat: parseFloat(user.punchout_location.split(',')[0]),
                    lng: parseFloat(user.punchout_location.split(',')[1]),
                } : null;

                if (punchinPosition) {
                    L.marker(punchinPosition, { icon: userIcon })
                        .addTo(map)
                        .bindPopup(`Name: ${user.name}<br>Designation: ${user.designation}<br>Clockin Time: ${user.punchin_time ? new Date(`2024-06-04T${user.punchin_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "Not punched in yet"}<br>Clockout Time: ${user.punchout_time ? user.punchout_time : "Not punched out yet"}`);
                }

                if (punchoutPosition) {
                    L.marker(punchoutPosition, { icon: userIcon })
                        .addTo(map)
                        .bindPopup(`Name: ${user.name}<br>Designation: ${user.designation}<br>Clockin Time: ${user.punchin_time ? new Date(`2024-06-04T${user.punchin_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "Not punched in yet"}<br>Clockout Time: ${user.punchout_time ? new Date(`2024-06-04T${user.punchout_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "Not punched out yet"}`);
                }

                return null; // Returning null since map expects a return value
            });
        }
    }, [map, users]);

    return null;
};


const UserLocationsCard = () => {
    const [users, setUsers] = useState(null);

    const initMap = async () => {
        const endpoint = route('getUserLocationsForToday');

        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            setUsers(data);
            console.log(users)
        } catch (error) {
            console.error('Error fetching user locations:', error);
        }
    };

    useEffect(() => {
        initMap();
    }, []);

    const projectLocation = { lat: 23.879132, lng: 90.502617 };
    const startLocation = { lat: 23.987057, lng: 90.361908 };
    const endLocation = { lat: 23.690618, lng: 90.546729 };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Grow in>
                <GlassCard>
                    <CardHeader title="Users Locations" />
                    <CardContent>
                        <Box sx={{ height: '70vh', borderRadius: '20px' }}>
                            {!users ? <CircularProgress /> : (
                                <MapContainer center={projectLocation} zoom={12} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                        maxZoom={19}
                                    />
                                    <RoutingMachine startLocation={startLocation} endLocation={endLocation} />
                                    <UserMarkers users={users} />
                                </MapContainer>
                            )}
                        </Box>
                    </CardContent>
                </GlassCard>
            </Grow>
        </Box>
    );
};

export default UserLocationsCard;
