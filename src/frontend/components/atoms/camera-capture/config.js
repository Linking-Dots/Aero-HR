/**
 * Camera Capture Configuration
 * 
 * Configuration settings for the CameraCapture atom including
 * video constraints, canvas settings, and metadata options.
 */

// Video stream constraints
export const VIDEO_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment' // Use back camera on mobile
  },
  audio: false
};

// Canvas and image settings
export const CANVAS_CONFIG = {
  imageFormat: 'image/jpeg',
  quality: 0.8,
  overlaySettings: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    textColor: '#ffffff',
    font: '20px Arial',
    padding: 10,
    height: 60
  }
};

// Geolocation settings
export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000
};

// Camera capture configuration
export const CAMERA_CAPTURE_CONFIG = {
  video: VIDEO_CONSTRAINTS,
  canvas: CANVAS_CONFIG,
  geolocation: GEOLOCATION_CONFIG,
  
  // UI settings
  ui: {
    videoStyle: {
      width: '100%',
      maxWidth: '500px',
      borderRadius: '8px',
      objectFit: 'cover'
    },
    canvasStyle: {
      display: 'none'
    },
    buttonStyle: {
      marginTop: '16px',
      marginRight: '8px'
    }
  },

  // Error messages
  errorMessages: {
    CAMERA_NOT_SUPPORTED: 'Camera not supported in this browser',
    PERMISSION_DENIED: 'Camera permission denied',
    CAMERA_NOT_FOUND: 'No camera found',
    GEOLOCATION_ERROR: 'Unable to get location',
    CAPTURE_FAILED: 'Failed to capture photo'
  },

  // Accessibility settings
  accessibility: {
    videoLabel: 'Camera preview',
    startButtonLabel: 'Start camera',
    captureButtonLabel: 'Capture photo',
    stopButtonLabel: 'Stop camera'
  },

  // Performance settings
  performance: {
    maxRetries: 3,
    retryDelay: 1000,
    streamTimeout: 15000
  }
};

/**
 * Gets appropriate video constraints based on device type
 */
export const getVideoConstraints = (isMobile = false) => {
  const baseConstraints = { ...VIDEO_CONSTRAINTS };
  
  if (isMobile) {
    baseConstraints.video.width = { ideal: 720 };
    baseConstraints.video.height = { ideal: 480 };
  }
  
  return baseConstraints;
};

/**
 * Formats timestamp for overlay
 */
export const formatTimestamp = (date = new Date()) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Formats coordinates for display
 */
export const formatCoordinates = (lat, lng) => {
  return `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`;
};
