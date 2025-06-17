/**
 * useProfileImageUpload Hook
 * 
 * Custom hook for handling profile image upload, validation,
 * cropping, and preview functionality.
 */

import { useState, useCallback, useRef } from 'react';

/**
 * useProfileImageUpload Hook
 */
export const useProfileImageUpload = ({
  initialImage = null,
  config = {}
}) => {
  // State management
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [imageError, setImageError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cropData, setCropData] = useState(null);
  
  // Refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  /**
   * Validate image file
   */
  const validateImage = useCallback((file) => {
    const errors = [];
    
    // Check file type
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (config.maxSize && file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [config]);

  /**
   * Create image preview
   */
  const createPreview = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          // Check dimensions
          if (config.dimensions) {
            const { minWidth, minHeight, maxWidth, maxHeight } = config.dimensions;
            
            if (minWidth && img.width < minWidth) {
              reject(new Error(`Image width must be at least ${minWidth}px`));
              return;
            }
            
            if (minHeight && img.height < minHeight) {
              reject(new Error(`Image height must be at least ${minHeight}px`));
              return;
            }
            
            if (maxWidth && img.width > maxWidth) {
              reject(new Error(`Image width must be less than ${maxWidth}px`));
              return;
            }
            
            if (maxHeight && img.height > maxHeight) {
              reject(new Error(`Image height must be less than ${maxHeight}px`));
              return;
            }
          }
          
          resolve(event.target.result);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = event.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }, [config]);

  /**
   * Handle image selection
   */
  const handleImageSelect = useCallback(async (file) => {
    setImageError(null);
    setIsUploading(true);
    
    try {
      // Validate file
      const validation = validateImage(file);
      if (!validation.isValid) {
        setImageError(validation.errors.join('. '));
        return;
      }
      
      // Create preview
      const preview = await createPreview(file);
      
      setImageFile(file);
      setImagePreview(preview);
      
    } catch (error) {
      setImageError(error.message);
      setImageFile(null);
      setImagePreview(initialImage);
    } finally {
      setIsUploading(false);
    }
  }, [validateImage, createPreview, initialImage]);

  /**
   * Handle image cropping
   */
  const handleImageCrop = useCallback(async (cropArea = null) => {
    if (!imageFile || !imagePreview) return;
    
    try {
      setIsUploading(true);
      
      // If no crop area provided, open crop dialog
      if (!cropArea) {
        // This would typically open a crop modal/dialog
        // For now, we'll just log that cropping was requested
        console.log('Crop dialog would open here');
        return;
      }
      
      // Apply crop using canvas
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = imageRef.current || new Image();
      
      if (!imageRef.current) {
        img.src = imagePreview;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
      }
      
      // Set canvas dimensions
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      // Draw cropped image
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now()
          });
          
          setImageFile(croppedFile);
          setImagePreview(canvas.toDataURL());
          setCropData(cropArea);
        }
      }, imageFile.type);
      
    } catch (error) {
      setImageError('Failed to crop image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  }, [imageFile, imagePreview]);

  /**
   * Clear image
   */
  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(initialImage);
    setImageError(null);
    setCropData(null);
  }, [initialImage]);

  /**
   * Reset to original image
   */
  const resetImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(initialImage);
    setImageError(null);
    setCropData(null);
  }, [initialImage]);

  /**
   * Get optimized image for upload
   */
  const getOptimizedImage = useCallback(async (quality = 0.9) => {
    if (!imageFile) return null;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate optimal dimensions
          let { width, height } = img;
          const maxDimension = Math.max(config.dimensions?.maxWidth || 1024, config.dimensions?.maxHeight || 1024);
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], imageFile.name, {
                  type: imageFile.type,
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                resolve(imageFile);
              }
            },
            imageFile.type,
            quality
          );
        };
        
        img.src = imagePreview;
      });
    } catch (error) {
      console.error('Failed to optimize image:', error);
      return imageFile;
    }
  }, [imageFile, imagePreview, config]);

  return {
    // State
    imageFile,
    imagePreview,
    imageError,
    isUploading,
    cropData,
    
    // Actions
    handleImageSelect,
    handleImageCrop,
    clearImage,
    resetImage,
    validateImage,
    getOptimizedImage,
    
    // Refs for advanced usage
    canvasRef,
    imageRef
  };
};
