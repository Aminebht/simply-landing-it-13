import { LandingPage } from '@/types/landing-page';
import { LandingPageComponent } from '@/types/components';
import { supabase } from '@/services/supabase';
import JSZip from 'jszip';

export class StaticGeneratorService {
  async exportLandingPageFromDatabase(pageId: string): Promise<Blob> {
    // Fetch landing page data from database
    const { data: pageData, error: pageError } = await supabase
      .from('landing_pages')
      .select('*, products(id, price)')
      .eq('id', pageId)
      .single();

    if (pageError || !pageData) {
      throw new Error(`Failed to fetch landing page: ${pageError?.message}`);
    }

    // Fetch components data from database
    const { data: componentsData, error: componentsError } = await supabase
      .from('landing_page_components')
      .select('*, component_variation:component_variations(*)')
      .eq('page_id', pageId)
      .order('order_index', { ascending: true });

    if (componentsError) {
      throw new Error(`Failed to fetch components: ${componentsError.message}`);
    }

    const landingPage: LandingPage = pageData;
    const components: LandingPageComponent[] = componentsData || [];

    return this.exportAsZip(landingPage, components);
  }

  async generateStaticSite(
    landingPage: LandingPage,
    components: LandingPageComponent[]
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    
    // Generate HTML
    const html = this.generateHTML(landingPage, components);
    files['index.html'] = html;
    
    // Generate CSS
    const css = this.generateCSS(components);
    files['styles.css'] = css;
    
    return files;
  }

