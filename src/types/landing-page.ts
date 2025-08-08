export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  direction: 'ltr' | 'rtl';
  language: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonical: string;
}

export interface MarketplaceIntegration {
  checkout_url: string;
  currency: string;
  seller_commission: number;
}

export interface TrackingConfig {
  facebook_pixel_id: string;
  facebook_access_token: string;
  google_analytics_id: string;
  clarity_id: string;
  conversion_events: {
    page_view: boolean;
    add_to_cart: boolean;
    purchase: boolean;
  };
  [key: string]: unknown;
}

export interface LandingPage {
  id: string;
  product_id?: string;
  user_id?: string;
  slug: string;
  custom_domain?: string;
  netlify_site_id?: string;
  deployed_url?: string;
  global_theme: ThemeConfig;
  seo_config: SEOConfig;
  language: 'en' | 'fr' | 'ar';
  tracking_config: TrackingConfig;
  status: 'draft' | 'published' | 'deploying';
  last_deployed_at?: string;
  created_at: string;
  updated_at: string;
}
export interface ButtonAction {
  action_type: 'marketplace_checkout' | 'external_link' | 'scroll_to' | 'modal';
  tracking_event?: string;
  url?: string;
  target_id?: string;
  fallback_url?: string;
}

// AI Generation interfaces
export interface AIGenerationRequest {
  component_type: string;
  variation: number;
  content_type: string;
  business_context: Record<string, any>;
  target_audience: string;
  tone: string;
  additional_requirements: string;
  context?: {
    product_name?: string;
    target_audience?: string;
    industry?: string;
    tone?: string;
  };
  prompt: string;
}

export interface AIGenerationResponse {
  content: Record<string, any>;
  suggestions: {
    colors: string[];
    fonts: string[];
    layout_tips: string[];
  };
}

export interface LandingPageGenerationRequest {
  product_id: string;
  user_id: string;
  product_name: string;
  product_description: string;
  categories: string[];
  target_audience?: string;
  language: 'en' | 'fr' | 'ar';
  style_preference?: 'modern' | 'classic' | 'bold' | 'minimal';
  color_scheme?: 'blue' | 'green' | 'purple' | 'orange';
  include_testimonials?: boolean;
  include_faq?: boolean;
  include_pricing?: boolean;
}

export interface ImageGenerationRequest {
  landing_page_id: string;
  component_id: string;
  image_type: 'hero' | 'feature' | 'testimonial' | 'product';
  product_name: string;
  product_description: string;
  style_preference?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}