import { useEffect, useState, useCallback } from 'react';

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export const useImageDimensions = (elementId?: string, fallbackAspectRatio: number = 1) => {
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
    aspectRatio: fallbackAspectRatio
  });

  const updateDimensions = useCallback(() => {
    if (!elementId) return;

    // Try to find the element by ID
    const element = document.getElementById(elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height) {
        setDimensions({
          width: rect.width,
          height: rect.height,
          aspectRatio: rect.width / rect.height
        });
        return;
      }
    }

    // Try to find by class selector
    const classElement = document.querySelector(`[data-element-id="${elementId}"]`);
    if (classElement) {
      const rect = classElement.getBoundingClientRect();
      if (rect.width && rect.height) {
        setDimensions({
          width: rect.width,
          height: rect.height,
          aspectRatio: rect.width / rect.height
        });
        return;
      }
    }

    // Fallback to default
    setDimensions({
      width: 400,
      height: 300,
      aspectRatio: fallbackAspectRatio
    });
  }, [elementId, fallbackAspectRatio]);

  useEffect(() => {
    updateDimensions();
    
    // Update on window resize
    const handleResize = () => {
      setTimeout(updateDimensions, 100); // Debounce slightly
    };
    
    window.addEventListener('resize', handleResize);
    
    // Use MutationObserver to detect when elements are added/modified
    const observer = new MutationObserver(() => {
      setTimeout(updateDimensions, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [updateDimensions]);

  return {
    dimensions,
    updateDimensions
  };
};

// Utility function to get optimal crop dimensions based on container
export const getOptimalCropDimensions = (
  containerWidth: number,
  containerHeight: number,
  maxWidth: number = 1024,
  maxHeight: number = 768
): { cropWidth: number; cropHeight: number; aspectRatio: number } => {
  const aspectRatio = containerWidth / containerHeight;
  
  let cropWidth = Math.min(containerWidth * 2, maxWidth); // 2x for retina
  let cropHeight = Math.min(containerHeight * 2, maxHeight);
  
  // Maintain aspect ratio
  if (cropWidth / cropHeight > aspectRatio) {
    cropWidth = cropHeight * aspectRatio;
  } else {
    cropHeight = cropWidth / aspectRatio;
  }
  
  return {
    cropWidth: Math.round(cropWidth),
    cropHeight: Math.round(cropHeight),
    aspectRatio
  };
};

// Utility function to get recommended image dimensions as text
export const getRecommendedDimensionsText = (
  cropWidth: number,
  cropHeight: number,
  aspectRatio?: number
): string => {
  if (cropWidth && cropHeight) {
    return `${cropWidth}x${cropHeight}px`;
  }
  
  if (!aspectRatio) {
    return 'Custom dimensions';
  }
  
  if (aspectRatio === 1) {
    return 'Square (1:1)';
  } else if (aspectRatio === 16/9) {
    return 'Widescreen (16:9)';
  } else if (aspectRatio === 4/3) {
    return 'Standard (4:3)';
  } else if (aspectRatio === 3/2) {
    return 'Photo (3:2)';
  } else {
    return `${aspectRatio.toFixed(2)}:1 ratio`;
  }
};
