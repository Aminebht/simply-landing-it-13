import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Product, ComponentVariation, OnboardingData } from '@/types/onboarding';

export const useOnboardingData = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);
  const [loading, setLoading] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    language: 'en',
    selectedComponents: [],
    componentContent: {},
    useProductDescription: true,
    customDescription: '',
    useProductImages: true,
    generateAIImages: false,
    selectedProductMedia: [],
  });

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const fetchComponentVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('component_variations')
        .select('*')
        .eq('is_active', true)
        .order('component_type, variation_number');

      if (error) throw error;
      console.log('Fetched component variations:', data);
      setComponentVariations(data || []);
    } catch (error) {
      console.error('Error fetching component variations:', error);
      toast({
        title: "Error",
        description: "Failed to load component variations",
        variant: "destructive"
      });
    }
  };

  const fetchProductMedia = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_media')
        .select('id, media_type, file_url, display_order')
        .eq('product_id', productId)
        .eq('media_type', 'image')
        .order('display_order');

      if (error) throw error;
      console.log('Fetched product media:', data);
      
      setOnboardingData(prev => ({
        ...prev,
        selectedProductMedia: data || []
      }));
      
      return data || [];
    } catch (error) {
      console.error('Error fetching product media:', error);
      toast({
        title: "Warning",
        description: "Failed to load product media",
        variant: "destructive"
      });
      return [];
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchComponentVariations();
  }, []);

  return {
    products,
    componentVariations,
    loading,
    setLoading,
    onboardingData,
    setOnboardingData,
    fetchProductMedia,
  };
};
