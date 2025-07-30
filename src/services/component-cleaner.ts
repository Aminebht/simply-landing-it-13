import * as fs from "fs/promises";
import * as path from "path";

interface ComponentData {
  id: string;
  type: string;
  variation: number;
  content: any;
  styles: any;
  visibility: Record<string, boolean>;
  customActions: Record<string, any>;
  mediaUrls: Record<string, string>;
}

interface GlobalTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  direction: string;
  language: string;
  customCss?: string;
}

export class ComponentCleaner {
  
  /**
   * Clean a React component file for production by removing editing wrappers
   * and injecting actual data
   */
  static async cleanComponentForProduction(
    originalCode: string,
    componentData: ComponentData,
    globalTheme: GlobalTheme
  ): Promise<string> {
    let cleanedCode = originalCode;

    // Step 1: Remove editing-related imports
    cleanedCode = this.removeEditingImports(cleanedCode);

    // Step 2: Remove editing props from interfaces
    cleanedCode = this.removeEditingProps(cleanedCode);

    // Step 3: Remove SelectableElement wrappers
    cleanedCode = this.removeSelectableElements(cleanedCode);

    // Step 4: Remove VisibilityControls
    cleanedCode = this.removeVisibilityControls(cleanedCode);

    // Step 5: Remove editing conditional rendering
    cleanedCode = this.removeEditingConditionals(cleanedCode);

    // Step 6: Inject actual content
    cleanedCode = this.injectActualContent(cleanedCode, componentData);

    // Step 7: Inject actual styles
    cleanedCode = this.injectActualStyles(cleanedCode, componentData, globalTheme);

    // Step 8: Inject media URLs
    cleanedCode = this.injectMediaUrls(cleanedCode, componentData);

    // Step 9: Apply visibility settings
    cleanedCode = this.applyVisibilitySettings(cleanedCode, componentData);

    // Step 10: Convert button actions
    cleanedCode = this.convertButtonActions(cleanedCode, componentData);

    // Step 11: Clean up component export
    cleanedCode = this.cleanupExports(cleanedCode, componentData);

    return cleanedCode;
  }

  private static removeEditingImports(code: string): string {
    const editingImports = [
      /import.*SelectableElement.*from.*\n/g,
      /import.*useStyles.*from.*\n/g,
      /import.*VisibilityControls.*from.*\n/g,
      /import.*ElementStylePanel.*from.*\n/g,
      /import.*ContentEditPanel.*from.*\n/g,
      /import.*ButtonActionConfig.*from.*\n/g,
      /import.*VariationSelector.*from.*\n/g,
    ];

    let result = code;
    editingImports.forEach(pattern => {
      result = result.replace(pattern, "");
    });

    return result;
  }

