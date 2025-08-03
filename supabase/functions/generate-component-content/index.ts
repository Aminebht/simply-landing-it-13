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
    const { productName, productDescription, language = 'en', componentVariationIds } = await req.json();

    if (!productName || !productDescription || !componentVariationIds) {
      throw new Error('Product name, description, and component variation IDs are required');
    }

    console.log('Generating content for variations:', componentVariationIds);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch component variations with their character limits and default content
    const { data: variations, error } = await supabase
      .from('component_variations')
      .select('id, component_type, character_limits, default_content')
      .in('id', Object.values(componentVariationIds));

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch component variations: ${error.message}`);
    }

    if (!variations || variations.length === 0) {
      throw new Error('No component variations found for provided IDs');
    }

    console.log('Found variations:', variations.length);

    // Build AI prompt for content generation
    const languageMap = {
      'en': 'English',
      'fr': 'French', 
      'ar': 'Arabic'
    };

    const targetLanguage = languageMap[language] || 'English';

    // Create example structure and character limits for each variation
    const exampleStructures = [];
    const characterLimitsInfo = [];

    for (const variation of variations) {
      const defaultContent = variation.default_content || {};
      const characterLimits = variation.character_limits || {};
      
      exampleStructures.push(defaultContent);
      characterLimitsInfo.push(characterLimits);
    }

    const prompt = `You are a content generation AI specialized in multilingual product marketing. Your primary goal is to generate structured product content in the specified language, strictly adhering to the provided JSON output structure and character limits.

Product Information:

• Product Name: ${productName}

• Product Description: ${productDescription}

• Target Language: ${targetLanguage}

Generate exactly ${variations.length} JSON objects for a landing page stacked in a single JSON array. The output must follow this exact structure (include all fields):
${JSON.stringify(exampleStructures, null, 2)}

Character Limits of the previous JSON respectively (Strictly adhere to these limits for each field):
${JSON.stringify(characterLimitsInfo, null, 2)}

Instructions for Content Generation:

1. All generated content MUST be in the specified Target Language.

2. The output MUST be a valid JSON array, precisely matching the Output Structure provided.

3. Each field's content MUST NOT exceed its max_characters limit.

4. DO NOT include any additional text, explanations, or formatting outside of the JSON array.

5. Return ONLY the filled JSON array.

6. Ensure the content is compelling, conversion-focused, and appropriate for the product type.

7. Use persuasive language that matches the product's tone and target audience.`;

    console.log('Calling OpenRouter API for content generation...');

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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${openRouterResponse.statusText}`);
    }

    const openRouterData = await openRouterResponse.json();
    const aiResponse = openRouterData.choices[0].message.content;

    console.log('AI Content Response received');

    // Parse AI response
    let generatedContent;
    try {
      // Extract JSON array from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI Response was:', aiResponse);
      throw new Error('Failed to parse AI content generation response');
    }

    // Validate generated content
    if (!Array.isArray(generatedContent) || generatedContent.length !== variations.length) {
      throw new Error(`Expected ${variations.length} content objects, got ${generatedContent?.length || 0}`);
    }

    // Map generated content to component variations
    const result = variations.map((variation, index) => ({
      variationId: variation.id,
      componentType: variation.component_type,
      content: generatedContent[index] || {},
      characterLimits: variation.character_limits || {}
    }));

    console.log('Content generation successful');

    return new Response(JSON.stringify({
      success: true,
      generatedContent: result,
      language: language
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-component-content:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});