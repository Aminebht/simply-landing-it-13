import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { LandingPageService } from './landing-page';
import { NetlifyService } from './netlify';

export class ReactDeploymentService {
  private netlifyService: NetlifyService;

  constructor(netlifyToken: string) {
    this.netlifyService = new NetlifyService(netlifyToken);
  }

  async deployLandingPage(pageId: string): Promise<{ url: string; siteId: string }> {
    try {
      console.log('Starting React-based deployment for page:', pageId);

      // 1. Fetch the landing page data with components
      const landingPageService = LandingPageService.getInstance();
      const pageData = await landingPageService.getLandingPageWithComponents(pageId);

      if (!pageData || !pageData.components) {
        throw new Error('No page data or components found');
      }

      console.log('Fetched page data:', {
        pageId: pageData.id,
        componentsCount: pageData.components.length,
        globalTheme: pageData.global_theme
      });

      // 2. Generate React-based HTML
      const html = await this.generateReactHTML(pageData);

      // 3. Generate supporting assets
      const { css, js } = this.generateAssets(pageData);

      // 4. Create deployment package
      const files = {
        'index.html': html,
        'styles.css': css,
        'app.js': js
      };

      // 5. Create new site and deploy to Netlify
      console.log('Creating new Netlify site...');
      const siteInfo = await this.netlifyService.createSite({
        site_name: `${pageData.slug}`,
        custom_domain: undefined,
        build_command: undefined,
        publish_directory: undefined
      });

      console.log('Deploying to Netlify site:', siteInfo.site_id);
      const deploymentResult = await this.netlifyService.deploySite(
        siteInfo.site_id,
        files
      );

      console.log('Deployment successful:', deploymentResult.deploy_url);
      return {
        url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url,
        siteId: deploymentResult.site_id
      };

    } catch (error) {
      console.error('React deployment failed:', error);
      throw error;
    }
  }

