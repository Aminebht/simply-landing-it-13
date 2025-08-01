/**
 * Hero Variation 4 - Class Maps
 * 
 * Shared class maps for Hero Variation 4 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './hero-variation-1';

export interface HeroVariation4ClassMaps {
  container: ClassMap;
  header: ClassMap;
  badge: ClassMap;
  headline: ClassMap;
  subtitle: ClassMap;
  priceSection: ClassMap;
  price: ClassMap;
  originalPrice: ClassMap;
  statsSection: ClassMap;
  statValue: {
    purple: ClassMap;
    pink: ClassMap;
    blue: ClassMap;
  };
  statLabel: ClassMap;
  statsDivider: ClassMap;
  ctaButtonsSection: ClassMap;
  primaryCTA: ClassMap;
  secondaryCTA: ClassMap;
  templateGrid: ClassMap;
  templateCard: ClassMap;
  templateImage: ClassMap;
  templateTitle: ClassMap;
  templateDesc: ClassMap;
  bottomCTA: ClassMap;
  bottomText: ClassMap;
  [key: string]: ClassMap | { purple: ClassMap; pink: ClassMap; blue: ClassMap; }; // Index signature for compatibility
}

export const heroVariation4ClassMaps: HeroVariation4ClassMaps = {
  container: {
    mobile: "relative min-h-screen flex items-center py-12 px-3",
    tablet: "relative min-h-screen flex items-center py-16 px-4",
    desktop: "relative min-h-screen flex items-center py-20 px-4",
    responsive: "relative min-h-screen flex items-center py-12 px-3 md:py-16 md:px-4 lg:py-20 lg:px-4"
  },
  header: {
    mobile: "text-center mb-8",
    tablet: "text-center mb-12",
    desktop: "text-center mb-16",
    responsive: "text-center mb-8 md:mb-12 lg:mb-16"
  },
  badge: {
    mobile: "inline-block font-semibold rounded-full px-3 py-1.5 text-xs mb-4",
    tablet: "inline-block font-semibold rounded-full px-4 py-2 text-sm mb-5",
    desktop: "inline-block font-semibold rounded-full px-4 py-2 text-sm mb-6",
    responsive: "inline-block font-semibold rounded-full px-3 py-1.5 text-xs mb-4 md:px-4 md:py-2 md:text-sm md:mb-5 lg:px-4 lg:py-2 lg:text-sm lg:mb-6"
  },
  headline: {
    mobile: "font-bold leading-tight text-4xl mb-4",
    tablet: "font-bold leading-tight text-6xl mb-5",
    desktop: "font-bold leading-tight text-7xl mb-6",
    responsive: "font-bold leading-tight text-4xl mb-4 md:text-6xl md:mb-5 lg:text-7xl lg:mb-6"
  },
  subtitle: {
    mobile: "text-gray-300 mx-auto text-base mb-8 max-w-xl",
    tablet: "text-gray-300 mx-auto text-xl mb-10 max-w-2xl",
    desktop: "text-gray-300 mx-auto text-2xl mb-12 max-w-3xl",
    responsive: "text-gray-300 mx-auto text-base mb-8 max-w-xl md:text-xl md:mb-10 md:max-w-2xl lg:text-2xl lg:mb-12 lg:max-w-3xl"
  },
  priceSection: {
    mobile: "flex items-center justify-center gap-2 mb-6",
    tablet: "flex items-center justify-center gap-3 mb-7",
    desktop: "flex items-center justify-center gap-4 mb-8",
    responsive: "flex items-center justify-center gap-2 mb-6 md:gap-3 md:mb-7 lg:gap-4 lg:mb-8"
  },
  price: {
    mobile: "font-bold text-green-400 text-2xl",
    tablet: "font-bold text-green-400 text-3xl",
    desktop: "font-bold text-green-400 text-4xl",
    responsive: "font-bold text-green-400 text-2xl md:text-3xl lg:text-4xl"
  },
  originalPrice: {
    mobile: "text-gray-400 line-through text-base",
    tablet: "text-gray-400 line-through text-lg",
    desktop: "text-gray-400 line-through text-xl",
    responsive: "text-gray-400 line-through text-base md:text-lg lg:text-xl"
  },
  statsSection: {
    mobile: "flex justify-center items-center gap-4 mb-8 flex-col",
    tablet: "flex justify-center items-center gap-6 mb-10 flex-row",
    desktop: "flex justify-center items-center gap-8 mb-12 flex-row",
    responsive: "flex justify-center items-center gap-4 mb-8 flex-col md:gap-6 md:mb-10 md:flex-row lg:gap-8 lg:mb-12 lg:flex-row"
  },
  statValue: {
    purple: {
      mobile: "font-bold text-purple-400 text-2xl",
      tablet: "font-bold text-purple-400 text-3xl",
      desktop: "font-bold text-purple-400 text-3xl",
      responsive: "font-bold text-purple-400 text-2xl md:text-3xl lg:text-3xl"
    },
    pink: {
      mobile: "font-bold text-pink-400 text-2xl",
      tablet: "font-bold text-pink-400 text-3xl",
      desktop: "font-bold text-pink-400 text-3xl",
      responsive: "font-bold text-pink-400 text-2xl md:text-3xl lg:text-3xl"
    },
    blue: {
      mobile: "font-bold text-blue-400 text-2xl",
      tablet: "font-bold text-blue-400 text-3xl",
      desktop: "font-bold text-blue-400 text-3xl",
      responsive: "font-bold text-blue-400 text-2xl md:text-3xl lg:text-3xl"
    }
  },
  statLabel: {
    mobile: "text-gray-400 text-xs",
    tablet: "text-gray-400 text-sm",
    desktop: "text-gray-400 text-sm",
    responsive: "text-gray-400 text-xs md:text-sm lg:text-sm"
  },
  statsDivider: {
    mobile: "w-px bg-gray-600 h-8",
    tablet: "w-px bg-gray-600 h-10",
    desktop: "w-px bg-gray-600 h-12",
    responsive: "w-px bg-gray-600 h-8 md:h-10 lg:h-12"
  },
  ctaButtonsSection: {
    mobile: "flex gap-4 justify-center items-center flex-col mb-10",
    tablet: "flex gap-4 justify-center items-center flex-row mb-12",
    desktop: "flex gap-4 justify-center items-center flex-row mb-16",
    responsive: "flex gap-4 justify-center items-center flex-col mb-10 md:flex-row md:mb-12 lg:mb-16"
  },
  primaryCTA: {
    mobile: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-6 py-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    tablet: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-7 py-3.5 text-lg w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    desktop: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-8 py-4 text-lg w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    responsive: "text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-xl px-6 py-3 text-base w-full md:px-7 md:py-3.5 md:text-lg md:w-auto lg:px-8 lg:py-4 lg:text-lg lg:w-auto focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150"
  },
  secondaryCTA: {
    mobile: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-6 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    tablet: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-7 py-3.5 text-base w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    desktop: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-8 py-4 text-base w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    responsive: "border-2 font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-300 transition-all px-6 py-3 text-sm w-full md:px-7 md:py-3.5 md:text-base md:w-auto lg:px-8 lg:py-4 lg:text-base lg:w-auto focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150"
  },
  templateGrid: {
    mobile: "grid max-w-5xl mx-auto grid-cols-1 gap-6",
    tablet: "grid max-w-5xl mx-auto grid-cols-2 gap-7",
    desktop: "grid max-w-5xl mx-auto grid-cols-3 gap-8",
    responsive: "grid max-w-5xl mx-auto grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8"
  },
  templateCard: {
    mobile: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-4",
    tablet: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-5",
    desktop: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-6",
    responsive: "bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105 p-4 md:p-5 lg:p-6"
  },
  templateImage: {
    mobile: "aspect-video rounded-lg overflow-hidden relative mb-3",
    tablet: "aspect-video rounded-lg overflow-hidden relative mb-3.5",
    desktop: "aspect-video rounded-lg overflow-hidden relative mb-4",
    responsive: "aspect-video rounded-lg overflow-hidden relative mb-3 md:mb-3.5 lg:mb-4"
  },
  templateTitle: {
    mobile: "text-white font-semibold mb-2 text-base",
    tablet: "text-white font-semibold mb-2 text-lg",
    desktop: "text-white font-semibold mb-2 text-lg",
    responsive: "text-white font-semibold mb-2 text-base md:text-lg lg:text-lg"
  },
  templateDesc: {
    mobile: "text-gray-300 text-sm",
    tablet: "text-gray-300 text-sm",
    desktop: "text-gray-300 text-sm",
    responsive: "text-gray-300 text-sm"
  },
  bottomCTA: {
    mobile: "text-center mt-12",
    tablet: "text-center mt-14",
    desktop: "text-center mt-16",
    responsive: "text-center mt-12 md:mt-14 lg:mt-16"
  },
  bottomText: {
    mobile: "text-gray-400 mb-3 text-sm",
    tablet: "text-gray-400 mb-3.5 text-base",
    desktop: "text-gray-400 mb-4 text-base",
    responsive: "text-gray-400 mb-3 text-sm md:mb-3.5 md:text-base lg:mb-4 lg:text-base"
  }
};

export const getHeroVariation4ClassMaps = (): HeroVariation4ClassMaps => heroVariation4ClassMaps;

export const metadata = {
  component: "Hero",
  variation: 4,
  theme: "Digital Agency",
  features: ["gradient backgrounds", "stat value color variants", "template showcase", "complex pricing section"],
  responsive: true
};

// Metadata for transformer
export const heroVariation4Metadata = {
  componentType: 'hero' as const,
  variationNumber: 4,
  elements: ['container', 'grid', 'leftContent', 'rightContent', 'eyebrow', 'headline', 'subheadline', 'featuresList', 'buttonsContainer', 'videoContainer'],
  hasImage: false,
  hasButtons: true,
  hasPricing: false,
  hasVideo: true,
  hasFeatures: true
} as const;
