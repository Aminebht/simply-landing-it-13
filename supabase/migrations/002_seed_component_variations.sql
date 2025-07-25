-- Seed component variations data
INSERT INTO component_variations (component_type, variation_name, variation_number, display_name, description, available_parts, default_content, character_limits, required_images, supports_video, layout_type, button_actions) VALUES

-- HERO VARIATIONS
('hero', 'simple-minimal', 1, 'Hero - Simple Minimal', 'Clean and minimal hero section with headline, subheadline, and CTA', 
  ARRAY['headline', 'subheadline', 'ctaButton'], 
  '{"headline": "Build Amazing Landing Pages", "subheadline": "Create professional landing pages in minutes", "ctaButton": "Get Started Now"}',
  '{"headline": 100, "subheadline": 200, "ctaButton": 30}',
  0, false, 'single-column', '{"ctaButton": {"type": "link", "action": "navigate"}}'),

('hero', 'with-features', 2, 'Hero - With Features', 'Hero section with product image and feature highlights',
  ARRAY['headline', 'subheadline', 'ctaButton', 'productImage', 'features'],
  '{"headline": "The Complete Solution", "subheadline": "Everything you need to succeed", "ctaButton": "Start Free Trial", "features": ["Feature 1", "Feature 2", "Feature 3"]}',
  '{"headline": 100, "subheadline": 200, "ctaButton": 30}',
  1, false, 'two-column', '{"ctaButton": {"type": "link", "action": "navigate"}}'),

('hero', 'saas-platform', 3, 'Hero - SaaS Platform', 'Revolutionary SaaS platform hero with features, pricing, and product demo',
  ARRAY['badge', 'headline', 'subheadline', 'features', 'price', 'priceLabel', 'priceDescription', 'ctaButton', 'secondaryButton', 'trustIndicators', 'productDemo', 'productImage', 'productImageAlt', 'appUrl', 'stat1Value', 'stat1Label', 'stat2Value', 'stat2Label', 'stat3Value', 'stat3Label', 'chartTitle', 'chartPlaceholder', 'feature1Title', 'feature1Desc', 'feature2Title', 'feature2Desc', 'feature3Title', 'feature3Desc', 'trustCustomers', 'trustRating', 'trustUptime'],
  '{"badge": "🎯 Software Solution", "headline": "Revolutionary SaaS Platform", "subheadline": "Transform your business with our cutting-edge software solution. Streamline operations, boost productivity, and scale effortlessly.", "feature1Title": "Lightning Fast", "feature1Desc": "Process data 10x faster than traditional solutions", "feature2Title": "Bank-Level Security", "feature2Desc": "Enterprise-grade security with end-to-end encryption", "feature3Title": "Advanced Analytics", "feature3Desc": "Real-time insights and predictive analytics", "price": "$49", "priceLabel": "/month", "priceDescription": "Start your 14-day free trial. No credit card required.", "ctaButton": "Start Free Trial", "secondaryButton": "Watch Demo", "trustCustomers": "10,000+ customers", "trustRating": "4.9/5 rating", "trustUptime": "99.9% uptime", "productImageAlt": "Product Dashboard Screenshot", "appUrl": "app.yourplatform.com", "stat1Value": "248%", "stat1Label": "Growth Rate", "stat2Value": "$847K", "stat2Label": "Revenue", "stat3Value": "15.2K", "stat3Label": "Active Users", "chartTitle": "Analytics Overview", "chartPlaceholder": "Interactive Chart"}',
  '{"badge": 50, "headline": 100, "subheadline": 200, "feature1Title": 30, "feature1Desc": 100, "feature2Title": 30, "feature2Desc": 100, "feature3Title": 30, "feature3Desc": 100, "price": 20, "priceLabel": 20, "priceDescription": 150, "ctaButton": 30, "secondaryButton": 30, "trustCustomers": 30, "trustRating": 20, "trustUptime": 20, "productImageAlt": 50, "appUrl": 50, "stat1Value": 10, "stat1Label": 30, "stat2Value": 10, "stat2Label": 30, "stat3Value": 10, "stat3Label": 30, "chartTitle": 50, "chartPlaceholder": 30}',
  1, false, 'single-column', '{"ctaButton": {"type": "link", "action": "navigate"}, "secondaryButton": {"type": "link", "action": "navigate"}}'),

('hero', 'video-hero', 4, 'Hero - Video Hero', 'Hero section with embedded video player',
  ARRAY['headline', 'subheadline', 'videoEmbed', 'ctaButton'],
  '{"headline": "See It In Action", "subheadline": "Watch how our solution works", "ctaButton": "Start Your Journey", "videoUrl": "https://example.com/video.mp4"}',
  '{"headline": 100, "subheadline": 200, "ctaButton": 30}',
  0, true, 'single-column', '{"ctaButton": {"type": "link", "action": "navigate"}}'),

