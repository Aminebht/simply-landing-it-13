import { LandingPageComponent, CustomizableStyles } from '@/types/components';
import { getVariationDefaults } from './defaultStyles';

// Helper to get element-specific content field name
export const getElementContentField = (elementId: string | null): string | null => {
  if (!elementId) return null;
  
  const elementFieldMap: Record<string, string> = {
    'headline': 'headline',
    'subheadline': 'subheadline',
    'badge': 'badge',
    'cta-button': 'ctaButton',
    'secondary-button': 'secondaryButton',
    'price': 'price',
    'price-label': 'priceLabel',
    'feature-1': 'feature1',
    'feature-2': 'feature2',
    'feature-3': 'feature3',
    'rating': 'rating',
    'downloads': 'downloads',
    'book-title-1': 'bookTitle1',
    'book-title-2': 'bookTitle2',
    'book-subtitle': 'bookSubtitle',
    'book-author': 'bookAuthor',
    'book-year': 'bookYear',
    'floating-price': 'floatingPrice',
  };
  
  return elementFieldMap[elementId] || null;
};

// Get user-friendly element name
export const getElementDisplayName = (elementId: string | null): string => {
  if (!elementId) return 'Component';
  
  const displayNames: Record<string, string> = {
    'container': 'Container',
    'headline': 'Headline',
    'subheadline': 'Subheadline',
    'badge': 'Badge',
    'cta-button': 'CTA Button',
    'secondary-button': 'Secondary Button',
    'price': 'Price',
    'price-label': 'Price Label',
    'feature-1': 'Feature 1',
    'feature-2': 'Feature 2',
    'feature-3': 'Feature 3',
    'rating': 'Rating',
    'downloads': 'Downloads',
    'book-title-1': 'Book Title 1',
    'book-title-2': 'Book Title 2',
    'book-subtitle': 'Book Subtitle',
    'book-author': 'Book Author',
    'book-year': 'Book Year',
    'floating-price': 'Floating Price',
  };
  
  return displayNames[elementId] || elementId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to extract variation number from component
export const getVariationNumber = (component: LandingPageComponent): string => {
  if (!component) return '1';
  
  if (component.component_variation?.variation_number) {
    return component.component_variation.variation_number.toString();
  }
  
  if (!component.component_variation_id) return '1';
  
  const parts = component.component_variation_id.split('-');
  if (parts.length === 2) {
    return parts[1] || '1';
  }
  
  return '1';
};

// Helper to get component type from a component
export const getComponentType = (component: LandingPageComponent, variations: any[]): string => {
  if (!component) return 'hero';
  
  if (component.component_variation?.component_type) {
    return component.component_variation.component_type;
  } 
  
  if (component.component_variation_id?.includes('-') && 
      component.component_variation_id.split('-')[0].length < 10) {
    return component.component_variation_id.split('-')[0];
  }
  
  const matchingVar = variations.find(variation => {
    if (variation.id === component.component_variation_id) {
      return true;
    }
    
    const idParts = component.component_variation_id?.split('-');
    if (idParts && idParts.length === 2) {
      const uuid = idParts[0];
      if (variation.id === uuid || variation.id.includes(uuid)) {
        return true;
      }
    }
    return false;
  });
  
  if (matchingVar) {
    return matchingVar.component_type;
  }
  
  return 'hero';
};

// Create style value getter factory
export const createStyleValueGetter = (
  component: LandingPageComponent | null,
  selectedElementId: string | null,
  variations: any[]
) => {
  return (property: keyof CustomizableStyles, defaultValue: any = '') => {
    if (!component) return defaultValue;
    
    const targetElementKey = selectedElementId || 'container';
    const elementStyles = component.custom_styles?.[targetElementKey] || {};
    
    if (elementStyles[property] !== undefined) {
      return elementStyles[property];
    }
    
    const componentType = getComponentType(component, variations);
    const variationNumber = parseInt(getVariationNumber(component));
    const primaryColor = component.custom_styles?.container?.primaryColor || '#2563e0';
    
    const defaults = getVariationDefaults(componentType, variationNumber, targetElementKey, primaryColor);
    
    return defaults[property] ?? defaultValue;
  };
};

// Convert style values for display
export const getDisplayStyleValue = (value: any, defaultValue: string): string => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}px`;
  if (Array.isArray(value)) return `${value[0]}px`;
  return defaultValue;
};

// Convert style values to numbers
export const getNumericStyleValue = (value: any, defaultValue: number): number => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseInt(value.replace('px', '')) || defaultValue;
  if (Array.isArray(value)) return value[0] || defaultValue;
  return defaultValue;
};