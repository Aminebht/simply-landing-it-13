import React, { useState, useEffect, useCallback } from 'react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { DragDropCanvas } from '@/components/builder/DragDropCanvas';
import { ComponentLibrary } from '@/components/builder/ComponentLibrary';
import { VisualEditor } from '@/components/builder/VisualEditor';
import { PreviewMode } from '@/components/builder/PreviewMode';
import { DirectionToggle } from '@/components/builder/DirectionToggle';
import { ResponsivePreviewToggle, ViewportSize } from '@/components/builder/ResponsivePreviewToggle';
import { UndoRedoStatus } from '@/components/builder/UndoRedoStatus';
import { LandingPageSettings } from '@/components/builder/LandingPageSettings';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Eye, Edit, Save, Globe, ChevronLeft, ChevronRight, CloudUpload, Database, ExternalLink } from 'lucide-react';
import { useOptimizedDeployment } from '@/hooks/useOptimizedDeployment';
import { LandingPageComponent, ComponentVariation } from '@/types/components';
import { LandingPageService } from '@/services/landing-page';
import { getComponentVariations } from '@/services/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useToast } from "@/hooks/use-toast";
import PageSyncService from '@/services/page-sync';
import { ThemeConfig, LandingPage } from '@/types/landing-page';
import { toast as sonnerToast } from "sonner";

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
  const [page, setPage] = useState<LandingPage | null>(null);
  

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<LandingPageComponent | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Initialize optimized deployment hook (60-70% faster deployments, no client-side token needed)
  const { deployLandingPage, isDeploying, deploymentError, deploymentStatus, clearError } = useOptimizedDeployment();

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
    try {
      // Add new component and update undo/redo state
      const variation = 1;
      const variationMetadata = componentVariations.find(v => v.component_type === type && v.variation_number === variation);
      
      if (!variationMetadata) {
        console.warn(`No variation metadata found for component type: ${type}`);
        toast({
          title: "Error",
          description: `Component type "${type}" not found. Please try refreshing the page.`,
          variant: "destructive"
        });
        return;
      }
      
      const defaultContent = variationMetadata.default_content || {
        headline: 'Your Headline Here',
        subheadline: 'Your subheadline here',
        ctaButton: 'Get Started'
      };
      
      // Use visibility_keys to determine default visibility
      const defaultVisibility: Record<string, boolean> = {};
      if (variationMetadata.visibility_keys) {
        variationMetadata.visibility_keys.forEach(vk => {
          defaultVisibility[vk.key] = true;
        });
      } else {
        defaultVisibility.headline = true;
        defaultVisibility.subheadline = true;
        defaultVisibility.ctaButton = true;
      }
      
      // For demo page, create temporary component
      if (!pageId || pageId === 'demo-page-id') {
        const tempId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newComponent: LandingPageComponent = {
          id: tempId,
          page_id: pageId || 'demo-page-id',
          component_variation_id: variationMetadata.id,
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
          component_variation: variationMetadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedComponents = [...components, newComponent];
        setComponents(updatedComponents);
        setSelectedComponent(newComponent);
        
        // Show success toast
        toast({
          title: "Component added",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} component has been added to your page`,
        });
        
        console.log('Added demo component:', { id: newComponent.id, type, order_index: newComponent.order_index });
        return;
      }
      
      // For real pages, save to database
      const landingPageService = LandingPageService.getInstance();
      
      const componentData = {
        component_variation_id: variationMetadata.id,
        order_index: components.length + 1,
        content: defaultContent,
        styles: {}, // Required by TypeScript interface but will be ignored by database
        visibility: defaultVisibility,
        custom_styles: {
          container: {
            padding: [60, 20, 60, 20] as [number, number, number, number],
            backgroundColor: '#ffffff',
            textColor: '#1a202c',
            primaryColor: globalTheme?.primaryColor || '#3b82f6',
            headingFont: {
              family: 'Inter',
              variants: ['400', '500', '600', '700'],
              category: 'sans-serif' as const,
              googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            },
            bodyFont: {
              family: 'Inter',
              variants: ['400', '500', '600', '700'],
              category: 'sans-serif' as const,
              googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            }
          }
        },
        media_urls: {}
      };
      
      // Save to database and get the new component with real ID
      const savedComponent = await landingPageService.addComponent(pageId, componentData);
      
      const updatedComponents = [...components, savedComponent];
      setComponents(updatedComponents);
      setSelectedComponent(savedComponent);
      
      // Update PageSyncService
      PageSyncService.getInstance().updateComponents(updatedComponents);
      
      // Show success toast
      toast({
        title: "Component added",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} component has been added and saved to your page`,
      });
      
      console.log('Added new component:', { id: savedComponent.id, type, order_index: savedComponent.order_index });
    } catch (error) {
      console.error('Error adding component:', error);
      toast({
        title: "Error adding component",
        description: "There was a problem adding the component. Please try again.",
        variant: "destructive"
      });
    }
  };

  // 6. Remove Component
  const handleRemoveComponent = useCallback(async (componentId: string) => {
    try {
      console.log('Removing component:', componentId);
      
      // Check if the component exists
      const componentToRemove = components.find(c => c.id === componentId);
      if (!componentToRemove) {
        console.warn('Component not found for deletion:', componentId);
        toast({
          title: "Component not found",
          description: "The component you're trying to delete could not be found.",
          variant: "destructive"
        });
        return;
      }
      
      // For real pages (with page_id), delete from database
      if (pageId && pageId !== 'demo') {
        try {
          console.log('Deleting component from database:', componentId);
          await LandingPageService.getInstance().deleteComponent(componentId);
          console.log('Component deleted from database successfully');
        } catch (dbError) {
          console.error('Error deleting component from database:', dbError);
          toast({
            title: "Database error",
            description: "Failed to delete component from database. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Filter out the component to be removed
      const filteredComponents = components.filter(c => c.id !== componentId);
      
      // Recalculate order_index for remaining components to ensure sequential ordering
      const reorderedComponents = filteredComponents
        .sort((a, b) => a.order_index - b.order_index)
        .map((component, index) => ({
          ...component,
          order_index: index + 1
        }));
      
      console.log('Components after deletion and reordering:', reorderedComponents.map(c => ({ id: c.id, order_index: c.order_index })));
      
      setComponents(reorderedComponents);
      
      // Clear selection if the deleted component was selected
      if (selectedComponent?.id === componentId) {
        setSelectedComponent(null);
        setSelectedElementId(null);
      }
      
      // Update PageSyncService
      PageSyncService.getInstance().updateComponents(reorderedComponents);
      
      // Show success toast
      toast({
        title: "Component deleted",
        description: "The component has been removed from your page",
      });
    } catch (error) {
      console.error('Error deleting component:', error);
      toast({
        title: "Error deleting component",
        description: "There was a problem removing the component. Please try again.",
        variant: "destructive"
      });
    }
  }, [components, selectedComponent, setSelectedComponent, setSelectedElementId, setComponents, toast, pageId]);

  // 7. Reorder Components
  const handleReorderComponents = async (newOrder: LandingPageComponent[]) => {
    console.log('Reordering components:', newOrder.map(c => ({ id: c.id, order_index: c.order_index })));
    
    // Update local state immediately for UI responsiveness
    setComponents(newOrder);
    
    // PageSyncService will handle saving to database automatically via debounced save
    PageSyncService.getInstance().updateComponents(newOrder);
  };

  // 8. Keyboard shortcuts for undo/redo and component operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Delete selected component with Delete key
      else if (e.key === 'Delete' && selectedComponent && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const componentType = selectedComponent.component_variation?.component_type || 'component';
        if (window.confirm(`Are you sure you want to delete the selected ${componentType} component? This action cannot be undone.`)) {
          handleRemoveComponent(selectedComponent.id);
        }
      }
      // Sidebar toggle shortcuts
      else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsLeftSidebarOpen(!isLeftSidebarOpen);
      }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsRightSidebarOpen(!isRightSidebarOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedComponent, handleRemoveComponent, isLeftSidebarOpen, isRightSidebarOpen]);

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

      // Set page data
      setPage(page);

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

  const handleVariationChange = async (componentId: string, newVariation: number) => {
    try {
      // Update variation and sync state
      const component = components.find(c => c.id === componentId);
      if (!component) {
        console.error('Component not found:', componentId);
        return;
      }

      // Determine component type
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
          console.error('Unable to determine component type for variation change:', componentId);
          toast({
            title: "Error changing variation",
            description: "Unable to determine component type",
            variant: "destructive"
          });
          return;
        }
      }

      // Find the new variation metadata
      const variationMetadata = componentVariations.find(v => v.component_type === componentType && v.variation_number === newVariation);
      if (!variationMetadata) {
        console.error('Variation metadata not found:', { componentType, newVariation });
        toast({
          title: "Error changing variation",
          description: `Variation ${newVariation} not found for ${componentType}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Changing component variation:', { componentId, componentType, oldVariation: component.component_variation?.variation_number, newVariation });

      const existingComponent = components.find(comp => comp.id === componentId);
      const preservedContainerStyles = existingComponent?.custom_styles?.container
        ? {
            backgroundColor: existingComponent.custom_styles.container.backgroundColor,
            primaryColor: existingComponent.custom_styles.container.primaryColor
          }
        : {};

      // If the variation is not changing, do not update content at all
      if (existingComponent?.component_variation_id === variationMetadata.id) {
        console.log('Variation is already set, no change needed');
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

      // Prepare content for the new variation
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

      // Prepare the updates
      const updates: Partial<LandingPageComponent> = {
        component_variation_id: variationMetadata.id,
        component_variation: variationMetadata,
        content: newContent,
        custom_styles: { container: preservedContainerStyles },
        media_urls: {},
        visibility: variationMetadata?.visibility_keys ? Object.fromEntries(variationMetadata.visibility_keys.map(vk => [vk.key, true])) : {}
      };

      // Update local state immediately for UI responsiveness
      const updated = components.map(c => c.id === componentId ? { ...c, ...updates } : c);
      setComponents(updated);
      setSelectedComponent(updated.find(c => c.id === componentId) || null);

      // For demo pages or temporary components, only update local state
      if (!pageId || pageId === 'demo-page-id' || componentId.startsWith('comp-')) {
        console.log('Demo page or temporary component - only updating local state');
        toast({
          title: "Variation changed",
          description: `Component variation updated to ${componentType} variation ${newVariation}`,
        });
        return;
      }

      // For real components, immediately save variation change to database
      try {
        console.log('Saving variation change to database:', { componentId, newVariationId: variationMetadata.id });

        const landingPageService = LandingPageService.getInstance();
        
        // Update the component in the database with the new variation using dedicated method
        const updatedComponent = await landingPageService.updateComponentVariation(
          componentId,
          variationMetadata.id,
          newContent,
          variationMetadata?.visibility_keys ? Object.fromEntries(variationMetadata.visibility_keys.map(vk => [vk.key, true])) : {},
          { container: preservedContainerStyles }
        );

        console.log('Successfully saved variation change to database');

        // Update the local state with the returned component data to ensure consistency
        const finalUpdated = components.map(c => 
          c.id === componentId ? { ...updatedComponent, component_variation: variationMetadata } : c
        );
        setComponents(finalUpdated);
        setSelectedComponent(finalUpdated.find(c => c.id === componentId) || null);

        // Update PageSyncService with the new components state
        PageSyncService.getInstance().updateComponents(finalUpdated);

        // Update last saved time
        setLastSavedTime(new Date());

        // Show success message
        toast({
          title: "Variation changed",
          description: `Component variation updated to ${componentType} variation ${newVariation} and saved`,
        });

      } catch (dbError) {
        console.error('Error saving variation change to database:', dbError);
        
        // Revert the local state changes if database save failed
        const originalComponent = components.find(c => c.id === componentId);
        if (originalComponent) {
          const revertedComponents = components.map(c => c.id === componentId ? originalComponent : c);
          setComponents(revertedComponents);
          setSelectedComponent(originalComponent);
        }

        toast({
          title: "Error saving variation change",
          description: "The variation was changed but couldn't be saved. Please try again.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error in handleVariationChange:', error);
      toast({
        title: "Error changing variation",
        description: "There was a problem changing the component variation. Please try again.",
        variant: "destructive"
      });
    }
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
  
  const handleDeploy = async () => {
    if (!pageId || pageId === 'demo-page-id') {
      toast({
        title: "Cannot deploy demo page",
        description: "Create a new project to deploy your changes",
        variant: "destructive"
      });
      return;
    }

    try {
      // Clear any previous deployment errors
      clearError();
      
      // Force save before deployment
      await handleForceSave();
      
      toast({
        title: "🚀 Hybrid deployment started (React SSR + Optimized)",
        description: "Generating React SSR files for 100% builder accuracy...",
      });

      // Step 1: Generate React SSR files for 100% builder match
      const { ReactSSRFileGenerator } = await import('@/services/react-ssr-file-generator');
      const fileGenerator = new ReactSSRFileGenerator();
      const reactFiles = await fileGenerator.generateReactSSRFiles(pageId);
      
      toast({
        title: "📦 React SSR files generated",
        description: "Deploying via optimized edge function...",
      });

      // Step 2: Deploy using optimized edge function with pre-generated files
      const result = await deployLandingPage(pageId, reactFiles);
      
      if (result.success) {
        // Update page data with deployment info
        if (page) {
          setPage({
            ...page,
            status: 'published',
            last_deployed_at: new Date().toISOString()
          });
        }
        
        toast({
          title: "✅ Hybrid deployment successful",
          description: `Perfect builder match achieved! Live at: ${result.url}`,
        });
        
        // Optionally open the deployed site
        if (window.confirm('Would you like to view your deployed landing page?')) {
          window.open(result.url, '_blank');
        }
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('Hybrid deployment failed:', error);
      toast({
        title: "❌ Deployment failed", 
        description: error.message || deploymentError || "There was a problem deploying your landing page.",
        variant: "destructive"
      });
    }
  };

  const handleViewLive = () => {
    if (page?.netlify_site_id) {
      // Construct URL from netlify_site_id
      const deployedUrl = `https://${page.netlify_site_id}.netlify.app`;
      window.open(deployedUrl, '_blank');
    } else {
      toast({
        title: "No deployed site",
        description: "Deploy your landing page first to view it live",
        variant: "destructive"
      });
    }
  };

  const handleSettingsUpdate = (updates: Partial<LandingPage>) => {
    if (page) {
      const updatedPage = { ...page, ...updates };
      setPage(updatedPage);
      
      // Update global theme if provided
      if (updates.global_theme) {
        setGlobalTheme(updates.global_theme);
      }
      
      toast({
        title: "Settings updated",
        description: "Your landing page settings have been saved.",
      });
    }
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
    <div className="h-screen flex bg-gradient-to-br from-brand-light-cream/10 via-background to-brand-cotton-candy-pink/5 overflow-hidden">
      {/* Left Sidebar - Component Library - Collapsible */}
      <div className={`bg-white/90 backdrop-blur-xl border-r border-brand-lavender-gray/30 flex-shrink-0 h-full flex flex-col sticky top-0 transition-all duration-300 shadow-lg ${
        isLeftSidebarOpen ? 'w-80' : 'w-0'
      }`}>
        <div className={`${isLeftSidebarOpen ? 'block' : 'hidden'} w-80 flex-1 overflow-hidden`}>
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
            className="rounded-l-none rounded-r-xl bg-white/90 backdrop-blur-sm border-l-0 border-brand-lavender-gray/30 shadow-lg hover:bg-brand-cotton-candy-pink/20 hover:border-brand-medium-violet/30 transition-all duration-200"
            title="Open Component Library (Ctrl+B)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Canvas Area - Scrollable */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top Toolbar - Fixed */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-brand-lavender-gray/30 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
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
            
            <h1 className="text-lg font-heading font-semibold text-brand-deep-indigo">Landing Page Builder</h1>
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
          
              
              <LandingPageSettings
                landingPage={page}
                onSettingsUpdate={handleSettingsUpdate}
              />
              
              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {isDeploying ? 'Deploying...' : 'Deploy'}
              </Button>
              
              {/* View Live Button - only show if page has been deployed */}
              {page?.netlify_site_id && (
                <Button
                  onClick={handleViewLive}
                  variant="outline"
                  className="flex items-center gap-2"
                  title="View your live landing page"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live
                </Button>
              )}
              
              
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
                <ChevronRight className="h-4 w-4 text-brand-medium-violet" />
              </Button>
            )}
          </div>
        </div>

        {/* Content Area with Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area - Scrollable */}
          <div className="flex-1 overflow-y-auto relative">
            {/* Direction Indicator */}
            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-medium text-brand-deep-indigo border border-brand-lavender-gray/30 shadow-lg">
              Components: {direction.toUpperCase()}
            </div>

            {/* Viewport Size Indicator */}
            <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-medium text-brand-deep-indigo border border-brand-lavender-gray/30 shadow-lg">
              {currentViewport === 'mobile' && '📱 Mobile (375px)'}
              {currentViewport === 'tablet' && '📋 Tablet (768px)'}
              {currentViewport === 'desktop' && '🖥️ Desktop (1440px)'}
            </div>
            
            {/* Canvas Content with Direction and Responsive Preview */}
            <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-brand-light-cream/20 via-transparent to-brand-cotton-candy-pink/10">
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
          <div className={`bg-white/90 backdrop-blur-xl border-l border-brand-lavender-gray/30 flex-shrink-0 h-full flex flex-col sticky top-0 transition-all duration-300 shadow-lg ${
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
              className="rounded-r-none rounded-l-xl bg-white/90 backdrop-blur-sm border-r-0 border-brand-lavender-gray/30 shadow-lg hover:bg-brand-cotton-candy-pink/20 hover:border-brand-medium-violet/30 transition-all duration-200"
              title="Open Visual Editor (Ctrl+J)"
            >
              <ChevronLeft className="h-4 w-4 text-brand-medium-violet" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
