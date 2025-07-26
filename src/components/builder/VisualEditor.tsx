import React, { useState, useCallback, useEffect } from 'react';
import { LandingPageComponent, CustomizableStyles, ComponentVariation } from '@/types/components';
import { ThemeConfig } from '@/types/landing-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Shuffle, Palette, Type, Layout } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { VisibilityControls } from './VisibilityControls';

// Import refactored components
import { VariationSelector } from './visual-editor/VariationSelector';
import { BackgroundControls } from './visual-editor/BackgroundControls';
import { ButtonActionConfig } from './visual-editor/ButtonActionConfig';
import { ElementStylePanel } from './visual-editor/ElementStylePanel';
import { ContentEditPanel } from './visual-editor/ContentEditPanel';
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
  globalTheme
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('styles');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Button action states
  const [buttonActionType, setButtonActionType] = useState('open_link');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonNewTab, setButtonNewTab] = useState(false);
  const [buttonTargetId, setButtonTargetId] = useState('');

  // Background control states
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-r');
  const [gradientFromColor, setGradientFromColor] = useState('#3b82f6');
  const [gradientToColor, setGradientToColor] = useState('#8b5cf6');

  // Create style value getter
  const getStyleValue = createStyleValueGetter(selectedComponent, selectedElementId, componentVariations);

  // Initialize background type based on current values
  useEffect(() => {
    if (!selectedComponent) return;
    const currentBackground = getStyleValue('background', '');
    const currentBackgroundColor = getStyleValue('backgroundColor', '#ffffff');
    const hasGradient = currentBackground?.includes('gradient') || 
                      currentBackgroundColor?.includes('gradient');
    setBackgroundType(hasGradient ? 'gradient' : 'solid');
  }, [selectedComponent, selectedElementId, getStyleValue]);

  // Update gradient when values change
  useEffect(() => {
    if (backgroundType === 'gradient') {
      const getCSSDirection = (tailwindDirection: string): string => {
        const directionMap: Record<string, string> = {
          'to-r': 'to right',
          'to-l': 'to left',
          'to-b': 'to bottom',
          'to-t': 'to top',
          'to-br': 'to bottom right',
          'to-tr': 'to top right',
          'to-bl': 'to bottom left',
          'to-tl': 'to top left'
        };
        return directionMap[tailwindDirection] || 'to right';
      };
      
      const cssDirection = getCSSDirection(gradientDirection);
      const gradientValue = `linear-gradient(${cssDirection}, ${gradientFromColor}, ${gradientToColor})`;
      handleGradientChange(gradientValue);
    }
  }, [gradientDirection, gradientFromColor, gradientToColor, backgroundType]);

  // Auto-select styles tab when component or element changes
  useEffect(() => {
    setActiveTab('styles');
  }, [selectedComponent?.id, selectedElementId]);

  // Initialize button action state when selecting button elements
  useEffect(() => {
    if (selectedElementId === 'cta-button' || selectedElementId === 'secondary-button') {
      const customActions = selectedComponent?.custom_actions || {};
      const action = customActions[selectedElementId] || { type: 'open_link' };
      setButtonActionType(action.type || 'open_link');
      setButtonUrl(action.url || '');
      setButtonNewTab(!!action.newTab);
      setButtonTargetId(action.targetId || '');
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
      console.error('Could not find variation metadata for', { componentType, newVariation });
      return;
    }

    console.log('Changing variation:', {
      componentId: selectedComponent.id,
      componentType,
      fromVariation: selectedComponent.component_variation_id,
      toVariation: variationMetadata.id,
      metadata: variationMetadata
    });
        
    onChangeVariation(selectedComponent.id, newVariation);
  }, [selectedComponent, onChangeVariation, componentVariations]);

  const handleContentChange = useCallback((field: string, value: any) => {
    if (!selectedComponent) return;
    
    const updatedContent = {
      ...selectedComponent.content,
      [field]: value
    };
    
    onUpdateComponent(selectedComponent.id, { content: updatedContent });
  }, [selectedComponent, onUpdateComponent]);

  const handleStyleChange = useCallback((styleProperty: string, value: any) => {
    if (!selectedComponent) return;
    
    const targetElementKey = selectedElementId || 'container';
    
    const elementStyleChange = {
      [targetElementKey]: {
        [styleProperty]: value
      }
    };
    
    console.log('VisualEditor: handleStyleChange - updating custom_styles for', targetElementKey, 'with', styleProperty, '=', value);
    
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
    
    console.log('VisualEditor: handleGradientChange - saving gradient under backgroundColor:', gradientValue);
    
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

  // Save button action configuration
  const handleSaveButtonAction = useCallback(() => {
    if (!selectedComponent || !selectedElementId) return;

    const action = {
      type: buttonActionType,
      url: buttonActionType === 'open_link' ? buttonUrl : undefined,
      newTab: buttonActionType === 'open_link' ? buttonNewTab : undefined,
      targetId: buttonActionType === 'scroll_to' ? buttonTargetId : undefined,
    };

    const updatedCustomActions = {
      ...selectedComponent.custom_actions,
      [selectedElementId]: action
    };

    onUpdateComponent(selectedComponent.id, {
      custom_actions: updatedCustomActions
    });
  }, [selectedComponent, selectedElementId, buttonActionType, buttonUrl, buttonNewTab, buttonTargetId, onUpdateComponent]);

  // Early return if no component selected
  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Eye className="mx-auto h-12 w-12 mb-2 opacity-50" />
        <p>Select a component to edit its properties</p>
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selectedElementId ? (
              <EyeOff className="h-4 w-4 text-blue-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm font-medium">
              Editing: {elementDisplayName}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="styles">Styles</TabsTrigger>
              <TabsTrigger value="visibility">Visibility</TabsTrigger>
            </TabsList>
          </div>

          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-4 mt-0 p-4">
            {/* Variation Selector */}
            {isEditingContainer && (
              <VariationSelector
                selectedComponent={selectedComponent}
                componentVariations={componentVariations}
                onChangeVariation={handleVariationChange}
              />
            )}

            {/* Background Controls */}
            {isEditingContainer && (
              <BackgroundControls
                getStyleValue={getStyleValue}
                handleStyleChange={handleStyleChange}
                handleGradientChange={handleGradientChange}
              />
            )}

            {/* Button Action Config */}
            {isButtonElement && (
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
              />
            )}

            {/* Element Style Panel */}
            <ElementStylePanel
              getStyleValue={getStyleValue}
              onStyleChange={handleStyleChange}
              isTextElement={isTextElement}
            />
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-4 mt-0">
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