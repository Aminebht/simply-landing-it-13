import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DirectionToggleProps {
  currentDirection: 'ltr' | 'rtl';
  onToggle: () => void;
}

export const DirectionToggle: React.FC<DirectionToggleProps> = ({ 
  currentDirection, 
  onToggle 
}) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
      title={`Switch components to ${currentDirection === 'ltr' ? 'RTL (Right to Left)' : 'LTR (Left to Right)'} direction`}
    >
      {currentDirection === 'ltr' ? (
        <>
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">LTR</span>
        </>
      ) : (
        <>
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm font-medium">RTL</span>
        </>
      )}
    </Button>
  );
};