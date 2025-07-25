import React, { useMemo } from 'react';
import { LandingPageComponent, VisibilityGroup, VisibilityControlsProps, ComponentVariation } from '@/types/components';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const VisibilityControls: React.FC<VisibilityControlsProps> = ({
  component,
  componentVariation,
  onToggleVisibility,
  onBulkToggleVisibility
}) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  // Create visibility groups from component variation data
  const visibilityGroups = useMemo((): VisibilityGroup[] => {
    // If we have component variation with visibility_keys, use that
    if (componentVariation?.visibility_keys && componentVariation.visibility_keys.length > 0) {
      return componentVariation.visibility_keys.map(visibilityKey => ({
        groupKey: visibilityKey.key,
        groupLabel: visibilityKey.label[0] || visibilityKey.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        parts: [visibilityKey.key],
        isVisible: component.visibility[visibilityKey.key] !== false
      }));
    }
    
    // Fallback: create individual groups for each part
    const availableParts = ['headline', 'subheadline', 'ctaButton'];
    
    return availableParts.map(part => ({
      groupKey: part,
      groupLabel: part.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      parts: [part],
      isVisible: component.visibility[part] !== false
    }));
  }, [component.visibility, componentVariation]);

  // Handle group-level visibility toggle
  const handleGroupToggle = (group: VisibilityGroup, isVisible: boolean) => {
    if (onBulkToggleVisibility) {
      // For non-grouped components, set all individual parts
      const groupVisibility = group.parts.reduce((acc, part) => {
        acc[part] = isVisible;
        return acc;
      }, {} as Record<string, boolean>);
      
      onBulkToggleVisibility({
        ...component.visibility,
        ...groupVisibility
      });
    } else {
      // Fallback to individual toggles
      group.parts.forEach(part => onToggleVisibility(part, isVisible));
    }
  };

  // Handle individual part toggle
  const handlePartToggle = (partName: string, isVisible: boolean) => {
    onToggleVisibility(partName, isVisible);
  };

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleShowAll = () => {
    if (onBulkToggleVisibility) {
      // Get all parts from visibility groups
      const allParts = visibilityGroups.flatMap(group => group.parts);
      const showAllVisibility = allParts.reduce((acc, part) => {
        acc[part] = true;
        return acc;
      }, {} as Record<string, boolean>);
      onBulkToggleVisibility(showAllVisibility);
    }
  };

  const handleHideAll = () => {
    if (onBulkToggleVisibility) {
      // Get all parts from visibility groups
      const allParts = visibilityGroups.flatMap(group => group.parts);
      const hideAllVisibility = allParts.reduce((acc, part) => {
        acc[part] = false;
        return acc;
      }, {} as Record<string, boolean>);
      onBulkToggleVisibility(hideAllVisibility);
    }
  };

  // Check if we have visibility_keys data
  const hasVisibilityKeys = componentVariation?.visibility_keys && componentVariation.visibility_keys.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Show/Hide Elements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group-level controls */}
        <div className="space-y-3">
          {visibilityGroups.map((group) => {
            const hasMultipleParts = group.parts.length > 1;
            
            return (
              <div key={group.groupKey} className="border rounded-lg">
                {/* Group header with toggle */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <Switch
                      checked={group.isVisible}
                      onCheckedChange={(checked) => handleGroupToggle(group, checked)}
                    />
                    <Label 
                      className="text-sm font-medium cursor-pointer flex-1" 
                      onClick={() => handleGroupToggle(group, !group.isVisible)}
                    >
                      {group.groupLabel}
                    </Label>
                    {!hasVisibilityKeys && hasMultipleParts && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {group.parts.length} elements
                      </span>
                    )}
                  </div>
                  
                  {/* Show expand button only for legacy non-grouped components with multiple parts */}
                  {!hasVisibilityKeys && hasMultipleParts && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroupExpansion(group.groupKey)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      {expandedGroups[group.groupKey] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Individual part controls (collapsible) - only show for legacy non-grouped components */}
                {!hasVisibilityKeys && hasMultipleParts && (
                  <Collapsible open={expandedGroups[group.groupKey]}>
                    <CollapsibleContent className="border-t bg-gray-50/50 p-3">
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500 mb-2 font-medium">Individual Elements:</div>
                        {group.parts.map(partName => {
                          const partLabel = partName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          const isVisible = component.visibility[partName] !== false;
                          
                          return (
                            <div key={partName} className="flex items-center justify-between">
                              <Label 
                                className="text-xs text-gray-600 cursor-pointer flex-1"
                                onClick={() => handlePartToggle(partName, !isVisible)}
                              >
                                {partLabel}
                              </Label>
                              <Switch
                                checked={isVisible}
                                onCheckedChange={(checked) => handlePartToggle(partName, checked)}
                                className="scale-75"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShowAll}
            className="flex-1"
          >
            Show All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleHideAll}
            className="flex-1"
          >
            Hide All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
