import { useState, useCallback, useRef } from 'react';

/**
 * useFileUpload Hook
 * 
 * Advanced file upload management with:
 * - File validation (type, size)
 * - Upload progress tracking
 * - Preview generation
 * - Error handling
 * - Cleanup management
 */
const useFileUpload = ({
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'],
  onUploadComplete,
  onUploadError,
  onUploadProgress,
  autoUpload = false,
  uploadEndpoint = '/api/upload'
}) => {
  // State management
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  
  // Refs for cleanup
  const previewUrlRef = useRef(null);
  const uploadAbortController = useRef(null);

  // Validate file
  const validateFile = useCallback((file) => {
    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`);
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB.`);
    }

    // Check if file is actually an image (for image uploads)
    if (allowedTypes.some(type => type.startsWith('image/')) && !file.type.startsWith('image/')) {
      errors.push('Selected file is not a valid image.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [allowedTypes, maxSize]);

  // Generate preview URL
  const generatePreview = useCallback((file) => {
    // Cleanup previous preview
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    // Generate new preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);
      return url;
    }

    setPreviewUrl(null);
    return null;
  }, []);

  // Upload file to server
  const uploadFile = useCallback(async (file) => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Create abort controller for cancellation
    uploadAbortController.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('maxSize', maxSize);
      formData.append('allowedTypes', allowedTypes.join(','));

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        signal: uploadAbortController.current.signal,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      
      setUploadProgress(100);
      setIsUploading(false);
      
      onUploadComplete?.(file, result.url || result.path);
      
      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Upload cancelled');
        return null;
      }

      console.error('Upload error:', error);
      setUploadError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
      
      onUploadError?.(error);
      throw error;
    }
  }, [maxSize, allowedTypes, uploadEndpoint, onUploadComplete, onUploadError, onUploadProgress]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file, customError = null) => {
    // Clear previous state
    setUploadError(null);
    setUploadProgress(0);

    // Handle custom error
    if (customError) {
      setUploadError(customError);
      return;
    }

    if (!file) {
      setUploadedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.errors.join(' '));
      return;
    }

    // Set file and generate preview
    setUploadedFile(file);
    generatePreview(file);

    // Auto-upload if enabled
    if (autoUpload) {
      try {
        await uploadFile(file);
      } catch (error) {
        // Error already handled in uploadFile
      }
    }
  }, [validateFile, generatePreview, autoUpload, uploadFile]);

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    // Cleanup preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    // Cancel ongoing upload
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }

    // Reset state
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  }, []);

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  // Manual upload trigger
  const triggerUpload = useCallback(async () => {
    if (!uploadedFile) {
      throw new Error('No file selected for upload');
    }

    return await uploadFile(uploadedFile);
  }, [uploadedFile, uploadFile]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    cleanup();
    setUploadedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
  }, [cleanup]);

  // Get file info
  const getFileInfo = useCallback(() => {
    if (!uploadedFile) return null;

    return {
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      lastModified: uploadedFile.lastModified,
      sizeFormatted: formatFileSize(uploadedFile.size)
    };
  }, [uploadedFile]);

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    // State
    uploadedFile,
    uploadProgress,
    isUploading,
    previewUrl,
    uploadError,

    // Actions
    handleFileSelect,
    handleFileRemove,
    triggerUpload,
    cancelUpload,
    reset,
    cleanup,

    // Utilities
    validateFile,
    getFileInfo,
    formatFileSize,

    // Status
    hasFile: Boolean(uploadedFile),
    hasPreview: Boolean(previewUrl),
    hasError: Boolean(uploadError),
    isComplete: uploadProgress === 100 && !isUploading
  };
};

export default useFileUpload;
