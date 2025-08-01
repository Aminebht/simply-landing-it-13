/**
 * CTA Class Maps - Index
 * 
 * Centralized exports for all CTA variation class maps
 * Used by both React components and static transformer
 */

export * from './cta-variation-1';
export * from './cta-variation-2';
export * from './cta-variation-3';

// Type helpers for transformer
export type CtaVariationNumber = 1 | 2 | 3;

export interface CtaClassMapModule {
  classMaps: any;
  metadata: {
    componentType: 'cta';
    variationNumber: CtaVariationNumber;
    elements: readonly string[];
    hasImage?: boolean;
    hasButtons?: boolean;
    hasPricing?: boolean;
    hasStats?: boolean;
    hasFeatures?: boolean;
    hasBackground?: boolean;
    hasEmailCapture?: boolean;
    hasTrustSignals?: boolean;
    hasBenefits?: boolean;
    hasGradient?: boolean;
  };
}

// Dynamic import function for transformer
export const getCtaClassMaps = (variationNumber: CtaVariationNumber): Promise<CtaClassMapModule> => {
  switch (variationNumber) {
    case 1:
      return import('./cta-variation-1').then(module => ({
        classMaps: module.ctaVariation1ClassMaps,
        metadata: module.ctaVariation1Metadata
      }));
    case 2:
      return import('./cta-variation-2').then(module => ({
        classMaps: module.ctaVariation2ClassMaps,
        metadata: module.ctaVariation2Metadata
      }));
    case 3:
      return import('./cta-variation-3').then(module => ({
        classMaps: module.ctaVariation3ClassMaps,
        metadata: module.ctaVariation3Metadata
      }));
    default:
      throw new Error(`CTA variation ${variationNumber} not found`);
  }
};
