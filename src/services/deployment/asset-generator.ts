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
        case 'scroll-to':
          if (actionData.target) {
            const target = document.querySelector(actionData.target);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }
          break;
          
        case 'open-url':
          if (actionData.url) {
            if (actionData.newTab) {
              window.open(actionData.url, '_blank');
            } else {
              window.location.href = actionData.url;
            }
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
