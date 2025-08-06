import { LandingPageComponent } from '@/types/components';

export interface ReactProjectTemplate {
  'index.html': string;
  '_headers': string;
  'netlify.toml': string;
  'public/favicon.svg': string;
  'public/robots.txt': string;
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
        try {
          const fileName = `${this.capitalize(componentType)}Variation${variation}.jsx`;
          const componentContent = this.generateComponentFile(component);
          
          // Only add if component content is valid
          if (componentContent && componentContent.trim()) {
            componentFiles[`src/components/${fileName}`] = componentContent;
          }
        } catch (error) {
          console.warn(`Failed to generate component file for ${componentType}Variation${variation}:`, error);
        }
      }
    });

    return {
      'index.html': this.generateIndexHtml(pageData),
      '_headers': this.generateNetlifyHeaders(),
      'netlify.toml': this.generateNetlifyToml(),
      'public/favicon.svg': this.generateFavicon(),
      'public/robots.txt': this.generateRobotsTxt(),
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
    
    // Generate production-ready HTML with inline React bundle
    const reactBundle = this.generateInlineReactBundle(pageData);
    const styles = this.generateInlineStyles(pageData);
    
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
    
    <!-- Inline Styles -->
    <style>${styles}</style>
  </head>
  <body style="background: ${globalTheme.backgroundColor || '#ffffff'}">
    <div id="root"></div>
    
    <!-- React and React DOM from CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Debug React loading -->
    <script>
      console.log('React:', typeof React);
      console.log('ReactDOM:', typeof ReactDOM);
      if (typeof React === 'undefined') {
        console.error('React failed to load!');
      }
      if (typeof ReactDOM === 'undefined') {
        console.error('ReactDOM failed to load!');
      }
    </script>
    
    <!-- Inline React Bundle -->
    <script>
      ${reactBundle}
      
      // Simple fallback rendering if React components fail
      setTimeout(() => {
        const rootElement = document.getElementById('root');
        if (rootElement && (!rootElement.children || rootElement.children.length === 0)) {
          console.warn('React components did not render, using fallback');
          rootElement.innerHTML = \`
            <div style="min-height: 100vh; font-family: Inter, sans-serif;">
              ${this.generateFallbackHTML(pageData)}
            </div>
          \`;
        }
      }, 1000);
    </script>
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

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>Please check the console for more details.</p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React app with error handling
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to initialize React app:', error);
  // Fallback: Show basic content
  document.getElementById('root').innerHTML = \`
    <div style="padding: 20px; text-align: center;">
      <h1>Landing Page</h1>
      <p>React app failed to load. Check console for details.</p>
      <p>Error: \${error.message}</p>
    </div>
  \`;
}`;
  }

  private generateAppJsx(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    const components = pageData.components || [];
    
    // Filter out invalid component imports
    const validComponentImports = components
      .map((comp: LandingPageComponent) => this.getComponentImportName(comp))
      .filter(name => name && name.trim() !== '');
    
    // Generate imports only if we have valid components
    const importStatement = validComponentImports.length > 0 
      ? `import React from 'react'
import { 
  ${validComponentImports.join(',\n  ')}
} from './components'`
      : `import React from 'react'`;
    
    return `${importStatement}

function App() {
  // Debug logging
  console.log('React App initializing...');
  console.log('Components data:', ${JSON.stringify(components.length)} components);
  
  // Error handling for JSON parsing
  let globalTheme;
  try {
    globalTheme = ${JSON.stringify(globalTheme, null, 2)};
    console.log('Global theme loaded:', globalTheme);
  } catch (error) {
    console.error('Failed to parse global theme:', error);
    globalTheme = {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter, sans-serif',
      direction: 'ltr',
      language: 'en'
    };
  }
  
  console.log('React App rendering...');
  
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
        .filter((comp: LandingPageComponent) => {
          const componentType = comp.component_variation?.component_type;
          const variation = comp.component_variation?.variation_number;
          return componentType && variation;
        })
        .sort((a: LandingPageComponent, b: LandingPageComponent) => a.order_index - b.order_index)
        .map((comp: LandingPageComponent) => this.generateComponentJSX(comp))
        .join('\n      ')}
      ${components.length === 0 ? `
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome</h1>
          <p className="text-lg text-gray-600">Your landing page is ready!</p>
          <p className="text-sm text-gray-500 mt-4">Debug: React app loaded successfully</p>
        </div>
      </div>` : ''}
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

  private generateComponentsIndex(components: LandingPageComponent[]): string {
    const usedComponents = components.map((comp: LandingPageComponent) => {
      const componentType = comp.component_variation?.component_type;
      const variation = comp.component_variation?.variation_number;
      
      if (componentType && variation) {
        const componentName = `${this.capitalize(componentType)}Variation${variation}`;
        return `export { default as ${componentName} } from './${componentName}';`;
      }
      return null;
    }).filter(Boolean);

    return `// Auto-generated component exports for React deployment
// These components are production-ready versions of landing page components

${usedComponents.length > 0 ? usedComponents.join('\n') : '// No components to export'}
`;
  }

  private generateNetlifyHeaders(): string {
    return `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/*.js
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

/*.mjs
  Content-Type: application/javascript
  Cache-Control: public, max-age=31536000

/*.html
  Cache-Control: no-cache

/*.css
  Content-Type: text/css
  Cache-Control: public, max-age=31536000

/*.svg
  Content-Type: image/svg+xml
  Cache-Control: public, max-age=31536000

/*.png
  Cache-Control: public, max-age=31536000

/*.jpg
  Cache-Control: public, max-age=31536000

/*.jpeg
  Cache-Control: public, max-age=31536000

/*.gif
  Cache-Control: public, max-age=31536000

/*.webp
  Cache-Control: public, max-age=31536000

/*.woff
  Content-Type: font/woff
  Cache-Control: public, max-age=31536000

/*.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000

/*.json
  Content-Type: application/json
  Cache-Control: public, max-age=31536000`;
  }

  private generateNetlifyToml(): string {
    return `# Netlify configuration for React project deployment
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# SPA redirects
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers for better performance and security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
    Cache-Control = "public, max-age=31536000"`;
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
    
    // Safely serialize JSON data
    const safeJSONStringify = (obj: any) => {
      try {
        return JSON.stringify(obj || {});
      } catch (error) {
        console.warn('Failed to serialize object:', error);
        return '{}';
      }
    };
    
    return `<${componentName}
        key="${component.id}"
        content={${safeJSONStringify(component.content)}}
        styles={${safeJSONStringify(component.custom_styles)}}
        visibility={${safeJSONStringify(component.visibility)}}
        mediaUrls={${safeJSONStringify(component.media_urls)}}
        customActions={${safeJSONStringify(component.custom_actions)}}
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

  private generateFavicon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#3b82f6"/>
  <path d="M8 8h16v16H8z" fill="#ffffff" opacity="0.2"/>
  <path d="M12 12h8v2h-8zm0 4h8v2h-8zm0 4h6v2h-6z" fill="#ffffff"/>
</svg>`;
  }

  private generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: /sitemap.xml`;
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

  private generateInlineReactBundle(pageData: any): string {
    // Generate a complete React application bundle as JavaScript
    const components = pageData.components || [];
    const componentCode = this.generateAllComponentsCode(components);
    const appCode = this.generateAppCode(pageData);
    
    return `
// Component utilities
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Button renderer utility
function renderButton(action, className, style, content) {
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

  return React.createElement('button', {
    onClick: handleClick,
    className: className,
    style: style
  }, content);
}

// Generated Components
${componentCode}

// Main App Component
${appCode}

// Initialize React app
try {
  console.log('Initializing React app...');
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  if (typeof React === 'undefined') {
    throw new Error('React is not loaded');
  }
  
  if (typeof ReactDOM === 'undefined') {
    throw new Error('ReactDOM is not loaded');
  }
  
  // Test React.createElement before using it
  try {
    const testElement = React.createElement('div', null, 'Test');
    console.log('React.createElement test passed');
  } catch (createError) {
    throw new Error('React.createElement failed: ' + createError.message);
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(App));
  console.log('React app initialized successfully!');
} catch (error) {
  console.error('Failed to initialize React app:', error);
  // Fallback: Show error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h1>App Loading Error</h1><p>' + error.message + '</p><p>Please check the browser console for more details.</p><p>Using fallback content instead...</p></div>';
    
    // Trigger fallback immediately on error
    setTimeout(() => {
      rootElement.innerHTML = \`
        <div style="min-height: 100vh; font-family: Inter, sans-serif;">
          ${this.generateFallbackHTML(pageData)}
        </div>
      \`;
    }, 100);
  }
}
`;
  }

  private generateInlineStyles(pageData: any): string {
    // Generate all CSS including Tailwind utilities and component styles
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    
    return `
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${globalTheme.fontFamily || 'Inter, system-ui, sans-serif'};
  line-height: 1.6;
  color: ${globalTheme.textColor || '#333333'};
  background: ${globalTheme.backgroundColor || '#ffffff'};
}

/* Essential Tailwind-like utilities */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-8 { margin-top: 2rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
.text-4xl { font-size: 2.25rem; }
.text-5xl { font-size: 3rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.bg-blue-600 { background-color: #2563eb; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-white { color: #ffffff; }
.text-gray-600 { color: #4b5563; }
.text-gray-800 { color: #1f2937; }
.hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
.transition { transition-property: all; transition-duration: 150ms; }
.cursor-pointer { cursor: pointer; }
.block { display: block; }
.inline-block { display: inline-block; }
.grid { display: grid; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

/* Responsive grid */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media (min-width: 768px) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:text-5xl { font-size: 3rem; }
  .md\\:text-6xl { font-size: 3.75rem; }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

/* Component-specific styles */
.hero-section { padding: 4rem 0; }
.cta-section { padding: 3rem 0; }
.features-section { padding: 3rem 0; }
.testimonials-section { padding: 3rem 0; }
.pricing-section { padding: 3rem 0; }
.faq-section { padding: 3rem 0; }

/* Button styles */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #6b7280;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #4b5563;
}
`;
  }

  private generateAllComponentsCode(components: LandingPageComponent[]): string {
    return components.map((component, index) => {
      const componentType = component.component_variation?.component_type;
      const variation = component.component_variation?.variation_number;
      
      if (!componentType || !variation) return '';
      
      const componentName = `${this.capitalize(componentType)}Variation${variation}`;
      const componentContent = this.generateComponentFileContent(component);
      
      return `
// ${componentName} Component
function ${componentName}(props) {
  ${componentContent}
}
`;
    }).join('\n');
  }

  private generateComponentFileContent(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    
    switch (componentType) {
      case 'hero':
        return this.generateHeroComponentContent(component);
      case 'features':
        return this.generateFeaturesComponentContent(component);
      case 'cta':
        return this.generateCtaComponentContent(component);
      case 'testimonials':
        return this.generateTestimonialsComponentContent(component);
      case 'pricing':
        return this.generatePricingComponentContent(component);
      case 'faq':
        return this.generateFaqComponentContent(component);
      default:
        return 'return React.createElement("div", null, "Component not implemented");';
    }
  }

  private generateAppCode(pageData: any): string {
    const components = pageData.components || [];
    const componentElements = components.map((component, index) => {
      const componentType = component.component_variation?.component_type;
      const variation = component.component_variation?.variation_number;
      
      if (!componentType || !variation) return '';
      
      const componentName = `${this.capitalize(componentType)}Variation${variation}`;
      return `React.createElement(${componentName}, { key: ${index}, ...${JSON.stringify(component)} })`;
    }).filter(Boolean).join(',\n    ');

    return `
function App() {
  return React.createElement('div', { className: 'min-h-screen' },
    ${componentElements}
  );
}
`;
  }

  private generateHeroComponentContent(component: LandingPageComponent): string {
    const content = component.content || {};
    const customActions = component.custom_actions || {};
    const marketplaceData = (component as any).marketplace_data;
    
    // Try to get button action from multiple sources
    let buttonAction = content.button?.action || customActions['cta-button'] || customActions['ctaButton'];
    let buttonText = content.button?.text || content.ctaButton || 'Get Started';
    
    // Handle different action types
    if (buttonAction?.type === 'checkout' && marketplaceData) {
      buttonAction = {
        type: 'marketplace_checkout',
        url: marketplaceData.checkout_url
      };
    }
    
    const buttonElement = buttonAction ? 
      `renderButton(${JSON.stringify(buttonAction)}, 'btn btn-primary', {}, '${this.escapeHtml(buttonText)}')` : 
      (buttonText !== 'Get Started' ? `renderButton({type: 'external_link', url: '#'}, 'btn btn-primary', {}, '${this.escapeHtml(buttonText)}')` : 'null');
    
    return `
  return React.createElement('section', { 
    className: 'hero-section text-center py-16',
    style: { backgroundColor: '${content.backgroundColor || '#ffffff'}' }
  }, 
    React.createElement('div', { className: 'container mx-auto px-4' },
      React.createElement('h1', { 
        className: 'text-4xl md:text-6xl font-bold mb-6',
        style: { color: '${content.textColor || '#1f2937'}' }
      }, '${this.escapeHtml(content.headline || 'Hero Headline')}'),
      React.createElement('p', { 
        className: 'text-xl text-gray-600 mb-8',
        style: { color: '${content.subtitleColor || '#6b7280'}' }
      }, '${this.escapeHtml(content.subtitle || content.subheadline || 'Hero subtitle text')}'),
      ${buttonElement}
    )
  );
`;
  }

  private generateFeaturesComponentContent(component: LandingPageComponent): string {
    const content = component.content || {};
    const features = content.features || [];
    
    const featureElements = features.map((feature: any, index: number) => `
        React.createElement('div', { key: ${index}, className: 'text-center' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-4' }, '${this.escapeHtml(feature.title || '')}'),
          React.createElement('p', { className: 'text-gray-600' }, '${this.escapeHtml(feature.description || '')}')
        )`).join(',\n');
    
    return `
  return React.createElement('section', { 
    className: 'features-section py-16',
    style: { backgroundColor: '${content.backgroundColor || '#f9fafb'}' }
  },
    React.createElement('div', { className: 'container mx-auto px-4' },
      React.createElement('h2', { 
        className: 'text-3xl font-bold text-center mb-12',
        style: { color: '${content.textColor || '#1f2937'}' }
      }, '${this.escapeHtml(content.title || 'Features')}'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-8' },
        ${featureElements}
      )
    )
  );
`;
  }

  private generateCtaComponentContent(component: LandingPageComponent): string {
    const content = component.content || {};
    const customActions = component.custom_actions || {};
    const marketplaceData = (component as any).marketplace_data;
    
    // Try to get button action from multiple sources
    let buttonAction = content.button?.action || customActions['cta-button'] || customActions['ctaButton'];
    let buttonText = content.button?.text || content.ctaButton || 'Get Started';
    
    // Handle different action types
    if (buttonAction?.type === 'checkout' && marketplaceData) {
      buttonAction = {
        type: 'marketplace_checkout',
        url: marketplaceData.checkout_url
      };
    }
    
    const buttonElement = buttonAction ? 
      `renderButton(${JSON.stringify(buttonAction)}, 'btn btn-primary', { backgroundColor: '#ffffff', color: '#2563eb' }, '${this.escapeHtml(buttonText)}')` : 
      (buttonText !== 'Get Started' ? `renderButton({type: 'external_link', url: '#'}, 'btn btn-primary', { backgroundColor: '#ffffff', color: '#2563eb' }, '${this.escapeHtml(buttonText)}')` : 'null');
    
    return `
  return React.createElement('section', { 
    className: 'cta-section text-center py-16',
    style: { backgroundColor: '${content.backgroundColor || '#2563eb'}' }
  }, 
    React.createElement('div', { className: 'container mx-auto px-4' },
      React.createElement('h2', { 
        className: 'text-3xl font-bold mb-6',
        style: { color: '${content.textColor || '#ffffff'}' }
      }, '${this.escapeHtml(content.headline || 'Call to Action')}'),
      React.createElement('p', { 
        className: 'text-xl mb-8',
        style: { color: '${content.subtitleColor || '#e5e7eb'}' }
      }, '${this.escapeHtml(content.subtitle || content.subheadline || 'Take action now')}'),
      ${buttonElement}
    )
  );
`;
  }

  private generateTestimonialsComponentContent(component: LandingPageComponent): string {
    const content = component.content || {};
    const testimonials = content.testimonials || [];
    
    const testimonialElements = testimonials.map((testimonial: any, index: number) => `
        React.createElement('div', { key: ${index}, className: 'bg-gray-100 p-6 rounded-lg' },
          React.createElement('p', { className: 'text-gray-600 mb-4' }, '${this.escapeHtml(testimonial.quote || '')}'),
          React.createElement('div', { className: 'font-semibold' }, '${this.escapeHtml(testimonial.author || '')}')
        )`).join(',\n');
    
    return `
  return React.createElement('section', { 
    className: 'testimonials-section py-16',
    style: { backgroundColor: '${content.backgroundColor || '#ffffff'}' }
  },
    React.createElement('div', { className: 'container mx-auto px-4' },
      React.createElement('h2', { 
        className: 'text-3xl font-bold text-center mb-12',
        style: { color: '${content.textColor || '#1f2937'}' }
      }, '${this.escapeHtml(content.title || 'Testimonials')}'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' },
        ${testimonialElements}
      )
    )
  );
`;
  }

  private generatePricingComponentContent(component: LandingPageComponent): string {
    const content = component.content || {};
    const plans = content.plans || [];
    
    const planElements = plans.map((plan: any, index: number) => `
        React.createElement('div', { key: ${index}, className: 'bg-white p-6 rounded-lg border text-center' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-4' }, '${this.escapeHtml(plan.name || '')}'),
          React.createElement('div', { className: 'text-3xl font-bold mb-4' }, '${this.escapeHtml(plan.price || '')}'),
          React.createElement('p', { className: 'text-gray-600 mb-6' }, '${this.escapeHtml(plan.description || '')}'),
          ${plan.button ? `renderButton(${JSON.stringify(plan.button.action)}, 'btn btn-primary w-full', {}, '${this.escapeHtml(plan.button.text || 'Choose Plan')}')` : 'null'}
        )`).join(',\n');
    
    return `
  return React.createElement('section', { 
    className: 'pricing-section py-16',
    style: { backgroundColor: '${content.backgroundColor || '#f9fafb'}' }
  },
    React.createElement('div', { className: 'container mx-auto px-4' },
      React.createElement('h2', { 
        className: 'text-3xl font-bold text-center mb-12',
        style: { color: '${content.textColor || '#1f2937'}' }
      }, '${this.escapeHtml(content.title || 'Pricing')}'),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-8' },
        ${planElements}
      )
    )
  );
`;
  }

  private generateFaqComponentContent(component: LandingPageComponent): string {
    const content = component.content || {};
    const faqs = content.faqs || [];
    
    const faqElements = faqs.map((faq: any, index: number) => `
        React.createElement('div', { key: ${index}, className: 'mb-6 border-b pb-6' },
          React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, '${this.escapeHtml(faq.question || '')}'),
          React.createElement('p', { className: 'text-gray-600' }, '${this.escapeHtml(faq.answer || '')}')
        )`).join(',\n');
    
    return `
  return React.createElement('section', { 
    className: 'faq-section py-16',
    style: { backgroundColor: '${content.backgroundColor || '#ffffff'}' }
  },
    React.createElement('div', { className: 'container mx-auto px-4' },
      React.createElement('h2', { 
        className: 'text-3xl font-bold text-center mb-12',
        style: { color: '${content.textColor || '#1f2937'}' }
      }, '${this.escapeHtml(content.title || 'FAQ')}'),
      React.createElement('div', { className: 'max-w-3xl mx-auto' },
        ${faqElements}
      )
    )
  );
`;
  }

  private generateFallbackHTML(pageData: any): string {
    const components = pageData.components || [];
    
    return components.map((component: LandingPageComponent) => {
      const content = component.content || {};
      const componentType = component.component_variation?.component_type;
      
      if (componentType === 'hero') {
        return `
          <section style="text-align: center; padding: 4rem 1rem; background-color: ${content.backgroundColor || '#ffffff'};">
            <div style="max-width: 1200px; margin: 0 auto;">
              <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1.5rem; color: ${content.textColor || '#1f2937'};">
                ${this.escapeHtml(content.headline || 'Hero Headline')}
              </h1>
              <p style="font-size: 1.25rem; margin-bottom: 2rem; color: ${content.subtitleColor || '#6b7280'};">
                ${this.escapeHtml(content.subtitle || content.subheadline || 'Hero subtitle text')}
              </p>
              ${content.button ? `
                <button style="background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer;" onclick="window.open('${content.button.action?.url || '#'}', '_blank')">
                  ${this.escapeHtml(content.button.text || content.ctaButton || 'Get Started')}
                </button>
              ` : ''}
            </div>
          </section>
        `;
      } else if (componentType === 'cta') {
        return `
          <section style="text-align: center; padding: 3rem 1rem; background-color: ${content.backgroundColor || '#2563eb'};">
            <div style="max-width: 1200px; margin: 0 auto;">
              <h2 style="font-size: 1.875rem; font-weight: bold; margin-bottom: 1.5rem; color: ${content.textColor || '#ffffff'};">
                ${this.escapeHtml(content.headline || 'Call to Action')}
              </h2>
              <p style="font-size: 1.25rem; margin-bottom: 2rem; color: ${content.subtitleColor || '#e5e7eb'};">
                ${this.escapeHtml(content.subtitle || content.subheadline || 'Take action now')}
              </p>
              ${content.button ? `
                <button style="background-color: #ffffff; color: #2563eb; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; font-weight: 600; cursor: pointer;" onclick="window.open('${content.button.action?.url || '#'}', '_blank')">
                  ${this.escapeHtml(content.button.text || content.ctaButton || 'Get Started')}
                </button>
              ` : ''}
            </div>
          </section>
        `;
      }
      return '';
    }).join('');
  }
}
