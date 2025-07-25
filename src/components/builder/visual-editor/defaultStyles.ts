import { CustomizableStyles } from '@/types/components';

// Element-specific defaults that override common defaults
export const elementTypeDefaults: Record<string, Partial<CustomizableStyles>> = {
  badge: { 
    padding: [6, 12, 6, 12], borderRadius: 50, fontSize: 12, fontWeight: 600 
  },
  'cta-button': { 
    padding: [12, 24, 12, 24], borderRadius: 8, fontSize: 16, fontWeight: 600 
  },
  'secondary-button': { 
    padding: [12, 24, 12, 24], borderRadius: 8, fontSize: 16, fontWeight: 600,
    borderWidth: 2, backgroundColor: 'transparent'
  },
  container: { 
    padding: [32, 16, 32, 16], borderRadius: 0 
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

// Common default values that apply to most elements when not specified
export const commonDefaults: Partial<CustomizableStyles> = {
  padding: [0, 0, 0, 0],
  margin: [0, 0, 0, 0], 
  borderWidth: 0,
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderRadius: 0,
  backgroundColor: 'transparent'
};

// Variation-specific defaults - comprehensive mapping from actual component CSS classes
export const getVariationDefaults = (
  componentType: string, 
  variationNumber: number, 
  elementKey: string, 
  primaryColor: string
): Partial<CustomizableStyles> => {
  const variationDefaults: Record<string, Record<number, Record<string, Partial<CustomizableStyles>>>> = {
    hero: {
      1: {
        container: { 
          padding: [12, 12, 12, 12], borderRadius: 0, borderWidth: 0, borderColor: 'transparent',
          backgroundColor: '#ffffff', textColor: '#0f172a'
        },
        badge: { 
          fontSize: 12, fontWeight: 500, textColor: '#ffffff', backgroundColor: primaryColor || '#2563e0',
          padding: [4, 8, 4, 8], borderRadius: 50, borderWidth: 0, borderColor: 'transparent'
        },
        headline: { 
          fontSize: 24, fontWeight: 700, textColor: '#ffffff',
          padding: [0, 0, 0, 0], borderRadius: 0, borderWidth: 0, borderColor: 'transparent'
        },
        subheadline: { 
          fontSize: 14, fontWeight: 400, textColor: '#d1d5db',
          padding: [0, 0, 0, 0], borderRadius: 0, borderWidth: 0, borderColor: 'transparent'
        },
        price: { 
          fontSize: 18, fontWeight: 700, textColor: primaryColor || '#10b981',
          padding: [0, 0, 0, 0], borderRadius: 0, borderWidth: 0, borderColor: 'transparent'
        },
        'original-price': { 
          fontSize: 12, fontWeight: 400, textColor: '#9ca3af',
          padding: [0, 0, 0, 0], borderRadius: 0, borderWidth: 0, borderColor: 'transparent'
        },
        'cta-button': { 
          fontSize: 14, fontWeight: 600, textColor: '#ffffff', backgroundColor: primaryColor || '#2563e0',
          padding: [10, 16, 10, 16], borderRadius: 8, borderWidth: 0, borderColor: 'transparent'
        },
        'secondary-button': { 
          fontSize: 14, fontWeight: 600, textColor: primaryColor || '#2563e0', backgroundColor: 'transparent',
          padding: [10, 16, 10, 16], borderRadius: 8, borderWidth: 2, borderColor: primaryColor || '#2563e0'
        }
      },
      2: {
        container: { 
          padding: [16, 16, 16, 16], borderRadius: 0, backgroundColor: '#1f2937', textColor: '#ffffff'
        },
        badge: { 
          fontSize: 12, fontWeight: 500, textColor: '#1f2937', backgroundColor: '#fbbf24',
          padding: [6, 12, 6, 12], borderRadius: 50
        },
        headline: { 
          fontSize: 28, fontWeight: 700, textColor: '#ffffff'
        },
        subheadline: { 
          fontSize: 16, fontWeight: 400, textColor: '#d1d5db'
        },
        'cta-button': { 
          fontSize: 16, fontWeight: 600, textColor: '#ffffff', backgroundColor: primaryColor || '#3b82f6',
          padding: [12, 24, 12, 24], borderRadius: 12
        }
      },
      // Add more hero variations...
    },
    cta: {
      1: {
        container: { 
          padding: [24, 16, 24, 16], borderRadius: 16, backgroundColor: '#f8fafc', textColor: '#0f172a'
        },
        headline: { 
          fontSize: 24, fontWeight: 700, textColor: '#0f172a'
        },
        subheadline: { 
          fontSize: 16, fontWeight: 400, textColor: '#64748b'
        },
        'cta-button': { 
          fontSize: 16, fontWeight: 600, textColor: '#ffffff', backgroundColor: primaryColor || '#2563e0',
          padding: [12, 32, 12, 32], borderRadius: 8
        }
      },
      // Add more CTA variations...
    },
    // Add other component types...
  };

  const typeDefaults = variationDefaults[componentType]?.[variationNumber];
  if (!typeDefaults) {
    return elementTypeDefaults[elementKey] || commonDefaults;
  }

  const elementDefaults = typeDefaults[elementKey];
  if (!elementDefaults) {
    return elementTypeDefaults[elementKey] || commonDefaults;
  }

  return {
    ...commonDefaults,
    ...elementTypeDefaults[elementKey],
    ...elementDefaults
  };
};