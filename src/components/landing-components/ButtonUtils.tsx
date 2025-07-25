import React from 'react';
import { SelectableElement } from '@/components/builder/SelectableElement';

// Shared button click handler
export function handleButtonClick(action: any, isEditing: boolean, e: React.MouseEvent) {
  if (isEditing || !action) return;
  e.preventDefault();
  switch (action.type) {
    case 'open_link':
      if (action.url) {
        let url = action.url;
        if (url && !/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        window.open(url, action.newTab ? '_blank' : '_self');
      }
      break;
    case 'scroll':
      if (action.targetId) {
        const el = document.getElementById(action.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn('[Button Scroll Debug] No element found for targetId:', action.targetId);
        }
      }
      break;
    case 'checkout':
      // Implement your checkout logic here
      console.log('Button checkout action triggered');
      break;
    default:
      break;
  }
}

// Props for rendering a CTA button
export interface RenderButtonProps {
  action: any;
  isEditing: boolean;
  content: string;
  elementId: string;
  selectedElementId?: string;
  onSelect?: (id: string) => void;
  onContentChange?: (field: string, value: string) => void;
  contentField: string;
  className: string;
  style?: React.CSSProperties;
  as?: 'primary' | 'secondary';
  viewport?: string;
}

export function renderButton({
  action,
  isEditing,
  content,
  elementId,
  selectedElementId,
  onSelect,
  onContentChange,
  contentField,
  className,
  style,
  as = 'primary',
  viewport
}: RenderButtonProps) {
  if (action?.type === 'open_link' && !isEditing) {
    let url = action.url || '#';
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return (
      <a
        href={url}
        target={action.newTab ? '_blank' : '_self'}
        rel={action.newTab ? 'noopener noreferrer' : undefined}
        className={className}
        style={style}
      >
        {content}
      </a>
    );
  }
  return (
    <SelectableElement
      elementId={elementId}
      isSelected={selectedElementId === elementId}
      isEditing={isEditing}
      onSelect={onSelect}
      onContentChange={onContentChange}
      contentField={contentField}
      isContentEditable={true}
      className={className}
      style={style}
      onClick={!isEditing ? (e => handleButtonClick(action, isEditing, e)) : undefined}
    >
      {content}
    </SelectableElement>
  );
} 