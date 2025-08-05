import { LandingPageComponent } from '@/types/components';
import { ReactProjectTemplateGenerator, ReactProjectTemplate } from './react-project-template-generator';
import { ComponentCleanerService, CleanedComponent } from './component-cleaner-service';

export interface ReactProjectFiles extends Record<string, string> {
  // Base project files
  'package.json': string;
  'index.html': string;
  'vite.config.js': string;
  'src/main.jsx': string;
  'src/App.jsx': string;
  'src/index.css': string;
  '_headers': string;
  'netlify.toml': string;
  
  // Utility files
  'src/utils/cn.js': string;
  'src/utils/button-actions.js': string;
  'src/utils/format.js': string;
  
  // Component files (dynamically generated)
  'src/components/index.js': string;
}

export class ReactProjectGenerator {
  private templateGenerator: ReactProjectTemplateGenerator;
  private componentCleaner: ComponentCleanerService;

  constructor() {
    this.templateGenerator = new ReactProjectTemplateGenerator();
    this.componentCleaner = new ComponentCleanerService();
  }

  generateReactProject(pageData: any): Record<string, string> {
    // Generate the base template
    const template = this.templateGenerator.generateTemplate(pageData);
    
    // Clean and prepare components
    const cleanedComponents = this.componentCleaner.cleanComponents(pageData.components || []);
    
    // Generate utility files
    const utilityFiles = this.componentCleaner.generateUtilityFiles();
    
    // Generate component index file
    const componentIndexFile = this.generateComponentIndexFile(cleanedComponents);
    
    // Generate updated App.jsx with proper imports
    const updatedApp = this.generateUpdatedAppJsx(pageData, cleanedComponents);
    
    // Combine all files
    const projectFiles: Record<string, string> = {
      // Base template files
      ...template,
      
      // Utility files
      ...utilityFiles,
      
      // Updated files
      'src/App.jsx': updatedApp,
      'src/components/index.js': componentIndexFile,
    };
    
    // Add individual component files
    Object.entries(cleanedComponents).forEach(([componentName, component]) => {
      projectFiles[`src/components/${componentName}.jsx`] = component.code;
    });
    
    return projectFiles;
  }

  private generateComponentIndexFile(cleanedComponents: Record<string, CleanedComponent>): string {
    const exports = Object.keys(cleanedComponents)
      .map(componentName => `export { default as ${componentName} } from './${componentName}.jsx';`)
      .join('\n');
    
    return `// Auto-generated component exports
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
      'package.json',
      'index.html',
      'vite.config.js',
      'src/main.jsx',
      'src/App.jsx',
      'src/index.css',
      'src/components/index.js',
      'netlify.toml'
    ];
    
    for (const file of requiredFiles) {
      if (!files[file]) {
        console.error(`Missing required file: ${file}`);
        return false;
      }
    }
    
    // Validate package.json
    try {
      JSON.parse(files['package.json']);
    } catch (error) {
      console.error('Invalid package.json:', error);
      return false;
    }
    
    // Validate that we have at least one component
    const componentFiles = Object.keys(files).filter(key => 
      key.startsWith('src/components/') && key.endsWith('.jsx') && key !== 'src/components/index.js'
    );
    
    if (componentFiles.length === 0) {
      console.error('No component files found');
      return false;
    }
    
    return true;
  }

  getProjectInfo(files: Record<string, string>): {
    totalFiles: number;
    componentCount: number;
    totalSize: number;
    buildCommand: string;
    publishDir: string;
  } {
    const componentFiles = Object.keys(files).filter(key => 
      key.startsWith('src/components/') && key.endsWith('.jsx') && key !== 'src/components/index.js'
    );
    
    const totalSize = Object.values(files).reduce((sum, content) => sum + content.length, 0);
    
    return {
      totalFiles: Object.keys(files).length,
      componentCount: componentFiles.length,
      totalSize,
      buildCommand: 'npm run build',
      publishDir: 'dist'
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
}
