import React, { useState, useCallback, useEffect } from 'react';
import { LandingPageComponent, CustomizableStyles, ComponentVariation } from '@/types/components';
import { ThemeConfig } from '@/types/landing-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Shuffle, Palette, Type, Layout, ChevronRight } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { VisibilityControls } from './VisibilityControls';

// Import refactored components
import { VariationSelector } from './visual-editor/VariationSelector';
import { BackgroundControls } from './visual-editor/BackgroundControls';
import { ButtonActionConfig } from './visual-editor/ButtonActionConfig';
import { ElementStylePanel } from './visual-editor/ElementStylePanel';
import { 
  createStyleValueGetter, 
  getElementDisplayName, 
  getElementContentField, 
  getVariationNumber, 
  getComponentType,
  getDisplayStyleValue,
  getNumericStyleValue
} from './visual-editor/styleHelpers';

interface VisualEditorProps {
  selectedComponent: LandingPageComponent | null;
  selectedElementId?: string | null;
  onUpdateComponent: (componentId: string, updates: Partial<LandingPageComponent>) => void;
  onUpdateStyles: (componentId: string, styles: Record<string, CustomizableStyles>) => void;
  onUpdateVisibility: (componentId: string, visibility: Record<string, boolean>) => void;
  onChangeVariation?: (componentId: string, newVariation: number) => void;
  componentVariations?: ComponentVariation[];
  language?: 'en' | 'fr' | 'ar';
  allSections: LandingPageComponent[];
  onSave?: () => Promise<void>;
  globalTheme?: ThemeConfig | null;
  productData?: { id: string; price: number } | null;
  onToggleSidebar?: () => void;
  showToggle?: boolean;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  selectedComponent,
  selectedElementId,
  onUpdateComponent,
  onUpdateStyles,
  onUpdateVisibility,
  onChangeVariation,
  componentVariations = [],
  language = 'en',
  allSections,
  onSave,
  globalTheme,
  productData,
  onToggleSidebar,
  showToggle = false
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('styles');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Button action states
  const [buttonActionType, setButtonActionType] = useState('open_link');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonNewTab, setButtonNewTab] = useState(false);
  const [buttonTargetId, setButtonTargetId] = useState('');

  // Create style value getter
  const getStyleValue = createStyleValueGetter(selectedComponent, selectedElementId, componentVariations);

  // Auto-select styles tab when component or element changes
  useEffect(() => {
    setActiveTab('styles');
  }, [selectedComponent?.id, selectedElementId]);

  // Initialize button action state when selecting button elements
  // Use ref to track previous values and avoid circular dependencies
  const prevSelectedElementId = React.useRef<string | null>(null);
  const prevCustomActions = React.useRef<Record<string, any> | undefined>(undefined);
  
  useEffect(() => {
    // Only run when selected element or custom actions actually change
    const customActions = selectedComponent?.custom_actions;
    const hasCustomActionsChanged = JSON.stringify(customActions) !== JSON.stringify(prevCustomActions.current);
    
    if ((selectedElementId !== prevSelectedElementId.current || hasCustomActionsChanged) && 
        (selectedElementId === 'cta-button' || selectedElementId === 'secondary-button')) {
      
      const action = customActions?.[selectedElementId] || { type: 'open_link' };
      
      // Update state only if values have actually changed
      setButtonActionType(action.type || 'open_link');
      setButtonUrl(action.url || '');
      setButtonNewTab(!!action.newTab);
      setButtonTargetId(action.targetId || '');
      
      // Update refs
      prevSelectedElementId.current = selectedElementId;
      prevCustomActions.current = customActions;
    }
  }, [selectedElementId, selectedComponent?.id, selectedComponent?.custom_actions]);

  // Handlers
  const handleVariationChange = useCallback((newVariation: number) => {
    if (!selectedComponent || !onChangeVariation) return;
    
    let componentType = '';
    
    if (selectedComponent.component_variation?.component_type) {
      componentType = selectedComponent.component_variation.component_type;
    } else {
      const matchingVariation = componentVariations.find(v => 
        v.id === selectedComponent.component_variation_id
      );
      
      if (matchingVariation) {
        componentType = matchingVariation.component_type;
      }
    }
    
    const variationMetadata = componentVariations.find(v => 
      v.component_type === componentType && v.variation_number === newVariation
    );

    if (!variationMetadata) {
   
      return;
    }

  
        
    onChangeVariation(selectedComponent.id, newVariation);
  }, [selectedComponent, onChangeVariation, componentVariations]);

  const handleContentChange = useCallback((field: string, value: unknown) => {
    if (!selectedComponent) return;
    
    const updatedContent = {
      ...selectedComponent.content,
      [field]: value
    };
    
    onUpdateComponent(selectedComponent.id, { content: updatedContent });
  }, [selectedComponent, onUpdateComponent]);

  const handleStyleChange = useCallback((styleProperty: string, value: unknown) => {
    if (!selectedComponent) return;
    
    const targetElementKey = selectedElementId || 'container';
    
    const elementStyleChange = {
      [targetElementKey]: {
        [styleProperty]: value
      }
    };
    
   
    
    onUpdateStyles(selectedComponent.id, elementStyleChange);
  }, [selectedComponent, selectedElementId, onUpdateStyles]);

  const handleGradientChange = useCallback((gradientValue: string) => {
    if (!selectedComponent) return;
    
    const targetElementKey = selectedElementId || 'container';
    
    const elementStyleChange = {
      [targetElementKey]: {
        backgroundColor: gradientValue,
        background: ''
      }
    };
    
    
    
    
    onUpdateStyles(selectedComponent.id, elementStyleChange);
  }, [selectedComponent, selectedElementId, onUpdateStyles]);

  const handleVisibilityChange = useCallback((elementKey: string, isVisible: boolean) => {
    if (!selectedComponent) return;
    
    const updatedVisibility = {
      ...selectedComponent.visibility,
      [elementKey]: isVisible
    };
    
    onUpdateVisibility(selectedComponent.id, updatedVisibility);
  }, [selectedComponent, onUpdateVisibility]);

  const handleBulkVisibilityChange = useCallback((visibilityChanges: Record<string, boolean>) => {
    if (!selectedComponent) return;
    
    const updatedVisibility = {
      ...selectedComponent.visibility,
      ...visibilityChanges
    };
    
    onUpdateVisibility(selectedComponent.id, updatedVisibility);
  }, [selectedComponent, onUpdateVisibility]);

  // Early return if no component selected
  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-white to-brand-cotton-candy-pink/5 font-poppins">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-medium-violet/20 to-brand-deep-indigo/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-10 h-10 text-brand-medium-violet/60" />
          </div>
          <h3 className="text-lg font-semibold text-brand-deep-indigo mb-2">Select a Component</h3>
          <p className="text-brand-deep-indigo/60 max-w-sm">
            Click on any component in your canvas to start customizing its appearance and properties.
          </p>
        </div>
      </div>
    );
  }

  
  // Check element types
  const isEditingContainer = selectedElementId === 'container' || selectedElementId === null;
  const contentField = getElementContentField(selectedElementId);
  const elementDisplayName = getElementDisplayName(selectedElementId);
  const currentVariation = selectedComponent.component_variation;
  
  // Check if selected element is a text element
  const textElements = ['headline', 'subheadline', 'badge', 'cta-button', 'secondary-button', 'price', 'price-label'];
  const isTextElement = selectedElementId ? textElements.includes(selectedElementId) : false;
  
  // Check if selected element is a button
  const isButtonElement = selectedElementId === 'cta-button' || selectedElementId === 'secondary-button';

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-brand-cotton-candy-pink/5 font-poppins">
      {/* Header */}
      <div className="flex-none p-5 border-b border-brand-lavender-gray/20 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Right Sidebar Toggle Button */}
          {showToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8 hover:bg-brand-cotton-candy-pink/20 text-brand-medium-violet"
              title="Close Visual Editor (Ctrl+J)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-medium-violet to-brand-deep-indigo rounded-lg flex items-center justify-center">
              {selectedElementId ? (
                <EyeOff className="h-4 w-4 text-white" />
              ) : (
                <Eye className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <span className="text-base font-semibold text-brand-deep-indigo">
                {elementDisplayName}
              </span>
              <p className="text-sm text-brand-deep-indigo/60">
                Customize your component
              </p>
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="p-4 border-b border-brand-lavender-gray/10 bg-white/50 backdrop-blur-sm">
            <TabsList className="grid w-full grid-cols-2 bg-brand-lavender-gray/10 p-1 rounded-xl">
              <TabsTrigger 
                value="styles" 
                className="data-[state=active]:bg-white data-[state=active]:text-brand-deep-indigo data-[state=active]:shadow-md text-brand-deep-indigo/70 font-medium rounded-lg transition-all duration-200"
              >
                <Palette className="w-4 h-4 mr-2" />
                Styles
              </TabsTrigger>
              <TabsTrigger 
                value="visibility" 
                className="data-[state=active]:bg-white data-[state=active]:text-brand-deep-indigo data-[state=active]:shadow-md text-brand-deep-indigo/70 font-medium rounded-lg transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visibility
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-6 mt-0 p-5">
            {/* Variation Selector */}
            {isEditingContainer && (
              <div className="space-y-3">
                <VariationSelector
                  selectedComponent={selectedComponent}
                  componentVariations={componentVariations}
                  onChangeVariation={handleVariationChange}
                />
              </div>
            )}

            {/* Background Controls */}
            <div className="space-y-3">
              <BackgroundControls
                getStyleValue={getStyleValue}
                handleStyleChange={handleStyleChange}
                handleGradientChange={handleGradientChange}
                isEditingContainer={isEditingContainer}
              />
            </div>

            {/* Button Action Config */}
            {isButtonElement && (
              <div className="space-y-3">
                <ButtonActionConfig
                  selectedComponent={selectedComponent}
                  selectedElementId={selectedElementId}
                  allSections={allSections}
                  actionType={buttonActionType}
                  url={buttonUrl}
                  newTab={buttonNewTab}
                  targetId={buttonTargetId}
                  onActionTypeChange={setButtonActionType}
                  onUrlChange={setButtonUrl}
                  onNewTabChange={setButtonNewTab}
                  onTargetIdChange={setButtonTargetId}
                  onUpdateComponent={onUpdateComponent}
                  productData={productData}
                />
              </div>
            )}

            {/* Element Style Panel */}
            <div className="space-y-3">
              <ElementStylePanel
                getStyleValue={getStyleValue}
                onStyleChange={handleStyleChange}
                isTextElement={isTextElement}
              />
            </div>
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-4 mt-0 p-5">
            <VisibilityControls
              component={selectedComponent}
              componentVariation={currentVariation}
              onToggleVisibility={handleVisibilityChange}
              onBulkToggleVisibility={handleBulkVisibilityChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VisualEditor;