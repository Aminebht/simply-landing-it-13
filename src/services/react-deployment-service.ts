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
      const { css, js } = await this.generateAssets(pageData);

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
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://connect.facebook.net https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.netlify.app https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://k.clarity.ms; frame-src 'none';">
  
  ${this.generateSEOMetaTags(pageData)}
  <link rel="stylesheet" href="styles.css">
  ${this.generateGoogleFontsLink(pageData)}
  ${this.generateTailwindCSS()}
  ${this.generateSupabaseSDK(pageData)}
  ${this.generateTrackingScripts(pageData)}
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
    // For deployed pages: return empty string since CSS is in styles.css
    // This eliminates the CDN production warning
    return '';
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
    // Legacy method - now redirects to new tracking system
    return this.generateTrackingScripts(pageData);
  }

  private generateTrackingScripts(pageData: any): string {
    let scripts = '';

    // Check if we have tracking config
    const trackingConfig = pageData.tracking_config;
    if (!trackingConfig) {
      return '<!-- No tracking configuration -->';
    }

    // Facebook Pixel
    if (trackingConfig.facebook_pixel_id) {
      scripts += this.generateFacebookPixelScript(trackingConfig);
    }

    // Google Analytics
    if (trackingConfig.google_analytics_id) {
      scripts += this.generateGoogleAnalyticsScript(trackingConfig);
    }

    // Microsoft Clarity
    if (trackingConfig.clarity_id) {
      scripts += this.generateClarityScript(trackingConfig);
    }

    return scripts;
  }

  private generateFacebookPixelScript(trackingConfig: any): string {
    const pixelId = trackingConfig.facebook_pixel_id;

    if (!pixelId || !/^\d{15,16}$/.test(pixelId)) {
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
  ${trackingConfig.conversion_events?.page_view ? "fbq('track', 'PageView');" : ''}
  
  // Store pixel functions for later use
  window.trackFacebookEvent = function(eventName, eventData) {
    if (typeof fbq !== 'undefined') {
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

  private generateGoogleAnalyticsScript(trackingConfig: any): string {
    const gaId = trackingConfig.google_analytics_id;

    if (!gaId || !gaId.startsWith('G-')) {
      console.warn('Invalid Google Analytics ID format');
      return '<!-- Google Analytics ID invalid -->';
    }

    return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}', {
    page_title: document.title,
    page_location: window.location.href
  });

  // Store GA function for later use
  window.trackGoogleEvent = function(eventName, eventData) {
    gtag('event', eventName, {
      event_category: 'Landing Page',
      event_label: eventData.label || '',
      value: eventData.value || 0
    });
  };
</script>`;
  }

  private generateClarityScript(trackingConfig: any): string {
    const clarityId = trackingConfig.clarity_id;

    if (!clarityId || clarityId.length < 8) {
      console.warn('Invalid Clarity ID format');
      return '<!-- Clarity ID invalid -->';
    }

    return `
<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${clarityId}");
</script>`;
  }

  private async generateAssets(pageData: any): Promise<{ css: string; js: string }> {
    // Generate optimized CSS with built Tailwind
    const css = await this.generateCustomCSS(pageData);
    
    // Generate JavaScript for interactivity
    const js = this.generateInteractivityJS(pageData);

    return { css, js };
  }

  private async generateCustomCSS(pageData: any): Promise<string> {
    // Generate comprehensive CSS for production deployment
    console.log('🎨 Generating comprehensive CSS for deployment...');
    
    let css = `/* ${pageData.slug} - Production Deployment CSS */\n`;
    
    // Add comprehensive Tailwind-equivalent styles
    css += `
/* Reset and base styles */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
*{margin:0;padding:0}
html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:Inter,system-ui,sans-serif}
body{margin:0;line-height:inherit;color:#1f2937}

/* Layout utilities */
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 1rem}
.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.block{display:block}.hidden{display:none}
.flex-col{flex-direction:column}.flex-row{flex-direction:row}
.items-center{align-items:center}.items-start{align-items:flex-start}.items-end{align-items:flex-end}
.justify-center{justify-content:center}.justify-between{justify-content:space-between}.justify-start{justify-content:flex-start}
.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}

