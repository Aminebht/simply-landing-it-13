// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// Use UnoCSS for Tailwind-like CSS generation
// Use jsDelivr ESM modules for UnoCSS
// Use UnoCSS for Tailwind-like CSS generation
import { createGenerator } from "https://esm.sh/@unocss/core@0.46.3?target=deno";
import presetWind from "https://esm.sh/@unocss/preset-wind@0.44.1?target=deno";
import { corsHeaders } from "../_shared/cors.ts";
import tailwindConfig from './tailwind.config.js';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { html } = await req.json();
    // Ensure html is a string
    const content = String(html);

    if (!html) {
      throw new Error("HTML content is required.");
    }

    // Configure UnoCSS generator with preset-wind (Tailwind-compatible)
    const uno = createGenerator({ presets: [presetWind(tailwindConfig)] });
    // Generate CSS for the provided HTML content
    const { css } = await uno.generate(content, { preflights: true });
    return new Response(
      JSON.stringify({ css }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
