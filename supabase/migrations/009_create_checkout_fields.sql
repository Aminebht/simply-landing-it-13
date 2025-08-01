-- Create checkout_fields table for dynamic form rendering
CREATE TABLE checkout_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Field configuration
  field_key TEXT NOT NULL, -- e.g., 'email', 'full_name', 'phone', 'company'
  label TEXT NOT NULL, -- Human-readable label for the field
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Product association (empty array = show for all products)
  product_ids TEXT[] DEFAULT '{}',
  
  -- Seller/organization association
  seller_id TEXT, -- Can be null for global fields
  
  -- Field type and validation
  field_type TEXT DEFAULT 'text', -- 'text', 'email', 'tel', 'select', 'textarea'
  placeholder TEXT,
  validation_regex TEXT,
  options JSONB, -- For select fields: {"options": ["Option 1", "Option 2"]}
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Add updated_at trigger
CREATE TRIGGER set_checkout_fields_updated_at
  BEFORE UPDATE ON checkout_fields
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_checkout_fields_display_order ON checkout_fields (display_order);
CREATE INDEX idx_checkout_fields_active ON checkout_fields (is_active);
CREATE INDEX idx_checkout_fields_seller ON checkout_fields (seller_id);

-- Insert default checkout fields
INSERT INTO checkout_fields (field_key, label, is_required, display_order, field_type, placeholder) VALUES
  ('email', 'Email', true, 0, 'email', 'Enter your email address'),
  ('full_name', 'Full Name', true, 1, 'text', 'Enter your full name'),
  ('phone', 'Phone Number', false, 2, 'tel', 'Enter your phone number'),
  ('company', 'Company', false, 3, 'text', 'Enter your company name'),
  ('country', 'Country', false, 4, 'select', 'Select your country');

-- Update country field with options
UPDATE checkout_fields 
SET options = '{"options": ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Other"]}'
WHERE field_key = 'country';

-- Add comment
COMMENT ON TABLE checkout_fields IS 'Dynamic form fields for checkout and lead capture forms';
