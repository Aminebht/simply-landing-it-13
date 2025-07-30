import { LandingPage } from '@/types/landing-page';
import { LandingPageComponent } from '@/types/components';
import { supabase } from '@/services/supabase';
import JSZip from 'jszip';

interface GlobalTheme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  custom_css?: string;
}

interface ComponentProcessed {
  id: string;
  type: string;
  variation: number;
  content: any;
  styles: any;
  visibility: Record<string, boolean>;
  customActions: Record<string, any>;
  mediaUrls: Record<string, string>;
  orderIndex: number;
}

export class StaticGeneratorService {
  private downloadedImages: Map<string, string> = new Map();

  async exportLandingPageFromDatabase(pageId: string): Promise<Blob> {
    try {

      // Fetch landing page data with global theme and SEO config
      const { data: pageData, error: pageError } = await supabase
        .from('landing_pages')
        .select(`*, products(id, price)`)
        .eq('id', pageId)
        .single();

      if (pageError || !pageData) {
        throw new Error(`Failed to fetch landing page: ${pageError?.message}`);
      }

      // Fetch components data with variations
      const { data: componentsData, error: componentsError } = await supabase
        .from('landing_page_components')
        .select(`
          *,
          component_variation:component_variations(*)
        `)
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });

      if (componentsError) {
        throw new Error(`Failed to fetch components: ${componentsError.message}`);
      }

      // Process and clean components for production
      const processedComponents = await this.processComponents(componentsData || []);
      
      // Generate static files
      const files = await this.generateStaticSite(
        pageData,
        pageData.global_theme,
        processedComponents
      );