  private generateHTML(landingPage: LandingPage, components: LandingPageComponent[]): string {
    const sortedComponents = components.sort((a, b) => a.order_index - b.order_index);
    
    const componentsHTML = sortedComponents.map(component => {
      return this.renderComponent(component);
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${landingPage.seo_config?.title || 'Landing Page'}</title>
  <link rel="stylesheet" href="styles.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  ${componentsHTML}
</body>
</html>`;
  }

  private generateCSS(components: LandingPageComponent[]): string {
    let css = `
/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}
`;

    // Add component-specific styles
    components.forEach(component => {
      if (component.custom_styles || component.styles) {
        css += this.generateComponentCSS(component);
      }
    });

    return css;
  }

  private renderComponent(component: LandingPageComponent): string {
    const { content, styles, visibility, media_urls, custom_actions } = component;
    const variation = component.component_variation;
    
    if (!variation) return '';

    // Apply visibility filters
    const visibleContent = this.applyVisibility(content, visibility);
    
    // Generate component based on type and variation
    return this.generateComponentHTML(
      variation.component_type,
      variation.variation_number,
      visibleContent,
      styles,
      media_urls || {},
      custom_actions || {}
    );
  }

  private applyVisibility(content: any, visibility: Record<string, boolean>): any {
    const filteredContent = { ...content };
    
    Object.keys(visibility).forEach(key => {
      if (!visibility[key] && filteredContent[key]) {
        delete filteredContent[key];
      }
    });

    return filteredContent;
  }

  private generateComponentHTML(
    type: string,
    variation: number,
    content: any,
    styles: any,
    mediaUrls: Record<string, string>,
    customActions: Record<string, any>
  ): string {
    // Basic component generation - this would be expanded for each component type
    const componentClass = `${type}-variation-${variation}`;
    
    switch (type) {
      case 'hero':
        return this.generateHeroHTML(content, styles, mediaUrls, customActions, componentClass);
      case 'features':
        return this.generateFeaturesHTML(content, styles, mediaUrls, customActions, componentClass);
      case 'testimonials':
        return this.generateTestimonialsHTML(content, styles, mediaUrls, customActions, componentClass);
      case 'pricing':
        return this.generatePricingHTML(content, styles, mediaUrls, customActions, componentClass);
      case 'faq':
        return this.generateFaqHTML(content, styles, mediaUrls, customActions, componentClass);
      case 'cta':
        return this.generateCtaHTML(content, styles, mediaUrls, customActions, componentClass);
      default:
        return `<div class="${componentClass}">Component not supported</div>`;
    }
  }

  private generateHeroHTML(content: any, styles: any, mediaUrls: Record<string, string>, customActions: Record<string, any>, componentClass: string): string {
    const backgroundStyle = this.getBackgroundStyle(styles);
    
    return `
<section class="${componentClass} min-h-screen flex items-center justify-center" style="${backgroundStyle}">
  <div class="container mx-auto px-4 text-center">
    ${content.headline ? `<h1 class="text-4xl md:text-6xl font-bold mb-6">${content.headline}</h1>` : ''}
    ${content.subheadline ? `<p class="text-xl mb-8">${content.subheadline}</p>` : ''}
    ${content.ctaText ? this.generateButton(content.ctaText, customActions.cta || {}) : ''}
    ${mediaUrls.hero_image ? `<img src="${mediaUrls.hero_image}" alt="Hero" class="mt-8 max-w-full h-auto" />` : ''}
  </div>
</section>`;
  }

  private generateFeaturesHTML(content: any, styles: any, mediaUrls: Record<string, string>, customActions: Record<string, any>, componentClass: string): string {
    const backgroundStyle = this.getBackgroundStyle(styles);
    
    const featuresHTML = content.features?.map((feature: any, index: number) => `
      <div class="feature-item text-center">
        ${mediaUrls[`feature_${index + 1}_image`] ? `<img src="${mediaUrls[`feature_${index + 1}_image`]}" alt="${feature.title}" class="mx-auto mb-4 w-16 h-16" />` : ''}
        <h3 class="text-xl font-semibold mb-2">${feature.title}</h3>
        <p class="text-gray-600">${feature.description}</p>
      </div>
    `).join('') || '';

    return `
<section class="${componentClass} py-16" style="${backgroundStyle}">
  <div class="container mx-auto px-4">
    ${content.headline ? `<h2 class="text-3xl font-bold text-center mb-12">${content.headline}</h2>` : ''}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${featuresHTML}
    </div>
  </div>
</section>`;
  }

  private generateTestimonialsHTML(content: any, styles: any, mediaUrls: Record<string, string>, customActions: Record<string, any>, componentClass: string): string {
    const backgroundStyle = this.getBackgroundStyle(styles);
    
    const testimonialsHTML = content.testimonials?.map((testimonial: any, index: number) => `
      <div class="testimonial-item bg-white p-6 rounded-lg shadow-lg">
        <p class="mb-4">"${testimonial.text}"</p>
        <div class="flex items-center">
          ${mediaUrls[`testimonial_${index + 1}_image`] ? `<img src="${mediaUrls[`testimonial_${index + 1}_image`]}" alt="${testimonial.name}" class="w-12 h-12 rounded-full mr-4" />` : ''}
          <div>
            <h4 class="font-semibold">${testimonial.name}</h4>
            <p class="text-gray-600">${testimonial.role}</p>
          </div>
        </div>
      </div>
    `).join('') || '';

    return `
<section class="${componentClass} py-16" style="${backgroundStyle}">
  <div class="container mx-auto px-4">
    ${content.headline ? `<h2 class="text-3xl font-bold text-center mb-12">${content.headline}</h2>` : ''}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      ${testimonialsHTML}
    </div>
  </div>
</section>`;
  }

  private generatePricingHTML(content: any, styles: any, mediaUrls: Record<string, string>, customActions: Record<string, any>, componentClass: string): string {
    const backgroundStyle = this.getBackgroundStyle(styles);
    
    const plansHTML = content.plans?.map((plan: any, index: number) => `
      <div class="pricing-plan bg-white p-8 rounded-lg shadow-lg text-center">
        <h3 class="text-2xl font-bold mb-4">${plan.name}</h3>
        <div class="text-4xl font-bold mb-6">$${plan.price}<span class="text-lg text-gray-600">/mo</span></div>
        <ul class="mb-8">
          ${plan.features?.map((feature: string) => `<li class="mb-2">${feature}</li>`).join('') || ''}
        </ul>
        ${plan.ctaText ? this.generateButton(plan.ctaText, customActions[`plan_${index + 1}`] || {}) : ''}
      </div>
    `).join('') || '';

    return `
<section class="${componentClass} py-16" style="${backgroundStyle}">
  <div class="container mx-auto px-4">
    ${content.headline ? `<h2 class="text-3xl font-bold text-center mb-12">${content.headline}</h2>` : ''}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      ${plansHTML}
    </div>
  </div>
</section>`;
  }

  private generateFaqHTML(content: any, styles: any, mediaUrls: Record<string, string>, customActions: Record<string, any>, componentClass: string): string {
    const backgroundStyle = this.getBackgroundStyle(styles);
    
    const faqsHTML = content.faqs?.map((faq: any) => `
      <div class="faq-item mb-6">
        <h3 class="text-lg font-semibold mb-2">${faq.question}</h3>
        <p class="text-gray-600">${faq.answer}</p>
      </div>
    `).join('') || '';

    return `
<section class="${componentClass} py-16" style="${backgroundStyle}">
  <div class="container mx-auto px-4 max-w-4xl">
    ${content.headline ? `<h2 class="text-3xl font-bold text-center mb-12">${content.headline}</h2>` : ''}
    <div class="space-y-6">
      ${faqsHTML}
    </div>
  </div>
</section>`;
  }

  private generateCtaHTML(content: any, styles: any, mediaUrls: Record<string, string>, customActions: Record<string, any>, componentClass: string): string {
    const backgroundStyle = this.getBackgroundStyle(styles);
    
    return `
<section class="${componentClass} py-16" style="${backgroundStyle}">
  <div class="container mx-auto px-4 text-center">
    ${content.headline ? `<h2 class="text-3xl font-bold mb-6">${content.headline}</h2>` : ''}
    ${content.subheadline ? `<p class="text-xl mb-8">${content.subheadline}</p>` : ''}
    ${content.ctaText ? this.generateButton(content.ctaText, customActions.cta || {}) : ''}
  </div>
</section>`;
  }

  private generateButton(text: string, action: any): string {
    const href = action.url || '#';
    const target = action.url && action.url.startsWith('http') ? 'target="_blank"' : '';
    
    return `<a href="${href}" ${target} class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">${text}</a>`;
  }

  private getBackgroundStyle(styles: any): string {
    const bgStyles = styles?.container || styles?.background || {};
    let style = '';
    
    if (bgStyles.background) {
      style += `background: ${bgStyles.background};`;
    } else if (bgStyles.backgroundColor) {
      style += `background-color: ${bgStyles.backgroundColor};`;
    }
    
    if (bgStyles.backgroundImage) {
      style += `background-image: ${bgStyles.backgroundImage};`;
    }
    
    return style;
  }

  private generateComponentCSS(component: LandingPageComponent): string {
    // Generate CSS for component-specific styles
    return `/* Component ${component.id} styles */\n`;
  }

  async exportAsZip(
    landingPage: LandingPage,
    components: LandingPageComponent[]
  ): Promise<Blob> {
    const files = await this.generateStaticSite(landingPage, components);
    const zip = new JSZip();
    
    // Add all generated files to zip
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    // Add README
    zip.file('README.md', `# ${landingPage.seo_config?.title || 'Landing Page'}

## Setup Instructions

1. Extract all files to your web server
2. Open index.html in a web browser
3. All assets are self-contained

Generated on: ${new Date().toISOString()}
`);
    
    return zip.generateAsync({ type: 'blob' });
  }
}