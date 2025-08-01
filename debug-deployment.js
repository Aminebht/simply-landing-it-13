// Simple debug script to check landing pages in database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLandingPages() {
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('id, name, slug, netlify_site_id, status, last_deployed_at')
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching pages:', error)
      return
    }

    console.log('Current landing pages:')
    console.table(data)
    
    const withNetlify = data.filter(p => p.netlify_site_id)
    console.log(`\nPages with Netlify site ID: ${withNetlify.length}`)
    withNetlify.forEach(p => {
      console.log(`- ${p.name}: ${p.netlify_site_id}`)
    })
  } catch (err) {
    console.error('Connection error:', err)
  }
}

checkLandingPages()
