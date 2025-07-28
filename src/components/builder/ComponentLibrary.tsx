import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from 'lucide-react';

interface ComponentLibraryProps {
  onAddComponent: (type: string) => void;
  language?: 'en' | 'fr' | 'ar';
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onAddComponent,
  language = 'en'
}) => {

  const componentTypes = [
    {
      type: 'hero',
      name: 'Hero Section',
      icon: '🎯',
      variations: 6
    },
    {
      type: 'features',
      name: 'Features',
      icon: '⭐',
      variations: 6
    },
    {
      type: 'testimonials',
      name: 'Testimonials',
      icon: '💬',
      variations: 6
    },
    {
      type: 'pricing',
      name: 'Pricing',
      icon: '💰',
      variations: 6
    },
    {
      type: 'faq',
      name: 'FAQ',
      icon: '❓',
      variations: 6
    },
    {
      type: 'cta',
      name: 'Call to Action',
      icon: '🚀',
      variations: 6
    }
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header - Fixed */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Component Library</h2>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {componentTypes.map((component) => (
            <Card key={component.type} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-start p-4">
                  {/* Icon/Preview */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-2xl">{component.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {component.name}
                        </h3>
                        
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => onAddComponent(component.type)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 ml-3 flex-shrink-0"
                        variant="outline"
                        title={`Add ${component.name}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                    
                      </Button>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {component.variations} variations
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
