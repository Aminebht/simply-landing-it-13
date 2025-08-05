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
  // Now supports both static HTML and React project files
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
    this.logger.info('React project generated', {
      totalFiles: projectInfo.totalFiles,
      componentCount: projectInfo.componentCount,
      totalSize: projectInfo.totalSize,
      buildCommand: projectInfo.buildCommand,
      publishDir: projectInfo.publishDir
    });

    return reactProjectFiles;
  }

  private async deployToNetlify(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    const hasExistingSite = this.hasValidNetlifySiteId(pageData.netlify_site_id);

    if (hasExistingSite) {
      return this.updateExistingSite(pageData, files);
    } else {
      return this.createNewSite(pageData, files);
    }
  }

  private hasValidNetlifySiteId(netlify_site_id: string | null | undefined): boolean {
    return !!(netlify_site_id && netlify_site_id.trim() !== '');
  }

  private async updateExistingSite(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    this.logger.info('Updating existing Netlify site', { siteId: pageData.netlify_site_id });

    try {
      const deploymentResult = await this.netlifyService.deploySite(
        pageData.netlify_site_id,
        files
      );

      this.logger.info('Successfully updated existing site', { siteId: pageData.netlify_site_id });
      
      return {
        siteId: pageData.netlify_site_id,
        deploymentResult
      };
    } catch (updateError) {
      this.logger.warn('Failed to update existing site, creating new one', { 
        siteId: pageData.netlify_site_id, 
        error: updateError 
      });

      // Fallback to creating new site
      return this.createNewSiteAsFallback(pageData, files);
    }
  }

  private async createNewSite(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    this.logger.info('Creating new Netlify site for first deployment');

    const baseName = pageData.slug || 'landing-page';
    const siteInfo = await this.netlifyService.createSite({
      site_name: baseName,
      custom_domain: undefined,
      build_command: undefined,
      publish_directory: undefined
    });

    const deploymentResult = await this.netlifyService.deploySite(
      siteInfo.site_id,
      files
    );

    this.logger.info('Successfully created and deployed new site', { siteId: siteInfo.site_id });

    return {
      siteId: siteInfo.site_id,
      deploymentResult
    };
  }

  private async createNewSiteAsFallback(pageData: any, files: DeploymentFiles): Promise<{
    siteId: string;
    deploymentResult: any;
  }> {
    const fallbackBaseName = pageData.slug || 'landing-page';
    const siteInfo = await this.netlifyService.createSite({
      site_name: `${fallbackBaseName}-updated`,
      custom_domain: undefined,
      build_command: undefined,
      publish_directory: undefined
    });

    const deploymentResult = await this.netlifyService.deploySite(
      siteInfo.site_id,
      files
    );

    this.logger.info('Created new site after update failure', { siteId: siteInfo.site_id });

    return {
      siteId: siteInfo.site_id,
      deploymentResult
    };
  }

  private async updateDatabaseWithDeploymentInfo(
    pageId: string, 
    siteId: string, 
    deploymentResult: any
  ): Promise<void> {
    const landingPageService = LandingPageService.getInstance();
    
    const updateData = {
      site_id: siteId,
      url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url
    };

    this.logger.debug('Updating database with deployment info', { pageId, updateData });
    
    await landingPageService.updateDeploymentInfo(pageId, updateData);
    
    this.logger.debug('Database updated successfully', { pageId });
  }

  private generateNetlifyHeaders(): string {
    // Netlify _headers file format for setting HTTP security headers
    // These headers cannot be set via HTML meta tags
    return `/*
  # Security Headers
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains

  # Additional security headers (relaxed for external resources)
  X-Permitted-Cross-Domain-Policies: none
  Cross-Origin-Opener-Policy: same-origin-allow-popups

# Force HTML content type for root and index
/
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache

/index.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache

# Specific headers for different file types
*.html
  Content-Type: text/html; charset=utf-8
  Cache-Control: no-cache

*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000

*.js
  Content-Type: text/javascript; charset=utf-8
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000

*.jsx
  Content-Type: text/javascript; charset=utf-8
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000

*.mjs
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000

*.ts
  Content-Type: text/javascript; charset=utf-8
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000

*.tsx
  Content-Type: text/javascript; charset=utf-8
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=31536000

*.png, *.jpg, *.jpeg, *.gif, *.webp, *.svg
  Cache-Control: public, max-age=31536000

# API and font specific headers
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization

*.woff, *.woff2, *.ttf, *.eot
  Cache-Control: public, max-age=31536000
  Cross-Origin-Resource-Policy: cross-origin`;
  }

  private generateNetlifyRedirects(): string {
    // Netlify _redirects file to ensure HTML is served properly
    // This fixes MIME type issues and ensures proper routing
    return `# Redirect rules for proper HTML serving
/*    /index.html   200

# Ensure HTML files are served with correct content-type
*.html    /index.html   200

# Fallback for all routes to index.html (SPA behavior)
/*    /index.html   200`;
  }

}
