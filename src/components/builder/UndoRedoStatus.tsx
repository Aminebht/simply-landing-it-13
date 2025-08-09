import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Redo } from 'lucide-react';

interface UndoRedoStatusProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const UndoRedoStatus: React.FC<UndoRedoStatusProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <div className="flex items-center gap-1 bg-brand-lavender-gray/10 rounded-xl p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="flex items-center gap-1 text-brand-deep-indigo/70 hover:text-brand-deep-indigo hover:bg-brand-cotton-candy-pink/20 disabled:text-brand-deep-indigo/30 transition-all duration-200 h-8 px-2"
      >
        <Undo className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">Undo</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="flex items-center gap-1 text-brand-deep-indigo/70 hover:text-brand-deep-indigo hover:bg-brand-cotton-candy-pink/20 disabled:text-brand-deep-indigo/30 transition-all duration-200 h-8 px-2"
      >
        <Redo className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">Redo</span>
      </Button>
    </div>
  );
};
