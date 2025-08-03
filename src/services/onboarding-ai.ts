import { supabase } from '@/services/supabase';
import { aiImageService } from '@/services/ai-image-generation';
import { AIGenerationService } from '@/services/ai-generation';
import { COLOR_PALETTES } from '@/constants/onboarding';
import { generateSlugFromTitle, getImageFieldNames, determineImagesToGenerate } from '@/utils/onboardingHelpers';
import type { OnboardingData, Product, ComponentVariation } from '@/types/onboarding';

interface AIGeneratedContent {
  variationId: string;
  componentType: string;
  content: Record<string, any>;
  characterLimits: Record<string, any>;
}

export class OnboardingAIService {
  private aiGenerationService: AIGenerationService;

  constructor() {
    this.aiGenerationService = new AIGenerationService('');
  }

  async selectComponentVariations(product: Product, description: string, language: 'en' | 'fr' | 'ar', componentVariations: ComponentVariation[]): Promise<ComponentVariation[]> {
    try {
      const componentSelectionResponse = await this.aiGenerationService.selectComponentVariations({
        productName: product.title,
        productDescription: description,
        language: language
      });

      console.log('AI selected components:', componentSelectionResponse);

      const selectedVariationIds = [
        componentSelectionResponse.hero,
        componentSelectionResponse.cta
      ];

      return componentVariations.filter(v => selectedVariationIds.includes(v.id));
    } catch (error) {
      console.warn('AI component selection failed, using fallback:', error);
      
      // Fallback to default components
      const heroVariation = componentVariations.find(v => v.component_type === 'hero');
      const ctaVariation = componentVariations.find(v => v.component_type === 'cta');
      
      if (!heroVariation || !ctaVariation) {
        throw new Error('No component variations available');
      }
      
      return [heroVariation, ctaVariation];
    }
  }

  async generateContentForComponents(
    product: Product, 
    description: string, 
    language: 'en' | 'fr' | 'ar', 
    selectedVariations: ComponentVariation[]
  ): Promise<AIGeneratedContent[]> {
    try {
      const aiGeneratedContent = await this.aiGenerationService.generateComponentContent({
        productName: product.title,
        productDescription: description,
        language: language,
        componentVariations: selectedVariations.map(v => ({
          id: v.id,
          component_type: v.component_type,
          character_limits: v.character_limits || {},
          default_content: v.default_content || {}
        }))
      });

      console.log('AI generated content:', aiGeneratedContent);
      return aiGeneratedContent;
    } catch (error) {
      console.warn('AI content generation failed, using default content:', error);
      
      // Fallback to default content with product substitution
      return selectedVariations.map(variation => {
        const defaultContent = variation.default_content || {};
        const contentWithProduct = { ...defaultContent };
        
        // Simple product name substitution in default content
        Object.keys(contentWithProduct).forEach(key => {
          if (typeof contentWithProduct[key] === 'string') {
            contentWithProduct[key] = contentWithProduct[key]
              .replace(/\[Product Name\]/g, product.title)
              .replace(/\[Product\]/g, product.title);
          }
        });
        
        return {
          variationId: variation.id,
          componentType: variation.component_type,
          content: contentWithProduct,
          characterLimits: variation.character_limits || {}
        };
      });
    }
  }

  async createLandingPage(product: Product, description: string, language: 'en' | 'fr' | 'ar'): Promise<any> {
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    const slug = generateSlugFromTitle(product.title || '');

    const { data: landingPage, error: pageError } = await supabase
      .from('landing_pages')
      .insert([{
        product_id: product.id,
        user_id: product.seller_id,
        slug,
        global_theme: {
          primaryColor: palette.primaryColor,
          backgroundColor: palette.backgroundColor,
          direction: language === 'ar' ? 'rtl' : 'ltr',
          language: language
        },
        seo_config: {
          title: product.title,
          description: description,
          keywords: product.tags || [],
          ogImage: product.preview_image_url || '',
          canonical: ''
        },
        status: 'draft'
      }])
      .select()
      .single();

    if (pageError) throw pageError;
    return { landingPage, palette };
  }

  prepareCustomActions(componentType: string, product: Product): Record<string, any> {
    if (componentType === 'cta') {
      return {
        "cta-button": {
          "type": "checkout",
          "amount": product.price,
          "productId": product.id
        }
      };
    } else {
      return {
        "cta-button": {
          "type": "scroll",
          "targetId": "cta-section"
        }
      };
    }
  }

