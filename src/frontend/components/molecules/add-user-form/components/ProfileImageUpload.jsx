import React, { useRef, useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  LinearProgress,
  Fade,
  Tooltip,
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  CloudUpload,
  Person
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * ProfileImageUpload Component
 * 
 * Advanced file upload component for user profile images with:
 * - Drag and drop support
 * - Image preview
 * - Upload progress
 * - File validation
 * - Accessibility features
 */
const ProfileImageUpload = ({
  currentImage = null,
  previewUrl = null,
  onFileSelect,
  onFileRemove,
  isUploading = false,
  uploadProgress = 0,
  error = null,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
}) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hover, setHover] = useState(false);

  // Handle file selection from input
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  // Validate and process the selected file
  const validateAndProcessFile = (file) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      onFileSelect?.(null, `Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      onFileSelect?.(null, `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB.`);
      return;
    }

    // File is valid, process it
    onFileSelect?.(file);
  };

  // Handle click on upload area
  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle remove image
  const handleRemoveImage = (event) => {
    event.stopPropagation();
    onFileRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get display image source
  const getImageSrc = () => {
    if (previewUrl) return previewUrl;
    if (currentImage) return currentImage;
    return null;
  };

  const imageSrc = getImageSrc();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: isDragOver 
          ? `${theme.palette.primary.main}08` 
          : hover 
            ? `${theme.palette.action.hover}` 
            : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleUploadClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled}
        aria-label="Select profile image"
      />

      {/* Upload progress */}
      {isUploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1
          }}
        >
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress}
            sx={{
              borderRadius: '2px 2px 0 0',
              height: 4
            }}
          />
        </Box>
      )}

      {/* Profile Image Display */}
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={imageSrc}
          sx={{
            width: 120,
            height: 120,
            border: `3px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease',
            ...(hover && !disabled && {
              transform: 'scale(1.05)',
              boxShadow: theme.shadows[8]
            })
          }}
        >
          {!imageSrc && <Person sx={{ fontSize: 60 }} />}
        </Avatar>

        {/* Upload/Camera Icon Overlay */}
        <Fade in={hover && !disabled && !isUploading}>
          <IconButton
            sx={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              },
              boxShadow: theme.shadows[4]
            }}
            size="small"
            disabled={disabled}
            aria-label="Upload new image"
          >
            <PhotoCamera fontSize="small" />
          </IconButton>
        </Fade>

        {/* Remove Image Button */}
        {imageSrc && !isUploading && (
          <Fade in={hover && !disabled}>
            <Tooltip title="Remove image">
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark
                  },
                  boxShadow: theme.shadows[4]
                }}
                size="small"
                disabled={disabled}
                aria-label="Remove image"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Fade>
        )}
      </Box>

      {/* Upload Instructions */}
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CloudUpload 
            color={disabled ? 'disabled' : isDragOver ? 'primary' : 'action'} 
          />
          <Typography 
            variant="h6" 
            color={disabled ? 'text.disabled' : isDragOver ? 'primary' : 'text.primary'}
          >
            {isUploading ? 'Uploading...' : 'Profile Image'}
          </Typography>
        </Box>

        {!isUploading && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ opacity: disabled ? 0.5 : 1 }}
          >
            {imageSrc 
              ? 'Click to change or drag a new image' 
              : 'Click to upload or drag and drop an image'
            }
          </Typography>
        )}

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ opacity: disabled ? 0.5 : 1 }}
        >
          {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • 
          Max {Math.round(maxSize / (1024 * 1024))}MB
        </Typography>

        {isUploading && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            {uploadProgress}% uploaded
          </Typography>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 1, 
            width: '100%',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(244, 67, 54, 0.1)'
          }}
        >
          {error}
        </Alert>
      )}

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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            zIndex: 2
          }}
        >
          <Typography variant="h6" color="white">
            Processing...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProfileImageUpload;
