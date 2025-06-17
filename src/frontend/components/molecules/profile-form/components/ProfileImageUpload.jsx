/**
 * Profile Image Upload Component
 * 
 * Handles profile image upload with crop functionality,
 * validation, and preview capabilities.
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Button,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  Edit,
  Person
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * ProfileImageUpload Component
 */
export const ProfileImageUpload = ({
  imagePreview = null,
  imageError = null,
  isUploading = false,
  onImageSelect = () => {},
  onImageCrop = () => {},
  onClearImage = () => {},
  disabled = false,
  config = {}
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * Handle file input change
   */
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Image Preview/Upload Area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: isDragOver ? 
            theme.palette.action.hover : 
            'transparent',
          transition: 'all 0.3s ease',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {/* Loading Overlay */}
        {isUploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)',
              borderRadius: 2,
              zIndex: 1
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Avatar Display */}
        <Avatar
          src={imagePreview}
          sx={{
            width: config.dimensions?.maxWidth / 8 || 120,
            height: config.dimensions?.maxHeight / 8 || 120,
            mb: 2,
            border: `3px solid ${theme.palette.primary.main}`,
            boxShadow: theme.shadows[4]
          }}
        >
          <Person sx={{ fontSize: 48 }} />
        </Avatar>

        {/* Upload Instructions */}
        {!imagePreview ? (
          <Box textAlign="center">
            <Typography variant="subtitle1" gutterBottom>
              Upload Profile Picture
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Drag and drop an image here, or click to select
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Max size: {formatFileSize(config.maxSize || 5242880)}
              <br />
              Formats: {config.allowedTypes?.join(', ') || 'JPEG, PNG, WebP'}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Click to change image
          </Typography>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Tooltip title="Upload new image">
            <IconButton
              color="primary"
              disabled={disabled || isUploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <PhotoCamera />
            </IconButton>
          </Tooltip>

          {imagePreview && (
            <>
              <Tooltip title="Edit image">
                <IconButton
                  color="secondary"
                  disabled={disabled || isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageCrop();
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>

              <Tooltip title="Remove image">
                <IconButton
                  color="error"
                  disabled={disabled || isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearImage();
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={config.allowedTypes?.join(',') || 'image/*'}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled || isUploading}
        />
      </Box>

      {/* Error Display */}
      {imageError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {imageError}
          </Typography>
        </Alert>
      )}

      {/* Image Guidelines */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          <strong>Image Guidelines:</strong>
          <br />
          • Recommended size: {config.dimensions?.minWidth || 200} x {config.dimensions?.minHeight || 200} pixels minimum
          <br />
          • File size must be under {formatFileSize(config.maxSize || 5242880)}
          <br />
          • Use a clear, professional headshot for best results
        </Typography>
      </Box>
    </Box>
  );
};
