-- Optional migration for landing page contact forms
-- This is a simple table that works with your existing schema
-- You can run this if you want to store form submissions in the database

-- Table for contact form submissions from landing pages
CREATE TABLE IF NOT EXISTS landing_page_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  form_type TEXT DEFAULT 'contact' NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  utm_data JSONB DEFAULT '{}',
  session_id TEXT,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_landing_page_contacts_page_id ON landing_page_contacts(page_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_contacts_created_at ON landing_page_contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_landing_page_contacts_form_type ON landing_page_contacts(form_type);

-- RLS policies for security
ALTER TABLE landing_page_contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for contact forms
CREATE POLICY "Allow anonymous contact submissions" ON landing_page_contacts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to read contact submissions
CREATE POLICY "Users can read contact submissions" ON landing_page_contacts
  FOR SELECT TO authenticated
  USING (true);

-- Grant permissions
GRANT INSERT ON landing_page_contacts TO anon;
GRANT SELECT ON landing_page_contacts TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_landing_page_contacts_updated_at 
  BEFORE UPDATE ON landing_page_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get contact form submissions for a page
CREATE OR REPLACE FUNCTION get_page_contacts(page_id_param UUID, limit_param INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  form_type TEXT,
  form_data JSONB,
  utm_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lpc.id,
    lpc.form_type,
    lpc.form_data,
    lpc.utm_data,
    lpc.created_at
  FROM landing_page_contacts lpc
  WHERE lpc.page_id = page_id_param
  ORDER BY lpc.created_at DESC
  LIMIT limit_param;
END;
$$;

GRANT EXECUTE ON FUNCTION get_page_contacts TO authenticated;
