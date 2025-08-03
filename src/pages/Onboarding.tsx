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

interface OnboardingData {
  selectedProduct?: Product;
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
    primaryColor: '#3b82f6', // Blue
    backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  },
  {
    primaryColor: '#ef4444', // Red
    backgroundColor: 'linear-gradient(135deg, #ef4444 0%, #f59e42 100%)',
  },
  {
    primaryColor: '#10b981', // Green
    backgroundColor: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
  },
  {
    primaryColor: '#a855f7', // Purple
    backgroundColor: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
  },
  {
    primaryColor: '#f59e42', // Orange
    backgroundColor: 'linear-gradient(135deg, #f59e42 0%, #fbbf24 100%)',
  },
  {
    primaryColor: '#6366f1', // Indigo
    backgroundColor: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
  },
  {
    primaryColor: '#f43f5e', // Pink
    backgroundColor: 'linear-gradient(135deg, #f43f5e 0%, #fbbf24 100%)',
  },
  {
    primaryColor: '#0ea5e9', // Sky
    backgroundColor: 'linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%)',
  },
  {
    primaryColor: '#22d3ee', // Cyan
    backgroundColor: 'linear-gradient(135deg, #22d3ee 0%, #a7f3d0 100%)',
  },
  {
    primaryColor: '#fbbf24', // Yellow
    backgroundColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e42 100%)',
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);
  const [loading, setLoading] = useState(false);

  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    language: 'en',
    selectedComponents: [],
    componentContent: {},
    useProductDescription: true,
    customDescription: '',
    useProductImages: true,
    generateAIImages: false,
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
      // Step 1: AI selects component variations
      toast({
        title: "AI is working...",
        description: "Selecting the best components for your product",
      });

      // Determine which description to use
      const effectiveDescription = onboardingData.useProductDescription 
        ? onboardingData.selectedProduct.description || ''
        : onboardingData.customDescription;

      // Use default component variations instead of AI selection
      // Select hero and CTA components by default
      const heroVariation = componentVariations.find(v => v.component_type === 'hero');
      const ctaVariation = componentVariations.find(v => v.component_type === 'cta');

      if (!heroVariation || !ctaVariation) {
        throw new Error('Default component variations not found');
      }

      console.log('Using default components:', { hero: heroVariation.id, cta: ctaVariation.id });

      // Step 2: Use default content with product information
      toast({
        title: "Creating content...",
        description: "Setting up your landing page with product information",
      });

      const selectedVariations = [heroVariation, ctaVariation];
      
      // Use default content with basic product substitution
      const generatedContent: Record<string, any> = {};
      selectedVariations.forEach(variation => {
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
        
        generatedContent[variation.id] = contentWithProduct;
      });

      console.log('Generated content with product info:', generatedContent);

      // Step 3: Create landing page with generated content
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

      // Create components with AI-generated content
      for (let i = 0; i < generatedContent.length; i++) {
        const contentItem = generatedContent[i];
        const variation = selectedVariations[i];
        
        // Add product pricing to content if applicable
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

        // Handle images based on user preference
        if (onboardingData.useProductImages && onboardingData.selectedProduct?.preview_image_url) {
          // Use product images
          finalContent.productImage = onboardingData.selectedProduct.preview_image_url;
          finalContent.dashboardImage = onboardingData.selectedProduct.preview_image_url;
          finalContent.template1Image = onboardingData.selectedProduct.preview_image_url;
          finalContent.brandLogoIcon = onboardingData.selectedProduct.preview_image_url;
          finalContent.professionalImage = onboardingData.selectedProduct.preview_image_url;
        }

        // Store AI generation request for later processing
        let aiImageGenerationRequest: {
          productName: string;
          productDescription: string;
          imagesToGenerate: Array<'hero' | 'feature' | 'testimonial' | 'product'>;
          imageMapping: Record<string, string[]>;
        } | null = null;

        if (onboardingData.generateAIImages) {
          const productName = onboardingData.selectedProduct?.title || 'Product';
          const productDescription = effectiveDescription;
          const componentType = variation.component_type;

          // Determine which images to generate based on component type
          let imagesToGenerate: Array<'hero' | 'feature' | 'testimonial' | 'product'> = [];
          let imageMapping: Record<string, string[]> = {};
          
          if (componentType === 'hero') {
            imagesToGenerate = ['hero', 'product'];
            imageMapping = {
              hero: ['productImage', 'dashboardImage'],
              product: ['template1Image', 'brandLogoIcon', 'professionalImage']
            };
          } else if (componentType === 'features') {
            imagesToGenerate = ['feature'];
            imageMapping = {
              feature: ['featureImage']
            };
          } else if (componentType === 'testimonials') {
            imagesToGenerate = ['testimonial'];
            imageMapping = {
              testimonial: ['testimonialImage']
            };
          } else if (componentType === 'cta') {
            imagesToGenerate = ['product'];
            imageMapping = {
              product: ['template1Image', 'brandLogoIcon', 'professionalImage']
            };
          }

          aiImageGenerationRequest = {
            productName,
            productDescription,
            imagesToGenerate,
            imageMapping
          };
        }

        // Alternate background gradient direction for each component
        let componentBackground = palette.backgroundColor;
        if (generatedContent.length > 1) {
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
            }
          }])
          .select()
          .single();

        if (componentError) throw componentError;
        
        console.log(`Created AI component ${newComponent.id} of type ${contentItem.componentType}`);

        // Generate and upload AI images after component creation
        if (aiImageGenerationRequest) {
          try {
            toast({
              title: "AI is working...",
              description: `Generating custom images for ${contentItem.componentType} component...`,
            });

            console.log(`Generating AI images for component ${newComponent.id}...`);

            // Generate and upload images directly to the component
            const generatedImages = await aiImageService.generateAndUploadComponentImages(
              aiImageGenerationRequest.productName,
              aiImageGenerationRequest.productDescription,
              aiImageGenerationRequest.imagesToGenerate,
              newComponent.id,
              'modern'
            );

            // Update component content with uploaded image URLs
            const updatedContent = { ...finalContent };
            for (const [imageType, contentFields] of Object.entries(aiImageGenerationRequest.imageMapping)) {
              if (generatedImages[imageType]) {
                // Map to content fields for immediate use
                contentFields.forEach(field => {
                  updatedContent[field] = generatedImages[imageType];
                });
              }
            }

            // Update component content with new image URLs
            await supabase
              .from('landing_page_components')
              .update({ content: updatedContent })
              .eq('id', newComponent.id);

            console.log(`✅ AI images generated and applied to component ${newComponent.id}:`, generatedImages);
            
            toast({
              title: "Images Generated!",
              description: `Custom images created for ${contentItem.componentType} component`,
            });
          } catch (error) {
            console.error('AI image generation failed for component:', error);
            toast({
              title: "AI Image Generation",
              description: "Some images couldn't be generated, but your landing page was still created",
              variant: "destructive"
            });
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
                      onClick={() => setOnboardingData(prev => ({ ...prev, selectedProduct: product }))}
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
                          {onboardingData.selectedProduct?.preview_image_url ? (
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 mb-2">Preview image:</p>
                              <img 
                                src={onboardingData.selectedProduct.preview_image_url} 
                                alt="Product preview"
                                className="w-24 h-24 object-cover rounded border shadow-sm"
                              />
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
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                          !onboardingData.useProductImages && !onboardingData.generateAIImages 
                            ? 'border-gray-500 bg-gray-500' 
                            : 'border-gray-300'
                        }`}>
                          {!onboardingData.useProductImages && !onboardingData.generateAIImages && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <Label className="text-sm font-semibold text-gray-900">
                              Text-only landing page
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Create a clean, minimal landing page focused on compelling copy
                          </p>
                          <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600">
                              📝 Perfect for service-based products or when you want to focus on strong messaging
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Smart Recommendation */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center mb-2">
                    <Wand2 className="h-4 w-4 text-amber-600 mr-2" />
                    <h4 className="font-medium text-amber-900">Smart Recommendation</h4>
                  </div>
                  <p className="text-amber-700 text-sm">
                    {onboardingData.selectedProduct?.preview_image_url 
                      ? "✅ Your product has existing images. Using them will create a more authentic and trustworthy landing page."
                      : "💡 No product images found. Consider uploading product images first, or use AI generation for professional visuals."
                    }
                  </p>
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
              
              {/* AI Generation Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <Wand2 className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">AI-Powered Generation</h3>
                </div>
                <p className="text-blue-700 text-sm mb-3">
                  Our AI will create a stunning landing page automatically:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-700 text-sm">
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Select optimal components
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Generate compelling content
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Apply professional styling
                  </div>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Optimize for conversions
                  </div>
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Configuration Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-gray-600 text-sm">Product:</span>
                    <span className="font-medium text-sm">{onboardingData.selectedProduct?.title}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-gray-600 text-sm">Description:</span>
                    <span className="font-medium text-sm flex items-center">
                      {onboardingData.useProductDescription ? (
                        <>
                          <FileText className="h-3 w-3 mr-1 text-blue-600" />
                          Product description
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3 mr-1 text-green-600" />
                          Custom description
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-gray-600 text-sm">Images:</span>
                    <span className="font-medium text-sm flex items-center">
                      {onboardingData.useProductImages ? (
                        <>
                          <Camera className="h-3 w-3 mr-1 text-blue-600" />
                          Product images
                        </>
                      ) : onboardingData.generateAIImages ? (
                        <>
                          <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
                          AI generated
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3 mr-1 text-gray-600" />
                          Text only
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-gray-600 text-sm">Language:</span>
                    <span className="font-medium text-sm flex items-center">
                      <Globe className="h-3 w-3 mr-1 text-blue-600" />
                      {onboardingData.language === 'en' ? 'English' : 
                       onboardingData.language === 'fr' ? 'Français' : 'العربية'}
                      <span className="text-xs text-gray-500 ml-1">
                        ({onboardingData.language === 'ar' ? 'RTL' : 'LTR'})
                      </span>
                    </span>
                  </div>
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
