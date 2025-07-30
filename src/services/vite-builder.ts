import { build, InlineConfig } from "vite";
import * as fs from "fs/promises";
import * as path from "path";
import { ComponentCleaner } from "./component-cleaner";

interface BuildConfig {
  tempDir: string;
  landingPage: any;
  globalTheme: any;
  components: any[];
}

interface GeneratedFiles {
  [filePath: string]: string;
}

export class ViteBuilder {
  private tempDir: string;
  private buildConfig: BuildConfig;

  constructor(buildConfig: BuildConfig) {
    this.buildConfig = buildConfig;
    this.tempDir = buildConfig.tempDir;
  }

  /**
   * Create temporary project structure and build with Vite
   */
  async buildProject(): Promise<GeneratedFiles> {
    try {
      // Create project structure
      await this.createProjectStructure();
      
      // Install dependencies (in production, this would be pre-installed)
      // await this.installDependencies();
      
      // Build with Vite
      await this.runViteBuild();
      
      // Read generated files
      const files = await this.readGeneratedFiles();
      
      return files;
    } catch (error) {
      throw new Error(`Build failed: ${error}`);
    }
  }

  private async createProjectStructure(): Promise<void> {
    // Create package.json
    await this.createPackageJson();
    
    // Create vite.config.ts
    await this.createViteConfig();
    
    // Create tsconfig.json
    await this.createTsConfig();
    
    // Create index.html
    await this.createIndexHtml();
    
    // Create main.tsx
    await this.createMainTsx();
    
    // Create component files
    await this.createComponentFiles();
    
    // Create styles
    await this.createStyles();
  }

  private async createPackageJson(): Promise<void> {
    const packageJson = {
      name: "temp-landing-page",
      version: "1.0.0",
      type: "module",
      scripts: {
        build: "vite build"
      },
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^5.0.0",
        "typescript": "^5.0.0"
      }
    };

    await fs.writeFile(
      path.join(this.tempDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
  }

  private async createViteConfig(): Promise<void> {
    const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./index.html"
      }
    },
    minify: "terser",
    sourcemap: false
  },
  esbuild: {
    drop: ["console", "debugger"]
  }
});
`;

    await fs.writeFile(
      path.join(this.tempDir, "vite.config.ts"),
      viteConfig
    );
  }

  private async createTsConfig(): Promise<void> {
    const tsConfig = {
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
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true
      },
      include: ["src", "*.tsx", "*.ts"],
      references: [{ path: "./tsconfig.node.json" }]
    };

    await fs.writeFile(
      path.join(this.tempDir, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  private async createIndexHtml(): Promise<void> {
    const { landingPage, globalTheme } = this.buildConfig;
    const seoConfig = landingPage.seo_config || {};
    
    const html = `<!DOCTYPE html>
<html lang="${globalTheme.language || "en"}" dir="${globalTheme.direction || "ltr"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoConfig.title || landingPage.slug || "Landing Page"}</title>
  ${seoConfig.description ? `<meta name="description" content="${seoConfig.description}">` : ""}
  ${seoConfig.keywords?.length ? `<meta name="keywords" content="${seoConfig.keywords.join(", ")}">` : ""}
  ${seoConfig.ogImage ? `<meta property="og:image" content="${seoConfig.ogImage}">` : ""}
  ${seoConfig.canonical ? `<link rel="canonical" href="${seoConfig.canonical}">` : ""}
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: "${globalTheme.primaryColor}",
            secondary: "${globalTheme.secondaryColor}",
          },
          fontFamily: {
            custom: ["${globalTheme.fontFamily}", "system-ui", "sans-serif"],
          }
        }
      }
    }
  </script>
  
  <!-- Custom Theme CSS -->
  ${globalTheme.customCss ? `<style>${globalTheme.customCss}</style>` : ""}
  
  <!-- Tracking Scripts -->
  ${this.generateTrackingScripts(landingPage.tracking_config )}
</head>
<body style="font-family: ${globalTheme.fontFamily}, system-ui, sans-serif; background-color: ${globalTheme.backgroundColor}; color: ${globalTheme.textColor || "#000000"}; margin: 0; padding: 0;">
  <div id="root"></div>
  <script type="module" src="/main.tsx"></script>
