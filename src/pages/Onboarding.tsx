import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Upload, Palette, Globe, Package, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, Product, ComponentVariation } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ColorPicker } from "@/components/builder/ColorPicker";
import { mediaService } from '@/services/media';

interface OnboardingData {
  selectedProduct?: Product;
  language: 'en' | 'fr' | 'ar';
  selectedComponents: string[];
  componentContent: Record<string, any>;
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

  const generateLandingPage = async () => {
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
      // Pick a random color palette
      const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      // Create landing page
      // Generate slug from product title, optimized for URL
      const rawTitle = onboardingData.selectedProduct.title || '';
      const slug = rawTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Collapse multiple hyphens
        .replace(/^-+|-+$/g, '');      // Trim hyphens from start/end
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
            description: onboardingData.selectedProduct.description || '',
            keywords: onboardingData.selectedProduct.tags || [],
            ogImage: onboardingData.selectedProduct.preview_image_url || '',
            canonical: ''
          },
          status: 'draft'
        }])
        .select()
        .single();

      if (pageError) throw pageError;

      // Create components
      for (let i = 0; i < onboardingData.selectedComponents.length; i++) {
        const componentId = onboardingData.selectedComponents[i];
        const componentContent = onboardingData.componentContent[componentId] || {};
        
        // Find the component variation info
        const variation = componentVariations.find(v => v.id === componentId);
        
        // Use the mapping function to get the correctly named image fields
        const imageUrls = mapImageKeysToFieldNames(componentContent, componentId, variation);
        
        // Clean content (remove image URLs)
        const cleanContent: Record<string, any> = {};
        Object.keys(componentContent).forEach(key => {
          if (!key.startsWith('image') || !(typeof componentContent[key] === 'string' && componentContent[key].startsWith('http'))) {
            cleanContent[key] = componentContent[key];
          }
        });

        // Insert product price and original_price as default content if not present
        if (onboardingData.selectedProduct) {
          if (cleanContent.price === undefined) {
            cleanContent.price = onboardingData.selectedProduct.price;
          }
          if (cleanContent.originalPrice === undefined && onboardingData.selectedProduct.original_price !== undefined) {
            if (onboardingData.selectedProduct.price === onboardingData.selectedProduct.original_price) {
              cleanContent.originalPrice = '';
            } else {
              cleanContent.originalPrice = onboardingData.selectedProduct.original_price;
            }
          }
        }

        // Alternate background gradient direction for each component
        let componentBackground = palette.backgroundColor;
        if (onboardingData.selectedComponents.length > 1) {
          // Odd index (i=0,2,4...) => 135deg, Even index (i=1,3,5...) => 45deg
          const angle = (i % 2 === 0) ? '135deg' : '45deg';
          componentBackground = palette.backgroundColor.replace(/linear-gradient\(([^,]+),/, `linear-gradient(${angle},`);
        }

        // Create the component with clean content (no image URLs)
        const { data: newComponent, error: componentError } = await supabase
          .from('landing_page_components')
          .insert([{
            page_id: landingPage.id,
            component_variation_id: componentId,
            order_index: i + 1, // Use increments of 1 instead of 10
            content: cleanContent, // Content without image URLs
            custom_styles: {
              container: {
                backgroundColor: componentBackground,
                primaryColor: palette.primaryColor
              }
            },
            visibility: {
              secondaryButton: false
            },
            media_urls: imageUrls // Save image URLs to media_urls column with correct field names
          }])
          .select()
          .single();

        if (componentError) throw componentError;
        
        console.log(`Created component ${newComponent.id} with ${Object.keys(imageUrls).length} images in media_urls:`, imageUrls);
      }

      toast({
        title: "Success!",
        description: "Landing page created successfully",
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating landing page:', error);
      toast({
        title: "Error",
        description: "Failed to create landing page",
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
            </CardHeader>
            <CardContent className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products available. Please create a product first.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card 
                      key={product.id} 
                      className={`cursor-pointer transition-all ${
                        onboardingData.selectedProduct?.id === product.id 
                          ? 'ring-2 ring-blue-500' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setOnboardingData(prev => ({ ...prev, selectedProduct: product }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {product.preview_image_url && (
                            <img 
                              src={product.preview_image_url} 
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                            <p className="text-lg font-bold text-green-600 mt-2">
                              {product.price} TND
                            </p>
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
                <Globe className="mr-2 h-5 w-5" />
                Language & Direction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Language</Label>
                <Select 
                  value={onboardingData.language} 
                  onValueChange={(value: 'en' | 'fr' | 'ar') => 
                    setOnboardingData(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (LTR)</SelectItem>
                    <SelectItem value="fr">Français (LTR)</SelectItem>
                    <SelectItem value="ar">العربية (RTL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Select Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta'].map((componentType) => {
                const variations = componentVariations.filter(v => v.component_type === componentType);
                
                if (variations.length === 0) {
                  return (
                    <div key={componentType}>
                      <h3 className="font-semibold capitalize mb-3">{componentType} Components</h3>
                      <p className="text-sm text-gray-500">No variations available for this component type.</p>
                    </div>
                  );
                }
                
                return (
                  <div key={componentType}>
                    <h3 className="font-semibold capitalize mb-3">{componentType} Components</h3>
                    <div className="grid gap-3">
                      {variations.map((variation) => (
                        <div key={variation.id} className="flex items-center space-x-3 p-3 border rounded">
                          <Checkbox
                            checked={onboardingData.selectedComponents.includes(variation.id)}
                            onCheckedChange={(checked) => 
                              handleComponentToggle(variation.id, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <p className="font-medium">{variation.variation_name}</p>
                            <p className="text-sm text-gray-600">{variation.description || 'No description available'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Component Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {onboardingData.selectedComponents.map((componentId) => {
                const variation = componentVariations.find(v => v.id === componentId);
                if (!variation) return null;

                const partLabels = variation.visibility_keys || {};
                const characterLimits = variation.character_limits || {};
                const availableParts = Object.keys(characterLimits);

                return (
                  <div key={componentId} className="border rounded p-4">
                    <h3 className="font-semibold mb-4">{variation.variation_name}</h3>
                    <div className="space-y-4">
                      {availableParts.map((part) => {
                        const limit = characterLimits[part];
                        const maxChars = limit?.max_characters;
                        const recommendedChars = limit?.recommended_characters;
                        
                        return (
                          <div key={part}>
                            <Label>{partLabels[part] || part}</Label>
                            {maxChars && maxChars > 200 ? (
                              <Textarea
                                placeholder={`Enter ${part}...`}
                                maxLength={maxChars}
                                value={onboardingData.componentContent[componentId]?.[part] || ''}
                                onChange={(e) => handleContentChange(componentId, part, e.target.value)}
                                className="resize-none"
                                rows={3}
                              />
                            ) : (
                              <Input
                                placeholder={`Enter ${part}...`}
                                maxLength={maxChars}
                                value={onboardingData.componentContent[componentId]?.[part] || ''}
                                onChange={(e) => handleContentChange(componentId, part, e.target.value)}
                              />
                            )}
                            {maxChars && (
                              <p className="text-xs text-gray-500 mt-1">
                                Max {maxChars} characters
                                {recommendedChars && ` (Recommended: ${recommendedChars})`}
                              </p>
                            )}
                          </div>
                        );
                      })}
                      
                      {variation.required_images > 0 && (
                        <div>
                          <Label>Images ({variation.required_images} required)</Label>
                          <div className="grid gap-4 mt-2">
                            {Array.from({ length: variation.required_images }).map((_, index) => (
                              <ImageUpload
                                key={index}
                                value={onboardingData.componentContent[componentId]?.[`image${index + 1}`] || ''}
                                onChange={(url) => handleImageChange(componentId, index, url)}
                                placeholder={`Upload image ${index + 1}`}
                                // Note: During onboarding, we don't use media service since component doesn't exist yet
                                // Images will be migrated to media_urls when components are created
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );

      // No step 5: color selection UI removed
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
                (currentStep === 3 && onboardingData.selectedComponents.length === 0)
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={generateLandingPage}
              disabled={loading || onboardingData.selectedComponents.length === 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Landing Page
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
