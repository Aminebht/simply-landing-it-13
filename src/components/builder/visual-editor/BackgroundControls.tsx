import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '../ColorPicker';

interface BackgroundControlsProps {
  getStyleValue: (property: string, defaultValue?: unknown) => unknown;
  handleStyleChange: (property: string, value: unknown) => void;
  handleGradientChange?: (gradientValue: string) => void;
  isEditingContainer?: boolean;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  getStyleValue,
  handleStyleChange,
  handleGradientChange = () => {},
  isEditingContainer = true
}) => {
  // Determine initial background type based on existing styles
  const initialBackgroundColor = getStyleValue('backgroundColor', '#ffffff');
  const isInitiallyGradient = typeof initialBackgroundColor === 'string' && 
    initialBackgroundColor.includes('gradient');
  
  // For non-container elements, always default to solid
  const initialBackgroundType = isEditingContainer && isInitiallyGradient ? 'gradient' : 'solid';
  
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>(initialBackgroundType);

  // Track when we're in the middle of a user-initiated background type change
  const isChangingBackgroundTypeRef = useRef(false);
  
  useEffect(() => {
    // Skip updating background type if we're in the middle of a user-initiated change
    if (isChangingBackgroundTypeRef.current) {
      isChangingBackgroundTypeRef.current = false;
      return;
    }
    
    // For non-container elements, always force solid background type
    if (!isEditingContainer) {
      if (backgroundType !== 'solid') {
        setBackgroundType('solid');
      }
      return;
    }
    
    // Update background type when it actually changes in the styles (container only)
    const currentBackgroundColor = getStyleValue('backgroundColor', '#ffffff');
    const isCurrentGradient = typeof currentBackgroundColor === 'string' && 
      currentBackgroundColor.includes('gradient');
    
    const newBackgroundType = isCurrentGradient ? 'gradient' : 'solid';
    
    // Only update if the background type in styles is different from current state
    if (newBackgroundType !== backgroundType) {
      setBackgroundType(newBackgroundType);
    }
  }, [getStyleValue, backgroundType, isEditingContainer]);

  // Preserve the existing gradient when switching to gradient mode
  const handleBackgroundTypeChange = (value: 'solid' | 'gradient') => {
    // Non-container elements can only have solid background
    if (!isEditingContainer && value !== 'solid') {
      return;
    }
    
    // Indicate that this is a user-initiated change
    isChangingBackgroundTypeRef.current = true;
    
    setBackgroundType(value);
    if (value === 'solid') {
      // For solid background, set backgroundColor and clear background
      handleStyleChange('backgroundColor', '#ffffff');
      handleStyleChange('background', '');
    } else if (value === 'gradient') {
      // For gradient background, preserve existing gradient or use default
      const existingBackground = getStyleValue('backgroundColor', '');
      const isExistingGradient = typeof existingBackground === 'string' && 
        existingBackground.includes('gradient');
      
      if (isExistingGradient && existingBackground) {
        // Keep the existing gradient
        handleGradientChange(existingBackground);
      } else {
        // Use default gradient only if no existing gradient
        handleGradientChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingContainer && (
          <div>
            <Label className="text-xs">Background Type</Label>
            <Select
              value={backgroundType}
              onValueChange={handleBackgroundTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Solid Color */}
        {(backgroundType === 'solid' || !isEditingContainer) && (
          <ColorPicker
            label="Background Color"
            color={String(getStyleValue('backgroundColor', '#ffffff') || '#ffffff')}
            onChange={(color) => handleStyleChange('backgroundColor', color)}
          />
        )}

        {/* Gradient */}
        {isEditingContainer && backgroundType === 'gradient' && (() => {
          // fallback to a default if not a gradient string
          const backgroundColorValue = getStyleValue('backgroundColor', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
          const backgroundValueStr = typeof backgroundColorValue === 'string' ? backgroundColorValue : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          const actualBackgroundValue = backgroundValueStr && backgroundValueStr.includes('gradient')
            ? backgroundValueStr
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          const colors = actualBackgroundValue.match(/#[0-9a-f]{6}/gi) || ['#667eea', '#764ba2'];
          const direction = actualBackgroundValue.includes('135deg') ? '135deg' :
            actualBackgroundValue.includes('90deg') ? '90deg' :
            actualBackgroundValue.includes('45deg') ? '45deg' : '0deg';
          return (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Gradient Direction</Label>
                <Select
                  value={direction}
                  onValueChange={(newDirection) => {
                    const newGradient = `linear-gradient(${newDirection}, ${colors[0]} 0%, ${colors[1]} 100%)`;
                    handleGradientChange(newGradient);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0deg">Top to Bottom</SelectItem>
                    <SelectItem value="90deg">Left to Right</SelectItem>
                    <SelectItem value="45deg">Diagonal ↗</SelectItem>
                    <SelectItem value="135deg">Diagonal ↘</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker
                  label="Start Color"
                  color={colors[0] || '#667eea'}
                  onChange={(color) => {
                    const newColors = [color, colors[1] || '#764ba2'];
                    const newGradient = `linear-gradient(${direction}, ${newColors[0]} 0%, ${newColors[1]} 100%)`;
                    handleGradientChange(newGradient);
                  }}
                />
                <ColorPicker
                  label="End Color"
                  color={colors[1] || '#764ba2'}
                  onChange={(color) => {
                    const newColors = [colors[0] || '#667eea', color];
                    const newGradient = `linear-gradient(${direction}, ${newColors[0]} 0%, ${newColors[1]} 100%)`;
                    handleGradientChange(newGradient);
                  }}
                />
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};