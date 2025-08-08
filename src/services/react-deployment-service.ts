import { LandingPageService } from './landing-page';
import { NetlifyService } from './netlify';
import { HtmlGenerator } from './deployment/html-generator';
import { AssetGenerator } from './deployment/asset-generator';
import { DeploymentValidator } from './deployment/deployment-validator';
import { DeploymentLogger } from './deployment/deployment-logger';

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
  'index.html': string;
  'styles.css': string;
  'app.js': string;
  '_headers': string;
}

export class ReactDeploymentService {
  private netlifyService: NetlifyService;
  private htmlGenerator: HtmlGenerator;
  private assetGenerator: AssetGenerator;
  private validator: DeploymentValidator;
  private logger: DeploymentLogger;

  constructor(netlifyToken: string) {
    this.netlifyService = new NetlifyService(netlifyToken);
    this.htmlGenerator = new HtmlGenerator({
      enableTailwindProcessing: true  // Enable Tailwind processing via css-generator
    });
    this.assetGenerator = new AssetGenerator();
    this.validator = new DeploymentValidator();
    this.logger = new DeploymentLogger();
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
      this.logger.info('Starting React-based deployment', { pageId });

      const pageData = await this.validateAndFetchPageData(pageId);
      const files = await this.generateDeploymentFiles(pageData);
      const { siteId, deploymentResult } = await this.deployToNetlify(pageData, files);
      await this.updateDatabaseWithDeploymentInfo(pageId, siteId, deploymentResult);
      const result: DeploymentResult = {
        url: deploymentResult.deploy_ssl_url || deploymentResult.deploy_url,
        siteId: siteId
      };

      this.logger.info('Deployment completed successfully', { pageId, result });
      return result;

    } catch (error) {
      this.logger.error('React deployment failed', { pageId, error });
      throw error;
    }
  }

  private async validateAndFetchPageData(pageId: string): Promise<any> {
    const landingPageService = LandingPageService.getInstance();
    const pageData = await landingPageService.getLandingPageWithComponents(pageId);

    this.validator.validatePageData(pageData);

    this.logger.debug('Fetched page data', {
      pageId: pageData.id,
      componentsCount: pageData.components.length,
      hasGlobalTheme: !!pageData.global_theme,
      existingSiteId: pageData.netlify_site_id,
      status: pageData.status
    });

    return pageData;
  }

  private async generateDeploymentFiles(pageData: any): Promise<DeploymentFiles> {
    this.logger.debug('Generating deployment files with integrated CSS generation');

    // Generate HTML with integrated Tailwind CSS processing
    const finalHTML = await this.htmlGenerator.generateReactHTML(pageData);
    
    // Get the generated CSS from HTML generator for merging
    const priorityCSS = this.htmlGenerator.getLastGeneratedCSS();
    
    // Generate other assets with priority CSS merged into styles.css
    const { css: finalCSS, js } = await this.assetGenerator.generateAssets(pageData, priorityCSS);
    
    const headers = this.generateNetlifyHeaders();

    this.logger.debug('Deployment files generated successfully', {
      htmlSize: finalHTML.length,
      cssSize: finalCSS.length,
      jsSize: js.length,
      priorityCSSSize: priorityCSS.length
    });

    return {
      'index.html': finalHTML,
      'styles.css': finalCSS,
      'app.js': js,
      '_headers': headers
    };
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

# Specific headers for different file types
*.html
  Cache-Control: no-cache

*.css
  Cache-Control: public, max-age=31536000

*.js
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
}
