import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { LandingPageService } from '../landing-page';
import { SeoGenerator, ScriptGenerator, StyleGenerator } from './index';

// HTML Generator for React SSR deployment
export interface HtmlGeneratorConfig {
  suppressConsoleWarnings?: boolean;
  cleanProductionHtml?: boolean;
}

export class HtmlGenerator {
  private seoGenerator: SeoGenerator;
  private scriptGenerator: ScriptGenerator;
  private styleGenerator: StyleGenerator;

  constructor(private config: HtmlGeneratorConfig = {}) {
    this.seoGenerator = new SeoGenerator();
    this.scriptGenerator = new ScriptGenerator();
    this.styleGenerator = new StyleGenerator();
    
    // Set defaults
    this.config = {
      suppressConsoleWarnings: true,
      cleanProductionHtml: true,
      ...config
    };
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
      return this.generateCompleteHTMLDocument(pageData, cleanedHTML);

    } catch (error) {
      console.error('Failed to generate React HTML:', error);
      throw new Error(`React HTML generation failed: ${error.message}`);
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
  ${this.styleGenerator.generateTailwindCSS()}
  ${this.scriptGenerator.generateSupabaseSDK(pageData)}
  ${this.scriptGenerator.generateTrackingScripts(pageData)}
</head>
<body>
  ${bodyHTML}
  <script src="app.js"></script>
</body>
</html>`;
  }

  private generateSecurityHeaders(): string {
    return `<!-- Security Headers -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.tailwindcss.com https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.netlify.app https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://k.clarity.ms; frame-src 'none';">`;
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
