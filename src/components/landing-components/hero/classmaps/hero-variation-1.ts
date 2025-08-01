/**
 * Hero Variation 1 - Class Maps
 * 
 * Shared class maps for Hero Variation 1 component
 * Used by both React component and static transformer
 */

export interface ClassMap {
  mobile: string;
  tablet: string;
  desktop: string;
  responsive: string;
  [key: string]: string;
}

export interface HeroVariation1ClassMaps {
  container: ClassMap;
  grid: ClassMap;
  leftContent: ClassMap;
  rightContent: ClassMap;
  badge: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  priceContainer: ClassMap;
  price: ClassMap;
  originalPrice: ClassMap;
  discountBadge: ClassMap;
  buttonsContainer: ClassMap;
  ctaButton: ClassMap;
  secondaryButton: ClassMap;
  productImageContainer: ClassMap;
  productImage: ClassMap;
}

export const heroVariation1ClassMaps: HeroVariation1ClassMaps = {
  container: {
    mobile: "relative overflow-hidden min-h-screen flex items-center py-8 px-3",
    tablet: "relative overflow-hidden min-h-screen flex items-center py-16 px-6",
    desktop: "relative overflow-hidden min-h-screen flex items-center py-24 px-8",
    responsive: "relative overflow-hidden min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-24 lg:px-8"
  },
  grid: {
    mobile: "grid items-center grid-cols-1 gap-6",
    tablet: "grid items-center grid-cols-1 gap-10",
    desktop: "grid items-center grid-cols-2 gap-12",
    responsive: "grid items-center grid-cols-1 gap-6 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12"
  },
  leftContent: {
    mobile: "text-left order-2 px-2",
    tablet: "text-left order-2 px-0",
    desktop: "text-left order-1 px-0",
    responsive: "text-left order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0"
  },
  rightContent: {
    mobile: "relative order-1 px-2",
    tablet: "relative order-1 px-0",
    desktop: "relative order-2 px-0",
    responsive: "relative order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
  },
  badge: {
    mobile: "inline-flex items-center rounded-full font-medium px-2 py-1 text-xs mb-4",
    tablet: "inline-flex items-center rounded-full font-medium px-3 py-1 text-sm mb-6",
    desktop: "inline-flex items-center rounded-full font-medium px-3 py-1 text-sm mb-6",
    responsive: "inline-flex items-center rounded-full font-medium px-2 py-1 text-xs mb-4 md:px-3 md:py-1 md:text-sm md:mb-6 lg:px-3 lg:py-1 lg:text-sm lg:mb-6"
  },
  headline: {
    mobile: "font-bold leading-tight text-2xl mb-3",
    tablet: "font-bold leading-tight text-4xl mb-4",
    desktop: "font-bold leading-tight text-6xl mb-6",
    responsive: "font-bold leading-tight text-2xl mb-3 md:text-4xl md:mb-4 lg:text-6xl lg:mb-6"
  },
  subheadline: {
    mobile: "text-gray-300 leading-relaxed text-sm mb-4",
    tablet: "text-gray-300 leading-relaxed text-lg mb-6",
    desktop: "text-gray-300 leading-relaxed text-xl mb-8",
    responsive: "text-gray-300 leading-relaxed text-sm mb-4 md:text-lg md:mb-6 lg:text-xl lg:mb-8"
  },
  priceContainer: {
    mobile: "flex flex-wrap items-center gap-1.5 mb-4",
    tablet: "flex flex-wrap items-center gap-2 mb-6",
    desktop: "flex flex-wrap items-center gap-4 mb-8",
    responsive: "flex flex-wrap items-center gap-1.5 mb-4 md:gap-2 md:mb-6 lg:gap-4 lg:mb-8"
  },
  price: {
    mobile: "font-bold text-green-400 text-lg",
    tablet: "font-bold text-green-400 text-2xl",
    desktop: "font-bold text-green-400 text-3xl",
    responsive: "font-bold text-green-400 text-lg md:text-2xl lg:text-3xl"
  },
  originalPrice: {
    mobile: "text-gray-400 line-through text-xs",
    tablet: "text-gray-400 line-through text-sm",
    desktop: "text-gray-400 line-through text-lg",
    responsive: "text-gray-400 line-through text-xs md:text-sm lg:text-lg"
  },
  discountBadge: {
    mobile: "bg-red-500 text-white font-medium rounded px-1 py-0.5 text-xs",
    tablet: "bg-red-500 text-white font-medium rounded px-1.5 py-0.5 text-xs",
    desktop: "bg-red-500 text-white font-medium rounded px-2 py-1 text-sm",
    responsive: "bg-red-500 text-white font-medium rounded px-1 py-0.5 text-xs md:px-1.5 md:py-0.5 md:text-xs lg:px-2 lg:py-1 lg:text-sm"
  },
  buttonsContainer: {
    mobile: "flex flex-col gap-2.5",
    tablet: "flex flex-row gap-3",
    desktop: "flex flex-row gap-4",
    responsive: "flex flex-col gap-2.5 md:flex-row md:gap-3 lg:flex-row lg:gap-4"
  },
  ctaButton: {
    mobile: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-2.5 text-sm",
    tablet: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-auto px-6 py-3 text-base",
    desktop: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-auto px-8 py-4 text-base",
    responsive: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base"
  },
  secondaryButton: {
    mobile: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-full px-4 py-2.5 text-sm",
    tablet: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-auto px-6 py-3 text-base",
    desktop: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-auto px-8 py-4 text-base",
    responsive: "border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base"
  },
  productImageContainer: {
    mobile: "relative",
    tablet: "relative",
    desktop: "relative",
    responsive: "relative"
  },
  productImage: {
    mobile: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-48 rounded-lg shadow-lg transform rotate-0",
    tablet: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-80 rounded-xl shadow-xl transform rotate-1",
    desktop: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-96 rounded-2xl shadow-2xl transform rotate-3",
    responsive: "w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-48 rounded-lg shadow-lg transform rotate-0 md:h-80 md:rounded-xl md:shadow-xl md:transform md:rotate-1 lg:h-96 lg:rounded-2xl lg:shadow-2xl lg:transform lg:rotate-3"
  }
};

// Metadata for transformer
export const heroVariation1Metadata = {
  componentType: 'hero' as const,
  variationNumber: 1,
  elements: ['container', 'grid', 'leftContent', 'rightContent', 'badge', 'headline', 'subheadline', 'priceContainer', 'buttonsContainer', 'productImage'],
  hasImage: true,
  hasButtons: true,
  hasPricing: true
} as const;
