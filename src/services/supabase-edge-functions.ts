export interface SupabaseEdgeFunctionConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export class SupabaseEdgeFunctionService {
  private config: SupabaseEdgeFunctionConfig;

  constructor(config: SupabaseEdgeFunctionConfig) {
    this.config = config;
  }

  async callEdgeFunction(functionName: string, payload: any): Promise<any> {
    const url = `${this.config.supabaseUrl}/functions/v1/${functionName}`;
    
    console.log(`Calling Supabase edge function: ${functionName}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Supabase edge function '${functionName}' failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async processTailwindCSS(html: string, pageConfig: any): Promise<string> {
    try {
      console.log('🚀 Processing HTML with Supabase Tailwind Edge Function...');
      console.log('📊 Input metrics:', {
        htmlLength: html.length,
        hasPageConfig: !!pageConfig,
        configKeys: pageConfig ? Object.keys(pageConfig) : []
      });
      
      const startTime = Date.now();
      const result = await this.callEdgeFunction('tailwind-processor', {
        html,
        pageConfig
      });
      const callDuration = Date.now() - startTime;
      
      if (!result.success) {
        throw new Error(`Tailwind processing failed: ${result.error}`);
      }

      console.log('✅ Successfully processed HTML with Tailwind CSS via Supabase');
      console.log('📈 Output metrics:', {
        processedHtmlLength: result.html.length,
        generatedCssLength: result.css?.length || 0,
        processingTime: callDuration + 'ms',
        compressionRatio: ((html.length - result.html.length) / html.length * 100).toFixed(1) + '%'
      });
      
      // Verify we actually got processed HTML back
      if (!result.html || result.html.length === 0) {
        throw new Error('Edge function returned empty HTML');
      }
      
      // Verify the HTML contains expected Tailwind processing
      if (!result.html.includes('<style>') && !result.html.includes('tailwind')) {
        console.warn('⚠️ Processed HTML may not contain Tailwind styles');
      }
      
      return result.html;
      
    } catch (error) {
      console.error('❌ Failed to process HTML with Supabase Edge Function:', error);
      throw error;
    }
  }

  static getInstance(): SupabaseEdgeFunctionService {
    // Using the same credentials from the main supabase config
    const supabaseUrl = 'https://ijrisuqixfqzmlomlgjb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcmlzdXFpeGZxem1sb21sZ2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTg3NjAsImV4cCI6MjA2NzE3NDc2MH0.01KwBmQrfZPMycwqyo_Z7C8S4boJYjDLuldKjrHOJWg';
    
    return new SupabaseEdgeFunctionService({
      supabaseUrl,
      supabaseAnonKey
    });
  }
}
