import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '../ColorPicker';
import { Palette } from 'lucide-react';

interface BackgroundControlsProps {
  currentBackgroundColor: string;
  currentBackground: string;
  onStyleChange: (property: string, value: any) => void;
  onGradientChange: (gradientValue: string) => void;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  currentBackgroundColor,
  currentBackground,
  onStyleChange,
  onGradientChange
}) => {
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientDirection, setGradientDirection] = useState('to-r');
  const [gradientFromColor, setGradientFromColor] = useState('#3b82f6');
  const [gradientToColor, setGradientToColor] = useState('#8b5cf6');

  // Initialize background type based on current values
  useEffect(() => {
    const hasGradient = currentBackground?.includes('gradient') || 
                      currentBackgroundColor?.includes('gradient');
    setBackgroundType(hasGradient ? 'gradient' : 'solid');
    
    if (hasGradient) {
      const gradientValue = currentBackground || currentBackgroundColor;
      parseGradientValue(gradientValue);
    }
  }, [currentBackground, currentBackgroundColor]);

  const parseGradientValue = (gradientValue: string) => {
    try {
      const directionMatch = gradientValue.match(/linear-gradient\(([^,]+),/);
      if (directionMatch) {
        const direction = directionMatch[1].trim();
        const tailwindDirection = getTailwindDirection(direction);
        setGradientDirection(tailwindDirection);
      }

      const colorMatches = gradientValue.match(/#[0-9a-fA-F]{6}/g);
      if (colorMatches && colorMatches.length >= 2) {
        setGradientFromColor(colorMatches[0]);
        setGradientToColor(colorMatches[1]);
      }
    } catch (error) {
      console.warn('Failed to parse gradient value:', error);
    }
  };

  const getTailwindDirection = (cssDirection: string): string => {
    const directionMap: Record<string, string> = {
      '0deg': 'to-t',
      '90deg': 'to-r',
      '180deg': 'to-b',
      '270deg': 'to-l',
      'to top': 'to-t',
      'to right': 'to-r',
      'to bottom': 'to-b',
      'to left': 'to-l',
      'to top right': 'to-tr',
      'to bottom right': 'to-br',
      'to bottom left': 'to-bl',
      'to top left': 'to-tl'
    };
    return directionMap[cssDirection] || 'to-r';
  };

  const getCSSDirection = (tailwindDirection: string): string => {
    const directionMap: Record<string, string> = {
      'to-t': 'to top',
      'to-r': 'to right',
      'to-b': 'to bottom',
      'to-l': 'to left',
      'to-tr': 'to top right',
      'to-br': 'to bottom right',
      'to-bl': 'to bottom left',
      'to-tl': 'to top left'
    };
    return directionMap[tailwindDirection] || 'to right';
  };

  const handleBackgroundTypeChange = (type: 'solid' | 'gradient') => {
    setBackgroundType(type);
    
    if (type === 'solid') {
      onStyleChange('backgroundColor', currentBackgroundColor || '#ffffff');
      onStyleChange('background', '');
    } else {
      const cssDirection = getCSSDirection(gradientDirection);
      const gradientValue = `linear-gradient(${cssDirection}, ${gradientFromColor}, ${gradientToColor})`;
      onGradientChange(gradientValue);
    }
  };

  const updateGradient = () => {
    const cssDirection = getCSSDirection(gradientDirection);
    const gradientValue = `linear-gradient(${cssDirection}, ${gradientFromColor}, ${gradientToColor})`;
    onGradientChange(gradientValue);
  };

  const handleGradientDirectionChange = (direction: string) => {
    setGradientDirection(direction);
    setTimeout(updateGradient, 0);
  };

  const handleGradientFromColorChange = (color: string) => {
    setGradientFromColor(color);
    setTimeout(updateGradient, 0);
  };

  const handleGradientToColorChange = (color: string) => {
    setGradientToColor(color);
    setTimeout(updateGradient, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Type Toggle */}
        <div className="flex space-x-2">
          <Button
            variant={backgroundType === 'solid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleBackgroundTypeChange('solid')}
            className="flex-1"
          >
            Solid
          </Button>
          <Button
            variant={backgroundType === 'gradient' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleBackgroundTypeChange('gradient')}
            className="flex-1"
          >
            Gradient
          </Button>
        </div>

        {/* Solid Color Controls */}
        {backgroundType === 'solid' && (
          <ColorPicker
            label="Background Color"
            color={currentBackgroundColor || '#ffffff'}
            onChange={(color) => onStyleChange('backgroundColor', color)}
          />
        )}

        {/* Gradient Controls */}
        {backgroundType === 'gradient' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Direction</label>
              <Select value={gradientDirection} onValueChange={handleGradientDirectionChange}>
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
              onChange={handleGradientFromColorChange}
            />

            <ColorPicker
              label="To Color"
              color={gradientToColor}
              onChange={handleGradientToColorChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};