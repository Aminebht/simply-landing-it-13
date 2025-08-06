import { LandingPageComponent } from '@/types/components';
import { ReactProjectTemplateGenerator, ReactProjectTemplate } from './react-project-template-generator';
import { ComponentCleanerService, CleanedComponent } from './component-cleaner-service';

export interface ReactProjectFiles extends Record<string, string> {
  // Base project files
  'package.json': string;
  'index.html': string;
  'vite.config.ts': string;
  'tsconfig.json': string;
  'src/main.tsx': string;
  'src/App.tsx': string;
  'src/index.css': string;
  '_headers': string;
  'netlify.toml': string;
  
  // Utility files
  'src/utils/cn.ts': string;
  'src/utils/buttonRenderer.tsx': string;
  'src/utils/format.js': string;
  
  // Component files (dynamically generated)
  'src/components/index.ts': string;
}

export class ReactProjectGenerator {
  private templateGenerator: ReactProjectTemplateGenerator;
  private componentCleaner: ComponentCleanerService;

  constructor() {
    this.templateGenerator = new ReactProjectTemplateGenerator();
    this.componentCleaner = new ComponentCleanerService();
  }

  generateReactProject(pageData: any): Record<string, string> {
    // Generate a pre-built static version for deployment
    // This creates files that can be served directly without build process
    const staticSiteFiles: Record<string, string> = {
      // Main HTML file with everything bundled
      'index.html': this.generateStaticIndexHtml(pageData),
      
      // Static assets
      'favicon.svg': this.generateFavicon(),
      'robots.txt': this.generateRobotsTxt(),
      
      // Netlify configuration for SPA
      '_redirects': '/*    /index.html   200',
      
      // Security headers
      '_headers': `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin`
    };

    return staticSiteFiles;
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
        clsx: "^2.0.0"
      },
      devDependencies: {
        "@types/react": "^18.2.15",
        "@types/react-dom": "^18.2.7",
        "@vitejs/plugin-react": "^4.0.3",
        vite: "^4.4.5",
        tailwindcss: "^3.3.3",
        autoprefixer: "^10.4.14",
        postcss: "^8.4.27",
        typescript: "^5.0.2"
      }
    }, null, 2);
  }

  private generateViteConfig(): string {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic',
    jsxImportSource: undefined,
    babel: {
      parserOpts: {
        strictMode: false
      }
    }
  })],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
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
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2015',
    format: 'esm',
    tsconfigRaw: {
      compilerOptions: {
        jsx: 'react',
        strict: false,
        useDefineForClassFields: true
      }
    }
  }
})`;
  }

  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react",
        strict: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"]
    }, null, 2);
  }

  private generatePostCSSConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
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
    },
  },
  plugins: [],
}`;
  }

  private generateBuildableNetlifyToml(): string {
    return `# Netlify configuration for React project deployment
# This project will be built by Netlify using Vite

[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# SPA redirect
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers configuration
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/*.js"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.mjs"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.jsx"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.ts"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.tsx"
  [headers.values]
    Content-Type = "application/javascript; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Content-Type = "text/css; charset=utf-8"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.html"
  [headers.values]
    Content-Type = "text/html; charset=utf-8"
    Cache-Control = "no-cache"

[[headers]]
  for = "/*.svg"
  [headers.values]
    Content-Type = "image/svg+xml"
    Cache-Control = "public, max-age=31536000"`;
  }

  private generateBuildableIndexHtml(pageData: any): string {
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
  <body style="background: ${globalTheme.backgroundColor || '#ffffff'}">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  }

  private generateMainJsx(pageData: any): string {
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
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
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

  private generateMainTsx(pageData: any): string {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: '20px', textAlign: 'center' }
      }, [
        React.createElement('h1', { key: 'title' }, 'Something went wrong.'),
        React.createElement('p', { key: 'subtitle' }, 'Please check the console for more details.'),
        React.createElement('details', {
          key: 'details',
          style: { marginTop: '20px', textAlign: 'left' }
        }, [
          React.createElement('summary', { key: 'summary' }, 'Error Details'),
          React.createElement('pre', { key: 'error' }, this.state.error?.toString() || 'Unknown error')
        ])
      ]);
    }

    return this.props.children;
  }
}

// Initialize React app with error handling
const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(ErrorBoundary, null,
        React.createElement(App, null)
      )
    );
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    // Fallback: Show basic content
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Landing Page</h1><p>React app failed to load. Check console for details.</p></div>';
  }
} else {
  console.error('Root element not found');
}`;
  }

  private generateAppJsx(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    const components = pageData.components || [];
    
    // Generate component imports
    const componentImports = components
      .map((comp: LandingPageComponent) => {
        const componentType = comp.component_variation?.component_type;
        const variation = comp.component_variation?.variation_number;
        if (componentType && variation) {
          const componentName = `${this.capitalize(componentType)}Variation${variation}`;
          return `import ${componentName} from './components/${componentName}.jsx';`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');
    
    // Generate component JSX
    const componentElements = components
      .filter((comp: LandingPageComponent) => {
        const componentType = comp.component_variation?.component_type;
        const variation = comp.component_variation?.variation_number;
        return componentType && variation;
      })
      .sort((a: LandingPageComponent, b: LandingPageComponent) => a.order_index - b.order_index)
      .map((comp: LandingPageComponent) => {
        const componentType = comp.component_variation?.component_type;
        const variation = comp.component_variation?.variation_number;
        const componentName = `${this.capitalize(componentType)}Variation${variation}`;
        
        return `      <${componentName}
        key="${comp.id}"
        content={${JSON.stringify(comp.content || {})}}
        styles={${JSON.stringify(comp.custom_styles || {})}}
        visibility={${JSON.stringify(comp.visibility || {})}}
        mediaUrls={${JSON.stringify(comp.media_urls || {})}}
        customActions={${JSON.stringify(comp.custom_actions || {})}}
        globalTheme={globalTheme}
        isEditing={false}
        viewport="responsive"
      />`;
      })
      .join('\n');
    
    return `import React from 'react'