('hero', 'trust-hero', 5, 'Hero - Trust & Social Proof', 'Hero with trust badges and social proof',
  ARRAY['headline', 'subheadline', 'ctaButton', 'trustBadges', 'socialProof'],
  '{"headline": "Trusted by 10,000+ Companies", "subheadline": "Join the leaders in your industry", "ctaButton": "Join Now", "socialProof": "10,000+ happy customers", "trustBadges": ["ISO Certified", "SOC 2 Compliant", "99.9% Uptime"]}',
  '{"headline": 100, "subheadline": 200, "ctaButton": 30, "socialProof": 50}',
  0, false, 'single-column', '{"ctaButton": {"type": "link", "action": "navigate"}}'),

('hero', 'centered-hero', 6, 'Hero - Centered Focus', 'Centered hero with description and single CTA',
  ARRAY['headline', 'subheadline', 'description', 'ctaButton'],
  '{"headline": "Simple. Powerful. Effective.", "subheadline": "The only tool you need", "description": "Streamline your workflow with our all-in-one solution designed for modern teams.", "ctaButton": "Try It Free"}',
  '{"headline": 100, "subheadline": 200, "description": 300, "ctaButton": 30}',
  0, false, 'single-column', '{"ctaButton": {"type": "link", "action": "navigate"}}'),

-- TESTIMONIALS VARIATIONS
('testimonials', 'simple-grid', 1, 'Testimonials - Simple Grid', 'Clean grid layout with ratings and author images',
  ARRAY['sectionTitle', 'testimonials', 'authorImages', 'ratings'],
  '{"sectionTitle": "What Our Customers Say", "testimonials": [{"name": "John Doe", "text": "Amazing product!", "rating": 5, "image": ""}]}',
  '{"sectionTitle": 100, "testimonials": 500}',
  3, false, 'grid', '{}'),

('testimonials', 'with-logos', 2, 'Testimonials - With Company Logos', 'Testimonials with company logos for credibility',
  ARRAY['sectionTitle', 'testimonials', 'authorImages', 'companyLogos'],
  '{"sectionTitle": "Trusted by Leading Companies", "testimonials": [{"name": "Jane Smith", "text": "Exceptional service!", "company": "TechCorp", "image": "", "logo": ""}]}',
  '{"sectionTitle": 100, "testimonials": 500}',
  6, false, 'grid', '{}'),

-- FEATURES VARIATIONS
('features', 'icon-grid', 1, 'Features - Icon Grid', 'Features displayed in a grid with icons',
  ARRAY['sectionTitle', 'description', 'featureList', 'icons'],
  '{"sectionTitle": "Why Choose Us", "description": "Discover what makes us different", "featureList": [{"title": "Fast Performance", "description": "Lightning-fast loading times", "icon": "zap"}]}',
  '{"sectionTitle": 100, "description": 300, "featureList": 1000}',
  0, false, 'grid', '{}'),

-- PRICING VARIATIONS
('pricing', 'simple-cards', 1, 'Pricing - Simple Cards', 'Clean pricing cards with features and CTA buttons',
  ARRAY['sectionTitle', 'pricingCards', 'features', 'ctaButtons'],
  '{"sectionTitle": "Choose Your Plan", "pricingCards": [{"name": "Basic", "price": "29", "features": ["Feature 1", "Feature 2"], "cta": "Get Started"}]}',
  '{"sectionTitle": 100, "pricingCards": 2000}',
  0, false, 'grid', '{"ctaButtons": {"type": "link", "action": "navigate"}}'),

-- FAQ VARIATIONS
('faq', 'accordion-simple', 1, 'FAQ - Simple Accordion', 'Collapsible FAQ with search functionality',
  ARRAY['sectionTitle', 'accordion', 'searchBar'],
  '{"sectionTitle": "Frequently Asked Questions", "faqItems": [{"question": "How does it work?", "answer": "It works by..."}]}',
  '{"sectionTitle": 100, "faqItems": 3000}',
  0, false, 'single-column', '{}'),

-- CTA VARIATIONS
('cta', 'simple-urgency', 1, 'CTA - Simple with Urgency', 'Call-to-action with urgency text',
  ARRAY['headline', 'description', 'ctaButton', 'urgencyText'],
  '{"headline": "Ready to Get Started?", "description": "Join thousands of satisfied customers today", "ctaButton": "Start Now", "urgencyText": "Limited time offer!"}',
  '{"headline": 100, "description": 300, "ctaButton": 30, "urgencyText": 50}',
  0, false, 'single-column', '{"ctaButton": {"type": "link", "action": "navigate"}}');

