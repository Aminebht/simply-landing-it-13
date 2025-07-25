
-- Insert CTA variations into component_variations table
INSERT INTO component_variations (
  id,
  component_type,
  variation_name,
  variation_number,
  default_content,
  character_limits,
  required_images,
  supports_video,
  button_actions,
  visibility_keys,
  is_active
) VALUES
-- CTA Variation 1: Minimal Card
(
  gen_random_uuid(),
  'cta',
  'Minimal Card CTA',
  1,
  '{
    "headline": "Ready to Get Started?",
    "subheadline": "Join thousands of satisfied customers today",
    "ctaButton": "Start Your Journey",
    "price": "$49",
    "priceLabel": "per month",
    "features": ["Feature 1", "Feature 2", "Feature 3"],
    "testimonial": "This product changed my life!",
    "testimonialAuthor": "John Doe"
  }'::jsonb,
  '{
    "headline": {"max_characters": 60},
    "subheadline": {"max_characters": 120},
    "ctaButton": {"max_characters": 25},
    "price": {"max_characters": 20},
    "priceLabel": {"max_characters": 30},
    "testimonial": {"max_characters": 150},
    "testimonialAuthor": {"max_characters": 50}
  }'::jsonb,
  1,
  false,
  '{
    "cta-button": {
      "type": "open_link",
      "url": "#",
      "newTab": false
    }
  }'::jsonb,
  '[
    {"key": "headline", "label": ["Headline"]},
    {"key": "subheadline", "label": ["Subheadline"]},
    {"key": "pricing", "label": ["Pricing"]},
    {"key": "features", "label": ["Features"]},
    {"key": "testimonial", "label": ["Testimonial"]},
    {"key": "ctaButton", "label": ["CTA Button"]},
    {"key": "checkoutForm", "label": ["Checkout Form"]}
  ]'::jsonb,
  true
),
-- CTA Variation 2: Bold Gradient
(
  gen_random_uuid(),
  'cta',
  'Bold Gradient CTA',
  2,
  '{
    "headline": "Transform Your Business Today",
    "subheadline": "Get instant access to premium features",
    "ctaButton": "Get Started Now",
    "urgencyText": "Limited Time Offer",
    "discount": "50% OFF",
    "originalPrice": "$99",
    "currentPrice": "$49"
  }'::jsonb,
  '{
    "headline": {"max_characters": 60},
    "subheadline": {"max_characters": 120},
    "ctaButton": {"max_characters": 25},
    "urgencyText": {"max_characters": 40},
    "discount": {"max_characters": 15},
    "originalPrice": {"max_characters": 20},
    "currentPrice": {"max_characters": 20}
  }'::jsonb,
  0,
  false,
  '{
    "cta-button": {
      "type": "open_link",
      "url": "#",
      "newTab": false
    }
  }'::jsonb,
  '[
    {"key": "headline", "label": ["Headline"]},
    {"key": "subheadline", "label": ["Subheadline"]},
    {"key": "pricing", "label": ["Pricing"]},
    {"key": "urgency", "label": ["Urgency Text"]},
    {"key": "ctaButton", "label": ["CTA Button"]},
    {"key": "checkoutForm", "label": ["Checkout Form"]}
  ]'::jsonb,
  true
),
-- CTA Variation 3: Split Layout
(
  gen_random_uuid(),
  'cta',
  'Split Layout CTA',
  3,
  '{
    "headline": "Unlock Premium Features",
    "subheadline": "Everything you need to succeed",
    "ctaButton": "Start Free Trial",
    "benefitsList": ["24/7 Support", "Advanced Analytics", "Premium Templates"],
    "guaranteeText": "30-day money-back guarantee"
  }'::jsonb,
  '{
    "headline": {"max_characters": 60},
    "subheadline": {"max_characters": 120},
    "ctaButton": {"max_characters": 25},
    "guaranteeText": {"max_characters": 80}
  }'::jsonb,
  1,
  false,
  '{
    "cta-button": {
      "type": "open_link",
      "url": "#",
      "newTab": false
    }
  }'::jsonb,
  '[
    {"key": "headline", "label": ["Headline"]},
    {"key": "subheadline", "label": ["Subheadline"]},
    {"key": "benefits", "label": ["Benefits"]},
    {"key": "guarantee", "label": ["Guarantee"]},
    {"key": "ctaButton", "label": ["CTA Button"]},
    {"key": "checkoutForm", "label": ["Checkout Form"]},
    {"key": "productImage", "label": ["Product Image"]}
  ]'::jsonb,
  true
),
-- CTA Variation 4: Floating Elements
(
  gen_random_uuid(),
  'cta',
  'Floating Elements CTA',
  4,
  '{
    "headline": "Join the Revolution",
    "subheadline": "Be part of something bigger",
    "ctaButton": "Join Now",
    "statNumber1": "10K+",
    "statLabel1": "Happy Users",
    "statNumber2": "99%",
    "statLabel2": "Satisfaction",
    "badgeText": "Most Popular"
  }'::jsonb,
  '{
    "headline": {"max_characters": 60},
    "subheadline": {"max_characters": 120},
    "ctaButton": {"max_characters": 25},
    "statNumber1": {"max_characters": 10},
    "statLabel1": {"max_characters": 30},
    "statNumber2": {"max_characters": 10},
    "statLabel2": {"max_characters": 30},
    "badgeText": {"max_characters": 20}
  }'::jsonb,
  0,
  false,
  '{
    "cta-button": {
      "type": "open_link",
      "url": "#",
      "newTab": false
    }
  }'::jsonb,
  '[
    {"key": "headline", "label": ["Headline"]},
    {"key": "subheadline", "label": ["Subheadline"]},
    {"key": "stats", "label": ["Statistics"]},
    {"key": "badge", "label": ["Badge"]},
    {"key": "ctaButton", "label": ["CTA Button"]},
    {"key": "checkoutForm", "label": ["Checkout Form"]}
  ]'::jsonb,
  true
),
-- CTA Variation 5: Sidebar Form
(
  gen_random_uuid(),
  'cta',
  'Sidebar Form CTA',
  5,
  '{
    "headline": "Get Instant Access",
    "subheadline": "Start your journey today",
    "ctaButton": "Get Access",
    "featureTitle1": "Advanced Features",
    "featureDesc1": "Access to premium tools",
    "featureTitle2": "Expert Support",
    "featureDesc2": "24/7 customer assistance",
    "featureTitle3": "Regular Updates",
    "featureDesc3": "Always stay current"
  }'::jsonb,
  '{
    "headline": {"max_characters": 60},
    "subheadline": {"max_characters": 120},
    "ctaButton": {"max_characters": 25},
    "featureTitle1": {"max_characters": 40},
    "featureDesc1": {"max_characters": 80},
    "featureTitle2": {"max_characters": 40},
    "featureDesc2": {"max_characters": 80},
    "featureTitle3": {"max_characters": 40},
    "featureDesc3": {"max_characters": 80}
  }'::jsonb,
  0,
  false,
  '{
    "cta-button": {
      "type": "open_link",
      "url": "#",
      "newTab": false
    }
  }'::jsonb,
  '[
    {"key": "headline", "label": ["Headline"]},
    {"key": "subheadline", "label": ["Subheadline"]},
    {"key": "features", "label": ["Features"]},
    {"key": "ctaButton", "label": ["CTA Button"]},
    {"key": "checkoutForm", "label": ["Checkout Form"]}
  ]'::jsonb,
  true
),
-- CTA Variation 6: Full-Width Banner
(
  gen_random_uuid(),
  'cta',
  'Full-Width Banner CTA',
  6,
  '{
    "headline": "Don\'t Miss Out",
    "subheadline": "Limited time offer ends soon",
    "ctaButton": "Claim Your Spot",
    "countdownTitle": "Offer Expires In:",
    "socialProof": "Join 50,000+ satisfied customers",
    "bonusText": "Plus get exclusive bonuses worth $200"
  }'::jsonb,
  '{
    "headline": {"max_characters": 60},
    "subheadline": {"max_characters": 120},
    "ctaButton": {"max_characters": 25},
    "countdownTitle": {"max_characters": 30},
    "socialProof": {"max_characters": 80},
    "bonusText": {"max_characters": 100}
  }'::jsonb,
  1,
  false,
  '{
    "cta-button": {
      "type": "open_link",
      "url": "#",
      "newTab": false
    }
  }'::jsonb,
  '[
    {"key": "headline", "label": ["Headline"]},
    {"key": "subheadline", "label": ["Subheadline"]},
    {"key": "countdown", "label": ["Countdown"]},
    {"key": "socialProof", "label": ["Social Proof"]},
    {"key": "bonus", "label": ["Bonus Text"]},
    {"key": "ctaButton", "label": ["CTA Button"]},
    {"key": "checkoutForm", "label": ["Checkout Form"]},
    {"key": "backgroundImage", "label": ["Background Image"]}
  ]'::jsonb,
  true
);