  private static removeEditingProps(code: string): string {
    const editingProps = [
      /isEditing\?:\s*boolean;?\n?/g,
      /onSelect\?:\s*\(\) => void;?\n?/g,
      /isSelected\?:\s*boolean;?\n?/g,
      /onContentChange\?:\s*\([^)]*\) => void;?\n?/g,
      /onStyleChange\?:\s*\([^)]*\) => void;?\n?/g,
      /onVisibilityChange\?:\s*\([^)]*\) => void;?\n?/g,
    ];

    let result = code;
    editingProps.forEach(pattern => {
      result = result.replace(pattern, "");
    });

    return result;
  }

  private static removeSelectableElements(code: string): string {
    // Replace SelectableElement with div
    let result = code.replace(/<SelectableElement[^>]*>/g, "<div>");
    result = result.replace(/<\/SelectableElement>/g, "</div>");
    
    // Remove SelectableElement props from existing divs
    result = result.replace(/\s+isSelected=\{[^}]*\}/g, "");
    result = result.replace(/\s+onSelect=\{[^}]*\}/g, "");
    
    return result;
  }

  private static removeVisibilityControls(code: string): string {
    // Remove VisibilityControls components
    return code.replace(/<VisibilityControls[^>]*\/>/g, "");
  }

  private static removeEditingConditionals(code: string): string {
    let result = code;
    
    // Remove isEditing conditionals
    result = result.replace(/\{isEditing\s*&&\s*[^}]*\}/g, "");
    result = result.replace(/\{!isEditing\s*&&\s*([^}]*)\}/g, "$1");
    
    // Remove editing-related ternary operators
    result = result.replace(/isEditing\s*\?\s*[^:]*:\s*([^}]*)/g, "$1");
    
    return result;
  }

  private static injectActualContent(code: string, componentData: ComponentData): string {
    let result = code;
    
    // Replace content object references with actual values
    for (const [key, value] of Object.entries(componentData.content)) {
      const patterns = [
        new RegExp(`content\\.${key}`, "g"),
        new RegExp(`\\{content\\.${key}\\}`, "g"),
        new RegExp(`content\\[\'${key}\'\\]`, "g"),
        new RegExp(`content\\["${key}"\\]`, "g"),
      ];
      
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, stringValue);
      });
    }

    return result;
  }

  private static injectActualStyles(
    code: string, 
    componentData: ComponentData, 
    globalTheme: GlobalTheme
  ): string {
    let result = code;
    
    // Replace style object references with actual values
    for (const [key, value] of Object.entries(componentData.styles)) {
      const styleString = this.generateInlineStyles(value, globalTheme);
      
      const patterns = [
        new RegExp(`styles\\.${key}`, "g"),
        new RegExp(`\\{styles\\.${key}\\}`, "g"),
        new RegExp(`styles\\[\'${key}\'\\]`, "g"),
        new RegExp(`styles\\["${key}"\\]`, "g"),
      ];
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, `"${styleString}"`);
      });
    }

    // Replace theme variables
    result = result.replace(/globalTheme\.primaryColor/g, `"${globalTheme.primaryColor}"`);
    result = result.replace(/globalTheme\.secondaryColor/g, `"${globalTheme.secondaryColor}"`);
    result = result.replace(/globalTheme\.backgroundColor/g, `"${globalTheme.backgroundColor}"`);
    result = result.replace(/globalTheme\.textColor/g, `"${globalTheme.textColor}"`);
    result = result.replace(/globalTheme\.fontFamily/g, `"${globalTheme.fontFamily}"`);

    return result;
  }

  private static injectMediaUrls(code: string, componentData: ComponentData): string {
    let result = code;
    
    // Replace media URL references with actual URLs
    for (const [key, url] of Object.entries(componentData.mediaUrls)) {
      const patterns = [
        new RegExp(`mediaUrls\\.${key}`, "g"),
        new RegExp(`\\{mediaUrls\\.${key}\\}`, "g"),
        new RegExp(`mediaUrls\\[\'${key}\'\\]`, "g"),
        new RegExp(`mediaUrls\\["${key}"\\]`, "g"),
      ];
      
      patterns.forEach(pattern => {
        result = result.replace(pattern, `"${url}"`);
      });
    }

    return result;
  }

  private static applyVisibilitySettings(code: string, componentData: ComponentData): string {
    let result = code;
    
    // Remove elements that are set to not visible
    for (const [element, isVisible] of Object.entries(componentData.visibility)) {
      if (isVisible === false) {
        // Remove the entire element block
        const elementPattern = new RegExp(
          `\\{visibility\\.${element}\\s*!==\\s*false\\s*\\?[^}]*\\}`,
          "g"
        );
        result = result.replace(elementPattern, "");
        
        // Also handle simpler visibility patterns
        const simplePattern = new RegExp(
          `\\{visibility\\.${element}\\s*&&[^}]*\\}`,
          "g"
        );
        result = result.replace(simplePattern, "");
      }
    }

    // Clean up remaining visibility checks for visible elements
    result = result.replace(/\{visibility\.\w+\s*!==\s*false\s*\?\s*([^}]*)\s*:\s*[^}]*\}/g, "$1");
    result = result.replace(/\{visibility\.\w+\s*&&\s*([^}]*)\}/g, "$1");

    return result;
  }

  private static convertButtonActions(code: string, componentData: ComponentData): string {
    let result = code;
    
    // Convert button actions to proper href and onclick handlers
    for (const [actionKey, action] of Object.entries(componentData.customActions)) {
      if (action && typeof action === "object") {
        const href = action.url || "#";
        const target = action.url && action.url.startsWith("http" ) ? "target=\"_blank\"" : "";
        const onClick = action.onClick ? `onclick="${action.onClick}"` : "";
        
        // Replace action references
        const actionPattern = new RegExp(`customActions\\[\'${actionKey}\'\\]`, "g");
        result = result.replace(actionPattern, `{ url: "${href}", target: "${target}", onClick: "${onClick}" }`);
        
        const actionPattern2 = new RegExp(`customActions\\.${actionKey}`, "g");
        result = result.replace(actionPattern2, `{ url: "${href}", target: "${target}", onClick: "${onClick}" }`);
      }
    }

    return result;
  }

  private static cleanupExports(code: string, componentData: ComponentData): string {
    const componentName = `${componentData.type.charAt(0).toUpperCase() + componentData.type.slice(1)}Variation${componentData.variation}`;
    
    // Remove existing exports
    let result = code.replace(/export\s+\{[^}]*\}[^;]*;?/g, "");
    result = result.replace(/export\s+default\s+\w+;?/g, "");
    
    // Add default export
    result += `\nexport default ${componentName};`;
    
    return result;
  }

  private static generateInlineStyles(styles: any, globalTheme: GlobalTheme): string {
    if (!styles || typeof styles !== "object") return "";
    
    const styleEntries = Object.entries(styles).map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value}`;
    });
    
    return styleEntries.join("; ");
  }

  /**
   * Read and clean a component file from the filesystem
   */
  static async cleanComponentFile(
    componentPath: string,
    componentData: ComponentData,
    globalTheme: GlobalTheme
  ): Promise<string> {
    try {
      const originalCode = await fs.readFile(componentPath, "utf-8");
      return this.cleanComponentForProduction(originalCode, componentData, globalTheme);
    } catch (error) {
      throw new Error(`Failed to read component file ${componentPath}: ${error}`);
    }
  }

  /**
   * Generate a fallback component if the original cannot be found
   */
  static generateFallbackComponent(
    componentData: ComponentData,
    globalTheme: GlobalTheme
  ): string {
    const componentName = `${componentData.type.charAt(0).toUpperCase() + componentData.type.slice(1)}Variation${componentData.variation}`;
    
    return `import React from "react";

const ${componentName}: React.FC = () => {
  return (
    <section 
      className="py-16" 
      style={{ 
        backgroundColor: "${globalTheme.backgroundColor}",
        color: "${globalTheme.textColor}",
        fontFamily: "${globalTheme.fontFamily}"
      }}
    >
      <div className="container mx-auto px-4">
        <h2 
          className="text-3xl font-bold text-center mb-8"
          style={{ color: "${globalTheme.primaryColor}" }}
        >
          ${componentData.content.headline || `${componentData.type} Component`}
        </h2>
        <p className="text-center">
          ${componentData.content.description || componentData.content.subheadline || "Component content will be displayed here."}
        </p>
        ${componentData.content.ctaButton ? `
        <div className="text-center mt-8">
          <a 
            href="${componentData.customActions["cta-button"]?.url || "#"}"
            className="inline-block px-8 py-4 rounded-lg font-semibold text-white"
            style={{ backgroundColor: "${globalTheme.primaryColor}" }}
          >
            ${componentData.content.ctaButton}
          </a>
        </div>
        ` : ""}
      </div>
    </section>
  );
};

export default ${componentName};
`;
  }
}

