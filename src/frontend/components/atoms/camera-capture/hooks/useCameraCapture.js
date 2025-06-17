/**
 * Camera Capture Custom Hook
 * 
 * Manages camera stream, photo capture, and metadata overlay functionality.
 * Handles permissions, error states, and cleanup operations.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { 
  getVideoConstraints, 
  formatTimestamp, 
  formatCoordinates 
} from '../config';

export const useCameraCapture = ({ onCapture, config }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);

  // Detect if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(config.errorMessages.CAMERA_NOT_SUPPORTED);
      }

      const constraints = getVideoConstraints(isMobile);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          const video = videoRef.current;
          const timeout = setTimeout(() => {
            reject(new Error('Video stream timeout'));
          }, config.performance.streamTimeout);

          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            video.play()
              .then(() => {
                setStreaming(true);
                resolve();
              })
              .catch(reject);
          };
        });
      }
    } catch (err) {
      console.error('Camera start error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(config.errorMessages.PERMISSION_DENIED);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(config.errorMessages.CAMERA_NOT_FOUND);
      } else {
        setError(err.message || 'Failed to start camera');
      }
    }
  }, [config, isMobile]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setStreaming(false);
  }, []);

  // Capture photo with metadata overlay
  const capturePhoto = useCallback(async () => {
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) {
        throw new Error('Canvas or video not available');
      }

      const context = canvas.getContext('2d');
      
      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get geolocation and add overlay
      const addOverlay = (position) => {
        const { overlaySettings } = config.canvas;
        const timestamp = formatTimestamp();
        
        let locationText = 'Location: Not available';
        if (position) {
          const { latitude, longitude } = position.coords;
          locationText = `Location: ${formatCoordinates(latitude, longitude)}`;
        }
        
        // Draw overlay background
        context.fillStyle = overlaySettings.backgroundColor;
        context.fillRect(
          0, 
          canvas.height - overlaySettings.height, 
          canvas.width, 
          overlaySettings.height
        );
        
        // Draw text
        context.fillStyle = overlaySettings.textColor;
        context.font = overlaySettings.font;
        context.fillText(
          `Time: ${timestamp}`, 
          overlaySettings.padding, 
          canvas.height - 35
        );
        context.fillText(
          locationText, 
          overlaySettings.padding, 
          canvas.height - 10
        );
        
        // Convert to base64
        const imageBase64 = canvas.toDataURL(
          config.canvas.imageFormat, 
          config.canvas.quality
        );
        
        // Prepare metadata
        const metadata = {
          timestamp,
          location: position ? {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          } : null,
          deviceInfo: {
            userAgent: navigator.userAgent,
            isMobile
          }
        };
        
        // Call onCapture callback
        onCapture && onCapture(imageBase64, metadata);
        
        // Stop camera after capture
        stopCamera();
      };

      // Try to get geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          addOverlay,
          (geoError) => {
            console.warn('Geolocation error:', geoError);
            addOverlay(null); // Continue without location
          },
          config.geolocation
        );
      } else {
        addOverlay(null); // Continue without location
      }
      
    } catch (err) {
      console.error('Capture error:', err);
      setError(config.errorMessages.CAPTURE_FAILED);
    }
  }, [config, onCapture, stopCamera, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    streaming,
    error,
    startCamera,
    capturePhoto,
    stopCamera
  };
};