</body>
</html>`;

    await fs.writeFile(
      path.join(this.tempDir, "index.html"),
      html
    );
  }

  private generateTrackingScripts(trackingConfig: any): string {
    let scripts = "";
    
    if (trackingConfig?.facebook_pixel_id) {
      scripts += `
  <!-- Facebook Pixel -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=\'2.0\';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,\'script\',
    \'https://connect.facebook.net/en_US/fbevents.js\' );
    fbq(\'init\', \'${trackingConfig.facebook_pixel_id}\');
    fbq(\'track\', \'PageView\');
  </script>
  <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${trackingConfig.facebook_pixel_id}&ev=PageView&noscript=1"
  /></noscript>`;
    }
    
    if (trackingConfig?.google_analytics_id ) {
      scripts += `
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${trackingConfig.google_analytics_id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag( ){dataLayer.push(arguments);}
    gtag(\'js\', new Date());
    gtag(\'config\', \'${trackingConfig.google_analytics_id}\');
  </script>`;
    }
    
    if (trackingConfig?.clarity_id) {
      scripts += `
  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r )[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${trackingConfig.clarity_id}");
  </script>`;
    }
    
    return scripts;
  }

  private async createMainTsx(): Promise<void> {
    const { components, globalTheme } = this.buildConfig;
    
    const imports = components.map(component => {
      const componentName = this.getComponentName(component);
      return `import ${componentName} from "./components/${componentName}";`;
    }).join("\n");

    const componentRenders = components.map(component => {
      const componentName = this.getComponentName(component);
      return `      <${componentName} />`;
    }).join("\n");

    const mainTsx = `import React from "react";
import ReactDOM from "react-dom/client";
${imports}

function App() {
  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: "${globalTheme.backgroundColor}",
        fontFamily: "${globalTheme.fontFamily}"
      }}
    >
${componentRenders}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
`;

    await fs.writeFile(
      path.join(this.tempDir, "main.tsx"),
      mainTsx
    );
  }

  private async createComponentFiles(): Promise<void> {
    const { components, globalTheme } = this.buildConfig;
    const componentsDir = path.join(this.tempDir, "components");
    await fs.mkdir(componentsDir, { recursive: true });

    for (const component of components) {
      const componentCode = await this.generateProductionComponent(component, globalTheme);
      const fileName = `${this.getComponentName(component)}.tsx`;
      await fs.writeFile(
        path.join(componentsDir, fileName),
        componentCode
      );
    }
  }

  private async generateProductionComponent(component: any, globalTheme: any): Promise<string> {
    // Try to read the original component file
    const originalComponentPath = this.getOriginalComponentPath(component);
    
    try {
      const originalCode = await fs.readFile(originalComponentPath, "utf-8");
      return ComponentCleaner.cleanComponentForProduction(originalCode, component, globalTheme);
    } catch (error) {
      console.warn(`Could not read original component file for ${component.type}-${component.variation}, generating fallback`);
      return ComponentCleaner.generateFallbackComponent(component, globalTheme);
    }
  }

  private getOriginalComponentPath(component: any): string {
    const projectRoot = process.cwd();
    const componentDir = path.join(projectRoot, "src", "components", "landing-components", component.type);
    const fileName = `${component.type.charAt(0).toUpperCase() + component.type.slice(1)}Variation${component.variation}.tsx`;
    return path.join(componentDir, fileName);
  }

  private getComponentName(component: any): string {
    return `${component.type.charAt(0).toUpperCase() + component.type.slice(1)}Variation${component.variation}`;
  }

  private async createStyles(): Promise<void> {
    const { globalTheme, components } = this.buildConfig;
    
    const css = `
/* Global Theme Styles */
:root {
  --primary-color: ${globalTheme.primaryColor};
  --secondary-color: ${globalTheme.secondaryColor};
  --background-color: ${globalTheme.backgroundColor};
  --text-color: ${globalTheme.textColor || "#000000"};
  --font-family: ${globalTheme.fontFamily};
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-family), system-ui, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

/* Component-specific styles */
${components.map(component => this.generateComponentCSS(component, globalTheme)).join("\n")}

/* Responsive utilities */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem;
  }
}

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
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Custom theme CSS */
${globalTheme.customCss || ""}
`;

    await fs.writeFile(
      path.join(this.tempDir, "styles.css"),
      css
    );
  }

  private generateComponentCSS(component: any, globalTheme: any): string {
    const componentClass = `.component-${component.type}-${component.variation}`;
    
    let css = `${componentClass} {\n`;
    
    if (component.styles?.container) {
      for (const [key, value] of Object.entries(component.styles.container)) {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        css += `  ${cssKey}: ${value};\n`;
      }
    }
    
    css += "}\n";
    
    return css;
  }

  private async runViteBuild(): Promise<void> {
    const config: InlineConfig = {
      root: this.tempDir,
      build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: path.join(this.tempDir, "index.html")
          }
        },
        minify: "terser",
        sourcemap: false
      },
      logLevel: "warn"
    };

    try {
      await build(config);
    } catch (error) {
      throw new Error(`Vite build failed: ${error}`);
    }
  }

  private async readGeneratedFiles(): Promise<GeneratedFiles> {
    const files: GeneratedFiles = {};
    const distDir = path.join(this.tempDir, "dist");
    
    try {
      const fileList = await this.getAllFiles(distDir);
      
      for (const filePath of fileList) {
        const relativePath = path.relative(distDir, filePath);
        
        // Read as text for HTML, CSS, JS files, as binary for others
        const isTextFile = /\.(html|css|js|json|txt|md)$/i.test(filePath);
        
        if (isTextFile) {
          const content = await fs.readFile(filePath, "utf-8");
          files[relativePath] = content;
        } else {
          // For binary files, read as base64
          const content = await fs.readFile(filePath);
          files[relativePath] = content.toString("base64");
        }
      }
    } catch (error) {
      throw new Error(`Failed to read generated files: ${error}`);
    }
    
    return files;
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
      console.warn(`Could not read directory ${dir}:`, error);
    }
    
    return files;
  }

  /**
   * Clean up temporary directory
   */
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn("Failed to cleanup temp directory:", error);
    }
  }
}

