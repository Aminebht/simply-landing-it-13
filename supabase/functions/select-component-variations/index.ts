import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, productDescription, language = 'en' } = await req.json();

    if (!productName || !productDescription) {
      throw new Error('Product name and description are required');
    }

    console.log('Selecting component variations for:', { productName, language });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch component variations for hero and cta
    const { data: variations, error } = await supabase
      .from('component_variations')
      .select('id, component_type, description')
      .in('component_type', ['hero', 'cta'])
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch component variations: ${error.message}`);
    }

    if (!variations || variations.length === 0) {
      throw new Error('No component variations found');
    }

    console.log('Found variations:', variations.length);

    // Prepare variations data for AI prompt
    const variationsData = variations.map(v => ({
      id: v.id,
      component_type: v.component_type,
      description: v.description || `${v.component_type} variation`
    }));

    // Build AI prompt
    const prompt = `You are a smart layout selector for a product landing page.

Given the product name and description, and a list of possible variations for each section (hero, cta) with their IDs and short intent descriptions, select the best variation ID for each section.

Only output a JSON object with keys "hero" and "cta" and their chosen variation IDs as values.  
Do NOT include any explanations or extra text.

---

Product name: "${productName}"

Product description: ${productDescription}

${JSON.stringify(variationsData, null, 2)}

---

Output format example:
{
  "hero": "id",
  "cta": "id"
}`;

    console.log('Calling OpenRouter API...');

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${openRouterResponse.statusText}`);
    }

    const openRouterData = await openRouterResponse.json();
    const aiResponse = openRouterData.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse AI response
    let selectionResult;
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        selectionResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI component selection response');
    }

    // Validate that selected IDs exist
    const heroVariation = variations.find(v => v.id === selectionResult.hero && v.component_type === 'hero');
    const ctaVariation = variations.find(v => v.id === selectionResult.cta && v.component_type === 'cta');

    if (!heroVariation || !ctaVariation) {
      console.error('Invalid selection:', selectionResult);
      throw new Error('AI selected non-existent component variations');
    }

    console.log('Component selection successful:', selectionResult);

    return new Response(JSON.stringify({
      success: true,
      selections: selectionResult,
      selectedVariations: {
        hero: heroVariation,
        cta: ctaVariation
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in select-component-variations:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});