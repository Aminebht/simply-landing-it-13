import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { CssGeneratorService } from './css-generator';

// Inline utility classes to replace removed dependencies
class SeoGenerator {
  generateSEOMetaTags(pageData: any): string {
    const title = pageData?.title || 'Landing Page';
    const description = pageData?.description || 'A beautiful landing page';
    const keywords = pageData?.keywords || 'landing page, website, marketing';
    
    return `
  <meta name="description" content="${this.escapeHtml(description)}">
  <meta name="keywords" content="${this.escapeHtml(keywords)}">
  <meta property="og:title" content="${this.escapeHtml(title)}">
  <meta property="og:description" content="${this.escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${this.escapeHtml(title)}">
  <meta name="twitter:description" content="${this.escapeHtml(description)}">`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

class StyleGenerator {
  generateGoogleFontsLink(pageData: any): string {
    const fontFamily = pageData?.globalTheme?.fontFamily || 'Inter';
    if (fontFamily && fontFamily !== 'inherit') {
      return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700&display=swap" rel="stylesheet">`;
    }
    return '';
  }
}

class ScriptGenerator {
  // Simple script generator for basic interactivity
  generateClientScript(): string {
    return `
// Basic client-side functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Landing page loaded');
});`;
  }
}

// HTML Generator for React SSR deployment
export interface HtmlGeneratorConfig {
  suppressConsoleWarnings?: boolean;
  cleanProductionHtml?: boolean;
  enableTailwindProcessing?: boolean;
  siteUrl?: string;
}

export class HtmlGenerator {
  private seoGenerator: SeoGenerator;
  private scriptGenerator: ScriptGenerator;
  private styleGenerator: StyleGenerator;
  private cssGenerator: CssGeneratorService;
  private lastGeneratedCSS: string = '';

  constructor(private config: HtmlGeneratorConfig = {}) {
    this.seoGenerator = new SeoGenerator();
    this.scriptGenerator = new ScriptGenerator();
    this.styleGenerator = new StyleGenerator();
    this.cssGenerator = new CssGeneratorService();
    
    // Set defaults - always enable Tailwind processing
    this.config = {
      suppressConsoleWarnings: true,
      cleanProductionHtml: true,
      enableTailwindProcessing: true, // Always enabled
      ...config
    };
    // Force enable processing regardless of config
    this.config.enableTailwindProcessing = true;
  }

  async generateReactHTML(pageData: any): Promise<string> {
    try {
      // Sort components by order_index
      const sortedComponents = this.sortComponentsByOrder(pageData.components || []);
      
      // Pre-fetch checkout fields for SSR
      const checkoutFields = await this.fetchCheckoutFields();
      
      // Create React component tree
      const pageComponent = this.createPageComponent(pageData, sortedComponents, checkoutFields);
      
      // Render to HTML string
      const componentHTML = this.renderComponentToHTML(pageComponent);
      
      // Clean production HTML if enabled
      const cleanedHTML = this.config.cleanProductionHtml 
        ? this.cleanProductionHTML(componentHTML)
        : componentHTML;

      // Generate complete HTML document
      const baseHTML = this.generateCompleteHTMLDocument(pageData, cleanedHTML);

      // Process with Tailwind CSS generator and merge with styles.css
      console.log('🎨 Processing with Tailwind CSS generator...');
      console.log('📊 Base HTML length:', baseHTML.length);
      
      try {
        const processingStartTime = Date.now();
        
        // Generate CSS using the css-generator Edge Function
        const generatedCSS = await this.cssGenerator.generateCss(baseHTML);
        
        // Store generated CSS for merging with styles.css (no injection into HTML)
        this.lastGeneratedCSS = generatedCSS;
        
        const totalProcessingTime = Date.now() - processingStartTime;
        
        console.log('✅ Tailwind processing complete!');
        console.log('📈 Generated CSS will be merged with styles.css');
        console.log('⏱️ Total processing time:', totalProcessingTime + 'ms');
        console.log('📊 Clean HTML for better performance');
        
        // Return clean HTML without embedded CSS
        return baseHTML;
      } catch (processingError) {
        console.error('❌ Tailwind processing failed completely:', processingError);
        console.log('🔄 Returning base HTML as fallback');
        this.lastGeneratedCSS = '';
        return baseHTML;
      }

    } catch (error) {
      console.error('Failed to generate React HTML:', error);
      throw new Error(`React HTML generation failed: ${error.message}`);
    }
  }

  getLastGeneratedCSS(): string {
    return this.lastGeneratedCSS;
  }

  async processDeployedHTML(html: string, pageData: any, siteUrl: string): Promise<string> {
    try {
      console.log('Processing deployed HTML with css-generator Edge Function...');
      
      // Generate CSS using the css-generator Edge Function and store for styles.css
      const generatedCSS = await this.cssGenerator.generateCss(html);
      this.lastGeneratedCSS = generatedCSS;
      
      // Return clean HTML - CSS will be in external styles.css
      return html;

    } catch (error) {
      console.error('Failed to process deployed HTML:', error);
      this.lastGeneratedCSS = '';
      // Return original HTML if processing fails
      return html;
    }
  }

  private sortComponentsByOrder(components: LandingPageComponent[]): LandingPageComponent[] {
    return components.sort((a, b) => a.order_index - b.order_index);
  }

  private async fetchCheckoutFields(): Promise<any[]> {
    try {
      const { LandingPageService } = await import('../landing-page');
      const landingPageService = LandingPageService.getInstance();
      const supabaseClient = (landingPageService as any).supabase;
      
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from('checkout_fields')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (!error && data) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Could not pre-fetch checkout fields for SSR:', error);
    }

    // Return default checkout fields
    return this.getDefaultCheckoutFields();
  }

  private getDefaultCheckoutFields(): any[] {
    return [
      {
        id: 'email',
        label: 'Email',
        field_key: 'email',
        is_required: true,
        display_order: 0,
        product_ids: []
      },
      {
        id: 'full_name',
        label: 'Full Name',
        field_key: 'full_name',
        is_required: true,
        display_order: 1,
        product_ids: []
      },
      {
        id: 'phone',
        label: 'Phone Number',
        field_key: 'phone',
        is_required: false,
        display_order: 2,
        product_ids: []
      }
    ];
  }

  private createPageComponent(
    pageData: any, 
    sortedComponents: LandingPageComponent[], 
    checkoutFields: any[]
  ): React.ReactElement {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();

    return React.createElement('div', {
      id: 'landing-page',
      'data-section-id': 'page-root',
      style: {
        fontFamily: globalTheme.fontFamily || 'Inter, sans-serif',
        direction: globalTheme.direction || 'ltr',
        backgroundColor: globalTheme.backgroundColor || '#ffffff'
      }
    }, 
      sortedComponents.map((component: LandingPageComponent) => 
        this.createComponentElement(component, pageData, checkoutFields)
      ).filter(Boolean)
    );
  }

  private createComponentElement(
    component: LandingPageComponent, 
    pageData: any, 
    checkoutFields: any[]
  ): React.ReactElement | null {
    const componentType = component.component_variation?.component_type;
    const variationNumber = component.component_variation?.variation_number;

    if (!componentType || !variationNumber) {
      console.warn('Invalid component data:', component.id);
      return null;
    }

    return React.createElement('div', {
      key: component.id,
      id: `section-${component.id}`,
      'data-section-id': component.id
    }, React.createElement(ComponentRenderer, {
      type: componentType,
      variation: variationNumber,
      content: component.content || {},
      styles: component.custom_styles || {},
      visibility: component.visibility || {},
      mediaUrls: component.media_urls || {},
      isEditing: false,
      viewport: 'responsive',
      globalTheme: pageData.global_theme || this.getDefaultGlobalTheme(),
      customStyles: component.custom_styles,
      componentId: component.id,
      customActions: component.custom_actions || {},
      checkoutFields: checkoutFields
    }));
  }

  private getDefaultGlobalTheme() {
    return {
      primaryColor: '#3b82f6',
      secondaryColor: '#f3f4f6',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      direction: 'ltr',
      language: 'en'
    };
  }

  private renderComponentToHTML(pageComponent: React.ReactElement): string {
    if (this.config.suppressConsoleWarnings) {
      return this.suppressSSRWarnings(() => 
        ReactDOMServer.renderToStaticMarkup(pageComponent)
      );
    }
    
    return ReactDOMServer.renderToStaticMarkup(pageComponent);
  }

  private suppressSSRWarnings<T>(fn: () => T): T {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('useLayoutEffect does nothing on the server')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      return fn();
    } finally {
      console.error = originalConsoleError;
    }
  }

  private cleanProductionHTML(html: string): string {
    let cleanedHTML = html;
    
    // Remove development data attributes
    const devAttributes = [
      /data-lov-[^=]*="[^"]*"/g,
      /data-component-[^=]*="[^"]*"/g,
      /data-element="[^"]*"/g,
      /data-testid="[^"]*"/g,
      /data-cy="[^"]*"/g,
      /data-qa="[^"]*"/g,
    ];
    
    devAttributes.forEach(pattern => {
      cleanedHTML = cleanedHTML.replace(pattern, '');
    });
    
    // Clean up whitespace
    cleanedHTML = cleanedHTML.replace(/\s+/g, ' ');
    cleanedHTML = cleanedHTML.replace(/\s+>/g, '>');
    cleanedHTML = cleanedHTML.replace(/>\s+</g, '><');
    
    // Remove HTML comments
    cleanedHTML = cleanedHTML.replace(/<!--(?!\s*\/\*)[\s\S]*?-->/g, '');
    
    // Clean up debug classes
    cleanedHTML = cleanedHTML.replace(/\b(dev|debug|test)-\w+\b/g, '');
    
    return cleanedHTML;
  }

  private generateCompleteHTMLDocument(pageData: any, bodyHTML: string): string {
    const lang = pageData.global_theme?.language || 'en';
    const dir = pageData.global_theme?.direction || 'ltr';
    const title = pageData.seo_config?.title || pageData.slug;

    // Clean separation: HTML only contains structure and references to external files
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  
  ${this.generateSecurityHeaders()}
  ${this.seoGenerator.generateSEOMetaTags(pageData)}
  <link rel="stylesheet" href="styles.css">
  ${this.styleGenerator.generateGoogleFontsLink(pageData)}
</head>
<body>
  ${bodyHTML}
  <script src="app.js"></script>
</body>
</html>`;
  }

  private generateSecurityHeaders(): string {
    // Note: Most security headers like X-Frame-Options, X-Content-Type-Options, etc. 
    // must be set as HTTP headers, not meta tags. We'll handle these via Netlify _headers file.
    // Only CSP can be set via meta tag as a fallback.
    return `<!-- Content Security Policy (meta fallback) -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com; object-src 'none';">`;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
