// Utility to get responsive class from a class map
export function getClass(map: Record<string, string>, viewport?: string) {
  if (!viewport) return map.responsive;
  return map[viewport] || map.desktop;
}

// Utility to get styles for a specific element
export function getElementStyles (styles :{},elementId: string){
    return styles?.[elementId] || {};
  };

// Utility to check if a field is visible
export function isVisible(visibility: Record<string, any> | undefined, key: string) {
  return visibility?.[key] !== false;
} 

