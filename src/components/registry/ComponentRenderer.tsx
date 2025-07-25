import React, { useEffect } from 'react';
import { ComponentProps } from '@/types/components';
import { getComponent } from './ComponentRegistry';
import PageSyncService from '@/services/page-sync';

interface ComponentRendererProps {
  type: string;
  variation: number;
  content: Record<string, any>;
  styles: Record<string, any>;
  visibility: Record<string, boolean>;
  mediaUrls?: Record<string, string>; // Added media_urls prop
  marketplaceData?: any;
  trackingConfig?: any;
  isEditing?: boolean;
  selectedElementId?: string | null;
  viewport?: 'mobile' | 'tablet' | 'desktop';
  globalTheme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    direction: 'ltr' | 'rtl';
    language: string;
  };
  customStyles?: Record<string, any>;
  componentId?: string; // Add componentId prop for database operations
  onStyleChange?: (elementId: string, styles: any) => void;
  onContentChange?: (field: string, value: any) => void;
  onElementSelect?: (elementId: string) => void;
  customActions?: Record<string, any>; // Add customActions prop
}

// Helper function to extract component type from a UUID-based component ID
const extractComponentTypeFromUUID = (uuidString: string): string | null => {
  // Try to match UUID pattern
  const uuidRegex = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(uuidString)) {
    // This is likely a UUID, return a default component type
    return null;
  }
  
  // If it contains a hyphen, it might be in the format "type-variation"
  if (uuidString.includes('-')) {
    const [typeStr] = uuidString.split('-');
    // Check if the type part is a valid component type
    const validTypes = ['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta'];
    return validTypes.includes(typeStr) ? typeStr : null;
  }
  
  return null;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  type,
  variation,
  content,
  styles,
  visibility,
  mediaUrls,
  marketplaceData,
  trackingConfig,
  isEditing,
  selectedElementId,
  viewport,
  globalTheme,
  customStyles,
  componentId,
  onStyleChange,
  onContentChange,
  onElementSelect,
  customActions // <-- Add this to props
}) => {
  // Handle UUID-based component types
  let componentType = type;
  let componentVariation = variation;
  
  // If type is a UUID or doesn't exist in our registry, try to fix it
  if (!componentType || componentType.length > 10) {
    // Default to a known component type if we can't determine it
    componentType = 'hero';
    componentVariation = 1;
  }
  
  const Component = getComponent(componentType, componentVariation);
  
  if (!Component) {
    // Check if the component type is valid
    const validTypes = ['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta'];
    const isValidType = validTypes.includes(componentType);
    
    // Check if the variation number is within a reasonable range
    const isValidVariation = componentVariation >= 1 && componentVariation <= 6;
    
    return (
      <div className="p-8 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-destructive mb-2">Component Not Found</h3>
        <p className="text-destructive/70">
          Component {componentType} variation {componentVariation} is not implemented
        </p>
        {!isValidType && (
          <p className="mt-2 text-sm text-destructive/60">
            <strong>Error:</strong> Invalid component type "{componentType}". 
            Valid types are: {validTypes.join(', ')}
            {type !== componentType && (
              <span> (original input: "{type}")</span>
            )}
          </p>
        )}
        {!isValidVariation && (
          <p className="mt-2 text-sm text-destructive/60">
            <strong>Error:</strong> Invalid variation number {componentVariation}.
            Supported variations are 1-6.
            {variation !== componentVariation && (
              <span> (original input: {variation})</span>
            )}
          </p>
        )}
      </div>
    );
  }
  
  // Create a deep copy of styles to avoid mutation issues
  const mergedStyles = JSON.parse(JSON.stringify(styles || {}));
  
  // Apply global theme values to container if available
  if (globalTheme) {
    // Ensure container exists
    if (!mergedStyles.container) {
      mergedStyles.container = {};
    }
    
    const hasCustomBackgroundColor = mergedStyles.container.backgroundColor && 
                                    mergedStyles.container.backgroundColor !== 'transparent' && 
                                    mergedStyles.container.backgroundColor !== 'inherit';
    
    mergedStyles.container = {
      ...mergedStyles.container,
      // Only use global backgroundColor if component doesn't have one explicitly set
      backgroundColor: hasCustomBackgroundColor ? mergedStyles.container.backgroundColor : globalTheme.backgroundColor,
      color: globalTheme.primaryColor || mergedStyles.container.textColor,
      fontFamily: globalTheme.fontFamily || mergedStyles.container.fontFamily,
      direction: globalTheme.direction || mergedStyles.container.direction,
    };
    
    // Apply primary and secondary colors as CSS variables to the container
    if (globalTheme.primaryColor) {
      mergedStyles.container['--primary-color'] = globalTheme.primaryColor;
    }
    if (globalTheme.secondaryColor) {
      mergedStyles.container['--secondary-color'] = globalTheme.secondaryColor;
    }
  }
  
  // Apply custom styles if available (overrides both component styles and global theme)
  if (customStyles) {
    Object.entries(customStyles).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        if (!mergedStyles[key]) mergedStyles[key] = {};
        mergedStyles[key] = { ...mergedStyles[key], ...value };
      } else if (value !== undefined) {
        mergedStyles[key] = value;
      }
    });
  }
  
  // Custom styles are processed above and handlers are set up to save to DB

  // Enhanced style change handler that ensures database syncing
  const handleStyleChange = (elementId: string, styles: any) => {
    // If onStyleChange prop exists, call it
    onStyleChange?.(elementId, styles);
    
    // If we're in edit mode and this component has a real DB id (not a temp id)
    // Note: component ids start with 'comp-' when they haven't been saved to DB yet
    if (isEditing && componentId && !componentId.includes('comp-')) {
      try {
        // Access PageSyncService to directly save changes
        const pageSyncService = PageSyncService.getInstance();
        
        // Create or update custom styles structure
        // Fix: Ensure we're working with a clean copy and handling nested objects properly
        const currentStyles = customStyles || {};
        const currentElementStyles = currentStyles[elementId] || {};
        
        // Create a clean styles object with only primitive values or simple objects
        const cleanStyles = {};
        Object.entries(styles).forEach(([key, value]) => {
          // Skip undefined, functions, or complex objects
          if (value === undefined || typeof value === 'function') return;
          
          // For simple values, store directly
          cleanStyles[key] = value;
        });
        
        console.log(`ComponentRenderer: Clean styles for element ${elementId}:`, cleanStyles);
        
        const updatedStyles = {
          ...currentStyles,
          [elementId]: {
            ...currentElementStyles,
            ...cleanStyles
          }
        };
        
        // Update the component in PageSyncService - only send the specific element changes
        const elementChanges = {
          [elementId]: {
            ...currentElementStyles,
            ...styles
          }
        };
        
        console.log(`ComponentRenderer: Saving updated custom styles for component ${componentId} element ${elementId}`);
        console.log('Before:', JSON.stringify(currentElementStyles));
        console.log('Element changes:', JSON.stringify(elementChanges));
        
        pageSyncService.updateComponentCustomStyles(componentId, elementChanges, false)
          .then(() => {
            console.log(`ComponentRenderer: Successfully updated custom styles in PageSyncService for ${componentId}`);
            
            // After successful style update, also save the entire component to ensure it gets persisted
            return pageSyncService.saveComponentToDatabase(componentId);
          })
          .then(() => {
            console.log(`ComponentRenderer: Successfully saved component ${componentId} to database`);
          })
          .catch(err => {
            console.error('ComponentRenderer: Failed to save style changes:', err);
          });
      } catch (error) {
        console.error('ComponentRenderer: Failed to save custom styles to database:', error);
      }
    }
  };
  
  // Enhanced content change handler that ensures database syncing
  const handleContentChangeWithDbSync = (field: string, value: any) => {
    // Call the passed onContentChange if available
    if (onContentChange) {
      onContentChange(field, value);
    }
    
    // If we're in edit mode, also ensure content changes get saved to DB directly
    if (isEditing && componentId && !componentId.includes('comp-')) {
      try {
        // Access PageSyncService to directly save changes after a short delay
        // We use a short timeout to batch content changes that might happen in sequence
        setTimeout(() => {
          const pageSyncService = PageSyncService.getInstance();
          console.log(`Saving content changes for component ${componentId} field ${field}`, value);
          pageSyncService.saveComponentToDatabase(componentId).catch(err => 
            console.error('Failed direct component save after content change:', err)
          );
        }, 500);
      } catch (error) {
        console.error('Failed to save content changes to database:', error);
      }
    }
  };

  const componentProps: ComponentProps = {
    content,
    styles: mergedStyles,
    visibility,
    mediaUrls, // Pass media_urls from prop
    marketplaceData,
    trackingConfig,
    isEditing,
    selectedElementId,
    viewport,
    componentId,
    onStyleChange: handleStyleChange,
    onContentChange: handleContentChangeWithDbSync,
    onElementSelect,
    customActions // <-- Pass down
  };
  
  // Debug logging for media URLs
  if (mediaUrls && Object.keys(mediaUrls).length > 0) {
    console.log(`ComponentRenderer: Passing media URLs to ${componentType}-${componentVariation}:`, mediaUrls);
  }

  // Debug log for customActions and all props
  console.log('ComponentRenderer props:', {
    type: componentType,
    variation: componentVariation,
    customActions,
    content,
    styles: mergedStyles,
    visibility,
    mediaUrls,
    isEditing,
    selectedElementId,
    viewport,
    componentId
  });
  
  return <Component {...componentProps} />;
};

export default ComponentRenderer;