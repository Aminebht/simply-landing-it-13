import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const isUpdatingRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sync with external color prop changes only when not updating internally
  useEffect(() => {
    if (!isUpdatingRef.current && color !== localColor) {
      setLocalColor(color);
    }
  }, [color, localColor]);
  
  // Convert any input to hex format or preserve 'transparent'
  const getHexFromInput = (input: string): string => {
    if (!input) return 'transparent';
    if (input === 'transparent') return 'transparent';
    
    // If it's already hex, return it
    if (input.startsWith('#')) {
      return input;
    }
    
    // Common Tailwind to hex mappings for backwards compatibility
    const tailwindToHex: { [key: string]: string } = {
      'white': '#ffffff',
      'black': '#000000',
      'bg-white': '#ffffff',
      'bg-black': '#000000',
      'text-white': '#ffffff',
      'text-black': '#000000',
      'border-white': '#ffffff',
      'border-black': '#000000',
      
      // Blue shades
      'bg-blue-50': '#eff6ff',
      'bg-blue-100': '#dbeafe',
      'bg-blue-500': '#3b82f6',
      'bg-blue-600': '#2563eb',
      
      // Red shades
      'bg-red-50': '#fef2f2',
      'bg-red-100': '#fee2e2',
      'bg-red-200': '#fecaca',
      'bg-red-300': '#fca5a5',
      'bg-red-400': '#f87171',
      'bg-red-500': '#ef4444',
      'bg-red-600': '#dc2626',
      'bg-red-700': '#b91c1c',
      'bg-red-800': '#991b1b',
      'bg-red-900': '#7f1d1d',
      
      // Green shades
      'bg-green-50': '#f0fdf4',
      'bg-green-100': '#dcfce7',
      'bg-green-200': '#bbf7d0',
      'bg-green-300': '#86efac',
      'bg-green-400': '#4ade80',
      'bg-green-500': '#22c55e',
      'bg-green-600': '#16a34a',
      'bg-green-700': '#15803d',
      'bg-green-800': '#166534',
      'bg-green-900': '#14532d',
      
      // Purple shades
      'bg-purple-50': '#faf5ff',
      'bg-purple-100': '#f3e8ff',
      'bg-purple-200': '#e9d5ff',
      'bg-purple-300': '#d8b4fe',
      'bg-purple-400': '#c084fc',
      'bg-purple-500': '#a855f7',
      'bg-purple-600': '#9333ea',
      'bg-purple-700': '#7c3aed',
      'bg-purple-800': '#6b21a8',
      'bg-purple-900': '#581c87',
      
      // Gray shades
      'bg-gray-50': '#f9fafb',
      'bg-gray-100': '#f3f4f6',
      'bg-gray-200': '#e5e7eb',
      'bg-gray-300': '#d1d5db',
      'bg-gray-400': '#9ca3af',
      'bg-gray-500': '#6b7280',
      'bg-gray-600': '#4b5563',
      'bg-gray-700': '#374151',
      'bg-gray-800': '#1f2937',
      'bg-gray-900': '#111827',
      
      // Text colors
      'text-blue-500': '#3b82f6',
      'text-red-500': '#ef4444',
      'text-green-500': '#22c55e',
      'text-purple-500': '#a855f7',
      'text-gray-500': '#6b7280',
      'text-gray-600': '#4b5563',
      'text-gray-700': '#374151',
      'text-gray-800': '#1f2937',
      'text-gray-900': '#111827',
      
      // Border colors
      'border-blue-500': '#3b82f6',
      'border-red-500': '#ef4444',
      'border-green-500': '#22c55e',
      'border-purple-500': '#a855f7',
      'border-gray-200': '#e5e7eb',
      'border-gray-300': '#d1d5db',
      'border-gray-500': '#6b7280'
    };
    
    return tailwindToHex[input] || 'transparent';
  };

  // Get the current display value
  const currentDisplayValue = localColor === 'transparent' ? 'transparent' : getHexFromInput(localColor);
  
  const handleLocalColorChange = useCallback((newColor: string) => {
    // Update local state immediately for responsive UI
    setLocalColor(newColor);
    
    // Set flag to prevent external updates from interfering
    isUpdatingRef.current = true;
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce the parent update to prevent vibrating
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(newColor);
      isUpdatingRef.current = false;
    }, 100);
  }, [onChange]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === 'transparent' || value === '') {
      handleLocalColorChange('transparent');
    } else {
      handleLocalColorChange(value);
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  // This function applies final color immediately and closes the popover
  const handleFinalColorChange = () => {
    // Clear any pending debounced update and apply immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    onChange(localColor);
    isUpdatingRef.current = false;
    setIsOpen(false);
  };
  
  // When closing the popover, apply the final color
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Apply final color when closing
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      onChange(localColor);
      isUpdatingRef.current = false;
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 p-1 border-2"
          >
            <div className="flex items-center space-x-2 w-full">
              <div className="relative w-6 h-6 rounded border border-gray-300">
                {currentDisplayValue === 'transparent' ? (
                  <div className="absolute inset-0 bg-checkerboard" />
                ) : (
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: currentDisplayValue }}
                  />
                )}
                {currentDisplayValue === 'transparent' && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">T</div>
                )}
              </div>
              <span className="text-sm text-gray-600 flex-1 text-left">
                {currentDisplayValue}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 mb-2">
              <button
                onClick={() => handleLocalColorChange('transparent')}
                className={`p-1 border rounded ${currentDisplayValue === 'transparent' ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
                title="Transparent"
              >
                <div className="w-8 h-8 relative">
                  <div className="absolute inset-0 bg-checkerboard" />
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">T</div>
                </div>
              </button>
            </div>
            <HexColorPicker 
              color={currentDisplayValue === 'transparent' ? '#00000000' : currentDisplayValue} 
              onChange={(color) => handleLocalColorChange(color)} 
            />
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={currentDisplayValue}
                onChange={handleInputChange}
                className="px-2 py-1 text-xs border rounded w-24 font-mono"
                placeholder="transparent"
              />
              <Button size="sm" onClick={handleFinalColorChange}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Add checkerboard background pattern for transparent preview
const styles = `
  .bg-checkerboard {
    background-image: 
      linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
      linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
      linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  }
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