      return this.createZipPackage(pageData, files);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  private async processComponents(rawComponents: any[]): Promise<ComponentProcessed[]> {
    const processed: ComponentProcessed[] = [];

    for (const component of rawComponents) {
      if (!component.component_variation) {
        console.warn(`Component ${component.id} missing variation data`);
        continue;
      }

      // Download and process media URLs
      const processedMediaUrls = await this.processMediaUrls(component.media_urls || {});

      processed.push({
        id: component.id,
        type: component.component_variation.component_type,
        variation: component.component_variation.variation_number,
        content: component.content || {},
        styles: this.mergeStyles(component.styles, component.custom_styles),
        visibility: component.visibility || {},
        customActions: component.custom_actions || {},
        mediaUrls: processedMediaUrls,
        orderIndex: component.order_index
      });
    }

    return processed.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  private mergeStyles(baseStyles: any, customStyles: any): any {
    return {
      ...baseStyles,
      ...customStyles
    };
  }

  private async processMediaUrls(mediaUrls: Record<string, string>): Promise<Record<string, string>> {
    const processed: Record<string, string> = {};

    for (const [key, url] of Object.entries(mediaUrls)) {
      if (url && url.startsWith('http')) {
        try {
          // Download and convert to base64 for inline embedding
          const base64Data = await this.downloadImageAsBase64(url);
          processed[key] = base64Data;
        } catch (error) {
          console.warn(`Failed to download image ${url}:`, error);
          processed[key] = url; // Fallback to original URL
        }
      } else {
        processed[key] = url;
      }
    }

    return processed;
  }

  private async downloadImageAsBase64(url: string): Promise<string> {
    if (this.downloadedImages.has(url)) {
      return this.downloadedImages.get(url)!;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      this.downloadedImages.set(url, base64);
      return base64;
    } catch (error) {
      throw new Error(`Failed to download image: ${error}`);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async generateStaticSite(
    landingPage: any,
    globalTheme: GlobalTheme,
    components: ComponentProcessed[]
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    
    // Generate main HTML file
    files['index.html'] = this.generateHTML(landingPage, globalTheme, components);
    
    // Generate CSS file
    files['styles.css'] = this.generateCSS(globalTheme, components);
    
    // Generate JavaScript file for interactions
    files['script.js'] = this.generateJavaScript(components);
    
    return files;
  }

  private generateHTML(
    landingPage: any,
    globalTheme: GlobalTheme,
    components: ComponentProcessed[]
  ): string {
    const seoConfig = landingPage.seo_config || {};
    
    const componentsHTML = components.map(component => 
      this.renderProductionComponent(component, globalTheme)
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="${seoConfig.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoConfig.title || landingPage.name || 'Landing Page'}</title>
  ${seoConfig.meta_description ? `<meta name="description" content="${seoConfig.meta_description}">` : ''}
  ${seoConfig.meta_keywords ? `<meta name="keywords" content="${seoConfig.meta_keywords}">` : ''}
  ${seoConfig.og_title ? `<meta property="og:title" content="${seoConfig.og_title}">` : ''}
  ${seoConfig.og_description ? `<meta property="og:description" content="${seoConfig.og_description}">` : ''}
  ${seoConfig.og_image ? `<meta property="og:image" content="${seoConfig.og_image}">` : ''}
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${globalTheme.primary_color}',
            secondary: '${globalTheme.secondary_color}',
          },
          fontFamily: {
            custom: ['${globalTheme.font_family}', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  
  <!-- Custom Styles -->
  <link rel="stylesheet" href="styles.css">
  
  <!-- Custom Theme CSS -->
  ${globalTheme.custom_css ? `<style>${globalTheme.custom_css}</style>` : ''}
</head>
<body style="font-family: ${globalTheme.font_family}, system-ui, sans-serif; background-color: ${globalTheme.background_color}; color: ${globalTheme.text_color};">
  ${componentsHTML}
  
  <!-- JavaScript -->
  <script src="script.js"></script>
</body>
</html>`;
  }

  private renderProductionComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    switch (component.type) {
      case 'hero':
        return this.renderHeroComponent(component, globalTheme);
      case 'features':
        return this.renderFeaturesComponent(component, globalTheme);
      case 'testimonials':
        return this.renderTestimonialsComponent(component, globalTheme);
      case 'pricing':
        return this.renderPricingComponent(component, globalTheme);
      case 'faq':
        return this.renderFaqComponent(component, globalTheme);
      case 'cta':
        return this.renderCtaComponent(component, globalTheme);
      default:
        return `<!-- Unsupported component type: ${component.type} -->`;
    }
  }

  private renderHeroComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const { content, styles, visibility, mediaUrls, customActions } = component;
    
    // Apply responsive classes based on variation
    const containerClasses = this.getResponsiveClasses('hero-container', component.variation);
    const contentClasses = this.getResponsiveClasses('hero-content', component.variation);
    
    // Generate inline styles
    const containerStyle = this.generateInlineStyles(styles?.container, globalTheme);
    const headlineStyle = this.generateInlineStyles(styles?.headline, globalTheme);
    const subheadlineStyle = this.generateInlineStyles(styles?.subheadline, globalTheme);
    
    return `
<section class="${containerClasses}" style="${containerStyle}" data-component="hero-${component.variation}">
  <div class="relative w-full max-w-7xl mx-auto">
    <div class="${contentClasses}">
      <!-- Left Content -->
      <div class="text-left order-2 px-2 md:order-2 md:px-0 lg:order-1 lg:px-0">
        ${visibility?.badge !== false ? `
        <div class="inline-flex items-center rounded-full font-medium px-2 py-1 text-xs mb-4 md:px-3 md:py-1 md:text-sm md:mb-6 lg:px-3 lg:py-1 lg:text-sm lg:mb-6" 
             style="background-color: ${styles?.badge?.backgroundColor || globalTheme.primary_color}; color: ${styles?.badge?.textColor || '#ffffff'};">
          ${content.badge || '🔥 Best Seller'}
        </div>
        ` : ''}
        
        ${visibility?.headline !== false ? `
        <h1 class="font-bold leading-tight text-2xl mb-3 md:text-4xl md:mb-4 lg:text-6xl lg:mb-6" 
            style="${headlineStyle}">
          ${content.headline || 'Master Digital Marketing in 30 Days'}
        </h1>
        ` : ''}
        
        ${visibility?.subheadline !== false ? `
        <p class="text-gray-300 leading-relaxed text-sm mb-4 md:text-lg md:mb-6 lg:text-xl lg:mb-8" 
           style="${subheadlineStyle}">
          ${content.subheadline || 'Transform your business with our comprehensive digital marketing course. Learn proven strategies used by top professionals.'}
        </p>
        ` : ''}
        
        ${visibility?.price !== false ? `
        <div class="flex flex-wrap items-center gap-1.5 mb-4 md:gap-2 md:mb-6 lg:gap-4 lg:mb-8">
          <span class="font-bold text-green-400 text-lg md:text-2xl lg:text-3xl" 
                style="color: ${styles?.price?.color || globalTheme.primary_color};">
            ${content.price || '197'} DT
          </span>
          ${content.originalPrice ? `
          <span class="text-gray-400 line-through text-xs md:text-sm lg:text-lg">
            ${content.originalPrice} DT
          </span>
          ` : ''}
        </div>
        ` : ''}
        
        <div class="flex flex-col gap-2.5 md:flex-row md:gap-3 lg:flex-row lg:gap-4">
          ${visibility?.ctaButton !== false ? this.renderButton(
            content.ctaButton || 'Get Instant Access',
            customActions['cta-button'],
            'primary',
            globalTheme,
            styles?.['cta-button']
          ) : ''}
          
          ${visibility?.secondaryButton !== false ? this.renderButton(
            content.secondaryButton || 'Preview Course',
            customActions['secondary-button'],
            'secondary',
            globalTheme,
            styles?.['secondary-button']
          ) : ''}
        </div>
      </div>
      
      <!-- Right Visual -->
      <div class="relative order-1 px-2 md:order-1 md:px-0 lg:order-2 lg:px-0">
        ${visibility?.productImage !== false && mediaUrls.productImage ? `
        <div class="relative">
          <img src="${mediaUrls.productImage}" 
               alt="Product" 
               class="w-full overflow-hidden transition-transform duration-300 hover:rotate-0 h-48 rounded-lg shadow-lg transform rotate-0 md:h-80 md:rounded-xl md:shadow-xl md:transform md:rotate-1 lg:h-96 lg:rounded-2xl lg:shadow-2xl lg:transform lg:rotate-3"
               style="${this.generateInlineStyles(styles?.['product-image'], globalTheme)}" />
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</section>`;
  }

  private renderButton(
    text: string,
    action: any,
    type: 'primary' | 'secondary',
    globalTheme: GlobalTheme,
    customStyles?: any
  ): string {
    const href = action?.url || '#';
    const target = action?.url && action.url.startsWith('http') ? 'target="_blank"' : '';
    const onClick = action?.onClick ? `onclick="${action.onClick}"` : '';
    
    const baseClasses = type === 'primary' 
      ? 'bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base'
      : 'border-2 border-gray-400 text-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition-colors text-center w-full px-4 py-2.5 text-sm md:w-auto md:px-6 md:py-3 md:text-base lg:w-auto lg:px-8 lg:py-4 lg:text-base';
    
    const buttonStyles = type === 'primary'
      ? `background-color: ${customStyles?.backgroundColor || globalTheme.primary_color}; color: ${customStyles?.textColor || '#ffffff'};`
      : `border-color: ${customStyles?.borderColor || globalTheme.primary_color}; color: ${customStyles?.textColor || globalTheme.primary_color};`;
    
    return `
    <a href="${href}" ${target} ${onClick} 
       class="${baseClasses}" 
       style="${buttonStyles} ${this.generateInlineStyles(customStyles, globalTheme)}">
      ${text}
    </a>`;
  }

  private renderFeaturesComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const { content, styles, visibility, mediaUrls } = component;
    
    const featuresHTML = content.features?.map((feature: any, index: number) => `
      <div class="feature-item text-center p-6">
        ${mediaUrls[`feature_${index + 1}_image`] ? `
        <img src="${mediaUrls[`feature_${index + 1}_image`]}" 
             alt="${feature.title}" 
             class="mx-auto mb-4 w-16 h-16 rounded-full" />
        ` : ''}
        <h3 class="text-xl font-semibold mb-2" style="color: ${globalTheme.text_color};">
          ${feature.title}
        </h3>
        <p class="text-gray-600">
          ${feature.description}
        </p>
      </div>
    `).join('') || '';

    return `
<section class="py-16" style="${this.generateInlineStyles(styles?.container, globalTheme)}" data-component="features-${component.variation}">
  <div class="container mx-auto px-4">
    ${content.headline ? `
    <h2 class="text-3xl font-bold text-center mb-12" style="color: ${globalTheme.text_color};">
      ${content.headline}
    </h2>
    ` : ''}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${featuresHTML}
    </div>
  </div>
</section>`;
  }

  private renderTestimonialsComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const { content, styles, mediaUrls } = component;
    
    const testimonialsHTML = content.testimonials?.map((testimonial: any, index: number) => `
      <div class="testimonial-item bg-white p-6 rounded-lg shadow-lg">
        <p class="mb-4 text-gray-800">"${testimonial.text}"</p>
        <div class="flex items-center">
          ${mediaUrls[`testimonial_${index + 1}_image`] ? `
          <img src="${mediaUrls[`testimonial_${index + 1}_image`]}" 
               alt="${testimonial.name}" 
               class="w-12 h-12 rounded-full mr-4" />
          ` : ''}
          <div>
            <h4 class="font-semibold text-gray-900">${testimonial.name}</h4>
            <p class="text-gray-600">${testimonial.role}</p>
          </div>
        </div>
      </div>
    `).join('') || '';

    return `
<section class="py-16" style="${this.generateInlineStyles(styles?.container, globalTheme)}" data-component="testimonials-${component.variation}">
  <div class="container mx-auto px-4">
    ${content.headline ? `
    <h2 class="text-3xl font-bold text-center mb-12" style="color: ${globalTheme.text_color};">
      ${content.headline}
    </h2>
    ` : ''}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${testimonialsHTML}
    </div>
  </div>
</section>`;
  }

  private renderPricingComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const { content, styles, customActions } = component;
    
    const plansHTML = content.plans?.map((plan: any, index: number) => `
      <div class="pricing-plan bg-white p-8 rounded-lg shadow-lg text-center">
        <h3 class="text-2xl font-bold mb-4" style="color: ${globalTheme.text_color};">
          ${plan.name}
        </h3>
        <div class="text-4xl font-bold mb-6" style="color: ${globalTheme.primary_color};">
          $${plan.price}<span class="text-lg text-gray-600">/mo</span>
        </div>
        <ul class="mb-8 text-gray-700">
          ${plan.features?.map((feature: string) => `<li class="mb-2">${feature}</li>`).join('') || ''}
        </ul>
        ${plan.ctaText ? this.renderButton(
          plan.ctaText,
          customActions[`plan_${index + 1}`],
          'primary',
          globalTheme
        ) : ''}
      </div>
    `).join('') || '';

    return `
<section class="py-16" style="${this.generateInlineStyles(styles?.container, globalTheme)}" data-component="pricing-${component.variation}">
  <div class="container mx-auto px-4">
    ${content.headline ? `
    <h2 class="text-3xl font-bold text-center mb-12" style="color: ${globalTheme.text_color};">
      ${content.headline}
    </h2>
    ` : ''}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${plansHTML}
    </div>
  </div>
</section>`;
  }

  private renderFaqComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const { content, styles } = component;
    
    const faqsHTML = content.faqs?.map((faq: any, index: number) => `
      <div class="faq-item mb-6 p-4 border-b border-gray-200">
        <button class="faq-question w-full text-left" onclick="toggleFaq(${index})">
          <h3 class="text-lg font-semibold mb-2 flex items-center justify-between" style="color: ${globalTheme.text_color};">
            ${faq.question}
            <span class="faq-icon">+</span>
          </h3>
        </button>
        <div class="faq-answer hidden">
          <p class="text-gray-600 mt-2">${faq.answer}</p>
        </div>
      </div>
    `).join('') || '';

    return `
<section class="py-16" style="${this.generateInlineStyles(styles?.container, globalTheme)}" data-component="faq-${component.variation}">
  <div class="container mx-auto px-4 max-w-4xl">
    ${content.headline ? `
    <h2 class="text-3xl font-bold text-center mb-12" style="color: ${globalTheme.text_color};">
      ${content.headline}
    </h2>
    ` : ''}
    <div class="space-y-4">
      ${faqsHTML}
    </div>
  </div>
</section>`;
  }

  private renderCtaComponent(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const { content, styles, customActions } = component;
    
    return `
<section class="py-16 text-center" style="${this.generateInlineStyles(styles?.container, globalTheme)}" data-component="cta-${component.variation}">
  <div class="container mx-auto px-4">
    ${content.headline ? `
    <h2 class="text-3xl font-bold mb-6" style="color: ${globalTheme.text_color};">
      ${content.headline}
    </h2>
    ` : ''}
    ${content.subheadline ? `
    <p class="text-xl mb-8" style="color: ${globalTheme.text_color};">
      ${content.subheadline}
    </p>
    ` : ''}
    ${content.ctaText ? this.renderButton(
      content.ctaText,
      customActions.cta,
      'primary',
      globalTheme,
      styles?.['cta-button']
    ) : ''}
  </div>
</section>`;
  }

  private getResponsiveClasses(element: string, variation: number): string {
    // Define responsive class mappings based on your component variations
    const classMap: Record<string, Record<number, string>> = {
      'hero-container': {
        1: 'relative overflow-hidden min-h-screen flex items-center py-8 px-3 md:py-16 md:px-6 lg:py-24 lg:px-8',
        2: 'relative min-h-screen flex items-center justify-center py-12 px-4',
        3: 'hero-gradient min-h-screen flex items-center py-16 px-6'
      },
      'hero-content': {
        1: 'grid items-center grid-cols-1 gap-6 md:grid-cols-1 md:gap-10 lg:grid-cols-2 lg:gap-12',
        2: 'text-center max-w-4xl mx-auto',
        3: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
      }
    };

    return classMap[element]?.[variation] || '';
  }

  private generateInlineStyles(styles: any, globalTheme: GlobalTheme): string {
    if (!styles) return '';
    
    const styleProps: string[] = [];
    
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        styleProps.push(`${cssKey}: ${value}`);
      }
    });
    
