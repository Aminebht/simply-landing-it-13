/**
 * CTA Variation 2 - Class Maps
 * 
 * Shared class maps for CTA Variation 2 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './cta-variation-1';

export interface CtaVariation2ClassMaps {
  container: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  priceRow: ClassMap;
  originalPrice: ClassMap;
  price: ClassMap;
  form: ClassMap;
  button: ClassMap;
  guaranteeText: ClassMap;
  [key: string]: ClassMap;
}

export const ctaVariation2ClassMaps: CtaVariation2ClassMaps = {
  container: {
    mobile: 'flex flex-col items-center justify-center min-h-screen w-full px-4',
    tablet: 'flex flex-col items-center justify-center min-h-screen w-full px-8',
    desktop: 'flex flex-col items-center justify-center min-h-screen w-full px-16',
    responsive: 'flex flex-col items-center justify-center min-h-screen w-full px-4 md:px-8 lg:px-16'
  },
  headline: {
    mobile: 'font-bold text-2xl mb-4 text-center',
    tablet: 'font-bold text-4xl mb-4 text-center',
    desktop: 'font-bold text-5xl mb-4 text-center',
    responsive: 'font-bold text-2xl mb-4 text-center md:text-4xl lg:text-5xl'
  },
  subheadline: {
    mobile: 'text-gray-400 text-lg mb-6 text-center',
    tablet: 'text-gray-400 text-xl mb-6 text-center',
    desktop: 'text-gray-400 text-xl mb-6 text-center',
    responsive: 'text-gray-400 text-lg mb-6 text-center md:text-xl'
  },
  priceRow: {
    mobile: 'flex flex-row items-center justify-center gap-4 mb-6',
    tablet: 'flex flex-row items-center justify-center gap-6 mb-6',
    desktop: 'flex flex-row items-center justify-center gap-8 mb-6',
    responsive: 'flex flex-row items-center justify-center gap-4 mb-6 md:gap-6 lg:gap-8'
  },
  originalPrice: {
    mobile: 'text-gray-400 line-through text-lg text-center',
    tablet: 'text-gray-400 line-through text-xl text-center',
    desktop: 'text-gray-400 line-through text-xl text-center',
    responsive: 'text-gray-400 line-through text-lg text-center md:text-xl'
  },
  price: {
    mobile: 'font-bold text-2xl text-primary text-center',
    tablet: 'font-bold text-3xl text-primary text-center',
    desktop: 'font-bold text-3xl text-primary text-center',
    responsive: 'font-bold text-2xl text-primary text-center md:text-3xl'
  },
  form: {
    mobile: 'flex flex-col items-center w-full max-w-md mx-auto gap-4',
    tablet: 'flex flex-col items-center w-full max-w-lg mx-auto gap-4',
    desktop: 'flex flex-col items-center w-full max-w-lg mx-auto gap-4',
    responsive: 'flex flex-col items-center w-full max-w-md mx-auto gap-4 md:max-w-lg'
  },
  button: {
    mobile: 'w-full rounded-full bg-blue-600 text-white font-semibold py-3 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl',
    tablet: 'w-full rounded-full bg-blue-600 text-white font-semibold py-4 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl',
    desktop: 'w-full rounded-full bg-blue-600 text-white font-semibold py-4 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl',
    responsive: 'w-full max-w-md md:max-w-lg rounded-full bg-blue-600 text-white font-semibold py-3 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl md:py-4'
  },
  guaranteeText: {
    mobile: 'text-xs text-gray-400 mt-6 text-center',
    tablet: 'text-xs text-gray-400 mt-6 text-center',
    desktop: 'text-xs text-gray-400 mt-6 text-center',
    responsive: 'text-xs text-gray-400 mt-6 text-center'
  }
};

export const getCtaVariation2ClassMaps = (): CtaVariation2ClassMaps => ctaVariation2ClassMaps;

// Metadata for transformer
export const ctaVariation2Metadata = {
  componentType: 'cta' as const,
  variationNumber: 2,
  elements: ['container', 'headline', 'subheadline', 'priceRow', 'originalPrice', 'price', 'form', 'button', 'guaranteeText'],
  hasImage: false,
  hasButtons: true,
  hasPricing: true,
  hasStats: false,
  hasFeatures: false,
  hasBackground: true,
  hasEmailCapture: true,
  hasTrustSignals: false,
  hasBenefits: false,
  hasGradient: false
} as const;
