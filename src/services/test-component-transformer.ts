import { ComponentTransformerService } from './component-transformer';
import { LandingPageComponent } from '@/types/components';

// Test the unified component transformer
async function testComponentTransformer() {
  const transformer = new ComponentTransformerService();

  // Test data for different component types
  const testComponents = [
    // Hero Component Test
    {
      id: 'hero-test',
      page_id: 'test-page',
      component_variation_id: 'hero-var-1',
      order_index: 1,
      content: {
        headline: 'Welcome to Our Amazing Product',
        subheadline: 'The best solution for your business needs',
        ctaText: 'Get Started Now',
        badge: '🚀 New Release',
        price: '29.99',
        currency: 'USD',
        originalPrice: '49.99'
      },
      styles: {},
      visibility: {
        headline: true,
        subheadline: true,
        ctaButton: true,
        badge: true,
        price: true
      },
      media_urls: {
        productImage: 'https://via.placeholder.com/600x400'
      },
      custom_actions: {
        cta: {
          type: 'open_link',
          url: 'https://example.com/signup',
          newTab: true
        }
      },
      component_variation: {
        id: 'hero-var-1',
        component_type: 'hero',
        variation_name: 'Hero Variation 1',
        variation_number: 1,
        description: 'Standard hero layout',
        default_content: {},
        character_limits: {},
        required_images: 1,
        supports_video: false,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as LandingPageComponent,

    // Features Component Test
    {
      id: 'features-test',
      page_id: 'test-page',
      component_variation_id: 'features-var-1',
      order_index: 2,
      content: {
        sectionTitle: 'Amazing Features',
        description: 'Discover what makes us special',
        features: [
          { title: 'Fast Performance', description: 'Lightning fast loading times', icon: '⚡' },
          { title: 'Secure', description: 'Bank-level security', icon: '🔒' },
          { title: '24/7 Support', description: 'Always here to help', icon: '💬' }
        ]
      },
      styles: {},
      visibility: {
        sectionTitle: true,
        description: true,
        icons: true
      },
      media_urls: {},
      custom_actions: {},
      component_variation: {
        id: 'features-var-1',
        component_type: 'features',
        variation_name: 'Features Variation 1',
        variation_number: 1,
        description: 'Standard features layout',
        default_content: {},
        character_limits: {},
        required_images: 0,
        supports_video: false,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as LandingPageComponent,

    // CTA Component Test
    {
      id: 'cta-test',
      page_id: 'test-page',
      component_variation_id: 'cta-var-1',
      order_index: 3,
      content: {
        headline: 'Ready to Get Started?',
        subheadline: 'Join thousands of satisfied customers',
        ctaText: 'Start Free Trial'
      },
      styles: {},
      visibility: {
        headline: true,
        subheadline: true,
        ctaButton: true
      },
      media_urls: {},
      custom_actions: {
        cta: {
          type: 'checkout',
          productId: 'prod_123',
          amount: 29.99,
          checkoutUrl: 'https://checkout.stripe.com/pay/cs_test_123'
        }
      },
      component_variation: {
        id: 'cta-var-1',
        component_type: 'cta',
        variation_name: 'CTA Variation 1',
        variation_number: 1,
        description: 'Standard CTA layout',
        default_content: {},
        character_limits: {},
        required_images: 0,
        supports_video: false,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    } as LandingPageComponent
  ];

  const globalTheme = {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    direction: 'ltr',
    language: 'en'
  };

  console.log('🚀 Testing Component Transformer Service');
  console.log('==========================================\n');

  // Test each component type
  for (const component of testComponents) {
    const componentType = component.component_variation?.component_type;
    const variationNumber = component.component_variation?.variation_number;
    
    console.log(`📋 Testing ${componentType} component (Variation ${variationNumber})`);
    console.log(`Component ID: ${component.id}`);
    
    try {
      const result = await transformer.transformComponent(component, {
        viewport: 'responsive',
        globalTheme,
        productData: { id: 'test-product', price: 29.99 }
      });

      console.log(`✅ Successfully transformed ${componentType} component`);
      console.log(`   HTML length: ${result.html.length} characters`);
      console.log(`   CSS length: ${result.css.length} characters`);
      console.log(`   JS length: ${result.js.length} characters`);
      
      // Log a preview of the generated HTML
      const htmlPreview = result.html.substring(0, 200).replace(/\s+/g, ' ').trim();
      console.log(`   HTML preview: ${htmlPreview}...`);
      
    } catch (error) {
      console.error(`❌ Failed to transform ${componentType} component:`, error);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎉 Component Transformer Test Complete!');
}

// Export for use in other files
export { testComponentTransformer };

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testComponentTransformer().catch(console.error);
}
