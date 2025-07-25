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
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="flex items-center gap-1"
      >
        <Undo className="h-4 w-4" />
        <span className="hidden sm:inline">Undo</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="flex items-center gap-1"
      >
        <Redo className="h-4 w-4" />
        <span className="hidden sm:inline">Redo</span>
      </Button>
    </div>
  );
};
