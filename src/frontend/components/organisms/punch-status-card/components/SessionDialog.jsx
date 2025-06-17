/**
 * Session Dialog Component
 * 
 * Modal dialog showing session information after successful punch.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  Language,
  GpsFixed,
  AccessTime,
  Close
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

export const SessionDialog = ({ 
  open, 
  onClose, 
  sessionInfo, 
  theme 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backdropFilter: 'blur(20px) saturate(180%)',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.main, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 4,
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
          m: 1,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          p: 3,
          textAlign: 'center'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              color: 'white',
              background: alpha(theme.palette.common.white, 0.1)
            }
          }}
        >
          <Close />
        </IconButton>

        <CheckCircle sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Attendance Recorded
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Your attendance has been successfully captured
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Session Information Cards */}
        <Grid container spacing={2}>
          {/* IP Address Card */}
          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`
                }
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <Language sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" color="info.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                {sessionInfo.ip}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                IP Address
              </Typography>
            </Paper>
          </Grid>

          {/* GPS Accuracy Card */}
          <Grid item xs={12} sm={6}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`
                }
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <GpsFixed sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                {sessionInfo.accuracy}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                GPS Accuracy
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Timestamp */}
        <Paper
          sx={{
            mt: 2,
            p: 2,
            background: alpha(theme.palette.background.default, 0.5),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 2,
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccessTime color="primary" sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Recorded at: {sessionInfo.timestamp}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          fullWidth
          sx={{ 
            height: 48,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backdropFilter: 'blur(16px) saturate(200%)',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              transform: 'translateY(-1px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
            }
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