    return styleProps.join('; ');
  }

  private generateCSS(globalTheme: GlobalTheme, components: ComponentProcessed[]): string {
    let css = `
/* Global Theme Styles */
:root {
  --primary-color: ${globalTheme.primary_color};
  --secondary-color: ${globalTheme.secondary_color};
  --background-color: ${globalTheme.background_color};
  --text-color: ${globalTheme.text_color};
  --font-family: ${globalTheme.font_family};
}

/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family), system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  background-color: var(--background-color);
  color: var(--text-color);
}

/* Hero gradient for variation 3 */
.hero-gradient {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

/* FAQ Styles */
.faq-question:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.faq-icon {
  transition: transform 0.3s ease;
}

.faq-item.active .faq-icon {
  transform: rotate(45deg);
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive utilities */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
`;

    // Add component-specific styles
    components.forEach(component => {
      if (component.styles) {
        css += `\n/* Component ${component.id} styles */\n`;
        css += this.generateComponentSpecificCSS(component);
      }
    });

    return css;
  }

  private generateComponentSpecificCSS(component: ComponentProcessed): string {
    // Generate component-specific CSS rules
    return `[data-component="${component.type}-${component.variation}"] {\n  /* Custom styles for ${component.type} variation ${component.variation} */\n}\n`;
  }

  private generateJavaScript(components: ComponentProcessed[]): string {
    const hasInteractiveElements = components.some(c => 
      c.type === 'faq' || 
      c.customActions && Object.keys(c.customActions).length > 0
    );

    if (!hasInteractiveElements) {
      return '// No interactive elements found';
    }

    return `
// FAQ Toggle functionality
function toggleFaq(index) {
  const faqItem = document.querySelectorAll('.faq-item')[index];
  const answer = faqItem.querySelector('.faq-answer');
  const icon = faqItem.querySelector('.faq-icon');
  
  if (answer.classList.contains('hidden')) {
    answer.classList.remove('hidden');
    icon.textContent = '−';
    faqItem.classList.add('active');
  } else {
    answer.classList.add('hidden');
    icon.textContent = '+';
    faqItem.classList.remove('active');
  }
}

// Smooth scrolling for anchor links
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

// Add fade-in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

// Console log for debugging
console.log('Landing page loaded successfully');
`;
  }

  private async createZipPackage(landingPage: any, files: Record<string, string>): Promise<Blob> {
    const zip = new JSZip();
    
    // Add all generated files to zip
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    // Add README with setup instructions
    const readme = `# ${landingPage.seo_config?.title || landingPage.name || 'Landing Page'}

## Setup Instructions

1. Extract all files to your web server or local directory
2. Open \`index.html\` in a web browser
3. All assets are self-contained and optimized for production

## File Structure

- \`index.html\` - Main landing page
- \`styles.css\` - All styling including responsive design
- \`script.js\` - Interactive functionality
- \`README.md\` - This file

## Features

- Fully responsive design (mobile, tablet, desktop)
- SEO optimized with meta tags
- Interactive elements (FAQ toggles, smooth scrolling)
- Optimized images (base64 embedded)
- Cross-browser compatible

## Technical Details

- Built with Tailwind CSS for styling
- Vanilla JavaScript for interactions
- All images optimized and embedded
- Production-ready code

Generated on: ${new Date().toISOString()}
Page ID: ${landingPage.id}
Theme: ${landingPage.global_theme?.name || 'Default'}
`;

    zip.file('README.md', readme);
    
    // Add package.json for potential future enhancements
    const packageJson = {
      name: `landing-page-${landingPage.id}`,
      version: '1.0.0',
      description: landingPage.seo_config?.meta_description || 'Static landing page',
      scripts: {
        start: 'npx serve .',
        build: 'echo "Already built"'
      },
      keywords: landingPage.seo_config?.meta_keywords?.split(',') || [],
      author: 'Landing Page Builder',
      license: 'MIT'
    };
    
    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    
    return zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
  }

  // Utility method to clean up downloaded images cache
  clearImageCache(): void {
    this.downloadedImages.clear();
  }

  // Method to validate component data before processing
  private validateComponent(component: any): boolean {
    if (!component.component_variation) {
      console.warn(`Component ${component.id} missing variation data`);
      return false;
    }

    if (!component.component_variation.component_type) {
      console.warn(`Component ${component.id} missing component type`);
      return false;
    }

    return true;
  }

  // Method to handle custom CSS injection for specific components
  private injectCustomComponentCSS(component: ComponentProcessed): string {
    let css = '';

    // Component-specific CSS generation based on type and variation
    switch (component.type) {
      case 'hero':
        if (component.variation === 3) {
          css += `
[data-component="hero-3"] {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}
[data-component="hero-3"] .hero-content {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
}
`;
        }
        break;
      
      case 'pricing':
        css += `
[data-component="pricing-${component.variation}"] .pricing-plan:hover {
  transform: translateY(-10px);
  transition: transform 0.3s ease;
}
[data-component="pricing-${component.variation}"] .pricing-plan.featured {
  border: 2px solid var(--primary-color);
  position: relative;
}
[data-component="pricing-${component.variation}"] .pricing-plan.featured::before {
  content: "Most Popular";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}
`;
        break;

      case 'testimonials':
        if (component.variation === 2) {
          css += `
[data-component="testimonials-2"] .testimonial-item {
  position: relative;
  overflow: hidden;
}
[data-component="testimonials-2"] .testimonial-item::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 10px;
  font-size: 60px;
  color: var(--primary-color);
  opacity: 0.3;
  font-family: serif;
}
`;
        }
        break;
    }

    return css;
  }

  // Enhanced button rendering with more action types
  private renderEnhancedButton(
    text: string,
    action: any,
    type: 'primary' | 'secondary' | 'outline',
    globalTheme: GlobalTheme,
    customStyles?: any
  ): string {
    let href = '#';
    let target = '';
    let onClick = '';
    let additionalAttrs = '';

    if (action) {
      switch (action.type) {
        case 'url':
          href = action.url || '#';
          target = action.url && action.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : '';
          break;
        case 'scroll':
          href = `#${action.targetId}`;
          onClick = 'onclick="smoothScrollTo(this.getAttribute(\'href\'))"';
          break;
        case 'modal':
          href = '#';
          onClick = `onclick="openModal('${action.modalId}')"`;
          break;
        case 'download':
          href = action.downloadUrl || '#';
          additionalAttrs = 'download';
          break;
        case 'email':
          href = `mailto:${action.email}${action.subject ? `?subject=${encodeURIComponent(action.subject)}` : ''}`;
          break;
        case 'phone':
          href = `tel:${action.phone}`;
          break;
        case 'whatsapp':
          href = `https://wa.me/${action.phone}${action.message ? `?text=${encodeURIComponent(action.message)}` : ''}`;
          target = 'target="_blank" rel="noopener noreferrer"';
          break;
        default:
          href = action.url || '#';
      }
    }

    const buttonClasses = this.getButtonClasses(type);
    const buttonStyles = this.getButtonStyles(type, globalTheme, customStyles);

    return `
    <a href="${href}" ${target} ${onClick} ${additionalAttrs}
       class="${buttonClasses}" 
       style="${buttonStyles}">
      ${text}
    </a>`;
  }

  private getButtonClasses(type: 'primary' | 'secondary' | 'outline'): string {
    const baseClasses = 'inline-block font-semibold rounded-lg transition-all duration-300 text-center px-4 py-2.5 text-sm md:px-6 md:py-3 md:text-base lg:px-8 lg:py-4 lg:text-base';
    
    switch (type) {
      case 'primary':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 shadow-lg`;
      case 'secondary':
        return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300`;
      case 'outline':
        return `${baseClasses} border-2 border-current text-current hover:bg-current hover:text-white`;
      default:
        return baseClasses;
    }
  }

  private getButtonStyles(
    type: 'primary' | 'secondary' | 'outline',
    globalTheme: GlobalTheme,
    customStyles?: any
  ): string {
    let styles = '';

    if (customStyles) {
      styles = this.generateInlineStyles(customStyles, globalTheme);
    } else {
      switch (type) {
        case 'primary':
          styles = `background-color: ${globalTheme.primary_color}; color: #ffffff;`;
          break;
        case 'secondary':
          styles = `background-color: ${globalTheme.secondary_color}; color: ${globalTheme.text_color};`;
          break;
        case 'outline':
          styles = `border-color: ${globalTheme.primary_color}; color: ${globalTheme.primary_color};`;
          break;
      }
    }

    return styles;
  }

  // Method to handle media optimization
  private async optimizeMedia(mediaUrls: Record<string, string>): Promise<Record<string, string>> {
    const optimized: Record<string, string> = {};

    for (const [key, url] of Object.entries(mediaUrls)) {
      if (url && url.startsWith('http')) {
        try {
          // For production, you might want to resize/compress images
          const optimizedUrl = await this.processImageForProduction(url);
          optimized[key] = optimizedUrl;
        } catch (error) {
          console.warn(`Failed to optimize image ${url}:`, error);
          optimized[key] = url; // Fallback to original
        }
      } else {
        optimized[key] = url;
      }
    }

    return optimized;
  }

  private async processImageForProduction(url: string): Promise<string> {
    // This could be enhanced to include image resizing, format conversion, etc.
    return this.downloadImageAsBase64(url);
  }

  // Method to generate analytics tracking code
  private generateAnalyticsCode(landingPage: any): string {
    if (!landingPage.analytics_config) return '';

    let analyticsCode = '';

    // Google Analytics
    if (landingPage.analytics_config.google_analytics_id) {
      analyticsCode += `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${landingPage.analytics_config.google_analytics_id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${landingPage.analytics_config.google_analytics_id}');
</script>
`;
    }

    // Facebook Pixel
    if (landingPage.analytics_config.facebook_pixel_id) {
      analyticsCode += `
<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${landingPage.analytics_config.facebook_pixel_id}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${landingPage.analytics_config.facebook_pixel_id}&ev=PageView&noscript=1"
/></noscript>
`;
    }

    return analyticsCode;
  }
}