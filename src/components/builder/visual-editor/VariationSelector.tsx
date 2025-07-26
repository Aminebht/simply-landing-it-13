import React from 'react';
import { LandingPageComponent, ComponentVariation } from '@/types/components';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle } from 'lucide-react';
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
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Component Variation</Label>
          <Select
            value={getVariationNumber(selectedComponent)}
            onValueChange={(value) => handleVariationChange(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center">
                  <Shuffle className="h-4 w-4 mr-2" />
                  {/* Extract and display variation name without nested functions that could create hooks inconsistency */}
                  {currentVariation?.variation_name || 
                   selectedComponent.component_variation?.variation_name || 
                   `Variation ${getVariationNumber(selectedComponent)}`}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
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
                  <SelectItem key={variation.variation_number} value={variation.variation_number.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{variation.variation_name}</span>
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