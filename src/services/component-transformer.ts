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

// Use the shared ClassMaps type from component registry
type ClassMaps = ComponentClassMaps;

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
    return await this.transformUnifiedComponent(component, variationType, variationNumber, options);
  }

  /**
   * Unified component transformation that works for all component types
   */
  private async transformUnifiedComponent(
    component: LandingPageComponent,
    componentType: string,
    variationNumber: number,
    options: TransformOptions
  ): Promise<ComponentTransformResult> {
    const { content, styles, visibility, media_urls, custom_actions } = component;
    const { viewport, globalTheme, productData } = options;

    // Get class maps and structure based on component type
    const { classMaps, structure, metadata } = await this.getComponentStructure(componentType, variationNumber);
    
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
      productData,
      metadata
    });

    // Generate component-specific CSS
    const css = this.generateUnifiedCSS(componentType, styles, globalTheme);

    // Generate JavaScript for button actions
    const js = this.generateUnifiedJS(custom_actions, productData);

    return { html, css, js };
  }

  /**
   * Get component structure and class maps based on component type and variation
   * Now uses the Component Registry and shared class maps
   */
  private async getComponentStructure(componentType: string, variationNumber: number) {
    try {
      // Get component exports from the registry
      const componentExports = await componentRegistry.getComponentExports(componentType, variationNumber);
      
      if (componentExports?.classMaps && componentExports?.metadata) {
        // Use the actual class maps and metadata from the shared modules
        return { 
          classMaps: componentExports.classMaps, 
          structure: componentExports.metadata.elements,
          metadata: componentExports.metadata
        };
      }
      
      // Fallback to generic class maps if specific ones aren't available
      console.warn(`Using fallback class maps for ${componentType}-${variationNumber}`);
      const classMaps = this.getFallbackClassMaps(componentType, variationNumber);
      const structure = this.getComponentElements(componentType);
      
      return { classMaps, structure, metadata: null };
    } catch (error) {
      console.error(`Error getting component structure for ${componentType}-${variationNumber}:`, error);
      
      // Fallback to generic class maps
      const classMaps = this.getFallbackClassMaps(componentType, variationNumber);
      const structure = this.getComponentElements(componentType);
      
      return { classMaps, structure, metadata: null };
    }
  }

  /**
   * Get minimal fallback class maps when shared class maps are not available
   * This is only used as a last resort
   */
  private getFallbackClassMaps(componentType: string, variationNumber: number): ClassMaps {
    // Minimal fallback classes - all real styling comes from shared class maps
    return {
      container: {
        mobile: "relative py-8 px-4",
        tablet: "relative py-12 px-6", 
        desktop: "relative py-16 px-8",
        responsive: "relative py-8 px-4 md:py-12 md:px-6 lg:py-16 lg:px-8"
      },
      headline: {
        mobile: "text-2xl font-bold mb-4",
        tablet: "text-3xl font-bold mb-6", 
        desktop: "text-4xl font-bold mb-8",
        responsive: "text-2xl font-bold mb-4 md:text-3xl md:mb-6 lg:text-4xl lg:mb-8"
      },
      subheadline: {
        mobile: "text-gray-600 mb-4",
        tablet: "text-gray-600 mb-6",
        desktop: "text-gray-600 mb-8", 
        responsive: "text-gray-600 mb-4 md:mb-6 lg:mb-8"
      }
    };
  }

  /**
   * Get element structure from metadata or use component registry defaults
   */
  private getElementStructure(componentType: string, metadata?: ComponentMetadata | null): string[] {
    // Use metadata elements if available
    if (metadata?.elements?.length) {
      return metadata.elements;
    }
    
    // Fallback to component registry defaults
    return this.getComponentElements(componentType);
  }

  /**
   * Get default elements for component types (fallback only)
   */
  private getComponentElements(componentType: string): string[] {
    // These are minimal fallbacks - real structure comes from metadata
    const elementMap: Record<string, string[]> = {
      hero: ['container', 'headline', 'subheadline'],
      features: ['container', 'headline', 'grid'],
      cta: ['container', 'headline', 'ctaButton'],
      testimonials: ['container', 'headline', 'grid'],
      pricing: ['container', 'headline', 'grid'],
      faq: ['container', 'headline', 'grid']
    };

    return elementMap[componentType] || ['container', 'headline'];
  }

  /**
   * Single unified HTML generator for all component types and variations
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
    metadata?: ComponentMetadata | null;
  }): string {
    const { 
      componentType, 
      content, 
      visibility, 
      mediaUrls, 
      classMaps, 
      viewport, 
      globalTheme, 
      structure,
      metadata 
    } = params;
    
    // Helper function to get responsive class
    const getClass = (elementName: string) => {
      const classMap = classMaps[elementName];
      return classMap ? (classMap[viewport] || classMap.responsive || '') : '';
    };
    
    // Helper function to check visibility
    const isVisible = (elementName: string) => visibility?.[elementName] !== false;
    
    // Theme colors with fallbacks
    const theme = {
      primary: globalTheme?.primaryColor || '#2563eb',
      secondary: globalTheme?.secondaryColor || '#3730a3', 
      background: globalTheme?.backgroundColor || '#ffffff',
      text: globalTheme?.textColor || '#000000'
    };

    // Generate HTML based on metadata structure or fallback structure
    const elementStructure = this.getElementStructure(componentType, metadata);
    
    return this.renderElements(elementStructure, {
      content,
      visibility,
      mediaUrls,
      classMaps,
      viewport,
      theme,
      componentType,
      getClass,
      isVisible
    });
  }

  /**
   * Render elements based on structure array
   */
  private renderElements(structure: string[], context: any): string {
    const { content, mediaUrls, theme, componentType, getClass, isVisible } = context;
    
    const elementRenderers: Record<string, () => string> = {
      container: () => this.renderContainer(context),
      headline: () => isVisible('headline') ? `
        <h1 class="${getClass('headline')}" style="color: ${theme.text};">
          ${content.headline || this.getDefaultContent('headline', componentType)}
        </h1>
      ` : '',
      
      subheadline: () => isVisible('subheadline') ? `
        <p class="${getClass('subheadline')}" style="color: rgba(0, 0, 0, 0.7);">
          ${content.subheadline || this.getDefaultContent('subheadline', componentType)}
        </p>
      ` : '',
      
      sectionTitle: () => isVisible('sectionTitle') ? `
        <h2 class="${getClass('sectionTitle')}" style="color: ${theme.text};">
          ${content.sectionTitle || this.getDefaultContent('sectionTitle', componentType)}
        </h2>
      ` : '',
      
      description: () => isVisible('description') ? `
        <p class="${getClass('description')}" style="color: rgba(0, 0, 0, 0.7);">
          ${content.description || this.getDefaultContent('description', componentType)}
        </p>
      ` : '',
      
      badge: () => isVisible('badge') ? `
        <span class="${getClass('badge')}" 
              style="background-color: rgba(59, 130, 246, 0.1); color: ${theme.text};">
          ${content.badge || this.getDefaultContent('badge', componentType)}
        </span>
      ` : '',
      
      ctaButton: () => isVisible('ctaButton') ? `
        <button class="${getClass('ctaButton')}" 
                onclick="handleButtonClick('cta')"
                style="background-color: ${theme.primary}; color: white;">
          ${content.ctaText || this.getDefaultContent('ctaButton', componentType)}
        </button>
      ` : '',
      
      secondaryButton: () => isVisible('secondaryButton') && content.secondaryButtonText ? `
        <button class="${getClass('secondaryButton')}"
                onclick="handleButtonClick('secondary')"
                style="border-color: ${theme.primary}; color: ${theme.primary};">
          ${content.secondaryButtonText}
        </button>
      ` : '',
      
      grid: () => `<div class="${getClass('grid')}">
        ${this.renderDynamicContent(context)}
      </div>`,
      
      card: () => `<div class="${getClass('card')}">
        ${this.renderCardContent(context)}
      </div>`,
      
      // Image handling
      image: () => mediaUrls?.productImage ? `
        <img src="${mediaUrls.productImage}" 
             alt="${content.headline || 'Product'}"
             class="w-full h-auto rounded-lg shadow-xl" />
      ` : `
        <div class="w-full h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <span class="text-gray-500">Product Image</span>
        </div>
      `,
      
      // Layout elements
      leftContent: () => `<div class="${getClass('leftContent')}">
        ${this.renderContentElements(['badge', 'headline', 'subheadline', 'priceContainer', 'buttonsContainer'], context)}
      </div>`,
      
      rightContent: () => `<div class="${getClass('rightContent')}">
        ${this.renderElements(['image'], context)}
      </div>`,
      
      // Price elements
      priceContainer: () => isVisible('price') ? `
        <div class="${getClass('priceContainer')}">
          <span class="${getClass('price')}">
            ${content.price || '0'} ${content.currency || 'DT'}
          </span>
          ${content.originalPrice ? `
            <span class="${getClass('originalPrice')}">
              ${content.originalPrice} ${content.currency || 'DT'}
            </span>
          ` : ''}
        </div>
      ` : '',
      
      buttonsContainer: () => `<div class="${getClass('buttonsContainer')}">
        ${this.renderElements(['ctaButton', 'secondaryButton'], context)}
      </div>`
    };
    
    return structure
      .map(elementName => elementRenderers[elementName]?.() || '')
      .filter(html => html.trim())
      .join('\n');
  }

  /**
   * Render container with proper background styling
   */
  private renderContainer(context: any): string {
    const { componentType, theme, getClass } = context;
    
    const containerStyles = componentType === 'hero' || componentType === 'cta' 
      ? `style="background: linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%);"` 
      : '';
      
    return `<section class="${getClass('container')}" ${containerStyles}>
      <div class="max-w-7xl mx-auto w-full">
        ${this.renderInnerContent(context)}
      </div>
    </section>`;
  }

  /**
   * Render inner content based on component type
   */
  private renderInnerContent(context: any): string {
    const { componentType } = context;
    
    switch (componentType) {
      case 'hero':
        return this.renderElements(['grid'], context);
      case 'cta':
        return this.renderElements(['card'], context);
      default:
        return this.renderElements(['sectionTitle', 'description', 'grid'], context);
    }
  }

  /**
   * Render card content for CTA components
   */
  private renderCardContent(context: any): string {
    return this.renderElements(['headline', 'subheadline', 'ctaButton'], context);
  }

  /**
   * Render content elements in sequence
   */
  private renderContentElements(elements: string[], context: any): string {
    return this.renderElements(elements, context);
  }

  /**
   * Render dynamic content for grids (features, testimonials, etc.)
   */
  private renderDynamicContent(context: any): string {
    const { componentType, content, getClass, isVisible } = context;
    
    switch (componentType) {
      case 'hero':
        return this.renderElements(['leftContent', 'rightContent'], context);
        
      case 'features':
        const features = content.features || this.getDefaultFeatures();
        return features.map((feature: any, index: number) => `
          <div class="${getClass('featureCard')}">
            ${isVisible('icons') ? `
              <div class="${getClass('iconContainer')}">
                <span class="text-2xl">${feature.icon || '✨'}</span>
              </div>
            ` : ''}
            <h3 class="${getClass('featureTitle')}">
              ${feature.title || `Feature ${index + 1}`}
            </h3>
            <p class="${getClass('featureDescription')}">
              ${feature.description || 'Feature description here'}
            </p>
          </div>
        `).join('');
        
      case 'testimonials':
        const testimonials = content.testimonials || this.getDefaultTestimonials();
        return testimonials.map((testimonial: any, index: number) => `
          <div class="${getClass('testimonialCard')}">
            <p class="${getClass('quote')}">
              "${testimonial.quote || 'Great experience!'}"
            </p>
            <div class="flex items-center space-x-3">
              ${testimonial.avatar ? `
                <img src="${testimonial.avatar}" alt="${testimonial.name}" class="${getClass('avatar')}" />
              ` : `
                <div class="${getClass('avatar')} bg-gray-300 flex items-center justify-center">
                  <span class="text-gray-600 font-semibold">${(testimonial.name || 'User')[0]}</span>
                </div>
              `}
              <div>
                <div class="${getClass('authorName')}">
                  ${testimonial.name || `Customer ${index + 1}`}
                </div>
                ${testimonial.role ? `
                  <div class="text-gray-500 text-sm">${testimonial.role}</div>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('');
        
      case 'pricing':
        const plans = content.plans || this.getDefaultPlans();
        return plans.map((plan: any, index: number) => `
          <div class="${getClass('pricingCard')}">
            <h3 class="${getClass('planName')}">
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
        `).join('');
        
      case 'faq':
        const faqs = content.faqs || this.getDefaultFAQs();
        return faqs.map((faq: any, index: number) => `
          <div class="${getClass('faqItem')}">
            <h3 class="${getClass('question')}">
              ${faq.question || `Question ${index + 1}?`}
            </h3>
            <p class="${getClass('answer')}">
              ${faq.answer || 'Answer to the question.'}
            </p>
          </div>
        `).join('');
        
      default:
        return `<div class="text-center p-8">
          <p class="text-gray-600">Component: ${componentType}</p>
        </div>`;
    }
  }

  /**
   * Get default content for elements
   */
  private getDefaultContent(elementType: string, componentType: string): string {
    const defaults: Record<string, Record<string, string>> = {
      hero: {
        headline: 'Your Amazing Headline Here',
        subheadline: 'Your compelling subheadline that converts visitors',
        badge: '🔥 Best Seller',
        ctaButton: 'Get Started Now'
      },
      features: {
        sectionTitle: 'Why Choose Us',
        description: 'Discover the features that make us different',
        ctaButton: 'Learn More'
      },
      cta: {
        headline: 'Ready to Get Started?',
        subheadline: 'Join thousands of satisfied customers',
        ctaButton: 'Get Started Now'
      },
      testimonials: {
        sectionTitle: 'What Our Customers Say',
        description: 'See what our happy customers have to say'
      },
      pricing: {
        sectionTitle: 'Choose Your Plan',
        description: 'Select the perfect plan for your needs'
      },
      faq: {
        sectionTitle: 'Frequently Asked Questions',
        description: 'Find answers to common questions'
      }
    };
    
    return defaults[componentType]?.[elementType] || `${elementType} content`;
  }

  /**
   * Get default data arrays
   */
  private getDefaultFeatures() {
    return [
      { title: 'Lightning Fast', description: 'Get results in seconds, not minutes.', icon: '⚡' },
      { title: 'Secure & Reliable', description: 'Enterprise-grade security with 99.9% uptime.', icon: '🔒' },
      { title: 'Expert Support', description: 'Get help from our team of experts, available 24/7.', icon: '👨‍💼' }
    ];
  }

  private getDefaultTestimonials() {
    return [
      { name: 'John Doe', quote: 'Amazing service!', avatar: '', role: 'CEO' },
      { name: 'Jane Smith', quote: 'Highly recommended!', avatar: '', role: 'Designer' },
      { name: 'Mike Johnson', quote: 'Outstanding quality!', avatar: '', role: 'Developer' }
    ];
  }

  private getDefaultPlans() {
    return [
      { name: 'Basic', price: '29', features: ['Feature 1', 'Feature 2'], currency: 'USD' },
      { name: 'Pro', price: '59', features: ['Everything in Basic', 'Feature 3', 'Feature 4'], currency: 'USD' },
      { name: 'Enterprise', price: '99', features: ['Everything in Pro', 'Feature 5', 'Feature 6'], currency: 'USD' }
    ];
  }

  private getDefaultFAQs() {
    return [
      { question: 'What is this service?', answer: 'This is a great service that helps you achieve your goals.' },
      { question: 'How does it work?', answer: 'It works by providing you with the tools and support you need.' },
      { question: 'Is there support available?', answer: 'Yes, we offer 24/7 customer support.' }
    ];
  }

  /**
   * Single unified CSS generator for all component types and variations
   */
  private generateUnifiedCSS(componentType: string, styles: any, globalTheme?: any): string {
    const fontFamily = globalTheme?.fontFamily || 'Inter, sans-serif';
    const primaryColor = globalTheme?.primaryColor || '#2563eb';
    const secondaryColor = globalTheme?.secondaryColor || '#3730a3';
    
    return `
      /* Universal Component Styles */
      * {
        font-family: ${fontFamily};
      }
      
      /* Global transitions and interactions */
      button {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      
      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      button:active {
        transform: translateY(0);
      }
      
      img {
        transition: transform 0.3s ease;
      }
      
      img:hover {
        transform: scale(1.02);
      }
      
      /* Component-specific animations */
      .group:hover .group-hover\\:from-blue-200 {
        background: linear-gradient(to bottom right, rgb(191 219 254), rgb(147 197 253));
      }
      
      /* Card hover effects */
      [class*="Card"]:hover,
      [class*="card"]:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      
      /* Glass effect for CTA components */
      [class*="backdrop-blur"] {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      
      /* Gradient backgrounds */
      .gradient-bg {
        background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%);
      }
      
      /* Custom scrollbar for better UX */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: ${primaryColor};
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: ${secondaryColor};
      }
      
      /* Responsive utilities */
      @media (max-width: 768px) {
        h1, h2, h3 {
          line-height: 1.2;
        }
        
        [class*="gap-"] {
          gap: 1rem;
        }
      }
      
      /* Print styles */
      @media print {
        button {
          display: none;
        }
        
        * {
          color: black !important;
          background: white !important;
        }
      }
    `;
  }

  /**
   * Single unified JavaScript generator for all component types and variations  
   */
  private generateUnifiedJS(customActions: any, productData?: any): string {
    const actions = customActions || {};
    
    return `
      // Universal Component JavaScript
      (function() {
        'use strict';
        
        // Global button click handler
        window.handleButtonClick = function(buttonType, event) {
          if (event) {
            event.preventDefault();
          }
          
          const action = ${JSON.stringify(actions)}[buttonType];
          
          if (!action) {
            console.log('No action defined for button:', buttonType);
            return;
          }
          
          // Execute action based on type
          switch(action.type) {
            case 'checkout':
            case 'marketplace_checkout':
              handleCheckoutAction(action);
              break;
              
            case 'open_link':
            case 'external_link':
              handleLinkAction(action);
              break;
              
            case 'scroll':
            case 'scroll_to':
              handleScrollAction(action);
              break;
              
            case 'modal':
              handleModalAction(action);
              break;
              
            case 'download':
              handleDownloadAction(action);
              break;
              
            default:
              console.log('Unknown action type:', action.type);
          }
          
          // Track analytics
          trackEvent(buttonType, action);
        };
        
        // Action handlers
        function handleCheckoutAction(action) {
          if (action.productId && action.amount) {
            const checkoutUrl = action.checkoutUrl || 
              \`https://checkout.example.com?product=\${action.productId}&amount=\${action.amount}\`;
            window.location.href = checkoutUrl;
          }
        }
        
        function handleLinkAction(action) {
          if (action.url) {
            let url = action.url;
            if (!/^https?:\\/\\//i.test(url)) {
              url = 'https://' + url;
            }
            
            if (action.openInNewTab || action.newTab) {
              window.open(url, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = url;
            }
          }
        }
        
        function handleScrollAction(action) {
          if (action.targetId) {
            const element = document.getElementById(action.targetId);
            if (element) {
              element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' 
              });
            }
          }
        }
        
        function handleModalAction(action) {
          if (action.modalContent) {
            // Simple modal implementation - can be enhanced
            const modal = document.createElement('div');
            modal.style.cssText = \`
              position: fixed; top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.5); display: flex; align-items: center;
              justify-content: center; z-index: 10000;
            \`;
            
            const content = document.createElement('div');
            content.style.cssText = \`
              background: white; padding: 2rem; border-radius: 8px;
              max-width: 500px; margin: 1rem;
            \`;
            content.innerHTML = \`
              <p>\${action.modalContent}</p>
              <button onclick="this.closest('[style*=fixed]').remove()" 
                      style="margin-top: 1rem; padding: 0.5rem 1rem; 
                             background: #2563eb; color: white; border: none; 
                             border-radius: 4px; cursor: pointer;">
                Close
              </button>
            \`;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Close on backdrop click
            modal.addEventListener('click', function(e) {
              if (e.target === modal) {
                modal.remove();
              }
            });
          }
        }
        
        function handleDownloadAction(action) {
          if (action.downloadUrl) {
            const link = document.createElement('a');
            link.href = action.downloadUrl;
            link.download = action.filename || 'download';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
        
        // Analytics tracking
        function trackEvent(buttonType, action) {
          // Google Analytics 4
          if (typeof gtag !== 'undefined' && action.trackingEvent) {
            gtag('event', action.trackingEvent, {
              'event_category': 'Button Click',
              'event_label': buttonType,
              'custom_parameter': action.customParameter
            });
          }
          
          // Facebook Pixel
          if (typeof fbq !== 'undefined' && action.facebookEvent) {
            fbq('track', action.facebookEvent, {
              content_name: buttonType,
              value: action.value || 0,
              currency: action.currency || 'USD'
            });
          }
          
          // Custom tracking
          if (action.customTracking && typeof window[action.customTracking] === 'function') {
            window[action.customTracking](buttonType, action);
          }
        }
        
        // Enhanced scroll behavior
        function initSmoothScrolling() {
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            });
          });
        }
        
        // Enhanced form handling
        function initFormHandling() {
          document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
              const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
              if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Loading...';
                
                // Re-enable after 3 seconds to prevent permanent disabling
                setTimeout(() => {
                  submitButton.disabled = false;
                  submitButton.textContent = submitButton.getAttribute('data-original-text') || 'Submit';
                }, 3000);
              }
            });
          });
        }
        
        // Lazy loading for images
        function initLazyLoading() {
          if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const img = entry.target;
                  img.src = img.dataset.src;
                  img.classList.remove('lazy');
                  imageObserver.unobserve(img);
                }
              });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
              imageObserver.observe(img);
            });
          }
        }
        
        // Performance monitoring
        function initPerformanceMonitoring() {
          if ('PerformanceObserver' in window) {
            try {
              const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log('LCP:', entry.startTime);
                  }
                });
              });
              observer.observe({entryTypes: ['largest-contentful-paint']});
            } catch (e) {
              console.log('Performance monitoring not supported');
            }
          }
        }
        
        // Initialize all features when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
          initSmoothScrolling();
          initFormHandling();
          initLazyLoading();
          initPerformanceMonitoring();
          
          console.log('Component initialized and ready');
        });
        
        // Expose utility functions globally
        window.componentUtils = {
          trackEvent,
          handleButtonClick: window.handleButtonClick
        };
        
      })();
    `;
  }
}
