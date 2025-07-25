import React, { ReactNode, useRef, useCallback, useEffect } from 'react';

interface SelectableElementProps {
  elementId: string;
  isSelected?: boolean;
  isEditing?: boolean;
  onSelect?: (elementId: string) => void;
  onContentChange?: (field: string, value: any) => void;
  onStyleChange?: (elementId: string, styles: Record<string, any>) => void;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  contentField?: string;
  isContentEditable?: boolean;
  onClick?: (e: React.MouseEvent) => void; // <-- Add this
}

export const SelectableElement: React.FC<SelectableElementProps> = ({
  elementId,
  isSelected = false,
  isEditing = false,
  onSelect,
  onContentChange,
  onStyleChange,
  children,
  className = '',
  style = {},
  contentField,
  isContentEditable = false,
  onClick // <-- Add this
}) => {
  const lastContentRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingChange = useRef<boolean>(false);
  const lastEventType = useRef<string>('');
  const elementRef = useRef<HTMLDivElement>(null);

  // Helper function to save cursor position
  const saveCursorPosition = useCallback(() => {
    if (!elementRef.current) return null;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(elementRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  }, []);

  // Helper function to restore cursor position
  const restoreCursorPosition = useCallback((position: number) => {
    if (!elementRef.current || position === null) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    const range = document.createRange();
    let charCount = 0;
    let nodeWalker = document.createTreeWalker(
      elementRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node = nodeWalker.nextNode();
    let found = false;
    
    while (node && !found) {
      const nodeLength = node.textContent?.length || 0;
      if (charCount + nodeLength >= position) {
        range.setStart(node, position - charCount);
        range.setEnd(node, position - charCount);
        found = true;
      } else {
        charCount += nodeLength;
        node = nodeWalker.nextNode();
      }
    }
    
    if (found) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (isEditing) {
      e.stopPropagation();
      onSelect?.(elementId);
    }
  };

  const triggerContentChange = useCallback((newContent: string, eventType: string = '') => {
    if (contentField && onContentChange && !isProcessingChange.current) {
      // Initialize lastContentRef if it hasn't been set yet
      if (lastContentRef.current === '' && newContent) {
        lastContentRef.current = newContent;
        return; // Don't trigger change for initialization
      }
      
      if (newContent !== lastContentRef.current) {
        isProcessingChange.current = true;
        lastEventType.current = eventType;
        
        // Track timing for blur event coordination
        if (eventType.startsWith('input')) {
          (window as any).lastInputTime = Date.now();
        }
        
        console.log(`[${contentField}] Content changed from:`, lastContentRef.current, 'to:', newContent, `(${eventType})`);
        lastContentRef.current = newContent;
        onContentChange(contentField, newContent);
        
        // Reset processing flag after a short delay
        setTimeout(() => {
          isProcessingChange.current = false;
          lastEventType.current = '';
        }, 150); // Slightly longer for emoji picker
      }
    }
  }, [contentField, onContentChange]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (contentField && onContentChange && !isProcessingChange.current) {
      // Use innerText instead of textContent for better emoji handling
      const newContent = e.currentTarget.innerText || '';
      
      // Only trigger blur if we haven't recently processed an input event
      const timeSinceLastChange = Date.now() - (window as any).lastInputTime || 0;
      if (timeSinceLastChange > 200) { // 200ms grace period
        triggerContentChange(newContent, 'blur');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isContentEditable && isSelected) {
      // Allow text editing shortcuts
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.currentTarget.blur(); // Trigger onBlur to save changes
      }
      // Prevent undo/redo shortcuts when editing text
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
        e.stopPropagation();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (isContentEditable && isSelected && contentField && onContentChange && !isProcessingChange.current) {
      e.preventDefault();
      const paste = e.clipboardData.getData('text');
      
      // Save cursor position before making changes
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      
      // Replace the entire content with the pasted text
      e.currentTarget.innerText = paste;
      
      // Restore cursor position to the end
      if (selection && range) {
        const newRange = document.createRange();
        newRange.selectNodeContents(e.currentTarget);
        newRange.collapse(false); // Collapse to end
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      // Trigger content change immediately
      triggerContentChange(paste, 'paste');
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (contentField && onContentChange && !isProcessingChange.current) {
      // Save cursor position before processing
      const cursorPosition = saveCursorPosition();
      
      // Use innerText instead of textContent for better emoji handling
      const newContent = e.currentTarget.innerText || '';
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Check if this is likely an emoji insertion (emoji picker or direct typing)
      // Emojis from picker typically result in short content or single character addition
      const isLikelyEmoji = newContent.length <= 5 || 
                           (lastContentRef.current && Math.abs(newContent.length - lastContentRef.current.length) === 1);
      
      if (isLikelyEmoji) {
        // For emojis, trigger change immediately but with a small delay to allow DOM to settle
        setTimeout(() => {
          if (!isProcessingChange.current) {
            triggerContentChange(newContent, 'input-emoji');
            // Restore cursor position after content change
            setTimeout(() => restoreCursorPosition(cursorPosition || newContent.length), 5);
          }
        }, 10);
      } else {
        // For longer content, use debouncing
        timeoutRef.current = setTimeout(() => {
          triggerContentChange(newContent, 'input-text');
          // Restore cursor position after content change
          setTimeout(() => restoreCursorPosition(cursorPosition || newContent.length), 5);
        }, 300);
      }
    }
  };

  // Initialize content reference when component mounts
  useEffect(() => {
    if (isContentEditable && contentField && children) {
      // Extract text content from children - use innerText for emojis
      const textContent = typeof children === 'string' ? children : 
                         React.Children.toArray(children).join('');
      lastContentRef.current = textContent;
    }
  }, [isContentEditable, contentField, children]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const selectionStyles = isEditing ? {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    ...(isSelected ? {
      outline: '2px solid #3b82f6',
      outlineOffset: '2px',
    } : {
      outline: 'none',
    })
  } : {};

  const hoverStyles = isEditing && !isSelected ? {
    ':hover': {
      outline: '1px dashed #94a3b8',
      outlineOffset: '1px'
    }
  } : {};

  return (
    <div
      ref={elementRef}
      className={`${className} ${isEditing ? 'group' : ''}`}
      style={{
        ...style,
        ...selectionStyles,
        position: 'relative'
      }}
      onClick={handleClick}
      contentEditable={isEditing && isContentEditable && isSelected}
      onBlur={isContentEditable ? handleContentChange : undefined}
      onInput={isContentEditable ? handleInput : undefined}
      onPaste={isContentEditable ? handlePaste : undefined}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning={true}
    >
      {children}
    </div>
  );
};

export default SelectableElement;
