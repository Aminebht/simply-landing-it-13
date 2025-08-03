/**
 * Onboarding.tsx - AI-Powered Landing Page Creation
 * 
 * This component now uses the AIGenerationService and AIImageGenerationService to:
 * 1. Intelligently select the best component variations for a product
 * 2. Generate compelling, contextual content using AI
 * 3. Create custom images tailored to the product and components
 * 
 * The flow is:
 * - Step 1: AI selects optimal component variations based on product characteristics
 * - Step 2: AI generates content for each selected component (with fallback to default content)
 * - Step 3: Creates the landing page with the generated content
 * - Step 4: Optionally generates custom AI images for each component
 * 
 * All AI operations include error handling with graceful fallbacks to ensure the
 * onboarding process always completes successfully.
 */

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Globe, Package, Wand2, FileText, Image, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, Product, ComponentVariation } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";
import { aiImageService } from '@/services/ai-image-generation';
import { AIGenerationService } from '@/services/ai-generation';

interface OnboardingData {
  selectedProduct?: Product;
  selectedProductMedia?: Array<{
    id: string;
    media_type: string;
    file_url: string;
    display_order: number;
  }>;
  language: 'en' | 'fr' | 'ar';
  selectedComponents: string[];
  componentContent: Record<string, any>;
  useProductDescription: boolean;
  customDescription: string;
  useProductImages: boolean;
  generateAIImages: boolean;
}

