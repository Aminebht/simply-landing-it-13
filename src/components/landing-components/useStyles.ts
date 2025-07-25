import { CustomizableStyles } from '@/types/components';

export interface CommonStyles {
  backgroundColor: string;
  primaryColor: string;
}

interface UseStylesProps {
  styles?: Record<string, CustomizableStyles>;
  variation: 1 | 2 | 3 | 4 | 5 | 6;
}

export const getDefaultStyles = (variation: number): CommonStyles => {
  // Default styles for each variation
  const defaultStyles: Record<number, CommonStyles> = {
    1: {
      backgroundColor: '#0f172a',
      primaryColor: '#3b82f6'
    },
    2: {
      backgroundColor: '#ffffff',
      primaryColor: '#f59e0b'
    },
    3: {
      backgroundColor: '#f8fafc',
      primaryColor: '#4f46e5'
    },
    4: {
      backgroundColor: 'linear-gradient(to bottom right, #0f1419, #1e1b4b, #0f1419)',
      primaryColor: '#6366f1'
    },
    5: {
      backgroundColor: 'linear-gradient(to right, #f0fdf4, #ccfbf1)',
      primaryColor: '#10b981'
    },
    6: {
      backgroundColor: '#1a1a1a',
      primaryColor: '#d4af37'
    }
  };

  return defaultStyles[variation] || defaultStyles[1];
};

export const useStyles = ({ styles, variation }: UseStylesProps) => {
  const defaults = getDefaultStyles(variation);

  // Get shared background color from container styles or use default
  const backgroundColor = styles?.container?.backgroundColor || 
                         styles?.container?.background ||
                         defaults.backgroundColor;

  // Get shared primary color from custom styles or use default
  const primaryColor = styles?.container?.primaryColor || defaults.primaryColor;

  return {
    backgroundColor,
    primaryColor,
    defaults
  };
};
