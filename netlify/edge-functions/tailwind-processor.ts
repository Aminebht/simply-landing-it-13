import { Context } from "https://edge.netlify.com/";

export default async (request: Request, context: Context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { html, pageConfig } = await request.json();

    if (!html) {
      throw new Error('HTML content is required');
    }

    console.log('Processing HTML with Tailwind CSS...');

    // Run Tailwind CLI on the HTML to extract used classes
    const processedCSS = await generateTailwindCSS(html, pageConfig);

    // Inline the CSS into the HTML
    const finalHTML = inlineCSS(html, processedCSS);

    return new Response(JSON.stringify({
      success: true,
      html: finalHTML,
      css: processedCSS
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in tailwind-processor:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
};

async function generateTailwindCSS(html: string, pageConfig: any = {}): Promise<string> {
  // Create a temporary HTML file content for Tailwind to scan
  const tempHtmlContent = html;
  
  // Basic Tailwind CSS configuration
  const tailwindConfig = {
    content: [{ raw: tempHtmlContent, extension: 'html' }],
    theme: {
      extend: {
        colors: pageConfig?.global_theme ? {
          primary: pageConfig.global_theme.primaryColor || '#3b82f6',
          secondary: pageConfig.global_theme.secondaryColor || '#f3f4f6',
          background: pageConfig.global_theme.backgroundColor || '#ffffff',
        } : {},
        fontFamily: pageConfig?.global_theme?.fontFamily ? {
          sans: [pageConfig.global_theme.fontFamily, 'sans-serif'],
        } : {},
      },
    },
    plugins: [],
  };

  // Use Tailwind's built-in purge functionality to generate only used CSS
  // For edge function, we'll use a simplified approach
  const baseTailwindCSS = await generateBaseTailwindCSS();
  const extractedClasses = extractTailwindClasses(html);
  const purgedCSS = purgeTailwindCSS(baseTailwindCSS, extractedClasses);

  return purgedCSS;
}

async function generateBaseTailwindCSS(): Promise<string> {
  // Fetch the complete Tailwind CSS from CDN for 100% accuracy
  const tailwindCDNUrl = 'https://cdn.jsdelivr.net/npm/tailwindcss@4.1.11/index.min.css';
  
  try {
    console.log('Fetching Tailwind CSS from CDN...');
    const response = await fetch(tailwindCDNUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Tailwind CSS: ${response.status}`);
    }
    
    const tailwindCSS = await response.text();
    console.log('Successfully fetched Tailwind CSS from CDN');
    
    return tailwindCSS;
  } catch (error) {
    console.error('Error fetching Tailwind CSS from CDN:', error);
    
    // Fallback to a basic set if CDN fails
    console.log('Using fallback Tailwind CSS...');
    return `
/* Tailwind CSS Fallback - Basic Utilities */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
::before,::after{--tw-content:''}
html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}
body{margin:0;line-height:inherit}

.container{width:100%}
@media (min-width:640px){.container{max-width:640px}}
@media (min-width:768px){.container{max-width:768px}}
@media (min-width:1024px){.container{max-width:1024px}}
@media (min-width:1280px){.container{max-width:1280px}}
@media (min-width:1536px){.container{max-width:1536px}}

.block{display:block}
.inline-block{display:inline-block}
.flex{display:flex}
.grid{display:grid}
.hidden{display:none}

.flex-row{flex-direction:row}
.flex-col{flex-direction:column}
.items-center{align-items:center}
.justify-center{justify-content:center}
.justify-between{justify-content:space-between}

.m-0{margin:0}.m-1{margin:0.25rem}.m-2{margin:0.5rem}.m-3{margin:0.75rem}.m-4{margin:1rem}.m-6{margin:1.5rem}.m-8{margin:2rem}
.p-0{padding:0}.p-1{padding:0.25rem}.p-2{padding:0.5rem}.p-3{padding:0.75rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8{padding:2rem}

.text-sm{font-size:0.875rem;line-height:1.25rem}
.text-base{font-size:1rem;line-height:1.5rem}
.text-lg{font-size:1.125rem;line-height:1.75rem}
.text-xl{font-size:1.25rem;line-height:1.75rem}
.text-2xl{font-size:1.5rem;line-height:2rem}
.text-3xl{font-size:1.875rem;line-height:2.25rem}

.font-normal{font-weight:400}
.font-medium{font-weight:500}
.font-semibold{font-weight:600}
.font-bold{font-weight:700}

.text-center{text-align:center}
.text-left{text-align:left}

.text-white{color:#fff}
.text-black{color:#000}
.text-gray-600{color:#4b5563}
.text-gray-900{color:#111827}

.bg-white{background-color:#fff}
.bg-blue-500{background-color:#3b82f6}
.bg-blue-600{background-color:#2563eb}

.border{border-width:1px}
.rounded{border-radius:0.25rem}
.rounded-lg{border-radius:0.5rem}

.w-full{width:100%}
.h-full{height:100%}

.relative{position:relative}
.absolute{position:absolute}
    `.trim();
  }
}

function extractTailwindClasses(html: string): string[] {
  // Extract all class attributes from HTML
  const classRegex = /class=["']([^"']*?)["']/g;
  const classNameRegex = /className=["']([^"']*?)["']/g;
  const classes: string[] = [];
  let match;

  // Extract from class attributes
  while ((match = classRegex.exec(html)) !== null) {
    const classString = match[1];
    const classList = classString.split(/\s+/).filter(cls => cls.length > 0);
    classes.push(...classList);
  }

  // Extract from className attributes (React JSX)
  while ((match = classNameRegex.exec(html)) !== null) {
    const classString = match[1];
    const classList = classString.split(/\s+/).filter(cls => cls.length > 0);
    classes.push(...classList);
  }

  // Remove duplicates and normalize escaped characters
  const normalizedClasses = [...new Set(classes)].map(cls => {
    // Handle escaped characters in Tailwind classes (e.g., w-1\/2 becomes w-1/2)
    return cls.replace(/\\\//g, '/').replace(/\\\[/g, '[').replace(/\\\]/g, ']');
  });

  console.log('Extracted classes:', normalizedClasses.slice(0, 10), '... and', normalizedClasses.length - 10, 'more');
  return normalizedClasses;
}

function purgeTailwindCSS(css: string, usedClasses: string[]): string {
  console.log('Purging CSS for', usedClasses.length, 'classes...');
  
  // Create a set for faster lookups
  const usedClassesSet = new Set(usedClasses);
  
  // Split CSS into rules and filter based on used classes
  const rules = css.split('}').filter(rule => rule.trim());
  const purgedRules: string[] = [];
  
  for (const rule of rules) {
    const trimmedRule = rule.trim();
    if (!trimmedRule) continue;
    
    // Always include base styles, variables, and @-rules
    if (trimmedRule.startsWith('*') || 
        trimmedRule.startsWith('html') || 
        trimmedRule.startsWith('body') || 
        trimmedRule.startsWith('::') || 
        trimmedRule.startsWith('@') ||
        trimmedRule.includes('--tw-') ||
        !trimmedRule.includes('.')) {
      purgedRules.push(rule + '}');
      continue;
    }
    
    // Check if any used class matches this rule
    let shouldInclude = false;
    
    for (const usedClass of usedClasses) {
      // Escape special characters for CSS selector matching
      const escapedClass = usedClass
        .replace(/\//g, '\\/')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\./g, '\\.')
        .replace(/:/g, '\\:');
      
      // Check if this rule contains the class selector
      if (trimmedRule.includes('.' + escapedClass + '{') || 
          trimmedRule.includes('.' + escapedClass + ':') ||
          trimmedRule.includes('.' + escapedClass + ' ') ||
          trimmedRule.includes('.' + escapedClass + ',') ||
          trimmedRule.includes('.' + escapedClass + '\\:')) {
        shouldInclude = true;
        break;
      }
      
      // Also check for the non-escaped version
      if (trimmedRule.includes('.' + usedClass + '{') || 
          trimmedRule.includes('.' + usedClass + ':') ||
          trimmedRule.includes('.' + usedClass + ' ') ||
          trimmedRule.includes('.' + usedClass + ',')) {
        shouldInclude = true;
        break;
      }
    }
    
    if (shouldInclude) {
      purgedRules.push(rule + '}');
    }
  }
  
  const purgedCSS = purgedRules.join('\n');
  console.log('CSS purged from', css.length, 'to', purgedCSS.length, 'characters');
  
  return purgedCSS;
}

function inlineCSS(html: string, css: string): string {
  // Find the head tag and inject the CSS
  const headRegex = /<head[^>]*>/i;
  const match = html.match(headRegex);
  
  if (match) {
    const headTag = match[0];
    const headIndex = html.indexOf(headTag) + headTag.length;
    
    const inlinedCSS = `
<style>
${css}
</style>`;
    
    return html.slice(0, headIndex) + inlinedCSS + html.slice(headIndex);
  } else {
    // If no head tag found, add one with the CSS
    const htmlWithHead = html.replace(
      /<html[^>]*>/i, 
      `$&
<head>
<style>
${css}
</style>
</head>`
    );
    return htmlWithHead;
  }
}

export const config = {
  path: "/api/tailwind-processor"
};
