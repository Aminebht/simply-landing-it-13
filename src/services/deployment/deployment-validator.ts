export class DeploymentValidator {
  validatePageData(pageData: any): void {
    if (!pageData) {
      throw new Error('No page data provided');
    }

    if (!pageData.components) {
      throw new Error('No components found in page data');
    }

    if (!Array.isArray(pageData.components)) {
      throw new Error('Components must be an array');
    }

    if (pageData.components.length === 0) {
      throw new Error('Page must have at least one component');
    }

    // Validate each component
    pageData.components.forEach((component: any, index: number) => {
      this.validateComponent(component, index);
    });

    // Validate global theme if present
    if (pageData.global_theme) {
      this.validateGlobalTheme(pageData.global_theme);
    }
  }

  private validateComponent(component: any, index: number): void {
    if (!component.id) {
      throw new Error(`Component at index ${index} is missing an ID`);
    }

    if (!component.component_variation) {
      throw new Error(`Component ${component.id} is missing component_variation`);
    }

    if (!component.component_variation.component_type) {
      throw new Error(`Component ${component.id} is missing component_type`);
    }

    if (!component.component_variation.variation_number) {
      throw new Error(`Component ${component.id} is missing variation_number`);
    }

    if (typeof component.order_index !== 'number') {
      throw new Error(`Component ${component.id} has invalid order_index`);
    }
  }

  private validateGlobalTheme(globalTheme: any): void {
    // Optional validation for global theme properties
    if (globalTheme.direction && !['ltr', 'rtl'].includes(globalTheme.direction)) {
      throw new Error('Global theme direction must be "ltr" or "rtl"');
    }

    if (globalTheme.language && typeof globalTheme.language !== 'string') {
      throw new Error('Global theme language must be a string');
    }
  }

  validateNetlifyToken(token: string): void {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Valid Netlify token is required');
    }
  }

  validatePageId(pageId: string): void {
    if (!pageId || typeof pageId !== 'string' || pageId.trim().length === 0) {
      throw new Error('Valid page ID is required');
    }
  }

  validateSiteId(siteId: string): void {
    if (!siteId || typeof siteId !== 'string' || siteId.trim().length === 0) {
      throw new Error('Valid site ID is required');
    }
  }

  validateDeploymentFiles(files: Record<string, string>): void {
    if (!files || typeof files !== 'object') {
      throw new Error('Deployment files must be an object');
    }

    const requiredFiles = ['index.html', 'styles.css', 'app.js'];
    
    for (const fileName of requiredFiles) {
      if (!files[fileName]) {
        throw new Error(`Missing required file: ${fileName}`);
      }
      
      if (typeof files[fileName] !== 'string') {
        throw new Error(`File ${fileName} content must be a string`);
      }
      
      if (files[fileName].trim().length === 0) {
        throw new Error(`File ${fileName} cannot be empty`);
      }
    }

    // Validate HTML structure
    if (!files['index.html'].includes('<!DOCTYPE html>')) {
      throw new Error('HTML file must include DOCTYPE declaration');
    }

    if (!files['index.html'].includes('<html')) {
      throw new Error('HTML file must include html tag');
    }
  }
}
