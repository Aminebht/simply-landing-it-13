import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X} from 'lucide-react';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { ResponsivePreviewToggle, ViewportSize } from './ResponsivePreviewToggle';

interface PreviewModeProps {
  components: LandingPageComponent[];
  onExitPreview: () => void;
  direction?: 'ltr' | 'rtl';
  globalTheme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    direction: 'ltr' | 'rtl';
    language: string;
  };
  productData?: { id: string; price: number } | null;
}

const viewportSizes = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};

export const PreviewMode: React.FC<PreviewModeProps> = ({
  components,
  onExitPreview,
  direction = 'ltr',
  globalTheme,
  productData
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop');

  const handleExport = async () => {
    if (components.length === 0) {
      console.log("No content to export");
      return;
    }

    setIsExporting(true);
    
    try {
      // TODO: Implement export functionality for new component structure
      // const exportedProject = exportLandingPage(components);
      // await downloadProjectAsZip(exportedProject);

      console.log("Export coming soon!");
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Hydrate checkout actions in customActions with productData if missing
  const hydratedComponents = React.useMemo(() => {
    if (!productData) return components;
    return components.map(component => {
      if (!component.custom_actions) return component;
      const newActions = { ...component.custom_actions };
      Object.keys(newActions).forEach(key => {
        const action = newActions[key];
        if (action && action.type === 'checkout') {
          if (!action.productId || action.productId === '' || !action.amount || action.amount === '') {
            newActions[key] = {
              ...action,
              productId: productData.id,
              amount: productData.price
            };
          }
        }
      });
      return { ...component, custom_actions: newActions };
    });
  }, [components, productData]);

  return (
    <div className="h-screen bg-gray-100">
      {/* Preview Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            Production Preview
          </div>
        </div>
        
        {/* Responsive Preview Controls */}
        <div className="flex items-center space-x-4">
          <ResponsivePreviewToggle
            currentViewport={currentViewport}
            onViewportChange={setCurrentViewport}
            className="bg-gray-800"
          />
          
          <div className="text-xs text-gray-400">
            {viewportSizes[currentViewport].width} × {viewportSizes[currentViewport].height}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onExitPreview}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content - Responsive Container */}
      <div className="pt-16 h-full flex items-center justify-center bg-gray-100">
        {components.length === 0 ? (
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Content Yet</h3>
            <p className="text-gray-500 mb-6">
              Add some sections to see your landing page preview
            </p>
            <Button onClick={onExitPreview}>
              Back to Editor
            </Button>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {/* Responsive Preview Frame */}
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                width: currentViewport === 'desktop' ? '100%' : `${viewportSizes[currentViewport].width}px`,
                height: currentViewport === 'desktop' ? '100%' : `${viewportSizes[currentViewport].height}px`,
                maxWidth: currentViewport === 'desktop' ? '100%' : `${viewportSizes[currentViewport].width}px`,
                maxHeight: currentViewport === 'desktop' ? '100%' : `${viewportSizes[currentViewport].height}px`,
                margin: currentViewport === 'desktop' ? '0' : '20px'
              }}
            >
              <div className="h-full overflow-y-auto" dir={direction}>
                <div className="space-y-0">
                  {hydratedComponents.map((component) => {
                    // Prefer joined component_variation (from DB) for type/variation
                    let type = component.component_variation?.component_type;
                    let variationNum = component.component_variation?.variation_number;
                    // Fallback to legacy parsing if missing
                    if (!type || !variationNum) {
                      if (component.component_variation_id?.includes('-') && component.component_variation_id.split('-')[0].length < 10) {
                        const [typeStr, variationStr] = component.component_variation_id.split('-');
                        type = type || typeStr;
                        variationNum = variationNum || parseInt(variationStr, 10) || 1;
                      } else {
                        // Try to guess from UUID string
                        const validTypes = ['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta'];
                        const defaultType = 'hero';
                        if (component.component_variation_id) {
                          for (const validType of validTypes) {
                            if (component.component_variation_id.toLowerCase().includes(validType)) {
                              type = type || validType;
                              break;
                            }
                          }
                        }
                        if (!type) type = defaultType;
                        if (!variationNum) variationNum = 1;
                      }
                    }
                    // Debug log for custom_actions in PreviewMode
                    console.log('PreviewMode: component.custom_actions', component.id, component.custom_actions);

                    return (
                      <div key={component.id} id={`section-${component.id}`} data-section-id={component.id}>
                        <ComponentRenderer
                          type={type}
                          variation={variationNum}
                          content={component.content}
                          styles={component.styles}
                          visibility={component.visibility}
                          viewport={currentViewport}
                          isEditing={false}
                          globalTheme={globalTheme || { 
                            primaryColor: "", 
                            secondaryColor: "", 
                            backgroundColor: "", 
                            fontFamily: "", 
                            direction: direction, 
                            language: "en" 
                          }}
                          componentId={component.id}
                          customStyles={component.custom_styles}
                          customActions={component.custom_actions}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
