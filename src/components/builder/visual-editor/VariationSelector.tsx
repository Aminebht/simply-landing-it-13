import React from 'react';
import { LandingPageComponent, ComponentVariation } from '@/types/components';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, Sparkles } from 'lucide-react';
import { getVariationNumber, getComponentType } from './styleHelpers';

interface VariationSelectorProps {
  selectedComponent: LandingPageComponent;
  componentVariations: ComponentVariation[];
  onChangeVariation?: (newVariation: number) => void;
}

export const VariationSelector: React.FC<VariationSelectorProps> = ({
  selectedComponent,
  componentVariations,
  onChangeVariation
}) => {
  const currentVariation = componentVariations.find(v => 
    v.id === selectedComponent.component_variation_id
  );

  const handleVariationChange = (value: number) => {
    if (onChangeVariation) {
      onChangeVariation(value);
    }
  };

  return (
    <>
      {onChangeVariation && (
        <div className="bg-gradient-to-r from-brand-light-cream/20 to-brand-cotton-candy-pink/20 rounded-xl p-4 border border-brand-lavender-gray/20">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-medium-violet to-brand-deep-indigo rounded-lg flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <Label className="text-sm font-semibold text-brand-deep-indigo">Component Style</Label>
          </div>
          <Select
            value={getVariationNumber(selectedComponent)}
            onValueChange={(value) => handleVariationChange(parseInt(value))}
          >
            <SelectTrigger className="w-full border-brand-lavender-gray/30 hover:border-brand-medium-violet/40 focus:border-brand-medium-violet focus:ring-brand-medium-violet/20 bg-white/80 backdrop-blur-sm">
              <SelectValue>
                <div className="flex items-center">
                  <Shuffle className="h-4 w-4 mr-2 text-brand-medium-violet" />
                  <span className="font-medium text-brand-deep-indigo">
                    {currentVariation?.variation_name || 
                     selectedComponent.component_variation?.variation_name || 
                     `Variation ${getVariationNumber(selectedComponent)}`}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-xl border-brand-lavender-gray/20 shadow-xl">
              {componentVariations
                .filter(v => {
                  // Use the currentVariation to determine which type to display
                  if (currentVariation) {
                    return v.component_type === currentVariation.component_type;
                  }
                  
                  // Get component type from multiple possible sources
                  const componentType = getComponentType(selectedComponent, componentVariations);
                  return v.component_type === componentType;
                })
                .map((variation) => (
                  <SelectItem 
                    key={variation.variation_number} 
                    value={variation.variation_number.toString()}
                    className="hover:bg-brand-cotton-candy-pink/20 focus:bg-brand-cotton-candy-pink/30 focus:text-brand-deep-indigo"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{variation.variation_name}</span>
                      <span className="text-xs text-brand-deep-indigo/60 ml-2">#{variation.variation_number}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};