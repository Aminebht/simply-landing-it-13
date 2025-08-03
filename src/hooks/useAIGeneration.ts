import { useState } from 'react';
import { 
  AIGenerationService, 
  AIGenerationRequest, 
  AIGeneratedContent,
  ComponentSelectionRequest,
  ComponentSelectionResponse,
  ContentGenerationRequest
} from '@/services/ai-generation';

export const useAIGeneration = (apiKey?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const aiService = apiKey ? new AIGenerationService(apiKey) : null;

  const generateContent = async (request: AIGenerationRequest): Promise<AIGeneratedContent | null> => {
    if (!aiService) {
      setError('AI API key not configured');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const content = await aiService.generateContent(request);
      return content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (
    prompt: string, 
    style: 'realistic' | 'illustration' | 'minimal' = 'realistic'
  ): Promise<string | null> => {
    if (!aiService) {
      setError('AI API key not configured');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await aiService.generateImage(prompt, style);
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeContent = async (
    content: string,
    goal: 'conversion' | 'engagement' | 'clarity'
  ): Promise<string | null> => {
    if (!aiService) {
      setError('AI API key not configured');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const optimizedContent = await aiService.optimizeContent(content, goal);
      return optimizedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize content';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHeroContent = async (
    productType: string,
    targetAudience: string,
    language: 'en' | 'fr' | 'ar' = 'en',
    tone: 'professional' | 'casual' | 'persuasive' | 'friendly' = 'professional'
  ) => {
    return generateContent({
      productType,
      targetAudience,
      language,
      tone,
      componentType: 'hero',
    });
  };

  const generateFeaturesContent = async (
    productType: string,
    targetAudience: string,
    language: 'en' | 'fr' | 'ar' = 'en',
    context?: string
  ) => {
    return generateContent({
      productType,
      targetAudience,
      language,
      tone: 'professional',
      componentType: 'features',
      context,
    });
  };

  const generateTestimonialsContent = async (
    productType: string,
    targetAudience: string,
    language: 'en' | 'fr' | 'ar' = 'en'
  ) => {
    return generateContent({
      productType,
      targetAudience,
      language,
      tone: 'friendly',
      componentType: 'testimonials',
    });
  };

  const generateFAQContent = async (
    productType: string,
    targetAudience: string,
    language: 'en' | 'fr' | 'ar' = 'en'
  ) => {
    return generateContent({
      productType,
      targetAudience,
      language,
      tone: 'professional',
      componentType: 'faq',
    });
  };

  const generatePricingContent = async (
    productType: string,
    targetAudience: string,
    language: 'en' | 'fr' | 'ar' = 'en'
  ) => {
    return generateContent({
      productType,
      targetAudience,
      language,
      tone: 'persuasive',
      componentType: 'pricing',
    });
  };

  const generateCTAContent = async (
    productType: string,
    targetAudience: string,
    language: 'en' | 'fr' | 'ar' = 'en'
  ) => {
    return generateContent({
      productType,
      targetAudience,
      language,
      tone: 'persuasive',
      componentType: 'cta',
    });
  };

  const selectComponentVariations = async (request: ComponentSelectionRequest): Promise<ComponentSelectionResponse | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a temporary service just for this call since it doesn't need the OpenAI API key
      const tempService = new AIGenerationService('dummy-key');
      const selections = await tempService.selectComponentVariations(request);
      return selections;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select component variations';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComponentContent = async (request: ContentGenerationRequest) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Create a temporary service just for this call since it doesn't need the OpenAI API key
      const tempService = new AIGenerationService('dummy-key');
      const content = await tempService.generateComponentContent(request);
      return content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate component content';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    // State
    isGenerating,
    error,
    
    // General methods
    generateContent,
    generateImage,
    optimizeContent,
    
    // Component-specific methods
    generateHeroContent,
    generateFeaturesContent,
    generateTestimonialsContent,
    generateFAQContent,
    generatePricingContent,
    generateCTAContent,
    
    // New AI-powered onboarding methods
    selectComponentVariations,
    generateComponentContent,
    
    // Utility
    clearError: () => setError(null),
  };
};