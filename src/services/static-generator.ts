import { LandingPage } from "@/types/landing-page";
import { LandingPageComponent } from "@/types/components";
import { supabase } from "@/services/supabase";
import JSZip from "jszip";
import * as path from "path";
import * as fs from "fs/promises";
import { ViteBuilder } from "./vite-builder";

interface GlobalTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  direction: string;
  language: string;
  customCss?: string;
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
  private tempDir: string = "";

  async exportLandingPageFromDatabase(pageId: string): Promise<Blob> {
    try {
      // Create temporary directory for build process
      this.tempDir = await this.createTempDirectory();

      // Fetch landing page data with global theme and SEO config
      const { data: pageData, error: pageError } = await supabase
        .from("landing_pages")
        .select(`*, products(id, price)`)
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
      
      // Generate static files using Vite build process
      const viteBuilder = new ViteBuilder({
        tempDir: this.tempDir,
        landingPage: pageData,
        globalTheme: pageData.global_theme,
        components: processedComponents
      });
      const files = await viteBuilder.buildProject();

      // Clean up temporary directory
      await this.cleanupTempDirectory();

      return this.createZipPackage(pageData, files);
    } catch (error) {
      console.error("Export failed:", error);
      // Clean up on error
      if (this.tempDir) {
        await this.cleanupTempDirectory();
      }
      throw error;
    }
  }

  private async createTempDirectory(): Promise<string> {
    const tempDir = path.join(process.cwd(), "temp", `build-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  }

  private async cleanupTempDirectory(): Promise<void> {
    if (this.tempDir) {
      try {
        await fs.rm(this.tempDir, { recursive: true, force: true });
      } catch (error) {
        console.warn("Failed to cleanup temp directory:", error);
      }
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
      if (url && url.startsWith("http" )) {
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

  private async createZipPackage(pageData: any, files: Record<string, string>): Promise<Blob> {
    const zip = new JSZip();
    
    // Add all generated files to zip
    for (const [filePath, content] of Object.entries(files)) {
      zip.file(filePath, content);
    }
    
    // Add a README with deployment instructions
    const readme = `# ${pageData.slug || "Landing Page"} - Static Export\n\nThis package contains the static files for your landing page.\n\n## Deployment Instructions\n\n1. Upload all files to your web server\n2. Ensure index.html is served as the main page\n3. Configure your server to serve static assets (CSS, JS, images)\n\n## Files Included\n\n- index.html - Main HTML file\n- styles.css - Compiled styles\n- main.js - Compiled JavaScript (if any)\n- assets/ - Static assets (images, fonts, etc.)\n\nGenerated on: ${new Date().toISOString()}\n`;
    
    zip.file("README.md", readme);
    
    return await zip.generateAsync({ type: "blob" });
  }
}


