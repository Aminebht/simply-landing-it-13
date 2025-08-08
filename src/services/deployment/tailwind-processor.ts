import { SupabaseEdgeFunctionService } from '../supabase-edge-functions';

export interface TailwindProcessorConfig {
  edgeFunctionUrl?: string;
  fallbackMode?: boolean;
  supabaseUrl?: string; // For Supabase edge functions
  supabaseAnonKey?: string;
}

export class TailwindProcessorService {
  private config: TailwindProcessorConfig;
  private supabaseEdgeService: SupabaseEdgeFunctionService;

  constructor(config: TailwindProcessorConfig = {}) {
    this.config = {
      edgeFunctionUrl: '/functions/v1/tailwind-processor',
      fallbackMode: false,
      supabaseUrl: 'https://ijrisuqixfqzmlomlgjb.supabase.co', // Default Supabase URL
      ...config
    };
    
    this.supabaseEdgeService = SupabaseEdgeFunctionService.getInstance();
  }

  async processHTML(html: string, pageConfig: any): Promise<string> {
    console.log('🎯 TailwindProcessorService.processHTML called');
    console.log('⏳ Initiating Tailwind CSS processing...');
    console.log('📊 Input HTML length:', html.length);
    console.log('Fallback mode:', this.config.fallbackMode);
    
    if (this.config.fallbackMode) {
      console.log('⚠️ Fallback mode enabled, using local processing');
      return this.processHTMLFallback(html, pageConfig);
    }

    try {
      console.log('🚀 Calling Supabase Edge Function for Tailwind processing...');
      const startTime = Date.now();
      
      const result = await this.supabaseEdgeService.processTailwindCSS(html, pageConfig);
      
      const processingTime = Date.now() - startTime;
      console.log('✅ Edge function processing completed successfully');
      console.log('⏱️ Processing time:', processingTime + 'ms');
      console.log('📈 Output HTML length:', result.length);
      console.log('📊 Size change:', ((result.length - html.length) / html.length * 100).toFixed(1) + '%');
      
      return result;
    } catch (error) {
      console.error('❌ Edge function processing failed:', error);
      console.log('🔄 Falling back to local processing...');
      return this.processHTMLFallback(html, pageConfig);
    }
  }

  async processHTMLWithDeployedSite(html: string, pageConfig: any, siteUrl: string): Promise<string> {
    try {
      console.log('Processing HTML with Supabase Edge Function...');
      
      // Use the centralized Supabase service
      return await this.supabaseEdgeService.processTailwindCSS(html, pageConfig);
      
    } catch (error) {
      console.error('Failed to process HTML with Supabase Edge Function:', error);
      // Fallback to local processing
      return this.processHTMLFallback(html, pageConfig);
    }
  }

