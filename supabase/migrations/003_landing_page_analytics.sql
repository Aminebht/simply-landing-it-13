-- Landing Page Analytics and Form Submissions Tables
-- This migration creates tables to store data from hosted landing pages

-- Table for form submissions from all landing pages
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  page_slug TEXT,
  page_url TEXT,
  form_type TEXT DEFAULT 'contact',
  form_data JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for analytics events from all landing pages
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for page visits and sessions
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  utm_parameters JSONB DEFAULT '{}',
  viewport_width INTEGER,
  viewport_height INTEGER,
  time_on_page INTEGER, -- in seconds
  max_scroll_depth INTEGER, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_page_id ON form_submissions(page_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON form_submissions(form_type);

CREATE INDEX IF NOT EXISTS idx_page_analytics_page_id ON page_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_event_type ON page_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON page_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_page_analytics_session_id ON page_analytics(session_id);

CREATE INDEX IF NOT EXISTS idx_page_visits_page_id ON page_visits(page_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_session_id ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits(created_at);

-- RLS Policies for security
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for landing page data collection
CREATE POLICY "Allow anonymous form submissions" ON form_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous analytics" ON page_analytics
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous page visits" ON page_visits
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read form submissions" ON form_submissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can read analytics" ON page_analytics
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can read page visits" ON page_visits
  FOR SELECT TO authenticated
  USING (true);

-- Create a view for aggregated analytics
CREATE OR REPLACE VIEW landing_page_stats AS
SELECT 
  fa.page_id,
  COUNT(DISTINCT fa.session_id) as unique_visitors,
  COUNT(*) FILTER (WHERE fa.event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE fa.event_type = 'button_click') as button_clicks,
  COUNT(*) FILTER (WHERE fa.event_type = 'form_submission') as form_submissions,
  COUNT(*) FILTER (WHERE fa.event_type = 'checkout_initiated') as checkout_initiated,
  AVG((fa.event_data->>'time_seconds')::numeric) FILTER (WHERE fa.event_type = 'time_on_page') as avg_time_on_page,
  AVG((fa.event_data->>'scroll_percent')::numeric) FILTER (WHERE fa.event_type = 'scroll_depth') as avg_scroll_depth,
  DATE_TRUNC('day', fa.created_at) as date
FROM page_analytics fa
GROUP BY fa.page_id, DATE_TRUNC('day', fa.created_at)
ORDER BY date DESC;

-- Create a function to get page performance summary
CREATE OR REPLACE FUNCTION get_page_performance(page_id_param TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_visitors BIGINT,
  total_page_views BIGINT,
  total_form_submissions BIGINT,
  conversion_rate NUMERIC,
  avg_time_on_page NUMERIC,
  top_traffic_sources JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pa.session_id) as total_visitors,
    COUNT(*) FILTER (WHERE pa.event_type = 'page_view') as total_page_views,
    (SELECT COUNT(*) FROM form_submissions fs WHERE fs.page_id = page_id_param AND fs.created_at >= NOW() - INTERVAL '1 day' * days_back) as total_form_submissions,
    CASE 
      WHEN COUNT(DISTINCT pa.session_id) > 0 
      THEN ROUND(((SELECT COUNT(*) FROM form_submissions fs WHERE fs.page_id = page_id_param AND fs.created_at >= NOW() - INTERVAL '1 day' * days_back)::NUMERIC / COUNT(DISTINCT pa.session_id)::NUMERIC) * 100, 2)
      ELSE 0
    END as conversion_rate,
    AVG((pa.event_data->>'time_seconds')::numeric) FILTER (WHERE pa.event_type = 'time_on_page') as avg_time_on_page,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('source', utm_source, 'count', source_count))
       FROM (
         SELECT utm_source, COUNT(*) as source_count
         FROM form_submissions fs
         WHERE fs.page_id = page_id_param 
           AND fs.created_at >= NOW() - INTERVAL '1 day' * days_back
           AND utm_source IS NOT NULL
         GROUP BY utm_source
         ORDER BY source_count DESC
         LIMIT 5
       ) sources),
      '[]'::jsonb
    ) as top_traffic_sources
  FROM page_analytics pa
  WHERE pa.page_id = page_id_param
    AND pa.created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON form_submissions TO anon;
GRANT INSERT ON page_analytics TO anon;
GRANT INSERT ON page_visits TO anon;

GRANT SELECT ON landing_page_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_page_performance TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON form_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_visits_updated_at BEFORE UPDATE ON page_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
