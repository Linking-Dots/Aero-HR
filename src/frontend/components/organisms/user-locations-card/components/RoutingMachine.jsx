/**
 * Routing Machine Component
 * 
 * Displays interactive routes on the map using Leaflet Routing Machine.
 * Shows optimal paths between locations with turn-by-turn directions
 * and estimated travel times.
 * 
 * @component
 * @example
 * ```jsx
 * <RoutingMachine 
 *   startLocation={{ lat: 40.7128, lng: -74.0060 }}
 *   endLocation={{ lat: 40.7589, lng: -73.9851 }}
 *   theme={muiTheme}
 *   options={{
 *     show: true,
 *     color: '#1976d2',
 *     alternative: false
 *   }}
 * />
 * ```
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { alpha } from '@mui/material/styles';

/**
 * Main RoutingMachine Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.startLocation - Starting location coordinates
 * @param {number} props.startLocation.lat - Start latitude
 * @param {number} props.startLocation.lng - Start longitude
 * @param {Object} props.endLocation - Ending location coordinates
 * @param {number} props.endLocation.lat - End latitude
 * @param {number} props.endLocation.lng - End longitude
 * @param {Object} props.theme - MUI theme object for styling
 * @param {Object} props.options - Routing options
 * @param {boolean} props.options.show - Whether to show the route
 * @param {string} props.options.color - Route line color
 * @param {boolean} props.options.alternative - Show alternative routes
 * @param {boolean} props.options.interactive - Enable route interaction
 * @param {Array} props.waypoints - Additional waypoints for the route
 * @returns {null} This component renders directly to the map
 */