-- Add more variations as placeholders for now (variations 2-6 for each type)
INSERT INTO component_variations (component_type, variation_name, variation_number, display_name, description, available_parts, default_content, character_limits, is_active) VALUES
('testimonials', 'placeholder-2', 2, 'Testimonials - Variation 2', 'Placeholder for testimonials variation 2', ARRAY['sectionTitle'], '{}', '{}', false),
('testimonials', 'placeholder-3', 3, 'Testimonials - Variation 3', 'Placeholder for testimonials variation 3', ARRAY['sectionTitle'], '{}', '{}', false),
('testimonials', 'placeholder-4', 4, 'Testimonials - Variation 4', 'Placeholder for testimonials variation 4', ARRAY['sectionTitle'], '{}', '{}', false),
('testimonials', 'placeholder-5', 5, 'Testimonials - Variation 5', 'Placeholder for testimonials variation 5', ARRAY['sectionTitle'], '{}', '{}', false),
('testimonials', 'placeholder-6', 6, 'Testimonials - Variation 6', 'Placeholder for testimonials variation 6', ARRAY['sectionTitle'], '{}', '{}', false),

('features', 'placeholder-2', 2, 'Features - Variation 2', 'Placeholder for features variation 2', ARRAY['sectionTitle'], '{}', '{}', false),
('features', 'placeholder-3', 3, 'Features - Variation 3', 'Placeholder for features variation 3', ARRAY['sectionTitle'], '{}', '{}', false),
('features', 'placeholder-4', 4, 'Features - Variation 4', 'Placeholder for features variation 4', ARRAY['sectionTitle'], '{}', '{}', false),
('features', 'placeholder-5', 5, 'Features - Variation 5', 'Placeholder for features variation 5', ARRAY['sectionTitle'], '{}', '{}', false),
('features', 'placeholder-6', 6, 'Features - Variation 6', 'Placeholder for features variation 6', ARRAY['sectionTitle'], '{}', '{}', false),

('pricing', 'placeholder-2', 2, 'Pricing - Variation 2', 'Placeholder for pricing variation 2', ARRAY['sectionTitle'], '{}', '{}', false),
('pricing', 'placeholder-3', 3, 'Pricing - Variation 3', 'Placeholder for pricing variation 3', ARRAY['sectionTitle'], '{}', '{}', false),
('pricing', 'placeholder-4', 4, 'Pricing - Variation 4', 'Placeholder for pricing variation 4', ARRAY['sectionTitle'], '{}', '{}', false),
('pricing', 'placeholder-5', 5, 'Pricing - Variation 5', 'Placeholder for pricing variation 5', ARRAY['sectionTitle'], '{}', '{}', false),
('pricing', 'placeholder-6', 6, 'Pricing - Variation 6', 'Placeholder for pricing variation 6', ARRAY['sectionTitle'], '{}', '{}', false),

('faq', 'placeholder-2', 2, 'FAQ - Variation 2', 'Placeholder for faq variation 2', ARRAY['sectionTitle'], '{}', '{}', false),
('faq', 'placeholder-3', 3, 'FAQ - Variation 3', 'Placeholder for faq variation 3', ARRAY['sectionTitle'], '{}', '{}', false),
('faq', 'placeholder-4', 4, 'FAQ - Variation 4', 'Placeholder for faq variation 4', ARRAY['sectionTitle'], '{}', '{}', false),
('faq', 'placeholder-5', 5, 'FAQ - Variation 5', 'Placeholder for faq variation 5', ARRAY['sectionTitle'], '{}', '{}', false),
('faq', 'placeholder-6', 6, 'FAQ - Variation 6', 'Placeholder for faq variation 6', ARRAY['sectionTitle'], '{}', '{}', false),

('cta', 'placeholder-2', 2, 'CTA - Variation 2', 'Placeholder for cta variation 2', ARRAY['headline'], '{}', '{}', false),
('cta', 'placeholder-3', 3, 'CTA - Variation 3', 'Placeholder for cta variation 3', ARRAY['headline'], '{}', '{}', false),
('cta', 'placeholder-4', 4, 'CTA - Variation 4', 'Placeholder for cta variation 4', ARRAY['headline'], '{}', '{}', false),
('cta', 'placeholder-5', 5, 'CTA - Variation 5', 'Placeholder for cta variation 5', ARRAY['headline'], '{}', '{}', false),
('cta', 'placeholder-6', 6, 'CTA - Variation 6', 'Placeholder for cta variation 6', ARRAY['headline'], '{}', '{}', false);
