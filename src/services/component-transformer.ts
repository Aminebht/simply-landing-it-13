import { LandingPageComponent } from '@/types/components';

interface TransformOptions {
  viewport: 'mobile' | 'tablet' | 'desktop' | 'responsive';
  globalTheme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    direction: string;
    language: string;
  };
  productData?: {
    id: string;
    price: number;
  };
}

interface ComponentTransformResult {
  html: string;
  css: string;
  js: string;
}

interface ClassMaps {
  [key: string]: {
    mobile: string;
    tablet: string;
    desktop: string;
    responsive: string;
  };
}

export class ComponentTransformerService {
  /**
   * Transform a React component variation into clean static HTML
   */
  async transformComponent(
    component: LandingPageComponent,
    options: TransformOptions
  ): Promise<ComponentTransformResult> {
    const { viewport = 'responsive', globalTheme, productData } = options;
    
    // Get component variation data
    const variationType = component.component_variation?.component_type;
    const variationNumber = component.component_variation?.variation_number || 1;
    
    // Use a unified transformation method for all component types
    return this.transformUnifiedComponent(component, variationType, variationNumber, options);
  }

  /**
   * Unified component transformation that works for all component types
   */
  private transformUnifiedComponent(
    component: LandingPageComponent,
    componentType: string,
    variationNumber: number,
    options: TransformOptions
  ): ComponentTransformResult {
    const { content, styles, visibility, media_urls, custom_actions } = component;
    const { viewport, globalTheme, productData } = options;

    // Get class maps and structure based on component type
    const { classMaps, structure } = this.getComponentStructure(componentType, variationNumber);
    
    // Generate HTML using the unified structure
    const html = this.generateUnifiedHTML({
      componentType,
      variationNumber,
      content,
      styles,
      visibility,
      mediaUrls: media_urls,
      customActions: custom_actions,
      classMaps,
      structure,
      viewport,
      globalTheme,
      productData
    });

    // Generate component-specific CSS
    const css = this.generateUnifiedCSS(componentType, styles, globalTheme);

    // Generate JavaScript for button actions
    const js = this.generateUnifiedJS(custom_actions, productData);

    return { html, css, js };
  }

  /**
   * Get component structure and class maps based on component type and variation
   */
  private getComponentStructure(componentType: string, variationNumber: number) {
    const classMaps = this.getGenericClassMaps(componentType, variationNumber);
    const structure = this.getComponentElements(componentType);
    
    return { classMaps, structure };
  }

  /**
   * Get generic responsive class maps that work for any component type and variation
   */
  private getGenericClassMaps(componentType: string, variationNumber: number): ClassMaps {
    const baseClasses = {
      container: {
        mobile: "relative py-8 px-3",
        tablet: "relative py-16 px-6",
        desktop: "relative py-20 px-8",
        responsive: "relative py-8 px-3 md:py-16 md:px-6 lg:py-20 lg:px-8"
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
        desktop: "font-bold leading-tight text-5xl mb-6",
        responsive: "font-bold leading-tight text-2xl mb-3 md:text-4xl md:mb-4 lg:text-5xl lg:mb-6"
      },
      subheadline: {
        mobile: "text-gray-600 leading-relaxed text-sm mb-4",
        tablet: "text-gray-600 leading-relaxed text-base mb-6",
        desktop: "text-gray-600 leading-relaxed text-lg mb-8",
        responsive: "text-gray-600 leading-relaxed text-sm mb-4 md:text-base md:mb-6 lg:text-lg lg:mb-8"
      },
      sectionTitle: {
        mobile: "text-3xl font-bold text-center mb-8",
        tablet: "text-4xl font-bold text-center mb-12",
        desktop: "text-5xl font-bold text-center mb-16",
        responsive: "text-3xl font-bold text-center mb-8 md:text-4xl md:mb-12 lg:text-5xl lg:mb-16"
      },
      description: {
        mobile: "text-base text-center mb-8 max-w-2xl mx-auto",
        tablet: "text-lg text-center mb-12 max-w-3xl mx-auto",
        desktop: "text-xl text-center mb-16 max-w-4xl mx-auto",
        responsive: "text-base text-center mb-8 max-w-2xl mx-auto md:text-lg md:mb-12 md:max-w-3xl lg:text-xl lg:mb-16 lg:max-w-4xl"
      }
    };

    // Component-specific adjustments based on type and variation
    return this.getVariationSpecificClassMaps(componentType, variationNumber, baseClasses);
  }

