import { StaticGeneratorService } from './static-generator';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock Supabase client
const supabase = createClient(
  'https://mock-project-id.supabase.co',
  'mock-anon-key'
);

// Mock data
const mockLandingPageData = {
  id: 'test-page-id',
  product_id: null,
  user_id: 'test-user-id',
  slug: 'test-landing-page',
  custom_domain: null,
  netlify_site_id: null,
  global_theme: {
    primaryColor: '#FF0000',
    secondaryColor: '#00FF00',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    fontFamily: 'Arial',
    direction: 'ltr',
    language: 'en',
    customCss: 'h1 { color: purple; }'
  },
  seo_config: {
    title: 'Test Landing Page',
    description: 'This is a test landing page.',
    keywords: ['test', 'landing', 'page'],
    ogImage: 'https://example.com/og-image.jpg',
    canonical: 'https://example.com/test-landing-page'
  },
  tracking_config: {
    facebook_pixel_id: '1234567890',
    google_analytics_id: 'UA-XXXXX-Y',
    clarity_id: 'clarity-id'
  },
  status: 'published',
  last_deployed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockComponentsData = [
  {
    id: 'comp1',
    page_id: 'test-page-id',
    component_variation_id: 'var1',
    order_index: 1,
    content: { headline: 'Welcome!', subheadline: 'This is a test component.' },
    custom_styles: { container: { padding: '20px' } },
    visibility: { headline: true, subheadline: true },
    custom_actions: {},
    media_urls: {},
    component_variation: {
      id: 'var1',
      component_type: 'hero',
      variation_name: 'HeroVariation1',
      variation_number: 1,
      display_name: 'Hero - Variation 1',
      available_parts: [],
      part_labels: {},
      default_content: {},
      character_limits: {},
      required_images: 0,
      supports_video: false,
    },
  },
  {
    id: 'comp2',
    page_id: 'test-page-id',
    component_variation_id: 'var2',
    order_index: 2,
    content: { features: [{ title: 'Feature 1', description: 'Desc 1' }] },
    custom_styles: { container: { margin: '10px' } },
    visibility: { features: true },
    custom_actions: {},
    media_urls: {},
    component_variation: {
      id: 'var2',
      component_type: 'features',
      variation_name: 'FeaturesVariation1',
      variation_number: 1,
      display_name: 'Features - Variation 1',
      available_parts: [],
      part_labels: {},
      default_content: {},
      character_limits: {},
      required_images: 0,
      supports_video: false,
    },
  },
];

// Mock the supabase client methods
// @ts-ignore
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((tableName) => ({
      select: jest.fn((query) => {
        if (tableName === 'landing_pages') {
          return {
            eq: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockLandingPageData,
                error: null,
              })),
            })),
          };
        } else if (tableName === 'landing_page_components') {
          return {
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockComponentsData,
                error: null,
              })),
            })),
          };
        }
        return {};
      }),
    })),
  })),
}));

async function runTest() {
  const generator = new StaticGeneratorService();
  const pageId = 'test-page-id';

  try {
    const zipBlob = await generator.createZipPackage(pageId);
    console.log('Static page generated successfully!');

    // For testing in browser, you can create a download link
    const url = URL.createObjectURL(zipBlob);
    console.log('Zip blob created successfully, size:', zipBlob.size);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error generating static page:', error);
  }
}

runTest();


