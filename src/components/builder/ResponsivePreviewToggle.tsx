import React from 'react';
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor } from 'lucide-react';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

interface ResponsivePreviewToggleProps {
  currentViewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
  className?: string;
}

export const ResponsivePreviewToggle: React.FC<ResponsivePreviewToggleProps> = ({
  currentViewport,
  onViewportChange,
  className = ""
}) => {
  const viewports = [
    { key: 'mobile' as ViewportSize, icon: Smartphone, size: '375px' },
    { key: 'tablet' as ViewportSize, icon: Tablet, size: '768px' },
    { key: 'desktop' as ViewportSize, icon: Monitor, size: '1440px' }
  ];

  const isDark = className.includes('bg-gray-800') || className.includes('bg-brand-medium-violet');

  return (
    <div className={`flex items-center space-x-1 rounded-xl p-1 backdrop-blur-sm font-poppins ${className || 'bg-brand-lavender-gray/10'}`}>
      {viewports.map(({ key, icon: Icon, size }) => (
        <Button
          key={key}
          size="sm"
          variant={currentViewport === key ? 'default' : 'ghost'}
          onClick={() => onViewportChange(key)}
          className={`px-3 py-2 text-xs font-medium transition-all duration-200 rounded-lg ${
            currentViewport === key 
              ? 'bg-gradient-to-r from-brand-medium-violet to-brand-deep-indigo text-white shadow-lg transform scale-105' 
              : isDark 
                ? 'text-brand-light-cream/80 hover:text-brand-light-cream hover:bg-white/10 hover:scale-105' 
                : 'text-brand-deep-indigo/70 hover:text-brand-deep-indigo hover:bg-brand-cotton-candy-pink/20 hover:scale-105'
          }`}
          title={`(${size})`}
        >
          <Icon className="h-3 w-3 mr-1" />
          
        </Button>
      ))}
    </div>
  );
};
