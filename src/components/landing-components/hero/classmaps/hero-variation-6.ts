/**
 * Hero Variation 6 - Class Maps
 * 
 * Shared class maps for Hero Variation 6 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './hero-variation-1';

export interface HeroVariation6ClassMaps {
  container: ClassMap;
  header: ClassMap;
  brandName: ClassMap;
  contactEmail: ClassMap;
  mainContainer: ClassMap;
  grid: ClassMap;
  imageContainer: ClassMap;
  professionalImage: ClassMap;
  contentLeft: ClassMap;
  badge: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  benefits: ClassMap;
  benefit: ClassMap;
  priceSection: ClassMap;
  priceLabel: ClassMap;
  price: ClassMap;
  priceDescription: ClassMap;
  ctaButton: ClassMap;
  professionalName: ClassMap;
  [key: string]: ClassMap;
}

export const heroVariation6ClassMaps: HeroVariation6ClassMaps = {
  container: {
    mobile: 'py-0 px-0',
    tablet: 'py-0 px-0',
    desktop: 'py-0 px-0',
    responsive: 'py-0 px-0'
  },
  header: {
    mobile: 'px-4 py-4 flex justify-center',
    tablet: 'px-5 py-5 flex justify-between items-center',
    desktop: 'px-6 py-6 flex justify-between items-center',
    responsive: 'px-4 py-4 flex justify-center md:px-5 md:py-5 md:flex md:justify-between md:items-center lg:px-6 lg:py-6 lg:flex lg:justify-between lg:items-center'
  },
  brandName: {
    mobile: 'text-base',
    tablet: 'text-lg',
    desktop: 'text-lg',
    responsive: 'text-base md:text-lg lg:text-lg'
  },
  contactEmail: {
    mobile: 'hidden',
    tablet: 'flex text-sm',
    desktop: 'flex text-sm',
    responsive: 'hidden md:flex md:text-sm lg:flex lg:text-sm'
  },
  mainContainer: {
    mobile: 'px-4 pt-28',
    tablet: 'px-5 pt-14',
    desktop: 'px-6 pt-16',
    responsive: 'px-4 pt-28 md:px-5 md:pt-14 lg:px-6 lg:pt-16'
  },
  grid: {
    mobile: 'grid grid-cols-1 gap-4',
    tablet: 'grid grid-cols-1 gap-10',
    desktop: 'grid grid-cols-2 gap-12',
    responsive: 'grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12'
  },
  imageContainer: {
    mobile: 'min-h-auto justify-center order-1',
    tablet: 'min-h-[calc(100vh-4rem)] justify-center order-1',
    desktop: 'min-h-[calc(100vh-4rem)] justify-end order-2',
    responsive: 'min-h-auto justify-center order-1 md:min-h-[calc(100vh-4rem)] md:justify-center md:order-1 lg:min-h-[calc(100vh-4rem)] lg:justify-end lg:order-2'
  },
  professionalImage: {
    mobile: 'h-[400px]',
    tablet: 'h-[550px]',
    desktop: 'h-[600px]',
    responsive: 'h-[400px] md:h-[550px] lg:h-[600px]'
  },
  contentLeft: {
    mobile: 'space-y-3 py-2 order-2',
    tablet: 'space-y-5 py-7 order-2',
    desktop: 'space-y-6 py-8 order-1',
    responsive: 'space-y-3 py-2 order-2 md:space-y-5 md:py-7 md:order-2 lg:space-y-6 lg:py-8 lg:order-1'
  },
  badge: {
    mobile: 'text-xs',
    tablet: 'text-sm',
    desktop: 'text-sm',
    responsive: 'text-xs md:text-sm lg:text-sm'
  },
  headline: {
    mobile: 'text-2xl',
    tablet: 'text-3xl',
    desktop: 'text-4xl',
    responsive: 'text-2xl md:text-3xl lg:text-4xl'
  },
  subheadline: {
    mobile: 'text-base',
    tablet: 'text-lg',
    desktop: 'text-lg',
    responsive: 'text-base md:text-lg lg:text-lg'
  },
  benefits: {
    mobile: 'space-y-1 py-1',
    tablet: 'space-y-3 py-2',
    desktop: 'space-y-3 py-2',
    responsive: 'space-y-1 py-1 md:space-y-3 md:py-2 lg:space-y-3 lg:py-2'
  },
  benefit: {
    mobile: 'text-sm',
    tablet: 'text-base',
    desktop: 'text-base',
    responsive: 'text-sm md:text-base lg:text-base'
  },
  priceSection: {
    mobile: 'py-2',
    tablet: 'py-4',
    desktop: 'py-4',
    responsive: 'py-2 md:py-4 lg:py-4'
  },
  priceLabel: {
    mobile: 'text-xs',
    tablet: 'text-xs',
    desktop: 'text-xs',
    responsive: 'text-xs md:text-xs lg:text-xs'
  },
  price: {
    mobile: 'text-2xl',
    tablet: 'text-3xl',
    desktop: 'text-3xl',
    responsive: 'text-2xl md:text-3xl lg:text-3xl'
  },
  priceDescription: {
    mobile: 'text-xs',
    tablet: 'text-xs',
    desktop: 'text-xs',
    responsive: 'text-xs md:text-xs lg:text-xs'
  },
  ctaButton: {
    mobile: 'px-6 py-3 text-sm bg-yellow-500 text-black rounded-lg font-bold tracking-wide hover:bg-yellow-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
    tablet: 'px-7 py-3 text-base bg-yellow-500 text-black rounded-lg font-bold tracking-wide hover:bg-yellow-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
    desktop: 'px-8 py-3 text-base bg-yellow-500 text-black rounded-lg font-bold tracking-wide hover:bg-yellow-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
    responsive: 'px-6 py-3 text-sm md:px-7 md:py-3 md:text-base lg:px-8 lg:py-3 lg:text-base bg-yellow-500 text-black rounded-lg font-bold tracking-wide hover:bg-yellow-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150'
  },
  professionalName: {
    mobile: 'text-lg',
    tablet: 'text-xl',
    desktop: 'text-xl',
    responsive: 'text-lg md:text-xl lg:text-xl'
  }
};

export const getHeroVariation6ClassMaps = (): HeroVariation6ClassMaps => heroVariation6ClassMaps;

// Metadata for transformer
export const heroVariation6Metadata = {
  componentType: 'hero' as const,
  variationNumber: 6,
  elements: ['container', 'header', 'brandName', 'contactEmail', 'mainContainer', 'grid', 'imageContainer', 'professionalImage', 'contentLeft', 'badge', 'headline', 'subheadline', 'benefits', 'benefit', 'priceSection', 'priceLabel', 'price', 'priceDescription', 'ctaButton', 'professionalName'],
  hasImage: true,
  hasButtons: true,
  hasPricing: true,
  hasStats: false,
  hasVideo: false,
  hasFeatures: false,
  hasBackground: true,
  hasEmailCapture: false,
  hasTrustSignals: false,
  hasBenefits: true
} as const;
