-- Insert features component variations into component_variations table

-- Features Variation 1 (Basic Grid Layout)
INSERT INTO component_variations (
    id,
    component_type,
    variation_number,
    variation_name,
    description,
    default_content,
    character_limits,
    required_images,
    supports_video,
    button_actions,
    is_active,
    visibility_keys
) VALUES (
    gen_random_uuid(),
    'features',
    1,
    'Features - Basic Grid',
    'Simple grid layout with icon, title, and description for each feature',
    '{"sectionTitle": "Our Amazing Features", "description": "Discover what makes our product stand out from the rest. We have packed it with features that will boost your productivity.", "features": [{"icon": "✨", "title": "Modern Design", "description": "A sleek and contemporary design that captivates your audience."}, {"icon": "🚀", "title": "Highly Performant", "description": "Optimized for speed and a smooth user experience."}, {"icon": "🎨", "title": "Fully Customizable", "description": "Easily adapt the look and feel to match your brand."}]}',
    '{"sectionTitle": {"max_characters": 100}, "description": {"max_characters": 300}, "features": {"max_items": 6, "title": {"max_characters": 50}, "description": {"max_characters": 150}, "icon": {"max_characters": 10}}}',
    0,
    false,
    '{}',
    true,
    '[{"key": "sectionTitle", "label": ["Section Title"]}, {"key": "description", "label": ["Description"]}, {"key": "featureList", "label": ["Feature List"]}, {"key": "icons", "label": ["Feature Icons"]}]'
);

-- Features Variation 2 (Split Layout with Image)
INSERT INTO component_variations (
    id,
    component_type,
    variation_number,
    variation_name,
    description,
    default_content,
    character_limits,
    required_images,
    supports_video,
    button_actions,
    is_active,
    visibility_keys
) VALUES (
    gen_random_uuid(),
    'features',
    2,
    'Features - Split Layout',
    'Features list on the left with a main image on the right, includes call-to-action buttons',
    '{"sectionTitle": "Our Amazing Features", "description": "Discover what makes our product stand out from the rest. We have packed it with features that will boost your productivity.", "mainImageUrl": "https://via.placeholder.com/600x400", "features": [{"icon": "✨", "title": "Modern Design", "description": "A sleek and contemporary design that captivates your audience.", "buttonText": "Learn More", "action": {"type": "open_link", "url": "#", "newTab": false}}, {"icon": "🚀", "title": "Highly Performant", "description": "Optimized for speed and a smooth user experience.", "buttonText": "Learn More", "action": {"type": "open_link", "url": "#", "newTab": false}}, {"icon": "🎨", "title": "Fully Customizable", "description": "Easily adapt the look and feel to match your brand.", "buttonText": "Learn More", "action": {"type": "open_link", "url": "#", "newTab": false}}]}',
    '{"sectionTitle": {"max_characters": 100}, "description": {"max_characters": 300}, "features": {"max_items": 6, "title": {"max_characters": 50}, "description": {"max_characters": 150}, "buttonText": {"max_characters": 30}, "icon": {"max_characters": 10}}}',
    1,
    false,
    '{"featureButton": {"type": "link", "action": "navigate"}}',
    true,
    '[{"key": "sectionTitle", "label": ["Section Title"]}, {"key": "description", "label": ["Description"]}, {"key": "featureList", "label": ["Feature List"]}, {"key": "icons", "label": ["Feature Icons"]}, {"key": "mainImage", "label": ["Main Image"]}, {"key": "buttons", "label": ["Feature Buttons"]}]'
);

-- Features Variation 3 (Card Layout)
INSERT INTO component_variations (
    id,
    component_type,
    variation_number,
    variation_name,
    description,
    default_content,
    character_limits,
    required_images,
    supports_video,
    button_actions,
    is_active,
    visibility_keys
) VALUES (
    gen_random_uuid(),
    'features',
    3,
    'Features - Card Layout',
    'Features displayed in elevated cards with icons, perfect for showcasing benefits',
    '{"sectionTitle": "Why Partner With Us", "description": "Our commitment to excellence and innovation makes us the ideal partner for your next project.", "features": [{"icon": "💡", "title": "Innovative Ideas", "description": "We bring fresh perspectives to solve complex challenges."}, {"icon": "📈", "title": "Measurable Growth", "description": "Data-driven strategies that deliver tangible results."}, {"icon": "🤝", "title": "Collaborative Spirit", "description": "We work with you, not just for you, to achieve shared goals."}]}',
    '{"sectionTitle": {"max_characters": 100}, "description": {"max_characters": 300}, "features": {"max_items": 9, "title": {"max_characters": 50}, "description": {"max_characters": 150}, "icon": {"max_characters": 10}}}',
    0,
    false,
    '{}',
    true,
    '[{"key": "sectionTitle", "label": ["Section Title"]}, {"key": "description", "label": ["Description"]}, {"key": "featureList", "label": ["Feature List"]}, {"key": "icons", "label": ["Feature Icons"]}]'
);

-- Features Variation 4 (Tabbed Layout)
INSERT INTO component_variations (
    id,
    component_type,
    variation_number,
    variation_name,
    description,
    default_content,
    character_limits,
    required_images,
    supports_video,
    button_actions,
    is_active,
    visibility_keys
) VALUES (
    gen_random_uuid(),
    'features',
    4,
    'Features - Tabbed Layout',
    'Interactive tabbed layout with features on the left and detailed content with images on the right',
    '{"sectionTitle": "Everything You Need, All in One Place", "mainImageUrl": "https://via.placeholder.com/800x600", "features": [{"title": "Seamless Integration", "description": "Connect with your favorite tools in just a few clicks. Our extensive library of integrations makes your workflow smoother than ever.", "image": "https://via.placeholder.com/800x600?text=Integration"}, {"title": "Advanced Analytics", "description": "Gain deep insights into your performance with our comprehensive analytics dashboard. Track metrics that matter and make data-driven decisions.", "image": "https://via.placeholder.com/800x600?text=Analytics"}, {"title": "24/7 Priority Support", "description": "Our dedicated support team is always available to help you with any questions or issues. Get expert help whenever you need it.", "image": "https://via.placeholder.com/800x600?text=Support"}]}',
    '{"sectionTitle": {"max_characters": 100}, "features": {"max_items": 5, "title": {"max_characters": 60}, "description": {"max_characters": 200}}}',
    1,
    false,
    '{}',
    true,
    '[{"key": "sectionTitle", "label": ["Section Title"]}, {"key": "featureList", "label": ["Feature List"]}, {"key": "mainImage", "label": ["Feature Images"]}]'
);