  private async generateReactHTML(pageData: any): Promise<string> {
    try {
      // Sort components by order_index
      const sortedComponents = (pageData.components || []).sort(
        (a: LandingPageComponent, b: LandingPageComponent) => a.order_index - b.order_index
      );

      console.log('Rendering components:', sortedComponents.map(c => ({
        id: c.id,
        type: c.component_variation?.component_type,
        variation: c.component_variation?.variation_number
      })));

      // Create the main page component
      const PageComponent = React.createElement('div', {
        id: 'landing-page',
        'data-section-id': 'page-root',
        style: {
          fontFamily: pageData.global_theme?.fontFamily || 'Inter, sans-serif',
          direction: pageData.global_theme?.direction || 'ltr',
          backgroundColor: pageData.global_theme?.backgroundColor || '#ffffff'
        }
      }, 
        // Render each component using ComponentRenderer (same as builder)
        sortedComponents.map((component: LandingPageComponent) => {
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
            isEditing: false, // Critical: set to false for deployed version
            viewport: 'desktop',
            globalTheme: pageData.global_theme || {
              primaryColor: '#3b82f6',
              secondaryColor: '#f3f4f6',
              backgroundColor: '#ffffff',
              fontFamily: 'Inter, sans-serif',
              direction: 'ltr',
              language: 'en'
            },
            customStyles: component.custom_styles,
            componentId: component.id,
            customActions: component.custom_actions || {}
          }));
        }).filter(Boolean)
      );

      // Suppress SSR warnings during renderToStaticMarkup
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('useLayoutEffect does nothing on the server')) {
          return; // Suppress SSR layout effect warnings
        }
        originalConsoleError.apply(console, args);
      };

      try {
        // Render to static HTML string
        const componentHTML = ReactDOMServer.renderToStaticMarkup(PageComponent);

        // Create complete HTML document
        const html = `<!DOCTYPE html>
<html lang="${pageData.global_theme?.language || 'en'}" dir="${pageData.global_theme?.direction || 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.seo_config?.title || pageData.slug}</title>
  <link rel="stylesheet" href="styles.css">
  ${this.generateGoogleFontsLink(pageData)}
  ${this.generateTailwindCSS()}
</head>
<body>
  ${componentHTML}
  <script src="app.js"></script>
</body>
</html>`;

        return html;
      } finally {
        // Restore original console.error
        console.error = originalConsoleError;
      }

    } catch (error) {
      console.error('Failed to generate React HTML:', error);
      throw new Error(`React HTML generation failed: ${error.message}`);
    }
  }

  private generateGoogleFontsLink(pageData: any): string {
    // Extract all unique Google Fonts from components
    const fontUrls = new Set<string>();
    
    // Add global theme fonts
    if (pageData.global_theme?.headingFont?.googleFontUrl) {
      fontUrls.add(pageData.global_theme.headingFont.googleFontUrl);
    }
    if (pageData.global_theme?.bodyFont?.googleFontUrl) {
      fontUrls.add(pageData.global_theme.bodyFont.googleFontUrl);
    }

    // Add component-specific fonts
    pageData.components?.forEach((component: LandingPageComponent) => {
      const customStyles = component.custom_styles || {};
      Object.values(customStyles).forEach((styles: any) => {
        if (styles?.headingFont?.googleFontUrl) {
          fontUrls.add(styles.headingFont.googleFontUrl);
        }
        if (styles?.bodyFont?.googleFontUrl) {
          fontUrls.add(styles.bodyFont.googleFontUrl);
        }
      });
    });

    // Generate link tags
    return Array.from(fontUrls)
      .map(url => `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`)
      .join('\n  ');
  }

  private generateTailwindCSS(): string {
    // Include Tailwind CSS via CDN for consistent styling
    return `<script src="https://cdn.tailwindcss.com"></script>
<style>
  /* Custom styles for deployed landing page */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: Inter, sans-serif;
    line-height: 1.6;
    color: #1a202c;
  }
  
  /* Ensure buttons and interactions work */
  button, [role="button"] {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  button:hover, [role="button"]:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  /* Form styling */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }
  
  /* Responsive utilities */
  @media (max-width: 768px) {
    .container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
</style>`;
  }

  private generateAssets(pageData: any): { css: string; js: string } {
    // Generate CSS for custom styles
    const css = this.generateCustomCSS(pageData);
    
    // Generate JavaScript for interactivity
    const js = this.generateInteractivityJS(pageData);

    return { css, js };
  }

  private generateCustomCSS(pageData: any): string {
    let css = `/* Generated styles for ${pageData.slug} */\n`;

    // Add global theme styles
    if (pageData.global_theme) {
      css += `
:root {
  --primary-color: ${pageData.global_theme.primaryColor || '#3b82f6'};
  --secondary-color: ${pageData.global_theme.secondaryColor || '#f3f4f6'};
  --background-color: ${pageData.global_theme.backgroundColor || '#ffffff'};
  --font-family: ${pageData.global_theme.fontFamily || 'Inter, sans-serif'};
}

body {
  background-color: var(--background-color);
  font-family: var(--font-family);
  color: #1a202c;
}
`;
    }

    // Add component-specific styles
    pageData.components?.forEach((component: LandingPageComponent, index: number) => {
      const customStyles = component.custom_styles || {};
      
      Object.entries(customStyles).forEach(([elementId, styles]: [string, any]) => {
        if (!styles || typeof styles !== 'object') return;

        css += `
/* Component ${component.id} - Element ${elementId} */
#section-${component.id} [data-element="${elementId}"] {`;

        Object.entries(styles).forEach(([property, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            // Convert camelCase to kebab-case
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `\n  ${cssProperty}: ${value};`;
          }
        });

        css += '\n}\n';
      });
    });

    return css;
  }

  private generateInteractivityJS(pageData: any): string {
    return `
// Interactive functionality for deployed landing page
(function() {
  'use strict';

  // Button click handlers
  function handleButtonClick(button) {
    const action = button.dataset.action;
    const actionData = button.dataset.actionData;
    
    if (!action) return;

    switch (action) {
      case 'navigate':
        if (actionData) {
          window.open(actionData, '_blank');
        }
        break;
        
      case 'checkout':
        try {
          const data = JSON.parse(actionData || '{}');
          handleCheckout(data);
        } catch (e) {
          console.error('Invalid checkout data:', e);
        }
        break;
        
      case 'scroll':
        if (actionData) {
          const target = document.getElementById(actionData);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
        break;
        
      default:
        console.log('Button action:', action, actionData);
    }
  }

  // Checkout handler
  function handleCheckout(data) {
    if (data.checkoutUrl) {
      window.open(data.checkoutUrl, '_blank');
    } else if (data.productId) {
      // Handle marketplace checkout
      const checkoutUrl = \`https://yourdomain.com/checkout/\${data.productId}\`;
      window.open(checkoutUrl, '_blank');
    }
  }

  // Form submission handlers
  function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Send form data to your backend
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (response.ok) {
        alert('Thank you for your message!');
        form.reset();
      } else {
        alert('Something went wrong. Please try again.');
      }
    }).catch(error => {
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again.');
    });
  }

  // Initialize event listeners
  document.addEventListener('DOMContentLoaded', function() {
    // Button click listeners
    document.querySelectorAll('button[data-action], [role="button"][data-action]').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        handleButtonClick(this);
      });
    });

    // Form submission listeners
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(this);
      });
    });

    // Scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('[data-section-id]').forEach(section => {
      observer.observe(section);
    });
  });

  // Add CSS animation classes
  const style = document.createElement('style');
  style.textContent = \`
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  \`;
  document.head.appendChild(style);
})();
`;
  }
}
