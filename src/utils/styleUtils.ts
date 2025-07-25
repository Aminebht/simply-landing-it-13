// Utility function to get reactive styles for elements
export const getElementStyles = (styles: Record<string, any> | undefined, elementId: string) => {
  return styles?.[elementId] || {};
};

// Helper function to apply styles with fallbacks
export const applyElementStyles = (
  styles: Record<string, any> | undefined,
  elementId: string,
  fallbacks: Record<string, any> = {}
) => {
  const elementStyles = getElementStyles(styles, elementId);
  return {
    ...fallbacks,
    ...elementStyles
  };
};
