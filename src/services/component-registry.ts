/**
 * Dynamic Component Registry for the Unified Transformer
 * 
 * This registry dynamically imports component variations and extracts:
 * - Class maps
 * - Metadata
 * - Structure information
 * 
 * This approach eliminates hardcoding and makes the transformer truly scalable.
 */

import { ComponentProps } from '@/types/components';

// Type definitions for component exports
export interface ComponentClassMaps {
  [elementName: string]: {
    mobile: string;
    tablet: string;
    desktop: string;
    responsive: string;
  };
}

export interface ComponentMetadata {
  componentType: string;
  variationNumber: number;
  elements: string[];
  hasImage?: boolean;
  hasButtons?: boolean;
  hasPricing?: boolean;
  hasForm?: boolean;
  sections?: string[];
}

export interface ComponentExports {
  default: React.ComponentType<ComponentProps>;
  classMaps?: ComponentClassMaps;
  metadata?: ComponentMetadata;
}

// Component variation mapping for dynamic imports
const COMPONENT_VARIATIONS = {
  hero: {
    1: () => import('@/components/landing-components/hero/HeroVariation1'),
    2: () => import('@/components/landing-components/hero/HeroVariation2'),
    3: () => import('@/components/landing-components/hero/HeroVariation3'),
    4: () => import('@/components/landing-components/hero/HeroVariation4'),
    5: () => import('@/components/landing-components/hero/HeroVariation5'),
    6: () => import('@/components/landing-components/hero/HeroVariation6'),
  },
  features: {
    1: () => import('@/components/landing-components/features/FeaturesVariation1'),
    2: () => import('@/components/landing-components/features/FeaturesVariation2'),
    3: () => import('@/components/landing-components/features/FeaturesVariation3'),
    4: () => import('@/components/landing-components/features/FeaturesVariation4'),
  },
  cta: {
    1: () => import('@/components/landing-components/cta/CtaVariation1'),
    2: () => import('@/components/landing-components/cta/CtaVariation2'),
    3: () => import('@/components/landing-components/cta/CtaVariation3'),
  },
  testimonials: {
    1: () => import('@/components/landing-components/testimonials/TestimonialsVariation1'),
  },
  pricing: {
    1: () => import('@/components/landing-components/pricing/PricingVariation1'),
  },
  faq: {
    1: () => import('@/components/landing-components/faq/FaqVariation1'),
  },
} as const;

// Cache for loaded components to avoid repeated imports
const componentCache = new Map<string, ComponentExports>();

/**
 * Dynamic Component Registry Class
 */
export class ComponentRegistry {
  /**
   * Get component exports (class maps, metadata, component) for a specific variation
   */
  async getComponentExports(
    componentType: string, 
    variationNumber: number
  ): Promise<ComponentExports | null> {
    const cacheKey = `${componentType}-${variationNumber}`;
    
    // Return from cache if available
    if (componentCache.has(cacheKey)) {
      return componentCache.get(cacheKey)!;
    }

    try {
      // Get dynamic import function
      const importFn = COMPONENT_VARIATIONS[componentType as keyof typeof COMPONENT_VARIATIONS]?.[variationNumber];
      
      if (!importFn) {
        console.warn(`Component variation not found: ${componentType}-${variationNumber}`);
        return null;
      }

      // Import the component module
      const componentModule = await importFn();
      
      // Extract exports
      const exports: ComponentExports = {
        default: componentModule.default,
        classMaps: this.extractClassMaps(componentModule),
        metadata: this.extractMetadata(componentModule, componentType, variationNumber)
      };

      // Cache the result
      componentCache.set(cacheKey, exports);
      
      return exports;
    } catch (error) {
      console.error(`Failed to load component ${componentType}-${variationNumber}:`, error);
      return null;
    }
  }