  /**
   * Get variation-specific class maps for different component types and variations
   */
  private getVariationSpecificClassMaps(componentType: string, variationNumber: number, baseClasses: any): ClassMaps {
    switch (componentType) {
      case 'hero':
        return this.getHeroVariationClassMaps(variationNumber, baseClasses);
      case 'features':
        return this.getFeaturesVariationClassMaps(variationNumber, baseClasses);
      case 'cta':
        return this.getCTAVariationClassMaps(variationNumber, baseClasses);
      case 'testimonials':
        return this.getTestimonialsVariationClassMaps(variationNumber, baseClasses);
      case 'pricing':
        return this.getPricingVariationClassMaps(variationNumber, baseClasses);
      case 'faq':
        return this.getFAQVariationClassMaps(variationNumber, baseClasses);
      default:
        return baseClasses;
    }
  }

  /**
   * Get Hero variation-specific class maps
   */
  private getHeroVariationClassMaps(variationNumber: number, baseClasses: any): ClassMaps {
    const heroBaseClasses = {
      ...baseClasses,
      container: {
        mobile: "relative min-h-screen flex items-center py-8 px-3",
        tablet: "relative min-h-screen flex items-center py-16 px-6",
        desktop: "relative min-h-screen flex items-center py-20 px-8",
        responsive: "relative min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-20 lg:px-8"
      },
      priceContainer: {
        mobile: "flex flex-wrap items-center gap-1.5 mb-4",
        tablet: "flex flex-wrap items-center gap-2 mb-6",
        desktop: "flex flex-wrap items-center gap-4 mb-8",
        responsive: "flex flex-wrap items-center gap-1.5 mb-4 md:gap-2 md:mb-6 lg:gap-4 lg:mb-8"
      },
      price: {
        mobile: "font-bold text-green-600 text-lg",
        tablet: "font-bold text-green-600 text-xl",
        desktop: "font-bold text-green-600 text-2xl",
        responsive: "font-bold text-green-600 text-lg md:text-xl lg:text-2xl"
      },
      originalPrice: {
        mobile: "text-gray-500 line-through text-xs",
        tablet: "text-gray-500 line-through text-sm",
        desktop: "text-gray-500 line-through text-base",
        responsive: "text-gray-500 line-through text-xs md:text-sm lg:text-base"
      },
      buttonsContainer: {
        mobile: "flex flex-col gap-2.5",
        tablet: "flex flex-col gap-3 md:flex-row md:gap-3",
        desktop: "flex flex-col gap-4 md:flex-row md:gap-4",
        responsive: "flex flex-col gap-2.5 md:flex-row md:gap-3 lg:flex-row lg:gap-4"
      },
      ctaButton: {
        mobile: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-center w-full px-4 py-2.5 text-sm",
        tablet: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-center w-auto px-6 py-3 text-base",
        desktop: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-center w-auto px-8 py-4 text-base",
        responsive: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base"
      },
      secondaryButton: {
        mobile: "border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center w-full px-4 py-2.5 text-sm",
        tablet: "border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center w-auto px-6 py-3 text-base",
        desktop: "border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center w-auto px-8 py-4 text-base",
        responsive: "border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base"
      }
    };

    // Variation-specific adjustments
    switch (variationNumber) {
      case 1:
        return {
          ...heroBaseClasses,
          container: {
            mobile: "relative overflow-hidden min-h-screen flex items-center py-8 px-3",
            tablet: "relative overflow-hidden min-h-screen flex items-center py-16 px-6",
            desktop: "relative overflow-hidden min-h-screen flex items-center py-24 px-8",
            responsive: "relative overflow-hidden min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-24 lg:px-8"
          }
        };

      case 2:
        return {
          ...heroBaseClasses,
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
          grid: {
            mobile: "grid items-center grid-cols-1 gap-8",
            tablet: "grid items-center grid-cols-1 gap-12",
            desktop: "grid items-center grid-cols-2 gap-16",
            responsive: "grid items-center grid-cols-1 gap-8 md:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:gap-16"
          },
          rightContent: {
            mobile: "relative flex justify-center order-1 px-2",
            tablet: "relative flex justify-center order-1 px-0",
            desktop: "relative flex justify-center order-2 px-0",
            responsive: "relative flex justify-center order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0"
          }
        };

      case 3:
        return {
          ...heroBaseClasses,
          headline: {
            mobile: "font-bold leading-tight text-3xl mb-6",
            tablet: "font-bold leading-tight text-5xl mb-7",
            desktop: "font-bold leading-tight text-7xl mb-8",
            responsive: "font-bold leading-tight text-3xl mb-6 md:text-5xl md:mb-7 lg:text-7xl lg:mb-8"
          },
          badge: {
            mobile: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-xs mb-6",
            tablet: "inline-flex items-center rounded-full font-semibold px-5 py-2.5 text-sm mb-7",
            desktop: "inline-flex items-center rounded-full font-semibold px-6 py-3 text-sm mb-8",
            responsive: "inline-flex items-center rounded-full font-semibold px-4 py-2 text-xs mb-6 md:px-5 md:py-2.5 md:text-sm md:mb-7 lg:px-6 lg:py-3 lg:text-sm lg:mb-8"
          }
        };

      default:
        return heroBaseClasses;
    }
  }

