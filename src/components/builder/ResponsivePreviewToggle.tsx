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
    { key: 'mobile' as ViewportSize, icon: Smartphone, label: 'Mobile', size: '375px' },
    { key: 'tablet' as ViewportSize, icon: Tablet, label: 'Tablet', size: '768px' },
    { key: 'desktop' as ViewportSize, icon: Monitor, label: 'Desktop', size: '1440px' }
  ];

  const isDark = className.includes('bg-gray-800');

  return (
    <div className={`flex items-center space-x-1 rounded-lg p-1 ${className || 'bg-gray-100'}`}>
      {viewports.map(({ key, icon: Icon, label, size }) => (
        <Button
          key={key}
          size="sm"
          variant={currentViewport === key ? 'default' : 'ghost'}
          onClick={() => onViewportChange(key)}
          className={`px-2 py-1 text-xs transition-all ${
            currentViewport === key 
              ? 'bg-blue-600 text-white shadow-sm' 
              : isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
          title={`${label} (${size})`}
        >
          <Icon className="h-3 w-3" />
        </Button>
      ))}
    </div>
  );
};
