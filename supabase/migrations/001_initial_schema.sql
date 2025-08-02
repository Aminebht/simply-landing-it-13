-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id uuid NOT NULL,
  username text NULL,
  avatar_url text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  comission numeric NOT NULL DEFAULT '100'::numeric,
  balance numeric NULL DEFAULT 0,
  bio text NULL,
  logo text NULL,
  email text NULL,
  is_verified boolean NULL DEFAULT false,
  is_company_verified boolean NULL DEFAULT false,
  is_creator boolean NOT NULL DEFAULT false,
  facebook_pixel_id text NULL,
  facebook_conversion_api_token text NULL,
  updated_at timestamp with time zone NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Products table
CREATE TABLE products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NULL,
  price numeric(10, 2) NOT NULL,
  file_url text NOT NULL,
  preview_image_url text NULL,
  seller_id uuid NOT NULL,
  categories text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  original_price numeric NOT NULL,
  tags text[] NULL DEFAULT '{}'::text[],
  archived boolean NULL DEFAULT false,
  deleted boolean NULL DEFAULT false,
  "Views" bigint NULL,
  stamp_pdf boolean NULL DEFAULT false,
  product_type text NOT NULL DEFAULT 'digital'::text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- Landing pages table
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES profiles(id),

  -- Page identification
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT,
  netlify_site_id TEXT UNIQUE,
  
   -- Global theme that applies to all components
  global_theme JSONB DEFAULT '{
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1f2937", 
    "backgroundColor": "#ffffff",
    "fontFamily": "Inter",
    "direction": "ltr",
    "language": "en"
  }',
  
  -- SEO settings for the entire page
  seo_config JSONB DEFAULT '{
    "title": "",
    "description": "",
    "keywords": [],
    "ogImage": "",
    "canonical": ""
  }',
  

  
  -- TRACKING & ANALYTICS (Page-level)
  tracking_config JSONB DEFAULT '{
    "facebook_pixel_id": "",
    "facebook_access_token": "",
    "google_analytics_id": "",
    "clarity_id":"",
    "conversion_events": {
      "page_view": true,
      "add_to_cart": true,
      "purchase": true
    }
  }',
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, published, deploying
  last_deployed_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Component variations table
CREATE TABLE component_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic component info
  component_type TEXT NOT NULL, -- 'hero', 'testimonials', 'features', 'pricing', 'cta', 'faq'
  variation_name TEXT NOT NULL, -- 'modern-minimal', 'bold-gradient', 'classic-centered', etc.
  variation_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  
  -- Display information
  display_name TEXT NOT NULL, -- 'Hero - Modern Minimal', 'Testimonials - Grid Layout'
  description TEXT, -- 'Clean design with subtle animations, perfect for SaaS products'  
  -- Component structure
  available_parts TEXT[] NOT NULL, -- ['headline', 'subheadline', 'ctaButton', 'heroImage']
  part_labels JSONB NOT NULL, -- {"headline": "Main Headline", "subheadline": "Supporting Text"}
  default_content JSONB DEFAULT '{}', -- Default content structure
  character_limits JSONB DEFAULT '{}',

  -- Technical details
  required_images INTEGER DEFAULT 0, -- Number of images this variation needs
  supports_video BOOLEAN DEFAULT false, -- Whether this variation supports video
  layout_type TEXT, -- 'single-column', 'two-column', 'grid', 'carousel'
  button_actions JSONB DEFAULT '{}',
  -- Status and timestamps
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT component_variations_type_name_unique UNIQUE (component_type, variation_name)
);

-- Add indexes for better query performance
CREATE INDEX idx_component_variations_type ON component_variations(component_type);
CREATE INDEX idx_component_variations_active ON component_variations(is_active);

-- Landing page components table
CREATE TABLE landing_page_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  component_variation_id UUID REFERENCES component_variations(id) NOT NULL,
  order_index DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- COMPONENT CONTENT
  content JSONB NOT NULL DEFAULT '{}',
  -- COMPONENT-SPECIFIC STYLES
  custom_styles JSONB DEFAULT '{}',
  -- COMPONENT VISIBILITY
  visibility JSONB DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deployment queue
CREATE TABLE deployment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID REFERENCES landing_pages(id),
  status TEXT DEFAULT 'pending',
  job_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_landing_pages_user_id ON landing_pages(user_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);
CREATE INDEX idx_landing_page_components_page_id ON landing_page_components(page_id);
CREATE INDEX idx_landing_page_components_order ON landing_page_components(page_id, order_index);
CREATE INDEX idx_deployment_jobs_status ON deployment_jobs(status);
CREATE INDEX idx_deployment_jobs_landing_page_id ON deployment_jobs(landing_page_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own products" ON products FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can insert their own products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own products" ON products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can view their own landing pages" ON landing_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own landing pages" ON landing_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own landing pages" ON landing_pages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Component variations are viewable by everyone" ON component_variations FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view components of their pages" ON landing_page_components FOR SELECT USING (
  page_id IN (SELECT id FROM landing_pages WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert components to their pages" ON landing_page_components FOR INSERT WITH CHECK (
  page_id IN (SELECT id FROM landing_pages WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update components of their pages" ON landing_page_components FOR UPDATE USING (
  page_id IN (SELECT id FROM landing_pages WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view their deployment jobs" ON deployment_jobs FOR SELECT USING (
  landing_page_id IN (SELECT id FROM landing_pages WHERE user_id = auth.uid())
);