# Tailwind Processing with Supabase Edge Functions

This document explains how the system processes HTML with ReactDOMServer.renderToStaticMarkup() and then uses Supabase Edge Functions to run Tailwind CLI and inline the optimized CSS.

## Overview

The system works in the following flow:

1. **HTML Generation**: Use `ReactDOMServer.renderToStaticMarkup()` to generate static HTML from React components
2. **Tailwind Processing**: Send the HTML and page configuration to a Supabase Edge Function
3. **CSS Generation**: The Edge Function runs Tailwind CLI to extract used classes and generate optimized CSS
4. **CSS Inlining**: The Edge Function inlines the optimized CSS into the HTML
5. **Return Processed HTML**: The final HTML with inlined Tailwind CSS is returned

## Files Structure

```
src/services/deployment/
├── html-generator.ts          # Main HTML generation with React SSR
├── tailwind-processor.ts      # Service to process HTML with Tailwind
└── post-deployment-processor.ts # Post-deployment processing

src/services/
└── supabase-edge-functions.ts # Centralized Supabase edge function service

supabase/functions/
└── tailwind-processor/
    └── index.ts               # Supabase Edge Function for Tailwind processing
```

## Usage Examples

### 1. Basic HTML Generation with Tailwind Processing

```typescript
import { HtmlGenerator } from './services/deployment/html-generator';

const htmlGenerator = new HtmlGenerator({
  suppressConsoleWarnings: true,
  cleanProductionHtml: true,
  enableTailwindProcessing: true
});

// Generate HTML with automatic Tailwind processing
const processedHTML = await htmlGenerator.generateReactHTML(pageData);
```

### 2. Manual Tailwind Processing

```typescript
import { TailwindProcessorService } from './services/deployment/tailwind-processor';

const processor = new TailwindProcessorService({
  fallbackMode: false // Use Supabase edge function
});

// Process existing HTML
const processedHTML = await processor.processHTML(originalHTML, pageConfig);
```

### 3. Using Supabase Edge Function Service Directly

```typescript
import { SupabaseEdgeFunctionService } from './services/supabase-edge-functions';

const supabaseService = SupabaseEdgeFunctionService.getInstance();

// Process HTML with Supabase edge function
const processedHTML = await supabaseService.processTailwindCSS(html, pageConfig);
```

### 3. Post-Deployment Processing

```typescript
import { ReactDeploymentService } from './services/react-deployment-service';

const deploymentService = new ReactDeploymentService(netlifyToken);

// Deploy first
const deployResult = await deploymentService.deployLandingPage(pageId);

// Then process with Tailwind via deployed edge function
const processResult = await deploymentService.processDeployedSiteWithTailwind(pageId);
```

### 4. Using Deployed Site's Edge Function

```typescript
import { TailwindProcessorService } from './services/deployment/tailwind-processor';

const processor = new TailwindProcessorService();

// Use the Supabase edge function (automatically configured)
const processedHTML = await processor.processHTMLWithDeployedSite(
  html,
  pageConfig,
  'https://your-site.netlify.app' // Site URL parameter not used for Supabase
);
```

## Edge Function Configuration

The Supabase Edge Function is automatically deployed and available at:
```
https://ijrisuqixfqzmlomljgb.supabase.co/functions/v1/tailwind-processor
```

## Edge Function API

### Request Format

```typescript
POST /functions/v1/tailwind-processor
Content-Type: application/json
Authorization: Bearer <supabase-anon-key>

{
  "html": "<html>...</html>",
  "pageConfig": {
    "global_theme": {
      "primaryColor": "#3b82f6",
      "secondaryColor": "#f3f4f6",
      "backgroundColor": "#ffffff",
      "fontFamily": "Inter, sans-serif"
    }
  }
}
```

### Response Format

```typescript
{
  "success": true,
  "html": "<html with inlined CSS>...</html>",
  "css": "/* Generated Tailwind CSS */"
}
```

## Deployment Flow

### Method 1: Pre-deployment Processing (Recommended)

1. Generate HTML with React SSR
2. Process with Tailwind (fallback to local processing if edge function unavailable)
3. Deploy the processed HTML to Netlify

```typescript
const deploymentService = new ReactDeploymentService(netlifyToken);
const result = await deploymentService.deployLandingPage(pageId);
```

### Method 2: Post-deployment Processing

1. Deploy HTML to Netlify (with edge function)
2. Use the deployed edge function to process the HTML
3. Update the deployment with processed HTML

```typescript
// Deploy first
await deploymentService.deployLandingPage(pageId);

// Then process
await deploymentService.processDeployedSiteWithTailwind(pageId);
```

## Benefits

1. **Optimized CSS**: Only includes Tailwind classes actually used in the HTML
2. **Faster Loading**: CSS is inlined, reducing HTTP requests
3. **Edge Processing**: Tailwind processing happens at the edge for better performance
4. **Fallback Support**: Falls back to local processing if edge function fails
5. **React SSR**: Full React Server-Side Rendering support

## Configuration Options

### HtmlGeneratorConfig

```typescript
interface HtmlGeneratorConfig {
  suppressConsoleWarnings?: boolean;     // Suppress React SSR warnings
  cleanProductionHtml?: boolean;         // Remove debug attributes
  enableTailwindProcessing?: boolean;    // Enable Tailwind processing
  siteUrl?: string;                      // For post-deployment processing
}
```

### TailwindProcessorConfig

```typescript
interface TailwindProcessorConfig {
  edgeFunctionUrl?: string;    // Edge function endpoint
  fallbackMode?: boolean;      // Force fallback mode
  siteUrl?: string;           // For deployed sites
}
```

## Error Handling

The system includes comprehensive error handling:

- **Edge Function Failure**: Falls back to local Tailwind processing
- **Network Issues**: Returns original HTML if all processing fails
- **Invalid HTML**: Validates HTML before processing
- **CSS Generation Errors**: Provides minimal fallback CSS

## Performance Considerations

1. **Edge Function Cold Starts**: First request may be slower
2. **CSS Size**: Optimized CSS is typically 90% smaller than full Tailwind
3. **Caching**: Processed HTML can be cached for faster subsequent loads
4. **Fallback Processing**: Local fallback is available for reliability

## Monitoring and Debugging

The system includes comprehensive logging:

```typescript
console.log('Processing HTML with Tailwind Edge Function...');
console.log('Successfully processed HTML with Tailwind CSS');
console.warn('Edge function processing failed, falling back to local processing');
console.error('Failed to process HTML with Edge Function:', error);
```

## Next Steps

1. **Enhanced CSS Purging**: Implement more sophisticated CSS purging
2. **Caching**: Add caching layer for processed HTML
3. **Performance Monitoring**: Track edge function performance
4. **A/B Testing**: Test edge function vs local processing performance