  prepareContentWithImages(
    content: Record<string, any>,
    product: Product,
    onboardingData: OnboardingData
  ): Record<string, any> {
    const finalContent = { ...content };

    // Add product-specific data
    if (!finalContent.price) {
      finalContent.price = product.price;
    }
    if (!finalContent.originalPrice && product.original_price) {
      finalContent.originalPrice = product.original_price !== product.price 
        ? product.original_price 
        : '';
    }

    // Handle images based on user preference
    if (onboardingData.useProductImages && onboardingData.selectedProductMedia && onboardingData.selectedProductMedia.length > 0) {
      const primaryImage = onboardingData.selectedProductMedia[0]?.file_url;
      const secondaryImage = onboardingData.selectedProductMedia[1]?.file_url || primaryImage;
      
      if (primaryImage) {
        finalContent.productImage = primaryImage;
        finalContent.dashboardImage = primaryImage;
        finalContent.template1Image = primaryImage;
        finalContent.brandLogoIcon = primaryImage;
        finalContent.professionalImage = secondaryImage || primaryImage;
      }
    } else if (onboardingData.useProductImages && product.preview_image_url) {
      finalContent.productImage = product.preview_image_url;
      finalContent.dashboardImage = product.preview_image_url;
      finalContent.template1Image = product.preview_image_url;
      finalContent.brandLogoIcon = product.preview_image_url;
      finalContent.professionalImage = product.preview_image_url;
    }

    return finalContent;
  }

  async generateAIImages(
    component: any,
    variation: ComponentVariation,
    product: Product,
    description: string,
    contentItem: AIGeneratedContent
  ): Promise<void> {
    if (!variation.required_images || variation.required_images === 0) {
      console.log(`Skipping AI image generation for ${contentItem.componentType} - component doesn't require images`);
      return;
    }

    console.log(`Generating AI images for component ${component.id} (requires ${variation.required_images} images)...`);

    const productName = product.title || 'Product';
    const componentType = variation.component_type;
    const requiredImagesCount = variation.required_images || 0;

    const imagesToGenerate = determineImagesToGenerate(componentType, requiredImagesCount);
    console.log(`Will generate ${imagesToGenerate.length} images for ${componentType} component:`, imagesToGenerate);

    if (imagesToGenerate.length === 0) {
      console.log(`No images to generate for component type: ${componentType}`);
      return;
    }

    const generatedImages = await aiImageService.generateAndUploadComponentImages(
      productName,
      description,
      imagesToGenerate,
      component.id,
      'modern'
    );

    // Update component content with uploaded image URLs
    const updatedContent = { ...component.content };
    const imageFieldMapping = getImageFieldNames(contentItem.variationId, variation);
    let fieldIndex = 0;

    // Map the generated images to the appropriate fields
    imagesToGenerate.forEach((imageType) => {
      if (generatedImages[imageType] && fieldIndex < imageFieldMapping.length) {
        const fieldName = imageFieldMapping[fieldIndex];
        updatedContent[fieldName] = generatedImages[imageType];
        console.log(`Mapped ${imageType} image to field ${fieldName}`);
        fieldIndex++;
      }
    });

    // Update component content with new image URLs
    await supabase
      .from('landing_page_components')
      .update({ content: updatedContent })
      .eq('id', component.id);

    console.log(`✅ AI images generated and applied to component ${component.id}:`, generatedImages);
  }

  async updateScrollTargetIds(landingPageId: string, selectedVariations: ComponentVariation[]): Promise<void> {
    const { data: allComponents, error: fetchComponentsError } = await supabase
      .from('landing_page_components')
      .select('id, component_variation_id, custom_actions')
      .eq('page_id', landingPageId);

    if (fetchComponentsError) {
      console.warn('Could not fetch components to update scroll targets:', fetchComponentsError);
      return;
    }

    // Find CTA component
    const ctaComponent = allComponents?.find(comp => {
      const variation = selectedVariations.find(v => v.id === comp.component_variation_id);
      return variation?.component_type === 'cta';
    });

    if (!ctaComponent) return;

    const ctaTargetId = `section-${ctaComponent.id}`;
    
    // Update all non-CTA components to scroll to the CTA component
    const nonCtaComponents = allComponents?.filter(comp => {
      const variation = selectedVariations.find(v => v.id === comp.component_variation_id);
      return variation?.component_type !== 'cta';
    });

    for (const component of nonCtaComponents || []) {
      const updatedCustomActions = {
        ...component.custom_actions,
        "cta-button": {
          "type": "scroll",
          "targetId": ctaTargetId
        }
      };

      await supabase
        .from('landing_page_components')
        .update({ custom_actions: updatedCustomActions })
        .eq('id', component.id);

      console.log(`Updated scroll target for component ${component.id} to ${ctaTargetId}`);
    }
  }
}
