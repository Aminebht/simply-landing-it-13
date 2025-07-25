import React, { useState, useCallback, useEffect } from 'react';
import { LandingPageComponent, CustomizableStyles, ComponentVariation } from '@/types/components';
import { ThemeConfig } from '@/types/landing-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from './ColorPicker';
import { VisibilityControls } from './VisibilityControls';
import { Eye, EyeOff, Palette, Type, Layout, Settings, Shuffle, Image } from 'lucide-react';

interface VisualEditorProps {
  selectedComponent: LandingPageComponent | null;
  selectedElementId?: string | null;
  onUpdateComponent: (componentId: string, updates: Partial<LandingPageComponent>) => void;
  onUpdateStyles: (componentId: string, styles: Record<string, CustomizableStyles>) => void;
  onUpdateVisibility: (componentId: string, visibility: Record<string, boolean>) => void;
  onChangeVariation?: (componentId: string, newVariation: number) => void;
  componentVariations?: ComponentVariation[];
  language?: 'en' | 'fr' | 'ar';
  allSections: LandingPageComponent[];
  onSave?: () => Promise<void>;
  globalTheme?: ThemeConfig | null;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  selectedComponent,
  selectedElementId,
  onUpdateComponent,
  onUpdateStyles,
  onUpdateVisibility,
  onChangeVariation,
  componentVariations = [],
  language = 'en',
  allSections,
  onSave,
  globalTheme
}) => {
  // Define all React hooks first, regardless of whether selectedComponent exists
  const [activeTab, setActiveTab] = useState('styles');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  
  // Define all callbacks - these must be defined even if they won't be used
  const handleVariationChange = useCallback((newVariation: number) => {
    if (!selectedComponent || !onChangeVariation) return;
    
    // When changing variation, we need to know which component type we're working with
    let componentType = '';
    
    // 1. First try to get it from the joined component_variation data (most reliable)
    if (selectedComponent.component_variation?.component_type) {
      componentType = selectedComponent.component_variation.component_type;
    } 
    // 2. Try to find the component type from matching component variations
    else {
      // Look for a variation that matches this component
      const matchingVariation = componentVariations.find(v => 
        v.id === selectedComponent.component_variation_id
      );
      
      if (matchingVariation) {
        componentType = matchingVariation.component_type;
      }
    }
    
    // Find the new variation metadata from the database
    const variationMetadata = componentVariations.find(v => 
      v.component_type === componentType && v.variation_number === newVariation
    );

    if (!variationMetadata) {
      console.error('Could not find variation metadata for', { componentType, newVariation });
      return;
    }

    // Log for debugging
    console.log('Changing variation:', {
      componentId: selectedComponent.id,
      componentType,
      fromVariation: selectedComponent.component_variation_id,
      toVariation: variationMetadata.id, // Use the UUID from variationMetadata
      metadata: variationMetadata
    });
        
    onChangeVariation(selectedComponent.id, newVariation);
  }, [selectedComponent, onChangeVariation, componentVariations]);

  const handleContentChange = useCallback((field: string, value: any) => {
    if (!selectedComponent) return;
    
    const updatedContent = {
      ...selectedComponent.content,
      [field]: value
    };
    
    onUpdateComponent(selectedComponent.id, { content: updatedContent });
  }, [selectedComponent, onUpdateComponent]);

  const handleStyleChange = useCallback((styleProperty: string, value: any) => {
    if (!selectedComponent) return;
    
    // Determine target element key: use selected element or 'container' as default
    const targetElementKey = selectedElementId || 'container';
    
    // Only send the specific element's style changes, not the entire custom_styles object
    const elementStyleChange = {
      [targetElementKey]: {
        [styleProperty]: value
      }
    };
    
    console.log('VisualEditor: handleStyleChange - updating custom_styles for', targetElementKey, 'with', styleProperty, '=', value);
    console.log('VisualEditor: Sending element style change:', JSON.stringify(elementStyleChange));
    
    // Pass only the specific element changes to the handler for merging
    onUpdateStyles(selectedComponent.id, elementStyleChange);
  }, [selectedComponent, selectedElementId, onUpdateStyles]);

  // Helper function to handle gradient updates - saves gradient under 'backgroundColor' key only
  const handleGradientChange = useCallback((gradientValue: string) => {
    if (!selectedComponent) return;
    
    const targetElementKey = selectedElementId || 'container';
    
    // Save gradient under backgroundColor key only for consistency with solid colors
    const elementStyleChange = {
      [targetElementKey]: {
        backgroundColor: gradientValue,
        // Clear the background property to avoid conflicts
        background: ''
      }
    };
    
    console.log('VisualEditor: handleGradientChange - saving gradient under backgroundColor:', gradientValue);
    
    onUpdateStyles(selectedComponent.id, elementStyleChange);
  }, [selectedComponent, selectedElementId, onUpdateStyles]);

  const handleVisibilityChange = useCallback((elementKey: string, isVisible: boolean) => {
    if (!selectedComponent) return;
    
    const updatedVisibility = {
      ...selectedComponent.visibility,
      [elementKey]: isVisible
    };
    
    onUpdateVisibility(selectedComponent.id, updatedVisibility);
  }, [selectedComponent, onUpdateVisibility]);

  const handleBulkVisibilityChange = useCallback((visibilityChanges: Record<string, boolean>) => {
    if (!selectedComponent) return;
    
    const updatedVisibility = {
      ...selectedComponent.visibility,
      ...visibilityChanges
    };
    
    onUpdateVisibility(selectedComponent.id, updatedVisibility);
  }, [selectedComponent, onUpdateVisibility]);

  // Initialize background type based on current component state
  // Remove useEffect that sets backgroundType

  // Auto-select styles tab when component or element changes
  useEffect(() => {
    setActiveTab('styles');
  }, [selectedComponent?.id, selectedElementId]);

  // Check if we're editing a container
  const isEditingContainer = selectedElementId === 'container' || selectedElementId === null;

  // Helper functions that don't depend on hooks
  // Get element-specific content field name
  const getElementContentField = (elementId: string | null) => {
    if (!elementId) return null;
    
    // Map element IDs to content field names
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
      // Add more mappings as needed
    };
    
    return elementFieldMap[elementId] || null;
  };

  // Get user-friendly element name
  const getElementDisplayName = (elementId: string | null) => {
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
      // Add more mappings as needed
    };
    
    return displayNames[elementId] || elementId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Helper to extract variation number from component
  const getVariationNumber = (component: LandingPageComponent): string => {
    // Safety check for undefined component
    if (!component) return '1';
    
    // Extract variation number for display
    if (component.component_variation?.variation_number) {
      return component.component_variation.variation_number.toString();
    }
    
    if (!component.component_variation_id) return '1';
    
    // Handle UUID format with variation number as second part
    const parts = component.component_variation_id.split('-');
    if (parts.length === 2) {
      return parts[1] || '1';
    }
    
    return '1';
  };
  
  // Helper to get component type from a component
  const getComponentType = (component: LandingPageComponent, variations: ComponentVariation[]): string => {
    // Safety check for undefined component
    if (!component) return 'hero'; // Default fallback
    
    // 1. Check joined component_variation data first (most reliable)
    if (component.component_variation?.component_type) {
      return component.component_variation.component_type;
    } 
    
    // 2. Try to extract from legacy format (type-variation)
    if (component.component_variation_id?.includes('-') && 
        component.component_variation_id.split('-')[0].length < 10) {
      return component.component_variation_id.split('-')[0];
    }
    
    // 3. Try to find from matching variations
    const matchingVar = variations.find(variation => {
      if (variation.id === component.component_variation_id) {
        return true;
      }
      
      // Check UUID with variation format
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
    
    // Default fallback
    return 'hero';
  };


  // Add at the top of the VisualEditor component (inside the function, before return)
  const [ctaActionType, setCtaActionType] = useState('open_link');
  const [ctaUrl, setCtaUrl] = useState('');
  const [ctaNewTab, setCtaNewTab] = useState(false);
  const [ctaTargetId, setCtaTargetId] = useState('');

  // Secondary button action state
  const [secondaryActionType, setSecondaryActionType] = useState('open_link');
  const [secondaryUrl, setSecondaryUrl] = useState('');
  const [secondaryNewTab, setSecondaryNewTab] = useState(false);
  const [secondaryTargetId, setSecondaryTargetId] = useState('');

  useEffect(() => {
    if (selectedElementId === 'cta-button') {
      const customActions = selectedComponent?.custom_actions || {};
      const ctaAction = customActions['cta-button'] || { type: 'open_link' };
      setCtaActionType(ctaAction.type || 'open_link');
      setCtaUrl(ctaAction.url || '');
      setCtaNewTab(!!ctaAction.newTab);
      setCtaTargetId(ctaAction.targetId || '');
    } else if (selectedElementId === 'secondary-button') {
      const customActions = selectedComponent?.custom_actions || {};
      const secondaryAction = customActions['secondary-button'] || { type: 'open_link' };
      setSecondaryActionType(secondaryAction.type || 'open_link');
      setSecondaryUrl(secondaryAction.url || '');
      setSecondaryNewTab(!!secondaryAction.newTab);
      setSecondaryTargetId(secondaryAction.targetId || '');
    }
  }, [selectedElementId, selectedComponent?.id, selectedComponent?.custom_actions]);

  // Shared action config state for cta-button and secondary-button
  const [buttonActionType, setButtonActionType] = useState('open_link');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonNewTab, setButtonNewTab] = useState(false);
  const [buttonTargetId, setButtonTargetId] = useState('');

  useEffect(() => {
    if (selectedElementId === 'cta-button' || selectedElementId === 'secondary-button') {
      const customActions = selectedComponent?.custom_actions || {};
      const actionKey = selectedElementId === 'cta-button' ? 'cta-button' : 'secondary-button';
      const action = customActions[actionKey] || { type: 'open_link' };
      setButtonActionType(action.type || 'open_link');
      setButtonUrl(action.url || '');
      setButtonNewTab(!!action.newTab);
      setButtonTargetId(action.targetId || '');
    }
  }, [selectedElementId, selectedComponent?.id, selectedComponent?.custom_actions]);

  // Helper function to get variation-aware default styles for different component types
  const getVariationAwareDefaults = useCallback((componentType: string, variationNumber: number, elementKey: string, primaryColor: string) => {
    // COMPREHENSIVE variation-specific defaults based on ACTUAL component code patterns and CSS classes
    // This mapping covers ALL elements found in every hero and CTA variation
    
    // Common default values that apply to most elements when not specified
    const commonDefaults = {
      padding: '0px',
      margin: '0px', 
      borderWidth: '0px',
      borderColor: 'transparent',
      borderStyle: 'solid',
      borderRadius: '0px',
      backgroundColor: 'transparent'
    };
    
    // Element-specific defaults that override common defaults
    const elementTypeDefaults: Record<string, any> = {
      badge: { 
        padding: '6px 12px', borderRadius: '50px', fontSize: 12, fontWeight: 600 
      },
      'cta-button': { 
        padding: '12px 24px', borderRadius: '8px', fontSize: 16, fontWeight: 600 
      },
      'secondary-button': { 
        padding: '12px 24px', borderRadius: '8px', fontSize: 16, fontWeight: 600,
        borderWidth: '2px', backgroundColor: 'transparent'
      },
      container: { 
        padding: '32px 16px', borderRadius: '0px' 
      },
      headline: { 
        fontSize: 32, fontWeight: 700 
      },
      subheadline: { 
        fontSize: 18, fontWeight: 400 
      },
      price: { 
        fontSize: 24, fontWeight: 700 
      },
      'original-price': { 
        fontSize: 14, fontWeight: 400 
      }
    };
    
    const variationDefaults: Record<string, Record<number, Record<string, any>>> = {
      hero: {
        1: {
          // 100% EXACT HeroVariation1 defaults from actual CSS classes in the component
          container: { 
            // containerClassMap: py-8 px-3 (mobile) = 32px 12px, py-16 px-6 (tablet) = 64px 24px, py-24 px-8 (desktop) = 96px 32px
            padding: '12px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent',
            backgroundColor: '#ffffff', color: '#0f172a'
          },
          badge: { 
            // badgeClassMap: px-2 py-1 text-xs (mobile) = 8px 4px 12px, px-3 py-1 text-sm (tablet/desktop) = 12px 4px 14px
            fontSize: 12, fontWeight: 500, color: '#ffffff', backgroundColor: primaryColor || '#2563e0',
            padding: '4px', borderRadius: '50px', borderWidth: '0px', borderColor: 'transparent'
          },
          headline: { 
            // headlineClassMap: text-2xl (mobile) = 24px, text-4xl (tablet) = 36px, text-6xl (desktop) = 60px
            fontSize: 24, fontWeight: 700, color: '#ffffff',
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          },
          subheadline: { 
            // subheadlineClassMap: text-sm (mobile) = 14px, text-lg (tablet) = 18px, text-xl (desktop) = 20px
            fontSize: 14, fontWeight: 400, color: '#d1d5db',
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          },
          price: { 
            // priceClassMap: text-lg (mobile) = 18px, text-2xl (tablet) = 24px, text-3xl (desktop) = 30px, text-green-400
            fontSize: 18, fontWeight: 700, color: primaryColor || '#10b981',
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          },
          'original-price': { 
            // originalPriceClassMap: text-xs (mobile) = 12px, text-sm (tablet) = 14px, text-lg (desktop) = 18px, text-gray-400
            fontSize: 12, fontWeight: 400, color: '#9ca3af',
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          },
          'cta-button': { 
            // ctaButtonClassMap: px-4 py-2.5 text-sm (mobile) = 16px 10px 14px, px-6 py-3 text-base (tablet) = 24px 12px 16px, px-8 py-4 text-base (desktop) = 32px 16px 16px
            fontSize: 14, fontWeight: 600, color: '#ffffff', backgroundColor: primaryColor || '#2563e0',
            padding: '10px', borderRadius: '8px', borderWidth: '0px', borderColor: 'transparent'
          },
          'secondary-button': { 
            // secondaryButtonClassMap: border-2 border-gray-400 text-gray-300, same padding as CTA
            fontSize: 14, fontWeight: 600, color: primaryColor ||'#d1d5db', backgroundColor: 'transparent',
            padding: '10px', borderRadius: '8px', borderWidth: '2px', borderColor: primaryColor || '#9ca3af'
          },
          'product-image': {
            // productImageClassMap: rounded-lg (mobile) = 8px, rounded-xl (tablet) = 12px, rounded-2xl (desktop) = 16px
            padding: '0px', borderRadius: '8px', borderWidth: '0px', borderColor: '#ffffff'
          },
          'price-section': {
            // priceSectionClassMap: flex items-center gap-1.5 (mobile) = 6px, gap-2 (tablet) = 8px, gap-4 (desktop) = 16px
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          },
          'button-section': {
            // buttonSectionClassMap: flex flex-col gap-2.5 (mobile) = 10px, flex-row gap-3 (tablet) = 12px, gap-4 (desktop) = 16px
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          },
          'content-left': {
            // leftContentClassMap: px-2 (mobile) = 8px, px-0 (tablet/desktop) = 0px
            padding: '0px', borderRadius: '0px', borderWidth: '0px', borderColor: 'transparent'
          }
        },
        2: {
          container: { 
            padding: '12px',
          },
          badge: { 
            fontSize: 12,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor || '#d97706',
            padding: '6px',
            borderRadius: '50px',
          },
          headline: { 
            fontSize: 48,
            fontWeight: 700,
            color: '#ffffff'

          },
          subheadline: { 
            fontSize: 16,
            fontWeight: 400,
            color: '#6b7280'
          },
          price: { 
            fontSize: 24,
            fontWeight: 700,
            color: primaryColor || '#d97706', 
          },
          'priceLabel': {
            fontSize: 14,
            color: '#9ca3af',
          },
          'cta-button': { 
            fontSize: 14,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor || '#d97706',
            padding: '12px',
            borderRadius: '8px'
          },
          'secondary-button': { 
            fontSize: 14,
            fontWeight: 600,
            color: primaryColor ||'#d97706',
            padding: '12px',
            borderRadius: '8px',
            borderWidth: '2px',
            borderColor: primaryColor || '#d97706'
          },
          'book-cover': {
            borderRadius: '8px',
          },
          'feature1': {
            fontSize: 14,
            color: '#d1d5db',
          },
          'feature2': {
            fontSize: 14,
            color: '#d1d5db',
          },
          'feature3': {
            fontSize: 14,
            color: '#d1d5db',
          },
          'book-title-1': {
            fontSize: 16,
            fontWeight: 700,
            color: '#111827',
          },
          'book-title-2': {
            fontSize: 18,
            fontWeight: 700,
            color: primaryColor ||'#d97706',
          },
          'book-divider': {
            backgroundColor: primaryColor || '#d97706',
          },
          'book-subtitle': {
            fontSize: 14,
            color: '#6b7280',
          },
          'book-author': {
            fontSize: 12,
            color: '#6b7280',
          },
          'book-year': {
            fontSize: 12,
            color: '#6b7280'
          },
          'reviews': {
            color: '#9ca3af'
          },
          'downloads': {
            color: '#9ca3af'
          }
        },
        3: {
      
          container: {
            padding: '12px',
            backgroundColor: '#ffffff',
            color: '#111827',
          },
     
          badge: { 
            padding: '8px',
            fontSize: 12, 
            fontWeight: 600, 
            color: '#ffffff', 
            backgroundColor: primaryColor || '#4f46e5',
            borderRadius: '50px',
          },
          headline: {
            fontSize: 32,
            fontWeight: 700,
            color: '#ffffff',
          },
          subheadline: {
            fontSize: 16,
            fontWeight: 400,
            color: '#4b5563',
          },
         
        
          'feature-1-icon': {
            backgroundColor: '#e0e7ff',
            color: primaryColor || '#4f46e5',
            borderRadius: '50px',
            fontSize: '18px'
          },
          'feature-2-icon': {
            backgroundColor: '#e0e7ff',
            color: primaryColor || '#4f46e5',
            borderRadius: '50px',
            fontSize: '18px'
          },
          'feature-3-icon': {
            backgroundColor: '#e0e7ff',
            color: primaryColor || '#4f46e5',
            borderRadius: '50px',
            fontSize: '18px'
          },  
          'feature-1-title': {
            fontSize: '18',
            fontWeight: 600,
            color: '#ffffff',
          },
          'feature-2-title': {
            fontSize: '18',
            fontWeight: 600,
            color: '#ffffff',
          },
          'feature-3-title': {
            fontSize: '18',
            fontWeight: 600,
            color: '#ffffff',
          },
          'feature-1-desc': {
            fontSize: '16',
            color: '#4b5563',
          },
          'feature-2-desc': {
            fontSize: '16',
            color: '#4b5563',
          },
          'feature-3-desc': {
            fontSize: '16',
            color: '#4b5563',

          },
          price: { 
            fontSize: 48,
            fontWeight: 700,
            color: primaryColor || '#4f46e5',           
          },
          'price-description': {
            fontSize: '16',
            color: '#4b5563',
          },
          'cta-button': { 
            padding: '12px',
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor || '#4f46e5',
            borderRadius: '8px',
          },
          'secondary-button': { 
            padding: '12px',
            fontSize: 16,
            fontWeight: 600,
            color: primaryColor || '#4f46e5',
            borderRadius: '8px',
            borderWidth: '2px',
            borderColor: primaryColor || '#4f46e5',
          },
          'trust-customers': {
            fontSize: '12',
            color: '#6b7280',
          },
          'trust-rating': {
            fontSize: '12',
            color: '#6b7280',
          },
          'trust-uptime': {
            fontSize: '12',
            color: '#6b7280',
          },
          'dashboard-mockup': {
            borderRadius: '12px',
            padding: '16px',
          }
        },
        4: {
          container: {
            backgroundColor: '#111827',
            color: '#ffffff',
            padding: '12px',

          },
          badge: { 
            fontSize: 12, 
            fontWeight: 600, 
            color: '#ffffff', 
            backgroundColor: primaryColor,
            padding: '6px',
            borderRadius: '50px',
          },
          
          headline: {
            fontSize: '48',
            fontWeight: 700,
            color: '#ffffff',
          },
          subheadline: {
            fontSize: '24',
            color: '#9ca3af',
          },
          price: {
            fontSize: '48',
            fontWeight: 700,
            color: primaryColor,
          },

          'original-price': {
            fontSize: '24',
            color: '#6b7280',
          },
       
          'cta-button': { 
            fontSize: '16',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: primaryColor,
            padding: '12px',
            borderRadius: '8px',
          },
          'secondary-button': { 
            fontSize: '16',
            fontWeight: 600,
            color: '#ffffff',
            padding: '12px',
            borderRadius: '8px',
            borderWidth: '2px',
            borderColor: primaryColor,
          },
          
    
          
          'bottom-text': {
            fontSize: '16',
            color: '#9ca3af',
          },
          'stat1-value': {
            fontSize: '32',
            fontWeight: 700,
            color: '#c084fc', 
          },
          'stat2-value': {
            fontSize: '32',
            fontWeight: 700,
            color: '#f472b6', 
          },
          'stat3-value': {
            fontSize: '32',
            fontWeight: 700,
            color: '#60a5fa',
          },
          'stat1-label': {
            fontSize: '14',
            color: '#9ca3af',
          },
          'stat2-label': {
            fontSize: '14',
            color: '#9ca3af',
          },
          'stat3-label': {
            fontSize: '14',
            color: '#9ca3af',   
          },
          'template-card-1': {
            borderRadius: '16px',
            borderWidth: '1px',
            padding: '16px' 
          },
          'template-card-2': {
            borderRadius: '16px',
            borderWidth: '1px',
            padding: '16px' 
          },
          'template-card-3': {
            borderRadius: '16px',
            borderWidth: '1px',
            padding: '16px' 
          },
          'template1-image': {
            borderRadius: '8px',
          },
          'template2-image': {
            borderRadius: '8px',
          },
          'template3-image': {
            borderRadius: '8px',
          },
          'template-title-1': {
            fontSize: '18',
            fontWeight: 600,
            color: '#ffffff',
          },
          'template-title-2': {
            fontSize: '18',
            fontWeight: 600,
            color: '#ffffff',
          },
          'template-title-3': {
            fontSize: '18',
            fontWeight: 600,
            color: '#ffffff',
          },
          'template-desc-1': {
            fontSize: '14',
            color: '#9ca3af',
          },
          'template-desc-2': {
            fontSize: '14',
            color: '#9ca3af',
          },
          'template-desc-3': {
            fontSize: '14',
            color: '#9ca3af',
          },
        },
        5: {
          container: {
            backgroundColor: '#ffffff',
            color: '#1f2937',
            padding: '16px',
          },
          badge: { 
            fontSize: 14, 
            fontWeight: 600, 
            color: primaryColor || '#065f46', 
            backgroundColor: primaryColor || '#d1fae5',
            padding: '6px',
            borderRadius: '50px',
          },
          headline: {
            fontSize: '48',
            fontWeight: 700,
            color: '#ffffff',
          },
          subheadline: {
            fontSize: '20',
            color:'#4b5563',
          },
          'stat-1-number': {
            fontSize: '32',
            fontWeight: 700,
            color: primaryColor || '#059669',
          },
          'stat-2-number': {
            fontSize: '32',
            fontWeight: 700,
            color: primaryColor || '#059669',
          },
          'stat-3-number': {
            fontSize: '32',
            fontWeight: 700,
            color: primaryColor || '#059669',
          },
          'stat-1-label': {
            fontSize: '14',
            color: '#6b7280'
          },
          'stat-2-label': {
            fontSize: '14',
            color: '#6b7280'
          },
          'stat-3-label': {
            fontSize: '14',
            color: '#6b7280'
          },
          'price': {
            fontSize: '48',
            fontWeight: 700,
            color: primaryColor || '#059669'
          },
          'original-price': {
            fontSize: '18',
            color: '#9ca3af',
          },
          'price-label': {
            fontSize: '18',
            color: '#6b7280'
          },
          'money-back': {
            fontSize: '14',
            color: '#6b7280',
          },
          'cta-button': {
            fontSize: '16',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor || '#059669',
            padding: '12px',
            borderRadius: '8px',
          },
          'secondary-button': {
            fontSize: '16',
            fontWeight: 600,
            color: primaryColor || '#059669',
            padding: '12px',
            borderRadius: '8px',
            borderWidth: '2px',
            borderColor: primaryColor || '#059669',
          },
          'course-preview': {
            borderRadius: '8px',
          },
          'course-info': {
            padding: '24px'
          },
          'course-title': {
            fontSize: '20',
            fontWeight: 700,
            color: '#111827',
          },
          'module-1': {
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          },
          'module-2': {
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          },
          'module-3': {
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          },
          'module-1-number': {
            fontSize: '14',
            fontWeight: 600,
            backgroundColor: primaryColor || '#d1fae5',
            color: primaryColor || '#065f46',
            borderRadius: '50px',
          },
          'module-2-number': {
            fontSize: '14',
            fontWeight: 600,
            backgroundColor: primaryColor || '#d1fae5',
            color: primaryColor || '#065f46',
            borderRadius: '50px',
          },
          'module-3-number': {
            fontSize: '14',
            fontWeight: 600,
            backgroundColor: primaryColor || '#d1fae5',
            color: primaryColor || '#065f46',
            borderRadius: '50px',
          },
          'module-1-title': {
            fontSize: '16',
            fontWeight: 600,
            color: '#111827'
          },
          'module-2-title': {
            fontSize: '16',
            fontWeight: 600,
            color: '#111827'
          },
          'module-3-title': {
            fontSize: '16',
            fontWeight: 600,
            color: '#111827'
          },
          'rating-text': {
            fontSize: '14',
            color: '#6b7280'
          },
          'certification-text': {
            fontSize: '14',
            color: '#6b7280'
          }
        },
        6: {
          container: {
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
          },
          'brand-name': {
            fontSize: '18',
            fontWeight: 700,
            color: '#ffffff',
          },
          'contact-email': {
            fontSize: '14',
            color: '#d1d5db',
          },
          'professional-image': {
            backgroundColor: '#2d3748',
            borderRadius: '12px',
          },
          'professional-name': {
            fontSize: '20',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '8px',
            borderRadius: '8px',
          },
          badge: {
            fontSize: '14',
            fontWeight: 700,
            color: primaryColor || '#d4af37',
            borderRadius: '0px',
            padding: '0px', 
          },
          headline: {
            fontSize: '32',
            fontWeight: 800,
            color: '#ffffff',
          },
          subheadline: {
            fontSize: '18',
            color: '#9ca3af',
          },
          'benefit-1': {
            fontSize: '16',
            color: '#d1d5db',
          },
          'benefit-2': {
            fontSize: '16',
            color: '#d1d5db',
          },
          'benefit-3': {
            fontSize: '16',
            color: '#d1d5db',
          },
          'benefit-1-icon': {
            backgroundColor: primaryColor || '#d4af37',
            color: '#000000',
            borderRadius: '50px',
            fontSize: '12',
            fontWeight: 700,
          },
          'benefit-2-icon': {
            backgroundColor: primaryColor || '#d4af37',
            color: '#000000',
            borderRadius: '50px',
            fontSize: '12',
            fontWeight: 700,
          },
          'benefit-3-icon': {
            backgroundColor: primaryColor || '#d4af37',
            color: '#000000',
            borderRadius: '50px',
            fontSize: '12',
            fontWeight: 700,
          },
          'price-label': {
            fontSize: '12',
            color: '#9ca3af',
            fontWeight: 500,
          },
          price: {
            fontSize: '24',
            fontWeight: 700,
            color: primaryColor || '#d4af37',
          },
          'price-description': {
            fontSize: '12',
            color: '#9ca3af',
          },
          'cta-button': {
            backgroundColor: primaryColor || '#d4af37',
            color: '#ffffff',
            fontSize: '16',
            fontWeight: 700,
            padding: '12px',
            borderRadius: '8px',
          },
        }
      },
      cta: {
        1: {
          container: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            padding: '16px',
          },
          card: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            borderRadius: '25px',
            padding: '44px',
          },
          headline: {
            fontSize: 32,
            fontWeight: 700,
            color: '#ffffff',
          },
          subheadline: {
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.8)',
          },
          price: {
            fontSize: 38,
            color: '#ffffff',
          },
          'cta-button': {
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor ||'#2563eb',
            padding: '12px',
            borderRadius: '50px',
          },
        },
        2: {
          container: {
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '16px',
          },
          headline: {
            fontSize: 48,
            fontWeight: 700,
            color: '#ffffff',
          },
          subheadline: {
            fontSize: 20,
            color: '#d1d5db',
          },
          'original-price': {
            fontSize: 18,
            color: '#9ca3af',
          },
          price: {
            fontSize: 24,
            fontWeight: 700,
            color: primaryColor || '#2563eb',
          },
          'cta-button': {
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor || '#2563eb',
            padding: '12px',
            borderRadius: '50px',
          },
          'guarantee-text': {
            fontSize: 12,
            color: '#9ca3af',
          },
        },
        3: {
          container: {
            color: '#1e293b',
            padding: '16px',
          },
          'card': {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            padding: '24px',
          },
       'product-image-container': {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
          },
          headline: {
            fontSize: 24,
            fontWeight: 700,
            color: '#111827',
          },
          price: {
            fontSize: 32,
            fontWeight: 700,
            color: primaryColor || '#2563eb',
          },
          'cta-button': {
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: primaryColor || '#2563eb',
            padding: '12px',
            borderRadius: '8px',
          }
        }    
      },
      features: {
        1: {
          badge: { fontSize: 12, fontWeight: 600, color: primaryColor, backgroundColor: `${primaryColor}22` },
          'feature-icon': { color: primaryColor }
        }
      }
    };
    const variationSpecific = variationDefaults[componentType]?.[variationNumber]?.[elementKey] || {};
    const elementTypeSpecific = elementTypeDefaults[elementKey] || {};
    return {
      ...commonDefaults,
      ...elementTypeSpecific,
      ...variationSpecific
    };
  }, []);
  
  const getCurrentElementStyles = useCallback(() => {
    if (!selectedComponent) return {};
    
    const targetElementKey = selectedElementId || 'container';
    const customStyles = selectedComponent?.custom_styles?.[targetElementKey] || {};
    const primaryColor = globalTheme?.primaryColor || '#3b82f6';
    
    // Get component type and variation number
    const componentType = selectedComponent.component_variation?.component_type || 'hero';
    const variationNumber = selectedComponent.component_variation?.variation_number || 1;
    
    // Generic default styles for all elements
    const genericDefaults: Record<string, any> = {
      container: {
        backgroundColor: '#ffffff',
        borderWidth: 0,
        borderColor: '#e5e7eb',
        borderStyle: 'solid',
        borderRadius: 8,
        padding: 24,
        margin: 0
      },
      headline: {
        fontSize: 32,
        fontWeight: 700,
        color: '#111827'
      },
      subheadline: {
        fontSize: 18,
        fontWeight: 400,
        color: '#6b7280'
      },
      'feature-1': {
        fontSize: 16,
        fontWeight: 400,
        color: '#374151'
      },
      'feature-2': {
        fontSize: 16,
        fontWeight: 400,
        color: '#374151'
      },
      'feature-3': {
        fontSize: 16,
        fontWeight: 400,
        color: '#374151'
      },
      'price-label': {
        fontSize: 14,
        fontWeight: 400,
        color: '#6b7280'
      },
      rating: {
        fontSize: 14,
        fontWeight: 500,
        color: '#fbbf24'
      },
      downloads: {
        fontSize: 14,
        fontWeight: 500,
        color: '#6b7280'
      },
      'secondary-button': {
        fontSize: 16,
        fontWeight: 500,
        color: '#374151',
        backgroundColor: '#f9fafb'
      }
    };
    
    // Get variation-specific defaults
    const variationDefaults = getVariationAwareDefaults(componentType, variationNumber, targetElementKey, primaryColor);
    
    // Merge: generic defaults -> variation-specific defaults -> custom styles
    const elementDefaults = genericDefaults[targetElementKey] || {};
    return { ...elementDefaults, ...variationDefaults, ...customStyles };
  }, [selectedComponent, selectedElementId, globalTheme, getVariationAwareDefaults]);
  
  // Helper function to get a specific style value with fallback
  const getStyleValue = useCallback((property: string, fallback: any = '') => {
    const styles = getCurrentElementStyles();
    return styles[property] !== undefined ? styles[property] : fallback;
  }, [getCurrentElementStyles]);
  
  // Helper function to get numeric value from padding/margin (handles string, number, array)
  const getNumericStyleValue = useCallback((property: string, fallback: number = 0) => {
    const value = getStyleValue(property, fallback);
    if (typeof value === 'string') {
      return parseInt(value.replace('px', '')) || fallback;
    } else if (Array.isArray(value)) {
      return value[0] || fallback;
    }
    return typeof value === 'number' ? value : fallback;
  }, [getStyleValue]);
  
  // Helper function to get display value for padding/margin
  const getDisplayStyleValue = useCallback((property: string, fallback: string = '0px') => {
    const value = getStyleValue(property, fallback);
    if (typeof value === 'string') {
      return value;
    } else if (Array.isArray(value)) {
      return `${value[0]}px`;
    }
    return `${value || fallback.replace('px', '')}px`;
  }, [getStyleValue]);
  
  // Get current applied styles
  const currentStyles = getCurrentElementStyles();
  
  // Background type state for container
  const containerStyles = currentStyles; // Use merged styles instead of just custom_styles
  const backgroundColor = getStyleValue('backgroundColor', '#ffffff');
  const [backgroundType, setBackgroundType] = useState(
    backgroundColor.includes('gradient') ? 'gradient' : 'solid'
  );
  useEffect(() => {
    setBackgroundType(backgroundColor.includes('gradient') ? 'gradient' : 'solid');
  }, [backgroundColor]);

  // Add a handleSave function if not present
  const handleSaveAction = async () => {
    if (onSave) {
      await onSave();
    }
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };

  // Early return for no component selected - but only AFTER all hooks are defined
  if (!selectedComponent) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center py-12 px-6">
          <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Component Selected</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Select a component from the canvas to edit its content and styling
          </p>
        </div>
      </div>
    );
  }

  // Get current component variation data - defined after hooks but before render
  // This is not a hook, so it's safe to put after the conditional return
  const currentVariation = componentVariations.find(v => {
    // First check if component_variation is already joined from database
    if (selectedComponent.component_variation?.id === v.id) {
      return true;
    }
    
    // Handle legacy type-variation format
    if (`${v.component_type}-${v.variation_number}` === selectedComponent.component_variation_id) {
      return true;
    }
    
    // Check if component_variation_id matches v.id (UUID format)
    if (selectedComponent.component_variation_id === v.id) {
      return true;
    }
    
    // Handle UUID with variation number format (e.g. "831516cd-38")
    const idParts = selectedComponent.component_variation_id?.split('-');
    if (idParts && idParts.length === 2) {
      // Check if first part is UUID and second part is variation number
      const uuid = idParts[0];
      const variation = parseInt(idParts[1]);
      
      if (v.id === uuid || v.id.includes(uuid)) {
        return true;
      }
      
      // If we have the component type and variation matches
      if (selectedComponent.component_variation?.component_type === v.component_type && 
          variation === v.variation_number) {
        return true;
      }
    }
    
    return false;
  });

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedElementId ? getElementDisplayName(selectedElementId) : 'Component Editor'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedElementId ? 'Element-level editing' : 'Component-level editing'}
            </p>
          </div>
          
        </div>

        {/* Variation Selector */}
        {onChangeVariation && (
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Component Variation</Label>
            <Select
              value={getVariationNumber(selectedComponent)}
              onValueChange={(value) => handleVariationChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center">
                    <Shuffle className="h-4 w-4 mr-2" />
                    {/* Extract and display variation name without nested functions that could create hooks inconsistency */}
                    {currentVariation?.variation_name || 
                     selectedComponent.component_variation?.variation_name || 
                     `Variation ${getVariationNumber(selectedComponent)}`}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {componentVariations
                  .filter(v => {
                    // Use the currentVariation to determine which type to display
                    if (currentVariation) {
                      return v.component_type === currentVariation.component_type;
                    }
                    
                    // Get component type from multiple possible sources
                    const componentType = getComponentType(selectedComponent, componentVariations);
                    return v.component_type === componentType;
                  })
                  .map((variation) => (
                    <SelectItem key={variation.variation_number} value={variation.variation_number.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{variation.variation_name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="styles" className="flex items-center text-xs">
              Styles
            </TabsTrigger>
            <TabsTrigger value="visibility" className="flex items-center text-xs">
              Visibility
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeTab} className="w-full">
          


          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-6 mt-0">
            {isEditingContainer ? (
              /* Container-specific styles */
              <div className="space-y-6">
                {/* Background Section */}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Background Type</Label>
                      <Select
                        value={backgroundType}
                        onValueChange={(value: 'solid' | 'gradient') => {
                          setBackgroundType(value);
                          if (value === 'solid') {
                            handleStyleChange('backgroundColor', '#ffffff');
                            handleStyleChange('background', '');
                          } else if (value === 'gradient') {
                            handleGradientChange('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Solid Color */}
                    {backgroundType === 'solid' && (
                      <ColorPicker
                        label="Background Color"
                        color={getStyleValue('backgroundColor', '#ffffff')}
                        onChange={(color) => handleStyleChange('backgroundColor', color)}
                      />
                    )}

                    {/* Gradient */}
                    {backgroundType === 'gradient' && (() => {
                      // fallback to a default if not a gradient string
                      const backgroundColorValue = getStyleValue('backgroundColor', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                      const actualBackgroundValue = backgroundColorValue && backgroundColorValue.includes('gradient')
                        ? backgroundColorValue
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      const colors = actualBackgroundValue.match(/#[0-9a-f]{6}/gi) || ['#667eea', '#764ba2'];
                      const direction = actualBackgroundValue.includes('135deg') ? '135deg' :
                        actualBackgroundValue.includes('90deg') ? '90deg' :
                        actualBackgroundValue.includes('45deg') ? '45deg' : '0deg';
                      return (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Gradient Direction</Label>
                            <Select
                              value={direction}
                              onValueChange={(newDirection) => {
                                handleGradientChange(`linear-gradient(${newDirection}, ${colors[0]} 0%, ${colors[1]} 100%)`);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0deg">Top to Bottom</SelectItem>
                                <SelectItem value="90deg">Left to Right</SelectItem>
                                <SelectItem value="45deg">Diagonal ↗</SelectItem>
                                <SelectItem value="135deg">Diagonal ↘</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <ColorPicker
                              label="Start Color"
                              color={colors[0] || '#667eea'}
                              onChange={(color) => {
                                const newColors = [color, colors[1] || '#764ba2'];
                                handleGradientChange(`linear-gradient(${direction}, ${newColors[0]} 0%, ${newColors[1]} 100%)`);
                              }}
                            />
                            <ColorPicker
                              label="End Color"
                              color={colors[1] || '#764ba2'}
                              onChange={(color) => {
                                const newColors = [colors[0] || '#667eea', color];
                                handleGradientChange(`linear-gradient(${direction}, ${newColors[0]} 0%, ${newColors[1]} 100%)`);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Border Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Border</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Border Width</Label>
                      <Slider
                        value={[parseInt(getStyleValue('borderWidth', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('borderWidth', `${value[0]}px`)}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('borderWidth', '0px')}
                      </div>
                    </div>

                    <ColorPicker
                      label="Border Color"
                      color={getStyleValue('borderColor', '#e5e7eb')}
                      onChange={(color) => handleStyleChange('borderColor', color)}
                    />

                    <div>
                      <Label className="text-xs">Border Style</Label>
                      <Select
                        value={getStyleValue('borderStyle', 'solid')}
                        onValueChange={(value) => handleStyleChange('borderStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Border Radius</Label>
                      <Slider
                        value={[parseInt(getStyleValue('borderRadius', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('borderRadius', `${value[0]}px`)}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('borderRadius', '0px')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Spacing Section for Container */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Spacing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Padding</Label>
                      <Slider
                        value={[parseInt(getStyleValue('padding', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('padding', `${value[0]}px`)}
                        max={100}
                        step={4}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('padding', '0px')}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Margin</Label>
                      <Slider
                        value={[parseInt(getStyleValue('margin', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('margin', `${value[0]}px`)}
                        max={100}
                        step={4}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('margin', '0px')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Regular element styles - Background, Border, Spacing, Typography */
              <div className="space-y-6">
                {/* Shared Button Action Configurator for cta-button and secondary-button */}
                {(selectedElementId === 'cta-button' || selectedElementId === 'secondary-button') && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {selectedElementId === 'cta-button' ? 'CTA Button Action' : 'Secondary Button Action'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">Action Type</Label>
                          <Select value={buttonActionType} onValueChange={setButtonActionType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open_link">Open Link</SelectItem>
                              <SelectItem value="scroll">Scroll to Section</SelectItem>
                              <SelectItem value="checkout">Checkout</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {buttonActionType === 'open_link' && (
                          <>
                            <div>
                              <Label className="text-xs">URL</Label>
                              <Input value={buttonUrl} onChange={e => setButtonUrl(e.target.value)} placeholder="https://..." />
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="button-newtab" checked={buttonNewTab} onChange={e => setButtonNewTab(e.target.checked)} />
                              <Label htmlFor="button-newtab" className="text-xs">Open in new tab</Label>
                            </div>
                          </>
                        )}
                        {buttonActionType === 'scroll' && (
                          <div>
                            <Label className="text-xs">Section to Scroll To</Label>
                            <Select value={buttonTargetId} onValueChange={setButtonTargetId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a section" />
                              </SelectTrigger>
                              <SelectContent>
                                {allSections.map((section, idx) => {
                                  const label =
                                    section.content?.headline?.trim() ||
                                    section.content?.title?.trim() ||
                                    (section.component_variation?.component_type
                                      ? section.component_variation.component_type
                                      : section.id.slice(0, 8));
                                  return (
                                    <SelectItem key={section.id} value={`section-${section.id}`}>
                                      {label} ({idx + 1})
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {/* No extra fields for checkout */}
                        <Button size="sm" onClick={() => {
  const customActions = selectedComponent?.custom_actions || {};
  const actionKey = selectedElementId === 'cta-button' ? 'cta-button' : 'secondary-button';
  let updatedActions;
  if (buttonActionType === 'open_link') {
    updatedActions = { ...customActions, [actionKey]: { type: 'open_link', url: buttonUrl, newTab: buttonNewTab } };
  } else if (buttonActionType === 'scroll') {
    updatedActions = { ...customActions, [actionKey]: { type: 'scroll', targetId: buttonTargetId } };
  } else if (buttonActionType === 'checkout') {
    updatedActions = { ...customActions, [actionKey]: { type: 'checkout' } };
  } else {
    updatedActions = { ...customActions };
  }
  onUpdateComponent(selectedComponent.id, { custom_actions: updatedActions });
}} className="mt-2">Save Action</Button>
                        {showSaveConfirmation && (
                          <div className="text-xs text-blue-500 mt-1 ml-1">Action saved!</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Typography Section for Elements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Font Size and Weight */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Font Size</Label>
                        <Select
                          value={getStyleValue('fontSize', '16').toString()}
                          onValueChange={(value) => handleStyleChange('fontSize', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12px</SelectItem>
                            <SelectItem value="14">14px</SelectItem>
                            <SelectItem value="16">16px</SelectItem>
                            <SelectItem value="18">18px</SelectItem>
                            <SelectItem value="20">20px</SelectItem>
                            <SelectItem value="24">24px</SelectItem>
                            <SelectItem value="32">32px</SelectItem>
                            <SelectItem value="48">48px</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Font Weight</Label>
                        <Select
                          value={getStyleValue('fontWeight', '400').toString()}
                          onValueChange={(value) => handleStyleChange('fontWeight', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="400">Normal</SelectItem>
                            <SelectItem value="500">Medium</SelectItem>
                            <SelectItem value="600">Semi Bold</SelectItem>
                            <SelectItem value="700">Bold</SelectItem>
                            <SelectItem value="800">Extra Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Text Color */}
                    <ColorPicker
                      label="Text Color"
                      color={getStyleValue('color', '#111827')}
                      onChange={(color) => handleStyleChange('color', color)}
                    />
                  </CardContent>
                </Card>

                {/* Background Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Solid Color Only for Elements */}
                    <ColorPicker
                      label="Background Color"
                      color={getStyleValue('backgroundColor', '#ffffff')}
                      onChange={(color) => handleStyleChange('backgroundColor', color)}
                    />
                  </CardContent>
                </Card>

                {/* Border Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Border</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Border Width</Label>
                      <Slider
                        value={[parseInt(getStyleValue('borderWidth', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('borderWidth', `${value[0]}px`)}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('borderWidth', '0px')}
                      </div>
                    </div>

                    <ColorPicker
                      label="Border Color"
                      color={getStyleValue('borderColor', '#e5e7eb')}
                      onChange={(color) => handleStyleChange('borderColor', color)}
                    />

                    <div>
                      <Label className="text-xs">Border Style</Label>
                      <Select
                        value={getStyleValue('borderStyle', 'solid')}
                        onValueChange={(value) => handleStyleChange('borderStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Border Radius</Label>
                      <Slider
                        value={[parseInt(getStyleValue('borderRadius', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('borderRadius', `${value[0]}px`)}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('borderRadius', '0px')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Spacing Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Spacing & Layout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs">Text Alignment</Label>
                      <Select
                        value={getStyleValue('textAlign', 'left')}
                        onValueChange={(value) => handleStyleChange('textAlign', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Padding</Label>
                      <Slider
                        value={[parseInt(getStyleValue('padding', '0').toString().replace('px', '') || '0')]}
                        onValueChange={(value) => handleStyleChange('padding', `${value[0]}px`)}
                        max={100}
                        step={4}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getStyleValue('padding', '0px')}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Margin</Label>
                      <Slider
                        value={[getNumericStyleValue('margin', 0)]}
                        onValueChange={(value) => handleStyleChange('margin', `${value[0]}px`)}
                        max={100}
                        step={4}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500">
                        {getDisplayStyleValue('margin', '0px')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-4 mt-0">
            <VisibilityControls
              component={selectedComponent}
              componentVariation={currentVariation}
              onToggleVisibility={handleVisibilityChange}
              onBulkToggleVisibility={handleBulkVisibilityChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VisualEditor;
