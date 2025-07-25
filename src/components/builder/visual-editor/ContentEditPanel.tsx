import React from 'react';
import { LandingPageComponent } from '@/types/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaUpload } from '@/components/ui/media-upload';
import { Type, Image } from 'lucide-react';
import { getElementContentField, getElementDisplayName } from './styleHelpers';

interface ContentEditPanelProps {
  selectedComponent: LandingPageComponent;
  selectedElementId: string | null;
  onContentChange: (field: string, value: any) => void;
  onUpdateComponent: (componentId: string, updates: Partial<LandingPageComponent>) => void;
}

export const ContentEditPanel: React.FC<ContentEditPanelProps> = ({
  selectedComponent,
  selectedElementId,
  onContentChange,
  onUpdateComponent
}) => {
  const contentField = getElementContentField(selectedElementId);
  const elementDisplayName = getElementDisplayName(selectedElementId);
  
  if (!contentField) {
    return null;
  }

  const currentValue = selectedComponent.content[contentField] || '';
  const isTextArea = contentField === 'subheadline' || contentField.includes('description');

  const handleMediaUpload = (url: string) => {
    onContentChange(contentField, url);
  };

  const handleTextChange = (value: string) => {
    onContentChange(contentField, value);
  };

  const isImageField = contentField.includes('image') || contentField.includes('logo') || contentField.includes('avatar');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {isImageField ? <Image className="h-4 w-4" /> : <Type className="h-4 w-4" />}
          {elementDisplayName} Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImageField ? (
          <div>
            <Label className="text-xs">Image URL</Label>
            <MediaUpload
              value={currentValue}
              onChange={handleMediaUpload}
              componentId={selectedComponent.id}
              fieldName={contentField}
              placeholder="Upload or enter image URL"
              acceptedTypes={['image/*']}
            />
          </div>
        ) : (
          <div>
            <Label className="text-xs">
              {elementDisplayName}
            </Label>
            {isTextArea ? (
              <Textarea
                value={currentValue}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Enter ${elementDisplayName.toLowerCase()}...`}
                rows={3}
              />
            ) : (
              <Input
                value={currentValue}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Enter ${elementDisplayName.toLowerCase()}...`}
              />
            )}
          </div>
        )}

        {/* Character limit info if applicable */}
        {currentValue && (
          <div className="text-xs text-gray-500">
            {currentValue.length} characters
          </div>
        )}
      </CardContent>
    </Card>
  );
};