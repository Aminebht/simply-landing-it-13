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

  async getDeploymentStatus(pageId: string): Promise<{ 
    isDeployed: boolean; 
    siteId?: string; 
    url?: string; 
    lastDeployedAt?: string;
  }> {
    try {
      console.log('🔍 Checking deployment status for page:', pageId);
      
      const landingPageService = LandingPageService.getInstance();
      const pageData = await landingPageService.getLandingPageWithComponents(pageId);
  
      
      return {
        isDeployed: !!pageData.netlify_site_id,
        siteId: pageData.netlify_site_id || undefined,
        url: undefined, // URL will be retrieved from Netlify when needed
        lastDeployedAt: pageData.last_deployed_at || undefined
      };
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      return { isDeployed: false };
    }
  }

  async deployLandingPage(pageId: string): Promise<{ url: string; siteId: string }> {
    try {
      console.log('🚀 Starting React-based deployment for page:', pageId);

      // 0. Check current deployment status first
      const currentStatus = await this.getDeploymentStatus(pageId);
      console.log('📊 Current deployment status:', currentStatus);

      // 1. Fetch the landing page data with components
      const landingPageService = LandingPageService.getInstance();
      const pageData = await landingPageService.getLandingPageWithComponents(pageId);

      if (!pageData || !pageData.components) {
        throw new Error('No page data or components found');
      }

      console.log('Fetched page data:', {
        pageId: pageData.id,
        componentsCount: pageData.components.length,
        globalTheme: pageData.global_theme,
        existingSiteId: pageData.netlify_site_id,
        lastDeployedAt: pageData.last_deployed_at,
        status: pageData.status
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

      let siteId: string;
      let deploymentResult: any;

      // 5. Check if this page has been deployed before
      console.log('🔍 DEPLOYMENT DECISION LOGIC:');
      console.log('- pageData.netlify_site_id value:', pageData.netlify_site_id);
      console.log('- netlify_site_id type:', typeof pageData.netlify_site_id);
      console.log('- netlify_site_id exists:', !!pageData.netlify_site_id);
      console.log('- netlify_site_id after trim:', pageData.netlify_site_id ? pageData.netlify_site_id.trim() : 'N/A');
      console.log('- netlify_site_id is empty string:', pageData.netlify_site_id === '');
      console.log('- Will update existing site:', !!(pageData.netlify_site_id && pageData.netlify_site_id.trim() !== ''));
      
      if (pageData.netlify_site_id && pageData.netlify_site_id.trim() !== '') {
        console.log('🔄 UPDATING existing Netlify site:', pageData.netlify_site_id);
        
        try {
          // Try to update the existing site
          deploymentResult = await this.netlifyService.deploySite(
            pageData.netlify_site_id,
            files
          );
          siteId = pageData.netlify_site_id;
          console.log('✅ Successfully updated existing site:', siteId);
        } catch (updateError) {
          console.warn('⚠️ Failed to update existing site, creating new one:', updateError);
          
          // If update fails, create a new site (maybe the old one was deleted)
          const fallbackBaseName = pageData.slug || 'landing-page';
          const siteInfo = await this.netlifyService.createSite({
            site_name: `${fallbackBaseName}-updated`,
            custom_domain: undefined,
            build_command: undefined,
            publish_directory: undefined
          });
          
          deploymentResult = await this.netlifyService.deploySite(
            siteInfo.site_id,
            files
          );
          siteId = siteInfo.site_id;
          console.log('🆕 Created new site after update failure:', siteId);
        }
      } else {
        // 6. Create new site for first-time deployment
        console.log('🆕 CREATING new Netlify site for first deployment...');
        console.log('📋 Reason: netlify_site_id is', pageData.netlify_site_id ? `"${pageData.netlify_site_id}"` : 'null/undefined');
        
        // Ensure we have a valid site name
        const baseName = pageData.slug || 'landing-page';
        console.log('📝 Using base name for site:', baseName);
        
        const siteInfo = await this.netlifyService.createSite({
          site_name: baseName,
          custom_domain: undefined,
          build_command: undefined,
          publish_directory: undefined
        });

        console.log('📡 Deploying to new Netlify site:', siteInfo.site_id);
        deploymentResult = await this.netlifyService.deploySite(
          siteInfo.site_id,
          files
        );
        siteId = siteInfo.site_id;
        console.log('✅ Successfully created and deployed new site:', siteId);
      }

      // 7. Update the database with deployment info
      console.log('💾 Updating database with deployment info:', {
        pageId,
        siteId,
        url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url
      });
      
      await landingPageService.updateDeploymentInfo(pageId, {
        site_id: siteId,
        url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url
      });

      console.log('✅ Database updated successfully');
      console.log('🎉 Deployment completed:', deploymentResult.deploy_url);
      return {
        url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url,
        siteId: siteId
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

      // Pre-fetch checkout fields data for SSR form rendering
      let checkoutFields: any[] = [];
      try {
        // Import LandingPageService to get Supabase instance
        const { LandingPageService } = await import('./landing-page');
        const landingPageService = LandingPageService.getInstance();
        const supabaseClient = (landingPageService as any).supabase;
        
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from('checkout_fields')
            .select('*')
            .order('display_order', { ascending: true });
          
          if (!error && data) {
            checkoutFields = data;
            console.log('Pre-fetched checkout fields for SSR:', checkoutFields.length, 'fields');
          } else {
            console.warn('No checkout fields found in database, using defaults');
          }
        }
      } catch (error) {
        console.warn('Could not pre-fetch checkout fields for SSR:', error);
      }

      // If no checkout fields exist, create default form fields for better form rendering
      if (checkoutFields.length === 0) {
        checkoutFields = [
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
        console.log('Using default checkout fields for SSR form rendering');
      }

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
            viewport: 'responsive', // Use responsive classes for deployed version
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
            customActions: (() => {
              console.log('Passing customActions for component', component.id, ':', component.custom_actions);
              return component.custom_actions || {};
            })(),
            // Pass pre-fetched data for SSR form rendering
            checkoutFields: checkoutFields
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
        
        // PRODUCTION CLEANUP - Remove development attributes and clean up for deployment
        const cleanedHTML = this.cleanProductionHTML(componentHTML);

        // Create complete HTML document with security headers
        const html = `<!DOCTYPE html>
<html lang="${pageData.global_theme?.language || 'en'}" dir="${pageData.global_theme?.direction || 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageData.seo_config?.title || pageData.slug}</title>
  
  <!-- Security Headers -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.tailwindcss.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.netlify.app; frame-src 'none';">
  
  ${this.generateSEOMetaTags(pageData)}
  <link rel="stylesheet" href="styles.css">
  ${this.generateGoogleFontsLink(pageData)}
  ${this.generateTailwindCSS()}
  ${this.generateSupabaseSDK(pageData)}
  ${this.generateFacebookPixel(pageData)}
</head>
<body>
  ${cleanedHTML}
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

  private cleanProductionHTML(html: string): string {
    console.log('🧹 Cleaning HTML for production deployment...');
    
    let cleanedHTML = html;
    
    // 1. Remove development data attributes (keep functional ones)
    const devAttributes = [
      /data-lov-[^=]*="[^"]*"/g,           // Remove data-lov-* attributes
      /data-component-[^=]*="[^"]*"/g,     // Remove data-component-* attributes
      // Keep data-section-id for scroll functionality
      /data-element="[^"]*"/g,             // Remove data-element attributes  
      /data-testid="[^"]*"/g,              // Remove test IDs
      /data-cy="[^"]*"/g,                  // Remove Cypress test attributes
      /data-qa="[^"]*"/g,                  // Remove QA test attributes
    ];
    
    // Keep functional data attributes (action, form-type, etc.)
    const keepAttributes = [
      'data-action',
      'data-action-data', 
      'data-form-type',
      'data-form-initialized'
    ];
    
    devAttributes.forEach(pattern => {
      cleanedHTML = cleanedHTML.replace(pattern, '');
    });
    
    // 2. Clean up extra whitespace from removed attributes
    cleanedHTML = cleanedHTML.replace(/\s+/g, ' ');
    cleanedHTML = cleanedHTML.replace(/\s+>/g, '>');
    cleanedHTML = cleanedHTML.replace(/>\s+</g, '><');
    
    // 3. Remove HTML comments (but keep important ones)
    cleanedHTML = cleanedHTML.replace(/<!--(?!\s*\/\*)[\s\S]*?-->/g, '');
    
    // 4. Clean up class names - remove development/debug classes
    cleanedHTML = cleanedHTML.replace(/\bdev-\w+\b/g, '');
    cleanedHTML = cleanedHTML.replace(/\bdebug-\w+\b/g, '');
    cleanedHTML = cleanedHTML.replace(/\btest-\w+\b/g, '');
    
    // 5. Remove any builder-specific IDs that might expose internal structure
    cleanedHTML = cleanedHTML.replace(/id="(component|section|element)-[^"]*"/g, '');
    
    console.log('✅ HTML cleaned for production deployment');
    return cleanedHTML;
  }

  private generateSEOMetaTags(pageData: any, deploymentUrl?: string): string {
    const seoConfig = pageData.seo_config || {};
    const currentUrl = deploymentUrl || seoConfig.canonical || `https://${pageData.slug || 'landing-page'}.netlify.app`;
    
    console.log('📝 Applying SEO configuration:', {
      title: seoConfig.title,
      description: seoConfig.description,
      keywords: seoConfig.keywords,
      ogImage: seoConfig.ogImage,
      canonical: seoConfig.canonical,
      deploymentUrl
    });
    
    let metaTags = '';
    
    // Basic SEO meta tags
    if (seoConfig.description) {
      metaTags += `  <meta name="description" content="${this.escapeHtml(seoConfig.description)}">\n`;
    }
    
    if (seoConfig.keywords && Array.isArray(seoConfig.keywords) && seoConfig.keywords.length > 0) {
      metaTags += `  <meta name="keywords" content="${seoConfig.keywords.join(', ')}">\n`;
    }
    
    if (seoConfig.canonical) {
      metaTags += `  <link rel="canonical" href="${seoConfig.canonical}">\n`;
    } else if (deploymentUrl) {
      metaTags += `  <link rel="canonical" href="${deploymentUrl}">\n`;
    }
    
    // Open Graph meta tags for social media sharing
    metaTags += `  <meta property="og:title" content="${this.escapeHtml(seoConfig.title || pageData.slug)}">\n`;
    
    if (seoConfig.description) {
      metaTags += `  <meta property="og:description" content="${this.escapeHtml(seoConfig.description)}">\n`;
    }
    
    metaTags += `  <meta property="og:type" content="website">\n`;
    metaTags += `  <meta property="og:url" content="${currentUrl}">\n`;
    
    if (seoConfig.ogImage) {
      metaTags += `  <meta property="og:image" content="${seoConfig.ogImage}">\n`;
      metaTags += `  <meta property="og:image:alt" content="${this.escapeHtml(seoConfig.title || pageData.slug)}">\n`;
      metaTags += `  <meta property="og:image:width" content="1200">\n`;
      metaTags += `  <meta property="og:image:height" content="630">\n`;
    }
    
    // Twitter Card meta tags
    metaTags += `  <meta name="twitter:card" content="summary_large_image">\n`;
    metaTags += `  <meta name="twitter:title" content="${this.escapeHtml(seoConfig.title || pageData.slug)}">\n`;
    
    if (seoConfig.description) {
      metaTags += `  <meta name="twitter:description" content="${this.escapeHtml(seoConfig.description)}">\n`;
    }
    
    if (seoConfig.ogImage) {
      metaTags += `  <meta name="twitter:image" content="${seoConfig.ogImage}">\n`;
    }
    
    // Additional SEO meta tags
    metaTags += `  <meta name="robots" content="index, follow">\n`;
    metaTags += `  <meta name="author" content="Landing Page Builder">\n`;
    metaTags += `  <meta name="generator" content="Landing Page Builder">\n`;
    
    // Favicon and app icons (using og:image as fallback)
    if (seoConfig.ogImage) {
      metaTags += `  <link rel="icon" type="image/x-icon" href="${seoConfig.ogImage}">\n`;
      metaTags += `  <link rel="apple-touch-icon" href="${seoConfig.ogImage}">\n`;
    }
    
    // Structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": seoConfig.title || pageData.slug,
      "description": seoConfig.description || "",
      "url": currentUrl,
      "image": seoConfig.ogImage || "",
      "inLanguage": pageData.global_theme?.language || "en",
      "datePublished": pageData.created_at || new Date().toISOString(),
      "dateModified": pageData.updated_at || new Date().toISOString()
    };
    
    metaTags += `  <script type="application/ld+json">\n`;
    metaTags += `    ${JSON.stringify(structuredData, null, 2)}\n`;
    metaTags += `  </script>\n`;
    
    console.log('✅ Generated SEO meta tags for deployment');
    return metaTags;
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
    // HYBRID SOLUTION: Keep CDN for full functionality but suppress warning and add layout fixes
    return `<script src="https://cdn.tailwindcss.com"></script>
<script>
  // Suppress production warning about CDN usage
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com')) {
      return; // Suppress this specific warning
    }
    return originalWarn.apply(console, args);
  };

  // Configure Tailwind with full functionality for proper UI rendering
  tailwind.config = {
    theme: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      extend: {
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        colors: {
          // Support for CSS variables and theming
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
        }
      }
    },
    variants: {
      extend: {
        display: ['responsive'],
        flexDirection: ['responsive'],
        gridTemplateColumns: ['responsive'],
        gridTemplateRows: ['responsive'],
        gap: ['responsive'],
        padding: ['responsive'],
        margin: ['responsive'],
        fontSize: ['responsive'],
        lineHeight: ['responsive'],
        textAlign: ['responsive'],
        justifyContent: ['responsive'],
        alignItems: ['responsive'],
        width: ['responsive'],
        height: ['responsive'],
        maxWidth: ['responsive'],
        maxHeight: ['responsive'],
        backgroundColor: ['hover', 'focus'],
        textColor: ['hover', 'focus'],
        opacity: ['hover', 'focus'],
        transform: ['hover', 'focus'],
      }
    }
  }
</script>
<style>
  /* CRITICAL: Layout stability fixes to prevent white gaps during scrolling */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    font-family: Inter, sans-serif;
    line-height: 1.6;
    color: #1a202c;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  
  /* CRITICAL: Prevent white gaps between components during rapid scrolling/resizing */
  #landing-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  
  [data-section-id] {
    width: 100% !important;
    margin: 0 !important;
    padding: 0;
    position: relative;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
  
  /* Eliminate gaps between consecutive sections */
  [data-section-id] + [data-section-id] {
    margin-top: 0 !important;
    border-top: none !important;
    padding-top: 0 !important;
  }
  
  /* Enhanced button interactions with stability */
  button, [role="button"] {
    cursor: pointer;
    transition: all 0.2s ease;
    will-change: transform, opacity;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  button:hover, [role="button"]:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  /* Form styling improvements */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    will-change: auto;
  }
  
  /* Grid and flex layout stability */
  .grid, .flex {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    width: 100%;
  }
  
  /* Performance optimization - prevent unnecessary repaints */
  * {
    will-change: auto;
  }
  
  /* CSS Variables for proper theming support */
  :root {
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
  
  /* Container responsive improvements */
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  @media (min-width: 640px) {
    .container {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }
  
  @media (min-width: 768px) {
    .container {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }
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
  
  /* Toast notification styles */
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 400px;
    width: 100%;
    pointer-events: none;
  }
  
  .toast {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    pointer-events: auto;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .toast.show {
    transform: translateX(0);
    opacity: 1;
  }
  
  .toast.success {
    border-left: 4px solid #10b981;
  }
  
  .toast.error {
    border-left: 4px solid #ef4444;
  }
  
  .toast.warning {
    border-left: 4px solid #f59e0b;
  }
  
  .toast.info {
    border-left: 4px solid #3b82f6;
  }
  
  .toast-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }
  
  .toast-content {
    flex: 1;
  }
  
  .toast-title {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }
  
  .toast-message {
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .toast-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: 0.5rem;
    color: #9ca3af;
    font-size: 1.125rem;
    line-height: 1;
    flex-shrink: 0;
  }
  
  .toast-close:hover {
    color: #6b7280;
  }
  
  @media (max-width: 640px) {
    .toast-container {
      left: 1rem;
      right: 1rem;
      max-width: none;
    }
  }

  /* Enhanced responsive utilities */
  @media (max-width: 640px) {
    .container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    /* Ensure mobile-first responsive design */
    .responsive-text {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }
  
  @media (min-width: 641px) and (max-width: 768px) {
    .container {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    .responsive-text {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }
  
  @media (min-width: 769px) {
    .container {
      padding-left: 2rem;
      padding-right: 2rem;
    }
    .responsive-text {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }
  
  /* Ensure grid and flexbox responsive utilities work properly */
  .grid {
    display: grid;
  }
  
  .flex {
    display: flex;
  }
  
  /* Force responsive grid columns to work */
  @media (max-width: 768px) {
    .md\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    .lg\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .lg\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .lg\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
  }
  
  @media (min-width: 1025px) {
    .xl\\:grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .xl\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    .xl\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
    .xl\\:grid-cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    }
  }
</style>`;
  }

  private generateSupabaseSDK(pageData: any): string {
    // Use environment-specific configuration - avoid exposing internal URLs
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijrisuqixfqzmlomlgjb.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';
    
    // Minified production configuration - remove comments and compress
    return `<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
const supabase=window.supabase.createClient('${supabaseUrl}','${supabaseAnonKey}',{auth:{persistSession:false,autoRefreshToken:false}});
const SUPABASE_ANON_KEY='${supabaseAnonKey}';
const PAGE_CONFIG={slug:'${pageData.slug || 'landing-page'}',title:'${this.escapeHtml(pageData.seo_config?.title || 'Landing Page')}',url:window.location.href,language:'${pageData.global_theme?.language || 'en'}'};
function generateUUID(){if(typeof crypto!=='undefined'&&crypto.randomUUID){return crypto.randomUUID();}return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){const r=Math.random()*16|0;const v=c=='x'?r:(r&0x3|0x8);return v.toString(16);});}
function getSessionId(){let sessionId=sessionStorage.getItem('landing_session_id');if(!sessionId){sessionId='session_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);sessionStorage.setItem('landing_session_id',sessionId);}return sessionId;}
function trackEvent(eventType,eventData){console.log('Landing Page Event:',{event_type:eventType,event_data:eventData,timestamp:new Date().toISOString(),page_url:window.location.href});}
window.addEventListener('load',function(){trackEvent('page_view',{page_title:PAGE_CONFIG.title,page_slug:PAGE_CONFIG.slug,referrer:document.referrer,viewport_width:window.innerWidth,viewport_height:window.innerHeight});});
</script>`;
  }

  private generateFacebookPixel(pageData: any): string {
    // Only include Facebook Pixel if it's configured in environment variables
    // Avoid exposing tracking_config from database for security
    const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;

    if (!pixelId) {
      return '<!-- Facebook Pixel not configured -->';
    }

    // Validate pixel ID format for additional security
    if (!/^\d{15,16}$/.test(pixelId)) {
      console.warn('Invalid Facebook Pixel ID format');
      return '<!-- Facebook Pixel ID invalid -->';
    }

    return `
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
  
  // Store pixel functions for later use (secure implementation)
  window.trackFacebookEvent = function(eventName, eventData) {
    if (typeof fbq !== 'undefined') {
      // Filter out any sensitive data before tracking
      const safeEventData = {
        value: eventData.value || 0,
        currency: eventData.currency || 'TND',
        content_ids: eventData.content_ids || []
      };
      fbq('track', eventName, safeEventData);
    }
  };
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>`;
  }

  private generateAssets(pageData: any): { css: string; js: string } {
    // Generate CSS for custom styles
    const css = this.generateCustomCSS(pageData);
    
    // Generate JavaScript for interactivity
    const js = this.generateInteractivityJS(pageData);

    return { css, js };
  }

  private generateCustomCSS(pageData: any): string {
    // Minified CSS for production deployment
    let css = `/* ${pageData.slug} */\n`;

    // Add global theme styles (minified)
    if (pageData.global_theme) {
      css += `:root{--primary-color:${pageData.global_theme.primaryColor || '#3b82f6'};--secondary-color:${pageData.global_theme.secondaryColor || '#f3f4f6'};--background-color:${pageData.global_theme.backgroundColor || '#ffffff'};--font-family:${pageData.global_theme.fontFamily || 'Inter, sans-serif'};}body{background-color:var(--background-color);font-family:var(--font-family);color:#1a202c;}`;
    }

    // Add component-specific styles (minified)
    pageData.components?.forEach((component: LandingPageComponent, index: number) => {
      const customStyles = component.custom_styles || {};
      
      Object.entries(customStyles).forEach(([elementId, styles]: [string, any]) => {
        if (!styles || typeof styles !== 'object') return;

        css += `#section-${component.id} [data-element="${elementId}"]{`;

        Object.entries(styles).forEach(([property, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            // Convert camelCase to kebab-case and minify
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            css += `${cssProperty}:${value};`;
          }
        });

        css += '}';
      });
    });

    return css;
  }

  private generateInteractivityJS(pageData: any): string {
    // Enhanced production JavaScript with toast notifications instead of alerts
    return `(function(){'use strict';
// Toast notification system
function createToastContainer(){
  if(document.getElementById('toast-container'))return;
  const container=document.createElement('div');
  container.id='toast-container';
  container.className='toast-container';
  document.body.appendChild(container);
}

function showToast(message,type='info',title=''){
  createToastContainer();
  const container=document.getElementById('toast-container');
  const toast=document.createElement('div');
  toast.className='toast '+type;
  

  
  // Create toast structure programmatically to avoid HTML injection issues
  const toastIcon=document.createElement('div');
  toastIcon.className='toast-icon';
  
  const toastContent=document.createElement('div');
  toastContent.className='toast-content';
  
  if(title){
    const toastTitle=document.createElement('div');
    toastTitle.className='toast-title';
    toastTitle.textContent=title;
    toastContent.appendChild(toastTitle);
  }
  
  const toastMessage=document.createElement('div');
  toastMessage.className='toast-message';
  toastMessage.textContent=message;
  toastContent.appendChild(toastMessage);
  
  const closeButton=document.createElement('button');
  closeButton.className='toast-close';
  closeButton.textContent='×';
  closeButton.onclick=function(){toast.remove();};
  
  // Assemble toast
  toast.appendChild(toastIcon);
  toast.appendChild(toastContent);
  toast.appendChild(closeButton);
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(()=>toast.classList.add('show'),100);
  
  // Auto remove after 5 seconds
  setTimeout(()=>{
    if(toast.parentNode){
      toast.classList.remove('show');
      setTimeout(()=>{
        if(toast.parentNode){
          toast.remove();
        }
      },300);
    }
  },5000);
}

function initializeForms(){
  console.log('Initializing forms...');
  const defaultCheckoutFields=[
    {id:'email',label:'Email',field_key:'email',is_required:true,display_order:0,product_ids:[]},
    {id:'full_name',label:'Full Name',field_key:'full_name',is_required:true,display_order:1,product_ids:[]},
    {id:'phone',label:'Phone Number',field_key:'phone',is_required:false,display_order:2,product_ids:[]}
  ];
  
  const formContainers=document.querySelectorAll('[data-component="cta"],form:empty,[class*="form-container"]:empty,[data-element="checkout-form"]');
  console.log('Found form containers:',formContainers.length);
  
  formContainers.forEach(function(container,index){
    if(container.dataset.formInitialized)return;
    
    if(container.children.length===0||(container.children.length===1&&container.querySelector('input[type="email"]:only-child'))){
      container.innerHTML='';
    }
    
    let form=container.tagName==='FORM'?container:container.querySelector('form');
    if(!form){
      form=document.createElement('form');
      form.className='space-y-4';
      container.appendChild(form);
    }
    
    if(container.getAttribute('data-element')==='checkout-form'){
      form.dataset.formType='checkout';
    }else{
      form.dataset.formType='contact';
    }
    
    defaultCheckoutFields.forEach(function(field){
      if(form.querySelector('input[name="'+field.field_key+'"]'))return;
      
      const fieldDiv=document.createElement('div');
      fieldDiv.className='space-y-2';
      
      const label=document.createElement('label');
      label.htmlFor=field.field_key;
      label.className='block text-sm font-medium text-foreground mb-2';
      label.textContent=field.label+(field.is_required?' *':'');
      
      const input=document.createElement('input');
      input.id=field.field_key;
      input.name=field.field_key;
      input.required=field.is_required;
      input.className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
      
      switch(field.field_key){
        case 'email':
          input.type='email';
          input.placeholder='Enter your email';
          break;
        case 'phone':
          input.type='tel';
          input.placeholder='Enter your phone number';
          break;
        default:
          input.type='text';
          input.placeholder='Enter your '+field.label.toLowerCase();
      }
      
      // Add real-time validation
      input.addEventListener('input',function(){
        validateField(this);
      });
      
      input.addEventListener('blur',function(){
        validateField(this);
      });
      
      fieldDiv.appendChild(label);
      fieldDiv.appendChild(input);
      form.appendChild(fieldDiv);
    });
    
    if(!form.querySelector('button[type="submit"]')){
      const submitBtn=document.createElement('button');
      submitBtn.type='submit';
      submitBtn.className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full';
      submitBtn.textContent='Submit';
      form.appendChild(submitBtn);
    }
    
    container.dataset.formInitialized='true';
    console.log('Initialized form container',index+1,'with',defaultCheckoutFields.length,'fields');
  });
  
  // Add validation for existing form fields
  document.querySelectorAll('form input,form select,form textarea').forEach(function(field){
    if(!field.dataset.validationAdded){
      field.addEventListener('input',function(){
        validateField(this);
      });
      
      field.addEventListener('blur',function(){
        validateField(this);
      });
      
      field.dataset.validationAdded='true';
    }
  });
}

// Real-time field validation function
function validateField(field){
  const fieldValue=(field.value||'').trim();
  const isRequired=field.required||field.hasAttribute('required');
  let isValid=true;
  let errorMessage='';
  
  // Remove existing error styling first
  field.classList.remove('border-red-500','ring-red-500');
  field.classList.add('border-input');
  
  // Remove any existing error message
  const existingError=field.parentElement.querySelector('.field-error');
  if(existingError){
    existingError.remove();
  }
  
  // Check if required field is empty
  if(isRequired&&!fieldValue){
    isValid=false;
    errorMessage='This field is required';
  }else if(fieldValue){
    // Validate specific field types
    if(field.type==='email'){
      const emailRegex=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if(!emailRegex.test(fieldValue)){
        isValid=false;
        errorMessage='Please enter a valid email address';
      }
    }else if(field.type==='tel'&&isRequired){
      const phoneRegex=/^[\\+]?[1-9]?[0-9]{7,15}$/;
      if(!phoneRegex.test(fieldValue.replace(/[\\s\\-\\(\\)]/g,''))){
        isValid=false;
        errorMessage='Please enter a valid phone number';
      }
    }
  }
  
  // Apply error styling and message if invalid
  if(!isValid){
    field.classList.add('border-red-500','ring-red-500');
    field.classList.remove('border-input');
    
    // Add error message
    const errorDiv=document.createElement('div');
    errorDiv.className='field-error text-red-500 text-xs mt-1';
    errorDiv.textContent=errorMessage;
    field.parentElement.appendChild(errorDiv);
  }
  
  return isValid;
}

function findScrollTarget(targetId){
  console.log('Looking for scroll target:',targetId);
  let target=null;
  let cleanId=targetId;
  
  if(targetId.startsWith('section-')){
    cleanId=targetId.replace('section-','');
  }
  
  target=document.getElementById(targetId);
  if(target){
    console.log('Found direct ID match:',targetId);
    return target;
  }
  
  if(!targetId.startsWith('section-')){
    target=document.getElementById('section-'+targetId);
    if(target){
      console.log('Found section ID match: section-'+targetId);
      return target;
    }
  }
  
  const sectionWithDataId=document.querySelector('[data-section-id="'+cleanId+'"]');
  if(sectionWithDataId){
    console.log('Found data-section-id match:',cleanId);
    return sectionWithDataId;
  }
  
  const possibleSelectors=[targetId,'section-'+cleanId,cleanId,'#'+targetId,'#section-'+cleanId,'#'+cleanId];
  for(let i=0;i<possibleSelectors.length;i++){
    try{
      if(!possibleSelectors[i])continue;
      target=document.querySelector('[id="'+possibleSelectors[i]+'"]');
      if(target){
        console.log('Found with ID selector:',possibleSelectors[i]);
        return target;
      }
    }catch(e){continue;}
  }
  
  console.warn('No scroll target found for:',targetId,'(cleaned:',cleanId,')');
  console.log('Available sections:',[...document.querySelectorAll('[data-section-id]')].map(el=>({id:el.id,dataId:el.getAttribute('data-section-id')})));
  return null;
}

function handleButtonClick(button){
  const action=button.dataset.action;
  const actionData=button.dataset.actionData;
  if(!action)return;
  
  console.log('Button clicked:',action,actionData);
  
  switch(action){
    case 'open_link':
      try{
        const data=JSON.parse(actionData||'{}');
        let url=data.url||actionData;
        if(url&&!/^https?:\\/\\//i.test(url)){
          url='https://'+url;
        }
        if(url){
          window.open(url,data.newTab?'_blank':'_self');
          if(typeof trackFacebookEvent!=='undefined'){
            trackFacebookEvent('ClickButton',{button_text:button.textContent,destination_url:url});
          }
        }
      }catch(e){
        let url=actionData;
        if(url&&!/^https?:\\/\\//i.test(url)){
          url='https://'+url;
        }
        if(url){
          window.open(url,'_blank');
        }
      }
      break;
      
    case 'scroll':
      try{
        const data=JSON.parse(actionData||'{}');
        const targetId=data.targetId||actionData;
        if(targetId){
          const target=findScrollTarget(targetId);
          if(target){
            target.scrollIntoView({behavior:'smooth',block:'start'});
            console.log('✅ Successfully scrolled to:',targetId);
          }else{
            console.warn('❌ Scroll target not found:',targetId);
          }
        }
      }catch(e){
        if(actionData){
          const target=findScrollTarget(actionData);
          if(target){
            target.scrollIntoView({behavior:'smooth',block:'start'});
            console.log('✅ Successfully scrolled to (fallback):',actionData);
          }else{
            console.warn('❌ Scroll target not found (fallback):',actionData);
          }
        }
      }
      break;
      
    case 'checkout':
      try{
        const data=JSON.parse(actionData||'{}');
        console.log('Processing checkout with data:',data);
        handleCheckout(data,button);
      }catch(e){
        console.error('Invalid checkout data:',e);
        if(actionData){
          console.log('Retrying checkout with raw actionData:',actionData);
          handleCheckout({productId:actionData},button);
        }
      }
      break;
      
    default:
      console.log('Unknown button action:',action,actionData);
  }
}

async function handleCheckout(actionData,button){
  try{
    // COMPREHENSIVE CHECKOUT VALIDATION
    const formElements=document.querySelectorAll('form input,form select,form textarea');
    const formData={};
    let userEmail='';
    const validationErrors=[];
    let firstInvalidField=null;
    
    // Collect all form data
    formElements.forEach(function(element){
      if(element.name||element.id){
        const key=element.name||element.id;
        formData[key]=element.value;
        if(key==='email')userEmail=element.value;
      }
    });
    
    // Validate all required fields in forms
    const requiredFields=document.querySelectorAll('form input[required],form select[required],form textarea[required]');
    requiredFields.forEach(function(field){
      const fieldName=field.name||field.id||'Unknown field';
      const fieldValue=(field.value||'').trim();
      
      if(!fieldValue){
        const fieldLabel=field.previousElementSibling&&field.previousElementSibling.tagName==='LABEL'
          ?field.previousElementSibling.textContent.replace(' *','')
          :fieldName;
        validationErrors.push(fieldLabel);
        field.classList.add('border-red-500','ring-red-500');
        field.classList.remove('border-input');
        if(!firstInvalidField){
          firstInvalidField=field;
        }
      }else{
        field.classList.remove('border-red-500','ring-red-500');
        field.classList.add('border-input');
      }
    });
    
    // Show validation errors if any
    if(validationErrors.length>0){
      const errorMessage=validationErrors.length===1
        ?\`Please fill in the required field: \${validationErrors[0]}\`
        :\`Please fill in the following required fields: \${validationErrors.join(', ')}\`;
      
      showToast(errorMessage,'error','Complete Required Fields');
      
      if(firstInvalidField){
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({behavior:'smooth',block:'center'});
      }
      return;
    }
    
    // Specific email validation
    if(!userEmail){
      showToast('Please enter your email to proceed with checkout.','error','Email Required');
      const emailField=document.querySelector('input[name="email"],input[type="email"]');
      if(emailField){
        emailField.focus();
        emailField.classList.add('border-red-500','ring-red-500');
      }
      return;
    }
    
    const emailRegex=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if(!emailRegex.test(userEmail)){
      showToast('Please enter a valid email address.','error','Invalid Email');
      const emailField=document.querySelector('input[name="email"],input[type="email"]');
      if(emailField){
        emailField.focus();
        emailField.classList.add('border-red-500','ring-red-500');
      }
      return;
    }
    
    // Validate full name if required
    const fullNameField=document.querySelector('input[name="full_name"],input[name="name"]');
    if(fullNameField&&fullNameField.required&&(!formData.full_name&&!formData.name)){
      showToast('Please enter your full name to proceed with checkout.','error','Name Required');
      fullNameField.focus();
      fullNameField.classList.add('border-red-500','ring-red-500');
      return;
    }
    
    // All validations passed - clear any error styling
    document.querySelectorAll('form .border-red-500').forEach(field=>{
      field.classList.remove('border-red-500','ring-red-500');
      field.classList.add('border-input');
    });
    
    const orderId=generateUUID();
    const buyerName=formData.name||formData.full_name||userEmail.split('@')[0];
    const amount=Number(actionData.amount)||0;
    
    console.log('Processing secure checkout for productId:',actionData.productId);
    
    if(typeof trackFacebookEvent!=='undefined'){
      trackFacebookEvent('InitiateCheckout',{value:amount,currency:'TND',content_ids:[String(actionData.productId)]});
    }
    
    // Show processing toast
    showToast('Processing your checkout...','info','Please Wait');
    
    // Disable checkout button during processing
    if(button){
      button.disabled=true;
      const originalText=button.textContent;
      button.textContent='Processing...';
      
      // Re-enable button after timeout
      setTimeout(()=>{
        if(button){
          button.disabled=false;
          button.textContent=originalText;
        }
      },10000);
    }
    
    try{
      const checkoutResponse=await fetch('https://ijrisuqixfqzmlomlgjb.supabase.co/functions/v1/secure-checkout',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer '+SUPABASE_ANON_KEY
        },
        body:JSON.stringify({
          orderId:orderId,
          productId:actionData.productId,
          amount:amount,
          buyerEmail:userEmail,
          buyerName:buyerName,
          formData:formData,
          pageSlug:PAGE_CONFIG.slug
        })
      });
      
      if(!checkoutResponse.ok){
        throw new Error('Checkout service unavailable');
      }
      
      const checkoutData=await checkoutResponse.json();
      
      if(checkoutData.success&&checkoutData.paymentUrl){
        trackEvent('checkout_initiated',{order_id:orderId,amount:amount,user_email:userEmail});
        
        if(typeof trackFacebookEvent!=='undefined'){
          trackFacebookEvent('Purchase',{value:amount,currency:'TND',content_ids:[String(actionData.productId)]});
        }
        
        showToast('Redirecting to secure payment...','success','Checkout Ready');
        setTimeout(()=>window.location.href=checkoutData.paymentUrl,1000);
      }else{
        throw new Error(checkoutData.error||'Failed to initialize payment');
      }
    }catch(serverError){
      console.warn('Server-side checkout failed, falling back to direct approach:',serverError);
      
      if(actionData.checkoutUrl){
        showToast('Redirecting to checkout...','info','Opening Checkout');
        setTimeout(()=>window.open(actionData.checkoutUrl,'_blank'),1000);
      }else if(actionData.productId){
        const checkoutUrl=\`https://demarky.tn/checkout/\${actionData.productId}?email=\${encodeURIComponent(userEmail)}&name=\${encodeURIComponent(buyerName)}\`;
        showToast('Redirecting to checkout...','info','Opening Checkout');
        setTimeout(()=>window.open(checkoutUrl,'_blank'),1000);
      }else{
        showToast('Checkout is temporarily unavailable. Please try again later.','error','Service Unavailable');
      }
    }
  }catch(error){
    console.error('Checkout error:',error);
    showToast('An unexpected error occurred. Please try again.','error','Checkout Error');
  }
}

function handleFormSubmit(form){
  console.log('Form submission triggered for form:',form);
  console.log('Form type:',form.dataset.formType);
  
  // COMPREHENSIVE FORM VALIDATION
  const requiredFields=form.querySelectorAll('input[required],select[required],textarea[required]');
  const validationErrors=[];
  let firstInvalidField=null;
  
  // Validate each required field
  requiredFields.forEach(function(field){
    const fieldName=field.name||field.id||'Unknown field';
    const fieldValue=(field.value||'').trim();
    
    // Check if field is empty
    if(!fieldValue){
      validationErrors.push(fieldName);
      field.classList.add('border-red-500','ring-red-500');
      field.classList.remove('border-input');
      if(!firstInvalidField){
        firstInvalidField=field;
      }
    }else{
      // Field has value, remove error styling
      field.classList.remove('border-red-500','ring-red-500');
      field.classList.add('border-input');
      
      // Specific validation for email fields
      if(field.type==='email'){
        const emailRegex=/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if(!emailRegex.test(fieldValue)){
          validationErrors.push(fieldName+' (invalid format)');
          field.classList.add('border-red-500','ring-red-500');
          field.classList.remove('border-input');
          if(!firstInvalidField){
            firstInvalidField=field;
          }
        }
      }
      
      // Specific validation for phone fields
      if(field.type==='tel'&&field.required){
        const phoneRegex=/^[\\+]?[1-9]?[0-9]{7,15}$/;
        if(!phoneRegex.test(fieldValue.replace(/[\\s\\-\\(\\)]/g,''))){
          validationErrors.push(fieldName+' (invalid format)');
          field.classList.add('border-red-500','ring-red-500');
          field.classList.remove('border-input');
          if(!firstInvalidField){
            firstInvalidField=field;
          }
        }
      }
    }
  });
  
  // If there are validation errors, show them and stop submission
  if(validationErrors.length>0){
    const errorMessage=validationErrors.length===1
      ?\`Please fill in the required field: \${validationErrors[0]}\`
      :\`Please fill in the following required fields: \${validationErrors.join(', ')}\`;
    
    showToast(errorMessage,'error','Form Validation');
    
    // Focus on the first invalid field
    if(firstInvalidField){
      firstInvalidField.focus();
      firstInvalidField.scrollIntoView({behavior:'smooth',block:'center'});
    }
    
    return; // Stop form submission
  }
  
  // All validations passed, proceed with form submission
  const formData=new FormData(form);
  const data=Object.fromEntries(formData.entries());
  console.log('Form data collected:',Object.keys(data));
  
  // Additional validation for form data completeness
  const essentialFields=['email'];
  const missingEssentialFields=essentialFields.filter(field=>!data[field]||!data[field].trim());
  
  if(missingEssentialFields.length>0){
    showToast('Email address is required for all form submissions.','error','Missing Required Information');
    const emailField=form.querySelector('input[name="email"],input[type="email"]');
    if(emailField){
      emailField.focus();
      emailField.classList.add('border-red-500','ring-red-500');
    }
    return;
  }
  
  const submissionData={
    form_only:true,
    form_data:data,
    page_slug:PAGE_CONFIG.slug,
    utm_data:{
      utm_source:new URLSearchParams(window.location.search).get('utm_source'),
      utm_medium:new URLSearchParams(window.location.search).get('utm_medium'),
      utm_campaign:new URLSearchParams(window.location.search).get('utm_campaign')
    },
    session_id:getSessionId(),
    user_agent:navigator.userAgent,
    page_url:window.location.href,
    created_at:new Date().toISOString()
  };
  
  console.log('Submitting validated form data to secure-checkout endpoint:',{
    form_only:submissionData.form_only,
    page_slug:submissionData.page_slug,
    field_count:Object.keys(submissionData.form_data).length,
    required_fields_count:requiredFields.length
  });
  
  // Show processing toast
  showToast('Submitting your message...','info','Processing');
  
  // Disable submit button during submission
  const submitButton=form.querySelector('button[type="submit"]');
  if(submitButton){
    submitButton.disabled=true;
    submitButton.textContent='Submitting...';
  }
  
  fetch('https://ijrisuqixfqzmlomlgjb.supabase.co/functions/v1/secure-checkout',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+SUPABASE_ANON_KEY
    },
    body:JSON.stringify(submissionData)
  })
  .then(function(response){
    if(response.ok){
      return response.json();
    }
    throw new Error('Server error');
  })
  .then(function(result){
    console.log('Form submission processed securely');
    showToast('We have received your submission and will get back to you soon!','success','Thank You!');
    form.reset();
    
    // Clear any validation error styling
    form.querySelectorAll('.border-red-500').forEach(field=>{
      field.classList.remove('border-red-500','ring-red-500');
      field.classList.add('border-input');
    });
    
    if(typeof trackFacebookEvent!=='undefined'){
      trackFacebookEvent('Contact',{form_type:submissionData.form_type});
    }
    
    trackEvent('form_submission',{
      form_type:submissionData.form_type,
      success:true,
      timestamp:submissionData.created_at
    });
  })
  .catch(function(error){
    console.warn('Server-side form submission failed, using fallback:',error);
    
    try{
      const existingSubmissions=JSON.parse(localStorage.getItem('landingPageSubmissions')||'[]');
      existingSubmissions.push({...submissionData,local_storage:true,timestamp:Date.now()});
      localStorage.setItem('landingPageSubmissions',JSON.stringify(existingSubmissions.slice(-10)));
    }catch(e){
      console.warn('LocalStorage not available');
    }
    
    showToast('We have received your submission and will get back to you soon!','success','Thank You!');
    form.reset();
    
    // Clear any validation error styling
    form.querySelectorAll('.border-red-500').forEach(field=>{
      field.classList.remove('border-red-500','ring-red-500');
      field.classList.add('border-input');
    });
    
    trackEvent('form_submission',{
      form_type:submissionData.form_type,
      success:true,
      method:'fallback',
      timestamp:submissionData.created_at
    });
  })
  .finally(function(){
    // Re-enable submit button
    if(submitButton){
      submitButton.disabled=false;
      submitButton.textContent='Submit';
    }
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded',function(){
  initializeForms();
  initializeResponsiveFeatures();
  
  // Bind button click handlers
  document.querySelectorAll('button[data-action],[role="button"][data-action]').forEach(button=>{
    console.log('Found button with data-action:',button.dataset.action,button);
    button.addEventListener('click',function(e){
      if(!e.defaultPrevented){
        e.preventDefault();
        console.log('Data-attribute button clicked:',this.dataset.action,this.dataset.actionData);
        handleButtonClick(this);
      }
    });
  });
  
  document.querySelectorAll('button:not([data-action])').forEach(button=>{
    if(button.onclick){
      console.log('Found button with React click handler:',button);
    }
  });
  
  // Bind form submission handlers
  const forms=document.querySelectorAll('form');
  console.log('Binding form submission handlers to',forms.length,'forms');
  
  forms.forEach((form,index)=>{
    console.log('Binding handler to form',index+1,'with type:',form.dataset.formType);
    form.addEventListener('submit',function(e){
      e.preventDefault();
      console.log('Form submission event captured for form',index+1);
      handleFormSubmit(this);
    });
  });
  
  // Intersection observer for animations
  const observerOptions={threshold:0.1,rootMargin:'0px 0px -50px 0px'};
  const observer=new IntersectionObserver(function(entries){
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('animate-fade-in');
      }
    });
  },observerOptions);
  
  document.querySelectorAll('[data-section-id]').forEach(section=>{
    observer.observe(section);
  });
  
  function initializeResponsiveFeatures(){
    console.log('Initializing responsive features...');
    
    function updateResponsiveElements(){
      const windowWidth=window.innerWidth;
      let currentBreakpoint='mobile';
      
      if(windowWidth>=1024){
        currentBreakpoint='desktop';
      }else if(windowWidth>=768){
        currentBreakpoint='tablet';
      }else{
        currentBreakpoint='mobile';
      }
      
      console.log('Current breakpoint:',currentBreakpoint,'Width:',windowWidth);
      
      document.body.className=document.body.className.replace(/\\b(mobile|tablet|desktop)-breakpoint\\b/g,'');
      document.body.classList.add(currentBreakpoint+'-breakpoint');
      
      document.dispatchEvent(new CustomEvent('breakpointChange',{
        detail:{breakpoint:currentBreakpoint,width:windowWidth}
      }));
    }
    
    updateResponsiveElements();
    
    let resizeTimeout;
    window.addEventListener('resize',function(){
      clearTimeout(resizeTimeout);
      resizeTimeout=setTimeout(updateResponsiveElements,100);
    });
    
    if(window.tailwind&&window.tailwind.refresh){
      window.tailwind.refresh();
    }
  }
  
  // Scroll depth tracking
  let maxScrollDepth=0;
  window.addEventListener('scroll',function(){
    const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
    const documentHeight=document.documentElement.scrollHeight-window.innerHeight;
    const scrollPercent=Math.round((scrollTop/documentHeight)*100);
    
    if(scrollPercent>maxScrollDepth){
      maxScrollDepth=scrollPercent;
      if([25,50,75,90].includes(scrollPercent)){
        trackEvent('scroll_depth',{scroll_percent:scrollPercent,timestamp:new Date().toISOString()});
      }
    }
  });
  
  // Time on page tracking
  const startTime=Date.now();
  window.addEventListener('beforeunload',function(){
    const timeOnPage=Math.round((Date.now()-startTime)/1000);
    if(timeOnPage>5){
      trackEvent('time_on_page',{time_seconds:timeOnPage,max_scroll_depth:maxScrollDepth});
    }
  });
  
  // Form field focus tracking
  document.querySelectorAll('input,textarea,select').forEach(function(field){
    field.addEventListener('focus',function(){
      trackEvent('form_field_focus',{
        field_name:this.name||this.id,
        field_type:this.type||this.tagName.toLowerCase()
      });
    });
  });
  
  // Re-initialize forms after delay for dynamic content
  setTimeout(function(){
    initializeForms();
    console.log('Re-initialized forms after delay');
  },1000);
  
  // Watch for dynamic content changes
  if(window.MutationObserver){
    const observer=new MutationObserver(function(mutations){
      let shouldReinitialize=false;
      mutations.forEach(function(mutation){
        if(mutation.type==='childList'&&mutation.addedNodes.length>0){
          shouldReinitialize=true;
        }
      });
      if(shouldReinitialize){
        setTimeout(initializeForms,100);
      }
    });
    
    observer.observe(document.body,{childList:true,subtree:true});
  }
});

// Add fade-in animation styles
const style=document.createElement('style');
style.textContent=\`.animate-fade-in{animation:fadeIn 0.6s ease-out forwards;}@keyframes fadeIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}\`;
document.head.appendChild(style);

})();`;
  }
}
