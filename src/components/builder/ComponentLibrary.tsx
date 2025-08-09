import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, ChevronLeft } from 'lucide-react';

interface ComponentLibraryProps {
  onAddComponent: (type: string) => void;
  language?: 'en' | 'fr' | 'ar';
  onToggleSidebar?: () => void;
  showToggle?: boolean;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onAddComponent,
  language = 'en',
  onToggleSidebar,
  showToggle = false
}) => {

  const componentTypes = [
    {
      type: 'hero',
      name: 'Hero',
      icon: '🎯',
      variations: 6,
    },
    {
      type: 'features',
      name: 'Features',
      icon: '⭐',
      variations: 6,
      
    },
    {
      type: 'testimonials',
      name: 'Testimonials',
      icon: '💬',
      variations: 6,
    },
    {
      type: 'pricing',
      name: 'Pricing',
      icon: '💰',
      variations: 6,
    },
    {
      type: 'faq',
      name: 'FAQ',
      icon: '❓',
      variations: 6,
    },
    {
      type: 'cta',
      name: 'CTA',
      icon: '🚀',
      variations: 3,
    }
  ];

  return (
    <div className="h-full bg-gradient-to-br from-white to-brand-cotton-candy-pink/5 flex flex-col font-poppins">
      {/* Header - Fixed */}
      <div className="p-6 border-b border-brand-lavender-gray/20 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-medium-violet to-brand-deep-indigo rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-deep-indigo">Component Library</h2>
           
            </div>
          </div>
          
          {/* Toggle Button */}
          {showToggle && onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8 hover:bg-brand-cotton-candy-pink/20 text-brand-medium-violet"
              title="Close Component Library (Ctrl+B)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {componentTypes.map((component, index) => (
            <Card 
              key={component.type} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-brand-lavender-gray/20 hover:border-brand-medium-violet/30 bg-white/90 backdrop-blur-sm hover:bg-white"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-start p-5">
                  {/* Icon/Preview */}
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-light-cream via-brand-cotton-candy-pink/30 to-brand-lavender-gray/20 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <span className="text-2xl filter drop-shadow-sm">{component.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-brand-deep-indigo text-base mb-1 group-hover:text-brand-medium-violet transition-colors">
                          {component.name}
                        </h3>
                        
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => onAddComponent(component.type)}
                        className="bg-gradient-to-r from-brand-medium-violet to-brand-deep-indigo hover:from-brand-deep-indigo hover:to-brand-medium-violet text-white border-0 ml-3 flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                        title={`Add ${component.name}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        
                      </Button>
                    </div>
                    
                    {/* Metadata */}
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-brand-lavender-gray/20 text-brand-deep-indigo/80 border-brand-lavender-gray/30 hover:bg-brand-lavender-gray/30 font-medium"
                      >
                        {component.variations} variations
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Bottom spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};
