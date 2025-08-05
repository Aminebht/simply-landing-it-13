import { LandingPageComponent } from '@/types/components';

export interface ReactProjectTemplate {
  'package.json': string;
  'index.html': string;
  'vite.config.js': string;
  'src/main.jsx': string;
  'src/App.jsx': string;
  'src/index.css': string;
  'src/components/index.js': string;
  '_headers': string;
  'netlify.toml': string;
}

export class ReactProjectTemplateGenerator {
  generateTemplate(pageData: any): ReactProjectTemplate {
    return {
      'package.json': this.generatePackageJson(),
      'index.html': this.generateIndexHtml(pageData),
      'vite.config.js': this.generateViteConfig(),
      'src/main.jsx': this.generateMainJsx(),
      'src/App.jsx': this.generateAppJsx(pageData),
      'src/index.css': this.generateIndexCss(pageData),
      'src/components/index.js': this.generateComponentsIndex(),
      '_headers': this.generateNetlifyHeaders(),
      'netlify.toml': this.generateNetlifyToml()
    };
  }

  private generatePackageJson(): string {
    return JSON.stringify({
      name: "landing-page-react",
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview"
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.263.1",
        clsx: "^2.0.0"
      },
      devDependencies: {
        "@types/react": "^18.2.15",
        "@types/react-dom": "^18.2.7",
        "@vitejs/plugin-react": "^4.0.3",
        vite: "^4.4.5"
      }
    }, null, 2);
  }

  private generateIndexHtml(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    const seoConfig = pageData.seo_config || this.getDefaultSeoConfig();
    
    return `<!DOCTYPE html>
<html lang="${globalTheme.language || 'en'}" dir="${globalTheme.direction || 'ltr'}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Meta Tags -->
    <title>${this.escapeHtml(seoConfig.title || 'Landing Page')}</title>
    <meta name="description" content="${this.escapeHtml(seoConfig.description || 'Professional landing page')}" />
    <meta name="keywords" content="${(seoConfig.keywords || []).join(', ')}" />
    <link rel="canonical" href="${seoConfig.canonical || ''}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${this.escapeHtml(seoConfig.title || 'Landing Page')}" />
    <meta property="og:description" content="${this.escapeHtml(seoConfig.description || 'Professional landing page')}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${seoConfig.ogImage || ''}" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${this.escapeHtml(seoConfig.title || 'Landing Page')}" />
    <meta name="twitter:description" content="${this.escapeHtml(seoConfig.description || 'Professional landing page')}" />
    
    <!-- Google Fonts -->
    ${this.generateGoogleFontsLink(pageData)}
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '${globalTheme.primaryColor || '#3b82f6'}',
              secondary: '${globalTheme.secondaryColor || '#f3f4f6'}',
            },
            fontFamily: {
              sans: ['${globalTheme.fontFamily || 'Inter'}', 'sans-serif'],
            }
          }
        }
      }
    </script>
    
    <!-- Tracking Scripts -->
    ${this.generateTrackingScripts(pageData.tracking_config)}
  </head>
  <body style="background-color: ${globalTheme.backgroundColor || '#ffffff'}">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
  }

  private generateViteConfig(): string {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})`;
  }

  private generateMainJsx(): string {
    return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;
  }

  private generateAppJsx(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    const components = pageData.components || [];
    
    return `import React from 'react'
import { 
  ${components.map((comp: LandingPageComponent) => this.getComponentImportName(comp)).join(',\n  ')}
} from './components'

function App() {
  const globalTheme = ${JSON.stringify(globalTheme, null, 2)};
  
  return (
    <div 
      id="landing-page" 
      className="min-h-screen"
      style={{
        fontFamily: globalTheme.fontFamily || 'Inter, sans-serif',
        direction: globalTheme.direction || 'ltr',
        backgroundColor: globalTheme.backgroundColor || '#ffffff'
      }}
    >
      ${components
        .sort((a: LandingPageComponent, b: LandingPageComponent) => a.order_index - b.order_index)
        .map((comp: LandingPageComponent) => this.generateComponentJSX(comp))
        .join('\n      ')}
    </div>
  )
}

export default App`;
  }

  private generateIndexCss(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    
    return `/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: ${globalTheme.fontFamily || 'Inter'}, sans-serif;
  line-height: 1.6;
  color: #1a202c;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

/* Layout stability */
#root, #landing-page {
  min-height: 100vh;
  width: 100%;
}

/* Button interactions */
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
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}`;
  }

  private generateComponentsIndex(): string {
    return `// This file will be populated with actual component exports
// Components will be cleaned and exported from here
export {};`;
  }

  private generateNetlifyHeaders(): string {
    return `/*
  # Security Headers
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

# Cache Control
*.html
  Cache-Control: no-cache

*.css
  Cache-Control: public, max-age=31536000

*.js
  Cache-Control: public, max-age=31536000

*.png, *.jpg, *.jpeg, *.gif, *.webp, *.svg
  Cache-Control: public, max-age=31536000`;
  }

  private generateNetlifyToml(): string {
    return `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;
  }

  private generateGoogleFontsLink(pageData: any): string {
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

    return Array.from(fontUrls)
      .map(url => `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${url}" rel="stylesheet">`)
      .join('\n    ');
  }

  private generateTrackingScripts(trackingConfig: any): string {
    if (!trackingConfig) return '';
    
    let scripts = '';
    
    // Facebook Pixel
    if (trackingConfig.facebook_pixel_id) {
      scripts += `
    <!-- Facebook Pixel -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${trackingConfig.facebook_pixel_id}');
      fbq('track', 'PageView');
    </script>
    <noscript>
      <img height="1" width="1" style="display:none"
           src="https://www.facebook.com/tr?id=${trackingConfig.facebook_pixel_id}&ev=PageView&noscript=1"/>
    </noscript>`;
    }
    
    // Google Analytics
    if (trackingConfig.google_analytics_id) {
      scripts += `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${trackingConfig.google_analytics_id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingConfig.google_analytics_id}');
    </script>`;
    }
    
    // Microsoft Clarity
    if (trackingConfig.clarity_id) {
      scripts += `
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${trackingConfig.clarity_id}");
    </script>`;
    }
    
    return scripts;
  }

  private getComponentImportName(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    const variation = component.component_variation?.variation_number;
    
    if (!componentType || !variation) return '';
    
    return `${this.capitalize(componentType)}Variation${variation}`;
  }

  private generateComponentJSX(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    const variation = component.component_variation?.variation_number;
    
    if (!componentType || !variation) return '';
    
    const componentName = `${this.capitalize(componentType)}Variation${variation}`;
    
    return `<${componentName}
        key="${component.id}"
        content={${JSON.stringify(component.content || {})}}
        styles={${JSON.stringify(component.custom_styles || {})}}
        visibility={${JSON.stringify(component.visibility || {})}}
        mediaUrls={${JSON.stringify(component.media_urls || {})}}
        customActions={${JSON.stringify(component.custom_actions || {})}}
        globalTheme={globalTheme}
        isEditing={false}
        viewport="responsive"
      />`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getDefaultGlobalTheme() {
    return {
      primaryColor: '#3b82f6',
      secondaryColor: '#f3f4f6',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
      direction: 'ltr',
      language: 'en'
    };
  }

  private getDefaultSeoConfig() {
    return {
      title: 'Landing Page',
      description: 'Professional landing page',
      keywords: [],
      ogImage: '',
      canonical: ''
    };
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
