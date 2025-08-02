import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development, use placeholder values if environment variables are not set
const defaultUrl = 'https://ijrisuqixfqzmlomlgjb.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using placeholder values for development.');
}

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
);

// Database types based on our schema
export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  comission: number;
  balance?: number;
  bio?: string;
  logo?: string;
  email?: string;
  is_verified?: boolean;
  is_company_verified?: boolean;
  is_creator: boolean;
  facebook_pixel_id?: string;
  facebook_conversion_api_token?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  file_url: string;
  preview_image_url?: string;
  seller_id: string;
  categories: string[];
  created_at: string;
  original_price: number;
  tags?: string[];
  archived?: boolean;
  deleted?: boolean;
  Views?: number;
  stamp_pdf?: boolean;
  product_type: string;
}

export interface LandingPage {
  id: string;
  product_id?: string;
  user_id?: string;
  slug: string;
  custom_domain?: string;
  netlify_site_id?: string;
  global_theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    direction: 'ltr' | 'rtl';
    language: string;
  };
  seo_config: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    canonical: string;
  };
  tracking_config: {
    facebook_pixel_id: string;
    facebook_access_token: string;
    google_analytics_id: string;
    clarity_id: string;
    conversion_events: {
      page_view: boolean;
      add_to_cart: boolean;
      purchase: boolean;
    };
  };
  status: 'draft' | 'published' | 'deploying';
  last_deployed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ComponentVariation {
  id: string;
  component_type: string;
  variation_name: string;
  variation_number: number;
  description?: string;
  visibility_keys?: Array<{ key: string; label: string[] }>; // [{ "key": "badge", "label": ["Badge/Label"] }, ...]
  default_content: Record<string, any>;
  character_limits: Record<string, any>;
  required_images: number;
  supports_video: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingPageComponent {
  id: string;
  page_id: string;
  component_variation_id: string;
  order_index: number;
  content: Record<string, any>;
  custom_styles: Record<string, any>;
  visibility: Record<string, boolean>;
  media_urls?: Record<string, string>; // Added media_urls field
  custom_actions?: Record<string, any>; // <-- Add this line
  created_at: string;
  updated_at: string;
}

export interface DeploymentJob {
  id: string;
  landing_page_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  job_data?: Record<string, any>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// Helper functions for database operations
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getLandingPage = async (slug: string): Promise<LandingPage | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
};

export const getLandingPageComponents = async (pageId: string): Promise<LandingPageComponent[]> => {
  const { data, error } = await supabase
    .from('landing_page_components')
    .select('*')
    .eq('page_id', pageId)
    .order('order_index');
  if (error) throw error;
  const components = data || [];

  // Get all component variations to match with components
  const { data: variations, error: variationsError } = await supabase
    .from('component_variations')
    .select('*')
    .eq('is_active', true);
  if (variationsError) {
    console.warn('Failed to fetch component variations:', variationsError);
    return components;
  }

  // Parse variations for JSON fields and type consistency (reuse logic from getComponentVariations)
  const parsedVariations = (variations || []).map((v: any) => ({
    ...v,
    default_content: typeof v.default_content === 'string' ? JSON.parse(v.default_content) : v.default_content,
    character_limits: typeof v.character_limits === 'string' ? JSON.parse(v.character_limits) : v.character_limits,
    visibility_keys: typeof v.visibility_keys === 'string' ? JSON.parse(v.visibility_keys) : v.visibility_keys,
    required_images: typeof v.required_images === 'string' ? parseInt(v.required_images, 10) : v.required_images,
    supports_video: typeof v.supports_video === 'string' ? v.supports_video === 'true' : !!v.supports_video,
    is_active: typeof v.is_active === 'string' ? v.is_active === 'true' : !!v.is_active,
  }));

  // Enrich components with their variation data by matching id
  const enrichedComponents = components.map(component => {
    // Try to match by id first (the correct way)
    const matchingVariation = parsedVariations.find(v => v.id === component.component_variation_id);
    if (matchingVariation) {
      return {
        ...component,
        component_variation: matchingVariation
      };
    }
    // Fallback: try to match by type/variation_number if id is not a UUID
    if (typeof component.component_variation_id === 'string') {
      const [componentType, variationNumber] = component.component_variation_id.split('-');
      const variationNum = parseInt(variationNumber, 10);
      const fallbackVariation = parsedVariations.find(v => v.component_type === componentType && v.variation_number === variationNum);
      if (fallbackVariation) {
        return {
          ...component,
          component_variation: fallbackVariation
        };
      }
    }
    // If not found, return as is (will be handled by renderer fallback)
    return component;
  });
  return enrichedComponents;
};

export const getComponentVariations = async (): Promise<ComponentVariation[]> => {
  const { data, error } = await supabase
    .from('component_variations')
    .select('*')
    .eq('is_active', true)
    .order('component_type, variation_number');
  if (error) throw error;
  if (!data) return [];
  // Parse JSON fields and cast types
  return data.map((v: any) => ({
    ...v,
    default_content: typeof v.default_content === 'string' ? JSON.parse(v.default_content) : v.default_content,
    character_limits: typeof v.character_limits === 'string' ? JSON.parse(v.character_limits) : v.character_limits,
    visibility_keys: typeof v.visibility_keys === 'string' ? JSON.parse(v.visibility_keys) : v.visibility_keys,
    required_images: typeof v.required_images === 'string' ? parseInt(v.required_images, 10) : v.required_images,
    supports_video: typeof v.supports_video === 'string' ? v.supports_video === 'true' : !!v.supports_video,
    is_active: typeof v.is_active === 'string' ? v.is_active === 'true' : !!v.is_active,
  }));
};

export const createLandingPage = async (landingPage: Partial<LandingPage>): Promise<LandingPage> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .insert(landingPage)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLandingPage = async (id: string, updates: Partial<LandingPage>): Promise<LandingPage> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createLandingPageComponent = async (component: Partial<LandingPageComponent>): Promise<LandingPageComponent> => {
  const { data, error } = await supabase
    .from('landing_page_components')
    .insert(component)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateLandingPageComponent = async (id: string, updates: Partial<LandingPageComponent>): Promise<LandingPageComponent> => {
  const { data, error } = await supabase
    .from('landing_page_components')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteLandingPageComponent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('landing_page_components')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const createDeploymentJob = async (job: Partial<DeploymentJob>): Promise<DeploymentJob> => {
  const { data, error } = await supabase
    .from('deployment_jobs')
    .insert(job)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
