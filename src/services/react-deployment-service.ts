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
            customActions: component.custom_actions || {},
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
  ${this.generateSupabaseSDK(pageData)}
  ${this.generateFacebookPixel(pageData)}
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

  private generateSupabaseSDK(pageData: any): string {
    // Get Supabase credentials from Vite environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ijrisuqixfqzmlomlgjb.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';
    
    // Include Supabase SDK and initialize client for hosted pages
    return `
<!-- Supabase SDK -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
  // Initialize Supabase client for this hosted page
  const supabase = window.supabase.createClient(
    '${supabaseUrl}',
    '${supabaseAnonKey}'
  );
  
  // Page configuration
  const PAGE_CONFIG = {
    id: '${pageData.id || 'unknown'}',
    slug: '${pageData.slug || 'landing-page'}',
    title: '${pageData.seo_config?.title || 'Landing Page'}',
    url: window.location.href,
    user_id: '${pageData.user_id || ''}',
    product_id: '${pageData.product_id || ''}'
  };
  
  // Utility function to generate session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('landing_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('landing_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Simple analytics tracking using your existing schema
  function trackEvent(eventType, eventData) {
    if (!supabase) return;
    
    // Use a simple log table or create a minimal analytics table
    // For now, we'll log to browser console and could extend to actual DB table
    console.log('Landing Page Event:', {
      page_id: PAGE_CONFIG.id,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString()
    });
  }
  
  // Track page view on load
  window.addEventListener('load', function() {
    trackEvent('page_view', {
      page_title: PAGE_CONFIG.title,
      page_slug: PAGE_CONFIG.slug,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight
    });
  });
</script>`;
  }

  private generateFacebookPixel(pageData: any): string {
    // Check if Facebook Pixel ID is available from page data or environment
    const pixelId = pageData.tracking_config?.facebook_pixel_id || 
                   pageData.facebook_pixel_id || 
                   import.meta.env.VITE_FACEBOOK_PIXEL_ID;

    if (!pixelId) {
      return '<!-- Facebook Pixel not configured -->';
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
  
  // Store pixel functions for later use
  window.trackFacebookEvent = function(eventName, eventData) {
    if (typeof fbq !== 'undefined') {
      fbq('track', eventName, eventData);
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

  // Ensure forms are properly initialized for checkout
  function initializeForms() {
    console.log('Initializing forms with complete field support...');
    
    // Default checkout fields to ensure proper form rendering
    const defaultCheckoutFields = [
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

    // Find all form containers and initialize them
    const formContainers = document.querySelectorAll('[data-component="cta"], form:empty, [class*="form-container"]:empty, [data-element="checkout-form"]');
    console.log('Found form containers:', formContainers.length);
    
    formContainers.forEach(function(container, index) {
      console.log('Processing form container', index + 1, container);
      
      // Skip if already initialized
      if (container.dataset.formInitialized) {
        return;
      }
      
      // Clear existing content if empty or problematic
      if (container.children.length === 0 || 
          (container.children.length === 1 && container.querySelector('input[type="email"]:only-child'))) {
        container.innerHTML = '';
      }
      
      // Create form element if not exists
      let form = container.tagName === 'FORM' ? container : container.querySelector('form');
      if (!form) {
        form = document.createElement('form');
        form.className = 'space-y-4';
        container.appendChild(form);
      }
      
      // Add all checkout fields
      defaultCheckoutFields.forEach(function(field) {
        // Skip if field already exists
        if (form.querySelector('input[name="' + field.field_key + '"]')) {
          return;
        }
        
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'space-y-2';
        
        const label = document.createElement('label');
        label.htmlFor = field.field_key;
        label.className = 'block text-sm font-medium text-foreground mb-2';
        label.textContent = field.label + (field.is_required ? ' *' : '');
        
        const input = document.createElement('input');
        input.id = field.field_key;
        input.name = field.field_key;
        input.required = field.is_required;
        input.className = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
        
        // Set input type and placeholder based on field
        switch (field.field_key) {
          case 'email':
            input.type = 'email';
            input.placeholder = 'Enter your email';
            break;
          case 'phone':
            input.type = 'tel';
            input.placeholder = 'Enter your phone number';
            break;
          default:
            input.type = 'text';
            input.placeholder = 'Enter your ' + field.label.toLowerCase();
            break;
        }
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        form.appendChild(fieldDiv);
      });
      
      // Add submit button if not exists
      if (!form.querySelector('button[type="submit"]')) {
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full';
        submitBtn.textContent = 'Submit';
        form.appendChild(submitBtn);
      }
      
      container.dataset.formInitialized = 'true';
      console.log('Initialized form container', index + 1, 'with', defaultCheckoutFields.length, 'fields');
    });
  }

  // Button click handlers
  function handleButtonClick(button) {
    const action = button.dataset.action;
    const actionData = button.dataset.actionData;
    
    if (!action) return;

    // Track button click analytics
    if (supabase) {
      supabase.from('page_analytics').insert({
        page_id: PAGE_CONFIG.id,
        event_type: 'button_click',
        event_data: {
          action: action,
          action_data: actionData,
          button_text: button.textContent || button.innerText,
          button_id: button.id
        },
        session_id: getSessionId()
      });
    }

    switch (action) {
      case 'open_link':
        try {
          const data = JSON.parse(actionData || '{}');
          let url = data.url || actionData;
          if (url && !/^https?:\\/\\//i.test(url)) {
            url = 'https://' + url;
          }
          if (url) {
            window.open(url, data.newTab ? '_blank' : '_self');
            
            // Track link click
            if (typeof trackFacebookEvent !== 'undefined') {
              trackFacebookEvent('ClickButton', {
                page_id: PAGE_CONFIG.id,
                button_text: button.textContent,
                destination_url: url
              });
            }
          }
        } catch (e) {
          // Fallback for simple URL strings
          let url = actionData;
          if (url && !/^https?:\\/\\//i.test(url)) {
            url = 'https://' + url;
          }
          if (url) {
            window.open(url, '_blank');
          }
        }
        break;
        
      case 'scroll':
        try {
          const data = JSON.parse(actionData || '{}');
          const targetId = data.targetId || actionData;
          if (targetId) {
            const target = document.getElementById(targetId);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } catch (e) {
          // Fallback for simple targetId strings
          if (actionData) {
            const target = document.getElementById(actionData);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
        break;
        
      case 'checkout':
        try {
          const data = JSON.parse(actionData || '{}');
          handleCheckout(data, button);
        } catch (e) {
          console.error('Invalid checkout data:', e);
        }
        break;
        
      default:
        console.log('Button action:', action, actionData);
    }
  }

  // Enhanced checkout handler with full Supabase integration - EXACT same logic as ButtonUtils.tsx
  async function handleCheckout(actionData, button) {
    try {
      // Get form data from any forms on the page
      const formElements = document.querySelectorAll('form input, form select, form textarea');
      const formData = {};
      let userEmail = '';
      
      formElements.forEach(function(element) {
        if (element.name || element.id) {
          const key = element.name || element.id;
          formData[key] = element.value;
          if (key === 'email') userEmail = element.value;
        }
      });

      // Validate required email
      if (!userEmail) {
        alert("Please enter your email to proceed with checkout.");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Generate order ID - same method as ButtonUtils
      const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const buyerName = formData.name || formData.full_name || userEmail.split('@')[0];
      
      // Track initiate checkout event
      if (typeof trackFacebookEvent !== 'undefined') {
        trackFacebookEvent('InitiateCheckout', {
          page_id: PAGE_CONFIG.id,
          value: parseFloat(actionData.amount) || 0,
          currency: 'TND',
          content_ids: [String(actionData.productId)]
        });
      }

      // Create pending order using Supabase RPC - EXACT same call as ButtonUtils.tsx
      if (supabase) {
        const { data: orderData, error: orderError } = await supabase.rpc('create_pending_order', {
          p_order_id: orderId,
          p_buyer_id: null, // Guest purchase
          p_buyer_email: userEmail,
          p_buyer_name: buyerName,
          p_global_submission_data: formData,
          p_language: 'en',
          p_is_guest_purchase: true,
          p_cart_items: [{
            product_id: String(actionData.productId),
            quantity: 1,
            submission_data: formData
          }],
          p_payment_method: 'konnect'
        });

        if (orderError) {
          console.error('Order creation error:', orderError);
          alert("Failed to create order. Please try again.");
          return;
        }

        // Prepare success URL - EXACT same as ButtonUtils.tsx
        const successUrl = \`https://demarky.tn/download/order-\${orderId}-\${actionData.productId}\`;
        const failUrl = window.location.origin;

        // Create payment session using Supabase function - EXACT same as ButtonUtils.tsx
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
          body: {
            amount: Math.round(Number(actionData.amount) * 1000), // Convert to millimes
            orderId,
            successUrl,
            failUrl,
            user: {
              email: userEmail,
              name: buyerName
            }
          }
        });

        if (paymentError || !paymentData?.payUrl) {
          console.error('Payment creation error:', paymentError);
          alert("Failed to create payment session. Please try again.");
          return;
        }

        // Track successful checkout initiation
        trackEvent('checkout_initiated', {
          order_id: orderId,
          product_id: actionData.productId,
          amount: actionData.amount,
          user_email: userEmail
        });

        // Track Facebook purchase event
        if (typeof trackFacebookEvent !== 'undefined') {
          trackFacebookEvent('Purchase', {
            page_id: PAGE_CONFIG.id,
            value: parseFloat(actionData.amount) || 0,
            currency: 'TND',
            content_ids: [String(actionData.productId)]
          });
        }

        // Redirect to payment gateway - EXACT same as ButtonUtils.tsx
        window.location.href = paymentData.payUrl;

      } else {
        // Fallback: direct checkout URL if Supabase is not available
        if (actionData.checkoutUrl) {
          window.open(actionData.checkoutUrl, '_blank');
        } else if (actionData.productId) {
          const checkoutUrl = \`https://demarky.tn/checkout/\${actionData.productId}\`;
          window.open(checkoutUrl, '_blank');
        }
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert("An unexpected error occurred. Please try again.");
    }
  }

  // Form submission handlers - Direct Supabase integration with optional database storage
  function handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Prepare submission data
    const submissionData = {
      page_id: PAGE_CONFIG.id,
      form_type: form.dataset.formType || 'contact',
      form_data: data,
      utm_data: {
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
      },
      session_id: getSessionId(),
      visitor_ip: null, // Will be handled server-side if needed
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };
    
    // Try to store in database if the table exists
    if (supabase) {
      supabase.from('landing_page_contacts').insert(submissionData)
        .then(function(response) {
          if (response.error) {
            // Table might not exist, log locally instead
            console.log('Form submission (DB storage failed, using local storage):', submissionData);
            
            // Store locally as backup
            try {
              const existingSubmissions = JSON.parse(localStorage.getItem('landingPageSubmissions') || '[]');
              existingSubmissions.push({...submissionData, local_storage: true, timestamp: Date.now()});
              localStorage.setItem('landingPageSubmissions', JSON.stringify(existingSubmissions.slice(-50)));
            } catch (e) {
              console.warn('LocalStorage not available');
            }
          } else {
            console.log('Form submission stored in database successfully');
          }
          
          // Always show success message
          alert('Thank you for your message! We have received your submission.');
          form.reset();
          
          // Track successful form submission
          if (typeof trackFacebookEvent !== 'undefined') {
            trackFacebookEvent('Contact', {
              page_id: PAGE_CONFIG.id,
              form_type: submissionData.form_type
            });
          }
          
          // Track analytics event
          trackEvent('form_submission', {
            form_type: submissionData.form_type,
            success: true,
            email: data.email || '',
            name: data.name || data.full_name || '',
            timestamp: submissionData.created_at,
            stored_in_db: !response.error
          });
        })
        .catch(function(error) {
          console.error('Form submission error:', error);
          
          // Fallback to local storage
          console.log('Form submission (using local storage):', submissionData);
          try {
            const existingSubmissions = JSON.parse(localStorage.getItem('landingPageSubmissions') || '[]');
            existingSubmissions.push({...submissionData, local_storage: true, error: error.message, timestamp: Date.now()});
            localStorage.setItem('landingPageSubmissions', JSON.stringify(existingSubmissions.slice(-50)));
          } catch (e) {
            console.warn('LocalStorage not available');
          }
          
          // Show success message anyway
          alert('Thank you for your message! We have received your submission.');
          form.reset();
        });
    } else {
      // Fallback when Supabase is not available
      console.log('Form submission (no Supabase):', submissionData);
      alert('Thank you for your message! We have received your submission.');
      form.reset();
    }
  }

  // Initialize event listeners
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize forms first
    initializeForms();
    
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

    // Scroll animations and basic interactions
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

    // Basic analytics tracking
    
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          trackEvent('scroll_depth', {
            scroll_percent: scrollPercent,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', function() {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      if (timeOnPage > 5) { // Only track if user stayed more than 5 seconds
        trackEvent('time_on_page', {
          time_seconds: timeOnPage,
          max_scroll_depth: maxScrollDepth
        });
      }
    });

    // Track form interactions
    document.querySelectorAll('input, textarea, select').forEach(function(field) {
      field.addEventListener('focus', function() {
        trackEvent('form_field_focus', {
          field_name: this.name || this.id,
          field_type: this.type || this.tagName.toLowerCase()
        });
      });
    });
    
    // Re-initialize forms after a short delay to catch any that might load later
    setTimeout(function() {
      initializeForms();
      console.log('Re-initialized forms after delay');
    }, 1000);
    
    // Also try to initialize forms whenever the DOM changes
    if (window.MutationObserver) {
      const observer = new MutationObserver(function(mutations) {
        let shouldReinitialize = false;
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldReinitialize = true;
          }
        });
        
        if (shouldReinitialize) {
          setTimeout(initializeForms, 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
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
