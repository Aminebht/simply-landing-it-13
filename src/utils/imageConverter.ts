/**
 * Image conversion utilities for optimizing user uploads
 * Converts images to WebP format with configurable quality settings
 */

export interface ImageConversionOptions {
  quality?: number; // 0-1, default 0.85
  maxWidth?: number; // Maximum width in pixels
  maxHeight?: number; // Maximum height in pixels
  format?: 'webp' | 'jpeg' | 'png'; // Output format, default 'webp'
}

export interface ConversionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
}

/**
 * Convert an image file to WebP format with optimization
 */
export async function convertImageToWebP(
  file: File,
  options: ImageConversionOptions = {}
): Promise<ConversionResult> {
  const {
    quality = 0.9,
    maxWidth = 1920,
    maxHeight = 1920,
    format = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    // Don't convert GIF files to preserve animation
    if (file.type === 'image/gif') {
      const result: ConversionResult = {
        file: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        format: 'gif'
      };
      resolve(result);
      return;
    }

    // Check if browser supports WebP
    if (format === 'webp' && !supportsWebP()) {
      console.warn('WebP not supported, falling back to JPEG');
      return convertImageToWebP(file, { ...options, format: 'jpeg' });
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image'));
                return;
              }

              // Create new file with WebP extension
              const originalName = file.name.replace(/\.[^/.]+$/, '');
              const extension = format === 'webp' ? 'webp' : format === 'jpeg' ? 'jpg' : 'png';
              const newFileName = `${originalName}.${extension}`;
              
              const convertedFile = new File([blob], newFileName, {
                type: `image/${format}`,
                lastModified: Date.now(),
              });

              const result: ConversionResult = {
                file: convertedFile,
                originalSize: file.size,
                compressedSize: convertedFile.size,
                compressionRatio: Math.round((1 - convertedFile.size / file.size) * 100),
                format: format
              };

              resolve(result);
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert multiple images in batch
 */
export async function convertMultipleImages(
  files: File[],
  options: ImageConversionOptions = {}
): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];
  
  for (const file of files) {
    try {
      const result = await convertImageToWebP(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to convert ${file.name}:`, error);
      // You might want to handle this differently based on your needs
      throw error;
    }
  }

  return results;
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Scale down if image is larger than max dimensions
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Check if browser supports WebP
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Validate if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get recommended quality settings based on image type
 */
export function getRecommendedQuality(imageType: 'product' | 'avatar' | 'banner'): ImageConversionOptions {
  switch (imageType) {
    case 'product':
      return {
        quality: 0.9,
        maxWidth: 1200,
        maxHeight: 1200,
        format: 'webp'
      };
    case 'avatar':
      return {
        quality: 0.9,
        maxWidth: 400,
        maxHeight: 400,
        format: 'webp'
      };
    case 'banner':
      return {
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'webp'
      };
    default:
      return {
        quality: 0.9,
        maxWidth: 1920,
        maxHeight: 1920,
        format: 'webp'
      };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
