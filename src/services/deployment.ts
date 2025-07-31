import { DeploymentJob, NetlifyDeployment } from '@/types/deployment';
import { LandingPage } from '@/types/landing-page';
import { LandingPageComponent } from '@/types/components';
import { NetlifyService } from './netlify';
import { StaticGeneratorService } from './static-generator';
import { supabase } from './supabase';

export class DeploymentService {
  private netlifyService: NetlifyService;
  private staticGenerator: StaticGeneratorService;

  constructor(netlifyAccessToken: string) {
    this.netlifyService = new NetlifyService(netlifyAccessToken);
    this.staticGenerator = new StaticGeneratorService();
  }

  async deployLandingPage(
    landingPageId: string,
    customDomain?: string
  ): Promise<{ deploymentId: string; url: string }> {
    // Create deployment job
    const job = await this.createDeploymentJob(landingPageId);

    try {
      // Update job status
      await this.updateJobStatus(job.id, 'in_progress');

      // Get landing page data
      const { data: landingPage } = await supabase
        .from('landing_pages')
        .select(`
          *,
          components:landing_page_components(
            *,
            component_variation:component_variations(*)
          )
        `)
        .eq('id', landingPageId)
        .single();

      if (!landingPage) {
        throw new Error('Landing page not found');
      }

      // Generate static files
      const files = await this.staticGenerator.exportLandingPageFromDatabase(landingPage.id);

      // Create or update Netlify site
      let siteId = landingPage.netlify_site_id;
      
      if (!siteId) {
        const site = await this.netlifyService.createSite({
          site_name: landingPage.slug,
          custom_domain: customDomain,
        });
        siteId = site.site_id;
        
        // Update landing page with site ID
        await supabase
          .from('landing_pages')
          .update({ 
            netlify_site_id: siteId,
            custom_domain: customDomain,
            updated_at: new Date().toISOString()
          })
          .eq('id', landingPageId);
      }

      // Deploy to Netlify
      const deployment = await this.netlifyService.deploySite(siteId, files);

      // Update job as completed
      await this.updateJobStatus(job.id, 'completed', {
        deployment_id: deployment.id,
        deploy_url: deployment.deploy_url,
        site_id: siteId,
      });

      // Update landing page status
      await supabase
        .from('landing_pages')
        .update({
          status: 'published',
          last_deployed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', landingPageId);

      return {
        deploymentId: deployment.id,
        url: deployment.deploy_url,
      };

    } catch (error) {
      // Update job as failed
      await this.updateJobStatus(job.id, 'failed', undefined, error.message);
      
      // Update landing page status
      await supabase
        .from('landing_pages')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', landingPageId);

      throw error;
    }
  }

  async getDeploymentStatus(deploymentId: string): Promise<NetlifyDeployment> {
    return this.netlifyService.getDeployment(deploymentId);
  }

  async redeployLandingPage(landingPageId: string): Promise<{ deploymentId: string; url: string }> {
    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select('netlify_site_id, custom_domain')
      .eq('id', landingPageId)
      .single();

    if (!landingPage?.netlify_site_id) {
      throw new Error('Landing page has not been deployed yet');
    }

    return this.deployLandingPage(landingPageId, landingPage.custom_domain);
  }

  async undeployLandingPage(landingPageId: string): Promise<void> {
    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select('netlify_site_id')
      .eq('id', landingPageId)
      .single();

    if (landingPage?.netlify_site_id) {
      await this.netlifyService.deleteSite(landingPage.netlify_site_id);
      
      await supabase
        .from('landing_pages')
        .update({
          netlify_site_id: null,
          status: 'draft',
          last_deployed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', landingPageId);
    }
  }

  async getDeploymentHistory(landingPageId: string): Promise<DeploymentJob[]> {
    const { data, error } = await supabase
      .from('deployment_jobs')
      .select('*')
      .eq('landing_page_id', landingPageId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async createDeploymentJob(landingPageId: string): Promise<DeploymentJob> {
    const { data, error } = await supabase
      .from('deployment_jobs')
      .insert({
        landing_page_id: landingPageId,
        status: 'pending',
        job_data: {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async updateJobStatus(
    jobId: string,
    status: DeploymentJob['status'],
    jobData?: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    const updates: Partial<DeploymentJob> = {
      status,
      ...(jobData && { job_data: jobData }),
      ...(errorMessage && { error_message: errorMessage }),
      ...(status === 'completed' || status === 'failed') && { completed_at: new Date().toISOString() },
    };

    const { error } = await supabase
      .from('deployment_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) throw error;
  }

  async previewDeployment(landingPageId: string): Promise<string> {
    // Generate preview without deploying
    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select(`
        *,
        components:landing_page_components(
          *,
          component_variation:component_variations(*)
        )
      `)
      .eq('id', landingPageId)
      .single();

    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    // Generate static files for preview
    const files = await this.staticGenerator.exportLandingPageFromDatabase(landingPageId);

    // Return the HTML content for preview
    return files['index.html'] || 'Preview not available';
  }
}