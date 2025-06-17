/**
 * CameraCapture Atom Component
 * 
 * A camera capture component that provides photo capture functionality
 * with geolocation and timestamp overlay. Designed for attendance,
 * documentation, and verification purposes.
 * 
 * Features:
 * - Video stream access and management
 * - Photo capture with metadata overlay
 * - Geolocation integration
 * - Timestamp embedding
 * - Responsive design
 * - Camera permission handling
 * 
 * @component
 * @example
 * ```jsx
 * <CameraCapture
 *   onCapture={(imageBase64, metadata) => {
 *     console.log('Captured:', imageBase64, metadata);
 *   }}
 *   buttonText="Take Photo"
 *   showPreview={true}
 * />
 * ```
 */

import React from 'react';
import { useTheme } from '@mui/material/styles';

import { CameraCaptureCore } from './components';
import { useCameraCapture } from './hooks';
import { CAMERA_CAPTURE_CONFIG } from './config';

const CameraCapture = ({
  onCapture,
  buttonText = 'Open Camera',
  captureButtonText = 'Capture',
  showPreview = false,
  disabled = false,
  className = '',
  style = {}
}) => {
  const theme = useTheme();
  
  const {
    videoRef,
    canvasRef,
    streaming,
    startCamera,
    capturePhoto,
    stopCamera,
    error
  } = useCameraCapture({
    onCapture,
    config: CAMERA_CAPTURE_CONFIG
  });

  return (
    <CameraCaptureCore
      videoRef={videoRef}
      canvasRef={canvasRef}
      streaming={streaming}
      onStartCamera={startCamera}
      onCapturePhoto={capturePhoto}
      onStopCamera={stopCamera}
      buttonText={buttonText}
      captureButtonText={captureButtonText}
      showPreview={showPreview}
      disabled={disabled}
      error={error}
      theme={theme}
      className={className}
      style={style}
      config={CAMERA_CAPTURE_CONFIG}
    />
  );
};

export default CameraCapture;