  /**
   * Get CTA variation-specific class maps
   */
  private getCTAVariationClassMaps(variationNumber: number, baseClasses: any): ClassMaps {
    const ctaBaseClasses = {
      ...baseClasses,
      container: {
        mobile: "relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-4",
        tablet: "relative overflow-hidden min-h-screen flex items-center justify-center py-16 px-6",
        desktop: "relative overflow-hidden min-h-screen flex items-center justify-center py-24 px-8",
        responsive: "relative overflow-hidden min-h-screen flex items-center justify-center py-8 px-4 md:py-16 md:px-6 lg:py-24 lg:px-8"
      }
    };

    switch (variationNumber) {
      case 1:
        return {
          ...ctaBaseClasses,
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
          ctaButton: {
            mobile: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-6 py-3 text-sm relative z-10",
            tablet: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-8 py-4 text-base relative z-10",
            desktop: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-8 py-4 text-base relative z-10",
            responsive: "w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center px-6 py-3 text-sm relative z-10 md:px-8 md:py-4 md:text-base lg:px-8 lg:py-4 lg:text-base"
          }
        };

      case 2:
        return {
          ...ctaBaseClasses,
          container: {
            mobile: "flex flex-col items-center justify-center min-h-screen w-full px-4",
            tablet: "flex flex-col items-center justify-center min-h-screen w-full px-8",
            desktop: "flex flex-col items-center justify-center min-h-screen w-full px-16",
            responsive: "flex flex-col items-center justify-center min-h-screen w-full px-4 md:px-8 lg:px-16"
          },
          headline: {
            mobile: "font-bold text-2xl mb-4 text-center",
            tablet: "font-bold text-4xl mb-4 text-center",
            desktop: "font-bold text-5xl mb-4 text-center",
            responsive: "font-bold text-2xl mb-4 text-center md:text-4xl lg:text-5xl"
          },
          subheadline: {
            mobile: "text-gray-400 text-lg mb-6 text-center",
            tablet: "text-gray-400 text-xl mb-6 text-center",
            desktop: "text-gray-400 text-xl mb-6 text-center",
            responsive: "text-gray-400 text-lg mb-6 text-center md:text-xl"
          },
          ctaButton: {
            mobile: "w-full rounded-full bg-blue-600 text-white font-semibold py-3 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl",
            tablet: "w-full rounded-full bg-blue-600 text-white font-semibold py-4 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl",
            desktop: "w-full rounded-full bg-blue-600 text-white font-semibold py-4 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl",
            responsive: "w-full max-w-md md:max-w-lg rounded-full bg-blue-600 text-white font-semibold py-3 mt-2 hover:bg-blue-700 transition text-center transform hover:scale-105 shadow-lg hover:shadow-xl md:py-4"
          }
        };

      case 3:
        return {
          ...ctaBaseClasses,
          container: {
            mobile: "relative overflow-hidden py-12 px-4 bg-gradient-to-br from-slate-50 to-white",
            tablet: "relative overflow-hidden py-16 px-6 bg-gradient-to-br from-slate-50 to-white",
            desktop: "relative overflow-hidden py-20 px-8 bg-gradient-to-br from-slate-50 to-white",
            responsive: "relative overflow-hidden py-12 px-4 bg-gradient-to-br from-slate-50 to-white md:py-16 md:px-6 lg:py-20 lg:px-8"
          },
          grid: {
            mobile: "grid items-center grid-cols-1 gap-8",
            tablet: "grid items-center grid-cols-1 gap-12",
            desktop: "grid items-center grid-cols-2 gap-16",
            responsive: "grid items-center grid-cols-1 gap-8 md:grid-cols-1 md:gap-12 lg:grid-cols-2 lg:gap-16"
          },
          card: {
            mobile: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6",
            tablet: "bg-white rounded-2xl shadow-xl border border-gray-100 p-8",
            desktop: "bg-white rounded-2xl shadow-xl border border-gray-100 p-10",
            responsive: "bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 lg:p-10"
          },
          headline: {
            mobile: "font-bold text-2xl mb-2 text-gray-900",
            tablet: "font-bold text-3xl mb-3 text-gray-900",
            desktop: "font-bold text-4xl mb-4 text-gray-900",
            responsive: "font-bold text-2xl mb-2 text-gray-900 md:text-3xl md:mb-3 lg:text-4xl lg:mb-4"
          },
          ctaButton: {
            mobile: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-3 text-sm mb-4",
            tablet: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-6 py-4 text-base mb-4",
            desktop: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-8 py-4 text-base mb-4",
            responsive: "bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-3 text-sm mb-4 md:px-6 md:py-4 md:text-base lg:px-8 lg:py-4 lg:text-base"
          }
        };

      default:
        return ctaBaseClasses;
    }
  }

