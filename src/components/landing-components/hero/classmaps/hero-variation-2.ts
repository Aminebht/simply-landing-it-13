/**
 * Hero Variation 2 - Class Maps
 * 
 * Shared class maps for Hero Variation 2 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './hero-variation-1';

export interface HeroVariation2ClassMaps {
  container: ClassMap;
  grid: ClassMap;
  leftContent: ClassMap;
  rightContent: ClassMap;
  badge: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  features: ClassMap;
  priceSection: ClassMap;
  priceContainer: ClassMap;
  priceValue: ClassMap;
  priceLabel: ClassMap;
  buttonSection: ClassMap;
  ctaButton: ClassMap;
  secondaryButton: ClassMap;
  trustIndicators: ClassMap;
  bookCover: ClassMap;
  bookContent: ClassMap;
  bookTitle1: ClassMap;
  bookTitle2: ClassMap;
  bookDivider: ClassMap;
  bookSubtitle: ClassMap;
  bookFooter: ClassMap;
  bookAuthor: ClassMap;
  bookYear: ClassMap;
}

export const heroVariation2ClassMaps: HeroVariation2ClassMaps = {
  container: {
    mobile: "relative min-h-screen flex items-center py-8 px-3",
    tablet: "relative min-h-screen flex items-center py-16 px-6",
    desktop: "relative min-h-screen flex items-center py-20 px-8",
    responsive: "relative min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-20 lg:px-8"
  },
  grid: {
    mobile: "grid items-center grid-cols-1 gap-8",
    tablet: "grid items-center grid-cols-1 gap-12",
    desktop: "grid items-center grid-cols-2 gap-16",
    responsive: "grid items-center grid-cols-1 gap-8 md:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:gap-16"
  },
  leftContent: {
    mobile: "text-left order-2 px-2",
    tablet: "text-left order-2 px-0",
    desktop: "text-left order-1 px-0",
    responsive: "text-left order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0"
  },
  rightContent: {
    mobile: "relative flex justify-center order-1 px-2",
    tablet: "relative flex justify-center order-1 px-0",
    desktop: "relative flex justify-center order-2 px-0",
    responsive: "relative flex justify-center order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
  },
  badge: {
    mobile: "inline-flex items-center rounded-full font-semibold px-3 py-1.5 text-xs mb-4",
    tablet: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-sm mb-5",
    desktop: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-sm mb-6",
    responsive: "inline-flex items-center rounded-full font-semibold px-3 py-1.5 text-xs mb-4 md:px-4 md:py-2 md:text-sm md:mb-5 lg:px-4 lg:py-2 lg:text-sm lg:mb-6"
  },
  headline: {
    mobile: "font-bold leading-tight text-3xl mb-4",
    tablet: "font-bold leading-tight text-5xl mb-5",
    desktop: "font-bold leading-tight text-6xl mb-6",
    responsive: "font-bold leading-tight text-3xl mb-4 md:text-5xl md:mb-5 lg:text-6xl lg:mb-6"
  },
  subheadline: {
    mobile: "text-gray-600 leading-relaxed text-base mb-6",
    tablet: "text-gray-600 leading-relaxed text-lg mb-7",
    desktop: "text-gray-600 leading-relaxed text-xl mb-8",
    responsive: "text-gray-600 leading-relaxed text-base mb-6 md:text-lg md:mb-7 lg:text-xl lg:mb-8"
  },
  features: {
    mobile: "mb-6",
    tablet: "mb-7",
    desktop: "mb-8",
    responsive: "mb-6 md:mb-7 lg:mb-8"
  },
  priceSection: {
    mobile: "mb-6",
    tablet: "mb-7",
    desktop: "mb-8",
    responsive: "mb-6 md:mb-7 lg:mb-8"
  },
  priceContainer: {
    mobile: "flex items-center gap-4 mb-4",
    tablet: "flex items-center gap-4 mb-5",
    desktop: "flex items-center gap-4 mb-6",
    responsive: "flex items-center gap-4 mb-4 md:mb-5 lg:mb-6"
  },
  priceValue: {
    mobile: "font-bold text-amber-600 text-2xl",
    tablet: "font-bold text-amber-600 text-3xl",
    desktop: "font-bold text-amber-600 text-4xl",
    responsive: "font-bold text-amber-600 text-2xl md:text-3xl lg:text-4xl"
  },
  priceLabel: {
    mobile: "text-gray-500 text-base",
    tablet: "text-gray-500 text-lg",
    desktop: "text-gray-500 text-lg",
    responsive: "text-gray-500 text-base md:text-lg lg:text-lg"
  },
  buttonSection: {
    mobile: "flex flex-col gap-3 mb-6",
    tablet: "flex flex-row gap-4 mb-7",
    desktop: "flex flex-row gap-4 mb-8",
    responsive: "flex flex-col gap-3 mb-6 md:flex-row md:gap-4 md:mb-7 lg:flex-row lg:gap-4 lg:mb-8"
  },
  ctaButton: {
    mobile: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    tablet: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    desktop: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150",
    responsive: "bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors w-full px-6 py-3 text-sm md:w-auto md:px-8 md:py-4 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150"
  },
  secondaryButton: {
    mobile: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    tablet: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    desktop: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-auto px-8 py-4 text-base focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150",
    responsive: "border-2 border-amber-600 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors w-full px-6 py-3 text-sm md:w-auto md:px-8 md:py-4 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150"
  },
  trustIndicators: {
    mobile: "flex items-center gap-6 text-sm text-gray-500 mt-6 flex-col gap-4",
    tablet: "flex items-center gap-6 text-sm text-gray-500 mt-7 flex-row gap-6",
    desktop: "flex items-center gap-6 text-sm text-gray-500 mt-8 flex-row gap-6",
    responsive: "flex items-center gap-6 text-sm text-gray-500 mt-6 flex-col gap-4 md:mt-7 md:flex-row md:gap-6 lg:mt-8 lg:flex-row lg:gap-6"
  },
  bookCover: {
    mobile: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-64 h-80 rotate-3",
    tablet: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-72 h-88 rotate-6",
    desktop: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-80 h-96 rotate-6",
    responsive: "relative rounded-lg shadow-2xl transform hover:rotate-3 transition-transform duration-300 w-64 h-80 rotate-3 md:w-72 md:h-88 md:rotate-6 lg:w-80 lg:h-96 lg:rotate-6"
  },
  bookContent: {
    mobile: "absolute rounded-md p-6 text-gray-800 bg-white inset-3",
    tablet: "absolute rounded-md p-6 text-gray-800 bg-white inset-4",
    desktop: "absolute rounded-md p-6 text-gray-800 bg-white inset-4",
    responsive: "absolute rounded-md p-6 text-gray-800 bg-white inset-3 md:inset-4 lg:inset-4"
  },
  bookTitle1: {
    mobile: "font-bold text-gray-900 text-base mb-2",
    tablet: "font-bold text-gray-900 text-lg mb-2",
    desktop: "font-bold text-gray-900 text-lg mb-2",
    responsive: "font-bold text-gray-900 text-base mb-2 md:text-lg md:mb-2 lg:text-lg lg:mb-2"
  },
  bookTitle2: {
    mobile: "font-bold text-amber-600 text-lg mb-3",
    tablet: "font-bold text-amber-600 text-xl mb-4",
    desktop: "font-bold text-amber-600 text-xl mb-4",
    responsive: "font-bold text-amber-600 text-lg mb-3 md:text-xl md:mb-4 lg:text-xl lg:mb-4"
  },
  bookDivider: {
    mobile: "bg-[#d97706] w-12 h-0.5 mb-3",
    tablet: "bg-[#d97706] w-16 h-1 mb-4",
    desktop: "bg-[#d97706] w-16 h-1 mb-4",
    responsive: "bg-[#d97706] w-12 h-0.5 mb-3 md:w-16 md:h-1 md:mb-4 lg:w-16 lg:h-1 lg:mb-4"
  },
  bookSubtitle: {
    mobile: "text-gray-600 text-xs mb-3",
    tablet: "text-gray-600 text-sm mb-4",
    desktop: "text-gray-600 text-sm mb-4",
    responsive: "text-gray-600 text-xs mb-3 md:text-sm md:mb-4 lg:text-sm lg:mb-4"
  },
  bookFooter: {
    mobile: "border-t pt-3",
    tablet: "border-t pt-4",
    desktop: "border-t pt-4",
    responsive: "border-t pt-3 md:pt-4 lg:pt-4"
  },
  bookAuthor: {
    mobile: "text-gray-500 text-xs mb-1",
    tablet: "text-gray-500 text-xs mb-2",
    desktop: "text-gray-500 text-xs mb-2",
    responsive: "text-gray-500 text-xs mb-1 md:text-xs md:mb-2 lg:text-xs lg:mb-2"
  },
  bookYear: {
    mobile: "text-gray-500 text-xs",
    tablet: "text-gray-500 text-xs",
    desktop: "text-gray-500 text-xs",
    responsive: "text-gray-500 text-xs md:text-xs lg:text-xs"
  }
};

// Metadata for transformer
export const heroVariation2Metadata = {
  componentType: 'hero' as const,
  variationNumber: 2,
  elements: ['container', 'grid', 'leftContent', 'rightContent', 'badge', 'headline', 'subheadline', 'priceContainer', 'buttonsContainer'],
  hasImage: true,
  hasButtons: true,
  hasPricing: true
} as const;
