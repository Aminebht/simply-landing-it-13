import { supabase } from './supabase';

export interface MediaUploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface ComponentMediaUrls {
  [key: string]: string; // e.g., { "template1Image": "url", "videoUrl": "url" }
}

class MediaService {
  private readonly STORAGE_BUCKET = 'component-media';
  private readonly MOCK_USER_ID = 'f75c2dc6-f875-4136-9f07-861cfbb837c1';

  /**
   * Upload a file to Supabase storage and return the public URL
   */
  async uploadFile(
    file: File,
    componentId: string,
    fieldName: string
  ): Promise<MediaUploadResult> {
    try {
      // Use mock user ID instead of authentication
      const userId = this.MOCK_USER_ID;

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${fieldName}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${componentId}/${fileName}`;

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { url: '', path: '', error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        path: data.path,
        error: undefined
      };
    } catch (error) {
      console.error('Media upload failed:', error);
      return { 
        url: '', 
        path: '', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Update component media URLs in the database
   */
  async updateComponentMediaUrl(
    componentId: string,
    fieldName: string,
    url: string
  ): Promise<boolean> {
    try {
      // First get the current media_urls
      const { data: component, error: fetchError } = await supabase
        .from('landing_page_components')
        .select('media_urls')
        .eq('id', componentId)
        .single();

      if (fetchError) {
        console.error('Error fetching component:', fetchError);
        return false;
      }

      // Update the specific field in media_urls
      const currentMediaUrls = component.media_urls || {};
      const updatedMediaUrls = {
        ...currentMediaUrls,
        [fieldName]: url
      };

      // Update the component
      const { error: updateError } = await supabase
        .from('landing_page_components')
        .update({ media_urls: updatedMediaUrls })
        .eq('id', componentId);

      if (updateError) {
        console.error('Error updating component media:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update component media URL:', error);
      return false;
    }
  }

  /**
   * Remove a media URL from component
   */
  async removeComponentMediaUrl(
    componentId: string,
    fieldName: string
  ): Promise<boolean> {
    try {
      // Get current media_urls
      const { data: component, error: fetchError } = await supabase
        .from('landing_page_components')
        .select('media_urls')
        .eq('id', componentId)
        .single();

      if (fetchError) {
        console.error('Error fetching component:', fetchError);
        return false;
      }

      // Remove the field from media_urls
      const currentMediaUrls = component.media_urls || {};
      const { [fieldName]: removed, ...updatedMediaUrls } = currentMediaUrls;

      // Update the component
      const { error: updateError } = await supabase
        .from('landing_page_components')
        .update({ media_urls: updatedMediaUrls })
        .eq('id', componentId);

      if (updateError) {
        console.error('Error removing component media:', updateError);
        return false;
      }

      // Optionally delete the file from storage
      if (removed && removed.includes(this.STORAGE_BUCKET)) {
        const path = this.extractPathFromUrl(removed);
        if (path) {
          await supabase.storage.from(this.STORAGE_BUCKET).remove([path]);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to remove component media URL:', error);
      return false;
    }
  }

  /**
   * Get all media URLs for a component
   */
  async getComponentMediaUrls(componentId: string): Promise<ComponentMediaUrls> {
    try {
      const { data: component, error } = await supabase
        .from('landing_page_components')
        .select('media_urls')
        .eq('id', componentId)
        .single();

      if (error) {
        console.error('Error fetching component media:', error);
        return {};
      }

      return component.media_urls || {};
    } catch (error) {
      console.error('Failed to get component media URLs:', error);
      return {};
    }
  }

  /**
   * Upload and update component media in one operation
   */
  async uploadAndSetComponentMedia(
    file: File,
    componentId: string,
    fieldName: string
  ): Promise<string | null> {
    try {
      // Upload the file
      const uploadResult = await this.uploadFile(file, componentId, fieldName);
      
      if (uploadResult.error || !uploadResult.url) {
        console.error('Upload failed:', uploadResult.error);
        return null;
      }

      // Update the component
      const success = await this.updateComponentMediaUrl(
        componentId,
        fieldName,
        uploadResult.url
      );

      if (!success) {
        console.error('Failed to update component with media URL');
        return null;
      }

      return uploadResult.url;
    } catch (error) {
      console.error('Failed to upload and set component media:', error);
      return null;
    }
  }

  /**
   * Extract storage path from public URL (for deletion)
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const match = url.match(new RegExp(`${this.STORAGE_BUCKET}/(.+)$`));
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;