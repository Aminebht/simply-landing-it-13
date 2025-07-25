import React from 'react';
import { LandingPageComponent, ComponentVariation } from '@/types/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { getVariationNumber, getComponentType } from './styleHelpers';

interface VariationSelectorProps {
  selectedComponent: LandingPageComponent;
  componentVariations: ComponentVariation[];
  onVariationChange: (newVariation: number) => void;
}

export const VariationSelector: React.FC<VariationSelectorProps> = ({
  selectedComponent,
  componentVariations,
  onVariationChange
}) => {
  const currentVariationNumber = getVariationNumber(selectedComponent);
  const componentType = getComponentType(selectedComponent, componentVariations);
  
  // Get available variations for this component type
  const availableVariations = componentVariations
    .filter(v => v.component_type === componentType && v.is_active)
    .sort((a, b) => a.variation_number - b.variation_number);

  if (availableVariations.length <= 1) {
    return null; // Don't show if only one variation available
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shuffle className="h-4 w-4" />
          Variation ({currentVariationNumber})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {availableVariations.map((variation) => (
            <Button
              key={variation.id}
              variant={
                variation.variation_number.toString() === currentVariationNumber
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => onVariationChange(variation.variation_number)}
              className="h-8"
            >
              {variation.variation_number}
            </Button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {availableVariations.find(v => v.variation_number.toString() === currentVariationNumber)?.description || 
           `${componentType} variation ${currentVariationNumber}`}
        </div>
      </CardContent>
    </Card>
  );
};