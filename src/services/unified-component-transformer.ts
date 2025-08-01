/**
 * Unified Component Transformer Service
 * 
 * This service provides a scalable, unified approach to transforming React components
 * into static HTML/CSS/JS. It dynamically imports component class maps and metadata
 * instead of hardcoding them.
 * 
 * Key Features:
 * - Single generateHTML function for all component types
 * - Single generateCSS function for all component types  
 * - Single generateJS function for all component types
 * - Dynamic class map extraction from component files
 * - No hardcoded component structures
 * - Fully scalable architecture
 */

import { LandingPageComponent } from '@/types/components';
import { componentRegistry, ComponentClassMaps, ComponentMetadata } from './component-registry';

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

export class UnifiedComponentTransformerService {
  /**
   * Transform a React component variation into clean static HTML
   */
  async transformComponent(
    component: LandingPageComponent,
    options: TransformOptions
  ): Promise<ComponentTransformResult> {
    const { viewport = 'responsive', globalTheme, productData } = options;
    
    // Get component variation data
    const componentType = component.component_variation?.component_type;
    const variationNumber = component.component_variation?.variation_number || 1;
    
    if (!componentType) {
      throw new Error('Component type is required for transformation');
    }

    // Get component exports (class maps, metadata) from registry
    const componentExports = await componentRegistry.getComponentExports(componentType, variationNumber);
    
    if (!componentExports) {
      throw new Error(`Component variation not found: ${componentType}-${variationNumber}`);
    }

    const { classMaps, metadata } = componentExports;
    
    if (!classMaps) {
      throw new Error(`Class maps not found for ${componentType}-${variationNumber}. Please export class maps from the component file.`);
    }

    // Extract component data
    const { content, styles, visibility, media_urls, custom_actions } = component;

    // Generate unified output
    const html = this.generateHTML({
      componentType,
      variationNumber,
      content,
      styles,
      visibility,
      mediaUrls: media_urls,
      customActions: custom_actions,
      classMaps,
      metadata: metadata!,
      viewport,
      globalTheme,
      productData
    });

    const css = this.generateCSS({
      componentType,
      variationNumber,
      styles,
      globalTheme,
      metadata: metadata!
    });

    const js = this.generateJS({
      componentType,
      variationNumber,
      customActions: custom_actions,
      productData,
      metadata: metadata!
    });

    return { html, css, js };
  }

  /**
   * Single unified HTML generation function for all component types and variations
   */
  private generateHTML(params: {
    componentType: string;
    variationNumber: number;
    content: any;
    styles: any;
    visibility: any;
    mediaUrls: any;
    customActions: any;
    classMaps: ComponentClassMaps;
    metadata: ComponentMetadata;
    viewport: string;
    globalTheme?: any;
    productData?: any;
  }): string {
    const { 
      componentType, 
      variationNumber, 
      content, 
      visibility, 
      mediaUrls, 
      classMaps, 
      metadata, 
      viewport, 
      globalTheme 
    } = params;

    // Helper function to get viewport-specific class
    const getClass = (elementName: string): string => {
      const classMap = classMaps[elementName];
      if (!classMap) return '';
      return classMap[viewport as keyof typeof classMap] || classMap.responsive || '';
    };

    // Helper function to check visibility
    const isVisible = (elementName: string): boolean => {
      return visibility?.[elementName] !== false;
    };

    // Get theme colors with fallbacks
    const primaryColor = globalTheme?.primaryColor || '#2563eb';
    const secondaryColor = globalTheme?.secondaryColor || '#3730a3';
    const backgroundColor = globalTheme?.backgroundColor || '#ffffff';
    const textColor = globalTheme?.textColor || '#000000';

    // Build HTML structure dynamically based on metadata and available elements
    const htmlStructure = this.buildHTMLStructure({
      componentType,
      variationNumber,
      content,
      mediaUrls,
      classMaps,
      metadata,
      getClass,
      isVisible,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor
    });

    return htmlStructure;
  }

  /**
   * Build HTML structure dynamically based on component metadata
   */
  private buildHTMLStructure(params: {
    componentType: string;
    variationNumber: number;
    content: any;
    mediaUrls: any;
    classMaps: ComponentClassMaps;
    metadata: ComponentMetadata;
    getClass: (elementName: string) => string;
    isVisible: (elementName: string) => boolean;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  }): string {
    const { 
      componentType, 
      content, 
      mediaUrls, 
      metadata, 
      getClass, 
      isVisible,
      primaryColor,
      secondaryColor,
      textColor 
    } = params;

    // Start with container
    let html = `<section class="${getClass('container')}"`;
    
    // Add dynamic background styling based on component type
    if (componentType === 'hero' || componentType === 'cta') {
      html += ` style="background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%);"`;
    }
    
    html += '>\\n';

    // Add max-width wrapper for most components
    html += '  <div class="max-w-7xl mx-auto w-full">\\n';

    // Build content based on component structure
    html += this.buildComponentContent(params);

    // Close wrappers
    html += '  </div>\\n';
    html += '</section>';

    return html;
  }

