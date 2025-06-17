/**
 * CameraCapture Atom - Export Index
 * 
 * Main export file for the CameraCapture atom component.
 * Provides photo capture functionality with geolocation and timestamp overlay.
 */

export { default } from './CameraCapture';
export { default as CameraCapture } from './CameraCapture';

// Re-export sub-components for advanced usage
export * from './components';
export * from './hooks';
export { CAMERA_CAPTURE_CONFIG } from './config';
