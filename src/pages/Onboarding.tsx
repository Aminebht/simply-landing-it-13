/**
 * Onboarding.tsx - AI-Powered Landing Page Creation (Refactored)
 * 
 * This is the main onboarding component that orchestrates the entire AI-powered
 * landing page creation process. It has been refactored into smaller, manageable pieces:
 * 
 * - Individual step components for better maintainability
 * - Custom hooks for data management
 * - Dedicated AI service for generation logic
 * - Helper utilities for common operations
 * - Type definitions for better type safety
 */

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";

// Custom hooks and services
import { useOnboardingData } from '@/hooks/useOnboardingData';
import { OnboardingAIService } from '@/services/onboarding-ai';

// Step components
import { ProductSelectionStep } from '@/components/onboarding/ProductSelectionStep';
import { DescriptionStep } from '@/components/onboarding/DescriptionStep';
import { ImageSelectionStep } from '@/components/onboarding/ImageSelectionStep';
import { LanguageStep } from '@/components/onboarding/LanguageStep';

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  
  const {
    products,
    componentVariations,
    loading,
    setLoading,
    onboardingData,
    setOnboardingData,
    fetchProductMedia,
  } = useOnboardingData();

  const aiService = new OnboardingAIService();

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
      const effectiveDescription = onboardingData.useProductDescription 
        ? onboardingData.selectedProduct.description || ''
        : onboardingData.customDescription;

      // Step 1: AI selects component variations
      toast({
        title: "AI is working...",
        description: "Selecting the best components for your product",
      });

      const selectedVariations = await aiService.selectComponentVariations(
        onboardingData.selectedProduct,
        effectiveDescription,
        onboardingData.language,
        componentVariations
      );

      console.log('Found AI-selected variations:', selectedVariations.length);

      // Step 2: Generate AI content for selected components
      toast({
        title: "Creating content...",
        description: "Generating compelling content with AI",
      });

      const aiGeneratedContent = await aiService.generateContentForComponents(
        onboardingData.selectedProduct,
        effectiveDescription,
        onboardingData.language,
        selectedVariations
      );

      // Step 3: Create landing page
      toast({
        title: "Creating your landing page...",
        description: "Setting up components and content",
      });

      const { landingPage, palette } = await aiService.createLandingPage(
        onboardingData.selectedProduct,
        effectiveDescription,
        onboardingData.language
      );

      // Step 4: Create components with AI-generated content
      for (let i = 0; i < aiGeneratedContent.length; i++) {
        const contentItem = aiGeneratedContent[i];
        const variation = selectedVariations.find(v => v.id === contentItem.variationId);
        
        if (!variation) {
          console.warn(`Variation not found for content item: ${contentItem.variationId}`);
          continue;
        }

        // Prepare content with images and product data
        const finalContent = aiService.prepareContentWithImages(
          contentItem.content,
          onboardingData.selectedProduct,
          onboardingData
        );

        // Prepare custom actions
        const customActions = aiService.prepareCustomActions(
          variation.component_type,
          onboardingData.selectedProduct
        );

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
        if (onboardingData.generateAIImages) {
          try {
            toast({
              title: "AI is working...",
              description: `Generating custom images for ${contentItem.componentType} component...`,
            });

            await aiService.generateAIImages(
              newComponent,
              variation,
              onboardingData.selectedProduct,
              effectiveDescription,
              contentItem
            );

            const generatedCount = variation.required_images || 0;
            if (generatedCount > 0) {
              toast({
                title: "Images Generated!",
                description: `${generatedCount} custom image${generatedCount !== 1 ? 's' : ''} created for ${contentItem.componentType} component`,
              });
            }
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

      // Step 6: Update scroll target IDs for non-CTA components
      await aiService.updateScrollTargetIds(landingPage.id, selectedVariations);

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
        description: `Failed to create landing page: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      onboardingData,
      setOnboardingData,
      products,
      onFetchProductMedia: fetchProductMedia,
    };

    switch (currentStep) {
      case 1:
        return <ProductSelectionStep {...stepProps} />;
      case 2:
        return <DescriptionStep {...stepProps} />;
      case 3:
        return <ImageSelectionStep {...stepProps} />;
      case 4:
        return <LanguageStep {...stepProps} />;
      default:
        return null;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return !!onboardingData.selectedProduct;
      case 2:
        return onboardingData.useProductDescription || !!onboardingData.customDescription.trim();
      case 3:
      case 4:
        return true;
      default:
        return false;
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
              disabled={!canProceedToNextStep()}
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
