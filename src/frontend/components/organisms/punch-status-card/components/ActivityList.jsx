/**
 * Activity List Component
 * 
 * Displays list of today's punch activities.
 */

import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Typography,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { punchStatusUtils } from '../utils';

export const ActivityList = ({ punches, theme }) => {
  if (punches.length === 0) {
    return (
      <Box sx={{ px: 2, pb: 2 }}>
        <Alert 
          severity="info" 
          sx={{ 
            background: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            backdropFilter: 'blur(16px) saturate(200%)',
            fontSize: '0.8rem'
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            No activity recorded today
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <List sx={{ p: 0 }}>
        {punches.map((punch, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                  <Schedule sx={{ fontSize: 14 }} />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      In: {punchStatusUtils.formatTime(punch.punchin_time || punch.punch_in_time || punch.time_in)}
                    </Typography>
                    {(punch.punchout_time || punch.punch_out_time || punch.time_out) && (
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        Out: {punchStatusUtils.formatTime(punch.punchout_time || punch.punch_out_time || punch.time_out)}
                      </Typography>
                    )}
                    {punch.duration && (
                      <Chip 
                        label={punch.duration} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    📍 {(punch.punchin_location || punch.location || 'Location not available').substring(0, 30)}...
                  </Typography>
                }
              />
            </ListItem>
            {index < punches.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};
