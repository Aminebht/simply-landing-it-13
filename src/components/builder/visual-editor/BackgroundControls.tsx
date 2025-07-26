import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '../ColorPicker';

interface BackgroundControlsProps {
  getStyleValue: (property: string, defaultValue?: any) => any;
  handleStyleChange: (property: string, value: any) => void;
  handleGradientChange: (gradientValue: string) => void;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  getStyleValue,
  handleStyleChange,
  handleGradientChange
}) => {
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Background Type</Label>
          <Select
            value={backgroundType}
            onValueChange={(value: 'solid' | 'gradient') => {
              setBackgroundType(value);
              if (value === 'solid') {
                handleStyleChange('backgroundColor', '#ffffff');
                handleStyleChange('background', '');
              } else if (value === 'gradient') {
                handleGradientChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
              }
            }}
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

        {/* Solid Color */}
        {backgroundType === 'solid' && (
          <ColorPicker
            label="Background Color"
            color={getStyleValue('backgroundColor', '#ffffff')}
            onChange={(color) => handleStyleChange('backgroundColor', color)}
          />
        )}

        {/* Gradient */}
        {backgroundType === 'gradient' && (() => {
          // fallback to a default if not a gradient string
          const backgroundColorValue = getStyleValue('backgroundColor', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
          const actualBackgroundValue = backgroundColorValue && backgroundColorValue.includes('gradient')
            ? backgroundColorValue
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
                    handleGradientChange(`linear-gradient(${newDirection}, ${colors[0]} 0%, ${colors[1]} 100%)`);
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
                    handleGradientChange(`linear-gradient(${direction}, ${newColors[0]} 0%, ${newColors[1]} 100%)`);
                  }}
                />
                <ColorPicker
                  label="End Color"
                  color={colors[1] || '#764ba2'}
                  onChange={(color) => {
                    const newColors = [colors[0] || '#667eea', color];
                    handleGradientChange(`linear-gradient(${direction}, ${newColors[0]} 0%, ${newColors[1]} 100%)`);
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