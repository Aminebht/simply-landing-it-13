import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { SeoGenerator, ScriptGenerator, StyleGenerator } from './index';
import { CssGeneratorService } from './css-generator';

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

  constructor(private config: HtmlGeneratorConfig = {}) {
    this.seoGenerator = new SeoGenerator();
    this.scriptGenerator = new ScriptGenerator();
    this.styleGenerator = new StyleGenerator();
    this.cssGenerator = new CssGeneratorService();
    
    // Set defaults
    this.config = {
      suppressConsoleWarnings: true,
      cleanProductionHtml: true,
      enableTailwindProcessing: true,
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
      const baseHTML = this.generateCompleteHTMLDocument(pageData, cleanedHTML);

      // Process with Tailwind if enabled
      if (this.config.enableTailwindProcessing) {
        console.log('🎨 Tailwind processing enabled, calling processor...');
        console.log('📊 Base HTML length:', baseHTML.length);
        
        try {
          const processingStartTime = Date.now();
          
          // Generate CSS using the new css-generator Edge Function
          const generatedCSS = await this.cssGenerator.generateCss(baseHTML);
          
          // Inject the generated CSS into the HTML
          const finalHTML = this.injectGeneratedCSS(baseHTML, generatedCSS, pageData);
          
          const totalProcessingTime = Date.now() - processingStartTime;
          
          console.log('✅ Tailwind processing complete!');
          console.log('📈 Final HTML length:', finalHTML.length);
          console.log('⏱️ Total processing time:', totalProcessingTime + 'ms');
          console.log('📊 Size change:', ((finalHTML.length - baseHTML.length) / baseHTML.length * 100).toFixed(1) + '%');
          
          // Verify the HTML was actually processed
          if (finalHTML.length === 0) {
            console.error('❌ Tailwind processing returned empty HTML, using base HTML');
            return baseHTML;
          }
          
          // Check if processing actually occurred (should have inline styles)
          if (!finalHTML.includes('<style>') && finalHTML.length === baseHTML.length) {
            console.warn('⚠️ Tailwind processing may not have occurred properly');
          }
          
          return finalHTML;
        } catch (processingError) {
          console.error('❌ Tailwind processing failed completely:', processingError);
          console.log('🔄 Returning base HTML as fallback');
          return baseHTML;
        }
      }

      console.log('ℹ️ Tailwind processing disabled, returning base HTML');
      return baseHTML;

    } catch (error) {
      console.error('Failed to generate React HTML:', error);
      throw new Error(`React HTML generation failed: ${error.message}`);
    }
  }

  async processDeployedHTML(html: string, pageData: any, siteUrl: string): Promise<string> {
    try {
      console.log('Processing deployed HTML with css-generator Edge Function...');
      
      // Generate CSS using the new css-generator
      const generatedCSS = await this.cssGenerator.generateCss(html);
      
      // Inject the CSS into the HTML
      const processedHTML = this.injectGeneratedCSS(html, generatedCSS, pageData);
      
      return processedHTML;

    } catch (error) {
      console.error('Failed to process deployed HTML:', error);
      // Return original HTML if processing fails
      return html;
    }
  }

  private injectGeneratedCSS(html: string, css: string, pageData: any): string {
    // Extract theme colors from pageData for CSS variables
    const primaryColor = pageData?.global_theme?.primaryColor || '#3b82f6';
    const secondaryColor = pageData?.global_theme?.secondaryColor || '#f3f4f6';
    const backgroundColor = pageData?.global_theme?.backgroundColor || '#ffffff';

    // Create the style block with CSS variables and generated CSS
    const styleBlock = `    <style>
/* CSS Variables for theming */
:root {
  --primary-color: ${primaryColor};
  --secondary-color: ${secondaryColor};
  --background-color: ${backgroundColor};
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

/* Generated page-specific Tailwind CSS */
${css}
    </style>
`;

    // Find the head tag and inject the CSS
    const headEndMatch = html.match(/<\/head>/i);
    if (!headEndMatch) {
      console.warn('No </head> tag found in HTML, injecting CSS at the beginning');
      return styleBlock + html;
    }

    // Inject CSS right before the closing head tag
    const beforeHead = html.substring(0, headEndMatch.index);
    const afterHead = html.substring(headEndMatch.index!);
    
    return beforeHead + styleBlock + afterHead;
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

    // Only include Tailwind CDN if edge function processing is disabled
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
  ${this.config.enableTailwindProcessing ? '' : this.styleGenerator.generateTailwindCSS()}
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
    // Note: Most security headers like X-Frame-Options, X-Content-Type-Options, etc. 
    // must be set as HTTP headers, not meta tags. We'll handle these via Netlify _headers file.
    // Only CSP can be set via meta tag as a fallback.
    return `<!-- Content Security Policy (meta fallback) -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-src 'none'; object-src 'none';">`;
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
