import { supabase } from './supabase';
import { LandingPageComponent, ComponentVariation } from '@/types/components';
import { LandingPage, MarketplaceData } from '@/types/landing-page';

// Helper function to clean content by removing image URLs
const cleanContentFromImageUrls = (content: unknown): unknown => {
  if (!content || typeof content !== 'object') return content;
  
  const cleaned = { ...content as Record<string, unknown> };
  
  // Remove any field that looks like an image URL
  Object.keys(cleaned).forEach(key => {
    const value = cleaned[key];
    if (
      typeof value === 'string' && 
      (value.startsWith('http') || value.startsWith('blob:')) &&
      (value.includes('supabase') || value.includes('images') || key.toLowerCase().includes('image'))
    ) {
      // Remove image URLs from content - they should be in media_urls instead
      delete cleaned[key];
    }
  });
  
  return cleaned;
};

export class LandingPageService {
  private static instance: LandingPageService;

  static getInstance(): LandingPageService {
    if (!LandingPageService.instance) {
      LandingPageService.instance = new LandingPageService();
    }
    return LandingPageService.instance;
  }

  async createLandingPage(data: Omit<LandingPage, 'id' | 'created_at' | 'updated_at'>): Promise<LandingPage> {
    const { data: landingPage, error } = await supabase
      .from('landing_pages')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return landingPage;
  }

