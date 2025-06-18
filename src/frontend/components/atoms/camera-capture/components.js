/**
 * Camera Capture Components
 * Sub-components for camera functionality
 */

import React from 'react';

export const CameraPreview = ({ videoRef, isActive }) => {
    if (!isActive) return null;
    
    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto rounded-lg"
        />
    );
};

export const CameraOverlay = ({ timestamp, location }) => {
    return (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
            {timestamp && <div>{timestamp}</div>}
            {location && (
                <div>
                    Lat: {location.latitude?.toFixed(6)}, 
                    Lng: {location.longitude?.toFixed(6)}
                </div>
            )}
        </div>
    );
};
