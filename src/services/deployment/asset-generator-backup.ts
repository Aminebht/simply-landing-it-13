export class AssetGenerator {
  generateAssets(pageData: any): { css: string; js: string } {
    const css = this.generateCustomCSS(pageData);
    const js = this.generateInteractivityJS(pageData);

    return { css, js };
  }

  private generateCustomCSS(pageData: any): string {
    let css = `/* Custom styles for ${pageData.slug || 'landing-page'} */\n`;

    // Add CSS variables for theming (moved from HTML)
    css += this.generateThemeVariables(pageData);

    // Add base styles (moved from StyleGenerator)
    css += this.generateBaseStyles();

    // Add global theme styles
    if (pageData.global_theme) {
      css += this.generateGlobalThemeCSS(pageData.global_theme);
    }

    // Add component-specific styles
    pageData.components?.forEach((component: any, index: number) => {
      if (component.custom_styles) {
        css += this.generateComponentCSS(component, index);
      }
    });

    return this.minifyCSS(css);
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
/* Base styles and layout stability fixes */
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

/* Prevent white gaps between components */
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

/* Eliminate gaps between sections */
[data-section-id] + [data-section-id] {
  margin-top: 0 !important;
  border-top: none !important;
  padding-top: 0 !important;
}

/* Enhanced button interactions */
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

/* Form styling */
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

/* Container responsive */
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

/* Responsive grid utilities */
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
    return `(function() {
'use strict';

// Supabase Configuration (moved from embedded script)
${this.generateSupabaseConfig(pageData)}

// Utility function to generate UUID (fallback if not available globally)
function generateUUID() {
  if (typeof window.generateUUID === 'function') {
    return window.generateUUID();
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session Management
function getSessionId(){
  let sessionId=sessionStorage.getItem('landing_session_id');
  if(!sessionId){
    sessionId='session_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);
    sessionStorage.setItem('landing_session_id',sessionId);
  }
  return sessionId;
}

// Event Tracking
function trackEvent(eventType,eventData){
  console.log('Landing Page Event:',{
    event_type:eventType,
    event_data:eventData,
    timestamp:new Date().toISOString(),
    page_url:window.location.href
  });
}

// Checkout handler (calls secure edge function)
async function handleCheckout(actionData) {
  console.log('Starting checkout process with action:', actionData);
  try {
    // Collect all form fields (input, select, textarea) with name or id
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
        // Check if required field is empty
        if (input.required && !input.value.trim()) {
          isValid = false;
          missingFields.push(input.placeholder || key);
        }
      }
    });
    console.log('Form data collected:', formData);
    // Validate required fields
    if (!isValid) {
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }
    // Validate required email
    if (!userEmail) {
      alert("Please enter your email to proceed with checkout.");
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    // Generate proper UUID for order ID
    const orderId = generateUUID();
    const buyerName = formData.name || formData.full_name || userEmail.split('@')[0];
    // Get amount, defaulting to 0 if not provided
    const amount = Number(actionData.amount) || 0;
    console.log('Processing checkout for productId:', actionData.productId, 'amount:', amount);
    showToast('Processing your order...', 'info');
    console.log('Calling secure checkout edge function...', {
      orderId,
      productId: actionData.productId,
      amount,
      buyerEmail: userEmail,
      buyerName,
      pageSlug: PAGE_CONFIG.slug
    });
    // Call the secure-checkout edge function
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
  toast.className = \`toast \${type}\`;
  toast.innerHTML = \`
    <div class="toast-content">
      <div class="toast-message">\${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  \`;

  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => toast.remove(), duration);
}

// Form handling
function initializeForms() {
  document.querySelectorAll('form[data-form-type]').forEach(form => {
    if (form.dataset.formInitialized) return;
    form.dataset.formInitialized = 'true';

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      try {
        showToast('Processing...', 'info');
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('Form submitted successfully!', 'success');
        form.reset();
      } catch (error) {
        showToast('Error submitting form. Please try again.', 'error');
      }
    });
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
            // Add https:// prefix if not present to ensure external links work properly
            if (url && !/^https?:\/\//i.test(url)) {
              url = 'https://' + url;
            }
            // Always open external links in new tab to avoid navigating away
            window.open(url, '_blank');
          }
          break;
          
        case 'checkout':
          if (actionData.checkoutUrl) {
            window.open(actionData.checkoutUrl, '_blank');
          } else if (actionData.productId) {
            // Use the same Supabase-based checkout as the builder
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

// Tracking scripts integration (moved from embedded)
${this.generateTrackingIntegration(pageData)}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  initializeForms();
  initializeButtons();
  
  // Track page view
  trackEvent('page_view',{
    page_title:PAGE_CONFIG.title,
    page_slug:PAGE_CONFIG.slug,
    referrer:document.referrer,
    viewport_width:window.innerWidth,
    viewport_height:window.innerHeight
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

// Full checkout handler (calls secure edge function)
async function handleCheckout(actionData) {
  // Mirror builder logic for collecting form data and validation
  console.log('Starting checkout process with action:', actionData);
  try {
    // Collect all form fields (input, select, textarea) with name or id
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
        // Check if required field is empty
        if (input.required && !input.value.trim()) {
          isValid = false;
          missingFields.push(input.placeholder || key);
        }
      }
    });
    console.log('Form data collected:', formData);
    // Validate required fields
    if (!isValid) {
      alert('Please fill in all required fields: ' + missingFields.join(', '));
      return;
    }
    // Validate required email
    if (!userEmail) {
      alert("Please enter your email to proceed with checkout.");
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    // Generate proper UUID for order ID
    const orderId = generateUUID();
    const buyerName = formData.name || formData.full_name || userEmail.split('@')[0];
    // Get amount, defaulting to 0 if not provided
    const amount = Number(actionData.amount) || 0;
    console.log('Processing checkout for productId:', actionData.productId, 'amount:', amount);
    showToast('Processing your order...', 'info');
    console.log('Calling secure checkout edge function...', {
      orderId,
      productId: actionData.productId,
      amount,
      buyerEmail: userEmail,
      buyerName,
      pageSlug: PAGE_CONFIG.slug
    });
    // Call the secure-checkout edge function
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
  toast.className = \`toast \${type}\`;
  toast.innerHTML = \`
    <div class="toast-content">
      <div class="toast-message">\${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  \`;

  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => toast.remove(), duration);
}

// Form handling
function initializeForms() {
  document.querySelectorAll('form[data-form-type]').forEach(form => {
    if (form.dataset.formInitialized) return;
    form.dataset.formInitialized = 'true';

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      try {
        showToast('Processing...', 'info');
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('Form submitted successfully!', 'success');
        form.reset();
      } catch (error) {
        showToast('Error submitting form. Please try again.', 'error');
      }
    });
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
            // Add https:// prefix if not present to ensure external links work properly
            if (url && !/^https?:\/\//i.test(url)) {
              url = 'https://' + url;
            }
            // Always open external links in new tab to avoid navigating away
            window.open(url, '_blank');
          }
          break;
          
        case 'checkout':
          if (actionData.checkoutUrl) {
            window.open(actionData.checkoutUrl, '_blank');
          } else if (actionData.productId) {
            // Use the same Supabase-based checkout as the builder
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

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  initializeForms();
  initializeButtons();
  
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

  private generateSupabaseConfig(pageData: any): string {
    const supabaseUrl = 'https://ijrisuqixfqzmlomlgjb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';
    
    return `// Supabase configuration
(function() {
  // Load Supabase SDK
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@supabase/supabase-js@2';
  script.onload = function() {
    window.supabase = window.supabase.createClient('${supabaseUrl}', '${supabaseAnonKey}', {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true
      }
    });
  };
  document.head.appendChild(script);
})();

// Global constants
const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
const PAGE_CONFIG = {
  slug: '${pageData.slug || 'landing-page'}',
  title: '${this.escapeJs(pageData.seo_config?.title || 'Landing Page')}',
  url: window.location.href,
  language: '${pageData.global_theme?.language || 'en'}'
};
`;
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
    if (!pixelId || !/^\\d{15,16}$/.test(pixelId)) {
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
      .replace(/\\\\/g, '\\\\\\\\')
      .replace(/'/g, "\\\\'")
      .replace(/"/g, '\\\\"')
      .replace(/\\n/g, '\\\\n')
      .replace(/\\r/g, '\\\\r');
  }
}
