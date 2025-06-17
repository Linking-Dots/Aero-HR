/**
 * Camera Capture Core Component
 * 
 * The main UI component for camera capture with video preview and controls.
 */

import React from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { 
  CameraAlt as CameraIcon,
  Stop as StopIcon,
  PhotoCamera as CaptureIcon 
} from '@mui/icons-material';

export const CameraCaptureCore = ({
  videoRef,
  canvasRef,
  streaming,
  onStartCamera,
  onCapturePhoto,
  onStopCamera,
  buttonText,
  captureButtonText,
  showPreview,
  disabled,
  error,
  theme,
  className,
  style,
  config
}) => {
  return (
    <Box 
      className={className}
      style={style}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 2
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!streaming ? (
        <Button
          variant="contained"
          color="primary"
          startIcon={<CameraIcon />}
          onClick={onStartCamera}
          disabled={disabled}
          aria-label={config.accessibility.startButtonLabel}
          sx={{
            minWidth: 150,
            ...config.ui.buttonStyle
          }}
        >
          {buttonText}
        </Button>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <video
            ref={videoRef}
            style={{
              ...config.ui.videoStyle,
              border: `2px solid ${theme.palette.primary.main}`
            }}
            aria-label={config.accessibility.videoLabel}
            playsInline
            muted
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CaptureIcon />}
              onClick={onCapturePhoto}
              disabled={disabled}
              aria-label={config.accessibility.captureButtonLabel}
            >
              {captureButtonText}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<StopIcon />}
              onClick={onStopCamera}
              disabled={disabled}
              aria-label={config.accessibility.stopButtonLabel}
            >
              Stop
            </Button>
          </Box>
        </Box>
      )}
      
      <canvas
        ref={canvasRef}
        style={config.ui.canvasStyle}
        aria-hidden="true"
      />
      
      {showPreview && streaming && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Position yourself in the frame and click capture when ready
        </Typography>
      )}
    </Box>
  );
};