  /**
   * Get Features variation-specific class maps
   */
  private getFeaturesVariationClassMaps(variationNumber: number, baseClasses: any): ClassMaps {
    const featuresBaseClasses = {
      ...baseClasses,
      grid: {
        mobile: "grid grid-cols-1 gap-8",
        tablet: "grid grid-cols-2 gap-8",
        desktop: "grid grid-cols-3 gap-10",
        responsive: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10"
      },
      featureCard: {
        mobile: "group relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2",
        tablet: "group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2",
        desktop: "group relative p-10 bg-white rounded-3xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-3",
        responsive: "group relative p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 md:p-8 lg:p-10 lg:rounded-3xl lg:hover:shadow-2xl lg:hover:-translate-y-3"
      },
      iconContainer: {
        mobile: "w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-300",
        tablet: "w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-300",
        desktop: "w-20 h-20 mb-8 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-300",
        responsive: "w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-300 lg:w-20 lg:h-20 lg:mb-8 lg:rounded-3xl"
      },
      featureTitle: {
        mobile: "text-xl font-bold mb-3 text-center",
        tablet: "text-xl font-bold mb-3 text-center",
        desktop: "text-2xl font-bold mb-4 text-center",
        responsive: "text-xl font-bold mb-3 text-center lg:text-2xl lg:mb-4"
      },
      featureDescription: {
        mobile: "text-gray-600 text-center text-sm",
        tablet: "text-gray-600 text-center text-base",
        desktop: "text-gray-600 text-center text-lg",
        responsive: "text-gray-600 text-center text-sm md:text-base lg:text-lg"
      }
    };

    // Features variations have similar structure, return base for now
    return featuresBaseClasses;
  }

  /**
   * Get Testimonials variation-specific class maps
   */
  private getTestimonialsVariationClassMaps(variationNumber: number, baseClasses: any): ClassMaps {
    const testimonialsBaseClasses = {
      ...baseClasses,
      grid: {
        mobile: "grid grid-cols-1 gap-6",
        tablet: "grid grid-cols-2 gap-8",
        desktop: "grid grid-cols-3 gap-8",
        responsive: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      },
      testimonialCard: {
        mobile: "bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300",
        tablet: "bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300",
        desktop: "bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300",
        responsive: "bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 md:p-8"
      },
      avatar: {
        mobile: "w-12 h-12 rounded-full object-cover",
        tablet: "w-14 h-14 rounded-full object-cover",
        desktop: "w-16 h-16 rounded-full object-cover",
        responsive: "w-12 h-12 rounded-full object-cover md:w-14 md:h-14 lg:w-16 lg:h-16"
      },
      quote: {
        mobile: "text-gray-600 mb-4 italic text-sm",
        tablet: "text-gray-600 mb-4 italic text-base",
        desktop: "text-gray-600 mb-6 italic text-lg",
        responsive: "text-gray-600 mb-4 italic text-sm md:text-base lg:text-lg lg:mb-6"
      },
      authorName: {
        mobile: "font-semibold text-gray-900 text-sm",
        tablet: "font-semibold text-gray-900 text-base",
        desktop: "font-semibold text-gray-900 text-lg",
        responsive: "font-semibold text-gray-900 text-sm md:text-base lg:text-lg"
      }
    };

    return testimonialsBaseClasses;
  }

  /**
   * Get Pricing variation-specific class maps
   */
  private getPricingVariationClassMaps(variationNumber: number, baseClasses: any): ClassMaps {
    const pricingBaseClasses = {
      ...baseClasses,
      grid: {
        mobile: "grid grid-cols-1 gap-6",
        tablet: "grid grid-cols-2 gap-8",
        desktop: "grid grid-cols-3 gap-8",
        responsive: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      },
      pricingCard: {
        mobile: "bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300",
        tablet: "bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300",
        desktop: "bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300",
        responsive: "bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 md:p-8"
      },
      planName: {
        mobile: "text-xl font-bold text-center mb-2",
        tablet: "text-xl font-bold text-center mb-3",
        desktop: "text-2xl font-bold text-center mb-4",
        responsive: "text-xl font-bold text-center mb-2 md:mb-3 lg:text-2xl lg:mb-4"
      }
    };

    return pricingBaseClasses;
  }