${componentImports}

function App() {
  const globalTheme = ${JSON.stringify(globalTheme, null, 2)};
  
  // Track page view
  React.useEffect(() => {
    // Google Analytics page view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view');
    }
    
    // Facebook Pixel page view
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView');
    }
  }, []);
  
  return (
    <div 
      id="landing-page" 
      className="min-h-screen"
      style={{
        fontFamily: globalTheme.fontFamily || 'Inter, sans-serif',
        direction: globalTheme.direction || 'ltr',
        background: globalTheme.backgroundColor || '#ffffff'
      }}
    >
${componentElements}
      ${components.length === 0 ? `
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome</h1>
          <p className="text-lg text-gray-600">Your landing page is ready!</p>
        </div>
      </div>` : ''}
    </div>
  )
}

export default App`;
  }

  private generateAppTsx(pageData: any): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    const components = pageData.components || [];
    
    // Generate component imports
    const componentImports = components
      .map((comp: LandingPageComponent) => {
        const componentType = comp.component_variation?.component_type;
        const variation = comp.component_variation?.variation_number;
        if (componentType && variation) {
          const componentName = `${this.capitalize(componentType)}Variation${variation}`;
          return `import ${componentName} from './components/${componentName}';`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');
    
    // Generate component elements using React.createElement
    const componentElements = components
      .filter((comp: LandingPageComponent) => {
        const componentType = comp.component_variation?.component_type;
        const variation = comp.component_variation?.variation_number;
        return componentType && variation;
      })
      .sort((a: LandingPageComponent, b: LandingPageComponent) => a.order_index - b.order_index)
      .map((comp: LandingPageComponent) => {
        const componentType = comp.component_variation?.component_type;
        const variation = comp.component_variation?.variation_number;
        const componentName = `${this.capitalize(componentType)}Variation${variation}`;
        
        return `    React.createElement(${componentName}, {
      key: "${comp.id}",
      content: ${JSON.stringify(comp.content || {})},
      styles: ${JSON.stringify(comp.custom_styles || {})},
      visibility: ${JSON.stringify(comp.visibility || {})},
      mediaUrls: ${JSON.stringify(comp.media_urls || {})},
      customActions: ${JSON.stringify(comp.custom_actions || {})},
      globalTheme: globalTheme,
      isEditing: false,
      viewport: "responsive"
    })`;
      })
      .join(',\n');
    
    const fallbackContent = components.length === 0 ? `React.createElement('div', {
      className: 'flex items-center justify-center min-h-screen'
    }, React.createElement('div', {
      className: 'text-center'
    }, [
      React.createElement('h1', {
        key: 'title',
        className: 'text-4xl font-bold text-gray-900 mb-4'
      }, 'Welcome'),
      React.createElement('p', {
        key: 'subtitle',
        className: 'text-lg text-gray-600'
      }, 'Your landing page is ready!')
    ]))` : '';
    
    return `import React from 'react';
${componentImports}

// Type definitions
interface GlobalTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  direction?: string;
  language?: string;
}

function App(): React.ReactElement {
  const globalTheme: GlobalTheme = ${JSON.stringify(globalTheme, null, 2)};
  
  // Track page view
  React.useEffect(() => {
    // Google Analytics page view
    const gtag = (window as any).gtag;
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view');
    }
    
    // Facebook Pixel page view
    const fbq = (window as any).fbq;
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView');
    }
  }, []);
  
  return React.createElement('div', {
    id: 'landing-page',
    className: 'min-h-screen',
    style: {
      fontFamily: globalTheme.fontFamily || 'Inter, sans-serif',
      direction: globalTheme.direction || 'ltr',
      background: globalTheme.backgroundColor || '#ffffff'
    }
  }, [
${componentElements ? componentElements + ',' : ''}
${fallbackContent ? '    ' + fallbackContent : ''}
  ].filter(Boolean));
}

