/**
 * Camera Capture Hooks
 * Custom hooks for camera functionality
 */

import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
    const [isActive, setIsActive] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true 
            });
            setStream(mediaStream);
            setIsActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsActive(false);
    }, [stream]);

    return {
        isActive,
        stream,
        videoRef,
        startCamera,
        stopCamera
    };
};

export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                setError(error.message);
            }
        );
    }, []);

    return {
        location,
        error,
        getCurrentLocation
    };
};
