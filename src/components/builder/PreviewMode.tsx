import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Download, Globe } from 'lucide-react';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { ResponsivePreviewToggle, ViewportSize } from './ResponsivePreviewToggle';
import { ReactSSRFileGenerator } from '@/services/react-ssr-file-generator';
import { OptimizedDeploymentService } from '@/services/optimized-deployment-service';
import { toast } from "sonner";
import { useParams } from 'react-router-dom';

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
  const { pageId } = useParams<{ pageId: string }>();
  const [isExporting, setIsExporting] = useState(false);
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');

  const handleDeploy = async () => {
    if (!pageId) {
      toast.error("No landing page selected");
      return;
    }

    try {
      setIsExporting(true);
      toast.info("Starting hybrid deployment (React SSR + Optimized)...");
      
      // Step 1: Generate React SSR files for 100% builder match
      const fileGenerator = new ReactSSRFileGenerator();
      const reactFiles = await fileGenerator.generateReactSSRFiles(pageId);
      
      toast.info("React SSR files generated, deploying...");
      
      // Step 2: Deploy using optimized service with pre-generated files
      const deploymentService = new OptimizedDeploymentService();
      const result = await deploymentService.deployLandingPage(pageId, reactFiles);
      
      if (result.success) {
        toast.success(`Hybrid deployment completed! URL: ${result.url}`, {
          action: {
            label: "Open",
            onClick: () => window.open(result.url, '_blank')
          }
        });
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error("Hybrid deployment failed:", error);
      toast.error("Failed to deploy landing page. Please check configuration.");
    } finally {
      setIsExporting(false);
    }
  };

  // Hydrate checkout actions in customActions with productData if missing
  const hydratedComponents = React.useMemo(() => {
    if (!productData) return components;
    
    // Check if any component needs hydration to avoid unnecessary object creation
    let needsHydration = false;
    for (const component of components) {
      if (!component.custom_actions) continue;
      
      for (const key of Object.keys(component.custom_actions)) {
        const action = component.custom_actions[key];
        if (action && action.type === 'checkout') {
          if (!action.productId || action.productId === '' || !action.amount || action.amount === '') {
            needsHydration = true;
            break;
          }
        }
      }
      
      if (needsHydration) break;
    }
    
    // If no hydration is needed, return original components to maintain referential equality
    if (!needsHydration) return components;
    
    // Only hydrate when necessary
    return components.map(component => {
      if (!component.custom_actions) return component;
      
      // Check if this component needs hydration
      let componentNeedsHydration = false;
      for (const key of Object.keys(component.custom_actions)) {
        const action = component.custom_actions[key];
        if (action && action.type === 'checkout') {
          if (!action.productId || action.productId === '' || !action.amount || action.amount === '') {
            componentNeedsHydration = true;
            break;
          }
        }
      }
      
      // If no hydration needed for this component, return as is
      if (!componentNeedsHydration) return component;
      
      // Hydrate only the actions that need it
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
    <div className="h-screen bg-gradient-to-br from-brand-light-cream/20 to-brand-cotton-candy-pink/10 font-poppins">
      {/* Preview Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-brand-deep-indigo/95 backdrop-blur-xl text-white px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-medium-violet to-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">👁️</span>
            </div>
            <div>
              <div className="font-semibold text-brand-light-cream">Live Preview</div>
              <div className="text-xs text-brand-light-cream/60">See your page as visitors will</div>
            </div>
          </div>
        </div>
        
        {/* Responsive Preview Controls */}
        <div className="flex items-center space-x-4">
          <ResponsivePreviewToggle
            currentViewport={currentViewport}
            onViewportChange={setCurrentViewport}
            className="bg-brand-medium-violet/20 border-brand-medium-violet/30"
          />
          
          <div className="text-xs text-brand-light-cream/80 bg-brand-medium-violet/20 px-3 py-1 rounded-full">
            {viewportSizes[currentViewport].width} × {viewportSizes[currentViewport].height}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            size="sm" 
            onClick={handleDeploy}
            disabled={isExporting || components.length === 0}
            className="bg-gradient-to-r from-brand-medium-violet to-brand-cotton-candy-pink hover:from-brand-cotton-candy-pink hover:to-brand-medium-violet text-brand-deep-indigo font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Globe className="h-4 w-4 mr-2" />
            {isExporting ? "Deploying..." : "Deploy Live"}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onExitPreview}
            className="text-brand-light-cream hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Exit Preview
          </Button>
        </div>
      </div>

      {/* Preview Content - Responsive Container */}
      <div className="pt-20 h-full flex items-center justify-center bg-gradient-to-br from-brand-light-cream/30 via-white/50 to-brand-cotton-candy-pink/20">
        {components.length === 0 ? (
          <div className="text-center p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-medium-violet/20 to-brand-deep-indigo/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="text-2xl font-bold text-brand-deep-indigo mb-3">No Content Yet</h3>
            <p className="text-brand-deep-indigo/60 mb-8 max-w-md">
              Add some sections to your page to see how it will look to your visitors
            </p>
            <Button 
              onClick={onExitPreview}
              className="bg-gradient-to-r from-brand-medium-violet to-brand-deep-indigo hover:from-brand-deep-indigo hover:to-brand-medium-violet text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Back to Editor
            </Button>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {/* Responsive Preview Frame */}
            <div 
              className="bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 ease-in-out border border-brand-lavender-gray/20"
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
