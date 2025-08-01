import { supabase } from "@/services/supabase";
import JSZip from "jszip";
import { ComponentTransformerService } from "./component-transformer";

interface GlobalTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  direction: string;
  language: string;
}

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
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
  private componentTransformer = new ComponentTransformerService();

  async exportLandingPageFromDatabase(pageId: string): Promise<Record<string, string>> {
    try {
      // Fetch landing page data with global theme and SEO config
      const { data: pageData, error: pageError } = await supabase
        .from("landing_pages")
        .select("*, products(id, price)")
        .eq("id", pageId)
        .single();

      if (pageError || !pageData) {
        throw new Error(`Failed to fetch landing page: ${pageError?.message}`);
      }

      // Fetch components data with variations
      const { data: componentsData, error: componentsError } = await supabase
        .from("landing_page_components")
        .select(`
          *,
          component_variation:component_variations(*)
        `)
        .eq("page_id", pageId)
        .order("order_index", { ascending: true });

      if (componentsError) {
        throw new Error(`Failed to fetch components: ${componentsError.message}`);
      }

      // Process and clean components for production
      const processedComponents = await this.processComponents(componentsData || []);
      
      // Generate static files
      const files = await this.generateStaticFiles(
        pageData,
        pageData.global_theme,
        pageData.seo_config,
        processedComponents
      );

      return files;
    } catch (error) {
      console.error("Export failed:", error);
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
        styles: this.mergeStyles(component.component_variation.default_content, component.custom_styles),
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
      if (url && url.startsWith("http")) {
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

  private async generateStaticFiles(
    pageData: any,
    globalTheme: GlobalTheme,
    seoConfig: SEOConfig,
    components: ComponentProcessed[]
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    // Generate HTML
    files['index.html'] = await this.generateHTML(pageData, globalTheme, seoConfig, components);
    
    // Generate CSS
    files['styles.css'] = this.generateCSS(globalTheme, components);
    
    // Generate README
    files['README.md'] = this.generateREADME(pageData);

    return files;
  }

  private async generateHTML(
    pageData: any,
    globalTheme: GlobalTheme,
    seoConfig: SEOConfig,
    components: ComponentProcessed[]
  ): Promise<string> {
    const componentsHTML = await this.generateComponentsHTML(components, globalTheme, pageData);
    const allComponentsJS = await this.generateComponentsJS(components, globalTheme, pageData);

    return `<!DOCTYPE html>
<html lang="${globalTheme.language}" dir="${globalTheme.direction}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoConfig.title || pageData.slug}</title>
    <meta name="description" content="${seoConfig.description || ''}">
    <meta name="keywords" content="${seoConfig.keywords?.join(', ') || ''}">
    ${seoConfig.ogImage ? `<meta property="og:image" content="${seoConfig.ogImage}">` : ''}
    ${seoConfig.canonical ? `<link rel="canonical" href="${seoConfig.canonical}">` : ''}
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=${globalTheme.fontFamily}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="font-family: '${globalTheme.fontFamily}', sans-serif; background-color: ${globalTheme.backgroundColor}; color: ${globalTheme.textColor}; margin: 0; padding: 0;">
  ${componentsHTML}
  <script>
    ${allComponentsJS}
  </script>
</body>
</html>`;
  }

  private async generateComponentsHTML(components: ComponentProcessed[], globalTheme: GlobalTheme, pageData: any): Promise<string> {
    const transformResults = await Promise.all(components.map(async (component) => {
      // Convert ComponentProcessed to LandingPageComponent format for transformer
      const landingPageComponent = {
        id: component.id,
        page_id: '',
        component_variation_id: '',
        order_index: component.orderIndex,
        content: component.content,
        styles: component.styles,
        visibility: component.visibility,
        custom_styles: {},
        media_urls: component.mediaUrls,
        custom_actions: component.customActions,
        component_variation: {
          id: '',
          component_type: component.type,
          variation_name: '',
          variation_number: component.variation,
          description: '',
          default_content: {},
          character_limits: {},
          required_images: 0,
          supports_video: false,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        created_at: '',
        updated_at: ''
      };
      
      return this.componentTransformer.transformComponent(landingPageComponent, {
        viewport: 'responsive',
        globalTheme,
        productData: pageData.products
      });
    }));
    
    return transformResults.map(result => result.html).join('\n');
  }

  private async generateComponentsJS(components: ComponentProcessed[], globalTheme: GlobalTheme, pageData: any): Promise<string> {
    const transformResults = await Promise.all(components.map(async (component) => {
      // Convert ComponentProcessed to LandingPageComponent format for transformer
      const landingPageComponent = {
        id: component.id,
        page_id: '',
        component_variation_id: '',
        order_index: component.orderIndex,
        content: component.content,
        styles: component.styles,
        visibility: component.visibility,
        custom_styles: {},
        media_urls: component.mediaUrls,
        custom_actions: component.customActions,
        component_variation: {
          id: '',
          component_type: component.type,
          variation_name: '',
          variation_number: component.variation,
          description: '',
          default_content: {},
          character_limits: {},
          required_images: 0,
          supports_video: false,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        created_at: '',
        updated_at: ''
      };
      
      return this.componentTransformer.transformComponent(landingPageComponent, {
        viewport: 'responsive',
        globalTheme,
        productData: pageData.products
      });
    }));
    
    return transformResults.map(result => result.js).filter(js => js.trim()).join('\n');
  }

  private generateHeroHTML(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const content = component.content;
    return `
      <div style="padding: 4rem 1rem; text-align: center; background: linear-gradient(135deg, ${globalTheme.primaryColor}, ${globalTheme.secondaryColor});">
        <h1 style="font-size: 3rem; font-weight: bold; color: white; margin-bottom: 1rem;">
          ${content.headline || 'Welcome'}
        </h1>
        <p style="font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem;">
          ${content.subheadline || 'Your landing page description'}
        </p>
        ${content.ctaText ? `<button style="background: white; color: ${globalTheme.primaryColor}; padding: 1rem 2rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">${content.ctaText}</button>` : ''}
      </div>
    `;
  }

  private generateFeaturesHTML(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const content = component.content;
    return `
      <div style="padding: 4rem 1rem; max-width: 1200px; margin: 0 auto;">
        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: ${globalTheme.primaryColor};">
          ${content.title || 'Features'}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          ${content.features?.map((feature: any) => `
            <div style="text-align: center; padding: 2rem;">
              <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: ${globalTheme.secondaryColor};">${feature.title}</h3>
              <p style="color: ${globalTheme.textColor};">${feature.description}</p>
            </div>
          `).join('') || ''}
        </div>
      </div>
    `;
  }

  private generateCTAHTML(component: ComponentProcessed, globalTheme: GlobalTheme): string {
    const content = component.content;
    return `
      <div style="padding: 4rem 1rem; text-align: center; background: ${globalTheme.backgroundColor};">
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: ${globalTheme.primaryColor};">
          ${content.headline || 'Ready to get started?'}
        </h2>
        <p style="font-size: 1.25rem; margin-bottom: 2rem; color: ${globalTheme.textColor};">
          ${content.subheadline || 'Join thousands of satisfied customers'}
        </p>
        ${content.ctaText ? `<button style="background: ${globalTheme.primaryColor}; color: white; padding: 1rem 2rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">${content.ctaText}</button>` : ''}
      </div>
    `;
  }

  private generateCSS(globalTheme: GlobalTheme, components: ComponentProcessed[]): string {
    return `
/* Global Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: '${globalTheme.fontFamily}', sans-serif;
  background-color: ${globalTheme.backgroundColor};
  color: ${globalTheme.textColor};
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem !important;
  }
  
  h2 {
    font-size: 1.75rem !important;
  }
}

/* Button Styles */
button {
  transition: all 0.3s ease;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* Grid Responsiveness */
.grid {
  display: grid;
  gap: 2rem;
}

@media (min-width: 768px) {
  .grid-md-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-md-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
`;
  }

  private generateREADME(pageData: any): string {
    return `# ${pageData.slug || "Landing Page"} - Static Export

This package contains the static files for your landing page.

## Deployment Instructions

1. Upload all files to your web server
2. Ensure index.html is served as the main page
3. Configure your server to serve static assets (CSS, JS, images)

## Files Included

- index.html - Main HTML file
- styles.css - Compiled styles
- README.md - This file

Generated on: ${new Date().toISOString()}
`;
  }

  async createZipPackage(pageId: string): Promise<Blob> {
    const files = await this.exportLandingPageFromDatabase(pageId);
    const zip = new JSZip();
    
    // Add all generated files to zip
    for (const [filePath, content] of Object.entries(files)) {
      zip.file(filePath, content);
    }
    
    return await zip.generateAsync({ type: "blob" });
  }
}