  /**
   * Extract class maps from component module
   * Looks for exports like "HeroVariation1ClassMaps"
   */
  private extractClassMaps(componentModule: any): ComponentClassMaps | undefined {
    // Look for class maps export
    const classMapKeys = Object.keys(componentModule).filter(key => 
      key.includes('ClassMaps') || key.includes('ClassMap')
    );
    
    if (classMapKeys.length > 0) {
      return componentModule[classMapKeys[0]];
    }

    // If no explicit export, try to extract from component source (fallback)
    return this.extractClassMapsFromSource(componentModule);
  }

  /**
   * Extract metadata from component module
   * Looks for exports like "HeroVariation1Metadata"
   */
  private extractMetadata(
    componentModule: any, 
    componentType: string, 
    variationNumber: number
  ): ComponentMetadata | undefined {
    // Look for metadata export
    const metadataKeys = Object.keys(componentModule).filter(key => 
      key.includes('Metadata')
    );
    
    if (metadataKeys.length > 0) {
      return componentModule[metadataKeys[0]];
    }

    // Create default metadata
    return {
      componentType,
      variationNumber,
      elements: this.getDefaultElements(componentType),
      hasImage: this.componentTypeHasImage(componentType),
      hasButtons: this.componentTypeHasButtons(componentType),
      hasPricing: this.componentTypeHasPricing(componentType)
    };
  }

  /**
   * Fallback method to extract class maps from component source
   * This is a backup if explicit exports are not available
   */
  private extractClassMapsFromSource(componentModule: any): ComponentClassMaps | undefined {
    // This would require analyzing the component source code
    // For now, return undefined to force explicit exports
    return undefined;
  }

  /**
   * Get default elements for a component type
   */
  private getDefaultElements(componentType: string): string[] {
    const elementMap = {
      hero: ['container', 'grid', 'leftContent', 'rightContent', 'badge', 'headline', 'subheadline', 'priceContainer', 'buttonsContainer'],
      features: ['container', 'sectionTitle', 'description', 'grid', 'featureCard', 'iconContainer', 'featureTitle', 'featureDescription'],
      cta: ['container', 'card', 'headline', 'subheadline', 'ctaButton'],
      testimonials: ['container', 'sectionTitle', 'description', 'grid', 'testimonialCard', 'avatar', 'quote', 'authorName'],
      pricing: ['container', 'sectionTitle', 'description', 'grid', 'pricingCard', 'planName'],
      faq: ['container', 'sectionTitle', 'description', 'grid', 'faqItem', 'question', 'answer']
    };

    return elementMap[componentType as keyof typeof elementMap] || ['container', 'headline', 'subheadline'];
  }

  /**
   * Check if component type typically has images
   */
  private componentTypeHasImage(componentType: string): boolean {
    return ['hero', 'testimonials'].includes(componentType);
  }

  /**
   * Check if component type typically has buttons
   */
  private componentTypeHasButtons(componentType: string): boolean {
    return ['hero', 'cta', 'pricing'].includes(componentType);
  }

  /**
   * Check if component type typically has pricing
   */
  private componentTypeHasPricing(componentType: string): boolean {
    return ['hero', 'pricing'].includes(componentType);
  }

  /**
   * Get all available component types
   */
  getAvailableComponentTypes(): string[] {
    return Object.keys(COMPONENT_VARIATIONS);
  }

  /**
   * Get available variations for a component type
   */
  getAvailableVariations(componentType: string): number[] {
    const variations = COMPONENT_VARIATIONS[componentType as keyof typeof COMPONENT_VARIATIONS];
    return variations ? Object.keys(variations).map(Number) : [];
  }

  /**
   * Check if a component variation exists
   */
  hasComponentVariation(componentType: string, variationNumber: number): boolean {
    const variations = COMPONENT_VARIATIONS[componentType as keyof typeof COMPONENT_VARIATIONS];
    return variations ? variationNumber in variations : false;
  }

  /**
   * Clear cache for development/testing
   */
  clearCache(): void {
    componentCache.clear();
  }
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();
