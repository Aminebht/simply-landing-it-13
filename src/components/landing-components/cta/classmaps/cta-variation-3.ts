/**
 * CTA Variation 3 - Class Maps
 * 
 * Shared class maps for CTA Variation 3 component
 * Used by both React component and static transformer
 */

import { ClassMap } from './cta-variation-1';

export interface CtaVariation3ClassMaps {
  container: ClassMap;
  grid: ClassMap;
  imageContainer: ClassMap;
  contentContainer: ClassMap;
  card: ClassMap;
  imageCard: ClassMap;
  imageOverlay: ClassMap;
  headline: ClassMap;
  checkoutForm: ClassMap;
  ctaButton: ClassMap;
  guarantee: ClassMap;
  [key: string]: ClassMap;
}

export const ctaVariation3ClassMaps: CtaVariation3ClassMaps = {
  container: {
    mobile: "relative overflow-hidden py-12 px-4 bg-gradient-to-br from-slate-50 to-white",
    tablet: "relative overflow-hidden py-16 px-6 bg-gradient-to-br from-slate-50 to-white",
    desktop: "relative overflow-hidden py-20 px-8 bg-gradient-to-br from-slate-50 to-white",
    responsive: "relative overflow-hidden py-12 px-4 bg-gradient-to-br from-slate-50 to-white md:py-16 md:px-6 lg:py-20 lg:px-8"
  },
  grid: {
    mobile: "grid items-center  grid-cols-1 gap-8",
    tablet: "grid items-center grid-cols-1 gap-12",
    desktop: "grid items-center grid-cols-2 gap-16",
    responsive: "grid items-center grid-cols-1 gap-8 md:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:gap-16"
  },
  imageContainer: {
    mobile: "relative order-2 px-2 h-full",
    tablet: "relative order-2 px-0 h-full",
    desktop: "relative order-1 px-0 h-full",
    responsive: "relative order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0"
  },
  contentContainer: {
    mobile: "order-1 px-2",
    tablet: "order-1 px-0",
    desktop: "order-2 px-0",
    responsive: "order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
  },
  card: {
    mobile: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6",
    tablet: "bg-white rounded-2xl shadow-xl border border-gray-100 p-8",
    desktop: "bg-white rounded-2xl shadow-xl border border-gray-100 p-10",
    responsive: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 lg:p-10"
  },
  imageCard: {
    mobile: "bg-white rounded-2xl shadow-xl h-full min-h-[300px] overflow-hidden",
    tablet: "bg-white rounded-2xl shadow-xl h-full min-h-[300px] overflow-hidden",
    desktop: "bg-white rounded-2xl shadow-xl h-full min-h-[350px] overflow-hidden",
    responsive: "bg-white rounded-2xl shadow-xl h-full min-h-[300px] lg:min-h-[350px] overflow-hidden"
  },
  imageOverlay: {
    mobile: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl",
    tablet: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl",
    desktop: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-2xl",
    responsive: "absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-xl lg:rounded-2xl"
  },
  headline: {
    mobile: "font-bold text-2xl mb-2 text-gray-900",
    tablet: "font-bold text-3xl mb-3 text-gray-900",
    desktop: "font-bold text-3xl mb-4 text-gray-900",
    responsive: "font-bold text-2xl mb-2 text-gray-900 md:text-3xl md:mb-3 lg:text-3xl lg:mb-4"
  },
  checkoutForm: {
    mobile: "mb-6",
    tablet: "mb-6",
    desktop: "mb-6",
    responsive: "mb-6"
  },
  ctaButton: {
    mobile: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-3 text-sm mb-4",
    tablet: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-6 py-4 text-base mb-4",
    desktop: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-8 py-4 text-base mb-4",
    responsive: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-3 text-sm mb-4 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-4 lg:text-base"
  },
  guarantee: {
    mobile: "text-center text-xs text-gray-500 flex items-center justify-center gap-1",
    tablet: "text-center text-sm text-gray-500 flex items-center justify-center gap-2",
    desktop: "text-center text-sm text-gray-500 flex items-center justify-center gap-2",
    responsive: "text-center text-xs text-gray-500 flex items-center justify-center gap-1 md:text-sm md:gap-2 lg:text-sm lg:gap-2"
  }
};

export const getCtaVariation3ClassMaps = (): CtaVariation3ClassMaps => ctaVariation3ClassMaps;

// Metadata for transformer
export const ctaVariation3Metadata = {
  componentType: 'cta' as const,
  variationNumber: 3,
  elements: ['container', 'grid', 'imageContainer', 'contentContainer', 'card', 'imageCard', 'imageOverlay', 'headline', 'checkoutForm', 'ctaButton', 'guarantee'],
  hasImage: true,
  hasButtons: true,
  hasPricing: false,
  hasStats: false,
  hasFeatures: false,
  hasBackground: true,
  hasEmailCapture: true,
  hasTrustSignals: false,
  hasBenefits: false,
  hasGradient: true
} as const;
