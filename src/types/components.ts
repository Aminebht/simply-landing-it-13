export interface ComponentProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  visibility: Record<string, boolean>;
  mediaUrls?: Record<string, string>; // Added media_urls from component data
  trackingConfig?: any;
  isEditing?: boolean;
  selectedElementId?: string | null;
  viewport?: 'mobile' | 'tablet' | 'desktop' | 'responsive';
  componentId?: string; // Add componentId for media service integration
  onStyleChange?: (elementId: string, styles: any) => void;
  onContentChange?: (field: string, value: any) => void;
  onElementSelect?: (elementId: string) => void;
  customActions?: Record<string, any>; // <-- Add this
  checkoutFields?: any[]; // Add checkoutFields for SSR form rendering
}

export interface GoogleFont {
  family: string;
  variants: string[];
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  googleFontUrl: string;
}

export interface CustomizableStyles {
  // Layout
  padding?: [number, number, number, number]; // top, right, bottom, left
  margin?: [number, number, number, number];
  borderRadius?: number;
  
  // Typography
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  headingFont?: GoogleFont;
  bodyFont?: GoogleFont;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  
  // Colors
  backgroundColor?: string;
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  textColor?: string;
  borderColor?: string;
  primaryColor?: string; // Added primaryColor for coordinated color theming
  
  // Effects
  boxShadow?: string;
  opacity?: number;
  
  // Borders
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  
  // Dimensions
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
}

// Interface for visibility keys structure
export interface VisibilityKey {
  key: string;
  label: string[];
}

// Interface for grouped parts array structure
export interface ComponentGroupedPart {
  key: string;
  value: string[];
}

export interface ComponentVariation {
  id: string;
  component_type: string;
  variation_name: string;
  variation_number: number;
  description?: string;
  visibility_keys?: VisibilityKey[]; // Array of objects: [{ "key": "badge", "label": ["Badge/Label"] }, ...]
  default_content: Record<string, any>;
  character_limits: Record<string,any>;
  required_images: number;
  supports_video: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  name: string;
  trigger: 'click' | 'view' | 'submit';
  elementSelector: string;
  eventData?: Record<string, any>;
}

export interface LandingPageComponent {
  id: string;
  page_id: string;
  component_variation_id: string;
  order_index: number;
  content: Record<string, any>;
  styles: Record<string, CustomizableStyles>;
  visibility: Record<string, boolean>;
  custom_styles?: Record<string, CustomizableStyles>;
  media_urls?: Record<string, string>; // Added media_urls field for storing image URLs
  custom_actions?: Record<string, any>; // <-- Add this
  component_variation?: ComponentVariation; // Added component_variation for joined data
  created_at: string;
  updated_at: string;
}

// Add visibility management types
export interface VisibilityGroup {
  groupKey: string;
  groupLabel: string;
  parts: string[];
  isVisible: boolean;
}

export interface VisibilityControlsProps {
  component: LandingPageComponent;
  componentVariation?: ComponentVariation;
  onToggleVisibility: (elementName: string, isVisible: boolean) => void;
  onBulkToggleVisibility?: (visibility: Record<string, boolean>) => void;
}

export interface ButtonAction {
  action_type: 'marketplace_checkout' | 'external_link' | 'scroll_to' | 'modal';
  tracking_event?: string;
  url?: string;
  target_id?: string;
  fallback_url?: string;
}

export interface TrackingConfig {
  facebook_pixel_id?: string;
  facebook_access_token?: string;
  google_analytics_id?: string;
  clarity_id?: string;
  conversion_events?: {
    page_view: boolean;
    add_to_cart: boolean;
    purchase: boolean;
  };
}

export interface ComponentInstance {
  type: 'hero' | 'testimonials' | 'features' | 'pricing' | 'faq' | 'cta';
  variation: 1 | 2 | 3 | 4 | 5 | 6;
  visibility: Record<string, boolean>;
  content: Record<string, any>;
  styles: Record<string, CustomizableStyles>;
  tracking_config?: TrackingConfig;
}

export interface BaseVariationProps {
  content: Record<string, any>;
  styles?: Record<string, any>;
  visibility?: Record<string, any>;
  isEditing?: boolean;
  selectedElementId?: string;
  viewport?: 'mobile' | 'tablet' | 'desktop';
  componentId?: string;
  onStyleChange?: (elementId: string, style: any) => void;
  onContentChange?: (elementId: string, value: any) => void;
  onElementSelect?: (elementId: string) => void;
  customActions?: Record<string, any>;
}
