import { supabase } from '@/integrations/supabase/client';

export interface AIImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_steps?: number;
  guidance?: number;
  seed?: number;
  componentId?: string;
  fieldName?: string;
  uploadToStorage?: boolean;
}

export interface AIImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  storageUrl?: string;
  error?: string;
}

export class AIImageGenerationService {
  /**
   * Generate an image using Supabase Edge Function with Cloudflare AI
   */
  async generateImage(request: AIImageGenerationRequest): Promise<AIImageGenerationResponse> {
    try {
      console.log('Generating AI image with prompt:', request.prompt);

      const payload = {
        prompt: request.prompt,
        negative_prompt: request.negative_prompt || "blurry, low quality, distorted, ugly, bad anatomy",
        width: request.width || 1024,
        height: request.height || 1024,
        num_steps: request.num_steps || 20,
        guidance: request.guidance || 7.5,
        componentId: request.componentId,
        fieldName: request.fieldName,
        uploadToStorage: request.uploadToStorage || false,
        ...(request.seed && { seed: request.seed })
      };

      console.log('Calling ai-image-generator Edge Function with payload:', payload);

      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: payload
      });

      if (error) {
        console.error('AI Image Generation API error:', error);
        throw new Error(`AI Image Generation failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      console.log('AI image generated successfully');

      return {
        success: true,
        imageUrl: data.imageUrl,
        storageUrl: data.storageUrl,
      };
    } catch (error) {
      console.error('AI image generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
      };
    }
  }

  /**
   * Generate product-specific images for landing page components
   */
  async generateProductImage(
    productName: string,
    productDescription: string,
    imageType: 'hero' | 'feature' | 'testimonial' | 'product' | 'background',
    style: 'realistic' | 'illustration' | 'minimal' | 'modern' = 'modern',
    componentId?: string
  ): Promise<AIImageGenerationResponse> {
    const prompts = {
      hero: `Professional hero image for ${productName}, ${style} style, high quality, marketing banner, clean background, ${productDescription}`,
      feature: `Feature illustration for ${productName}, ${style} style, icon-like, clean design, professional, ${productDescription}`,
      testimonial: `Professional headshot, diverse person, friendly smile, ${style} style, corporate headshot, professional lighting`,
      product: `Product showcase for ${productName}, ${style} style, clean white background, professional product photography, ${productDescription}`,
      background: `Abstract background pattern, ${style} style, subtle, professional, modern design, suitable for ${productName}`
    };

    const dimensions = {
      hero: { width: 1200, height: 600 },
      feature: { width: 800, height: 600 },
      testimonial: { width: 400, height: 400 },
      product: { width: 1000, height: 1000 },
      background: { width: 1920, height: 1080 }
    };

    return this.generateImage({
      prompt: prompts[imageType],
      negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy, watermark, text, logo, signature",
      width: dimensions[imageType].width,
      height: dimensions[imageType].height,
      num_steps: 20,
      guidance: 7.5,
      componentId,
      fieldName: imageType,
      uploadToStorage: !!componentId
    });
  }

  /**
   * Generate and upload images for a specific component using the Edge Function
   */
  async generateAndUploadComponentImages(
    productName: string,
    productDescription: string,
    imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'>,
    componentId: string,
    style: 'realistic' | 'illustration' | 'minimal' | 'modern' = 'modern'
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    for (const imageType of imageTypes) {
      try {
        console.log(`Generating ${imageType} image for component ${componentId}...`);
        
        const response = await this.generateProductImage(
          productName,
          productDescription,
          imageType,
          style,
          componentId
        );
        
        if (response.success) {
          if (response.storageUrl) {
            results[imageType] = response.storageUrl;
            console.log(`✅ ${imageType} image uploaded successfully:`, response.storageUrl);
          } else if (response.imageUrl) {
            results[imageType] = response.imageUrl;
            console.log(`✅ ${imageType} image generated (base64):`, response.imageUrl.substring(0, 50) + '...');
          }
        } else {
          console.warn(`Failed to generate ${imageType} image:`, response.error);
        }
        
        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating ${imageType} image:`, error);
      }
    }
    
    return results;
  }
}

// Create a singleton instance for the AI image generation service
export const aiImageService = new AIImageGenerationService();

console.log('AI Image Generation service initialized with Supabase Edge Function');