  /**
   * Get FAQ variation-specific class maps
   */
  private getFAQVariationClassMaps(variationNumber: number, baseClasses: any): ClassMaps {
    const faqBaseClasses = {
      ...baseClasses,
      grid: {
        mobile: "space-y-4",
        tablet: "space-y-6",
        desktop: "space-y-6",
        responsive: "space-y-4 md:space-y-6"
      },
      faqItem: {
        mobile: "bg-white rounded-lg border border-gray-200 p-4",
        tablet: "bg-white rounded-lg border border-gray-200 p-6",
        desktop: "bg-white rounded-lg border border-gray-200 p-6",
        responsive: "bg-white rounded-lg border border-gray-200 p-4 md:p-6"
      },
      question: {
        mobile: "font-semibold text-gray-900 text-sm mb-2",
        tablet: "font-semibold text-gray-900 text-base mb-3",
        desktop: "font-semibold text-gray-900 text-lg mb-3",
        responsive: "font-semibold text-gray-900 text-sm mb-2 md:text-base md:mb-3 lg:text-lg"
      },
      answer: {
        mobile: "text-gray-600 text-sm",
        tablet: "text-gray-600 text-base",
        desktop: "text-gray-600 text-base",
        responsive: "text-gray-600 text-sm md:text-base"
      }
    };

    return faqBaseClasses;
  }

  /**
   * Get the common elements structure for each component type
   */
  private getComponentElements(componentType: string): string[] {
    switch (componentType) {
      case 'hero':
        return ['container', 'grid', 'leftContent', 'rightContent', 'badge', 'headline', 'subheadline', 'priceContainer', 'buttonsContainer'];
      case 'features':
        return ['container', 'sectionTitle', 'description', 'grid', 'featureCard', 'iconContainer', 'featureTitle', 'featureDescription'];
      case 'cta':
        return ['container', 'card', 'headline', 'subheadline', 'ctaButton'];
      case 'testimonials':
        return ['container', 'sectionTitle', 'description', 'grid', 'testimonialCard', 'avatar', 'quote', 'authorName'];
      case 'pricing':
        return ['container', 'sectionTitle', 'description', 'grid', 'pricingCard', 'planName'];
      case 'faq':
        return ['container', 'sectionTitle', 'description', 'grid', 'faqItem', 'question', 'answer'];
      default:
        return ['container', 'headline', 'subheadline'];
    }
  }

  /**
   * Generate unified HTML for any component type
   */
  private generateUnifiedHTML(params: {
    componentType: string;
    variationNumber: number;
    content: any;
    styles: any;
    visibility: any;
    mediaUrls: any;
    customActions: any;
    classMaps: ClassMaps;
    structure: string[];
    viewport: string;
    globalTheme?: any;
    productData?: any;
  }): string {
    const { componentType, content, visibility, mediaUrls, customActions, classMaps, viewport, globalTheme } = params;
    
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    // Use global theme colors or fallback to defaults
    const primaryColor = globalTheme?.primaryColor || '#2563eb';
    const secondaryColor = globalTheme?.secondaryColor || '#3730a3';
    const backgroundColor = globalTheme?.backgroundColor || '#ffffff';
    const textColor = globalTheme?.textColor || '#000000';
    
    // Generate component-specific HTML
    switch (componentType) {
      case 'hero':
        return this.generateHeroHTML(params);
      case 'features':
        return this.generateFeaturesHTML(params);
      case 'cta':
        return this.generateCTAHTML(params);
      case 'testimonials':
        return this.generateTestimonialsHTML(params);
      case 'pricing':
        return this.generatePricingHTML(params);
      case 'faq':
        return this.generateFAQHTML(params);
      default:
        return this.generateGenericHTML(params);
    }
  }

