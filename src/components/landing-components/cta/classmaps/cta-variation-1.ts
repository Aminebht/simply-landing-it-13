/**
 * CTA Variation 1 - Class Maps
 * 
 * Shared class maps for CTA Variation 1 component
 * Used by both React component and static transformer
 */

export interface ClassMap {
  mobile: string;
  tablet: string;
  desktop: string;
  responsive: string;
  [key: string]: string;
}

export interface CtaVariation1ClassMaps {
  container: ClassMap;
  card: ClassMap;
  headline: ClassMap;
  subheadline: ClassMap;
  formContainer: ClassMap;
  ctaButton: ClassMap;
  price: ClassMap;
}

export const ctaVariation1ClassMaps: CtaVariation1ClassMaps = {
  container: {
    mobile: "relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-4",
    tablet: "relative overflow-hidden min-h-screen flex items-center justify-center py-16 px-6",
    desktop: "relative overflow-hidden min-h-screen flex items-center justify-center py-24 px-8",
    responsive: "relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-4 md:py-16 md:px-6 lg:py-24 lg:px-8"
  },
  card: {
    mobile: "relative max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
    tablet: "relative max-w-lg mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
    desktop: "relative max-w-xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
    responsive: "relative max-w-md mx-auto bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none md:max-w-lg md:rounded-3xl md:p-8 md:before:rounded-3xl lg:max-w-xl lg:rounded-3xl lg:p-10 lg:before:rounded-3xl"
  },
  headline: {
    mobile: "font-bold leading-tight text-2xl mb-3 text-white text-center relative z-10",
    tablet: "font-bold leading-tight text-3xl mb-4 text-white text-center relative z-10",
    desktop: "font-bold leading-tight text-4xl mb-6 text-white text-center relative z-10",
    responsive: "font-bold leading-tight text-2xl mb-3 text-white text-center relative z-10 md:text-3xl md:mb-4 lg:text-4xl lg:mb-6"
  },
  subheadline: {
    mobile: "text-white/80 leading-relaxed text-sm mb-6 text-center relative z-10",
    tablet: "text-white/80 leading-relaxed text-base mb-8 text-center relative z-10",
    desktop: "text-white/80 leading-relaxed text-lg mb-8 text-center relative z-10",
    responsive: "text-white/80 leading-relaxed text-sm mb-6 text-center relative z-10 md:text-base md:mb-8 lg:text-lg lg:mb-8"
  },
  formContainer: {
    mobile: "mb-6 relative z-10",
    tablet: "mb-8 relative z-10",
    desktop: "mb-8 relative z-10",
    responsive: "mb-6 relative z-10 md:mb-8 lg:mb-8"
  },
  ctaButton: {
    mobile: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-6 py-3 text-sm relative z-10",
    tablet: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-8 py-4 text-base relative z-10",
    desktop: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-8 py-4 text-base relative z-10",
    responsive: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-6 py-3 text-sm relative z-10 md:px-8 md:py-4 md:text-base lg:px-8 lg:py-4 lg:text-base"
  },
  price: {
    mobile: "font-extrabold text-4xl text-primary text-center drop-shadow-lg",
    tablet: "font-extrabold text-5xl text-primary text-center drop-shadow-lg",
    desktop: "font-extrabold text-6xl text-primary text-center drop-shadow-lg",
    responsive: "font-extrabold text-4xl text-primary text-center drop-shadow-lg md:text-5xl lg:text-6xl"
  }
};

// Metadata for transformer
export const ctaVariation1Metadata = {
  componentType: 'cta' as const,
  variationNumber: 1,
  elements: ['container', 'card', 'headline', 'subheadline', 'formContainer', 'ctaButton'],
  hasImage: false,
  hasButtons: true,
  hasPricing: true,
  hasGlassCard: true,
  hasGradientBackground: true
} as const;
