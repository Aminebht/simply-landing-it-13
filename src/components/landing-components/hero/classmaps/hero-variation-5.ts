/**
 * Hero Variation 5 - Class Maps
 * 
 * Shared class maps for Hero Variation 5 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './hero-variation-1';

export interface HeroVariation5ClassMaps {
  container: ClassMap;
  grid: ClassMap;
  contentRight: ClassMap;
  contentLeft: ClassMap;
  coursePreview: ClassMap;
  courseInfo: ClassMap;
  courseTitle: ClassMap;
  modules: ClassMap;
  module: ClassMap;
  moduleNumber: ClassMap;
  moduleTitle: ClassMap;
  badge: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  courseStats: ClassMap;
  statNumber: ClassMap;
  statLabel: ClassMap;
  pricing: ClassMap;
  priceRow: ClassMap;
  originalPrice: ClassMap;
  price: ClassMap;
  priceLabel: ClassMap;
  moneyBack: ClassMap;
  actions: ClassMap;
  ctaButton: ClassMap;
  secondaryButton: ClassMap;
  trustIndicators: ClassMap;
  [key: string]: ClassMap;
}

export const heroVariation5ClassMaps: HeroVariation5ClassMaps = {
  container: {
    mobile: 'py-12 px-4',
    tablet: 'py-16 px-6', 
    desktop: 'py-20 px-4',
    responsive: 'py-12 px-4 md:py-16 md:px-6 lg:py-20 lg:px-4'
  },
  grid: {
    mobile: 'grid grid-cols-1 gap-8',
    tablet: 'grid grid-cols-1 gap-10',
    desktop: 'grid grid-cols-2 gap-12',
    responsive: 'grid grid-cols-1 gap-8 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12'
  },
  contentRight: {
    mobile: 'order-1',
    tablet: 'order-1',
    desktop: 'order-2',
    responsive: 'order-1 lg:order-2'
  },
  contentLeft: {
    mobile: 'order-2',
    tablet: 'order-2', 
    desktop: 'order-1',
    responsive: 'order-2 lg:order-1'
  },
  coursePreview: {
    mobile: 'rounded-lg shadow-lg',
    tablet: 'rounded-lg shadow-xl',
    desktop: 'rounded-xl shadow-2xl',
    responsive: 'rounded-lg shadow-lg md:rounded-lg md:shadow-xl lg:rounded-xl lg:shadow-2xl'
  },
  courseInfo: {
    mobile: 'p-4',
    tablet: 'p-5',
    desktop: 'p-6',
    responsive: 'p-4 md:p-5 lg:p-6'
  },
  courseTitle: {
    mobile: 'font-bold text-lg mb-3',
    tablet: 'font-bold text-lg mb-4',
    desktop: 'font-bold text-xl mb-4',
    responsive: 'font-bold text-lg mb-3 md:text-lg md:mb-4 lg:text-xl lg:mb-4'
  },
  modules: {
    mobile: 'space-y-2',
    tablet: 'space-y-3',
    desktop: 'space-y-3',
    responsive: 'space-y-2 md:space-y-3 lg:space-y-3'
  },
  module: {
    mobile: 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg',
    tablet: 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg',
    desktop: 'flex items-center gap-3 p-3 bg-gray-50 rounded-lg',
    responsive: 'flex items-center gap-3 p-2 bg-gray-50 rounded-lg md:p-2 lg:p-3'
  },
  moduleNumber: {
    mobile: 'w-7 h-7 text-xs bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold',
    tablet: 'w-8 h-8 text-sm bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold',
    desktop: 'w-8 h-8 text-sm bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold',
    responsive: 'w-7 h-7 text-xs bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold md:w-8 md:h-8 md:text-sm lg:w-8 lg:h-8 lg:text-sm'
  },
  moduleTitle: {
    mobile: 'font-medium text-sm',
    tablet: 'font-medium text-base',
    desktop: 'font-medium text-base',
    responsive: 'font-medium text-sm md:text-base lg:text-base'
  },
  badge: {
    mobile: 'px-3 py-1.5 text-xs mb-4 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800',
    tablet: 'px-4 py-2 text-sm mb-5 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800',
    desktop: 'px-4 py-2 text-sm mb-6 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800',
    responsive: 'px-3 py-1.5 text-xs mb-4 inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800 md:px-4 md:py-2 md:text-sm md:mb-5 lg:px-4 lg:py-2 lg:text-sm lg:mb-6'
  },
  headline: {
    mobile: 'text-3xl mb-4 font-bold leading-tight text-gray-900',
    tablet: 'text-4xl mb-5 font-bold leading-tight text-gray-900',
    desktop: 'text-5xl mb-6 font-bold leading-tight text-gray-900',
    responsive: 'text-3xl mb-4 font-bold leading-tight text-gray-900 md:text-4xl md:mb-5 lg:text-5xl lg:mb-6'
  },
  subheadline: {
    mobile: 'text-lg mb-6 text-gray-600 leading-relaxed',
    tablet: 'text-xl mb-7 text-gray-600 leading-relaxed',
    desktop: 'text-xl mb-8 text-gray-600 leading-relaxed',
    responsive: 'text-lg mb-6 text-gray-600 leading-relaxed md:text-xl md:mb-7 lg:text-xl lg:mb-8'
  },
  courseStats: {
    mobile: 'grid grid-cols-3 gap-4 mb-6',
    tablet: 'grid grid-cols-3 gap-4 mb-7',
    desktop: 'grid grid-cols-3 gap-6 mb-8',
    responsive: 'grid grid-cols-3 gap-4 mb-6 md:gap-4 md:mb-7 lg:gap-6 lg:mb-8'
  },
  statNumber: {
    mobile: 'text-2xl font-bold text-emerald-600 mb-2',
    tablet: 'text-2xl font-bold text-emerald-600 mb-2',
    desktop: 'text-3xl font-bold text-emerald-600 mb-2',
    responsive: 'text-2xl font-bold text-emerald-600 mb-2 md:text-2xl lg:text-3xl'
  },
  statLabel: {
    mobile: 'text-gray-600 text-xs',
    tablet: 'text-gray-600 text-sm',
    desktop: 'text-gray-600 text-sm',
    responsive: 'text-gray-600 text-xs md:text-sm lg:text-sm'
  },
  pricing: {
    mobile: 'mb-6',
    tablet: 'mb-7',
    desktop: 'mb-8',
    responsive: 'mb-6 md:mb-7 lg:mb-8'
  },
  priceRow: {
    mobile: 'flex items-center gap-3 mb-5',
    tablet: 'flex items-center gap-4 mb-6',
    desktop: 'flex items-center gap-4 mb-6',
    responsive: 'flex items-center gap-3 mb-5 md:gap-4 md:mb-6 lg:gap-4 lg:mb-6'
  },
  originalPrice: {
    mobile: 'text-gray-500 line-through text-base',
    tablet: 'text-gray-500 line-through text-lg',
    desktop: 'text-gray-500 line-through text-lg',
    responsive: 'text-gray-500 line-through text-base md:text-lg lg:text-lg'
  },
  price: {
    mobile: 'font-bold text-emerald-600 text-2xl',
    tablet: 'font-bold text-emerald-600 text-3xl',
    desktop: 'font-bold text-emerald-600 text-4xl',
    responsive: 'font-bold text-emerald-600 text-2xl md:text-3xl lg:text-4xl'
  },
  priceLabel: {
    mobile: 'text-gray-600 text-base',
    tablet: 'text-gray-600 text-lg',
    desktop: 'text-gray-600 text-lg',
    responsive: 'text-gray-600 text-base md:text-lg lg:text-lg'
  },
  moneyBack: {
    mobile: 'text-gray-600 text-xs mb-5',
    tablet: 'text-gray-600 text-sm mb-6',
    desktop: 'text-gray-600 text-sm mb-6',
    responsive: 'text-gray-600 text-xs mb-5 md:text-sm md:mb-6 lg:text-sm lg:mb-6'
  },
  actions: {
    mobile: 'flex flex-col gap-4 mb-6',
    tablet: 'flex flex-col gap-4 mb-7',
    desktop: 'flex flex-row gap-4 mb-8',
    responsive: 'flex flex-col gap-4 mb-6 md:flex-col md:gap-4 md:mb-7 lg:flex-row lg:gap-4 lg:mb-8'
  },
  ctaButton: {
    mobile: 'px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
    tablet: 'px-7 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
    desktop: 'px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150',
    responsive: 'px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors md:px-7 md:py-3 lg:px-8 lg:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 active:scale-95 shadow-md hover:shadow-lg transition-transform duration-150'
  },
  secondaryButton: {
    mobile: 'px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150',
    tablet: 'px-7 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150',
    desktop: 'px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150',
    responsive: 'px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors md:px-7 md:py-3 lg:px-8 lg:py-4 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 active:scale-95 shadow hover:shadow-md transition-transform duration-150'
  },
  trustIndicators: {
    mobile: 'flex flex-col items-start gap-4 text-xs text-gray-600',
    tablet: 'flex items-center gap-4 text-sm text-gray-600',
    desktop: 'flex items-center gap-6 text-sm text-gray-600',
    responsive: 'flex flex-col items-start gap-4 text-xs text-gray-600 md:flex md:items-center md:gap-4 md:text-sm lg:flex lg:items-center lg:gap-6 lg:text-sm'
  }
};

export const getHeroVariation5ClassMaps = (): HeroVariation5ClassMaps => heroVariation5ClassMaps;

// Metadata for transformer
export const heroVariation5Metadata = {
  componentType: 'hero' as const,
  variationNumber: 5,
  elements: ['container', 'grid', 'contentRight', 'contentLeft', 'coursePreview', 'courseInfo', 'courseTitle', 'modules', 'module', 'moduleNumber', 'moduleTitle', 'badge', 'headline', 'subheadline', 'courseStats', 'statNumber', 'statLabel', 'pricing', 'priceRow', 'originalPrice', 'price', 'priceLabel', 'moneyBack', 'actions', 'ctaButton', 'secondaryButton', 'trustIndicators'],
  hasImage: false,
  hasButtons: true,
  hasPricing: true,
  hasStats: true,
  hasVideo: false,
  hasFeatures: false,
  hasBackground: true,
  hasEmailCapture: false,
  hasTrustSignals: true,
  hasBenefits: false
} as const;
