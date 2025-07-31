import { NetlifyDeployment, DeploymentConfig, DomainConfig } from '@/types/deployment';

export class NetlifyService {
  private baseUrl = 'https://api.netlify.com/api/v1';
  private accessToken= 'nfp_PxSrwC6LMCXfjrSi28pvhSdx9rNKLKyv4a6d';

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
    // Make site name unique by adding timestamp
    const uniqueName = `${config.site_name}-${Date.now()}`;
    
    const data = await this.request('/sites', {
      method: 'POST',
      body: JSON.stringify({
        name: uniqueName,
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
    // Create deployment without files first
    const deployment = await this.request(`/sites/${siteId}/deploys`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Upload files using the correct Netlify approach
    for (const [filePath, content] of Object.entries(files)) {
      await this.uploadFile(deployment.id, filePath, content);
    }

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

  private generateFileHash(content: string): string {
    // Simple hash function for file content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async uploadFile(deployId: string, filePath: string, content: string): Promise<void> {
    // Use the correct Netlify file upload endpoint with actual file path
    const response = await fetch(`${this.baseUrl}/deploys/${deployId}/files/${encodeURIComponent(filePath)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file ${filePath}: ${response.statusText}`);
    }
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