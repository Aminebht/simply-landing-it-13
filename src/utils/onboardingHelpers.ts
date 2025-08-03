import type { ComponentVariation } from '@/types/onboarding';

// Helper function to get the expected field names for each component variation
export const getImageFieldNames = (componentVariationId: string, variation: any): string[] => {
  // Map component variation IDs to their expected image field names
  const componentImageFields: Record<string, string[]> = {
    // Hero variations - based on the component types and their expected field names
    'hero-variation-1': ['productImage'],
    'hero-variation-3': ['dashboardImage'],
    'hero-variation-4': ['template1Image', 'template2Image', 'template3Image'],
    'hero-variation-6': ['brandLogoIcon', 'professionalImage'],
  };

  // Try to find by the variation name or component type
  const variationName = variation?.variation_name || '';
  const componentType = variation?.component_type || '';
  const variationNumber = variation?.variation_number || 0;
  
  // Create a key based on component type and variation number
  const key = `${componentType}-variation-${variationNumber}`;
  
  // Return the expected field names, or default to generic names
  return componentImageFields[key] || [`image1`, `image2`, `image3`].slice(0, variation?.required_images || 1);
};

// Helper function to map generic image keys to component-specific field names
export const mapImageKeysToFieldNames = (
  componentContent: Record<string, any>, 
  componentVariationId: string, 
  variation: any
): Record<string, string> => {
  const imageUrls: Record<string, string> = {};
  const expectedFieldNames = getImageFieldNames(componentVariationId, variation);
  
  // Map image1, image2, image3 to the expected field names
  let fieldIndex = 0;
  Object.keys(componentContent).forEach(key => {
    if (key.startsWith('image') && typeof componentContent[key] === 'string' && componentContent[key].startsWith('http')) {
      if (fieldIndex < expectedFieldNames.length) {
        imageUrls[expectedFieldNames[fieldIndex]] = componentContent[key];
        fieldIndex++;
      }
    }
  });
  
  return imageUrls;
};

export const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const determineImagesToGenerate = (
  componentType: string, 
  requiredImagesCount: number
): Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> => {
  let imagesToGenerate: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = [];
  
  if (componentType === 'hero') {
    const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['hero', 'product'];
    imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
  } else if (componentType === 'features') {
    const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['feature', 'product'];
    imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
  } else if (componentType === 'testimonials') {
    const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['testimonial', 'product'];
    imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
  } else if (componentType === 'cta') {
    const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['product', 'background'];
    imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
  } else if (componentType === 'pricing') {
    const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['background', 'product'];
    imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
  } else {
    // Generic fallback for other component types
    const imageTypes: Array<'hero' | 'feature' | 'testimonial' | 'product' | 'background'> = ['product', 'background', 'feature'];
    imagesToGenerate = imageTypes.slice(0, requiredImagesCount);
  }

  return imagesToGenerate;
};
