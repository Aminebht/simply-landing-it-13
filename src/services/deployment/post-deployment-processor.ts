import { NetlifyService } from '../netlify';
import { TailwindProcessorService } from './tailwind-processor';
import { SupabaseEdgeFunctionService } from '../supabase-edge-functions';

export interface PostDeploymentProcessorConfig {
  netlifyService: NetlifyService;
  tailwindProcessor: TailwindProcessorService;
  supabaseEdgeService?: SupabaseEdgeFunctionService;
}

export class PostDeploymentProcessor {
  private netlifyService: NetlifyService;
  private tailwindProcessor: TailwindProcessorService;
  private supabaseEdgeService: SupabaseEdgeFunctionService;

  constructor(config: PostDeploymentProcessorConfig) {
    this.netlifyService = config.netlifyService;
    this.tailwindProcessor = config.tailwindProcessor;
    this.supabaseEdgeService = config.supabaseEdgeService || SupabaseEdgeFunctionService.getInstance();
  }

  async processDeployedSite(
    siteId: string, 
    siteUrl: string, 
    pageData: any
  ): Promise<{ processedHTML: string; success: boolean }> {
    try {
      console.log('Starting post-deployment processing for site:', siteId);

      // Get the current deployment
      const deployments = await this.netlifyService.getSites();
      const site = deployments.find(s => s.id === siteId);
      
      if (!site) {
        throw new Error(`Site ${siteId} not found`);
      }

      console.log('Found deployed site:', site.url);

      // Fetch the deployed HTML
      const deployedHTML = await this.fetchDeployedHTML(site.url);
      
      // Process with Tailwind via Supabase Edge Function
      const processedHTML = await this.supabaseEdgeService.processTailwindCSS(
        deployedHTML,
        pageData
      );

      // Optionally update the site with the processed HTML
      // This would require deploying the updated HTML back to Netlify
      await this.updateDeployedHTML(siteId, processedHTML);

      return {
        processedHTML,
        success: true
      };

    } catch (error) {
      console.error('Post-deployment processing failed:', error);
      return {
        processedHTML: '',
        success: false
      };
    }
  }

  private async fetchDeployedHTML(siteUrl: string): Promise<string> {
    try {
      const response = await fetch(siteUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch deployed site: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch deployed HTML:', error);
      throw error;
    }
  }

  private async updateDeployedHTML(siteId: string, processedHTML: string): Promise<void> {
    try {
      console.log('Updating deployed site with processed HTML...');
      
      // Create a new deployment with the processed HTML
      const files = {
        'index.html': processedHTML
      };

      await this.netlifyService.deploySite(siteId, files);
      console.log('Successfully updated deployment with processed HTML');

    } catch (error) {
      console.error('Failed to update deployed HTML:', error);
      throw error;
    }
  }

  async processHTMLWithEdgeFunction(
    html: string, 
    pageConfig: any, 
    siteUrl: string
  ): Promise<string> {
    return await this.supabaseEdgeService.processTailwindCSS(html, pageConfig);
  }
}