// Color palettes for automatic theme selection
const COLOR_PALETTES = [
  {
    primaryColor: '#ffd700', // Bright gold
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Blue
  },
  {
    primaryColor: '#ffeb3b', // Bright yellow
    backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
  },
  {
    primaryColor: '#ff5722', // Deep orange
    backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-Cyan
  },
  {
    primaryColor: '#1a237e', // Deep navy
    backgroundColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Turquoise
  },
  {
    primaryColor: '#8e24aa', // Deep purple
    backgroundColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
  },
  {
    primaryColor: '#d32f2f', // Deep red
    backgroundColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint-Pink (soft)
  },
  {
    primaryColor: '#512da8', // Deep purple
    backgroundColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Coral-Pink
  },
  {
    primaryColor: '#c62828', // Crimson red
    backgroundColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach-Orange
  },
  {
    primaryColor: '#b74040',
    backgroundColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Lavender-Pink
  },
  {
    primaryColor: '#7b1fa2', // Deep violet
    backgroundColor: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)', // Peach-Lavender
  },
  {
    primaryColor: '#ffc107', // Amber
    backgroundColor: 'linear-gradient(135deg, #ff8a80 0%, #ffb74d 100%)', // Coral-Orange
  },
  {
    primaryColor: '#1976d2', // Deep blue
    backgroundColor: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // Mint-Sky
  },
  {
    primaryColor: '#ffab00', // Bright orange
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Deep Purple-Blue
  },
  {
    primaryColor: '#6a1b9a', // Deep purple
    backgroundColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', // Golden-Coral
  },
  {
    primaryColor: '#e91e63', // Pink accent
    backgroundColor: 'linear-gradient(135deg, #5ee7df 0%, #66a6ff 100%)', // Turquoise-Blue
  },
  // NEW VARIATIONS
  {
    primaryColor: '#2e7d32', // Forest green
    backgroundColor: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', // Red-Yellow
  },
  {
    primaryColor: '#f44336', // Vibrant red
    backgroundColor: 'linear-gradient(135deg, #48cae4 0%, #023e8a 100%)', // Light Blue-Navy
  },
  {
    primaryColor: '#ff9800', // Orange
    backgroundColor: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)', // Purple-Teal
  },
  {
    primaryColor: '#4a148c', // Deep purple
    backgroundColor: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)', // Mint-Lime
  },
  {
    primaryColor: '#00acc1', // Cyan
    backgroundColor: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', // Orange-Yellow
  },
  {
    primaryColor: '#d81b60', // Rose
    backgroundColor: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', // Turquoise-Green
  },
  {
    primaryColor: '#795548', // Brown
    backgroundColor: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // Light Blue-Blue
  },
  {
    primaryColor: '#ff4081', // Hot pink
    backgroundColor: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', // Green-Cyan
  },
  {
    primaryColor: '#3f51b5', // Indigo
    backgroundColor: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)', // Yellow-Coral
  },
  {
    primaryColor: '#8bc34a', // Light green
    backgroundColor: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)', // Purple-Lavender
  },
  {
    primaryColor: '#ff3d00', // Red-orange
    backgroundColor: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)', // Cyan-Blue
  },
  {
    primaryColor: '#01579b', // Dark blue
    backgroundColor: 'linear-gradient(135deg, #f8b500 0%, #ffeaa7 100%)', // Orange-Cream
  },
  {
    primaryColor: '#bf360c', // Deep orange-red
    backgroundColor: 'linear-gradient(135deg, #81ecec 0%, #74b9ff 100%)', // Aqua-Blue
  },
  {
    primaryColor: '#388e3c', // Green
    backgroundColor: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)', // Pink-Yellow
  },
  {
    primaryColor: '#7c4dff', // Purple accent
    backgroundColor: 'linear-gradient(135deg, #00cec9 0%, #55a3ff 100%)', // Cyan-Blue
  },
  {
    primaryColor: '#ff6f00', // Dark orange
    backgroundColor: 'linear-gradient(135deg, #6c5ce7 0%, #74b9ff 100%)', // Purple-Blue
  },
  {
    primaryColor: '#c2185b', // Pink-red
    backgroundColor: 'linear-gradient(135deg, #00b894 0%, #fdcb6e 100%)', // Green-Yellow
  },
  {
    primaryColor: '#1565c0', // Blue
    backgroundColor: 'linear-gradient(135deg, #fd79a8 0%, #ff7675 100%)', // Pink-Coral
  },
  {
    primaryColor: '#558b2f', // Olive green
    backgroundColor: 'linear-gradient(135deg, #a29bfe 0%, #74b9ff 100%)', // Lavender-Blue
  },
  {
    primaryColor: '#ad1457', // Deep pink
    backgroundColor: 'linear-gradient(135deg, #00cec9 0%, #55efc4 100%)', // Cyan-Mint
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize AI Generation Service
  const aiGenerationService = new AIGenerationService(''); // API key not needed for Supabase functions

  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    language: 'en',
    selectedComponents: [],
    componentContent: {},
    useProductDescription: true,
    customDescription: '',
    useProductImages: true,
    generateAIImages: false,
    selectedProductMedia: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchComponentVariations();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const fetchComponentVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('component_variations')
        .select('*')
        .eq('is_active', true)
        .order('component_type, variation_number');

      if (error) throw error;
      console.log('Fetched component variations:', data);
      setComponentVariations(data || []);
    } catch (error) {
      console.error('Error fetching component variations:', error);
      toast({
        title: "Error",
        description: "Failed to load component variations",
        variant: "destructive"
      });
    }
  };

  const fetchProductMedia = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_media')
        .select('id, media_type, file_url, display_order')
        .eq('product_id', productId)
        .eq('media_type', 'image')
        .order('display_order');

      if (error) throw error;
      console.log('Fetched product media:', data);
      
      setOnboardingData(prev => ({
        ...prev,
        selectedProductMedia: data || []
      }));
      
      return data || [];
    } catch (error) {
      console.error('Error fetching product media:', error);
      toast({
        title: "Warning",
        description: "Failed to load product media",
        variant: "destructive"
      });
      return [];
    }
  };

  const handleComponentToggle = (componentId: string, checked: boolean) => {
    if (checked) {
      setOnboardingData(prev => ({
        ...prev,
        selectedComponents: [...prev.selectedComponents, componentId]
      }));
    } else {
      setOnboardingData(prev => ({
        ...prev,
        selectedComponents: prev.selectedComponents.filter(id => id !== componentId),
        componentContent: {
          ...prev.componentContent,
          [componentId]: undefined
        }
      }));
    }
  };

  const handleContentChange = (componentId: string, field: string, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      componentContent: {
        ...prev.componentContent,
        [componentId]: {
          ...prev.componentContent[componentId],
          [field]: value
        }
      }
    }));
  };

  const handleImageChange = (componentId: string, imageIndex: number, url: string) => {
    setOnboardingData(prev => ({
      ...prev,
      componentContent: {
        ...prev.componentContent,
        [componentId]: {
          ...prev.componentContent[componentId],
          [`image${imageIndex + 1}`]: url
        }
      }
    }));
  };

  // Helper function to get the expected field names for each component variation
  const getImageFieldNames = (componentVariationId: string, variation: any): string[] => {
    // Map component variation IDs to their expected image field names
    const componentImageFields: Record<string, string[]> = {
      // Hero variations - based on the component types and their expected field names
      'hero-variation-1': ['productImage'],
      'hero-variation-3': ['dashboardImage'],
      'hero-variation-4': ['template1Image', 'template2Image', 'template3Image'],
      'hero-variation-6': ['brandLogoIcon', 'professionalImage'],
    };

    // Try to find by the variation name or component type
    const variationName = variation?.variation_name || '';
    const componentType = variation?.component_type || '';
    const variationNumber = variation?.variation_number || 0;
    
    // Create a key based on component type and variation number
    const key = `${componentType}-variation-${variationNumber}`;
    
    // Return the expected field names, or default to generic names
    return componentImageFields[key] || [`image1`, `image2`, `image3`].slice(0, variation?.required_images || 1);
  };

  // Helper function to map generic image keys to component-specific field names
  const mapImageKeysToFieldNames = (
    componentContent: Record<string, any>, 
    componentVariationId: string, 
    variation: any
  ): Record<string, string> => {
    const imageUrls: Record<string, string> = {};
    const expectedFieldNames = getImageFieldNames(componentVariationId, variation);
    
    // Map image1, image2, image3 to the expected field names
    let fieldIndex = 0;
    Object.keys(componentContent).forEach(key => {
      if (key.startsWith('image') && typeof componentContent[key] === 'string' && componentContent[key].startsWith('http')) {
        if (fieldIndex < expectedFieldNames.length) {
          imageUrls[expectedFieldNames[fieldIndex]] = componentContent[key];
          fieldIndex++;
        }
      }
    });
    
    return imageUrls;
  };

  const generateLandingPageWithAI = async () => {
    if (!onboardingData.selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Determine which description to use
      const effectiveDescription = onboardingData.useProductDescription 
        ? onboardingData.selectedProduct.description || ''
        : onboardingData.customDescription;

      // Step 1: AI selects component variations
      toast({
        title: "AI is working...",
        description: "Selecting the best components for your product",
      });

      console.log('Using AI to select component variations...');
      
      let selectedVariations: ComponentVariation[] = [];
      
      try {
        const componentSelectionResponse = await aiGenerationService.selectComponentVariations({
          productName: onboardingData.selectedProduct.title,
          productDescription: effectiveDescription,
          language: onboardingData.language
        });

        console.log('AI selected components:', componentSelectionResponse);

        // Get the selected component variations from the database
        const selectedVariationIds = [
          componentSelectionResponse.hero,
          componentSelectionResponse.cta
        ];

        selectedVariations = componentVariations.filter(v => 
          selectedVariationIds.includes(v.id)
        );

        console.log('Found AI-selected variations:', selectedVariations.length);
      } catch (error) {
        console.warn('AI component selection failed, using fallback:', error);
      }

      if (selectedVariations.length === 0) {
        // Fallback to default components if AI selection fails
        const heroVariation = componentVariations.find(v => v.component_type === 'hero');
        const ctaVariation = componentVariations.find(v => v.component_type === 'cta');
        
        if (!heroVariation || !ctaVariation) {
          throw new Error('No component variations available');
        }
        
        selectedVariations = [heroVariation, ctaVariation];
        console.log('Using fallback components:', { hero: heroVariation.id, cta: ctaVariation.id });
      }

      // Step 2: Generate AI content for selected components
      toast({
        title: "Creating content...",
        description: "Generating compelling content with AI",
      });

      console.log('Generating AI content for components...');
      
      let aiGeneratedContent: Array<{
        variationId: string;
        componentType: string;
        content: Record<string, any>;
        characterLimits: Record<string, any>;
      }> = [];

      try {
        aiGeneratedContent = await aiGenerationService.generateComponentContent({
          productName: onboardingData.selectedProduct.title,
          productDescription: effectiveDescription,
          language: onboardingData.language,
          componentVariations: selectedVariations.map(v => ({
            id: v.id,
            component_type: v.component_type,
            character_limits: v.character_limits || {},
            default_content: v.default_content || {}
          }))
        });

        console.log('AI generated content:', aiGeneratedContent);
      } catch (error) {
        console.warn('AI content generation failed, using default content:', error);
        
        // Fallback to default content with product substitution
        aiGeneratedContent = selectedVariations.map(variation => {
          const defaultContent = variation.default_content || {};
          const contentWithProduct = { ...defaultContent };
          
          // Simple product name substitution in default content
          Object.keys(contentWithProduct).forEach(key => {
            if (typeof contentWithProduct[key] === 'string') {
              contentWithProduct[key] = contentWithProduct[key]
                .replace(/\[Product Name\]/g, onboardingData.selectedProduct.title)
                .replace(/\[Product\]/g, onboardingData.selectedProduct.title);
            }
          });
          
          return {
            variationId: variation.id,
            componentType: variation.component_type,
            content: contentWithProduct,
            characterLimits: variation.character_limits || {}
          };
        });
        
        console.log('Using fallback content:', aiGeneratedContent);
      }

      // Step 3: Create landing page
      toast({
        title: "Creating your landing page...",
        description: "Setting up components and content",
      });

      // Pick a random color palette
      const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      
      // Generate slug from product title
      const rawTitle = onboardingData.selectedProduct.title || '';
      const slug = rawTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create landing page
      const { data: landingPage, error: pageError } = await supabase
        .from('landing_pages')
        .insert([{
          product_id: onboardingData.selectedProduct.id,
          user_id: onboardingData.selectedProduct.seller_id,
          slug,
          global_theme: {
            primaryColor: palette.primaryColor,
            backgroundColor: palette.backgroundColor,
            direction: onboardingData.language === 'ar' ? 'rtl' : 'ltr',
            language: onboardingData.language
          },
          seo_config: {
            title: onboardingData.selectedProduct.title,
            description: effectiveDescription,
            keywords: onboardingData.selectedProduct.tags || [],
            ogImage: onboardingData.selectedProduct.preview_image_url || '',
            canonical: ''
          },
          status: 'draft'
        }])
        .select()
        .single();

      if (pageError) throw pageError;

      // Step 4: Create components with AI-generated content
      for (let i = 0; i < aiGeneratedContent.length; i++) {
        const contentItem = aiGeneratedContent[i];
        const variation = selectedVariations.find(v => v.id === contentItem.variationId);
        
        if (!variation) {
          console.warn(`Variation not found for content item: ${contentItem.variationId}`);
          continue;
        }
        
        // Merge AI-generated content with product-specific data
        const finalContent = { ...contentItem.content };
        if (onboardingData.selectedProduct) {
          if (!finalContent.price) {
            finalContent.price = onboardingData.selectedProduct.price;
          }
          if (!finalContent.originalPrice && onboardingData.selectedProduct.original_price) {
            finalContent.originalPrice = onboardingData.selectedProduct.original_price !== onboardingData.selectedProduct.price 
              ? onboardingData.selectedProduct.original_price 
              : '';
          }
        }

        // Prepare custom actions based on component type
        let customActions = {};
        if (variation.component_type === 'cta') {
          // CTA components should default to checkout
          customActions = {
            "cta-button": {
              "type": "checkout",
              "amount": onboardingData.selectedProduct.price,
              "productId": onboardingData.selectedProduct.id
            }
          };
        } else {
          // Non-CTA components should default to scroll to CTA section
          // We'll use a generic target ID that will be updated when CTA component is created
          customActions = {
            "cta-button": {
              "type": "scroll",
              "targetId": "cta-section"
            }
          };
        }

        // Handle images based on user preference
        if (onboardingData.useProductImages && onboardingData.selectedProductMedia && onboardingData.selectedProductMedia.length > 0) {
          // Use product media images
          const primaryImage = onboardingData.selectedProductMedia[0]?.file_url;
          const secondaryImage = onboardingData.selectedProductMedia[1]?.file_url || primaryImage;
          
          if (primaryImage) {
            finalContent.productImage = primaryImage;
            finalContent.dashboardImage = primaryImage;
            finalContent.template1Image = primaryImage;
            finalContent.brandLogoIcon = primaryImage;
            finalContent.professionalImage = secondaryImage || primaryImage;
          }
        } else if (onboardingData.useProductImages && onboardingData.selectedProduct?.preview_image_url) {
          // Fallback to preview image if no media found
          finalContent.productImage = onboardingData.selectedProduct.preview_image_url;
          finalContent.dashboardImage = onboardingData.selectedProduct.preview_image_url;
          finalContent.template1Image = onboardingData.selectedProduct.preview_image_url;
          finalContent.brandLogoIcon = onboardingData.selectedProduct.preview_image_url;
          finalContent.professionalImage = onboardingData.selectedProduct.preview_image_url;
        }

        // Alternate background gradient direction for each component
        let componentBackground = palette.backgroundColor;
        if (aiGeneratedContent.length > 1) {
          const angle = (i % 2 === 0) ? '135deg' : '45deg';
          componentBackground = palette.backgroundColor.replace(/linear-gradient\(([^,]+),/, `linear-gradient(${angle},`);
        }

        // Create the component
        const { data: newComponent, error: componentError } = await supabase
          .from('landing_page_components')
          .insert([{
            page_id: landingPage.id,
            component_variation_id: contentItem.variationId,
            order_index: i + 1,
            content: finalContent,
            custom_styles: {
              container: {
                backgroundColor: componentBackground,
                primaryColor: palette.primaryColor
              }
            },
            visibility: {
              secondaryButton: false
            },
            custom_actions: customActions
          }])
          .select()
          .single();

        if (componentError) throw componentError;
        
        console.log(`Created AI component ${newComponent.id} of type ${contentItem.componentType}`);

        // Step 5: Generate AI images if requested and component requires images
        if (onboardingData.generateAIImages && variation.required_images && variation.required_images > 0) {
          try {
            toast({
              title: "AI is working...",
              description: `Generating custom images for ${contentItem.componentType} component...`,
            });

            console.log(`Generating AI images for component ${newComponent.id} (requires ${variation.required_images} images)...`);

            const productName = onboardingData.selectedProduct?.title || 'Product';
            const productDescription = effectiveDescription;
            const componentType = variation.component_type;
            const requiredImagesCount = variation.required_images || 0;

            // Determine which images to generate based on component type and required count
            let imagesToGenerate: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = [];
            
            // Generate the exact number of images required by the component
            if (componentType === 'hero') {
              const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['hero', 'product'];
              imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
            } else if (componentType === 'features') {
              const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['feature', 'product'];
              imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
            } else if (componentType === 'testimonials') {
              const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['testimonial', 'product'];
              imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
            } else if (componentType === 'cta') {
              const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['product', 'background'];
              imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
            } else if (componentType === 'pricing') {
              const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['background', 'product'];
              imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
            } else {
              // Generic fallback for other component types
              const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['product', 'background', 'feature'];
              imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
            }

            console.log(`Will generate ${imagesToGenerate.length} images for ${componentType} component:`, imagesToGenerate);

            // Only generate if we have images to generate
            if (imagesToGenerate.length > 0) {
              // Generate and upload images directly to the component
              const generatedImages = await aiImageService.generateAndUploadComponentImages(
                productName,
                productDescription,
                imagesToGenerate,
                newComponent.id,
                'modern'
              );

              // Update component content with uploaded image URLs
              const updatedContent = { ...finalContent };
              
              // Map generated images to component fields based on component type and available images
              const imageFieldMapping = getImageFieldNames(contentItem.variationId, variation);
              let fieldIndex = 0;

              // Map the generated images to the appropriate fields
              imagesToGenerate.forEach((imageType, index) => {
                if (generatedImages[imageType] && fieldIndex < imageFieldMapping.length) {
                  const fieldName = imageFieldMapping[fieldIndex];
                  updatedContent[fieldName] = generatedImages[imageType];
                  console.log(`Mapped ${imageType} image to field ${fieldName}`);
                  fieldIndex++;
                }
              });

              // Legacy mapping for specific component types (fallback)
              if (componentType === 'hero') {
                if (generatedImages.hero && !updatedContent.productImage) {
                  updatedContent.productImage = generatedImages.hero;
                  updatedContent.dashboardImage = generatedImages.hero;
                }
                if (generatedImages.product && !updatedContent.template1Image) {
                  updatedContent.template1Image = generatedImages.product;
                  updatedContent.brandLogoIcon = generatedImages.product;
                  updatedContent.professionalImage = generatedImages.product;
                }
              } else if (componentType === 'features') {
                if (generatedImages.feature && !updatedContent.featureImage) {
                  updatedContent.featureImage = generatedImages.feature;
                }
              } else if (componentType === 'testimonials') {
                if (generatedImages.testimonial && !updatedContent.testimonialImage) {
                  updatedContent.testimonialImage = generatedImages.testimonial;
                }
              } else if (componentType === 'cta') {
                if (generatedImages.product && !updatedContent.template1Image) {
                  updatedContent.template1Image = generatedImages.product;
                  updatedContent.brandLogoIcon = generatedImages.product;
                  updatedContent.professionalImage = generatedImages.product;
                }
              } else if (componentType === 'pricing') {
                if (generatedImages.background && !updatedContent.backgroundImage) {
                  updatedContent.backgroundImage = generatedImages.background;
                }
              }

              // Update component content with new image URLs
              await supabase
                .from('landing_page_components')
                .update({ content: updatedContent })
                .eq('id', newComponent.id);

              console.log(`✅ AI images generated and applied to component ${newComponent.id}:`, generatedImages);
              
              const generatedCount = Object.keys(generatedImages).length;
              toast({
                title: "Images Generated!",
                description: `${generatedCount} custom image${generatedCount !== 1 ? 's' : ''} created for ${contentItem.componentType} component`,
              });
            } else {
              console.log(`No images to generate for component type: ${componentType}`);
            }
          } catch (error) {
            console.error('AI image generation failed for component:', error);
            toast({
              title: "AI Image Generation",
              description: "Some images couldn't be generated, but your landing page was still created",
              variant: "destructive"
            });
          }
        } else if (onboardingData.generateAIImages && (!variation.required_images || variation.required_images === 0)) {
          console.log(`Skipping AI image generation for ${contentItem.componentType} - component doesn't require images (required_images: ${variation.required_images})`);
        }
      }

      // Step 6: Update scroll target IDs for non-CTA components
      // Find the CTA component and update other components to scroll to it
      const { data: allComponents, error: fetchComponentsError } = await supabase
        .from('landing_page_components')
        .select('id, component_variation_id, custom_actions')
        .eq('page_id', landingPage.id);

      if (fetchComponentsError) {
        console.warn('Could not fetch components to update scroll targets:', fetchComponentsError);
      } else {
        // Find CTA component
        const ctaComponent = allComponents?.find(comp => {
          const variation = selectedVariations.find(v => v.id === comp.component_variation_id);
          return variation?.component_type === 'cta';
        });

        if (ctaComponent) {
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

      toast({
        title: "Success!",
        description: "AI-powered landing page created successfully",
      });

      // Small delay to ensure database writes are committed
      await new Promise(resolve => setTimeout(resolve, 1000));

      navigate('/');
    } catch (error) {
      console.error('Error creating AI landing page:', error);
      toast({
        title: "Error",
        description: `Failed to create landing page: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Select Product
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Choose the product you want to create a landing page for
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No products available</p>
                  <p className="text-sm text-gray-400">Please create a product first before generating a landing page</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition-all border-2 ${
                        onboardingData.selectedProduct?.id === product.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={async () => {
                        setOnboardingData(prev => ({ ...prev, selectedProduct: product }));
                        await fetchProductMedia(product.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                            onboardingData.selectedProduct?.id === product.id 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {onboardingData.selectedProduct?.id === product.id && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          
                          {product.preview_image_url ? (
                            <img 
                              src={product.preview_image_url} 
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                              <span className="text-lg font-bold text-green-600">
                                {product.price} TND
                              </span>
                            </div>
                            
                            {product.original_price && product.original_price !== product.price && (
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm text-gray-400 line-through">
                                  {product.original_price} TND
                                </span>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Sale
                                </span>
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {product.description || 'No description available'}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {product.preview_image_url && (
                                <span className="flex items-center">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Has images
                                </span>
                              )}
                              {product.tags && product.tags.length > 0 && (
                                <span className="flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                  {product.tags.length} tags
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Product Description
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Choose how to describe your product for maximum impact on your landing page
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  {/* Use Product Description Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      onboardingData.useProductDescription 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ 
                      ...prev, 
                      useProductDescription: true,
                      customDescription: ''
                    }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          onboardingData.useProductDescription 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {onboardingData.useProductDescription && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <Label className="text-sm font-semibold text-gray-900">
                              Use existing product description
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Perfect for maintaining consistency with your product listings
                          </p>
                          {onboardingData.selectedProduct?.description && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1">Current description:</p>
                              <p className="text-sm text-gray-700 line-clamp-3">
                                "{onboardingData.selectedProduct.description}"
                              </p>
                            </div>
                          )}
                          {!onboardingData.selectedProduct?.description && (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <p className="text-xs text-amber-700">
                                No description available for this product
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Description Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      !onboardingData.useProductDescription 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ 
                      ...prev, 
                      useProductDescription: false
                    }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          !onboardingData.useProductDescription 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {!onboardingData.useProductDescription && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Wand2 className="h-4 w-4 text-green-600" />
                            <Label className="text-sm font-semibold text-gray-900">
                              Create custom description
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Write a compelling description specifically optimized for conversions
                          </p>
                          {!onboardingData.useProductDescription && (
                            <div className="mt-3">
                              <Textarea
                                placeholder="Enter a compelling description that highlights your product's unique value proposition..."
                                value={onboardingData.customDescription}
                                onChange={(e) => setOnboardingData(prev => ({ 
                                  ...prev, 
                                  customDescription: e.target.value 
                                }))}
                                className="min-h-[100px] resize-none"
                                rows={4}
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                💡 Tip: Focus on benefits, use action words, and highlight what makes your product special
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Character count for custom description */}
                {!onboardingData.useProductDescription && onboardingData.customDescription && (
                  <div className="text-right">
                    <span className={`text-xs ${
                      onboardingData.customDescription.length > 500 
                        ? 'text-amber-600' 
                        : 'text-gray-500'
                    }`}>
                      {onboardingData.customDescription.length} characters
                      {onboardingData.customDescription.length > 500 && ' (consider shortening for better impact)'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="mr-2 h-5 w-5" />
                Product Images
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Choose how to handle images for your landing page
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  {/* Use Product Images Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      onboardingData.useProductImages 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ 
                      ...prev, 
                      useProductImages: true,
                      generateAIImages: false
                    }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          onboardingData.useProductImages 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {onboardingData.useProductImages && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Camera className="h-4 w-4 text-blue-600" />
                            <Label className="text-sm font-semibold text-gray-900">
                              Use existing product images
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Perfect for showcasing authentic product visuals and building trust
                          </p>
                          {onboardingData.selectedProductMedia && onboardingData.selectedProductMedia.length > 0 ? (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 mb-2">
                                Available images ({onboardingData.selectedProductMedia.length}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {onboardingData.selectedProductMedia.slice(0, 4).map((media, index) => (
                                  <img 
                                    key={media.id}
                                    src={media.file_url} 
                                    alt={`Product image ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border shadow-sm"
                                  />
                                ))}
                                {onboardingData.selectedProductMedia.length > 4 && (
                                  <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      +{onboardingData.selectedProductMedia.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : onboardingData.selectedProduct?.preview_image_url ? (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 mb-2">Preview image only:</p>
                              <img 
                                src={onboardingData.selectedProduct.preview_image_url} 
                                alt="Product preview"
                                className="w-24 h-24 object-cover rounded border shadow-sm"
                              />
                              <p className="text-xs text-amber-600 mt-2">
                                💡 Consider uploading more product images for better variety
                              </p>
                            </div>
                          ) : (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <p className="text-xs text-amber-700">
                                ⚠️ No product images available - consider uploading images to your product first
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Generated Images Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      onboardingData.generateAIImages 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ 
                      ...prev, 
                      generateAIImages: true,
                      useProductImages: false
                    }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          onboardingData.generateAIImages 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300'
                        }`}>
                          {onboardingData.generateAIImages && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <Label className="text-sm font-semibold text-gray-900">
                              Generate AI images
                            </Label>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                              ✨ Available
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Let AI create custom, professional images based on your product description
                          </p>
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-700">
                              ✨ AI will generate hero images, product mockups, and visual elements tailored to your brand
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* No Images Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      !onboardingData.useProductImages && !onboardingData.generateAIImages 
                        ? 'border-gray-500 bg-gray-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ 
                      ...prev, 
                      useProductImages: false,
                      generateAIImages: false
                    }))}
                  >
                   
                  </Card>
                </div>

              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Language & Final Settings
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Choose your target language and review your configuration
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Target Language</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* English Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      onboardingData.language === 'en' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, language: 'en' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                        onboardingData.language === 'en' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.language === 'en' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="text-2xl mb-1">🇺🇸</div>
                      <Label className="text-sm font-semibold">English</Label>
                      <p className="text-xs text-gray-500 mt-1">Left-to-Right (LTR)</p>
                    </CardContent>
                  </Card>

                  {/* French Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      onboardingData.language === 'fr' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, language: 'fr' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                        onboardingData.language === 'fr' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.language === 'fr' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="text-2xl mb-1">🇫🇷</div>
                      <Label className="text-sm font-semibold">Français</Label>
                      <p className="text-xs text-gray-500 mt-1">Left-to-Right (LTR)</p>
                    </CardContent>
                  </Card>

                  {/* Arabic Option */}
                  <Card 
                    className={`cursor-pointer transition-all border-2 ${
                      onboardingData.language === 'ar' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setOnboardingData(prev => ({ ...prev, language: 'ar' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-4 h-4 rounded-full border-2 mx-auto mb-2 flex items-center justify-center ${
                        onboardingData.language === 'ar' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.language === 'ar' && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div className="text-2xl mb-1">🇸🇦</div>
                      <Label className="text-sm font-semibold">العربية</Label>
                      <p className="text-xs text-gray-500 mt-1">Right-to-Left (RTL)</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
            

           
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}> 
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create Landing Page</h1>
            <p className="text-gray-600">Step {currentStep} of 4</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={
                (currentStep === 1 && !onboardingData.selectedProduct) ||
                (currentStep === 2 && !onboardingData.useProductDescription && !onboardingData.customDescription.trim())
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={generateLandingPageWithAI}
              disabled={loading || !onboardingData.selectedProduct}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating with AI...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Onboarding;