export default App;`;
  }

  private generateIndexCSS(pageData: any): string {
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
    background: var(--background-color);
    color: #1a202c;
    overflow-x: hidden;
    line-height: 1.6;
  }
}

/* Component styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  padding: 0.75rem 1.5rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: #ffffff;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6b7280;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

/* Container utilities */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Animation utilities */
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`;
  }

  private generateComponentFiles(components: LandingPageComponent[]): Record<string, string> {
    const files: Record<string, string> = {};
    
    components.forEach((component) => {
      const componentType = component.component_variation?.component_type;
      const variation = component.component_variation?.variation_number;
      
      if (componentType && variation) {
        const componentName = `${this.capitalize(componentType)}Variation${variation}`;
        const fileName = `src/components/${componentName}.tsx`;
        files[fileName] = this.generateComponentContent(component);
      }
    });
    
    return files;
  }

  private generateComponentContent(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    const variation = component.component_variation?.variation_number;
    
    if (!componentType || !variation) return '';
    
    const componentName = `${this.capitalize(componentType)}Variation${variation}`;
    
    return `import React from 'react';
import { cn } from '../utils/cn';
import { renderButton } from '../utils/buttonRenderer';

// Component Props Interface
interface ${componentName}Props {
  content?: Record<string, any>;
  styles?: Record<string, any>;
  visibility?: Record<string, any>;
  mediaUrls?: Record<string, any>;
  customActions?: Record<string, any>;
  globalTheme?: Record<string, any>;
  isEditing?: boolean;
  viewport?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
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

  ${this.generateComponentJSXContent(component)}
};

export default ${componentName};`;
  }

  private generateComponentJSXContent(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    
    switch (componentType) {
      case 'hero':
        return this.generateHeroJSX(component);
      case 'features':
        return this.generateFeaturesJSX(component);
      case 'cta':
        return this.generateCtaJSX(component);
      case 'testimonials':
        return this.generateTestimonialsJSX(component);
      case 'pricing':
        return this.generatePricingJSX(component);
      case 'faq':
        return this.generateFaqJSX(component);
      default:
        return 'return React.createElement("div", {}, "Component not implemented");';
    }
  }

  private generateHeroJSX(component: LandingPageComponent): string {
    return `return React.createElement('section', {
    className: 'hero-section text-center py-16',
    style: { 
      background: styles?.container?.backgroundColor || globalTheme.backgroundColor || '#ffffff',
      color: styles?.container?.textColor || globalTheme.textColor || '#1f2937'
    }
  }, React.createElement('div', {
    className: 'container mx-auto px-4'
  }, [
    content.headline && React.createElement('h1', {
      key: 'headline',
      className: 'text-4xl md:text-6xl font-bold mb-6',
      style: { color: styles?.container?.textColor || globalTheme.textColor || '#1f2937' }
    }, content.headline),
    
    content.subheadline && React.createElement('p', {
      key: 'subheadline',
      className: 'text-xl mb-8',
      style: { color: styles?.container?.subtitleColor || '#6b7280' }
    }, content.subheadline),
    
    content.ctaButton && React.createElement('div', {
      key: 'cta',
      className: 'mt-8'
    }, renderButton({
      action: customActions?.['cta-button'] || { type: 'external_link', url: '#' },
      content: content.ctaButton,
      className: 'btn btn-primary',
      style: { backgroundColor: primaryColor }
    }))
  ].filter(Boolean)));`;
  }

  private generateCtaJSX(component: LandingPageComponent): string {
    return `return React.createElement('section', {
    className: 'cta-section text-center py-16',
    style: { 
      background: styles?.container?.backgroundColor || '#2563eb',
      color: styles?.container?.textColor || '#ffffff'
    }
  }, React.createElement('div', {
    className: 'container mx-auto px-4'
  }, [
    content.headline && React.createElement('h2', {
      key: 'headline',
      className: 'text-3xl font-bold mb-6',
      style: { color: styles?.container?.textColor || '#ffffff' }
    }, content.headline),
    
    content.subheadline && React.createElement('p', {
      key: 'subheadline',
      className: 'text-xl mb-8',
      style: { color: styles?.container?.subtitleColor || '#e5e7eb' }
    }, content.subheadline),
    
    content.ctaButton && React.createElement('div', {
      key: 'cta',
      className: 'mt-8'
    }, renderButton({
      action: customActions?.['cta-button'] || { type: 'external_link', url: '#' },
      content: content.ctaButton,
      className: 'btn btn-primary',
      style: { backgroundColor: '#ffffff', color: '#2563eb' }
    }))
  ].filter(Boolean)));`;
  }

  private generateFeaturesJSX(component: LandingPageComponent): string {
    return `return React.createElement('section', {
    className: 'features-section py-16',
    style: { 
      background: styles?.container?.backgroundColor || '#f9fafb',
      color: styles?.container?.textColor || '#1f2937'
    }
  }, React.createElement('div', {
    className: 'container mx-auto px-4'
  }, [
    content.title && React.createElement('h2', {
      key: 'title',
      className: 'text-3xl font-bold text-center mb-12'
    }, content.title),
    
    React.createElement('div', {
      key: 'features-grid',
      className: 'grid grid-cols-1 md:grid-cols-3 gap-8'
    }, (content.features || []).map((feature, index) => 
      React.createElement('div', {
        key: index,
        className: 'text-center'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-xl font-semibold mb-4'
        }, feature.title),
        React.createElement('p', {
          key: 'description',
          className: 'text-gray-600'
        }, feature.description)
      ])
    ))
  ].filter(Boolean)));`;
  }

  private generateTestimonialsJSX(component: LandingPageComponent): string {
    return `return React.createElement('section', {
    className: 'testimonials-section py-16',
    style: { 
      background: styles?.container?.backgroundColor || '#ffffff',
      color: styles?.container?.textColor || '#1f2937'
    }
  }, React.createElement('div', {
    className: 'container mx-auto px-4'
  }, [
    content.title && React.createElement('h2', {
      key: 'title',
      className: 'text-3xl font-bold text-center mb-12'
    }, content.title),
    
    React.createElement('div', {
      key: 'testimonials-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-8'
    }, (content.testimonials || []).map((testimonial, index) => 
      React.createElement('div', {
        key: index,
        className: 'bg-gray-100 p-6 rounded-lg'
      }, [
        React.createElement('p', {
          key: 'quote',
          className: 'text-gray-600 mb-4'
        }, '"' + testimonial.quote + '"'),
        React.createElement('div', {
          key: 'author',
          className: 'font-semibold'
        }, testimonial.author)
      ])
    ))
  ].filter(Boolean)));`;
  }

  private generatePricingJSX(component: LandingPageComponent): string {
    return `return React.createElement('section', {
    className: 'pricing-section py-16',
    style: { 
      background: styles?.container?.backgroundColor || '#f9fafb',
      color: styles?.container?.textColor || '#1f2937'
    }
  }, React.createElement('div', {
    className: 'container mx-auto px-4'
  }, [
    content.title && React.createElement('h2', {
      key: 'title',
      className: 'text-3xl font-bold text-center mb-12'
    }, content.title),
    
    React.createElement('div', {
      key: 'pricing-grid',
      className: 'grid grid-cols-1 md:grid-cols-3 gap-8'
    }, (content.plans || []).map((plan, index) => 
      React.createElement('div', {
        key: index,
        className: 'bg-white p-6 rounded-lg border text-center'
      }, [
        React.createElement('h3', {
          key: 'name',
          className: 'text-xl font-semibold mb-4'
        }, plan.name),
        React.createElement('div', {
          key: 'price',
          className: 'text-3xl font-bold mb-4'
        }, plan.price),
        React.createElement('p', {
          key: 'description',
          className: 'text-gray-600 mb-6'
        }, plan.description),
        plan.button && renderButton({
          action: plan.button.action || { type: 'external_link', url: '#' },
          content: plan.button.text || 'Choose Plan',
          className: 'btn btn-primary w-full'
        })
      ].filter(Boolean))
    ))
  ].filter(Boolean)));`;
  }

  private generateFaqJSX(component: LandingPageComponent): string {
    return `return React.createElement('section', {
    className: 'faq-section py-16',
    style: { 
      background: styles?.container?.backgroundColor || '#ffffff',
      color: styles?.container?.textColor || '#1f2937'
    }
  }, React.createElement('div', {
    className: 'container mx-auto px-4'
  }, [
    content.title && React.createElement('h2', {
      key: 'title',
      className: 'text-3xl font-bold text-center mb-12'
    }, content.title),
    
    React.createElement('div', {
      key: 'faq-container',
      className: 'max-w-3xl mx-auto'
    }, (content.faqs || []).map((faq, index) => 
      React.createElement('div', {
        key: index,
        className: 'mb-6 border-b pb-6'
      }, [
        React.createElement('h3', {
          key: 'question',
          className: 'text-lg font-semibold mb-2'
        }, faq.question),
        React.createElement('p', {
          key: 'answer',
          className: 'text-gray-600'
        }, faq.answer)
      ])
    ))
  ].filter(Boolean)));`;
  }

  private generateCnUtility(): string {
    return `export function cn(...inputs: (string | undefined | false | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}`;
  }

  private generateButtonRenderer(): string {
    return `import React from 'react';

interface ButtonAction {
  type: string;
  url?: string;
  target_id?: string;
}

interface ButtonRenderProps {
  action: ButtonAction;
  content: string;
  className?: string;
  style?: React.CSSProperties;
  as?: string;
}

export const renderButton = ({ 
  action, 
  content, 
  className = '', 
  style = {},
  as = 'primary' 
}: ButtonRenderProps): React.ReactElement => {
  const handleClick = (): void => {
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
    style: style,
    type: 'button'
  }, content);
};`;
  }

  private generateComponentIndexFile(cleanedComponents: Record<string, CleanedComponent>): string {
    const exports = Object.keys(cleanedComponents)
      .map(componentName => `export { default as ${componentName} } from './${componentName}.jsx';`)
      .join('\n');
    
    return `// Auto-generated component exports
${exports}`;
  }

  private generateComponentExportsFile(components: LandingPageComponent[]): string {
    const exports = components
      .map((component) => {
        const componentType = component.component_variation?.component_type;
        const variation = component.component_variation?.variation_number;
        
        if (componentType && variation) {
          const componentName = `${this.capitalize(componentType)}Variation${variation}`;
          return `export { default as ${componentName} } from './${componentName}.tsx';`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');
    
    return `// Auto-generated component exports for React deployment
${exports}`;
  }

  private generateUpdatedAppJsx(pageData: any, cleanedComponents: Record<string, CleanedComponent>): string {
    const globalTheme = pageData.global_theme || this.getDefaultGlobalTheme();
    const components = pageData.components || [];
    
    // Get unique component names for imports
    const componentImports = Object.keys(cleanedComponents);
    
    return `import React from 'react'
import { 
  ${componentImports.join(',\n  ')}
} from './components'

function App() {
  const globalTheme = ${JSON.stringify(globalTheme, null, 2)};
  
  // Track page view
  React.useEffect(() => {
    // Google Analytics page view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view');
    }
    
    // Facebook Pixel page view
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView');
    }
  }, []);
  
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

  private generateComponentJSX(component: LandingPageComponent): string {
    const componentType = component.component_variation?.component_type;
    const variation = component.component_variation?.variation_number;
    
    if (!componentType || !variation) return '';
    
    const componentName = `${this.capitalize(componentType)}Variation${variation}`;
    
    // Clean the props - remove any functions or complex objects that can't be serialized
    const cleanContent = this.cleanSerializableData(component.content || {});
    const cleanStyles = this.cleanSerializableData(component.custom_styles || {});
    const cleanVisibility = this.cleanSerializableData(component.visibility || {});
    const cleanMediaUrls = this.cleanSerializableData(component.media_urls || {});
    const cleanCustomActions = this.cleanSerializableData(component.custom_actions || {});
    
    return `<${componentName}
        key="${component.id}"
        content={${JSON.stringify(cleanContent, null, 8)}}
        styles={${JSON.stringify(cleanStyles, null, 8)}}
        visibility={${JSON.stringify(cleanVisibility, null, 8)}}
        mediaUrls={${JSON.stringify(cleanMediaUrls, null, 8)}}
        customActions={${JSON.stringify(cleanCustomActions, null, 8)}}
        globalTheme={globalTheme}
        viewport="responsive"
      />`;
  }

  private cleanSerializableData(data: any): any {
    if (data === null || data === undefined) return {};
    if (typeof data !== 'object') return data;
    
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip functions and undefined values
      if (typeof value === 'function' || value === undefined) continue;
      
      // Recursively clean nested objects
      if (typeof value === 'object' && value !== null) {
        cleaned[key] = this.cleanSerializableData(value);
      } else {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  }

  generateDeploymentFiles(pageData: any): Record<string, string> {
    const reactProject = this.generateReactProject(pageData);
    
    // Convert ReactProjectFiles to a simple Record<string, string> for deployment
    return reactProject as Record<string, string>;
  }

  validateProject(files: Record<string, string>): boolean {
    const requiredFiles = [
      'index.html',
      'favicon.svg',
      'robots.txt',
      '_redirects',
      '_headers'
    ];
    
    for (const file of requiredFiles) {
      if (!files[file]) {
        console.error(`Missing required file: ${file}`);
        return false;
      }
    }
    
    // Validate that index.html contains proper HTML structure
    const indexContent = files['index.html'];
    if (!indexContent.includes('<!DOCTYPE html>')) {
      console.error('index.html does not contain proper DOCTYPE');
      return false;
    }
    
    if (!indexContent.includes('<html')) {
      console.error('index.html does not contain html tag');
      return false;
    }
    
    if (!indexContent.includes('<head>')) {
      console.error('index.html does not contain head section');
      return false;
    }
    
    if (!indexContent.includes('<body')) {
      console.error('index.html does not contain body section');
      return false;
    }
    
    // Validate that _headers contains security headers
    const headersContent = files['_headers'];
    if (!headersContent.includes('X-Frame-Options')) {
      console.error('_headers missing security headers');
      return false;
    }
    
    // Validate that _redirects contains SPA redirect
    const redirectsContent = files['_redirects'];
    if (!redirectsContent.includes('/index.html')) {
      console.error('_redirects missing SPA redirect');
      return false;
    }
    
    console.log('Static site validation passed ✓');
    return true;
  }

  getProjectInfo(files: Record<string, string>): {
    totalFiles: number;
    componentCount: number;
    totalSize: number;
    buildCommand: string;
    publishDir: string;
  } {
    // For static HTML deployment, count embedded components in index.html
    const indexHtml = files['index.html'] || '';
    const componentMatches = indexHtml.match(/class="component component-\d+"/g);
    const componentCount = componentMatches ? componentMatches.length : 0;
    
    const totalSize = Object.values(files).reduce((sum, content) => sum + content.length, 0);
    
    return {
      totalFiles: Object.keys(files).length,
      componentCount: componentCount,
      totalSize,
      buildCommand: 'Static HTML - No build required',
      publishDir: '.' // Root directory for static files
    };
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

  private generateStaticIndexHtml(pageData: any): string {
    // Generate a complete static HTML file with all React components rendered
    const globalTheme = pageData.global_theme || {};
    const components = pageData.components || [];
    
    // Generate CSS for the components
    const componentStyles = this.generateStaticComponentStyles(components, globalTheme);
    
    // Generate the component HTML
    const componentHtml = this.generateStaticComponentHtml(components);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.name || 'Landing Page'}</title>
    <meta name="description" content="${pageData.description || 'A beautiful landing page'}">
    
    <!-- Tailwind CSS via CDN for immediate rendering -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Tailwind Configuration -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${globalTheme.primaryColor || '#3B82F6'}',
                        secondary: '${globalTheme.secondaryColor || '#EF4444'}',
                        accent: '${globalTheme.accentColor || '#10B981'}'
                    },
                    fontFamily: {
                        primary: ['${globalTheme.fontFamily || 'Inter'}', 'sans-serif'],
                        secondary: ['${globalTheme.fontFamily || 'Inter'}', 'sans-serif']
                    }
                }
            }
        }
    </script>
    
    <!-- Custom Component Styles -->
    <style>
        ${componentStyles}
        
        /* Base responsive styles */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        /* Animation styles */
        .fade-in {
            animation: fadeIn 0.6s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Interactive button styles */
        .btn-primary {
            background-color: ${globalTheme.primaryColor || '#3B82F6'};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-block;
            text-decoration: none;
            border: none;
            cursor: pointer;
        }
        
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .btn-secondary {
            background-color: ${globalTheme.secondaryColor || '#EF4444'};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-block;
            text-decoration: none;
            border: none;
            cursor: pointer;
        }
        
        .btn-secondary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        /* Grid layouts for components */
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
        }
        
        /* Global theme font family */
        * {
            font-family: '${globalTheme.fontFamily || 'Inter'}', sans-serif;
        }
    </style>
</head>
<body class="antialiased" style="background: ${globalTheme.backgroundColor || '#ffffff'}; color: ${globalTheme.textColor || '#1a202c'};">
    ${componentHtml}
    
    <!-- Simple interactions with vanilla JavaScript -->
    <script>
        // Add smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Add fade-in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('section, .component').forEach(el => {
            observer.observe(el);
        });
        
        // Form handling
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);
                
                // Simple success message
                alert('Thank you for your submission! We will get back to you soon.');
                this.reset();
            });
        });
    </script>
</body>
</html>`;
  }

  private generateStaticComponentStyles(components: any[], globalTheme: any): string {
    let styles = '';
    
    components.forEach((component, index) => {
      const componentType = component.component_variation?.component_type;
      
      styles += `
        .component-${index} {
          font-family: '${globalTheme.primary_font || 'Inter'}', sans-serif;
        }
      `;
      
      // Add component-specific styles
      switch (componentType) {
        case 'hero':
          styles += `
            .hero-section {
              min-height: 80vh;
              display: flex;
              align-items: center;
            }
          `;
          break;
        case 'features':
          styles += `
            .feature-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 2rem;
            }
          `;
          break;
        case 'pricing':
          styles += `
            .pricing-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 2rem;
            }
          `;
          break;
      }
    });
    
    return styles;
  }

  private generateStaticComponentHtml(components: any[]): string {
    return components
      .sort((a, b) => a.order_index - b.order_index)
      .map((component, index) => {
        const componentType = component.component_variation?.component_type;
        const content = component.content || {};
        const styles = component.custom_styles || {};
        const visibility = component.visibility || {};
        const mediaUrls = component.media_urls || {};
        const customActions = component.custom_actions || {};
        
        switch (componentType) {
          case 'hero':
            return this.generateStaticHeroHtml(content, styles, visibility, mediaUrls, customActions, index);
          case 'cta':
            return this.generateStaticCtaHtml(content, styles, visibility, mediaUrls, customActions, index);
          case 'features':
            return this.generateStaticFeaturesHtml(content, styles, visibility, mediaUrls, customActions, index);
          case 'testimonials':
            return this.generateStaticTestimonialsHtml(content, styles, visibility, mediaUrls, customActions, index);
          case 'pricing':
            return this.generateStaticPricingHtml(content, styles, visibility, mediaUrls, customActions, index);
          case 'faq':
            return this.generateStaticFaqHtml(content, styles, visibility, mediaUrls, customActions, index);
          default:
            return `<div class="component component-${index}">Unknown component type: ${componentType}</div>`;
        }
      })
      .join('\n');
  }

  private generateStaticHeroHtml(content: any, styles: any, visibility: any, mediaUrls: any, customActions: any, index: number): string {
    // Extract styles for each element
    const containerStyles = styles?.container || {};
    const badgeStyles = styles?.badge || {};
    const headlineStyles = styles?.headline || {};
    const subheadlineStyles = styles?.subheadline || {};
    const priceStyles = styles?.price || {};
    const ctaButtonStyles = styles?.['cta-button'] || {};
    const secondaryButtonStyles = styles?.['secondary-button'] || {};
    
    // Build inline styles
    const containerStyle = this.buildInlineStyles(containerStyles);
    const badgeStyle = this.buildInlineStyles(badgeStyles);
    const headlineStyle = this.buildInlineStyles(headlineStyles);
    const subheadlineStyle = this.buildInlineStyles(subheadlineStyles);
    const priceStyle = this.buildInlineStyles(priceStyles);
    const ctaButtonStyle = this.buildInlineStyles(ctaButtonStyles);
    const secondaryButtonStyle = this.buildInlineStyles(secondaryButtonStyles);
    
    // Get product image URL
    const productImageUrl = mediaUrls?.productImage || '';
    
    return `
    <section class="hero-section component component-${index} py-20 px-4" style="${containerStyle}">
        <div class="container mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <!-- Left Content -->
                <div class="space-y-6">
                    ${visibility?.badge !== false ? `
                    <div class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style="${badgeStyle}">
                        ${content.badge || '🔥 Best Seller'}
                    </div>` : ''}
                    
                    ${visibility?.headline !== false ? `
                    <h1 class="text-4xl md:text-6xl font-bold" style="${headlineStyle}">
                        ${content.headline || 'Master Digital Marketing in 30 Days'}
                    </h1>` : ''}
                    
                    ${visibility?.subheadline !== false ? `
                    <p class="text-xl opacity-90" style="${subheadlineStyle}">
                        ${content.subheadline || 'Transform your business with our comprehensive digital marketing course. Learn proven strategies used by top professionals.'}
                    </p>` : ''}

                    ${visibility?.price !== false ? `
                    <div class="flex items-center gap-4">
                        <span class="text-4xl font-bold" style="${priceStyle}">
                            ${content.price || '197'} DT
                        </span>
                        ${content.originalPrice ? `
                        <span class="text-2xl line-through opacity-60">
                            ${content.originalPrice} DT
                        </span>` : ''}
                    </div>` : ''}
                    
                    <div class="flex flex-col sm:flex-row gap-4">
                        ${visibility?.ctaButton !== false ? `
                        <button onclick="${this.generateButtonAction(customActions?.['cta-button'])}" 
                                class="px-8 py-3 rounded-lg font-semibold transition-all hover:transform hover:scale-105" 
                                style="${ctaButtonStyle}">
                            ${content.ctaButton || 'Get Instant Access'}
                        </button>` : ''}
                        
                        ${visibility?.secondaryButton !== false ? `
                        <button onclick="${this.generateButtonAction(customActions?.['secondary-button'])}" 
                                class="px-8 py-3 rounded-lg font-semibold border transition-all hover:transform hover:scale-105" 
                                style="${secondaryButtonStyle}">
                            ${content.secondaryButton || 'Preview Course'}
                        </button>` : ''}
                    </div>
                </div>

                <!-- Right Visual -->
                ${visibility?.productImage !== false ? `
                <div class="relative">
                    ${productImageUrl ? `
                    <img src="${productImageUrl}" 
                         alt="Product Image" 
                         class="w-full h-auto rounded-lg shadow-2xl object-cover"
                         style="aspect-ratio: 4/3;">
                    ` : `
                    <div class="w-full bg-gray-200 rounded-lg shadow-2xl flex items-center justify-center text-gray-500" 
                         style="aspect-ratio: 4/3; min-height: 300px;">
                        <span>Product Image</span>
                    </div>`}
                </div>` : ''}
            </div>
        </div>
    </section>`;
  }

  private generateStaticCtaHtml(content: any, styles: any, visibility: any, mediaUrls: any, customActions: any, index: number): string {
    // Extract styles for each element
    const containerStyles = styles?.container || {};
    const cardStyles = styles?.card || {};
    const headlineStyles = styles?.headline || {};
    const subheadlineStyles = styles?.subheadline || {};
    const priceStyles = styles?.price || {};
    const ctaButtonStyles = styles?.['cta-button'] || {};
    
    // Build inline styles
    const containerStyle = this.buildInlineStyles(containerStyles);
    const cardStyle = this.buildInlineStyles(cardStyles);
    const headlineStyle = this.buildInlineStyles(headlineStyles);
    const subheadlineStyle = this.buildInlineStyles(subheadlineStyles);
    const priceStyle = this.buildInlineStyles(priceStyles);
    const ctaButtonStyle = this.buildInlineStyles(ctaButtonStyles);
    
    const subheadlineText = content.subheadline || 'Download your copy now and start learning something new today. Limited-time offer - do not miss out!';
    
    return `
    <section class="cta-section component component-${index} py-16 px-4" 
             style="${containerStyle || 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff;'}">
        <div class="container mx-auto">
            <div class="max-w-2xl mx-auto">
                <div class="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl" 
                     style="${cardStyle}">
                    <div class="text-center space-y-6">
                        ${visibility?.headline !== false ? `
                        <h2 class="text-3xl md:text-4xl font-bold" 
                            style="${headlineStyle || 'color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);'}">
                            ${content.headline || 'Unlock Instant Access to Your Exclusive eBook'}
                        </h2>` : ''}

                        ${visibility?.subheadline !== false ? `
                        <p class="text-xl opacity-90" 
                           style="${subheadlineStyle || 'color: rgba(255, 255, 255, 0.8); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);'}">
                            ${subheadlineText}
                        </p>` : ''}

                        <div class="flex flex-row items-center justify-center gap-6">
                            ${content.originalPrice ? `
                            <span class="text-gray-400 line-through text-2xl md:text-3xl font-semibold" 
                                  style="color: rgba(255, 255, 255, 0.8);">
                                ${content.originalPrice} DT
                            </span>` : ''}
                            <span class="text-4xl md:text-5xl font-bold" 
                                  style="${priceStyle || 'color: #fff;'}">
                                ${content.price || '9'} DT
                            </span>
                        </div>

                        ${visibility?.ctaButton !== false ? `
                        <button onclick="${this.generateButtonAction(customActions?.['cta-button'])}" 
                                class="w-full px-8 py-4 rounded-full font-bold text-lg transition-all hover:transform hover:scale-105 shadow-lg" 
                                style="${ctaButtonStyle || 'background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white;'}">
                            ${content.ctaButton || 'Download Now'}
                        </button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    </section>`;
  }

  private generateStaticFeaturesHtml(content: any, styles: any, visibility: any, mediaUrls: any, customActions: any, index: number): string {
    const features = content.features || [
      { title: 'Feature 1', description: 'Amazing feature description' },
      { title: 'Feature 2', description: 'Another great feature' },
      { title: 'Feature 3', description: 'One more awesome feature' }
    ];

    const containerStyles = styles?.container || {};
    const containerStyle = this.buildInlineStyles(containerStyles);

    return `
    <section class="component component-${index} py-16 px-4" style="${containerStyle}">
        <div class="container mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    ${content.headline || 'Amazing Features'}
                </h2>
                <p class="text-xl text-gray-600">
                    ${content.description || 'Discover what makes us special'}
                </p>
            </div>
            <div class="feature-grid">
                ${features.map(feature => `
                    <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <h3 class="text-xl font-semibold mb-3 text-gray-900">${feature.title}</h3>
                        <p class="text-gray-600">${feature.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateStaticTestimonialsHtml(content: any, styles: any, visibility: any, mediaUrls: any, customActions: any, index: number): string {
    const testimonials = content.testimonials || [
      { name: 'John Doe', text: 'This product changed my life!', company: 'Tech Corp' },
      { name: 'Jane Smith', text: 'Absolutely amazing experience.', company: 'Design Studio' }
    ];

    const containerStyles = styles?.container || {};
    const containerStyle = this.buildInlineStyles(containerStyles);

    return `
    <section class="component component-${index} py-16 px-4 bg-gray-50" style="${containerStyle}">
        <div class="container mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    ${content.headline || 'What Our Customers Say'}
                </h2>
            </div>
            <div class="grid md:grid-cols-2 gap-8">
                ${testimonials.map(testimonial => `
                    <div class="bg-white p-6 rounded-lg shadow-md">
                        <p class="text-gray-600 mb-4 italic">"${testimonial.text}"</p>
                        <div class="font-semibold text-gray-900">${testimonial.name}</div>
                        <div class="text-gray-500 text-sm">${testimonial.company}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateStaticPricingHtml(content: any, styles: any, visibility: any, mediaUrls: any, customActions: any, index: number): string {
    const plans = content.plans || [
      { name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'] },
      { name: 'Pro', price: '$19', features: ['Feature 1', 'Feature 2', 'Feature 3'] }
    ];

    const containerStyles = styles?.container || {};
    const containerStyle = this.buildInlineStyles(containerStyles);

    return `
    <section class="component component-${index} py-16 px-4" style="${containerStyle}">
        <div class="container mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    ${content.headline || 'Choose Your Plan'}
                </h2>
                <p class="text-xl text-gray-600">
                    ${content.description || 'Select the perfect plan for your needs'}
                </p>
            </div>
            <div class="pricing-grid">
                ${plans.map(plan => `
                    <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border">
                        <h3 class="text-xl font-semibold mb-2 text-gray-900">${plan.name}</h3>
                        <div class="text-3xl font-bold mb-4 text-primary">${plan.price}<span class="text-sm text-gray-500">/month</span></div>
                        <ul class="space-y-2 mb-6">
                            ${plan.features.map(feature => `
                                <li class="flex items-center text-gray-600">
                                    <span class="text-green-500 mr-2">✓</span>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                        <a href="#signup" class="btn-primary w-full text-center">Choose ${plan.name}</a>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  private generateStaticFaqHtml(content: any, styles: any, visibility: any, mediaUrls: any, customActions: any, index: number): string {
    const faqs = content.faqs || [
      { question: 'How does this work?', answer: 'It works amazingly well!' },
      { question: 'What is included?', answer: 'Everything you need and more.' }
    ];

    const containerStyles = styles?.container || {};
    const containerStyle = this.buildInlineStyles(containerStyles);

    return `
    <section class="component component-${index} py-16 px-4" style="${containerStyle}">
        <div class="container mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    ${content.headline || 'Frequently Asked Questions'}
                </h2>
            </div>
            <div class="max-w-2xl mx-auto space-y-4">
                ${faqs.map((faq, faqIndex) => `
                    <div class="bg-white rounded-lg shadow-md">
                        <button class="w-full text-left p-4 focus:outline-none" onclick="toggleFaq('${index}-${faqIndex}')">
                            <div class="flex justify-between items-center">
                                <h3 class="font-semibold text-gray-900">${faq.question}</h3>
                                <span class="text-gray-500">+</span>
                            </div>
                        </button>
                        <div id="faq-${index}-${faqIndex}" class="hidden p-4 pt-0">
                            <p class="text-gray-600">${faq.answer}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <script>
        function toggleFaq(id) {
            const element = document.getElementById('faq-' + id);
            if (element.classList.contains('hidden')) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    </script>`;
  }

  private generateFavicon(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
    </svg>`;
  }

  private generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: /sitemap.xml`;
  }

  private buildInlineStyles(styles: any): string {
    if (!styles || typeof styles !== 'object') return '';
    
    const styleEntries = [];
    
    // Handle common CSS properties
    if (styles.backgroundColor) styleEntries.push(`background-color: ${styles.backgroundColor}`);
    if (styles.color) styleEntries.push(`color: ${styles.color}`);
    if (styles.textColor) styleEntries.push(`color: ${styles.textColor}`);
    if (styles.fontSize) styleEntries.push(`font-size: ${styles.fontSize}px`);
    if (styles.fontWeight) styleEntries.push(`font-weight: ${styles.fontWeight}`);
    if (styles.textAlign) styleEntries.push(`text-align: ${styles.textAlign}`);
    if (styles.padding) {
      if (Array.isArray(styles.padding)) {
        styleEntries.push(`padding: ${styles.padding.map(p => `${p}px`).join(' ')}`);
      } else {
        styleEntries.push(`padding: ${styles.padding}px`);
      }
    }
    if (styles.margin) {
      if (Array.isArray(styles.margin)) {
        styleEntries.push(`margin: ${styles.margin.map(m => `${m}px`).join(' ')}`);
      } else {
        styleEntries.push(`margin: ${styles.margin}px`);
      }
    }
    if (styles.borderRadius) styleEntries.push(`border-radius: ${styles.borderRadius}px`);
    if (styles.borderColor) styleEntries.push(`border-color: ${styles.borderColor}`);
    if (styles.borderWidth) styleEntries.push(`border-width: ${styles.borderWidth}px`);
    if (styles.boxShadow) styleEntries.push(`box-shadow: ${styles.boxShadow}`);
    if (styles.background) styleEntries.push(`background: ${styles.background}`);
    
    return styleEntries.join('; ');
  }

  private generateButtonAction(action: any): string {
    if (!action) return '';
    
    switch (action.type) {
      case 'marketplace_checkout':
      case 'external_link':
        return action.url ? `window.open('${action.url}', '_blank')` : '';
      case 'scroll_to':
        return action.target_id ? `document.getElementById('${action.target_id}')?.scrollIntoView({behavior: 'smooth'})` : '';
      default:
        return '';
    }
  }
}
