import React from 'react';
import { LandingPageComponent } from '@/types/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface ButtonActionConfigProps {
  selectedComponent: LandingPageComponent;
  selectedElementId: string;
  allSections: LandingPageComponent[];
  actionType: string;
  url: string;
  newTab: boolean;
  targetId: string;
  onActionTypeChange: (type: string) => void;
  onUrlChange: (url: string) => void;
  onNewTabChange: (newTab: boolean) => void;
  onTargetIdChange: (targetId: string) => void;
  onUpdateComponent: (componentId: string, updates: Partial<LandingPageComponent>) => void;
  productData?: { id: string; price: number } | null;
}

export const ButtonActionConfig: React.FC<ButtonActionConfigProps> = ({
  selectedComponent,
  selectedElementId,
  allSections,
  actionType,
  url,
  newTab,
  targetId,
  onActionTypeChange,
  onUrlChange,
  onNewTabChange,
  onTargetIdChange,
  onUpdateComponent,
  productData
}) => {
  const handleSaveAction = React.useCallback(() => {
    const action = {
      type: actionType,
      url: actionType === 'open_link' ? url : undefined,
      newTab: actionType === 'open_link' ? newTab : undefined,
      targetId: actionType === 'scroll' ? targetId : undefined,
      productId: actionType === 'checkout' ? productData?.id : undefined,
      amount: actionType === 'checkout' ? productData?.price : undefined,
    };

    const updatedCustomActions = {
      ...selectedComponent.custom_actions,
      [selectedElementId]: action
    };

    onUpdateComponent(selectedComponent.id, {
      custom_actions: updatedCustomActions
    });
  }, [actionType, url, newTab, targetId, productData, selectedComponent.custom_actions, selectedComponent.id, selectedElementId, onUpdateComponent]);

  // Auto-save when action type changes
  React.useEffect(() => {
    handleSaveAction();
  }, [actionType, handleSaveAction]);

  // Auto-save when URL or newTab changes for open_link
  React.useEffect(() => {
    if (actionType === 'open_link') {
      handleSaveAction();
    }
  }, [actionType, url, newTab, handleSaveAction]);

  // Auto-save when targetId changes for scroll
  React.useEffect(() => {
    if (actionType === 'scroll') {
      handleSaveAction();
    }
  }, [actionType, targetId, handleSaveAction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Button Action
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Action Type</Label>
          <Select value={actionType} onValueChange={onActionTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open_link">Open Link</SelectItem>
              <SelectItem value="scroll">Scroll to Section</SelectItem>
              <SelectItem value="checkout">Checkout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {actionType === 'open_link' && (
          <>
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newTab}
                onCheckedChange={onNewTabChange}
              />
              <Label className="text-xs">Open in new tab</Label>
            </div>
          </>
        )}

        {actionType === 'scroll' && (
          <div>
            <Label className="text-xs">Target Section</Label>
            <Select value={targetId} onValueChange={onTargetIdChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select section..." />
              </SelectTrigger>
              <SelectContent>
                {allSections.map((section, idx) => {
                  const label =
                    section.content?.headline?.trim() ||
                    section.content?.title?.trim() ||
                    (section.component_variation?.component_type
                      ? section.component_variation.component_type
                      : section.id.slice(0, 8));
                  return (
                    <SelectItem key={section.id} value={`section-${section.id}`}>
                      {label} ({idx + 1})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {actionType === 'checkout' && (
          <div className="space-y-2">
            {productData ? (
              <div className="p-3 bg-gray-50 rounded-md">
                <Label className="text-xs font-medium">Product Information</Label>
                <div className="mt-1 space-y-1">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">ID:</span> {productData.id}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Price:</span> {productData.price} TND
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 rounded-md">
                <Label className="text-xs text-yellow-800">No product linked to this landing page</Label>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};