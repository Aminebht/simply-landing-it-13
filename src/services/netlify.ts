import { NetlifyDeployment, DeploymentConfig, DomainConfig } from '@/types/deployment';

export class NetlifyService {
  private baseUrl = 'https://api.netlify.com/api/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Netlify API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createSite(config: DeploymentConfig): Promise<{ site_id: string; deploy_url: string }> {
    const data = await this.request('/sites', {
      method: 'POST',
      body: JSON.stringify({
        name: config.site_name,
        custom_domain: config.custom_domain,
        build_settings: {
          cmd: config.build_command || 'npm run build',
          dir: config.publish_directory || 'dist',
        },
      }),
    });

    return {
      site_id: data.id,
      deploy_url: data.url,
    };
  }

  async deploySite(siteId: string, files: Record<string, string>): Promise<NetlifyDeployment> {
    // Create deployment
    const deployment = await this.request(`/sites/${siteId}/deploys`, {
      method: 'POST',
      body: JSON.stringify({
        files: Object.keys(files).reduce((acc, path) => {
          acc[path] = files[path];
          return acc;
        }, {} as Record<string, string>),
      }),
    });

    return {
      id: deployment.id,
      site_id: siteId,
      deploy_url: deployment.deploy_ssl_url || deployment.deploy_url,
      state: deployment.state,
      created_at: deployment.created_at,
      deploy_ssl_url: deployment.deploy_ssl_url,
      branch: deployment.branch,
      commit_ref: deployment.commit_ref,
    };
  }

  async getDeployment(deployId: string): Promise<NetlifyDeployment> {
    const data = await this.request(`/deploys/${deployId}`);
    
    return {
      id: data.id,
      site_id: data.site_id,
      deploy_url: data.deploy_ssl_url || data.deploy_url,
      state: data.state,
      created_at: data.created_at,
      deploy_ssl_url: data.deploy_ssl_url,
      branch: data.branch,
      commit_ref: data.commit_ref,
    };
  }

  async updateSiteDomain(siteId: string, domain: string): Promise<DomainConfig> {
    const data = await this.request(`/sites/${siteId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        custom_domain: domain,
      }),
    });

    return {
      domain: data.custom_domain,
      ssl_enabled: data.ssl,
      dns_verified: data.domain_aliases?.some((alias: any) => alias.verified) || false,
      certificate_state: data.ssl_url ? 'issued' : 'pending',
    };
  }

  async deleteSite(siteId: string): Promise<void> {
    await this.request(`/sites/${siteId}`, {
      method: 'DELETE',
    });
  }

  async getSites(): Promise<Array<{ id: string; name: string; url: string; custom_domain?: string }>> {
    const data = await this.request('/sites');
    
    return data.map((site: any) => ({
      id: site.id,
      name: site.name,
      url: site.ssl_url || site.url,
      custom_domain: site.custom_domain,
    }));
  }
}