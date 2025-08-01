/**
 * Hero Variation 3 - Class Maps
 * 
 * Shared class maps for Hero Variation 3 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './hero-variation-1';

export interface HeroVariation3ClassMaps {
  container: ClassMap;
  header: ClassMap;
  badge: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  features: ClassMap;
  featureIcon: ClassMap;
  featureTitle: ClassMap;
  featureDesc: ClassMap;
  pricing: ClassMap;
  priceContainer: ClassMap;
  price: ClassMap;
  priceDescription: ClassMap;
  actions: ClassMap;
  ctaButton: ClassMap;
  secondaryButton: ClassMap;
  trustIndicators: ClassMap;
  demoContainer: ClassMap;
  dashboardContent: ClassMap;
  dashboardGrid: ClassMap;
  [key: string]: ClassMap; // Index signature for compatibility
}

export const heroVariation3ClassMaps: HeroVariation3ClassMaps = {
  container: {
    mobile: "relative min-h-screen flex items-center py-12 px-3",
    tablet: "relative min-h-screen flex items-center py-20 px-6",
    desktop: "relative min-h-screen flex items-center py-24 px-4",
    responsive: "relative min-h-screen flex items-center py-12 px-3 md:py-20 md:px-6 lg:py-24 lg:px-4"
  },
  header: {
    mobile: "text-center mb-8",
    tablet: "text-center mb-12",
    desktop: "text-center mb-16",
    responsive: "text-center mb-8 md:mb-12 lg:mb-16"
  },
  badge: {
    mobile: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-xs mb-6",
    tablet: "inline-flex items-center rounded-full font-semibold px-5 py-2.5 text-sm mb-7",
    desktop: "inline-flex items-center rounded-full font-semibold px-6 py-3 text-sm mb-8",
    responsive: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-xs mb-6 md:px-5 md:py-2.5 md:text-sm md:mb-7 lg:px-6 lg:py-3 lg:text-sm lg:mb-8"
  },
  headline: {
    mobile: "font-bold leading-tight text-3xl mb-6",
    tablet: "font-bold leading-tight text-5xl mb-7",
    desktop: "font-bold leading-tight text-7xl mb-8",
    responsive: "font-bold leading-tight text-3xl mb-6 md:text-5xl md:mb-7 lg:text-7xl lg:mb-8"
  },
  subheadline: {
    mobile: "text-gray-600 leading-relaxed mx-auto text-base mb-8 max-w-2xl",
    tablet: "text-gray-600 leading-relaxed mx-auto text-lg mb-10 max-w-3xl",
    desktop: "text-gray-600 leading-relaxed mx-auto text-xl mb-12 max-w-4xl",
    responsive: "text-gray-600 leading-relaxed mx-auto text-base mb-8 max-w-2xl md:text-lg md:mb-10 md:max-w-3xl lg:text-xl lg:mb-12 lg:max-w-4xl"
  },
  features: {
    mobile: "grid grid-cols-1 gap-6 mb-8",
    tablet: "grid grid-cols-2 gap-7 mb-10",
    desktop: "grid grid-cols-3 gap-8 mb-12",
    responsive: "grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 md:gap-7 md:mb-10 lg:grid-cols-3 lg:gap-8 lg:mb-12"
  },
  featureIcon: {
    mobile: "bg-indigo-100 rounded-full flex items-center justify-center w-12 h-12 mb-3 text-lg",
    tablet: "bg-indigo-100 rounded-full flex items-center justify-center w-14 h-14 mb-3.5 text-xl",
    desktop: "bg-indigo-100 rounded-full flex items-center justify-center w-16 h-16 mb-4 text-2xl",
    responsive: "bg-indigo-100 rounded-full flex items-center justify-center w-12 h-12 mb-3 text-lg md:w-14 md:h-14 md:mb-3.5 md:text-xl lg:w-16 lg:h-16 lg:mb-4 lg:text-2xl"
  },
  featureTitle: {
    mobile: "font-semibold text-base mb-2",
    tablet: "font-semibold text-lg mb-2",
    desktop: "font-semibold text-lg mb-2",
    responsive: "font-semibold text-base mb-2 md:text-lg md:mb-2 lg:text-lg lg:mb-2"
  },
  featureDesc: {
    mobile: "text-gray-600 text-sm",
    tablet: "text-gray-600 text-base",
    desktop: "text-gray-600 text-base",
    responsive: "text-gray-600 text-sm md:text-base lg:text-base"
  },
  pricing: {
    mobile: "mb-8",
    tablet: "mb-10",
    desktop: "mb-12",
    responsive: "mb-8 md:mb-10 lg:mb-12"
  },
  priceContainer: {
    mobile: "flex items-center justify-center gap-2 mb-4",
    tablet: "flex items-center justify-center gap-3 mb-5",
    desktop: "flex items-center justify-center gap-4 mb-6",
    responsive: "flex items-center justify-center gap-2 mb-4 md:gap-3 md:mb-5 lg:gap-4 lg:mb-6"
  },
  price: {
    mobile: "font-bold text-indigo-600 text-3xl",
    tablet: "font-bold text-indigo-600 text-4xl",
    desktop: "font-bold text-indigo-600 text-5xl",
    responsive: "font-bold text-indigo-600 text-3xl md:text-4xl lg:text-5xl"
  },
  priceDescription: {
    mobile: "text-gray-600 mb-6",
    tablet: "text-gray-600 mb-7",
    desktop: "text-gray-600 mb-8",
    responsive: "text-gray-600 mb-6 md:mb-7 lg:mb-8"
  },
  actions: {
    mobile: "flex flex-col gap-3 justify-center mb-8",
    tablet: "flex flex-col gap-3 justify-center mb-10",
    desktop: "flex flex-row gap-4 justify-center mb-12",
    responsive: "flex flex-col gap-3 justify-center mb-8 md:flex-col md:gap-3 md:justify-center md:mb-10 lg:flex-row lg:gap-4 lg:justify-center lg:mb-12"
  },
  ctaButton: {
    mobile: "bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors px-6 py-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    tablet: "bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors px-7 py-3.5 text-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    desktop: "bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors px-8 py-4 text-lg w-auto focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    responsive: "bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors px-6 py-3 text-base w-full md:px-7 md:py-3.5 md:text-lg md:w-full lg:px-8 lg:py-4 lg:text-lg lg:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150"
  },
  secondaryButton: {
    mobile: "border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors px-6 py-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    tablet: "border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors px-7 py-3.5 text-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    desktop: "border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors px-8 py-4 text-lg w-auto focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    responsive: "border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors px-6 py-3 text-base w-full md:px-7 md:py-3.5 md:text-lg md:w-full lg:px-8 lg:py-4 lg:text-lg lg:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150"
  },
  trustIndicators: {
    mobile: "flex flex-col items-center justify-center gap-4 text-xs text-gray-500",
    tablet: "flex flex-col items-center justify-center gap-6 text-sm text-gray-500",
    desktop: "flex flex-row items-center justify-center gap-8 text-sm text-gray-500",
    responsive: "flex flex-col items-center justify-center gap-4 text-xs text-gray-500 md:flex-col md:items-center md:justify-center md:gap-6 md:text-sm lg:flex-row lg:items-center lg:justify-center lg:gap-8 lg:text-sm"
  },
  demoContainer: {
    mobile: "relative mx-auto max-w-sm px-4",
    tablet: "relative mx-auto max-w-4xl px-6",
    desktop: "relative mx-auto max-w-6xl px-8",
    responsive: "relative mx-auto max-w-sm px-4 md:max-w-4xl md:px-6 lg:max-w-6xl lg:px-8"
  },
  dashboardContent: {
    mobile: "bg-gradient-to-br from-indigo-50 to-white p-4 min-h-64",
    tablet: "bg-gradient-to-br from-indigo-50 to-white p-6 min-h-80",
    desktop: "bg-gradient-to-br from-indigo-50 to-white p-8 min-h-96",
    responsive: "bg-gradient-to-br from-indigo-50 to-white p-4 min-h-64 md:p-6 md:min-h-80 lg:p-8 lg:min-h-96"
  },
  dashboardGrid: {
    mobile: "grid grid-cols-1 gap-4 mb-6",
    tablet: "grid grid-cols-2 gap-5 mb-7",
    desktop: "grid grid-cols-3 gap-6 mb-8",
    responsive: "grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 md:gap-5 md:mb-7 lg:grid-cols-3 lg:gap-6 lg:mb-8"
  }
};

// Metadata for transformer
export const heroVariation3Metadata = {
  componentType: 'hero' as const,
  variationNumber: 3,
  elements: ['container', 'wrapper', 'topBadge', 'headline', 'subheadline', 'highlightsList', 'buttonsContainer', 'statsContainer'],
  hasImage: false,
  hasButtons: true,
  hasPricing: false,
  hasStats: true
} as const;
