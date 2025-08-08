export class AssetGenerator {
  generateAssets(pageData: any): { css: string; js: string } {
    const css = this.generateCustomCSS(pageData);
    const js = this.generateInteractivityJS(pageData);

    return { css, js };
  }

  private generateCustomCSS(pageData: any): string {
    let css = `/* Custom styles for ${pageData.slug || 'landing-page'} */\n`;

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

})();`;
  }
}
