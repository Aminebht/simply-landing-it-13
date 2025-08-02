// Test SEO meta tag generation
import { ReactDeploymentService } from '../services/react-deployment-service';

// Mock page data matching the user's example
const mockPageData = {
  id: 'test-page',
  slug: 'test-landing-page',
  seo_config: {
    title: "From Scroll to Sell -The 13-Step Sell System",
    ogImage: "https://khzybqddgilzocnnalgf.supabase.co/storage/v1/object/public/product-files/390f357d-fd8a-439b-8f45-d5907d46f365.webp",
    keywords: ["marketing", "sales", "conversion"],
    canonical: "https://example.com/custom-url",
    description: "great product"
  },
  global_theme: {
    language: 'en',
    direction: 'ltr'
  },
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z'
};

async function testSEOGeneration() {
  try {
    const deploymentService = new ReactDeploymentService('test-token');
    
    // Access the private method through type assertion for testing
    const seoTags = (deploymentService as any).generateSEOMetaTags(mockPageData, 'https://test-deployment.netlify.app');
    
    console.log('Generated SEO Meta Tags:');
    console.log(seoTags);
    
    // Verify key elements are present
    const hasTitle = seoTags.includes('og:title');
    const hasDescription = seoTags.includes('great product');
    const hasImage = seoTags.includes('390f357d-fd8a-439b-8f45-d5907d46f365.webp');
    const hasCanonical = seoTags.includes('example.com/custom-url');
    const hasStructuredData = seoTags.includes('application/ld+json');
    
    console.log('\nSEO Elements Check:');
    console.log('✅ Title:', hasTitle);
    console.log('✅ Description:', hasDescription);
    console.log('✅ OG Image:', hasImage);
    console.log('✅ Canonical URL:', hasCanonical);
    console.log('✅ Structured Data:', hasStructuredData);
    
    if (hasTitle && hasDescription && hasImage && hasCanonical && hasStructuredData) {
      console.log('\n🎉 All SEO elements are correctly generated!');
    } else {
      console.log('\n❌ Some SEO elements are missing');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

export { testSEOGeneration };