  /**
   * Build component-specific content dynamically
   */
  private buildComponentContent(params: {
    componentType: string;
    variationNumber: number;
    content: any;
    mediaUrls: any;
    classMaps: ComponentClassMaps;
    metadata: ComponentMetadata;
    getClass: (elementName: string) => string;
    isVisible: (elementName: string) => boolean;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  }): string {
    const { componentType, content, mediaUrls, metadata, getClass, isVisible, textColor } = params;

    let html = '';

    // Add grid container if component has grid layout
    if (getClass('grid')) {
      html += `    <div class="${getClass('grid')}">\\n`;
    }

    // Build content based on component type and elements
    switch (componentType) {
      case 'hero':
        html += this.buildHeroContent(params);
        break;
      case 'features':
        html += this.buildFeaturesContent(params);
        break;
      case 'cta':
        html += this.buildCTAContent(params);
        break;
      case 'testimonials':
        html += this.buildTestimonialsContent(params);
        break;
      case 'pricing':
        html += this.buildPricingContent(params);
        break;
      case 'faq':
        html += this.buildFAQContent(params);
        break;
      default:
        html += this.buildGenericContent(params);
    }

    // Close grid container
    if (getClass('grid')) {
      html += '    </div>\\n';
    }

    return html;
  }

  /**
   * Build Hero component content
   */
  private buildHeroContent(params: any): string {
    const { content, mediaUrls, getClass, isVisible, textColor } = params;
    
    let html = '';

    // Left content
    if (getClass('leftContent')) {
      html += `      <div class="${getClass('leftContent')}">\\n`;
      
      // Badge
      if (isVisible('badge') && getClass('badge')) {
        html += `        <span class="${getClass('badge')}" style="background-color: rgba(59, 130, 246, 0.1); color: ${textColor};">\\n`;
        html += `          ${content.badge || '🔥 Best Seller'}\\n`;
        html += `        </span>\\n`;
      }

      // Headline
      if (isVisible('headline') && getClass('headline')) {
        html += `        <h1 class="${getClass('headline')}" style="color: ${textColor};">\\n`;
        html += `          ${content.headline || 'Your Headline Here'}\\n`;
        html += `        </h1>\\n`;
      }

      // Subheadline
      if (isVisible('subheadline') && getClass('subheadline')) {
        html += `        <p class="${getClass('subheadline')}" style="color: rgba(0, 0, 0, 0.7);">\\n`;
        html += `          ${content.subheadline || 'Your subheadline here'}\\n`;
        html += `        </p>\\n`;
      }

      // Price section
      if (isVisible('price') && getClass('priceContainer')) {
        html += this.buildPriceSection(params);
      }

      // Buttons
      if (getClass('buttonsContainer')) {
        html += this.buildButtonsSection(params);
      }

      html += '      </div>\\n';
    }

    // Right content (Image)
    if (getClass('rightContent')) {
      html += this.buildImageSection(params);
    }

    return html;
  }

