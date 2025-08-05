import { LandingPageComponent } from '@/types/components';

export interface CleanedComponent {
  name: string;
  code: string;
  dependencies: string[];
}

export class ComponentCleanerService {
  private editWrapperPatterns = [
    // SelectableElement wrapper patterns
    /<SelectableElement[^>]*>/g,
    /<\/SelectableElement>/g,
    
    // Edit wrapper class patterns
    /className={[^}]*\b(selectable-element|edit-wrapper|builder-element)[^}]*}/g,
    
    // onClick handlers for editing
    /onClick={\s*\(\)\s*=>\s*[^}]*onElementSelect[^}]*}/g,
    /onClick={\s*handleElementSelect[^}]*}/g,
    
    // Data attributes for editing
    /data-element-id="[^"]*"/g,
    /data-selectable="[^"]*"/g,
    /data-editable="[^"]*"/g,
    
    // Editing state checks
    /\{isEditing\s*&&[^}]*\}/g,
    /isEditing\s*\?\s*[^:]*:\s*[^}]*/g,
    
    // Style change handlers
    /onStyleChange={\s*[^}]*}/g,
    /onContentChange={\s*[^}]*}/g,
    /onElementSelect={\s*[^}]*}/g,
    
    // Selected element indicators
    /selectedElementId={\s*[^}]*}/g,
    /\{selectedElementId[^}]*\}/g,
    
    // Edit overlay patterns
    /<div[^>]*className="[^"]*edit-overlay[^"]*"[^>]*>.*?<\/div>/gs,
    
    // Builder-specific imports that shouldn't be in production
    /import.*SelectableElement.*from.*;\s*/g,
    /import.*ImageUpload.*from.*;\s*/g,
    /import.*useComponentMedia.*from.*;\s*/g,
    
    // Console.log statements
    /console\.(log|warn|error|info)\([^)]*\);\s*/g,
    
    // Dev-only comments
    /\/\*\s*DEV.*?\*\//gs,
    /\/\/\s*DEV.*$/gm,
  ];

  cleanComponents(components: LandingPageComponent[]): Record<string, CleanedComponent> {
    const cleanedComponents: Record<string, CleanedComponent> = {};
    
    for (const component of components) {
      const componentType = component.component_variation?.component_type;
      const variation = component.component_variation?.variation_number;
      
      if (!componentType || !variation) continue;
      
      const componentName = `${this.capitalize(componentType)}Variation${variation}`;
      const cleanedCode = this.cleanComponentCode(componentType, variation);
      
      cleanedComponents[componentName] = {
        name: componentName,
        code: cleanedCode,
        dependencies: this.extractDependencies(cleanedCode)
      };
    }
    
    return cleanedComponents;
  }

  private cleanComponentCode(componentType: string, variation: number): string {
    // Get the original component code (this would need to be implemented to read from the actual component files)
    const originalCode = this.getOriginalComponentCode(componentType, variation);
    
    let cleanedCode = originalCode;
    
    // Apply all cleaning patterns
    for (const pattern of this.editWrapperPatterns) {
      cleanedCode = cleanedCode.replace(pattern, '');
    }
    
    // Clean up empty lines and excessive whitespace
    cleanedCode = cleanedCode
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple empty lines with double newline
      .replace(/^\s*\n/gm, '') // Remove empty lines at start
      .replace(/\n\s*$/g, '\n') // Clean trailing whitespace
      .trim();
    
    // Fix React component structure
    cleanedCode = this.fixReactComponentStructure(cleanedCode);
    
    // Remove editing-specific props from interface
    cleanedCode = this.cleanPropsInterface(cleanedCode);
    
    // Convert to production-ready component
    cleanedCode = this.convertToProductionComponent(cleanedCode, componentType, variation);
    
    return cleanedCode;
  }

  private getOriginalComponentCode(componentType: string, variation: number): string {
    // In a real implementation, this would read the actual component file
    // For now, we'll create a simplified template
    return this.generateProductionComponentTemplate(componentType, variation);
  }

  private generateProductionComponentTemplate(componentType: string, variation: number): string {
    const componentName = `${this.capitalize(componentType)}Variation${variation}`;
    
    return `import React from 'react';
import { cn } from '../utils/cn';

interface ${componentName}Props {
  content: Record<string, any>;
  styles: Record<string, any>;
  visibility: Record<string, boolean>;
  mediaUrls: Record<string, string>;
  customActions: Record<string, any>;
  globalTheme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    direction: 'ltr' | 'rtl';
    language: string;
  };
  viewport?: 'mobile' | 'tablet' | 'desktop' | 'responsive';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  content,
  styles,
  visibility,
  mediaUrls,
  customActions,
  globalTheme,
  viewport = 'responsive'
}) => {
  // Component-specific logic here
  const containerStyles = styles.container || {};
  const primaryColor = globalTheme.primaryColor || '#3b82f6';
  
  // Handle button clicks
  const handleButtonClick = (actionKey: string) => {
    const action = customActions[actionKey];
    if (!action) return;
    
    switch (action.type) {
      case 'checkout':
        // Handle checkout action
        if (action.url) {
          window.open(action.url, '_blank');
        }
        break;
      case 'external_link':
        if (action.url) {
          window.open(action.url, action.target || '_blank');
        }
        break;
      case 'scroll_to':
        if (action.target_id) {
          document.getElementById(action.target_id)?.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  };
  
  return (
    <section 
      className={cn(
        "w-full",
        viewport === 'mobile' && "px-4",
        viewport === 'tablet' && "px-6",
        viewport === 'desktop' && "px-8"
      )}
      style={{
        backgroundColor: containerStyles.backgroundColor || 'transparent',
        color: containerStyles.textColor || '#1a202c',
        padding: containerStyles.padding ? 
          \`\${containerStyles.padding[0]}px \${containerStyles.padding[1]}px \${containerStyles.padding[2]}px \${containerStyles.padding[3]}px\` : 
          undefined
      }}
    >
      <div className="container mx-auto">
        {/* Component content goes here */}
        ${this.getComponentContent(componentType, variation)}
      </div>
    </section>
  );
};

export default ${componentName};`;
  }

  private getComponentContent(componentType: string, variation: number): string {
    // Return basic content structure based on component type
    switch (componentType) {
      case 'hero':
        return `{visibility.headline !== false && (
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: primaryColor }}
          >
            {content.headline || 'Your Headline Here'}
          </h1>
        )}
        {visibility.subheadline !== false && (
          <p className="text-xl mb-8 opacity-90">
            {content.subheadline || 'Your subheadline here'}
          </p>
        )}
        {visibility.ctaButton !== false && (
          <button
            onClick={() => handleButtonClick('ctaButton')}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            {content.ctaButton || 'Get Started'}
          </button>
        )}`;
      
      case 'features':
        return `<div className="grid md:grid-cols-3 gap-8">
          {(content.features || []).map((feature, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="opacity-90">{feature.description}</p>
            </div>
          ))}
        </div>`;
      
      case 'cta':
        return `<div className="text-center">
          {visibility.headline !== false && (
            <h2 className="text-3xl font-bold mb-6">
              {content.headline || 'Ready to Get Started?'}
            </h2>
          )}
          {visibility.ctaButton !== false && (
            <button
              onClick={() => handleButtonClick('ctaButton')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {content.ctaButton || 'Get Started Now'}
            </button>
          )}
        </div>`;
      
      default:
        return `<div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {content.headline || 'Component Content'}
          </h2>
          <p className="opacity-90">
            {content.description || 'Component description goes here'}
          </p>
        </div>`;
    }
  }

  private fixReactComponentStructure(code: string): string {
    // Ensure proper React component structure
    if (!code.includes('import React')) {
      code = "import React from 'react';\n" + code;
    }
    
    // Add utility function if needed
    if (code.includes('cn(') && !code.includes('import { cn }')) {
      code = code.replace('import React from \'react\';', 
        'import React from \'react\';\nimport { cn } from \'../utils/cn\';');
    }
    
    return code;
  }

  private cleanPropsInterface(code: string): string {
    // Remove editing-specific props from the interface
    const editingProps = [
      'isEditing\\??: boolean;',
      'selectedElementId\\??: string \\| null;',
      'onStyleChange\\??: \\([^)]*\\) => void;',
      'onContentChange\\??: \\([^)]*\\) => void;',
      'onElementSelect\\??: \\([^)]*\\) => void;',
      'componentId\\??: string;'
    ];
    
    for (const prop of editingProps) {
      const regex = new RegExp(`\\s*${prop}\\s*`, 'g');
      code = code.replace(regex, '\n');
    }
    
    return code;
  }

  private convertToProductionComponent(code: string, componentType: string, variation: number): string {
    const componentName = `${this.capitalize(componentType)}Variation${variation}`;
    
    // Ensure the component is exported as default
    if (!code.includes(`export default ${componentName}`)) {
      code += `\n\nexport default ${componentName};`;
    }
    
    return code;
  }

  private extractDependencies(code: string): string[] {
    const dependencies = new Set<string>();
    
    // Extract import statements
    const importMatches = code.match(/import\s+.*?\s+from\s+['"][^'"]+['"]/g) || [];
    
    for (const importMatch of importMatches) {
      const moduleMatch = importMatch.match(/from\s+['"]([^'"]+)['"]/);
      if (moduleMatch && moduleMatch[1]) {
        const moduleName = moduleMatch[1];
        
        // Only include external dependencies, not relative imports
        if (!moduleName.startsWith('.') && !moduleName.startsWith('@/')) {
          dependencies.add(moduleName);
        }
      }
    }
    
    return Array.from(dependencies);
  }

  generateUtilityFiles(): Record<string, string> {
    return {
      'src/utils/cn.js': this.generateCnUtility(),
      'src/utils/button-actions.js': this.generateButtonActionsUtility(),
      'src/utils/format.js': this.generateFormatUtility()
    };
  }

  private generateCnUtility(): string {
    return `import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}`;
  }

  private generateButtonActionsUtility(): string {
    return `export const handleButtonClick = (action, customActions) => {
  if (!action || !customActions[action]) return;
  
  const actionConfig = customActions[action];
  
  switch (actionConfig.type) {
    case 'checkout':
      if (actionConfig.url) {
        window.open(actionConfig.url, '_blank');
      }
      break;
    case 'external_link':
      if (actionConfig.url) {
        window.open(actionConfig.url, actionConfig.target || '_blank');
      }
      break;
    case 'scroll_to':
      if (actionConfig.target_id) {
        const element = document.getElementById(actionConfig.target_id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      break;
    default:
      console.warn('Unknown action type:', actionConfig.type);
  }
};`;
  }

  private generateFormatUtility(): string {
    return `export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