  async getLandingPage(id: string): Promise<LandingPage> {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getLandingPageWithComponents(landingPageId: string): Promise<LandingPage & { components: LandingPageComponent[] }> {
    const { data: landingPage, error: pageError } = await supabase
      .from('landing_pages')
      .select(`
        *,
        components:landing_page_components(
          *,
          component_variation:component_variations(*)
        ),
        product:products(*),
        profile:profiles(*)
      `)
      .eq('id', landingPageId)
      .single();

    if (pageError) throw pageError;

    // Sort components by order_index
    const sortedComponents = landingPage.components?.sort((a, b) => a.order_index - b.order_index) || [];

    // Enrich with marketplace data
    const enrichedComponents = await this.enrichComponentsWithMarketplace(
      sortedComponents,
      landingPage.product,
      landingPage.profile
    );

    return {
      ...landingPage,
      components: enrichedComponents,
      marketplaceData: {
        product_id: landingPage.product?.id,
        price: landingPage.product?.price,
        currency: 'TND',
        checkout_url: this.generateCheckoutUrl(landingPage.product?.id, landingPage.profile?.id)
      }
    };
  }

  async updateLandingPage(id: string, updates: Partial<LandingPage>): Promise<LandingPage> {
    const { data, error } = await supabase
      .from('landing_pages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLandingPage(id: string): Promise<void> {
    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Component management methods
  async addComponent(pageId: string, componentData: Omit<LandingPageComponent, 'id' | 'page_id' | 'created_at' | 'updated_at'>): Promise<LandingPageComponent> {
    // Clean content to remove image URLs (they should be in media_urls)
    const cleanComponentData = { ...componentData };
    if (cleanComponentData.content) {
      cleanComponentData.content = cleanContentFromImageUrls(cleanComponentData.content);
    }
    
    // Remove the 'styles' property as it doesn't exist in database schema
    // The database only has 'custom_styles', 'content', 'visibility' etc.
    const { styles, ...dbComponentData } = cleanComponentData;
    
    // Calculate order_index as number of existing components + 1 (1,2,3...)
    const { data: existingComponents } = await supabase
      .from('landing_page_components')
      .select('id')
      .eq('page_id', pageId);
    
    const orderIndex = (existingComponents?.length || 0) + 1;
    
    const { data, error } = await supabase
      .from('landing_page_components')
      .insert([{
        ...dbComponentData,
        page_id: pageId,
        order_index: orderIndex,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        component_variation:component_variations(*)
      `)
      .single();

    if (error) throw error;
    
    // Add the 'styles' property for frontend compatibility
    // Frontend expects both 'styles' and 'custom_styles' but database only has 'custom_styles'
    const componentWithStyles = {
      ...data,
      styles: data.custom_styles || {}
    };
    
    return componentWithStyles;
  }

  async updateComponent(componentId: string, updates: Partial<LandingPageComponent>): Promise<LandingPageComponent> {
    // Clean content if it's being updated
    const cleanUpdates = { ...updates };
    if (cleanUpdates.content) {
      cleanUpdates.content = cleanContentFromImageUrls(cleanUpdates.content);
    }
    
    const { data, error } = await supabase
      .from('landing_page_components')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', componentId)
      .select(`
        *,
        component_variation:component_variations(*)
      `)
      .single();

    if (error) throw error;
    
    // Add the 'styles' property for frontend compatibility
    const componentWithStyles = {
      ...data,
      styles: data.custom_styles || {}
    };
    
    return componentWithStyles;
  }

  async deleteComponent(componentId: string): Promise<void> {
    const { error } = await supabase
      .from('landing_page_components')
      .delete()
      .eq('id', componentId);

    if (error) throw error;
  }

  async reorderComponents(pageId: string, newOrder: string[]): Promise<void> {
    const updates = newOrder.map((id, index) => 
      supabase
        .from('landing_page_components')
        .update({ 
          order_index: (index + 1),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Failed to reorder components: ${errors[0].error?.message}`);
    }
  }

  async updateComponentStyles(componentId: string, styles: Record<string, unknown>): Promise<void> {
    const { error } = await supabase
      .from('landing_page_components')
      .update({
        custom_styles: styles,
        updated_at: new Date().toISOString()
      })
      .eq('id', componentId);

    if (error) throw error;
  }

  async updateComponentContent(componentId: string, content: Record<string, unknown>): Promise<void> {
    // Clean content to remove image URLs (they should be in media_urls)
    const cleanContent = cleanContentFromImageUrls(content);
    
    const { error } = await supabase
      .from('landing_page_components')
      .update({
        content: cleanContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', componentId);

    if (error) throw error;
  }

  async updateComponentVisibility(componentId: string, visibility: Record<string, boolean>): Promise<void> {
    const { error } = await supabase
      .from('landing_page_components')
      .update({
        visibility: visibility,
        updated_at: new Date().toISOString()
      })
      .eq('id', componentId);

    if (error) throw error;
  }

  // Component variations methods
  async getComponentVariations(): Promise<ComponentVariation[]> {
    const { data, error } = await supabase
      .from('component_variations')
      .select('*')
      .eq('is_active', true)
      .order('component_type', { ascending: true })
      .order('variation_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getComponentVariationsByType(componentType: string): Promise<ComponentVariation[]> {
    const { data, error } = await supabase
      .from('component_variations')
      .select('*')
      .eq('component_type', componentType)
      .eq('is_active', true)
      .order('variation_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getComponentVariation(id: string): Promise<ComponentVariation> {
    const { data, error } = await supabase
      .from('component_variations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Marketplace integration
  async enrichComponentsWithMarketplace(
    components: LandingPageComponent[],
    product: unknown,
    profile: unknown
  ): Promise<LandingPageComponent[]> {
    if (!product || !profile) {
      return components;
    }

    const productData = product as { id: string; price: number };
    const profileData = profile as { id: string };

    const marketplaceData: MarketplaceData = {
      product_id: productData.id,
      price: productData.price,
      currency: 'TND',
      checkout_url: this.generateCheckoutUrl(productData.id, profileData.id)
    };

    return components.map(component => ({
      ...component,
      styles: component.custom_styles || {}, // Add styles property for frontend compatibility
      marketplace_data: marketplaceData
    }));
  }

  private generateCheckoutUrl(productId: string, sellerId: string): string {
    return `https://yourdomain.com/checkout/${productId}?seller=${sellerId}`;
  }

  // Landing page by slug
  async getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  // Search and filter methods
  async searchLandingPages(query: string, userId?: string): Promise<LandingPage[]> {
    let queryBuilder = supabase
      .from('landing_pages')
      .select('*')
      .or(`slug.ilike.%${query}%,seo_config->title.ilike.%${query}%`);

    if (userId) {
      queryBuilder = queryBuilder.eq('user_id', userId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw error;
    return data;
  }

  async getUserLandingPages(userId: string): Promise<LandingPage[]> {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Status management
  async updateLandingPageStatus(id: string, status: 'draft' | 'published' | 'deploying'): Promise<void> {
    const { error } = await supabase
      .from('landing_pages')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        ...(status === 'published' && { last_deployed_at: new Date().toISOString() })
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Theme and SEO management
  async updateTheme(id: string, theme: Record<string, unknown>): Promise<void> {
    const { error } = await supabase
      .from('landing_pages')
      .update({
        global_theme: theme,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async updateSEO(id: string, seoConfig: Record<string, unknown>): Promise<void> {
    const { error } = await supabase
      .from('landing_pages')
      .update({
        seo_config: seoConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Deployment tracking
  async updateDeploymentInfo(id: string, netlifyInfo: { site_id: string; url: string }): Promise<void> {
    const { error } = await supabase
      .from('landing_pages')
      .update({
        netlify_site_id: netlifyInfo.site_id,
        status: 'published',
        last_deployed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async updateCustomDomain(id: string, domain: string): Promise<void> {
    const { error } = await supabase
      .from('landing_pages')
      .update({
        custom_domain: domain,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }
}

export const landingPageService = LandingPageService.getInstance();