/* Grid */
.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}

/* Spacing */
.p-0{padding:0}.p-1{padding:0.25rem}.p-2{padding:0.5rem}.p-3{padding:0.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.p-10{padding:2.5rem}.p-12{padding:3rem}.p-16{padding:4rem}.p-20{padding:5rem}.p-24{padding:6rem}
.px-0{padding-left:0;padding-right:0}.px-1{padding-left:0.25rem;padding-right:0.25rem}.px-2{padding-left:0.5rem;padding-right:0.5rem}.px-3{padding-left:0.75rem;padding-right:0.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}
.py-0{padding-top:0;padding-bottom:0}.py-1{padding-top:0.25rem;padding-bottom:0.25rem}.py-2{padding-top:0.5rem;padding-bottom:0.5rem}.py-3{padding-top:0.75rem;padding-bottom:0.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.py-8{padding-top:2rem;padding-bottom:2rem}.py-12{padding-top:3rem;padding-bottom:3rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-20{padding-top:5rem;padding-bottom:5rem}
.m-0{margin:0}.m-1{margin:0.25rem}.m-2{margin:0.5rem}.m-3{margin:0.75rem}.m-4{margin:1rem}.m-auto{margin:auto}.mx-auto{margin-left:auto;margin-right:auto}
.mt-1{margin-top:0.25rem}.mt-2{margin-top:0.5rem}.mt-4{margin-top:1rem}.mt-8{margin-top:2rem}.mb-1{margin-bottom:0.25rem}.mb-2{margin-bottom:0.5rem}.mb-4{margin-bottom:1rem}.mb-8{margin-bottom:2rem}
.gap-1{gap:0.25rem}.gap-2{gap:0.5rem}.gap-3{gap:0.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}.gap-12{gap:3rem}
.space-y-1>*+*{margin-top:0.25rem}.space-y-2>*+*{margin-top:0.5rem}.space-y-3>*+*{margin-top:0.75rem}.space-y-4>*+*{margin-top:1rem}.space-y-6>*+*{margin-top:1.5rem}.space-y-8>*+*{margin-top:2rem}

/* Typography */
.text-xs{font-size:0.75rem;line-height:1rem}.text-sm{font-size:0.875rem;line-height:1.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-5xl{font-size:3rem;line-height:1}.text-6xl{font-size:3.75rem;line-height:1}
.font-thin{font-weight:100}.font-extralight{font-weight:200}.font-light{font-weight:300}.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}.font-extrabold{font-weight:800}.font-black{font-weight:900}
.leading-3{line-height:.75rem}.leading-4{line-height:1rem}.leading-5{line-height:1.25rem}.leading-6{line-height:1.5rem}.leading-7{line-height:1.75rem}.leading-8{line-height:2rem}.leading-9{line-height:2.25rem}.leading-10{line-height:2.5rem}
.leading-none{line-height:1}.leading-tight{line-height:1.25}.leading-snug{line-height:1.375}.leading-normal{line-height:1.5}.leading-relaxed{line-height:1.625}.leading-loose{line-height:2}

/* Colors */
.text-white{color:#ffffff}.text-black{color:#000000}.text-gray-50{color:#f9fafb}.text-gray-100{color:#f3f4f6}.text-gray-200{color:#e5e7eb}.text-gray-300{color:#d1d5db}.text-gray-400{color:#9ca3af}.text-gray-500{color:#6b7280}.text-gray-600{color:#4b5563}.text-gray-700{color:#374151}.text-gray-800{color:#1f2937}.text-gray-900{color:#111827}
.text-blue-50{color:#eff6ff}.text-blue-100{color:#dbeafe}.text-blue-200{color:#bfdbfe}.text-blue-300{color:#93c5fd}.text-blue-400{color:#60a5fa}.text-blue-500{color:#3b82f6}.text-blue-600{color:#2563eb}.text-blue-700{color:#1d4ed8}.text-blue-800{color:#1e40af}.text-blue-900{color:#1e3a8a}
.text-red-50{color:#fef2f2}.text-red-100{color:#fee2e2}.text-red-200{color:#fecaca}.text-red-300{color:#fca5a5}.text-red-400{color:#f87171}.text-red-500{color:#ef4444}.text-red-600{color:#dc2626}.text-red-700{color:#b91c1c}.text-red-800{color:#991b1b}.text-red-900{color:#7f1d1d}
.text-green-50{color:#f0fdf4}.text-green-100{color:#dcfce7}.text-green-200{color:#bbf7d0}.text-green-300{color:#86efac}.text-green-400{color:#4ade80}.text-green-500{color:#22c55e}.text-green-600{color:#16a34a}.text-green-700{color:#15803d}.text-green-800{color:#166534}.text-green-900{color:#14532d}

.bg-white{background-color:#ffffff}.bg-black{background-color:#000000}.bg-transparent{background-color:transparent}
.bg-gray-50{background-color:#f9fafb}.bg-gray-100{background-color:#f3f4f6}.bg-gray-200{background-color:#e5e7eb}.bg-gray-300{background-color:#d1d5db}.bg-gray-400{background-color:#9ca3af}.bg-gray-500{background-color:#6b7280}.bg-gray-600{background-color:#4b5563}.bg-gray-700{background-color:#374151}.bg-gray-800{background-color:#1f2937}.bg-gray-900{background-color:#111827}
.bg-blue-50{background-color:#eff6ff}.bg-blue-100{background-color:#dbeafe}.bg-blue-200{background-color:#bfdbfe}.bg-blue-300{background-color:#93c5fd}.bg-blue-400{background-color:#60a5fa}.bg-blue-500{background-color:#3b82f6}.bg-blue-600{background-color:#2563eb}.bg-blue-700{background-color:#1d4ed8}.bg-blue-800{background-color:#1e40af}.bg-blue-900{background-color:#1e3a8a}
.bg-red-50{background-color:#fef2f2}.bg-red-100{background-color:#fee2e2}.bg-red-200{background-color:#fecaca}.bg-red-300{background-color:#fca5a5}.bg-red-400{background-color:#f87171}.bg-red-500{background-color:#ef4444}.bg-red-600{background-color:#dc2626}.bg-red-700{background-color:#b91c1c}.bg-red-800{background-color:#991b1b}.bg-red-900{background-color:#7f1d1d}
.bg-green-50{background-color:#f0fdf4}.bg-green-100{background-color:#dcfce7}.bg-green-200{background-color:#bbf7d0}.bg-green-300{background-color:#86efac}.bg-green-400{background-color:#4ade80}.bg-green-500{background-color:#22c55e}.bg-green-600{background-color:#16a34a}.bg-green-700{background-color:#15803d}.bg-green-800{background-color:#166534}.bg-green-900{background-color:#14532d}

/* Sizing */
.w-0{width:0}.w-1{width:0.25rem}.w-2{width:0.5rem}.w-3{width:0.75rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-8{width:2rem}.w-10{width:2.5rem}.w-12{width:3rem}.w-16{width:4rem}.w-20{width:5rem}.w-24{width:6rem}.w-32{width:8rem}.w-40{width:10rem}.w-48{width:12rem}.w-56{width:14rem}.w-64{width:16rem}.w-72{width:18rem}.w-80{width:20rem}.w-96{width:24rem}
.w-auto{width:auto}.w-px{width:1px}.w-full{width:100%}.w-screen{width:100vw}.w-min{width:min-content}.w-max{width:max-content}.w-fit{width:fit-content}
.w-1\\/2{width:50%}.w-1\\/3{width:33.333333%}.w-2\\/3{width:66.666667%}.w-1\\/4{width:25%}.w-2\\/4{width:50%}.w-3\\/4{width:75%}.w-1\\/5{width:20%}.w-2\\/5{width:40%}.w-3\\/5{width:60%}.w-4\\/5{width:80%}.w-1\\/6{width:16.666667%}.w-2\\/6{width:33.333333%}.w-3\\/6{width:50%}.w-4\\/6{width:66.666667%}.w-5\\/6{width:83.333333%}

.h-0{height:0}.h-1{height:0.25rem}.h-2{height:0.5rem}.h-3{height:0.75rem}.h-4{height:1rem}.h-5{height:1.25rem}.h-6{height:1.5rem}.h-8{height:2rem}.h-10{height:2.5rem}.h-12{height:3rem}.h-16{height:4rem}.h-20{height:5rem}.h-24{height:6rem}.h-32{height:8rem}.h-40{height:10rem}.h-48{height:12rem}.h-56{height:14rem}.h-64{height:16rem}.h-72{height:18rem}.h-80{height:20rem}.h-96{height:24rem}
.h-auto{height:auto}.h-px{height:1px}.h-full{height:100%}.h-screen{height:100vh}.min-h-0{min-height:0}.min-h-full{min-height:100%}.min-h-screen{min-height:100vh}.max-h-full{max-height:100%}.max-h-screen{max-height:100vh}

/* Borders */
.rounded-none{border-radius:0}.rounded-sm{border-radius:0.125rem}.rounded{border-radius:0.25rem}.rounded-md{border-radius:0.375rem}.rounded-lg{border-radius:0.5rem}.rounded-xl{border-radius:0.75rem}.rounded-2xl{border-radius:1rem}.rounded-3xl{border-radius:1.5rem}.rounded-full{border-radius:9999px}
.border-0{border-width:0}.border{border-width:1px}.border-2{border-width:2px}.border-4{border-width:4px}.border-8{border-width:8px}
.border-gray-100{border-color:#f3f4f6}.border-gray-200{border-color:#e5e7eb}.border-gray-300{border-color:#d1d5db}.border-gray-400{border-color:#9ca3af}.border-gray-500{border-color:#6b7280}

/* Shadows */
.shadow-sm{box-shadow:0 1px 2px 0 rgba(0,0,0,0.05)}.shadow{box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)}.shadow-md{box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)}.shadow-lg{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}.shadow-xl{box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)}.shadow-2xl{box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)}.shadow-none{box-shadow:0 0 #0000}

/* Opacity */
.opacity-0{opacity:0}.opacity-5{opacity:0.05}.opacity-10{opacity:0.1}.opacity-20{opacity:0.2}.opacity-25{opacity:0.25}.opacity-30{opacity:0.3}.opacity-40{opacity:0.4}.opacity-50{opacity:0.5}.opacity-60{opacity:0.6}.opacity-70{opacity:0.7}.opacity-75{opacity:0.75}.opacity-80{opacity:0.8}.opacity-90{opacity:0.9}.opacity-95{opacity:0.95}.opacity-100{opacity:1}

/* Position */
.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}
.inset-0{top:0;right:0;bottom:0;left:0}.top-0{top:0}.right-0{right:0}.bottom-0{bottom:0}.left-0{left:0}

/* Z-index */
.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}.z-40{z-index:40}.z-50{z-index:50}.z-auto{z-index:auto}

/* Transforms */
.transform{transform:translateVar(--tw-translate-x,0) translateY(var(--tw-translate-y,0)) rotate(var(--tw-rotate,0)) skewX(var(--tw-skew-x,0)) skewY(var(--tw-skew-y,0)) scaleX(var(--tw-scale-x,1)) scaleY(var(--tw-scale-y,1))}
.scale-0{--tw-scale-x:0;--tw-scale-y:0}.scale-50{--tw-scale-x:.5;--tw-scale-y:.5}.scale-75{--tw-scale-x:.75;--tw-scale-y:.75}.scale-90{--tw-scale-x:.9;--tw-scale-y:.9}.scale-95{--tw-scale-x:.95;--tw-scale-y:.95}.scale-100{--tw-scale-x:1;--tw-scale-y:1}.scale-105{--tw-scale-x:1.05;--tw-scale-y:1.05}.scale-110{--tw-scale-x:1.1;--tw-scale-y:1.1}.scale-125{--tw-scale-x:1.25;--tw-scale-y:1.25}

/* Transitions */
.transition-none{transition-property:none}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.transition-shadow{transition-property:box-shadow;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}.transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms}
.duration-75{transition-duration:75ms}.duration-100{transition-duration:100ms}.duration-150{transition-duration:150ms}.duration-200{transition-duration:200ms}.duration-300{transition-duration:300ms}.duration-500{transition-duration:500ms}.duration-700{transition-duration:700ms}.duration-1000{transition-duration:1000ms}
.ease-linear{transition-timing-function:linear}.ease-in{transition-timing-function:cubic-bezier(0.4,0,1,1)}.ease-out{transition-timing-function:cubic-bezier(0,0,0.2,1)}.ease-in-out{transition-timing-function:cubic-bezier(0.4,0,0.2,1)}

/* Interactive states */
.hover\\:opacity-80:hover{opacity:0.8}.hover\\:opacity-90:hover{opacity:0.9}.hover\\:scale-105:hover{--tw-scale-x:1.05;--tw-scale-y:1.05}.hover\\:shadow-lg:hover{box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)}
.hover\\:bg-gray-50:hover{background-color:#f9fafb}.hover\\:bg-gray-100:hover{background-color:#f3f4f6}.hover\\:bg-blue-600:hover{background-color:#2563eb}.hover\\:bg-red-600:hover{background-color:#dc2626}.hover\\:bg-green-600:hover{background-color:#16a34a}

/* Focus states */
.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus\\:ring-blue-500:focus{--tw-ring-color:#3b82f6}

/* Responsive design */
@media (min-width: 640px) {
  .sm\\:block{display:block}.sm\\:flex{display:flex}.sm\\:hidden{display:none}.sm\\:grid{display:grid}
  .sm\\:flex-row{flex-direction:row}.sm\\:flex-col{flex-direction:column}
  .sm\\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.sm\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
  .sm\\:text-sm{font-size:0.875rem}.sm\\:text-base{font-size:1rem}.sm\\:text-lg{font-size:1.125rem}.sm\\:text-xl{font-size:1.25rem}.sm\\:text-2xl{font-size:1.5rem}.sm\\:text-3xl{font-size:1.875rem}.sm\\:text-4xl{font-size:2.25rem}.sm\\:text-5xl{font-size:3rem}
  .sm\\:p-4{padding:1rem}.sm\\:p-6{padding:1.5rem}.sm\\:p-8{padding:2rem}.sm\\:px-6{padding-left:1.5rem;padding-right:1.5rem}.sm\\:py-8{padding-top:2rem;padding-bottom:2rem}
}

@media (min-width: 768px) {
  .md\\:block{display:block}.md\\:flex{display:flex}.md\\:hidden{display:none}.md\\:grid{display:grid}
  .md\\:flex-row{flex-direction:row}.md\\:flex-col{flex-direction:column}
  .md\\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
  .md\\:text-base{font-size:1rem}.md\\:text-lg{font-size:1.125rem}.md\\:text-xl{font-size:1.25rem}.md\\:text-2xl{font-size:1.5rem}.md\\:text-3xl{font-size:1.875rem}.md\\:text-4xl{font-size:2.25rem}.md\\:text-5xl{font-size:3rem}.md\\:text-6xl{font-size:3.75rem}
  .md\\:p-6{padding:1.5rem}.md\\:p-8{padding:2rem}.md\\:px-8{padding-left:2rem;padding-right:2rem}.md\\:py-12{padding-top:3rem;padding-bottom:3rem}
}

@media (min-width: 1024px) {
  .lg\\:block{display:block}.lg\\:flex{display:flex}.lg\\:hidden{display:none}.lg\\:grid{display:grid}
  .lg\\:flex-row{flex-direction:row}.lg\\:flex-col{flex-direction:column}
  .lg\\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.lg\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.lg\\:grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}
  .lg\\:text-lg{font-size:1.125rem}.lg\\:text-xl{font-size:1.25rem}.lg\\:text-2xl{font-size:1.5rem}.lg\\:text-3xl{font-size:1.875rem}.lg\\:text-4xl{font-size:2.25rem}.lg\\:text-5xl{font-size:3rem}.lg\\:text-6xl{font-size:3.75rem}.lg\\:text-7xl{font-size:4.5rem}
  .lg\\:p-8{padding:2rem}.lg\\:p-12{padding:3rem}.lg\\:px-12{padding-left:3rem;padding-right:3rem}.lg\\:py-16{padding-top:4rem;padding-bottom:4rem}
}

@media (min-width: 1280px) {
  .xl\\:grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.xl\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.xl\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.xl\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.xl\\:grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}.xl\\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}
  .xl\\:text-xl{font-size:1.25rem}.xl\\:text-2xl{font-size:1.5rem}.xl\\:text-3xl{font-size:1.875rem}.xl\\:text-4xl{font-size:2.25rem}.xl\\:text-5xl{font-size:3rem}.xl\\:text-6xl{font-size:3.75rem}.xl\\:text-7xl{font-size:4.5rem}.xl\\:text-8xl{font-size:6rem}
}
`;

    // Add global theme styles
    if (pageData.global_theme) {
      css += `\n/* Theme Variables */\n:root {
        --primary-color: ${pageData.global_theme.primaryColor || '#3b82f6'};
        --secondary-color: ${pageData.global_theme.secondaryColor || '#f3f4f6'};
        --background-color: ${pageData.global_theme.backgroundColor || '#ffffff'};
        --font-family: ${pageData.global_theme.fontFamily || 'Inter, sans-serif'};
      }
      body {
        background-color: var(--background-color);
        font-family: var(--font-family);
        color: #1f2937;
      }`;
    }

    // Add component-specific styles
    if (pageData.components?.length > 0) {
      css += '\n\n/* Component Custom Styles */\n';
      pageData.components.forEach((component: any) => {
        const customStyles = component.custom_styles || {};
        
        Object.entries(customStyles).forEach(([elementId, styles]: [string, any]) => {
          if (!styles || typeof styles !== 'object') return;

          css += `#section-${component.id} [data-element="${elementId}"] {`;
          Object.entries(styles).forEach(([property, value]) => {
            if (typeof value === 'string' || typeof value === 'number') {
              const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
              css += `${cssProperty}:${value};`;
            }
          });
          css += '}';
        });
      });
    }

    // Add production stability and layout fixes
    css += `
/* Production Layout Stability */
#landing-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

[data-section-id] {
  width: 100% !important;
  margin: 0 !important;
  position: relative;
}

/* Button and form styles */
button, [role="button"] {
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover, [role="button"]:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

/* Form validation styles */
.border-red-500 { border-color: #ef4444 !important; }
.ring-red-500 { --tw-ring-color: #ef4444 !important; }
.text-red-500 { color: #ef4444 !important; }

/* Component utilities */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  padding: 0.5rem 1rem;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--primary-color, #3b82f6);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
}

.btn-outline {
  border: 1px solid #e5e7eb;
  background-color: transparent;
  color: #1f2937;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

.form-input {
  display: flex;
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
`;

    console.log(`✅ Generated comprehensive CSS (${Math.round(css.length / 1024)}KB)`);
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