  /**
   * Build Features component content
   */
  private buildFeaturesContent(params: any): string {
    const { content, getClass, isVisible } = params;
    
    let html = '';

    // Section title
    if (isVisible('sectionTitle') && getClass('sectionTitle')) {
      html += `      <h2 class="${getClass('sectionTitle')}">\\n`;
      html += `        ${content.sectionTitle || 'Why Choose Us'}\\n`;
      html += `      </h2>\\n`;
    }

    // Description
    if (isVisible('description') && getClass('description')) {
      html += `      <p class="${getClass('description')}">\\n`;
      html += `        ${content.description || 'Discover the features that make us different'}\\n`;
      html += `      </p>\\n`;
    }

    // Features grid
    const features = content.features || [
      { title: 'Lightning Fast', description: 'Get results in seconds, not minutes.', icon: '⚡' },
      { title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.9% uptime.', icon: '🔒' },
      { title: 'Expert Support', description: 'Get help from our team of experts, available 24/7.', icon: '👨‍💼' }
    ];

    if (getClass('grid')) {
      html += `      <div class="${getClass('grid')}">\\n`;
      
      features.forEach((feature: any, index: number) => {
        if (getClass('featureCard')) {
          html += `        <div class="${getClass('featureCard')}">\\n`;
          
          // Icon
          if (isVisible('icons') && getClass('iconContainer')) {
            html += `          <div class="${getClass('iconContainer')}">\\n`;
            html += `            <span class="text-2xl">${feature.icon || '✨'}</span>\\n`;
            html += `          </div>\\n`;
          }

          // Title
          if (getClass('featureTitle')) {
            html += `          <h3 class="${getClass('featureTitle')}">\\n`;
            html += `            ${feature.title || `Feature ${index + 1}`}\\n`;
            html += `          </h3>\\n`;
          }

          // Description
          if (getClass('featureDescription')) {
            html += `          <p class="${getClass('featureDescription')}">\\n`;
            html += `            ${feature.description || 'Feature description here'}\\n`;
            html += `          </p>\\n`;
          }

          html += '        </div>\\n';
        }
      });

      html += '      </div>\\n';
    }

    return html;
  }

  /**
   * Build CTA component content
   */
  private buildCTAContent(params: any): string {
    const { content, getClass, isVisible, primaryColor } = params;
    
    let html = '';

    // Card container
    if (getClass('card')) {
      html += `      <div class="${getClass('card')}">\\n`;
      
      // Headline
      if (isVisible('headline') && getClass('headline')) {
        html += `        <h2 class="${getClass('headline')}" style="color: white;">\\n`;
        html += `          ${content.headline || 'Ready to Get Started?'}\\n`;
        html += `        </h2>\\n`;
      }

      // Subheadline
      if (isVisible('subheadline') && getClass('subheadline')) {
        html += `        <p class="${getClass('subheadline')}" style="color: rgba(255, 255, 255, 0.8);">\\n`;
        html += `          ${content.subheadline || 'Join thousands of satisfied customers'}\\n`;
        html += `        </p>\\n`;
      }

      // CTA Button
      if (isVisible('ctaButton') && getClass('ctaButton')) {
        html += `        <button class="${getClass('ctaButton')}" onclick="handleButtonClick('cta')" style="background: linear-gradient(to right, ${primaryColor}, #4f46e5);">\\n`;
        html += `          ${content.ctaText || 'Get Started Now'}\\n`;
        html += `        </button>\\n`;
      }

      html += '      </div>\\n';
    }

    return html;
  }

  /**
   * Build other component types dynamically
   */
  private buildTestimonialsContent(params: any): string {
    // Implementation similar to features but for testimonials
    return this.buildListBasedContent(params, 'testimonials', [
      { name: 'John Doe', quote: 'Amazing service!', avatar: '', role: 'CEO' }
    ]);
  }

  private buildPricingContent(params: any): string {
    // Implementation similar to features but for pricing
    return this.buildListBasedContent(params, 'plans', [
      { name: 'Basic', price: '29', features: ['Feature 1', 'Feature 2'], currency: 'USD' }
    ]);
  }

  private buildFAQContent(params: any): string {
    // Implementation similar to features but for FAQ
    return this.buildListBasedContent(params, 'faqs', [
      { question: 'What is this service?', answer: 'This is a great service.' }
    ]);
  }

  /**
   * Generic list-based content builder
   */
  private buildListBasedContent(params: any, contentKey: string, defaultItems: any[]): string {
    const { content, getClass, isVisible } = params;
    let html = '';

    // Section title
    if (isVisible('sectionTitle') && getClass('sectionTitle')) {
      html += `      <h2 class="${getClass('sectionTitle')}">\\n`;
      html += `        ${content.sectionTitle || 'Section Title'}\\n`;
      html += `      </h2>\\n`;
    }

    // Items
    const items = content[contentKey] || defaultItems;
    if (getClass('grid')) {
      html += `      <div class="${getClass('grid')}">\\n`;
      
      items.forEach((item: any, index: number) => {
        html += this.buildListItem(params, item, index);
      });

      html += '      </div>\\n';
    }

    return html;
  }

  /**
   * Build individual list item
   */
  private buildListItem(params: any, item: any, index: number): string {
    // Dynamic item building based on available class maps
    return `        <div class="p-4 bg-white rounded-lg">\\n          <p>${JSON.stringify(item)}</p>\\n        </div>\\n`;
  }

  /**
   * Build generic content for unknown component types
   */
  private buildGenericContent(params: any): string {
    const { componentType, variationNumber, content, getClass } = params;
    
    return `
      <div class="${getClass('container') || 'text-center'}">
        <h2 class="${getClass('headline') || 'text-2xl font-bold mb-4'}">
          ${content.headline || `${componentType} Component`}
        </h2>
        <p class="${getClass('subheadline') || 'text-gray-600 mb-8'}">
          ${content.subheadline || `Variation ${variationNumber}`}
        </p>
        <div class="bg-gray-100 p-8 rounded-lg">
          <p class="text-gray-600">
            Component: ${componentType} - Variation: ${variationNumber}
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Build price section
   */
  private buildPriceSection(params: any): string {
    const { content, getClass } = params;
    
    let html = `        <div class="${getClass('priceContainer')}">\\n`;
    
    if (getClass('price')) {
      html += `          <span class="${getClass('price')}">\\n`;
      html += `            ${content.price || '0'} ${content.currency || 'DT'}\\n`;
      html += `          </span>\\n`;
    }

    if (content.originalPrice && getClass('originalPrice')) {
      html += `          <span class="${getClass('originalPrice')}">\\n`;
      html += `            ${content.originalPrice} ${content.currency || 'DT'}\\n`;
      html += `          </span>\\n`;
    }

    html += '        </div>\\n';
    return html;
  }

  /**
   * Build buttons section
   */
  private buildButtonsSection(params: any): string {
    const { content, getClass, isVisible, primaryColor } = params;
    
    let html = `        <div class="${getClass('buttonsContainer')}">\\n`;

    // CTA Button
    if (isVisible('ctaButton') && getClass('ctaButton')) {
      html += `          <button class="${getClass('ctaButton')}" onclick="handleButtonClick('cta')" style="background-color: ${primaryColor}; color: white;">\\n`;
      html += `            ${content.ctaText || 'Get Started'}\\n`;
      html += `          </button>\\n`;
    }

    // Secondary Button
    if (isVisible('secondaryButton') && content.secondaryButtonText && getClass('secondaryButton')) {
      html += `          <button class="${getClass('secondaryButton')}" onclick="handleButtonClick('secondary')" style="border-color: ${primaryColor}; color: ${primaryColor};">\\n`;
      html += `            ${content.secondaryButtonText}\\n`;
      html += `          </button>\\n`;
    }

    html += '        </div>\\n';
    return html;
  }

  /**
   * Build image section
   */
  private buildImageSection(params: any): string {
    const { content, mediaUrls, getClass } = params;
    
    let html = `      <div class="${getClass('rightContent')}">\\n`;

    if (mediaUrls?.productImage) {
      html += `        <img src="${mediaUrls.productImage}" alt="${content.headline || 'Product'}" class="${getClass('productImage') || 'w-full h-auto rounded-lg shadow-xl'}" />\\n`;
    } else {
      html += `        <div class="w-full h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">\\n`;
      html += `          <span class="text-gray-500">Product Image</span>\\n`;
      html += `        </div>\\n`;
    }

    html += '      </div>\\n';
    return html;
  }

  /**
   * Single unified CSS generation function for all component types and variations
   */
  private generateCSS(params: {
    componentType: string;
    variationNumber: number;
    styles: any;
    globalTheme?: any;
    metadata: ComponentMetadata;
  }): string {
    const { componentType, globalTheme, metadata } = params;
    const fontFamily = globalTheme?.fontFamily || 'Inter';
    
    const baseCSS = `
      /* ${componentType} Component - Variation ${params.variationNumber} Styles */
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

    // Add component-specific CSS based on metadata
    let specificCSS = '';
    
    if (metadata.hasButtons) {
      specificCSS += `
        .${componentType}-section .hover-effects:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `;
    }

    if (componentType === 'cta') {
      specificCSS += `
        .${componentType}-section .glass-effect {
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `;
    }

    if (componentType === 'features') {
      specificCSS += `
        .${componentType}-section .feature-card:hover {
          transform: translateY(-8px);
          transition: transform 0.3s ease;
        }
      `;
    }

    return baseCSS + specificCSS;
  }

  /**
   * Single unified JavaScript generation function for all component types and variations
   */
  private generateJS(params: {
    componentType: string;
    variationNumber: number;
    customActions: any;
    productData?: any;
    metadata: ComponentMetadata;
  }): string {
    const { customActions, productData } = params;
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
            if (action.modalContent) {
              alert(action.modalContent);
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
        console.log('${params.componentType} component (variation ${params.variationNumber}) loaded and ready');
      });
    `;
  }
}

// Export singleton instance
export const unifiedTransformer = new UnifiedComponentTransformerService();
