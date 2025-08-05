import { LandingPageComponent } from '@/types/components';

export interface ReactProjectTemplate {
  'package.json': string;
  'index.html': string;
  'vite.config.js': string;
  'src/main.jsx': string;
  'src/App.jsx': string;
  'src/index.css': string;
  'src/components/index.js': string;
  'src/utils/cn.js': string;
  'src/utils/buttonRenderer.jsx': string;
  '_headers': string;
  'netlify.toml': string;
  'tailwind.config.js': string;
  'postcss.config.js': string;
  [key: string]: string; // Allow dynamic component files
}

export class ReactProjectTemplateGenerator {
  generateTemplate(pageData: any): ReactProjectTemplate {
    const components = pageData.components || [];
    const componentFiles: Record<string, string> = {};
    
    // Generate required component files
    components.forEach((component: LandingPageComponent) => {
      const componentType = component.component_variation?.component_type;
      const variation = component.component_variation?.variation_number;
      
      if (componentType && variation) {
        const fileName = `${this.capitalize(componentType)}Variation${variation}.jsx`;
        componentFiles[`src/components/${fileName}`] = this.generateComponentFile(component);
      }
    });

    return {
      'package.json': this.generatePackageJson(),
      'index.html': this.generateIndexHtml(pageData),
      'vite.config.js': this.generateViteConfig(),
      'src/main.jsx': this.generateMainJsx(),
      'src/App.jsx': this.generateAppJsx(pageData),
      'src/index.css': this.generateIndexCss(pageData),
      'src/components/index.js': this.generateComponentsIndex(),
      'src/utils/cn.js': this.generateCnUtility(),
      'src/utils/buttonRenderer.jsx': this.generateButtonRenderer(),
      '_headers': this.generateNetlifyHeaders(),
      'netlify.toml': this.generateNetlifyToml(),
      'tailwind.config.js': this.generateTailwindConfig(pageData),
      'postcss.config.js': this.generatePostCSSConfig(),
      ...componentFiles
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
        vite: "^4.4.5",
        tailwindcss: "^3.3.3",
        autoprefixer: "^10.4.14",
        postcss: "^8.4.27"
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
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
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
    
    return `@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom CSS variables for theme integration */
:root {
  --primary-color: ${globalTheme.primaryColor || '#3b82f6'};
  --secondary-color: ${globalTheme.secondaryColor || '#f3f4f6'};
  --background-color: ${globalTheme.backgroundColor || '#ffffff'};
  --font-family: '${globalTheme.fontFamily || 'Inter'}', sans-serif;
}

/* Base layer customizations */
@layer base {
  html {
    font-family: var(--font-family);
    scroll-behavior: smooth;
  }
  
  body {
    background-color: var(--background-color);
    color: #1a202c;
    overflow-x: hidden;
    line-height: 1.6;
  }
  
  /* Smooth transitions for better UX */
  * {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}

/* Component layer customizations */
@layer components {
  /* Enhanced button styles */
  .btn {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;
  }
  
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
  
  .btn-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }
  
  /* Form elements */
  .form-input {
    @apply w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }
  
  /* Container utilities */
  .container-responsive {
    @apply w-full mx-auto px-4 sm:px-6 lg:px-8;
    max-width: 1280px;
  }
}

/* Utility layer customizations */
@layer utilities {
  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn 0.6s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.6s ease-out;
  }
  
  /* Custom scrollbar */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgb(156 163 175) transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgb(156 163 175);
    border-radius: 3px;
  }
}

/* Keyframe animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Print styles */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  
  a, a:visited {
    text-decoration: underline;
  }
  
  img {
    max-width: 100% !important;
  }
  
  @page {
    margin: 0.5cm;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  * {
    border-color: ButtonText;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;
  }

  private generateComponentsIndex(): string {
    return `// Auto-generated component exports for React deployment
// These components are production-ready versions of landing page components

// Hero Components
export { default as HeroVariation1 } from './HeroVariation1';
export { default as HeroVariation2 } from './HeroVariation2';
export { default as HeroVariation3 } from './HeroVariation3';
export { default as HeroVariation4 } from './HeroVariation4';
export { default as HeroVariation5 } from './HeroVariation5';
export { default as HeroVariation6 } from './HeroVariation6';

// Features Components
export { default as FeaturesVariation1 } from './FeaturesVariation1';
export { default as FeaturesVariation2 } from './FeaturesVariation2';
export { default as FeaturesVariation3 } from './FeaturesVariation3';
export { default as FeaturesVariation4 } from './FeaturesVariation4';
export { default as FeaturesVariation5 } from './FeaturesVariation5';
export { default as FeaturesVariation6 } from './FeaturesVariation6';

// Pricing Components
export { default as PricingVariation1 } from './PricingVariation1';
export { default as PricingVariation2 } from './PricingVariation2';
export { default as PricingVariation3 } from './PricingVariation3';
export { default as PricingVariation4 } from './PricingVariation4';
export { default as PricingVariation5 } from './PricingVariation5';
export { default as PricingVariation6 } from './PricingVariation6';

// CTA Components
export { default as CtaVariation1 } from './CtaVariation1';
export { default as CtaVariation2 } from './CtaVariation2';
export { default as CtaVariation3 } from './CtaVariation3';
export { default as CtaVariation4 } from './CtaVariation4';
export { default as CtaVariation5 } from './CtaVariation5';
export { default as CtaVariation6 } from './CtaVariation6';

// FAQ Components
export { default as FaqVariation1 } from './FaqVariation1';
export { default as FaqVariation2 } from './FaqVariation2';
export { default as FaqVariation3 } from './FaqVariation3';
export { default as FaqVariation4 } from './FaqVariation4';
export { default as FaqVariation5 } from './FaqVariation5';
export { default as FaqVariation6 } from './FaqVariation6';

// Testimonials Components
export { default as TestimonialsVariation1 } from './TestimonialsVariation1';
export { default as TestimonialsVariation2 } from './TestimonialsVariation2';
export { default as TestimonialsVariation3 } from './TestimonialsVariation3';
export { default as TestimonialsVariation4 } from './TestimonialsVariation4';
export { default as TestimonialsVariation5 } from './TestimonialsVariation5';
export { default as TestimonialsVariation6 } from './TestimonialsVariation6';`;
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

# MIME Type Headers for JavaScript modules (all possible patterns)
*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

*.jsx
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

*.mjs
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

*.ts
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

*.tsx
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

/assets/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

/src/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

/src/*.jsx
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

# Cache Control for other assets
*.html
  Cache-Control: no-cache

*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000

/assets/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000

*.png, *.jpg, *.jpeg, *.gif, *.webp
  Cache-Control: public, max-age=31536000

*.svg
  Content-Type: image/svg+xml
  Cache-Control: public, max-age=31536000

*.woff, *.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000

*.json
  Content-Type: application/json
  Cache-Control: public, max-age=31536000`;
  }

  private generateNetlifyToml(): string {
    return `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# MIME type configuration for JavaScript modules
[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.jsx"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.mjs"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/assets/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/src/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/src/*.jsx"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"

[[headers]]
  for = "/assets/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"

# Single Page Application redirect
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

  private generateTailwindConfig(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${globalTheme.primaryColor || '#3b82f6'}',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '${globalTheme.primaryColor || '#3b82f6'}',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          DEFAULT: '${globalTheme.secondaryColor || '#f3f4f6'}',
          50: '#f9fafb',
          100: '${globalTheme.secondaryColor || '#f3f4f6'}',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        background: '${globalTheme.backgroundColor || '#ffffff'}',
      },
      fontFamily: {
        sans: ['${globalTheme.fontFamily || 'Inter'}', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      }
    },
  },
  plugins: [],
}`;
  }

  private generatePostCSSConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

  private generateComponentFile(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    const variation = component.component_variation?.variation_number;
    
    if (!componentType || !variation) return '';
    
    const componentName = `${this.capitalize(componentType)}Variation${variation}`;
    
    return `import React from 'react';
import { cn } from '../utils/cn';
import { renderButton } from '../utils/buttonRenderer';

const ${componentName} = ({ 
  content = {}, 
  styles = {}, 
  visibility = {},
  mediaUrls = {},
  customActions = {},
  globalTheme = {},
  isEditing = false,
  viewport = 'responsive'
}) => {
  const primaryColor = globalTheme.primaryColor || '#3b82f6';

  return (
    <section 
      className="w-full px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16"
      style={{
        backgroundColor: globalTheme.backgroundColor || '#ffffff',
        color: globalTheme.textColor || '#1f2937'
      }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Component content goes here */}
        <div className="text-center">
          {content.headline && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {content.headline}
            </h1>
          )}
          
          {content.subheadline && (
            <p className="text-lg md:text-xl mb-8 text-gray-600">
              {content.subheadline}
            </p>
          )}
          
          {content.ctaButton && customActions?.['cta-button'] && (
            <div className="mt-8">
              {renderButton({
                action: customActions['cta-button'],
                content: content.ctaButton,
                className: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors",
                style: { backgroundColor: primaryColor }
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};`;
  }

  private generateCnUtility(): string {
    return `import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}`;
  }

  private generateButtonRenderer(): string {
    return `import React from 'react';

export const renderButton = ({ 
  action, 
  content, 
  className = '', 
  style = {},
  as = 'primary' 
}) => {
  const handleClick = () => {
    if (action?.type === 'marketplace_checkout' && action.url) {
      window.open(action.url, '_blank');
    } else if (action?.type === 'external_link' && action.url) {
      window.open(action.url, '_blank');
    } else if (action?.type === 'scroll_to' && action.target_id) {
      const element = document.getElementById(action.target_id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={style}
    >
      {content}
    </button>
  );
};`;
  }
}
