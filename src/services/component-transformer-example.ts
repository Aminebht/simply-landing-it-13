import { ComponentTransformerService } from './component-transformer';
import { LandingPageComponent } from '@/types/components';

/**
 * Example usage of the Component Transformer Service
 * 
 * This demonstrates how to transform any component variation
 * into static HTML, CSS, and JavaScript for deployment.
 */

export class ComponentTransformerExample {
  private transformer = new ComponentTransformerService();

  /**
   * Transform a landing page component to static files
   */
  async transformComponentForDeployment(
    component: LandingPageComponent,
    options: {
      viewport?: 'mobile' | 'tablet' | 'desktop' | 'responsive';
      theme?: {
        primaryColor: string;
        secondaryColor: string;
        backgroundColor: string;
        textColor: string;
        fontFamily: string;
      };
      productData?: {
        id: string;
        price: number;
      };
    } = {}
  ) {
    const {
      viewport = 'responsive',
      theme = {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter'
      },
      productData
    } = options;

    try {
      const result = await this.transformer.transformComponent(component, {
        viewport,
        globalTheme: {
          ...theme,
          direction: 'ltr',
          language: 'en'
        },
        productData
      });

      // Generate complete HTML document
      const completeHTML = this.generateCompleteHTML(result.html, result.css, result.js, {
        title: this.extractTitle(component),
        theme
      });

      return {
        html: completeHTML,
        css: result.css,
        js: result.js,
        componentType: component.component_variation?.component_type,
        variationNumber: component.component_variation?.variation_number
      };

    } catch (error) {
      console.error('Failed to transform component:', error);
      throw new Error(`Component transformation failed: ${error.message}`);
    }
  }

  /**
   * Transform multiple components for a complete page
   */
  async transformPageComponents(
    components: LandingPageComponent[],
    options: {
      viewport?: 'mobile' | 'tablet' | 'desktop' | 'responsive';
      theme?: any;
      pageTitle?: string;
    } = {}
  ) {
    const { viewport = 'responsive', theme, pageTitle = 'Landing Page' } = options;
    
    const transformedComponents = [];
    let combinedCSS = '';
    let combinedJS = '';

    for (const component of components) {
      const result = await this.transformComponentForDeployment(component, {
        viewport,
        theme
      });

      transformedComponents.push(result.html);
      combinedCSS += result.css + '\n';
      combinedJS += result.js + '\n';
    }

    // Generate complete page HTML
    const pageHTML = this.generateCompleteHTML(
      transformedComponents.join('\n'),
      combinedCSS,
      combinedJS,
      {
        title: pageTitle,
        theme
      }
    );

    return {
      html: pageHTML,
      css: combinedCSS,
      js: combinedJS,
      componentCount: components.length
    };
  }

  /**
   * Generate a complete HTML document
   */
  private generateCompleteHTML(
    bodyContent: string,
    css: string,
    js: string,
    options: {
      title: string;
      theme?: any;
    }
  ): string {
    const { title, theme } = options;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${theme?.fontFamily || 'Inter'}:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <style>
        ${css}
        
        /* Additional responsive utilities */
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Smooth scroll behavior */
        html {
            scroll-behavior: smooth;
        }
        
        /* Custom theme variables */
        :root {
            --primary-color: ${theme?.primaryColor || '#3b82f6'};
            --secondary-color: ${theme?.secondaryColor || '#1e40af'};
            --background-color: ${theme?.backgroundColor || '#ffffff'};
            --text-color: ${theme?.textColor || '#1f2937'};
        }
    </style>
</head>
<body style="font-family: '${theme?.fontFamily || 'Inter'}', sans-serif; background-color: ${theme?.backgroundColor || '#ffffff'}; color: ${theme?.textColor || '#1f2937'};">
    ${bodyContent}
    
    <!-- Custom JavaScript -->
    <script>
        ${js}
    </script>
    
    <!-- Analytics placeholder -->
    <script>
        // Add your analytics code here (Google Analytics, Facebook Pixel, etc.)
        console.log('Page loaded successfully');
    </script>
</body>
</html>`;
  }

  /**
   * Extract title from component content
   */
  private extractTitle(component: LandingPageComponent): string {
    const content = component.content;
    return content.headline || content.title || content.sectionTitle || 'Landing Page Component';
  }

  /**
   * Quick test method to verify transformer works
   */
  async quickTest() {
    // Create a sample hero component
    const sampleComponent: LandingPageComponent = {
      id: 'test-hero',
      page_id: 'test-page',
      component_variation_id: 'hero-1',
      order_index: 1,
      content: {
        headline: 'Transform Any Component',
        subheadline: 'Our unified transformer works with all component variations',
        ctaText: 'Try It Now',
        badge: '✨ New Feature'
      },
      styles: {},
      visibility: {
        headline: true,
        subheadline: true,
        ctaButton: true,
        badge: true
      },
      media_urls: {},
      custom_actions: {
        cta: {
          type: 'open_link',
          url: 'https://example.com',
          newTab: true
        }
      },
      component_variation: {
        id: 'hero-1',
        component_type: 'hero',
        variation_name: 'Hero Test',
        variation_number: 1,
        description: 'Test hero component',
        default_content: {},
        character_limits: {},
        required_images: 0,
        supports_video: false,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    console.log('🧪 Running quick test...');
    
    const result = await this.transformComponentForDeployment(sampleComponent, {
      viewport: 'responsive',
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter'
      }
    });

    console.log('✅ Quick test successful!');
    console.log(`   Component Type: ${result.componentType}`);
    console.log(`   Variation: ${result.variationNumber}`);
    console.log(`   HTML Size: ${result.html.length} characters`);
    
    return result;
  }
}

// Usage example:
// const transformer = new ComponentTransformerExample();
// const result = await transformer.transformComponentForDeployment(myComponent);
// console.log(result.html); // Complete HTML ready for deployment
