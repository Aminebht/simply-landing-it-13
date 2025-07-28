import React, { useState, useEffect, useCallback } from 'react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { DragDropCanvas } from '@/components/builder/DragDropCanvas';
import { ComponentLibrary } from '@/components/builder/ComponentLibrary';
import { VisualEditor } from '@/components/builder/VisualEditor';
import { PreviewMode } from '@/components/builder/PreviewMode';
import { DirectionToggle } from '@/components/builder/DirectionToggle';
import { ResponsivePreviewToggle, ViewportSize } from '@/components/builder/ResponsivePreviewToggle';
import { UndoRedoStatus } from '@/components/builder/UndoRedoStatus';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Eye, Edit, Save, Globe, ChevronLeft, ChevronRight, CloudUpload, Database } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { useDeployment } from '@/hooks/useDeployment';
import { LandingPageComponent, ComponentVariation } from '@/types/components';
import { LandingPageService } from '@/services/landing-page';
import { getComponentVariations } from '@/services/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";
import PageSyncService from '@/services/page-sync';
import { ThemeConfig } from '@/types/landing-page';

export default function Builder() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [landingPageId, setLandingPageId] = useState(pageId || 'demo-page-id');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'content' | 'styles' | 'visibility'>('content');
  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [currentViewport, setCurrentViewport] = useState<ViewportSize>('desktop');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [globalTheme, setGlobalTheme] = useState<ThemeConfig | null>(null);
  const [productData, setProductData] = useState<{ id: string; price: number } | null>(null);

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<LandingPageComponent | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Use useUndoRedo for undo/redo and component state
  const {
    state: components,
    set: setComponents,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistoryState
  } = useUndoRedo<LandingPageComponent[]>([]);

  const handleAddComponent = async (type: string) => {
    // Add new component and update undo/redo state
    const variation = 1;
    const variationMetadata = componentVariations.find(v => v.component_type === type && v.variation_number === variation);
    const defaultContent = variationMetadata?.default_content || {
      headline: 'Your Headline Here',
      subheadline: 'Your subheadline here',
      ctaButton: 'Get Started'
    };
    // Use visibility_keys to determine default visibility
    const defaultVisibility: Record<string, boolean> = {};
    if (variationMetadata?.visibility_keys) {
      variationMetadata.visibility_keys.forEach(vk => {
        defaultVisibility[vk.key] = true;
      });
    } else {
      defaultVisibility.headline = true;
      defaultVisibility.subheadline = true;
      defaultVisibility.ctaButton = true;
    }
    const newComponent: Omit<LandingPageComponent, 'id' | 'created_at' | 'updated_at'> = {
      page_id: pageId || landingPageId || 'temp-page',
      component_variation_id: variationMetadata?.id || `${type}-variation-${variation}`,
      order_index: components.length + 1,
      content: defaultContent,
      styles: {
        container: {
          padding: [60, 20, 60, 20],
          backgroundColor: '#ffffff',
          textColor: '#1a202c',
          primaryColor: globalTheme?.primaryColor || '#3b82f6',
          headingFont: {
            family: 'Inter',
            variants: ['400', '500', '600', '700'],
            category: 'sans-serif',
            googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
          },
          bodyFont: {
            family: 'Inter',
            variants: ['400', '500', '600', '700'],
            category: 'sans-serif',
            googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
          }
        }
      },
      visibility: defaultVisibility,
      custom_styles: {},
      media_urls: {},
      component_variation: variationMetadata
    };
    const updatedComponents = [...components, newComponent as LandingPageComponent];
    setComponents(updatedComponents);
    setSelectedComponent(newComponent as LandingPageComponent);
  };

  // 6. Remove Component
  const handleRemoveComponent = (componentId: string) => {
    const newComponents = components.filter(c => c.id !== componentId);
    setComponents(newComponents);
    PageSyncService.getInstance().updateComponents(newComponents);
  };

  // 7. Reorder Components
  const handleReorderComponents = async (newOrder: LandingPageComponent[]) => {
    console.log('Reordering components:', newOrder.map(c => ({ id: c.id, order_index: c.order_index })));
    
    // Update local state immediately for UI responsiveness
    setComponents(newOrder);
    
    // PageSyncService will handle saving to database automatically via debounced save
    PageSyncService.getInstance().updateComponents(newOrder);
  };

  // 8. Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Fetch component variations on mount
  useEffect(() => {
    const fetchComponentVariations = async () => {
      try {
        const variations = await getComponentVariations();
        setComponentVariations(variations);
      } catch (error) {
        console.error('Error fetching component variations:', error);
      }
    };
    
    fetchComponentVariations();
  }, []);

  // Initialize PageSyncService
  useEffect(() => {
    if (pageId) {
      const pageSyncService = PageSyncService.getInstance();
      pageSyncService.initialize(pageId);
      
      // Set up handler to save when user navigates away
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (pageSyncService.isDirty()) {
          // Force save on navigation
          pageSyncService.forceSave();
          
          // Standard behavior to ask user to confirm navigation if unsaved changes
          event.preventDefault();
          event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
          return event.returnValue;
        }
      };
      
      // Add beforeunload event listener
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up when component unmounts
      return () => {
        // Remove event listener
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Force final save when navigating away
        pageSyncService.forceSave().then(() => {
      
        });
      };
    }
  }, [pageId]);

  const loadExistingPage = useCallback(async () => {
    if (!pageId) return;
    
    try {
      // Fetch landing page data with product information
      const { data: page, error: pageError } = await supabase
        .from('landing_pages')
        .select(`
          *,
          products(id, price)
        `)
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;

      // Set product data if available
      if (page.products) {
        setProductData({
          id: page.products.id,
          price: page.products.price
        });
      }

      // Set page-level data
      if (page.global_theme) {
        setGlobalTheme(page.global_theme);
        if (page.global_theme.direction) {
          setDirection(page.global_theme.direction as 'ltr' | 'rtl');
        }
      }

      // Check if we have local cached data first
      const pageSyncService = PageSyncService.getInstance();
      const cachedComponents = pageSyncService.getComponents();
      const cachedTheme = pageSyncService.getGlobalTheme();
      
      if (cachedComponents && cachedComponents.length > 0) {
        // Use local cached data if available
        setComponents(cachedComponents.map(comp => ({
          ...comp,
          custom_actions: comp.custom_actions || {},
        })));
        if (cachedTheme) {
          setGlobalTheme(cachedTheme);
          setDirection(cachedTheme.direction as 'ltr' | 'rtl');
        }
        toast({
          title: "Loaded from local cache",
          description: "Using your most recent changes from this device",
        });
      } else {
        // Otherwise, fetch from the database
        const { data: componentsData, error: componentsError } = await supabase
          .from('landing_page_components')
          .select(`
            *,
            component_variation:component_variations(*)
          `)
          .eq('page_id', pageId)
          .order('order_index');

        if (componentsError) throw componentsError;

        // Load components into the builder
        if (componentsData && componentsData.length > 0) {
          // Log media URLs for debugging
          componentsData.forEach(comp => {
            if (comp.media_urls && Object.keys(comp.media_urls).length > 0) {
              console.log('Component has media URLs:', comp.id, comp.media_urls);
            }
          });
          setComponents(componentsData.map(comp => ({
            ...comp,
            custom_actions: comp.custom_actions || {},
          })));
          toast({
            title: "Loaded from database",
            description: "Latest version from the server",
          });
        }
      }
    } catch (error) {
      console.error('Error loading page:', error);
      toast({
        title: "Error loading page",
        description: "Could not load page data",
        variant: "destructive"
      });
    }
  }, [pageId, toast, setComponents, setGlobalTheme, setDirection, setProductData]);

  // Add useEffect to load existing page data
  useEffect(() => {
    if (pageId && pageId !== 'demo-page-id') {
      loadExistingPage();
    }
  }, [pageId, loadExistingPage]);

  // Add useEffect to sync components to PageSyncService when they change
  useEffect(() => {
    if (pageId && components.length > 0) {
      const pageSyncService = PageSyncService.getInstance();
      // Ensure all components have the custom_styles and custom_actions fields
      const enrichedComponents = components.map(component => {
          return {
            ...component,
          custom_styles: component.custom_styles || {},
          custom_actions: component.custom_actions || {},
          };
      });
      // Log components being synced
      enrichedComponents.forEach(comp => {
        if (comp.custom_styles && Object.keys(comp.custom_styles).length > 0) {
          console.log('Component has custom styles:', comp.id);
        }
        if (comp.custom_actions && Object.keys(comp.custom_actions).length > 0) {
          console.log('Component has custom actions:', comp.id);
        }
      });
      // Update components in PageSyncService
      pageSyncService.updateComponents(enrichedComponents);
    }
  }, [components, pageId]);
  
  // Add useEffect to sync global theme to PageSyncService when it changes
  useEffect(() => {
    if (pageId && globalTheme) {
      const pageSyncService = PageSyncService.getInstance();
      pageSyncService.updateGlobalTheme(globalTheme);
    }
  }, [globalTheme, pageId]);

  // Effect to update last saved time when the page sync service saves
  useEffect(() => {
    if (pageId) {
      const pageSyncService = PageSyncService.getInstance();
      
      // Check for existing saved time
      const savedTime = pageSyncService.getLastSavedTime();
      if (savedTime) {
        setLastSavedTime(new Date(savedTime));
      }
      
      // Create a timer to check for updates to last saved time
      const intervalId = setInterval(() => {
        const currentSavedTime = pageSyncService.getLastSavedTime();
        if (currentSavedTime) {
          const savedDate = new Date(currentSavedTime);
          setLastSavedTime(prevTime => {
            if (!prevTime || savedDate > prevTime) {
              return savedDate;
            }
            return prevTime;
          });
        }
      }, 2000);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [pageId]);

  // Implement local state update logic for handlers:
  const handleComponentUpdate = (componentId: string, updates: Partial<LandingPageComponent>) => {
    const updated = components.map(c => c.id === componentId ? { ...c, ...updates } : c);
    setComponents(updated);
    setSelectedComponent(updated.find(c => c.id === componentId) || null);
    PageSyncService.getInstance().updateComponents(updated);
  };

  const handleStyleChange = (componentId: string, styles: Record<string, unknown>) => {
    const updated = components.map(c => {
      if (c.id !== componentId) return c;
      const existingCustomStyles = c.custom_styles || {};
      const mergedCustomStyles = { ...existingCustomStyles };
      Object.entries(styles).forEach(([elementId, elementStyles]) => {
        if (elementStyles && typeof elementStyles === 'object') {
          mergedCustomStyles[elementId] = {
            ...(mergedCustomStyles[elementId] || {}),
            ...elementStyles
          };
        }
      });
      return { ...c, custom_styles: mergedCustomStyles };
    });
    setComponents(updated);
    setSelectedComponent(updated.find(c => c.id === componentId) || null);
    PageSyncService.getInstance().updateComponents(updated);
  };

  const handleVisibilityChange = (componentId: string, visibility: Record<string, boolean>) => {
    const updated = components.map(comp =>
      comp.id === componentId ? { ...comp, visibility } : comp
    );
    setComponents(updated);
    setSelectedComponent(updated.find(c => c.id === componentId) || null);
    PageSyncService.getInstance().updateComponents(updated);
  };

  const handleVariationChange = (componentId: string, newVariation: number) => {
    // Update variation and sync state
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    let componentType = '';
    if (component.component_variation?.component_type) {
      componentType = component.component_variation.component_type;
    } else if (component.component_variation_id?.includes('-') && component.component_variation_id.split('-')[0].length < 10) {
      componentType = component.component_variation_id.split('-')[0];
    } else {
      const matchingVar = componentVariations.find(v => {
        if (v.id === component.component_variation_id) return true;
        const idParts = component.component_variation_id?.split('-');
        if (idParts && idParts.length === 2) {
          const uuid = idParts[0];
          if (v.id === uuid || v.id.includes(uuid)) {
            return true;
          }
        }
        return false;
      });
      if (matchingVar) {
        componentType = matchingVar.component_type;
      } else {
      return;
    }
    }
    const variationMetadata = componentVariations.find(v => v.component_type === componentType && v.variation_number === newVariation);
    if (!variationMetadata) return;
    const existingComponent = components.find(comp => comp.id === componentId);
    const preservedContainerStyles = existingComponent?.custom_styles?.container
      ? {
          backgroundColor: existingComponent.custom_styles.container.backgroundColor,
          primaryColor: existingComponent.custom_styles.container.primaryColor
        }
      : {};
    // If the variation is not changing, do not update content at all
    if (existingComponent?.component_variation_id === variationMetadata.id) {
      const updates: Partial<LandingPageComponent> = {
        component_variation_id: variationMetadata.id,
        component_variation: variationMetadata,
        custom_styles: { container: preservedContainerStyles },
        media_urls: {},
        visibility: variationMetadata?.visibility_keys ? Object.fromEntries(variationMetadata.visibility_keys.map(vk => [vk.key, true])) : {}
      };
      const updated = components.map(c => c.id === componentId ? { ...c, ...updates } : c);
      setComponents(updated);
      setSelectedComponent(updated.find(c => c.id === componentId) || null);
      return;
    }
    // If switching to a new variation and there is already content, only reset if content is not the default_content for the new variation
    let newContent;
    const isContentDefault = JSON.stringify(existingComponent?.content || {}) === JSON.stringify(variationMetadata?.default_content || {});
    if (existingComponent?.content && Object.keys(existingComponent.content).length > 0 && !isContentDefault) {
      // Keep only specific keys from the previous content
      const keysToKeep = ['price', 'originalPrice', 'badge', 'headline', 'subheadline', 'ctaButton', 'secondaryButton'];
      newContent = {};
      keysToKeep.forEach(key => {
        if (existingComponent.content[key] !== undefined) {
          newContent[key] = existingComponent.content[key];
        }
      });
    } else if (variationMetadata?.default_content) {
      newContent = { ...variationMetadata.default_content };
    } else {
      newContent = {};
    }
    const updates: Partial<LandingPageComponent> = {
      component_variation_id: variationMetadata.id,
      component_variation: variationMetadata,
      content: newContent,
      custom_styles: { container: preservedContainerStyles },
      media_urls: {},
      visibility: variationMetadata?.visibility_keys ? Object.fromEntries(variationMetadata.visibility_keys.map(vk => [vk.key, true])) : {}
    };
    const updated = components.map(c => c.id === componentId ? { ...c, ...updates } : c);
    setComponents(updated);
    setSelectedComponent(updated.find(c => c.id === componentId) || null);
  };

  const handleDirectionToggle = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    
    // Update global theme with new direction
    if (globalTheme) {
      const updatedTheme = {
        ...globalTheme,
        direction: newDirection as 'ltr' | 'rtl'
      };
      setGlobalTheme(updatedTheme);
    }
    
    // Note: We don't apply direction to document.body or documentElement
    // to keep the builder interface (sidebars) unchanged
  };
  
  const handleForceSave = async () => {
    if (!pageId || pageId === 'demo-page-id') {
      toast({
        title: "Cannot save demo page",
        description: "Create a new project to save your changes",
        variant: "destructive"
      });
      return;
    }
    
  
 
    
    // Optionally show a toast or spinner if needed
    try {
      const pageSyncService = PageSyncService.getInstance();
      await pageSyncService.forceSave();
      
      // Verify components in PageSyncService after save
      // ...existing code...
      
      toast({
        title: "Changes saved",
        description: "All changes have been saved to the database"
      });
      
      // ...existing code...
      setLastSavedTime(new Date());
    } catch (error) {
      console.error('Failed to save changes:', error);
      
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Optionally hide spinner if needed
    }
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarOpen(!isLeftSidebarOpen);
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  /**
   * Handle custom style changes for a component's element
   */
  const handleCustomStylesChange = (componentId: string, elementId: string, styles: Record<string, unknown>) => {
    // ...existing code...
    
    // Get the component to update
    const component = components.find(c => c.id === componentId);
    if (!component) {
      console.error(`Component not found for ID: ${componentId}`);
      return;
    }
    
    // Check if this is a temporary component
    const isTemporary = componentId.startsWith('comp-');
    // ...existing code...
    
    // Create a clean styles object with only primitive values or simple objects
    const cleanStyles = {};
    Object.entries(styles).forEach(([key, value]) => {
      // Skip undefined, functions, or complex objects
      if (value === undefined || typeof value === 'function') return;
      
      // For simple values, store directly
      cleanStyles[key] = value;
    });
    
    // Create or update custom_styles for the component
    const updatedCustomStyles = {
      ...(component.custom_styles || {}),
      [elementId]: {
        ...(component.custom_styles?.[elementId] || {}),
        ...cleanStyles
      }
    };
    
    // ...existing code...
    
    // Update in state
    const updated = components.map(c => c.id === componentId ? { ...c, custom_styles: updatedCustomStyles } : c);
    setComponents(updated);
    if (pageId && pageId !== 'demo-page-id' && !isTemporary) {
      const pageSyncService = PageSyncService.getInstance();
      pageSyncService.updateComponentCustomStyles(componentId, updatedCustomStyles, true)
        .then(() => {
          setLastSavedTime(new Date());
        })
        .catch(err => {
          toast({
            title: 'Style Save Error',
            description: 'There was a problem saving your style changes.',
            variant: 'destructive'
          });
        });
    }
  };

  // Add stubs for missing handlers:
  const handlePreview = () => {
    setIsPreviewMode(true);
  };
  const handleDeploy = () => {
    // Deployment logic placeholder
    console.warn('Deploy called');
  };

  if (isPreviewMode) {
    return (
      <PreviewMode 
        components={components}
        onExitPreview={() => setIsPreviewMode(false)}
        direction={direction}
        globalTheme={globalTheme}
        productData={productData}
      />
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Left Sidebar - Component Library - Collapsible */}
      <div className={`bg-white border-r border-gray-200 flex-shrink-0 h-full flex flex-col sticky top-0 transition-all duration-300 ${
        isLeftSidebarOpen ? 'w-80' : 'w-0'
      }`}>
        <div className={`${isLeftSidebarOpen ? 'block' : 'hidden'} w-80`}>
          <ComponentLibrary onAddComponent={handleAddComponent} />
        </div>
      </div>

      {/* Left Sidebar Toggle Button */}
      {!isLeftSidebarOpen && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleLeftSidebar}
            className="rounded-l-none rounded-r-lg bg-white border-l-0 shadow-md hover:bg-gray-50"
            title="Open Component Library (Ctrl+B)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Canvas Area - Scrollable */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top Toolbar - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Left Sidebar Toggle */}
            {isLeftSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLeftSidebar}
                className="h-8 w-8"
                title="Close Component Library (Ctrl+B)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            <h1 className="text-lg font-semibold text-gray-900">Landing Page Builder</h1>
            <DirectionToggle 
              currentDirection={direction} 
              onToggle={handleDirectionToggle} 
            />
            <ResponsivePreviewToggle
              currentViewport={currentViewport}
              onViewportChange={setCurrentViewport}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Enhanced Undo/Redo Status */}
            <div className="border-r border-gray-200 pr-3">
              <UndoRedoStatus
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
              />
            </div>
            
            <Button
              variant="outline"
              onClick={handlePreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
              onClick={handleForceSave}
              variant="outline"
              className="flex items-center gap-2"
            >
                <CloudUpload className="h-4 w-4" />
                Save
              </Button>
              
              <Button
                onClick={handleDeploy}
                disabled={false}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Deploy
              </Button>
              
              {lastSavedTime && (
                <div className="text-xs text-gray-500">
                  Last saved: {lastSavedTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Right Sidebar Toggle */}
            {isRightSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRightSidebar}
                className="h-8 w-8"
                title="Close Visual Editor (Ctrl+J)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Area with Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area - Scrollable */}
          <div className="flex-1 overflow-y-auto relative">
            {/* Direction Indicator */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
              Components: {direction.toUpperCase()}
            </div>

            {/* Viewport Size Indicator */}
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
              {currentViewport === 'mobile' && '📱 Mobile (375px)'}
              {currentViewport === 'tablet' && '📋 Tablet (768px)'}
              {currentViewport === 'desktop' && '🖥️ Desktop (1440px)'}
            </div>
            
            {/* Canvas Content with Direction and Responsive Preview */}
            <div className="min-h-full flex items-center justify-center bg-gray-50">
              <div 
                className={`bg-white shadow-lg transition-all duration-300 ${
                  currentViewport === 'desktop' 
                    ? 'w-full min-h-full shadow-none' 
                    : 'my-8 rounded-lg overflow-hidden'
                }`}
                style={{
                  width: currentViewport === 'desktop' ? '100%' : 
                         currentViewport === 'tablet' ? '768px' : '375px',
                  maxWidth: currentViewport === 'desktop' ? '100%' : 
                            currentViewport === 'tablet' ? '768px' : '375px'
                }}
              >
                <DragDropCanvas
                  components={components}
                  selectedComponent={selectedComponent}
                  selectedElementId={selectedElementId}
                  onSelectComponent={setSelectedComponent}
                  onSelectElement={setSelectedElementId}
                  onReorderComponents={handleReorderComponents}
                  onUpdateComponent={handleComponentUpdate}
                  onRemoveComponent={handleRemoveComponent}
                  direction={direction}
                  viewport={currentViewport}
                  isEditing={true}
                  globalTheme={globalTheme}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Visual Editor - Collapsible */}
          <div className={`bg-white border-l border-gray-200 flex-shrink-0 h-full flex flex-col sticky top-0 transition-all duration-300 ${
            isRightSidebarOpen ? 'w-80' : 'w-0'
          }`}>
            <div className={`${isRightSidebarOpen ? 'block' : 'hidden'} w-80 flex-1 overflow-hidden`}>
              <VisualEditor
                selectedComponent={selectedComponent}
                selectedElementId={selectedElementId}
                onUpdateComponent={handleComponentUpdate}
                onUpdateStyles={handleStyleChange}
                onUpdateVisibility={handleVisibilityChange}
                onChangeVariation={handleVariationChange}
                componentVariations={componentVariations}
                language={undefined}
                allSections={components}
                globalTheme={globalTheme}
                productData={productData}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar Toggle Button */}
        {!isRightSidebarOpen && (
          <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRightSidebar}
              className="rounded-r-none rounded-l-lg bg-white border-r-0 shadow-md hover:bg-gray-50"
              title="Open Visual Editor (Ctrl+J)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
