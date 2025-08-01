/**
 * Hero Class Maps - Index
 * 
 * Centralized exports for all hero variation class maps
 * Used by both React components and static transformer
 */

export * from './hero-variation-1';
export * from './hero-variation-2';
export * from './hero-variation-3';
export * from './hero-variation-4';
export * from './hero-variation-5';
export * from './hero-variation-6';

// Type helpers for transformer
export type HeroVariationNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeroClassMapModule {
  classMaps: any;
  metadata: {
    componentType: 'hero';
    variationNumber: HeroVariationNumber;
    elements: readonly string[];
    hasImage?: boolean;
    hasButtons?: boolean;
    hasPricing?: boolean;
    hasStats?: boolean;
    hasVideo?: boolean;
    hasFeatures?: boolean;
    hasBackground?: boolean;
    hasEmailCapture?: boolean;
    hasTrustSignals?: boolean;
    hasBenefits?: boolean;
  };
}

// Dynamic import function for transformer
export const getHeroClassMaps = (variationNumber: HeroVariationNumber): Promise<HeroClassMapModule> => {
  switch (variationNumber) {
    case 1:
      return import('./hero-variation-1').then(module => ({
        classMaps: module.heroVariation1ClassMaps,
        metadata: module.heroVariation1Metadata
      }));
    case 2:
      return import('./hero-variation-2').then(module => ({
        classMaps: module.heroVariation2ClassMaps,
        metadata: module.heroVariation2Metadata
      }));
    case 3:
      return import('./hero-variation-3').then(module => ({
        classMaps: module.heroVariation3ClassMaps,
        metadata: module.heroVariation3Metadata
      }));
    case 4:
      return import('./hero-variation-4').then(module => ({
        classMaps: module.heroVariation4ClassMaps,
        metadata: module.heroVariation4Metadata
      }));
    case 5:
      return import('./hero-variation-5').then(module => ({
        classMaps: module.heroVariation5ClassMaps,
        metadata: module.heroVariation5Metadata
      }));
    case 6:
      return import('./hero-variation-6').then(module => ({
        classMaps: module.heroVariation6ClassMaps,
        metadata: module.heroVariation6Metadata
      }));
    default:
      throw new Error(`Hero variation ${variationNumber} not found`);
  }
};