const RoutingMachine = ({ 
    startLocation,
    endLocation,
    theme,
    options = {},
    waypoints = []
}) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    // Default options
    const defaultOptions = {
        show: true,
        color: theme?.palette?.primary?.main || '#1976d2',
        alternative: false,
        interactive: true,
        showInstructions: false,
        showTotalDistance: true,
        showTotalTime: true,
        ...options
    };

    useEffect(() => {
        if (!map || !startLocation || !endLocation || !defaultOptions.show) {
            return;
        }

        // Validate coordinates
        const isValidCoordinate = (coord) => {
            return coord && 
                   typeof coord.lat === 'number' && 
                   typeof coord.lng === 'number' &&
                   !isNaN(coord.lat) && 
                   !isNaN(coord.lng) &&
                   Math.abs(coord.lat) <= 90 && 
                   Math.abs(coord.lng) <= 180;
        };

        if (!isValidCoordinate(startLocation) || !isValidCoordinate(endLocation)) {
            console.warn('RoutingMachine: Invalid coordinates provided');
            return;
        }

        // Create waypoints array
        const routeWaypoints = [
            L.latLng(startLocation.lat, startLocation.lng),
            ...waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
            L.latLng(endLocation.lat, endLocation.lng)
        ];

        // Create custom route marker icons
        const createRouteIcon = (type, color) => {
            const size = type === 'start' ? 12 : type === 'end' ? 12 : 8;
            const iconColor = type === 'start' ? theme?.palette?.success?.main || '#4caf50' : 
                            type === 'end' ? theme?.palette?.error?.main || '#f44336' : 
                            color;

            return L.divIcon({
                html: `
                    <div style="
                        width: ${size}px;
                        height: ${size}px;
                        background-color: ${iconColor};
                        border: 2px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ${type === 'start' || type === 'end' ? `
                            position: relative;
                            &::after {
                                content: '';
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                width: 4px;
                                height: 4px;
                                background-color: white;
                                border-radius: 50%;
                            }
                        ` : ''}
                    "></div>
                `,
                className: 'route-marker',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });
        };

        // Create routing control
        try {
            const routingControl = L.Routing.control({
                waypoints: routeWaypoints,
                routeWhileDragging: defaultOptions.interactive,
                addWaypoints: defaultOptions.interactive,
                createMarker: function(i, waypoint, n) {
                    const markerType = i === 0 ? 'start' : i === n - 1 ? 'end' : 'waypoint';
                    return L.marker(waypoint.latLng, {
                        icon: createRouteIcon(markerType, defaultOptions.color),
                        draggable: defaultOptions.interactive
                    });
                },
                lineOptions: {
                    styles: [
                        {
                            color: alpha(defaultOptions.color, 0.8),
                            weight: 6,
                            opacity: 0.7,
                            dashArray: '0'
                        }
                    ],
                    extendToWaypoints: true,
                    missingRouteTolerance: 10
                },
                show: defaultOptions.showInstructions,
                collapsible: true,
                collapsed: !defaultOptions.showInstructions,
                autoRoute: true,
                fitSelectedRoutes: false,
                showAlternatives: defaultOptions.alternative,
                altLineOptions: {
                    styles: [
                        {
                            color: alpha(theme?.palette?.grey?.[500] || '#757575', 0.6),
                            weight: 4,
                            opacity: 0.5,
                            dashArray: '10, 10'
                        }
                    ]
                },
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: 'driving', // driving, walking, cycling
                    timeout: 30000
                }),
                formatter: new L.Routing.Formatter({
                    language: 'en',
                    units: 'metric'
                }),
                plan: L.Routing.plan(routeWaypoints, {
                    createMarker: function(i, waypoint, n) {
                        const markerType = i === 0 ? 'start' : i === n - 1 ? 'end' : 'waypoint';
                        return L.marker(waypoint.latLng, {
                            icon: createRouteIcon(markerType, defaultOptions.color),
                            draggable: defaultOptions.interactive
                        });
                    },
                    geocoder: null, // Disable geocoding
                    draggableWaypoints: defaultOptions.interactive,
                    addWaypoints: defaultOptions.interactive
                })
            });

            // Event listeners
            routingControl.on('routesfound', function(e) {
                const routes = e.routes;
                const summary = routes[0].summary;
                
                if (defaultOptions.showTotalDistance || defaultOptions.showTotalTime) {
                    const distance = (summary.totalDistance / 1000).toFixed(1);
                    const time = Math.round(summary.totalTime / 60);
                    
                    console.log(`Route found: ${distance} km, ${time} minutes`);
                    
                    // Create a custom control for route info
                    if (!map._routeInfoControl) {
                        const RouteInfoControl = L.Control.extend({
                            onAdd: function(map) {
                                const div = L.DomUtil.create('div', 'route-info-control');
                                div.innerHTML = `
                                    <div style="
                                        background: ${alpha(theme?.palette?.background?.paper || '#fff', 0.95)};
                                        backdrop-filter: blur(10px);
                                        border: 1px solid ${alpha(theme?.palette?.divider || '#e0e0e0', 0.2)};
                                        border-radius: 8px;
                                        padding: 8px 12px;
                                        font-size: 12px;
                                        font-weight: 500;
                                        color: ${theme?.palette?.text?.primary || '#333'};
                                        box-shadow: 0 2px 8px ${alpha('#000', 0.1)};
                                        white-space: nowrap;
                                    ">
                                        📍 ${distance} km • ⏱️ ${time} min
                                    </div>
                                `;
                                
                                // Prevent map interaction when clicking on control
                                L.DomEvent.disableClickPropagation(div);
                                L.DomEvent.disableScrollPropagation(div);
                                
                                return div;
                            },
                            onRemove: function(map) {
                                // Clean up if needed
                            }
                        });
                        
                        map._routeInfoControl = new RouteInfoControl({ position: 'bottomright' });
                        map._routeInfoControl.addTo(map);
                    }
                }
            });

            routingControl.on('routingerror', function(e) {
                console.error('Routing error:', e.error);
            });

            // Add to map
            routingControl.addTo(map);
            routingControlRef.current = routingControl;

        } catch (error) {
            console.error('Error creating routing control:', error);
        }

        // Cleanup function
        return () => {
            if (routingControlRef.current) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (error) {
                    console.warn('Error removing routing control:', error);
                }
                routingControlRef.current = null;
            }
            
            // Remove route info control
            if (map._routeInfoControl) {
                try {
                    map.removeControl(map._routeInfoControl);
                    delete map._routeInfoControl;
                } catch (error) {
                    console.warn('Error removing route info control:', error);
                }
            }
        };

    }, [
        map, 
        startLocation?.lat, 
        startLocation?.lng, 
        endLocation?.lat, 
        endLocation?.lng,
        defaultOptions.show,
        defaultOptions.color,
        defaultOptions.alternative,
        defaultOptions.interactive,
        waypoints.length,
        theme
    ]);

    // This component renders nothing directly to React
    return null;
};

export default RoutingMachine;
