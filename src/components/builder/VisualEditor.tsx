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
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Variation ({getVariationNumber(selectedComponent)})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {componentVariations
                      .filter(v => v.component_type === getComponentType(selectedComponent, componentVariations) && v.is_active)
                      .sort((a, b) => a.variation_number - b.variation_number)
                      .map((variation) => (
                        <Button
                          key={variation.id}
                          variant={
                            variation.variation_number.toString() === getVariationNumber(selectedComponent)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleVariationChange(variation.variation_number)}
                          className="h-8"
                        >
                          {variation.variation_number}
                        </Button>
                      ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {componentVariations.find(v => v.variation_number.toString() === getVariationNumber(selectedComponent))?.description || 
                     `${getComponentType(selectedComponent, componentVariations)} variation ${getVariationNumber(selectedComponent)}`}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Background Controls */}
            {isEditingContainer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant={backgroundType === 'solid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBackgroundType('solid')}
                      className="flex-1"
                    >
                      Solid
                    </Button>
                    <Button
                      variant={backgroundType === 'gradient' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBackgroundType('gradient')}
                      className="flex-1"
                    >
                      Gradient
                    </Button>
                  </div>

                  {backgroundType === 'solid' && (
                    <ColorPicker
                      label="Background Color"
                      color={getStyleValue('backgroundColor', '#ffffff')}
                      onChange={(color) => handleStyleChange('backgroundColor', color)}
                    />
                  )}

                  {backgroundType === 'gradient' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium mb-2 block">Direction</label>
                        <Select value={gradientDirection} onValueChange={setGradientDirection}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="to-r">Left to Right</SelectItem>
                            <SelectItem value="to-l">Right to Left</SelectItem>
                            <SelectItem value="to-b">Top to Bottom</SelectItem>
                            <SelectItem value="to-t">Bottom to Top</SelectItem>
                            <SelectItem value="to-br">Top Left to Bottom Right</SelectItem>
                            <SelectItem value="to-tr">Bottom Left to Top Right</SelectItem>
                            <SelectItem value="to-bl">Top Right to Bottom Left</SelectItem>
                            <SelectItem value="to-tl">Bottom Right to Top Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <ColorPicker
                        label="From Color"
                        color={gradientFromColor}
                        onChange={setGradientFromColor}
                      />

                      <ColorPicker
                        label="To Color"
                        color={gradientToColor}
                        onChange={setGradientToColor}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
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

            {/* Typography Section - Only for text elements */}
            {isTextElement && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ColorPicker
                    label="Text Color"
                    color={getStyleValue('textColor', '#000000')}
                    onChange={(color) => handleStyleChange('textColor', color)}
                  />

                  <div>
                    <Label className="text-xs">Font Size</Label>
                    <Slider
                      value={[getNumericStyleValue(getStyleValue('fontSize', 16), 16)]}
                      onValueChange={(value) => handleStyleChange('fontSize', value[0])}
                      min={8}
                      max={72}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">
                      {getStyleValue('fontSize', 16)}px
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Font Weight</Label>
                    <Select
                      value={getStyleValue('fontWeight', 400).toString()}
                      onValueChange={(value) => handleStyleChange('fontWeight', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Normal (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                        <SelectItem value="800">Extra Bold (800)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Line Height</Label>
                    <Slider
                      value={[getNumericStyleValue(getStyleValue('lineHeight', 1.5), 1.5)]}
                      onValueChange={(value) => handleStyleChange('lineHeight', value[0])}
                      min={1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">
                      {getStyleValue('lineHeight', 1.5)}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Letter Spacing</Label>
                    <Slider
                      value={[getNumericStyleValue(getStyleValue('letterSpacing', 0), 0)]}
                      onValueChange={(value) => handleStyleChange('letterSpacing', `${value[0]}px`)}
                      min={-2}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">
                      {getDisplayStyleValue(getStyleValue('letterSpacing', 0), '0px')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Border Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Border</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Border Width</Label>
                  <Slider
                    value={[getNumericStyleValue(getStyleValue('borderWidth', 0), 0)]}
                    onValueChange={(value) => handleStyleChange('borderWidth', `${value[0]}px`)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    {getDisplayStyleValue(getStyleValue('borderWidth', 0), '0px')}
                  </div>
                </div>

                <ColorPicker
                  label="Border Color"
                  color={getStyleValue('borderColor', '#e5e7eb')}
                  onChange={(color) => handleStyleChange('borderColor', color)}
                />

                <div>
                  <Label className="text-xs">Border Style</Label>
                  <Select
                    value={getStyleValue('borderStyle', 'solid')}
                    onValueChange={(value) => handleStyleChange('borderStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Border Radius</Label>
                  <Slider
                    value={[getNumericStyleValue(getStyleValue('borderRadius', 0), 0)]}
                    onValueChange={(value) => handleStyleChange('borderRadius', `${value[0]}px`)}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    {getDisplayStyleValue(getStyleValue('borderRadius', 0), '0px')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spacing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Spacing & Layout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Text Alignment</Label>
                  <Select
                    value={getStyleValue('textAlign', 'left')}
                    onValueChange={(value) => handleStyleChange('textAlign', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Padding</Label>
                  <Slider
                    value={[getNumericStyleValue(getStyleValue('padding', 0), 0)]}
                    onValueChange={(value) => handleStyleChange('padding', `${value[0]}px`)}
                    max={100}
                    step={4}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    {getDisplayStyleValue(getStyleValue('padding', 0), '0px')}
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Margin</Label>
                  <Slider
                    value={[getNumericStyleValue(getStyleValue('margin', 0), 0)]}
                    onValueChange={(value) => handleStyleChange('margin', `${value[0]}px`)}
                    max={100}
                    step={4}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    {getDisplayStyleValue(getStyleValue('margin', 0), '0px')}
                  </div>
                </div>
              </CardContent>
            </Card>
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