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
      console.error('Failed to load media URLs:', error);
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
      console.error('Failed to upload media:', error);
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
      console.error('Failed to remove media:', error);
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

  // Load media URLs on mount only if not provided initially
  useEffect(() => {
    if (autoLoad && componentId && !initialMediaUrls) {
      refreshMediaUrls();
    }
  }, [autoLoad, componentId, refreshMediaUrls, initialMediaUrls]);

  // Update state when initialMediaUrls changes
  useEffect(() => {
    if (initialMediaUrls) {
      setMediaUrls(prev => ({
        ...prev,
        ...initialMediaUrls
      }));
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