  /**
   * Generate Hero component HTML
   */
  private generateHeroHTML(params: any): string {
    const { content, styles, visibility, mediaUrls, customActions, classMaps, viewport, globalTheme } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    const primaryColor = globalTheme?.primaryColor || '#2563eb';
    const textColor = globalTheme?.textColor || '#000000';
    
    return `
      <section class="${getClass(classMaps.container)}" style="background: linear-gradient(135deg, ${globalTheme?.secondaryColor || '#3730a3'} 0%, ${primaryColor} 100%);">
        <div class="max-w-7xl mx-auto w-full">
          <div class="${getClass(classMaps.grid)}">
            <!-- Left Content -->
            <div class="${getClass(classMaps.leftContent)}">
              ${this.isVisible(visibility, 'badge') ? `
                <span class="${getClass(classMaps.badge)}" 
                      style="background-color: rgba(59, 130, 246, 0.1); color: ${textColor};">
                  ${content.badge || '🔥 Best Seller'}
                </span>
              ` : ''}
              
              ${this.isVisible(visibility, 'headline') ? `
                <h1 class="${getClass(classMaps.headline)}" style="color: ${textColor};">
                  ${content.headline || 'Your Headline Here'}
                </h1>
              ` : ''}
              
              ${this.isVisible(visibility, 'subheadline') ? `
                <p class="${getClass(classMaps.subheadline)}" style="color: rgba(0, 0, 0, 0.7);">
                  ${content.subheadline || 'Your subheadline here'}
                </p>
              ` : ''}
              
              ${this.isVisible(visibility, 'price') ? `
                <div class="${getClass(classMaps.priceContainer)}">
                  <span class="${getClass(classMaps.price)}">
                    ${content.price || '0'} ${content.currency || 'DT'}
                  </span>
                  ${content.originalPrice ? `
                    <span class="${getClass(classMaps.originalPrice)}">
                      ${content.originalPrice} ${content.currency || 'DT'}
                    </span>
                  ` : ''}
                </div>
              ` : ''}
              
              <div class="${getClass(classMaps.buttonsContainer)}">
                ${this.isVisible(visibility, 'ctaButton') ? `
                  <button class="${getClass(classMaps.ctaButton)}" 
                          onclick="handleButtonClick('cta')"
                          style="background-color: ${primaryColor}; color: white;">
                    ${content.ctaText || 'Get Started'}
                  </button>
                ` : ''}
                
                ${this.isVisible(visibility, 'secondaryButton') && content.secondaryButtonText ? `
                  <button class="${getClass(classMaps.secondaryButton)}"
                          onclick="handleButtonClick('secondary')"
                          style="border-color: ${primaryColor}; color: ${primaryColor};">
                    ${content.secondaryButtonText}
                  </button>
                ` : ''}
              </div>
            </div>
            
            <!-- Right Content (Image) -->
            <div class="${getClass(classMaps.rightContent)}">
              ${mediaUrls?.productImage ? `
                <img src="${mediaUrls.productImage}" 
                     alt="${content.headline || 'Product'}"
                     class="w-full h-auto rounded-lg shadow-xl" />
              ` : `
                <div class="w-full h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span class="text-gray-500">Product Image</span>
                </div>
              `}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Generate Features component HTML
   */
  private generateFeaturesHTML(params: any): string {
    const { content, visibility, classMaps, viewport, globalTheme } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    const features = content.features || [
      { title: 'Lightning Fast', description: 'Get results in seconds, not minutes.', icon: '⚡' },
      { title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.9% uptime.', icon: '🔒' },
      { title: 'Expert Support', description: 'Get help from our team of experts, available 24/7.', icon: '👨‍💼' }
    ];
    
    return `
      <section class="${getClass(classMaps.container)}">
        <div class="max-w-7xl mx-auto">
          ${this.isVisible(visibility, 'sectionTitle') ? `
            <h2 class="${getClass(classMaps.sectionTitle)}">
              ${content.sectionTitle || 'Why Choose Us'}
            </h2>
          ` : ''}
          
          ${this.isVisible(visibility, 'description') ? `
            <p class="${getClass(classMaps.description)}">
              ${content.description || 'Discover the features that make us different'}
            </p>
          ` : ''}
          
          <div class="${getClass(classMaps.grid)}">
            ${features.map((feature: any, index: number) => `
              <div class="${getClass(classMaps.featureCard)}">
                ${this.isVisible(visibility, 'icons') ? `
                  <div class="${getClass(classMaps.iconContainer)}">
                    <span class="text-2xl">${feature.icon || '✨'}</span>
                  </div>
                ` : ''}
                <h3 class="${getClass(classMaps.featureTitle)}">
                  ${feature.title || `Feature ${index + 1}`}
                </h3>
                <p class="${getClass(classMaps.featureDescription)}">
                  ${feature.description || 'Feature description here'}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Generate CTA component HTML
   */
  private generateCTAHTML(params: any): string {
    const { content, visibility, classMaps, viewport, globalTheme } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    const primaryColor = globalTheme?.primaryColor || '#2563eb';
    
    return `
      <section class="${getClass(classMaps.container)}" 
               style="background: linear-gradient(135deg, ${globalTheme?.secondaryColor || '#667eea'} 0%, ${globalTheme?.primaryColor || '#764ba2'} 100%);">
        <div class="${getClass(classMaps.card)}">
          ${this.isVisible(visibility, 'headline') ? `
            <h2 class="${getClass(classMaps.headline)}" style="color: white;">
              ${content.headline || 'Ready to Get Started?'}
            </h2>
          ` : ''}
          
          ${this.isVisible(visibility, 'subheadline') ? `
            <p class="${getClass(classMaps.subheadline)}" style="color: rgba(255, 255, 255, 0.8);">
              ${content.subheadline || 'Join thousands of satisfied customers'}
            </p>
          ` : ''}
          
          ${this.isVisible(visibility, 'ctaButton') ? `
            <button class="${getClass(classMaps.ctaButton)}" 
                    onclick="handleButtonClick('cta')"
                    style="background: linear-gradient(to right, ${primaryColor}, #4f46e5);">
              ${content.ctaText || 'Get Started Now'}
            </button>
          ` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate Testimonials component HTML
   */
  private generateTestimonialsHTML(params: any): string {
    const { content, visibility, classMaps, viewport } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    const testimonials = content.testimonials || [
      { name: 'John Doe', quote: 'Amazing service!', avatar: '', role: 'CEO' },
      { name: 'Jane Smith', quote: 'Highly recommended!', avatar: '', role: 'Designer' },
      { name: 'Mike Johnson', quote: 'Outstanding quality!', avatar: '', role: 'Developer' }
    ];
    
    return `
      <section class="${getClass(classMaps.container)}">
        <div class="max-w-7xl mx-auto">
          ${this.isVisible(visibility, 'sectionTitle') ? `
            <h2 class="${getClass(classMaps.sectionTitle)}">
              ${content.sectionTitle || 'What Our Customers Say'}
            </h2>
          ` : ''}
          
          <div class="${getClass(classMaps.grid)}">
            ${testimonials.map((testimonial: any, index: number) => `
              <div class="${getClass(classMaps.testimonialCard)}">
                <p class="${getClass(classMaps.quote)}">
                  "${testimonial.quote || 'Great experience!'}"
                </p>
                <div class="flex items-center space-x-3">
                  ${testimonial.avatar ? `
                    <img src="${testimonial.avatar}" alt="${testimonial.name}" class="${getClass(classMaps.avatar)}" />
                  ` : `
                    <div class="${getClass(classMaps.avatar)} bg-gray-300 flex items-center justify-center">
                      <span class="text-gray-600 font-semibold">${(testimonial.name || 'User')[0]}</span>
                    </div>
                  `}
                  <div>
                    <div class="${getClass(classMaps.authorName)}">
                      ${testimonial.name || `Customer ${index + 1}`}
                    </div>
                    ${testimonial.role ? `
                      <div class="text-gray-500 text-sm">${testimonial.role}</div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Generate Pricing component HTML
   */
  private generatePricingHTML(params: any): string {
    const { content, visibility, classMaps, viewport, globalTheme } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    const plans = content.plans || [
      { name: 'Basic', price: '29', features: ['Feature 1', 'Feature 2'], currency: 'USD' },
      { name: 'Pro', price: '59', features: ['Everything in Basic', 'Feature 3', 'Feature 4'], currency: 'USD' },
      { name: 'Enterprise', price: '99', features: ['Everything in Pro', 'Feature 5', 'Feature 6'], currency: 'USD' }
    ];
    
    return `
      <section class="${getClass(classMaps.container)}">
        <div class="max-w-7xl mx-auto">
          ${this.isVisible(visibility, 'sectionTitle') ? `
            <h2 class="${getClass(classMaps.sectionTitle)}">
              ${content.sectionTitle || 'Choose Your Plan'}
            </h2>
          ` : ''}
          
          <div class="${getClass(classMaps.grid)}">
            ${plans.map((plan: any, index: number) => `
              <div class="${getClass(classMaps.pricingCard)}">
                <h3 class="${getClass(classMaps.planName)}">
                  ${plan.name || `Plan ${index + 1}`}
                </h3>
                <div class="text-center mb-6">
                  <span class="text-4xl font-bold">${plan.price || '0'}</span>
                  <span class="text-gray-600">/${plan.currency || 'USD'}</span>
                </div>
                <ul class="space-y-3 mb-6">
                  ${(plan.features || ['Feature 1', 'Feature 2']).map((feature: string) => `
                    <li class="flex items-center">
                      <span class="text-green-500 mr-2">✓</span>
                      ${feature}
                    </li>
                  `).join('')}
                </ul>
                <button class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        onclick="handleButtonClick('pricing-${index}')">
                  Choose Plan
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Generate FAQ component HTML
   */
  private generateFAQHTML(params: any): string {
    const { content, visibility, classMaps, viewport } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    const faqs = content.faqs || [
      { question: 'What is this service?', answer: 'This is a great service that helps you achieve your goals.' },
      { question: 'How does it work?', answer: 'It works by providing you with the tools and support you need.' },
      { question: 'Is there support available?', answer: 'Yes, we offer 24/7 customer support.' }
    ];
    
    return `
      <section class="${getClass(classMaps.container)}">
        <div class="max-w-4xl mx-auto">
          ${this.isVisible(visibility, 'sectionTitle') ? `
            <h2 class="${getClass(classMaps.sectionTitle)}">
              ${content.sectionTitle || 'Frequently Asked Questions'}
            </h2>
          ` : ''}
          
          <div class="${getClass(classMaps.grid)}">
            ${faqs.map((faq: any, index: number) => `
              <div class="${getClass(classMaps.faqItem)}">
                <h3 class="${getClass(classMaps.question)}">
                  ${faq.question || `Question ${index + 1}?`}
                </h3>
                <p class="${getClass(classMaps.answer)}">
                  ${faq.answer || 'Answer to the question.'}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Generate generic component HTML for unknown types
   */
  private generateGenericHTML(params: any): string {
    const { componentType, variationNumber, content, classMaps, viewport } = params;
    const getClass = (classMapObj: any) => classMapObj[viewport] || classMapObj.responsive || '';
    
    return `
      <section class="${getClass(classMaps.container || {})}">
        <div class="max-w-7xl mx-auto text-center">
          <h2 class="${getClass(classMaps.headline || {})}" style="margin-bottom: 1rem;">
            ${content.headline || `${componentType} Component`}
          </h2>
          <p class="${getClass(classMaps.subheadline || {})}" style="margin-bottom: 2rem;">
            ${content.subheadline || `Variation ${variationNumber}`}
          </p>
          <div class="bg-gray-100 p-8 rounded-lg">
            <p class="text-gray-600">
              Component: ${componentType} - Variation: ${variationNumber}
            </p>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Helper function to check visibility
   */
  private isVisible(visibility: Record<string, any> | undefined, key: string): boolean {
    return visibility?.[key] !== false;
  }

  /**
   * Generate unified CSS for any component type
   */
  private generateUnifiedCSS(componentType: string, styles: any, globalTheme?: any): string {
    const fontFamily = globalTheme?.fontFamily || 'Inter';
    
    const baseCSS = `
      /* ${componentType} Component Styles */
      .${componentType}-section {
        font-family: '${fontFamily}', sans-serif;
      }
      
      .${componentType}-section button:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease;
      }
      
      .${componentType}-section img {
        transition: transform 0.3s ease;
      }
      
      .${componentType}-section img:hover {
        transform: scale(1.02);
      }
    `;

    // Component-specific CSS
    switch (componentType) {
      case 'hero':
        return baseCSS + `
          .hero-section .gradient-bg {
            background: linear-gradient(135deg, ${globalTheme?.secondaryColor || '#667eea'} 0%, ${globalTheme?.primaryColor || '#764ba2'} 100%);
          }
        `;
      case 'features':
        return baseCSS + `
          .features-section .feature-card:hover {
            transform: translateY(-8px);
            transition: transform 0.3s ease;
          }
        `;
      case 'cta':
        return baseCSS + `
          .cta-section .glass-effect {
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `;
      case 'testimonials':
        return baseCSS + `
          .testimonials-section .testimonial-card:hover {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
        `;
      default:
        return baseCSS;
    }
  }

  /**
   * Generate unified JavaScript for button actions
   */
  private generateUnifiedJS(customActions: any, productData?: any): string {
    const actions = customActions || {};
    
    return `
      function handleButtonClick(buttonType) {
        const action = ${JSON.stringify(actions)}[buttonType];
        
        if (!action) {
          console.log('No action defined for button:', buttonType);
          return;
        }
        
        switch(action.type) {
          case 'checkout':
          case 'marketplace_checkout':
            if (action.productId && action.amount) {
              // Redirect to checkout URL
              const checkoutUrl = action.checkoutUrl || \`https://checkout.example.com?product=\${action.productId}&amount=\${action.amount}\`;
              window.location.href = checkoutUrl;
            }
            break;
          case 'open_link':
          case 'external_link':
            if (action.url) {
              let url = action.url;
              if (url && !/^https?:\\/\\//i.test(url)) {
                url = 'https://' + url;
              }
              if (action.openInNewTab || action.newTab) {
                window.open(url, '_blank');
              } else {
                window.location.href = url;
              }
            }
            break;
          case 'scroll':
          case 'scroll_to':
            if (action.targetId) {
              const element = document.getElementById(action.targetId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }
            break;
          case 'modal':
            // Show modal functionality
            if (action.modalContent) {
              alert(action.modalContent); // Simple implementation, can be enhanced
            }
            break;
          default:
            console.log('Unknown action type:', action.type);
        }
        
        // Track event if analytics are available
        if (typeof gtag !== 'undefined' && action.trackingEvent) {
          gtag('event', action.trackingEvent, {
            'event_category': 'Button Click',
            'event_label': buttonType
          });
        }
      }
      
      // Initialize component
      document.addEventListener('DOMContentLoaded', function() {
        console.log('Component loaded and ready');
      });
    `;
  }
}
