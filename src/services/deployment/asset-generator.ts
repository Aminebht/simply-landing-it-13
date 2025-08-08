export class AssetGenerator {
  generateAssets(pageData: any, priorityCSS?: string): { css: string; js: string } {
    const baseCSS = this.generateCustomCSS(pageData);
    const js = this.generateInteractivityJS(pageData);

    // Merge priority CSS (from css-generator) with base CSS
    let finalCSS = '';
    
    if (priorityCSS) {
      finalCSS += `/* PRIORITY: Tailwind CSS from css-generator edge function */\n`;
      finalCSS += priorityCSS + '\n\n';
    }
    
    finalCSS += baseCSS;

    return { css: finalCSS, js };
  }

  private generateCustomCSS(pageData: any): string {
    let css = `/* Asset Generator CSS - Base styles and custom components only */\n`;
    css += `/* NOTE: Tailwind utility classes are processed by css-generator edge function */\n`;

    // Add CSS variables for theming (essential for components)
    css += this.generateThemeVariables(pageData);

    // Add base styles (layout, reset, essential structure)
    css += this.generateBaseStyles();

    // Add global theme styles (non-Tailwind custom styles)
    if (pageData.global_theme) {
      css += this.generateGlobalThemeCSS(pageData.global_theme);
    }

    // Add component-specific custom styles (non-Tailwind styles)
    pageData.components?.forEach((component: any, index: number) => {
      if (component.custom_styles) {
        css += this.generateComponentCSS(component, index);
      }
    });

    return css; // Don't minify to avoid conflicts with Tailwind CSS
  }

  private generateGlobalThemeCSS(globalTheme: any): string {
    let css = '';

    if (globalTheme.primaryColor) {
      css += `:root { --primary-color: ${globalTheme.primaryColor}; }\n`;
    }

    if (globalTheme.secondaryColor) {
      css += `:root { --secondary-color: ${globalTheme.secondaryColor}; }\n`;
    }

    if (globalTheme.backgroundColor) {
      css += `body { background-color: ${globalTheme.backgroundColor}; }\n`;
    }

    if (globalTheme.fontFamily) {
      css += `body { font-family: ${globalTheme.fontFamily}; }\n`;
    }

    return css;
  }

  private generateThemeVariables(pageData: any): string {
    const primaryColor = pageData?.global_theme?.primaryColor || '#3b82f6';
    const secondaryColor = pageData?.global_theme?.secondaryColor || '#f3f4f6';
    const backgroundColor = pageData?.global_theme?.backgroundColor || '#ffffff';

    return `
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
`;
  }

  private generateBaseStyles(): string {
    return `
/* Essential base styles - Non-Tailwind foundational CSS */
/* Note: Basic resets and utilities are handled by Tailwind in css-generator */

/* Landing page specific structure */
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

/* Section layout stability */
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

/* Eliminate gaps between sections */
[data-section-id] + [data-section-id] {
  margin-top: 0 !important;
  border-top: none !important;
  padding-top: 0 !important;
}

/* Enhanced button interactions (beyond Tailwind) */
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

/* Form styling consistency */
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

/* Toast notification system (custom component) */
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
`;
  }

  private generateComponentCSS(component: any, index: number): string {
    let css = `/* Component ${component.id} styles */\n`;
    
    const customStyles = component.custom_styles || {};
    
    Object.entries(customStyles).forEach(([key, styles]: [string, any]) => {
      if (styles && typeof styles === 'object') {
        css += `#section-${component.id} .${key} {\n`;
        
        Object.entries(styles).forEach(([property, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            css += `  ${this.kebabCase(property)}: ${value};\n`;
          }
        });
        
        css += `}\n`;
      }
    });

    return css;
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*{\s*/g, '{') // Remove spaces around {
      .replace(/;\s*/g, ';') // Remove spaces after ;
      .replace(/\s*}\s*/g, '}') // Remove spaces around }
      .trim();
  }

  private generateInteractivityJS(pageData: any): string {
    const supabaseUrl = 'https://ijrisuqixfqzmlomlgjb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';
    
    return `(function() {
'use strict';

// Toast notification utility
function showToast(message, type = 'error') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = \`
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    \`;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  const isError = type === 'error';
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';
  const isInfo = type === 'info';

  toast.style.cssText = \`
    background: \${isError ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 
                 isSuccess ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 
                 isWarning ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 
                 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'};
    color: \${isError ? '#991b1b' : isSuccess ? '#166534' : isWarning ? '#92400e' : '#1e40af'};
    border: 1px solid \${isError ? '#fecaca' : isSuccess ? '#bbf7d0' : isWarning ? '#fed7aa' : '#bfdbfe'};
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(16px);
    max-width: 420px;
    word-wrap: break-word;
    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    font-weight: 500;
    position: relative;
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
  \`;

  // Add icon and message
  const iconSvg = isError ? 
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"></path></svg>' :
    isSuccess ?
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.53a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>' :
    isWarning ?
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>' :
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>';

  toast.innerHTML = \`
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="flex-shrink: 0; margin-top: 1px;">
        \${iconSvg}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; margin-bottom: 4px;">\${isError ? 'Error' : isSuccess ? 'Success' : isWarning ? 'Warning' : 'Info'}</div>
        <div style="font-weight: 400; opacity: 0.9;">\${message}</div>
      </div>
      <button onclick="this.parentElement.parentElement.style.animation='slideOut 0.3s cubic-bezier(0.4, 0, 1, 1)'; setTimeout(() => this.parentElement.parentElement.remove(), 300);" style="
        background: none;
        border: none;
        color: currentColor;
        opacity: 0.5;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: opacity 0.2s ease;
        flex-shrink: 0;
      " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='0.5'">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
  \`;

  // Add hover effects
  toast.addEventListener('mouseenter', () => {
    toast.style.transform = 'translateY(-2px)';
    toast.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
  });

  toast.addEventListener('mouseleave', () => {
    toast.style.transform = 'translateY(0)';
    toast.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  });

  // Add animation styles if not already present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = \`
      @keyframes slideIn {
        from { 
          transform: translateX(100%) scale(0.95); 
          opacity: 0; 
        }
        to { 
          transform: translateX(0) scale(1); 
          opacity: 1; 
        }
      }
      @keyframes slideOut {
        from { 
          transform: translateX(0) scale(1); 
          opacity: 1; 
        }
        to { 
          transform: translateX(100%) scale(0.95); 
          opacity: 0; 
        }
      }
      @media (max-width: 640px) {
        #toast-container {
          left: 16px !important;
          right: 16px !important;
          top: 16px !important;
          max-width: none !important;
        }
      }
    \`;
    document.head.appendChild(style);
  }

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 1, 1)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
}

// Load Supabase SDK dynamically
(function() {
  console.log('📦 DEBUG: Starting Supabase SDK loading...');
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@supabase/supabase-js@2';
  script.onload = function() {
    console.log('✅ DEBUG: Supabase SDK loaded successfully');
    window.supabase = window.supabase.createClient('${supabaseUrl}', '${supabaseAnonKey}', {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true
      }
    });
    console.log('🔗 DEBUG: Supabase client created and attached to window');
    
    // Trigger dynamic form rebuilding once Supabase is loaded
    console.log('🔄 DEBUG: Supabase loaded, rebuilding dynamic checkout forms...');
    setTimeout(() => {
      const forms = document.querySelectorAll('form[data-dynamic-checkout]');
      console.log('🔍 DEBUG: Found', forms.length, 'dynamic forms to rebuild after Supabase load');
      
      forms.forEach((form, index) => {
        console.log('🔄 DEBUG: Processing form', index + 1, 'after Supabase load');
        const checkoutButton = form.parentElement?.querySelector('[data-action="checkout"]');
        let productId = null;
        
        if (checkoutButton?.dataset.actionData) {
          try {
            const actionData = JSON.parse(checkoutButton.dataset.actionData);
            productId = actionData.productId;
            console.log('🎯 DEBUG: ProductId for form', index + 1, ':', productId);
          } catch (e) {
            console.warn('Could not parse checkout button action data');
          }
        }
        
        rebuildCheckoutForm(productId);
      });
    }, 100);
  };
  document.head.appendChild(script);
})();

// Global constants
const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
const PAGE_CONFIG = {
  slug: ${JSON.stringify(pageData.slug || 'landing-page')},
  title: ${JSON.stringify(this.escapeJs(pageData.seo_config?.title || 'Landing Page'))},
  url: window.location.href,
  language: ${JSON.stringify(pageData.global_theme?.language || 'en')}
};

// Utility function to generate UUID
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session Management
function getSessionId(){
  let sessionId = sessionStorage.getItem('landing_session_id');
  if(!sessionId){
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    sessionStorage.setItem('landing_session_id', sessionId);
  }
  return sessionId;
}

// Event Tracking
function trackEvent(eventType, eventData){
  console.log('Landing Page Event:', {
    event_type: eventType,
    event_data: eventData,
    timestamp: new Date().toISOString(),
    page_url: window.location.href
  });
}

// Checkout handler (calls secure edge function)
async function handleCheckout(actionData) {
  console.log('Starting checkout process with action:', actionData);
  try {
    const formElements = document.querySelectorAll('form input, form select, form textarea');
    const formData = {};
    let userEmail = '';
    let isValid = true;
    const missingFields = [];
    
    formElements.forEach((element) => {
      const input = element;
      const key = input.name || input.id;
      if (key) {
        formData[key] = input.value;
        if (key === 'email') userEmail = input.value;
        if (input.required && !input.value.trim()) {
          isValid = false;
          missingFields.push(input.placeholder || key);
        }
      }
    });

    if (!isValid) {
      showToast('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }
    
    if (!userEmail) {
      showToast("Please enter your email to proceed with checkout.");
      return;
    }
    
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      showToast("Please enter a valid email address.");
      return;
    }

    const orderId = generateUUID();
    const buyerName = formData.name || formData.full_name || userEmail.split('@')[0];
    const amount = Number(actionData.amount) || 0;
    
    showToast('Processing your order...', 'info');

    const response = await fetch('https://ijrisuqixfqzmlomlgjb.supabase.co/functions/v1/secure-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'x-page-slug': PAGE_CONFIG.slug
      },
      body: JSON.stringify({
        orderId,
        productId: actionData.productId,
        amount,
        buyerEmail: userEmail,
        buyerName,
        formData,
        pageSlug: PAGE_CONFIG.slug
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Secure checkout error:', result);
      showToast(result.error || "Failed to process checkout. Please try again.", 'error');
      return;
    }
    
    if (result.success && result.paymentUrl) {
      console.log('Redirecting to payment URL:', result.paymentUrl);
      showToast('Redirecting to payment...', 'success');
      window.open(result.paymentUrl, '_blank');
    } else {
      showToast("Failed to initialize payment. Please try again.", 'error');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast("An error occurred during checkout. Please try again.", 'error');
  }
}

// Toast notification system
function showToast(message, type = 'info', duration = 5000) {
  const toastContainer = document.querySelector('.toast-container') || (() => {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  })();

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<div class="toast-content"><div class="toast-message">' + message + '</div></div><button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';

  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => toast.remove(), duration);
}

// Form handling with dynamic checkout fields
async function fetchCheckoutFields(productId) {
  try {
    console.log('🔍 DEBUG: fetchCheckoutFields called with productId:', productId);
    
    if (!window.supabase) {
      console.warn('Supabase not loaded yet, retrying...');
      return [];
    }

    const { data, error } = await window.supabase
      .from('checkout_fields')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching checkout fields:', error);
      return [];
    }
    
    console.log('📊 DEBUG: Raw fields fetched from database:', data?.length || 0, 'fields');
    console.log('📋 DEBUG: Raw fields data:', data);
    
    // Filter fields by product if productId is provided
    const filteredFields = data?.filter(field => 
      !productId || field.product_ids.includes(productId)
    ) || [];

    console.log('🎯 DEBUG: Filtered fields for productId', productId + ':', filteredFields.length, 'fields');
    console.log('📝 DEBUG: Filtered fields details:', filteredFields.map(f => ({
      key: f.field_key,
      label: f.label,
      type: f.field_type,
      required: f.required || f.is_required,
      placeholder: f.placeholder,
      order: f.display_order,
      productIds: f.product_ids
    })));

    return filteredFields;
  } catch (error) {
    console.error('Error in fetchCheckoutFields:', error);
    return [];
  }
}

// Detect CTA variation based on form styling and container
function detectCtaVariation(form) {
  // Check the form's className for variation-specific patterns
  const formClasses = form.className || '';
  const containerClasses = form.parentElement?.className || '';
  const grandparentClasses = form.parentElement?.parentElement?.className || '';
  
  // Also check for existing fields to see their styling
  const existingInputs = form.querySelectorAll('input, select, textarea');
  const existingLabels = form.querySelectorAll('label');
  
  console.log('🔍 DEBUG: Analyzing classes for CTA variation detection:', {
    formClasses: formClasses,
    containerClasses: containerClasses,
    grandparentClasses: grandparentClasses,
    existingInputCount: existingInputs.length,
    firstInputClasses: existingInputs[0]?.className || 'none',
    firstLabelClasses: existingLabels[0]?.className || 'none'
  });
  
  // Check existing input styling for more accurate detection
  if (existingInputs.length > 0) {
    const inputClasses = existingInputs[0].className;
    
    // CTA Variation 1: backdrop-blur, white/10, white borders
    if (inputClasses.includes('backdrop-blur') || 
        inputClasses.includes('bg-white/10') || 
        inputClasses.includes('border-white/20') ||
        inputClasses.includes('placeholder-white/60')) {
      return 'variation1';
    }
    
    // CTA Variation 2: rounded-full, text-center, px-5 py-3
    if (inputClasses.includes('rounded-full') && 
        (inputClasses.includes('text-center') || inputClasses.includes('px-5'))) {
      return 'variation2';
    }
  }
  
  // Fallback to className analysis
  // CTA Variation 1: Look for white/backdrop blur/glass styling
  if (formClasses.includes('backdrop-blur') || 
      formClasses.includes('bg-white/10') || 
      formClasses.includes('placeholder-white/60') ||
      formClasses.includes('border-white/20')) {
    return 'variation1';
  }
  
  // CTA Variation 2: Look for centered/flex column/rounded-full styling
  if (formClasses.includes('text-center') || 
      formClasses.includes('rounded-full') ||
      formClasses.includes('items-center') ||
      formClasses.includes('flex-col') ||
      containerClasses.includes('text-center')) {
    return 'variation2';
  }
  
  // Default fallback
  return 'variation3';
}

// Helper functions for variation-specific CSS classes
function getFieldWrapperClasses(variation) {
  switch (variation) {
    case 'variation1':
      return 'field-wrapper w-full';
    case 'variation2':
      return 'field-wrapper w-full flex flex-col items-center';
    case 'variation3':
    default:
      return 'field-wrapper';
  }
}

function getLabelWrapperClasses(variation) {
  switch (variation) {
    case 'variation1':
      return 'label-wrapper';
    case 'variation2':
      return 'label-wrapper flex items-center justify-center';
    case 'variation3':
    default:
      return 'label-wrapper';
  }
}

function getLabelClasses(variation) {
  switch (variation) {
    case 'variation1':
      // White text to match the glass/dark theme - inherits from container color: #ffffff
      return 'block text-sm font-medium text-white mb-2';
    case 'variation2':
      return 'mb-2 text-center font-medium text-white';
    case 'variation3':
    default:
      return 'block text-sm font-medium text-foreground mb-2';
  }
}

function getRequiredAsteriskClasses(variation) {
  switch (variation) {
    case 'variation1':
      // Lighter red/pink that's visible on dark glass background
      return 'text-red-400 ml-1';
    case 'variation2':
      return 'text-red-500 ml-1 select-none';
    case 'variation3':
    default:
      return 'text-destructive';
  }
}

function getInputClasses(variation) {
  // Base classes from CtaClassMaps.form.input
  const baseClasses = 'w-full px-4 py-3 border focus:outline-none';
  
  switch (variation) {
    case 'variation1':
      // Exact CTA1 styling: rounded-full + glass effect with white text + white focus ring
      // Note: placeholder color is handled via inline styles
      return baseClasses + ' rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white focus:ring-2 focus:ring-white/50 focus:border-white/40';
    case 'variation2':
      // CTA2 styling: rounded-full + centered + larger padding
      return baseClasses + ' rounded-full px-5 py-3 border-gray-300 text-center focus:ring-2 focus:ring-primary';
    case 'variation3':
    default:
      // Standard CTA3 styling
      return baseClasses + ' border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent';
  }
}

function getSelectClasses(variation) {
  // Base classes from CtaClassMaps.form.select  
  const baseClasses = 'w-full px-4 py-3 border focus:outline-none';
  
  switch (variation) {
    case 'variation1':
      // Exact CTA1 styling: rounded-full + glass effect with white text + white focus ring
      return baseClasses + ' rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white focus:ring-2 focus:ring-white/50 focus:border-white/40';
    case 'variation2':
      // CTA2 styling: rounded-full + centered + larger padding
      return baseClasses + ' rounded-full px-5 py-3 border-gray-300 text-center focus:ring-2 focus:ring-primary';
    case 'variation3':
    default:
      // Standard CTA3 styling
      return baseClasses + ' border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent';
  }
}

function getTextareaClasses(variation) {
  // Base classes similar to form input but with textarea-specific styling
  const baseClasses = 'w-full px-4 py-3 border focus:outline-none';
  
  switch (variation) {
    case 'variation1':
      // Exact CTA1 styling: rounded-2xl + glass effect with white text + white focus ring
      // Note: placeholder color is handled via inline styles
      return baseClasses + ' rounded-2xl bg-white/10 backdrop-blur-md border-white/20 text-white focus:ring-2 focus:ring-white/50 focus:border-white/40';
    case 'variation2':
      // CTA2 styling: rounded-2xl + centered + larger padding
      return baseClasses + ' rounded-2xl px-5 py-3 border-gray-300 text-center focus:ring-2 focus:ring-primary';
    case 'variation3':
    default:
      // Standard CTA3 styling
      return baseClasses + ' border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent';
  }
}

function createFormField(field, ctaVariation = 'variation3') {
  console.log('🔧 DEBUG: createFormField called with:', {
    field_key: field.field_key,
    placeholder: field.placeholder,
    field_type: field.field_type,
    ctaVariation: ctaVariation
  });
  
  const fieldWrapper = document.createElement('div');
  fieldWrapper.className = getFieldWrapperClasses(ctaVariation);

  // Create label
  const labelWrapper = document.createElement('div');
  labelWrapper.className = getLabelWrapperClasses(ctaVariation);
  
  const label = document.createElement('label');
  label.setAttribute('for', field.field_key);
  const labelClasses = getLabelClasses(ctaVariation);
  label.className = labelClasses;
  label.textContent = field.label;
  
  console.log('🏷️ DEBUG: Label classes for', field.field_key + ':', labelClasses);
  
  if (field.required || field.is_required) {
    const asterisk = document.createElement('span');
    asterisk.className = getRequiredAsteriskClasses(ctaVariation);
    asterisk.textContent = ' *';
    label.appendChild(asterisk);
  }
  
  labelWrapper.appendChild(label);
  fieldWrapper.appendChild(labelWrapper);

  // Create input based on field type
  let input;
  
  // Set placeholder with fallbacks based on field type
  let placeholder = field.placeholder;
  if (!placeholder) {
    // Provide sensible defaults based on field type and key
    switch (field.field_key) {
      case 'email':
        placeholder = 'Enter your email address';
        break;
      case 'name':
      case 'full_name':
        placeholder = 'Enter your full name';
        break;
      case 'phone':
        placeholder = 'Enter your phone number';
        break;
      case 'company':
        placeholder = 'Enter your company name';
        break;
      case 'country':
        placeholder = 'Select your country';
        break;
      default:
        placeholder = 'Enter ' + (field.label || field.field_key).toLowerCase();
    }
  }
  
  console.log('📝 DEBUG: Determined placeholder for', field.field_key + ':', placeholder);
  
  switch (field.field_type) {
    case 'select':
      input = document.createElement('select');
      const selectClasses = getSelectClasses(ctaVariation);
      input.className = selectClasses;
      console.log('📋 DEBUG: Select classes for', field.field_key + ':', selectClasses);
      
      // Add default option with placeholder text
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = placeholder;
      input.appendChild(defaultOption);
      
      // Add options from field.options
      if (field.options && Array.isArray(field.options)) {
        field.options.forEach(option => {
          const optionElement = document.createElement('option');
          optionElement.value = option.value || option;
          optionElement.textContent = option.label || option;
          input.appendChild(optionElement);
        });
      }
      break;
      
    case 'textarea':
      input = document.createElement('textarea');
      const textareaClasses = getTextareaClasses(ctaVariation);
      input.className = textareaClasses;
      input.rows = 4;
      input.placeholder = placeholder;
      
      // Apply placeholder color as inline style for CTA Variation 1
      if (ctaVariation === 'variation1') {
        input.style.setProperty('--placeholder-color', 'rgba(255, 255, 255, 0.6)');
        input.style.color = 'white';
        // Set placeholder color using CSS custom property
        const style = document.createElement('style');
        style.textContent = 'textarea[data-field="' + field.field_key + '"]::placeholder { color: rgba(255, 255, 255, 0.6) !important; }';
        document.head.appendChild(style);
        input.setAttribute('data-field', field.field_key);
        console.log('🎨 DEBUG: Applied white placeholder styling for textarea', field.field_key);
      }
      
      console.log('📝 DEBUG: Textarea classes for', field.field_key + ':', textareaClasses);
      break;
      
    default: // text, email, tel, etc.
      input = document.createElement('input');
      input.type = field.field_type || 'text';
      const inputClasses = getInputClasses(ctaVariation);
      input.className = inputClasses;
      input.placeholder = placeholder;
      
      // Apply placeholder color as inline style for CTA Variation 1
      if (ctaVariation === 'variation1') {
        input.style.setProperty('--placeholder-color', 'rgba(255, 255, 255, 0.6)');
        input.style.color = 'white';
        // Set placeholder color using CSS custom property
        const style = document.createElement('style');
        style.textContent = 'input[data-field="' + field.field_key + '"]::placeholder { color: rgba(255, 255, 255, 0.6) !important; }';
        document.head.appendChild(style);
        input.setAttribute('data-field', field.field_key);
        console.log('🎨 DEBUG: Applied white placeholder styling for input', field.field_key);
      }
      
      console.log('📝 DEBUG: Input classes for', field.field_key + ':', inputClasses);
  }
  
  input.id = field.field_key;
  input.name = field.field_key;
  
  if (field.required || field.is_required) {
    input.required = true;
  }
  
  fieldWrapper.appendChild(input);
  return fieldWrapper;
}

async function rebuildCheckoutForm(productId) {
  const forms = document.querySelectorAll('form[data-dynamic-checkout]');
  console.log('🔄 DEBUG: rebuildCheckoutForm called for', forms.length, 'forms with productId:', productId);
  
  for (const form of forms) {
    try {
      showToast('Loading checkout fields...', 'info', 2000);
      
      // Detect CTA variation based on form or container styling
      const ctaVariation = detectCtaVariation(form);
      console.log('🎨 DEBUG: Detected CTA variation:', ctaVariation);
      
      const fields = await fetchCheckoutFields(productId);
      console.log('📥 DEBUG: Received fields from fetchCheckoutFields:', fields.length, 'fields');
      
      // Clear existing fields
      form.innerHTML = '';
      
      // Always ensure email field is present
      const hasEmailField = fields.some(field => field.field_key === 'email');
      console.log('✉️ DEBUG: Email field exists in fetched fields:', hasEmailField);
      
      if (!hasEmailField) {
        const emailField = {
          field_key: 'email',
          label: 'Email',
          field_type: 'email',
          placeholder: 'Enter your email address',
          required: true,
          is_required: true,
          display_order: 0
        };
        fields.unshift(emailField);
        console.log('➕ DEBUG: Added default email field with placeholder:', emailField.placeholder);
      }
      
      // Sort fields by display_order
      fields.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      console.log('🔀 DEBUG: Fields sorted by display_order:', fields.map(f => f.field_key + '(' + (f.display_order || 0) + ')').join(', '));
      
      // Create form fields
      fields.forEach((field, index) => {
        console.log('🏗️ DEBUG: Creating field ' + (index + 1) + '/' + fields.length + ':', {
          key: field.field_key,
          label: field.label,
          type: field.field_type,
          required: field.required || field.is_required,
          placeholder: field.placeholder || 'No placeholder',
          isRequired: field.is_required,
          requiredProp: field.required,
          variation: ctaVariation
        });
        const fieldElement = createFormField(field, ctaVariation);
        form.appendChild(fieldElement);
      });
      
      console.log('✅ DEBUG: Checkout form rebuilt successfully with', fields.length, 'fields');
      
    } catch (error) {
      console.error('Error rebuilding checkout form:', error);
      showToast('Error loading checkout fields', 'error');
    }
  }
}

function initializeForms() {
  // Initialize regular forms
  document.querySelectorAll('form[data-form-type]').forEach(form => {
    if (form.dataset.formInitialized) return;
    form.dataset.formInitialized = 'true';

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      try {
        showToast('Processing...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast('Form submitted successfully!', 'success');
        form.reset();
      } catch (error) {
        showToast('Error submitting form. Please try again.', 'error');
      }
    });
  });

  // Initialize dynamic checkout forms
  const allForms = document.querySelectorAll('form');
  const dynamicForms = document.querySelectorAll('form[data-dynamic-checkout]');
  console.log('🔍 DEBUG: Found', allForms.length, 'total forms on page');
  console.log('🔍 DEBUG: Found', dynamicForms.length, 'forms with data-dynamic-checkout attribute');
  
  // Debug: Log all forms and their attributes
  allForms.forEach((form, index) => {
    const attributes = Array.from(form.attributes).map(attr => attr.name + '="' + attr.value + '"');
    const parentElement = form.parentElement;
    const parentClass = parentElement ? parentElement.className : 'no parent';
    
    console.log('📋 DEBUG: Form ' + (index + 1) + ':', {
      tagName: form.tagName,
      attributes: attributes,
      parentClass: parentClass,
      formData: form.innerHTML.includes('data-dynamic-checkout'),
      innerHTML: form.innerHTML.length > 200 ? form.innerHTML.substring(0, 200) + '...' : form.innerHTML
    });
  });
  
  console.log('🚀 DEBUG: Found', dynamicForms.length, 'dynamic checkout forms to initialize');
  
  dynamicForms.forEach((form, index) => {
    console.log('🔍 DEBUG: Processing dynamic form', index + 1, 'of', dynamicForms.length);
    
    if (form.dataset.dynamicInitialized) {
      console.log('⏭️ DEBUG: Form already initialized, skipping');
      return;
    }
    form.dataset.dynamicInitialized = 'true';

    // Get productId from nearest button with checkout action
    const checkoutButton = form.parentElement?.querySelector('[data-action="checkout"]');
    let productId = null;
    
    console.log('🔗 DEBUG: Looking for checkout button near form...');
    console.log('🔗 DEBUG: Found checkout button:', !!checkoutButton);
    
    if (checkoutButton?.dataset.actionData) {
      try {
        const actionData = JSON.parse(checkoutButton.dataset.actionData);
        productId = actionData.productId;
        console.log('🎯 DEBUG: Extracted productId from button:', productId);
      } catch (e) {
        console.warn('Could not parse checkout button action data');
      }
    } else {
      console.log('📝 DEBUG: No action data found on checkout button');
    }

    console.log('🏁 DEBUG: Calling rebuildCheckoutForm with productId:', productId);
    // Rebuild form with dynamic fields
    rebuildCheckoutForm(productId);
  });
}

// Button actions
function initializeButtons() {
  document.querySelectorAll('[data-action]').forEach(button => {
    if (button.dataset.actionInitialized) return;
    button.dataset.actionInitialized = 'true';

    button.addEventListener('click', function(e) {
      const action = this.dataset.action;
      const actionData = this.dataset.actionData ? JSON.parse(this.dataset.actionData) : {};
      
      switch (action) {
        case 'scroll':
        case 'scroll-to':
          if (actionData.target) {
            const target = document.querySelector(actionData.target);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
          break;
          
        case 'open_link':
        case 'open-url':
          if (actionData.url) {
            let url = actionData.url;
            if (url && !/^https?:\\/\\//i.test(url)) {
              url = 'https://' + url;
            }
            window.open(url, '_blank');
          }
          break;
          
        case 'checkout':
          if (actionData.checkoutUrl) {
            window.open(actionData.checkoutUrl, '_blank');
          } else if (actionData.productId) {
            handleCheckout(actionData);
          }
          break;
          
        case 'track-event':
          if (window.trackEvent) {
            window.trackEvent(actionData.eventType || 'click', actionData);
          }
          break;
      }
    });
  });
}

${this.generateTrackingIntegration(pageData)}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎬 DEBUG: Page loaded, initializing forms and buttons...');
  console.log('📋 DEBUG: PAGE_CONFIG:', PAGE_CONFIG);
  
  initializeForms();
  initializeButtons();
  
  // Track page view
  trackEvent('page_view', {
    page_title: PAGE_CONFIG.title,
    page_slug: PAGE_CONFIG.slug,
    referrer: document.referrer,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  });
  
  // Animate elements on load
  document.querySelectorAll('[data-section-id]').forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Re-initialize on dynamic content changes
  const observer = new MutationObserver(function(mutations) {
    let shouldReinitialize = false;
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldReinitialize = true;
      }
    });
    if (shouldReinitialize) {
      setTimeout(() => {
        initializeForms();
        initializeButtons();
      }, 100);
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
});

// Global functions
window.showToast = showToast;
window.trackEvent = trackEvent;

})();`;
  }

  private generateTrackingIntegration(pageData: any): string {
    const trackingConfig = pageData.tracking_config;
    if (!trackingConfig) {
      return '// No tracking configuration';
    }

    let integration = '';

    if (trackingConfig.facebook_pixel_id) {
      integration += this.generateFacebookPixelIntegration(trackingConfig);
    }

    if (trackingConfig.google_analytics_id) {
      integration += this.generateGoogleAnalyticsIntegration(trackingConfig);
    }

    if (trackingConfig.clarity_id) {
      integration += this.generateClarityIntegration(trackingConfig);
    }

    return integration;
  }

  private generateFacebookPixelIntegration(trackingConfig: any): string {
    const pixelId = trackingConfig.facebook_pixel_id;
    if (!pixelId || !/^\d{15,16}$/.test(pixelId)) {
      return '// Invalid Facebook Pixel ID';
    }

    return `
// Facebook Pixel Integration
(function() {
  !function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  
  fbq('init', '${pixelId}');
  ${trackingConfig.conversion_events?.page_view ? "fbq('track', 'PageView');" : ''}
  
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
})();
`;
  }

  private generateGoogleAnalyticsIntegration(trackingConfig: any): string {
    const gaId = trackingConfig.google_analytics_id;
    if (!gaId || !gaId.startsWith('G-')) {
      return '// Invalid Google Analytics ID';
    }

    return `
// Google Analytics Integration
(function() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}', {
    page_title: document.title,
    page_location: window.location.href
  });

  window.trackGoogleEvent = function(eventName, eventData) {
    gtag('event', eventName, {
      event_category: 'Landing Page',
      event_label: eventData.label || '',
      value: eventData.value || 0
    });
  };
})();
`;
  }

  private generateClarityIntegration(trackingConfig: any): string {
    const clarityId = trackingConfig.clarity_id;
    if (!clarityId || clarityId.length < 8) {
      return '// Invalid Clarity ID';
    }

    return `
// Microsoft Clarity Integration
(function() {
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "${clarityId}");
})();
`;
  }

  private escapeJs(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}
