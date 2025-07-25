import React from 'react';
import { LandingPageComponent } from '@/types/components';
import { ComponentRenderer } from '@/components/registry/ComponentRenderer';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DragDropCanvasProps {
  components: LandingPageComponent[];
  selectedComponent: LandingPageComponent | null;
  selectedElementId?: string | null;
  onSelectComponent: (component: LandingPageComponent | null) => void;
  onSelectElement?: (elementId: string | null) => void;
  onReorderComponents: (components: LandingPageComponent[]) => void;
  onUpdateComponent: (componentId: string, updates: Partial<LandingPageComponent>) => void;
  onRemoveComponent?: (componentId: string) => void;
  direction?: 'ltr' | 'rtl';
  viewport?: 'mobile' | 'tablet' | 'desktop';
  isEditing?: boolean;
  globalTheme?: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    direction: 'ltr' | 'rtl';
    language: string;
  };
}

export const DragDropCanvas: React.FC<DragDropCanvasProps> = ({
  components,
  selectedComponent,
  selectedElementId,
  onSelectComponent,
  onSelectElement,
  onReorderComponents,
  onUpdateComponent,
  onRemoveComponent,
  direction = 'ltr',
  viewport = 'desktop',
  isEditing = true,
  globalTheme
}) => {
  const [reorderingId, setReorderingId] = React.useState<string | null>(null);

  const handleComponentClick = (component: LandingPageComponent) => {
    onSelectComponent(component);
  };

  const handleStyleChange = (componentId: string, styles: any) => {
    onUpdateComponent(componentId, { styles });
  };

  const handleContentChange = (componentId: string, field: string, value: any) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const updatedContent = {
      ...component.content,
      [field]: value
    };

    onUpdateComponent(componentId, { content: updatedContent });
  };

  const handleMoveUp = (component: LandingPageComponent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent component selection
    setReorderingId(component.id);
    
    const sortedComponents = [...components].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedComponents.findIndex(c => c.id === component.id);
    
    console.log('Move up:', component.id, 'currentIndex:', currentIndex);
    
    if (currentIndex > 0) {
      // Create new array with swapped positions
      const newComponents = [...sortedComponents];
      [newComponents[currentIndex - 1], newComponents[currentIndex]] = 
      [newComponents[currentIndex], newComponents[currentIndex - 1]];
      
      console.log('New order:', newComponents.map(c => c.id));
      onReorderComponents(newComponents);
    }
    
    // Reset reordering state after animation
    setTimeout(() => setReorderingId(null), 300);
  };

  const handleMoveDown = (component: LandingPageComponent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent component selection
    setReorderingId(component.id);
    
    const sortedComponents = [...components].sort((a, b) => a.order_index - b.order_index);
    const currentIndex = sortedComponents.findIndex(c => c.id === component.id);
    
    console.log('Move down:', component.id, 'currentIndex:', currentIndex);
    
    if (currentIndex < sortedComponents.length - 1) {
      // Create new array with swapped positions
      const newComponents = [...sortedComponents];
      [newComponents[currentIndex], newComponents[currentIndex + 1]] = 
      [newComponents[currentIndex + 1], newComponents[currentIndex]];
      
      console.log('New order:', newComponents.map(c => c.id));
      onReorderComponents(newComponents);
    }
    
    // Reset reordering state after animation
    setTimeout(() => setReorderingId(null), 300);
  };

  const handleDeleteComponent = (component: LandingPageComponent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent component selection
    
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this component?')) {
      onRemoveComponent?.(component.id);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="min-h-full" dir={direction}>
        {components.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start Building Your Landing Page
              </h3>
              <p className="text-gray-500">
                Add components from the library to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {components
              .sort((a, b) => a.order_index - b.order_index)
              .map((component, index) => {
                const sortedComponents = [...components].sort((a, b) => a.order_index - b.order_index);
                const isFirst = index === 0;
                const isLast = index === sortedComponents.length - 1;
                
                return (
                  <div
                    key={component.id}
                    id={`section-${component.id}`}
                    data-section-id={component.id}
                    onClick={() => handleComponentClick(component)}
                    className={`relative cursor-pointer transition-all duration-300 group ${
                      selectedComponent?.id === component.id
                        ? 'ring-2 ring-blue-500 ring-inset'
                        : 'hover:ring-1 hover:ring-gray-300 hover:ring-inset'
                    } ${
                      reorderingId === component.id
                        ? 'ring-2 ring-green-500 ring-inset transform scale-[1.02]'
                        : ''
                    }`}
                  >
                    <ComponentRenderer
                      type={(() => {
                        // Get component type safely, handling both legacy and UUID formats
                        if (component.component_variation?.component_type) {
                          return component.component_variation.component_type;
                        }
                        
                        // Try to extract from component_variation_id
                        const parts = component.component_variation_id.split('-');
                        
                        // If it's a UUID format with component type stored separately
                        if (parts.length === 2 && parts[0].length > 6) {
                          return component.component_variation?.component_type || 'hero'; // Fallback
                        }
                        
                        // Legacy format "type-variation"
                        return parts[0] || 'hero';
                      })()}
                      variation={(() => {
                        // Get variation safely, handling both legacy and UUID formats
                        if (component.component_variation?.variation_number) {
                          return component.component_variation.variation_number;
                        }
                        
                        // Try to extract from component_variation_id
                        const parts = component.component_variation_id.split('-');
                        
                        // If it's a UUID format with variation stored as second part
                        if (parts.length === 2) {
                          return parseInt(parts[1]) || 1;
                        }
                        
                        return 1; // Fallback
                      })()}
                      content={component.content}
                      styles={{}} // Empty base styles, use customStyles for actual styling
                      visibility={component.visibility}
                      mediaUrls={component.media_urls} // Pass media_urls to ComponentRenderer
                      viewport={viewport}
                      isEditing={isEditing}
                      selectedElementId={selectedElementId}
                      componentId={component.id}
                      onStyleChange={(elementId, styles) => handleStyleChange(component.id, styles)}
                      onContentChange={(field, value) => handleContentChange(component.id, field, value)}
                      customStyles={component.custom_styles}
                      globalTheme={globalTheme}
                      onElementSelect={(elementId) => {
                        onSelectComponent(component); // Ensure component is selected
                        onSelectElement(elementId); // Then select the element
                      }}
                      customActions={component.custom_actions}
                    />
                    
                    {/* Reordering Controls - Always visible on hover, visible when selected */}
                    <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity z-20 ${
                      selectedComponent?.id === component.id 
                        ? 'opacity-100' 
                        : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {/* Move Up Button */}
                      {!isFirst && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            console.log('Up button clicked for:', component.id);
                            handleMoveUp(component, e);
                          }}
                          className="h-8 w-8 p-0 bg-white/95 hover:bg-white shadow-lg border border-gray-200 z-10"
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Move Down Button */}
                      {!isLast && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            console.log('Down button clicked for:', component.id);
                            handleMoveDown(component, e);
                          }}
                          className="h-8 w-8 p-0 bg-white/95 hover:bg-white shadow-lg border border-gray-200 z-10"
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Delete Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          console.log('Delete button clicked for:', component.id);
                          handleDeleteComponent(component, e);
                        }}
                        className="h-8 w-8 p-0 bg-red-500/95 hover:bg-red-600 shadow-lg border border-red-300 z-10"
                        title="Delete component"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedComponent?.id === component.id && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