  private async processHTMLWithEdgeFunction(html: string, pageConfig: any): Promise<string> {
    console.log('Processing HTML with Tailwind Edge Function...');
    
    const response = await fetch(this.config.edgeFunctionUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        pageConfig
      }),
    });

    if (!response.ok) {
      throw new Error(`Edge function failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Tailwind processing failed: ${result.error}`);
    }

    console.log('Successfully processed HTML with Tailwind CSS via edge function');
    return result.html;
  }

  private processHTMLFallback(html: string, pageConfig: any): string {
    console.log('Processing HTML with fallback Tailwind CSS...');
    
    // Extract Tailwind classes from HTML
    const extractedClasses = this.extractTailwindClasses(html);
    
    // Generate minimal CSS for the extracted classes
    const css = this.generateMinimalTailwindCSS(extractedClasses, pageConfig);
    
    // Inline the CSS into the HTML
    const finalHTML = this.inlineCSS(html, css);
    
    console.log('Successfully processed HTML with fallback Tailwind CSS');
    return finalHTML;
  }

  private extractTailwindClasses(html: string): string[] {
    const classRegex = /class(?:Name)?="([^"]*)"/g;
    const classes: string[] = [];
    let match;

    while ((match = classRegex.exec(html)) !== null) {
      const classString = match[1];
      const classList = classString.split(/\s+/).filter(cls => cls.length > 0);
      classes.push(...classList);
    }

    return [...new Set(classes)];
  }

  private generateMinimalTailwindCSS(classes: string[], pageConfig: any): string {
    // Basic Tailwind CSS reset and utilities
    let css = `
/* Tailwind CSS Reset */
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
::before,::after{--tw-content:''}
html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
body{margin:0;line-height:inherit}

/* Custom theme variables */
:root {
  --primary-color: ${pageConfig?.global_theme?.primaryColor || '#3b82f6'};
  --secondary-color: ${pageConfig?.global_theme?.secondaryColor || '#f3f4f6'};
  --background-color: ${pageConfig?.global_theme?.backgroundColor || '#ffffff'};
}
    `.trim();

    // Generate CSS for each used class
    for (const className of classes) {
      const classCSS = this.generateCSSForClass(className);
      if (classCSS) {
        css += `\n${classCSS}`;
      }
    }

    return css;
  }

  private generateCSSForClass(className: string): string {
    // Basic utility class mapping - this could be expanded significantly
    const classMap: { [key: string]: string } = {
      // Display
      'block': '.block{display:block}',
      'inline-block': '.inline-block{display:inline-block}',
      'flex': '.flex{display:flex}',
      'grid': '.grid{display:grid}',
      'hidden': '.hidden{display:none}',
      
      // Flex
      'flex-col': '.flex-col{flex-direction:column}',
      'flex-row': '.flex-row{flex-direction:row}',
      'items-center': '.items-center{align-items:center}',
      'justify-center': '.justify-center{justify-content:center}',
      'justify-between': '.justify-between{justify-content:space-between}',
      
      // Text
      'text-center': '.text-center{text-align:center}',
      'text-left': '.text-left{text-align:left}',
      'text-right': '.text-right{text-align:right}',
      'font-bold': '.font-bold{font-weight:700}',
      'font-semibold': '.font-semibold{font-weight:600}',
      'font-medium': '.font-medium{font-weight:500}',
      
      // Colors
      'text-white': '.text-white{color:#fff}',
      'text-black': '.text-black{color:#000}',
      'bg-white': '.bg-white{background-color:#fff}',
      'bg-black': '.bg-black{background-color:#000}',
      'bg-blue-500': '.bg-blue-500{background-color:#3b82f6}',
      'bg-primary': '.bg-primary{background-color:var(--primary-color)}',
      
      // Spacing
      'p-0': '.p-0{padding:0}',
      'p-1': '.p-1{padding:0.25rem}',
      'p-2': '.p-2{padding:0.5rem}',
      'p-3': '.p-3{padding:0.75rem}',
      'p-4': '.p-4{padding:1rem}',
      'p-6': '.p-6{padding:1.5rem}',
      'p-8': '.p-8{padding:2rem}',
      'm-0': '.m-0{margin:0}',
      'm-1': '.m-1{margin:0.25rem}',
      'm-2': '.m-2{margin:0.5rem}',
      'm-4': '.m-4{margin:1rem}',
      'm-6': '.m-6{margin:1.5rem}',
      
      // Width/Height
      'w-full': '.w-full{width:100%}',
      'h-full': '.h-full{height:100%}',
      'w-auto': '.w-auto{width:auto}',
      'h-auto': '.h-auto{height:auto}',
      
      // Border
      'rounded': '.rounded{border-radius:0.25rem}',
      'rounded-md': '.rounded-md{border-radius:0.375rem}',
      'rounded-lg': '.rounded-lg{border-radius:0.5rem}',
      'border': '.border{border-width:1px}',
    };

    // Handle responsive classes
    if (className.includes(':')) {
      const [breakpoint, baseClass] = className.split(':');
      const baseCss = this.generateCSSForClass(baseClass);
      if (baseCss && breakpoint) {
        const mediaQuery = this.getMediaQuery(breakpoint);
        if (mediaQuery) {
          return `${mediaQuery}{${baseCss.replace(`.${baseClass}`, `.${className.replace(':', '\\:')}`)}}`
        }
      }
    }

    return classMap[className] || '';
  }

  private getMediaQuery(breakpoint: string): string {
    const breakpoints: { [key: string]: string } = {
      'sm': '@media (min-width:640px)',
      'md': '@media (min-width:768px)',
      'lg': '@media (min-width:1024px)',
      'xl': '@media (min-width:1280px)',
      '2xl': '@media (min-width:1536px)',
    };
    return breakpoints[breakpoint] || '';
  }

  private inlineCSS(html: string, css: string): string {
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
}
