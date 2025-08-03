import { useState, useEffect, useCallback } from 'react';
import { mediaService, ComponentMediaUrls } from '@/services/media';

interface UseComponentMediaOptions {
  componentId: string;
  autoLoad?: boolean; // Automatically load media URLs on mount
  initialMediaUrls?: ComponentMediaUrls; // Initial media URLs from component data
}

interface UseComponentMediaReturn {
  mediaUrls: ComponentMediaUrls;
  isLoading: boolean;
  uploadMedia: (file: File, fieldName: string) => Promise<string | null>;
  removeMedia: (fieldName: string) => Promise<boolean>;
  refreshMediaUrls: () => Promise<void>;
  getMediaUrl: (fieldName: string) => string | undefined;
}

/**
 * Hook for managing component media URLs
 * Automatically handles loading, uploading, and removing media files for a component
 */
export const useComponentMedia = (
  options: UseComponentMediaOptions
): UseComponentMediaReturn => {
  const { componentId, autoLoad = true, initialMediaUrls } = options;
  
  const [mediaUrls, setMediaUrls] = useState<ComponentMediaUrls>(initialMediaUrls || {});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Load media URLs from the database
   */
  const refreshMediaUrls = useCallback(async () => {
    if (!componentId) return;
    
    setIsLoading(true);
    try {
      const urls = await mediaService.getComponentMediaUrls(componentId);
      setMediaUrls(urls);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [componentId]);

  /**
   * Upload a file and update the component's media URLs
   */
  const uploadMedia = useCallback(async (
    file: File, 
    fieldName: string
  ): Promise<string | null> => {
    if (!componentId) return null;

    setIsLoading(true);
    try {
      const url = await mediaService.uploadAndSetComponentMedia(
        file,
        componentId,
        fieldName
      );

      if (url) {
        // Update local state
        setMediaUrls(prev => ({
          ...prev,
          [fieldName]: url
        }));
      }

      return url;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [componentId]);

  /**
   * Remove media from component
   */
  const removeMedia = useCallback(async (fieldName: string): Promise<boolean> => {
    if (!componentId) return false;

    setIsLoading(true);
    try {
      const success = await mediaService.removeComponentMediaUrl(componentId, fieldName);
      
      if (success) {
        // Update local state
        setMediaUrls(prev => {
          const { [fieldName]: removed, ...rest } = prev;
          return rest;
        });
      }

      return success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [componentId]);

  /**
   * Get URL for a specific field
   */
  const getMediaUrl = useCallback((fieldName: string): string | undefined => {
    return mediaUrls[fieldName];
  }, [mediaUrls]);

  // Load media URLs on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad && componentId) {
      refreshMediaUrls();
    }
  }, [autoLoad, componentId, refreshMediaUrls]);

  // Update state when initialMediaUrls changes, but don't override fresh data
  useEffect(() => {
    if (initialMediaUrls) {
      setMediaUrls(prev => {
        // Only use initialMediaUrls for fields that don't have fresh data
        const merged = { ...initialMediaUrls };
        Object.keys(prev).forEach(key => {
          if (prev[key]) {
            merged[key] = prev[key]; // Keep fresh data
          }
        });
        return merged;
      });
    }
  }, [initialMediaUrls]);

  return {
    mediaUrls,
    isLoading,
    uploadMedia,
    removeMedia,
    refreshMediaUrls,
    getMediaUrl
  };
};

export default useComponentMedia;
