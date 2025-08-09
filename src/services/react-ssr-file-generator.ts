import { HtmlGenerator } from './deployment/html-generator';
import { AssetGenerator } from './deployment/asset-generator';
import { LandingPageService } from './landing-page';

export interface ReactSSRFiles {
  html: string;
  css: string;
  js: string;
}

/**
 * React SSR File Generator
 * 
 * This service generates the proper React SSR files that match the builder 100%
 * Uses the core HTML and Asset generators for optimal performance and accuracy
 */
export class ReactSSRFileGenerator {
  private htmlGenerator: HtmlGenerator;
  private assetGenerator: AssetGenerator;
  private landingPageService: LandingPageService;

  constructor() {
    this.htmlGenerator = new HtmlGenerator({
      enableTailwindProcessing: true,
      suppressConsoleWarnings: true,
      cleanProductionHtml: true
    });
    this.assetGenerator = new AssetGenerator();
    this.landingPageService = new LandingPageService();
  }

  /**
   * Generate React SSR files for a landing page
   * This ensures 100% compatibility with the builder
   */
  async generateReactSSRFiles(pageId: string): Promise<ReactSSRFiles> {
    try {
      console.log('🎯 Generating React SSR files for 100% builder match...');

      // Step 1: Fetch page data
      const pageData = await this.validateAndFetchPageData(pageId);
      console.log('✅ Page data fetched successfully');

      // Step 2: Generate HTML with integrated CSS processing (using React SSR)
      const finalHTML = await this.htmlGenerator.generateReactHTML(pageData);
      console.log('✅ React HTML generated with SSR');

      // Step 3: Get the generated CSS from HTML generator
      const priorityCSS = this.htmlGenerator.getLastGeneratedCSS();
      console.log('✅ Priority CSS extracted from HTML generator');

      // Step 4: Generate assets with priority CSS merged
      const { css: finalCSS, js } = await this.assetGenerator.generateAssets(pageData, priorityCSS);
      console.log('✅ Assets generated and CSS merged');

      const files: ReactSSRFiles = {
        html: finalHTML,
        css: finalCSS,
        js: js
      };

      console.log('🎉 React SSR files generated successfully!');
      console.log(`📊 Files: HTML(${files.html.length}), CSS(${files.css.length}), JS(${files.js.length})`);

      return files;

    } catch (error) {
      console.error('❌ Failed to generate React SSR files:', error);
      throw new Error(`React SSR file generation failed: ${error.message}`);
    }
  }

  /**
   * Validate and fetch page data with components
   */
  private async validateAndFetchPageData(pageId: string): Promise<any> {
    if (!pageId) {
      throw new Error('Page ID is required');
    }

    // Fetch page data with components using the landing page service
    const pageDataWithComponents = await this.landingPageService.getLandingPageWithComponents(pageId);
    
    if (!pageDataWithComponents) {
      throw new Error(`Landing page not found: ${pageId}`);
    }

    // Validate required fields
    if (!pageDataWithComponents.components || !Array.isArray(pageDataWithComponents.components)) {
      throw new Error('Landing page must have components array');
    }

    console.log(`✅ Page data validated: ${pageDataWithComponents.components.length} components found`);
    
    return pageDataWithComponents;
  }
}

/**
 * Hook for generating React SSR files
 */
export function useReactSSRFileGenerator() {
  const generator = new ReactSSRFileGenerator();

  const generateFiles = async (pageId: string): Promise<ReactSSRFiles> => {
    return await generator.generateReactSSRFiles(pageId);
  };

  return {
    generateFiles
  };
}
