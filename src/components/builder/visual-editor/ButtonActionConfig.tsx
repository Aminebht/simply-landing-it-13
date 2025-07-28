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
  productId: string;
  amount: string;
  onActionTypeChange: (type: string) => void;
  onUrlChange: (url: string) => void;
  onNewTabChange: (newTab: boolean) => void;
  onTargetIdChange: (targetId: string) => void;
  onProductIdChange: (productId: string) => void;
  onAmountChange: (amount: string) => void;
  onUpdateComponent: (componentId: string, updates: Partial<LandingPageComponent>) => void;
}

export const ButtonActionConfig: React.FC<ButtonActionConfigProps> = ({
  selectedComponent,
  selectedElementId,
  allSections,
  actionType,
  url,
  newTab,
  targetId,
  productId,
  amount,
  onActionTypeChange,
  onUrlChange,
  onNewTabChange,
  onTargetIdChange,
  onProductIdChange,
  onAmountChange,
  onUpdateComponent
}) => {
  const handleSaveAction = () => {
    const action = {
      type: actionType,
      url: actionType === 'open_link' ? url : undefined,
      newTab: actionType === 'open_link' ? newTab : undefined,
      targetId: actionType === 'scroll_to' ? targetId : undefined,
      productId: actionType === 'checkout' ? productId : undefined,
      amount: actionType === 'checkout' ? parseFloat(amount) : undefined,
    };

    const updatedCustomActions = {
      ...selectedComponent.custom_actions,
      [selectedElementId]: action
    };

    onUpdateComponent(selectedComponent.id, {
      custom_actions: updatedCustomActions
    });
  };

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
              <SelectItem value="scroll_to">Scroll to Section</SelectItem>
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
                onBlur={handleSaveAction}
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

        {actionType === 'scroll_to' && (
          <div>
            <Label className="text-xs">Target Section</Label>
            <Select value={targetId} onValueChange={onTargetIdChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select section..." />
              </SelectTrigger>
              <SelectContent>
                {allSections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.component_variation?.component_type || 'Section'} - 
                    Position {section.order_index}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {actionType === 'checkout' && (
          <>
            <div>
              <Label className="text-xs">Product ID</Label>
              <Input
                value={productId}
                onChange={(e) => onProductIdChange(e.target.value)}
                placeholder="product-uuid"
                onBlur={handleSaveAction}
              />
            </div>
            <div>
              <Label className="text-xs">Price (TND)</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="29.99"
                onBlur={handleSaveAction}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};