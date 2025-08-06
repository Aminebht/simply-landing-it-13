import { LandingPageComponent } from '@/types/components';
import { LandingPageService } from './landing-page';
import { NetlifyService } from './netlify';
import { 
  DeploymentValidator, 
  DeploymentLogger,
  ReactProjectGenerator 
} from './deployment/index';

export interface DeploymentStatus {
  isDeployed: boolean;
  siteId?: string;
  url?: string;
  lastDeployedAt?: string;
}

export interface DeploymentResult {
  url: string;
  siteId: string;
}

export interface DeploymentFiles extends Record<string, string> {
  // React project files
}

export class ReactDeploymentService {
  private netlifyService: NetlifyService;
  private validator: DeploymentValidator;
  private logger: DeploymentLogger;
  private reactProjectGenerator: ReactProjectGenerator;

  constructor(netlifyToken: string) {
    this.netlifyService = new NetlifyService(netlifyToken);
    this.validator = new DeploymentValidator();
    this.logger = new DeploymentLogger();
    this.reactProjectGenerator = new ReactProjectGenerator();
  }

  async getDeploymentStatus(pageId: string): Promise<DeploymentStatus> {
    try {
      this.logger.info('Checking deployment status', { pageId });
      
      const landingPageService = LandingPageService.getInstance();
      const pageData = await landingPageService.getLandingPageWithComponents(pageId);

      return {
        isDeployed: !!pageData.netlify_site_id,
        siteId: pageData.netlify_site_id || undefined,
        url: undefined, // URL will be retrieved from Netlify when needed
        lastDeployedAt: pageData.last_deployed_at || undefined
      };
    } catch (error) {
      this.logger.error('Failed to get deployment status', { pageId, error });
      return { isDeployed: false };
    }
  }

  async deployLandingPage(pageId: string): Promise<DeploymentResult> {
    try {
      this.logger.info('Starting React project deployment', { pageId });

      // Validate and fetch page data
      const pageData = await this.validateAndFetchPageData(pageId);
      
      // Generate React project files
      const files = await this.generateReactProjectFiles(pageData);
      
      // Deploy to Netlify
      const { siteId, deploymentResult } = await this.deployToNetlify(pageData, files);
      
      // Update database with deployment info
      await this.updateDatabaseWithDeploymentInfo(pageId, siteId, deploymentResult);

      const result: DeploymentResult = {
        url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url,
        siteId: siteId
      };

      this.logger.info('React project deployment completed successfully', { pageId, result });
      return result;

    } catch (error) {
      this.logger.error('Deployment failed', { pageId, error });
      throw error;
    }
  }

  private async validateAndFetchPageData(pageId: string): Promise<any> {
    const landingPageService = LandingPageService.getInstance();
    const pageData = await landingPageService.getLandingPageWithComponents(pageId);

    this.validator.validatePageData(pageData);

    // Debug component content during fetch - summary only
    const componentSummary = pageData.components.map(c => ({
      id: c.id,
      type: c.component_variation?.component_type,
      variation: c.component_variation?.variation_number,
      hasContent: !!c.content && Object.keys(c.content).length > 0
    }));

    console.log('[DEPLOYMENT DEBUG] Page components:', componentSummary);

    this.logger.debug('Fetched page data', {
      pageId: pageData.id,
      componentsCount: pageData.components.length,
      hasGlobalTheme: !!pageData.global_theme,
      existingSiteId: pageData.netlify_site_id,
      status: pageData.status
    });

    return pageData;
  }

  private async generateReactProjectFiles(pageData: any): Promise<DeploymentFiles> {
    this.logger.debug('Generating React project files');

    // Use the React project generator to create a complete React project
    const reactProjectFiles = this.reactProjectGenerator.generateReactProject(pageData);
    
    // Validate the generated project
    const isValid = this.reactProjectGenerator.validateProject(reactProjectFiles);
    if (!isValid) {
      throw new Error('Generated React project failed validation');
    }
    
    // Log project info
    const projectInfo = this.reactProjectGenerator.getProjectInfo(reactProjectFiles);
    this.logger.info('React project generated and ready for deployment', {
      totalFiles: projectInfo.totalFiles,
      componentCount: projectInfo.componentCount,
      totalSize: projectInfo.totalSize,
      buildCommand: projectInfo.buildCommand,
      publishDir: projectInfo.publishDir
    });

    // Return source files for Netlify to build
    return reactProjectFiles;
  }

  private async deployToNetlify(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    const hasExistingSite = this.hasValidNetlifySiteId(pageData.netlify_site_id);

    if (hasExistingSite) {
      this.logger.info('Updating existing Netlify site', { siteId: pageData.netlify_site_id });
      return await this.updateExistingSite(pageData, files);
    } else {
      this.logger.info('Creating new Netlify site');
      return await this.createNewSite(pageData, files);
    }
  }

  private hasValidNetlifySiteId(netlify_site_id: string | null | undefined): boolean {
    return !!(netlify_site_id && netlify_site_id.trim() !== '');
  }

  private async updateExistingSite(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    try {
      const siteId = pageData.netlify_site_id;
      
      // Deploy files to existing site
      const deploymentResult = await this.netlifyService.deploySite(siteId, files);
      
      return { siteId, deploymentResult };
    } catch (error) {
      this.logger.warn('Failed to update existing site, creating new one', { error });
      return await this.createNewSiteAsFallback(pageData, files);
    }
  }

  private async createNewSite(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    const siteName = `landing-page-${pageData.id}`;
    const config = { site_name: siteName };
    
    // Create new site
    const siteResult = await this.netlifyService.createSite(config);
    const siteId = siteResult.site_id;
    
    // Deploy files to new site
    const deploymentResult = await this.netlifyService.deploySite(siteId, files);
    
    return { siteId, deploymentResult };
  }

  private async createNewSiteAsFallback(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    const siteName = `landing-page-${pageData.id}-${Date.now()}`;
    const config = { site_name: siteName };
    
    // Create new site as fallback
    const siteResult = await this.netlifyService.createSite(config);
    const siteId = siteResult.site_id;
    
    // Deploy files to new site
    const deploymentResult = await this.netlifyService.deploySite(siteId, files);
    
    return { siteId, deploymentResult };
  }

  private async updateDatabaseWithDeploymentInfo(
    pageId: string, 
    siteId: string, 
    deploymentResult: any
  ): Promise<void> {
    try {
      const landingPageService = LandingPageService.getInstance();
      await landingPageService.updateLandingPage(pageId, {
        netlify_site_id: siteId,
        last_deployed_at: new Date().toISOString(),
        status: 'published'
      });
    } catch (error) {
      this.logger.error('Failed to update database with deployment info', { pageId, siteId, error });
      // Don't throw here as deployment was successful
    }
  }
}
