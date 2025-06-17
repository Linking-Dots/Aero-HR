/**
 * Connection Status Component
 * 
 * Displays connection status indicators.
 */

import React from 'react';
import {
  Stack,
  Chip,
  Tooltip
} from '@mui/material';
import {
  GpsFixed,
  SignalWifi4Bar,
  Security
} from '@mui/icons-material';

export const ConnectionStatus = ({ connectionStatus, locationError }) => {
  return (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      <Tooltip title={`GPS: ${connectionStatus.location ? 'Connected' : 'Disconnected'}`}>
        <Chip 
          size="small" 
          icon={<GpsFixed sx={{ fontSize: 14 }} />}
          label="GPS"
          color={connectionStatus.location ? 'success' : 'default'}
          variant={connectionStatus.location ? 'filled' : 'outlined'}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      </Tooltip>
      <Tooltip title={`Network: ${connectionStatus.network ? 'Online' : 'Offline'}`}>
        <Chip 
          size="small" 
          icon={<SignalWifi4Bar sx={{ fontSize: 14 }} />}
          label="Net"
          color={connectionStatus.network ? 'success' : 'default'}
          variant={connectionStatus.network ? 'filled' : 'outlined'}
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      </Tooltip>
      <Tooltip title="Device Security">
        <Chip 
          size="small" 
          icon={<Security sx={{ fontSize: 14 }} />}
          label="Secure"
          color="success"
          variant="filled"
          sx={{ fontSize: '0.7rem', height: 24 }}
        />
      </Tooltip>
    </Stack>
  );
};
