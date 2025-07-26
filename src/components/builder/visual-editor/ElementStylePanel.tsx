import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from '../ColorPicker';
import { Type, Layout } from 'lucide-react';
import { getDisplayStyleValue, getNumericStyleValue } from './styleHelpers';

interface ElementStylePanelProps {
  getStyleValue: (property: string, defaultValue?: any) => any;
  onStyleChange: (property: string, value: any) => void;
  isTextElement: boolean;
}

export const ElementStylePanel: React.FC<ElementStylePanelProps> = ({
  getStyleValue,
  onStyleChange,
  isTextElement
}) => {
  return (
    <div className="space-y-4">
      {/* Typography Section - Only for text elements */}
      {isTextElement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font Size and Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Font Size</Label>
                <Select
                  value={getStyleValue('fontSize', '16').toString()}
                  onValueChange={(value) => onStyleChange('fontSize', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                    <SelectItem value="20">20px</SelectItem>
                    <SelectItem value="24">24px</SelectItem>
                    <SelectItem value="32">32px</SelectItem>
                    <SelectItem value="48">48px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Font Weight</Label>
                <Select
                  value={getStyleValue('fontWeight', '400').toString()}
                  onValueChange={(value) => onStyleChange('fontWeight', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Normal</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semi Bold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                    <SelectItem value="800">Extra Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Color */}
            <ColorPicker
              label="Text Color"
              color={getStyleValue('color', '#111827')}
              onChange={(color) => onStyleChange('color', color)}
            />
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
              onValueChange={(value) => onStyleChange('borderWidth', `${value[0]}px`)}
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
            onChange={(color) => onStyleChange('borderColor', color)}
          />

          <div>
            <Label className="text-xs">Border Style</Label>
            <Select
              value={getStyleValue('borderStyle', 'solid')}
              onValueChange={(value) => onStyleChange('borderStyle', value)}
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
              onValueChange={(value) => onStyleChange('borderRadius', `${value[0]}px`)}
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
              onValueChange={(value) => onStyleChange('textAlign', value)}
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
              onValueChange={(value) => onStyleChange('padding', `${value[0]}px`)}
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
              onValueChange={(value) => onStyleChange('margin', `${value[0]}px`)}
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
    </div>
  );
};