-- This migration is no longer needed
-- We will use the existing netlify_site_id column to track deployments
-- The status and last_deployed_at columns already exist

SELECT 'Migration skipped - using existing netlify_site_id column' as message;
