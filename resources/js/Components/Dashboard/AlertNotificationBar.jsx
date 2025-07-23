import React from 'react';
import { Alert, AlertTitle, Box, Typography, IconButton, Collapse } from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const AlertNotificationBar = ({ alerts = [] }) => {
    const [visibleAlerts, setVisibleAlerts] = useState(alerts.map(alert => alert.id));

    const hideAlert = (alertId) => {
        setVisibleAlerts(prev => prev.filter(id => id !== alertId));
    };

    const getAlertSeverity = (type) => {
        switch (type) {
            case 'critical': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            case 'success': return 'success';
            default: return 'info';
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'critical': return '#fee2e2';
            case 'warning': return '#fef3c7';
            case 'info': return '#dbeafe';
            case 'success': return '#d1fae5';
            default: return '#f3f4f6';
        }
    };

    if (visibleAlerts.length === 0) return null;

    return (
        <Box sx={{ mb: 3 }}>
            {alerts
                .filter(alert => visibleAlerts.includes(alert.id))
                .map((alert) => (
                <Collapse key={alert.id} in={true}>
                    <Alert
                        severity={getAlertSeverity(alert.type)}
                        sx={{
                            mb: 1,
                            backgroundColor: getAlertColor(alert.type),
                            border: `1px solid ${getAlertColor(alert.type)}`,
                            '& .MuiAlert-icon': {
                                fontSize: '1.5rem'
                            }
                        }}
                        action={
                            <IconButton
                                size="small"
                                onClick={() => hideAlert(alert.id)}
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </IconButton>
                        }
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography component="span" sx={{ fontSize: '1.2em' }}>
                                {alert.icon}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {alert.message}
                            </Typography>
                        </Box>
                    </Alert>
                </Collapse>
            ))}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Typography 
                    variant="body2" 
                    component="button"
                    sx={{ 
                        color: 'primary.main', 
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => {/* Navigate to all alerts */}}
                >
                    View All Alerts
                </Typography>
                <Typography 
                    variant="body2" 
                    component="button"
                    sx={{ 
                        color: 'text.secondary', 
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => setVisibleAlerts([])}
                >
                    Mark All as Read
                </Typography>
            </Box>
        </Box>
    );
};

export default AlertNotificationBar;
