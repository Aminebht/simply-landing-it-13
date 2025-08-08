import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Check, RotateCw } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useImageDimensions, getOptimalCropDimensions, getRecommendedDimensionsText } from '@/hooks/useImageDimensions';
import { supabase } from '@/services/supabase';
import { convertImageToWebP, getRecommendedQuality, formatFileSize, type ConversionResult } from '@/utils/imageConverter';
import { mediaService } from '@/services/media';
import { toast } from 'sonner';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  aspectRatio?: number; // width/height ratio (e.g., 16/9, 1, 4/3)
  cropWidth?: number; // desired crop width in pixels
  cropHeight?: number; // desired crop height in pixels
  minWidth?: number;
  minHeight?: number;
  containerId?: string; // ID of the container element to parse dimensions from
  autoDetectDimensions?: boolean; // automatically detect optimal dimensions
  bucket?: string; // Optional custom bucket name
  folder?: string; // Optional folder path within bucket
  imageType?: 'product' | 'avatar' | 'banner'; // Image type for quality optimization
  enableWebP?: boolean; // Enable WebP conversion, default true
  // New props for media service integration
  componentId?: string; // Component ID for media service
  fieldName?: string; // Field name for media service
  useMediaService?: boolean; // Whether to use media service for storage
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "Upload image",
  className = "",
  style = {},
  disabled = false,
  aspectRatio,
  cropWidth,
  cropHeight,
  minWidth = 150,
  minHeight = 150,
  containerId,
  autoDetectDimensions = true,
  bucket = "component-media",
  folder = "uploads",
  imageType = 'product',
  enableWebP = true,
  componentId,
  fieldName,
  useMediaService = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get optimal dimensions using the hook
  const { dimensions } = useImageDimensions(containerId);

  const getAspectRatio = useCallback(() => {
    if (aspectRatio) return aspectRatio;
    if (cropWidth && cropHeight) {
      return cropWidth / cropHeight;
    }
    return undefined;
  }, [aspectRatio, cropWidth, cropHeight]);

  // Extract storage path from public URL (for deletion)
  const extractPathFromUrl = (url: string): string | null => {
    try {
      // Create URL object to parse pathname
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Find the bucket segment and extract the path after it
      const pathSegments = pathname.split('/');
      const bucketIndex = pathSegments.findIndex(segment => segment === bucket);
      
      if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
        return pathSegments.slice(bucketIndex + 1).join('/');
      }
      
      return null;
    } catch (error) {
      console.error('Failed to extract path from URL:', error);
      return null;
    }
  };

  // Helper function to show user-friendly error messages
  const getErrorMessage = (error: any): string => {
    if (error?.message?.includes('Duplicate')) {
      return 'A file with this name already exists. Please try again.';
    }
    if (error?.message?.includes('Row Level Security')) {
      return 'You do not have permission to upload files. Please check your authentication.';
    }
    if (error?.message?.includes('413') || error?.message?.includes('too large')) {
      return 'File is too large. Please select a file smaller than 10MB.';
    }
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    return error?.message || 'Upload failed. Please try again.';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file || disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    setIsLoading(true);

    try {
      // Convert image to WebP if enabled
      let processedFile = file;
      let conversionInfo: ConversionResult | null = null;

      if (enableWebP) {
        const qualityOptions = getRecommendedQuality(imageType);
        conversionInfo = await convertImageToWebP(file, qualityOptions);
        processedFile = conversionInfo.file;
        setConversionResult(conversionInfo);
        
      
      }

      // Create object URL for cropping
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowCropDialog(true);
        setIsLoading(false);
      });
      reader.readAsDataURL(processedFile);
    } catch (error) {

      toast.error('Failed to process image. Please try again.');
      setIsLoading(false);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const cropAspectRatio = getAspectRatio();
    
    let crop: Crop;
    if (cropAspectRatio) {
      crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          cropAspectRatio,
          width,
          height,
        ),
        width,
        height,
      );
    } else {
      crop = centerCrop(
        {
          unit: '%',
          width: 90,
          height: 90,
        },
        width,
        height,
      );
    }

    setCrop(crop);
    setCompletedCrop(crop);
  }, [getAspectRatio]);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const getCroppedImg = useCallback(
    async (
      image: HTMLImageElement,
      crop: Crop,
      fileName: string,
    ): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const targetWidth = cropWidth || Math.round(crop.width * scaleX);
      const targetHeight = cropHeight || Math.round(crop.height * scaleY);

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Calculate the center point for rotation
      const centerX = targetWidth / 2;
      const centerY = targetHeight / 2;

      ctx.save();

      // Move to center, rotate, then move back
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        targetWidth,
        targetHeight,
      );

      ctx.restore();

      return new Promise((resolve, reject) => {
        // Use WebP format if enabled and supported, otherwise JPEG
        const outputFormat = enableWebP ? 'webp' : 'jpeg';
        const quality = getRecommendedQuality(imageType).quality || 0.9;
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        }, `image/${outputFormat}`, quality);
      });
    },
    [cropWidth, cropHeight, rotation, enableWebP, imageType],
  );

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsLoading(true);
    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.jpg',
      );

      // Upload the cropped image to Supabase
      await uploadToSupabase(croppedImageBlob);
      
      setShowCropDialog(false);
      setImageSrc('');
      setRotation(0);
    } catch (error) {
      toast.error('Failed to crop image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToSupabase = async (file: File | Blob) => {
    try {
      // If using media service with componentId and fieldName, use the service
      if (useMediaService && componentId && fieldName) {
        // Convert blob to file if needed
        let fileToUpload: File;
        if (file instanceof File) {
          fileToUpload = file;
        } else {
          // Convert blob to file
          const fileExt = enableWebP ? 'webp' : 'jpg';
          const fileName = `upload-${Date.now()}.${fileExt}`;
          fileToUpload = new File([file], fileName, { type: file.type });
        }
        
        const uploadedUrl = await mediaService.uploadAndSetComponentMedia(
          fileToUpload,
          componentId,
          fieldName
        );
        
        if (!uploadedUrl) {
          throw new Error('Failed to upload image via media service');
        }
        
        // Call onChange with the uploaded URL
        onChange(uploadedUrl);
        toast.success('Image uploaded successfully!');
        return;
      }
      
      // Original direct upload logic for backward compatibility
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create unique filename with appropriate extension
      let fileExt = 'jpg'; // default fallback
      if (file instanceof File) {
        fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      } else if (enableWebP) {
        fileExt = 'webp';
      }
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Organize files by user ID if authenticated, otherwise use 'anonymous' folder
      const userFolder = user?.id || 'anonymous';
      const filePath = `${folder}/${userFolder}/${fileName}`;

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite existing files
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Call onChange with the public URL
      onChange(publicUrl);
      toast.success('Image processed and saved successfully!');
      
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemove = async () => {
    if (!value) {
      onChange('');
      return;
    }
    
    try {
      // If using media service, remove via media service
      if (useMediaService && componentId && fieldName) {
        const success = await mediaService.removeComponentMediaUrl(componentId, fieldName);
        if (!success) {
          toast.error('Failed to remove image from database');
        }
        onChange('');
        return;
      }
      
      // For direct Supabase storage uploads, extract file path from URL for deletion
      if (value.includes(bucket)) {
        const path = extractPathFromUrl(value);
        if (path) {
          // Delete from Supabase storage
          const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);
            
          if (error) {
            console.error('Failed to delete image from storage:', error);
            toast.error('Failed to delete image from storage: ' + error.message);
            // Still call onChange to clear the UI even if deletion fails
          }
        }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Always clear the value in the UI
      onChange('');
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      style={style}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      {value ? (
        <div className="relative group w-full h-full">
          <img 
            src={value} 
            alt="Uploaded image" 
            className="w-full h-full object-cover rounded-lg"
            style={{ aspectRatio: getAspectRatio() }}
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClick}
                  className="bg-white text-black hover:bg-gray-200"
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors w-full h-full flex flex-col items-center justify-center
            ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ 
            aspectRatio: getAspectRatio(),
            minWidth: minWidth,
            minHeight: minHeight 
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Processing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{placeholder}</p>
                <p className="text-xs text-gray-500">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: {getRecommendedDimensionsText(
                    cropWidth,
                    cropHeight,
                    getAspectRatio()
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imageSrc && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                </div>
                
                <div className="max-w-full max-h-96 overflow-auto">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={getAspectRatio()}
                    minWidth={minWidth}
                    minHeight={minHeight}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop preview"
                      src={imageSrc}
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                        maxWidth: '100%',
                        maxHeight: '400px'
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  <p>Drag the corners to adjust the crop area</p>
                  <p className="text-xs mt-1">
                    Target size: {getRecommendedDimensionsText(
                      cropWidth,
                      cropHeight,
                      getAspectRatio()
                    )}
                  </p>
                  {conversionResult && conversionResult.compressionRatio > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-green-700">
                      <p className="text-xs">
                        ✓ Optimized: {formatFileSize(conversionResult.originalSize)} → {formatFileSize(conversionResult.compressedSize)} 
                        <span className="font-medium"> ({conversionResult.compressionRatio}% smaller)</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCropDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={!completedCrop || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Crop
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
