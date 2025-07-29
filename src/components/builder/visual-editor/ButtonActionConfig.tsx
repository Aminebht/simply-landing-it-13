import React, { useState, useEffect, useCallback } from 'react';
import { LandingPageComponent } from '@/types/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

export interface ButtonActionConfigProps {
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
  actionType: propActionType,
  url: propUrl,
  newTab: propNewTab,
  targetId: propTargetId,
  onActionTypeChange,
  onUrlChange,
  onNewTabChange,
  onTargetIdChange,
  onUpdateComponent,
  productData
}) => {
  // Keep track of the last saved action to prevent unnecessary updates
  const lastSavedAction = React.useRef<string>('');

  // Generate a unique key for the current action state
  const getActionKey = useCallback((type: string, url: string, newTab: boolean, targetId: string) => {
    return `${type}:${url}:${newTab}:${targetId}`;
  }, []);

  // Save action with debouncing
  const saveAction = useCallback((action: {
    type: string;
    url?: string;
    newTab?: boolean;
    targetId?: string;
    productId?: string;
    amount?: number;
  }) => {
    if (!selectedElementId) return;

    const actionKey = getActionKey(
      action.type || '',
      action.url || '',
      action.newTab || false,
      action.targetId || ''
    );

    // Only proceed if the action has actually changed
    if (actionKey === lastSavedAction.current) return;

    lastSavedAction.current = actionKey;

    // If action type is empty, remove the action
    if (!action.type) {
      const { [selectedElementId]: _, ...remainingActions } = selectedComponent.custom_actions || {};
      onUpdateComponent(selectedComponent.id, {
        custom_actions: remainingActions
      });
      return;
    }

    // Otherwise, update the action
    const updatedCustomActions = {
      ...selectedComponent.custom_actions,
      [selectedElementId]: {
        ...action,
        // Only include relevant fields based on action type
        url: action.type === 'open_link' ? action.url : undefined,
        newTab: action.type === 'open_link' ? action.newTab : undefined,
        targetId: action.type === 'scroll' ? action.targetId : undefined,
        productId: action.type === 'checkout' ? (productData?.id || '') : undefined,
        amount: action.type === 'checkout' ? (productData?.price || 0) : undefined,
      }
    };

    onUpdateComponent(selectedComponent.id, {
      custom_actions: updatedCustomActions
    });
  }, [getActionKey, onUpdateComponent, productData, selectedComponent, selectedElementId]);

  // Handle action type change
  const handleActionTypeChange = (type: string) => {
    const newAction = {
      type,
      url: propUrl,
      newTab: propNewTab,
      targetId: propTargetId,
      productId: type === 'checkout' ? productData?.id : undefined,
      amount: type === 'checkout' ? productData?.price : undefined
    };
    saveAction(newAction);
    onActionTypeChange(type);
  };

  // Handle URL change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    saveAction({
      type: propActionType,
      url,
      newTab: propNewTab,
      targetId: propTargetId
    });
    onUrlChange(url);
  };

  // Handle new tab change
  const handleNewTabChange = (newTab: boolean) => {
    saveAction({
      type: propActionType,
      url: propUrl,
      newTab,
      targetId: propTargetId
    });
    onNewTabChange(newTab);
  };

  // Handle target ID change
  const handleTargetIdChange = (targetId: string) => {
    saveAction({
      type: propActionType,
      url: propUrl,
      newTab: propNewTab,
      targetId
    });
    onTargetIdChange(targetId);
  };

  // Update last saved action when props change
  useEffect(() => {
    lastSavedAction.current = getActionKey(
      propActionType || '',
      propUrl || '',
      propNewTab || false,
      propTargetId || ''
    );
  }, [getActionKey, propActionType, propUrl, propNewTab, propTargetId]);

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
          <Select 
            value={propActionType} 
            onValueChange={handleActionTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open_link">Open Link</SelectItem>
              <SelectItem value="scroll">Scroll to Section</SelectItem>
              <SelectItem value="checkout">Checkout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {propActionType === 'open_link' && (
          <>
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={propUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={propNewTab}
                onCheckedChange={handleNewTabChange}
              />
              <Label className="text-xs">Open in new tab</Label>
            </div>
          </>
        )}

        {propActionType === 'scroll' && (
          <div>
            <Label className="text-xs">Target Section</Label>
            <Select 
              value={propTargetId} 
              onValueChange={handleTargetIdChange}
            >
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

        {propActionType === 'checkout' && (
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