import React, {useEffect, useState} from 'react';
import {Box, CardContent, CardHeader, CircularProgress} from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import {usePage} from "@inertiajs/react";
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";


const UserLocationsCard = (props) => {
    const [map, setMap] = useState(null);
    const { auth } = usePage().props;

    const initMap = async () => {
        const projectLocation = { lat: 23.879132, lng: 90.502617 };
        const startLocation = { lat: 23.987057, lng: 90.361908 };
        const endLocation = { lat: 23.690618, lng: 90.546729 };

        const newMap = L.map('gmaps-markers').setView(projectLocation, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(newMap);

        L.marker(startLocation).addTo(newMap).bindPopup("KM-0");
        L.marker(endLocation).addTo(newMap).bindPopup("KM-48");

        L.Routing.control({
            waypoints: [
                L.latLng(startLocation),
                L.latLng(endLocation)
            ],
            routeWhileDragging: true,
        }).addTo(newMap);

        setMap(newMap);
        await fetchLocations(newMap);
    };

    const fetchLocations = async (map) => {
        const endpoint = route('getUserLocationsForToday');

        try {
            const response = await fetch(endpoint);
            const data = await response.json();

            data.forEach(user => {
                const userIcon = L.icon({
                    shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
                        <svg fill="#000000" width="36px" height="36px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <title>map-marker-solid</title>
                            <path class="clr-i-solid clr-i-solid-path-1" d="M18,2A11.79,11.79,0,0,0,6.22,13.73c0,4.67,2.62,8.58,4.54,11.43l.35.52a99.61,99.61,0,0,0,6.14,8l.76.89.76-.89a99.82,99.82,0,0,0,6.14-8l.35-.53c1.91-2.85,4.53-6.75,4.53-11.42A11.79,11.79,0,0,0,18,2Zm0,17a6.56,6.56,0,1,1,6.56-6.56A6.56,6.56,0,0,1,18,19Z"></path>
                        </svg>
                    `),
                    iconUrl: "assets/images/users/" + auth.user.user_name + ".jpg",
                    shadowSize: [56, 56], // size of the shadow
                    shadowAnchor: [28, 56],  // the same for the shadow
                    iconSize: [30, 30],
                    iconAnchor: [15, 50],
                    popupAnchor: [0, -40],
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
                        .bindPopup(`Name: ${user.first_name}<br>Designation: ${user.position}<br>Clockin Time: ${user.punchin_time ? new Date(`2024-06-04T${user.punchin_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "Not punched in yet"}<br>Clockout Time: ${user.punchout_time ? user.punchout_time : "Not punched out yet"}`);
                }

                if (punchoutPosition) {
                    L.marker(punchoutPosition, { icon: userIcon })
                        .addTo(map)
                        .bindPopup(`Name: ${user.first_name}<br>Designation: ${user.position}<br>Clockin Time: ${user.punchin_time ? new Date(`2024-06-04T${user.punchin_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "Not punched in yet"}<br>Clockout Time: ${user.punchout_time ? new Date(`2024-06-04T${user.punchout_time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "Not punched out yet"}`);
                }
            });
        } catch (error) {
            console.error('Error fetching user locations:', error);
        }
    };

    useEffect(() => {
        initMap();
    }, []);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Grow in>
                <GlassCard>
                    <CardHeader title="Users Locations" />
                    <CardContent>
                        <Box id="gmaps-markers" sx={{ height: '70vh', borderRadius: '20px', }}>
                            {!map && <CircularProgress />}
                        </Box>
                    </CardContent>
                </GlassCard>
            </Grow>
        </Box>
    );
};

export default UserLocationsCard;
