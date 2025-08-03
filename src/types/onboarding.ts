export interface OnboardingData {
  selectedProduct?: Product;
  selectedProductMedia?: Array<{
    id: string;
    media_type: string;
    file_url: string;
    display_order: number;
  }>;
  language: 'en' | 'fr' | 'ar';
  selectedComponents: string[];
  componentContent: Record<string, any>;
  useProductDescription: boolean;
  customDescription: string;
  useProductImages: boolean;
  generateAIImages: boolean;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  preview_image_url?: string;
  tags?: string[];
  seller_id: string;
}

export interface ComponentVariation {
  id: string;
  component_type: string;
  variation_name: string;
  variation_number: number;
  description?: string;
  default_content: Record<string, any>;
  character_limits: Record<string, any>;
  required_images: number;
  supports_video: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStepProps {
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  products?: Product[];
  onFetchProductMedia?: (productId: string) => Promise<any>;
}
