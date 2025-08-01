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
      const errorText = await response.text();
      console.error('Netlify API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorText,
        requestBody: options.body
      });
      throw new Error(`Netlify API error (${response.status}): ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async createSite(config: DeploymentConfig): Promise<{ site_id: string; deploy_url: string }> {
    // Create a valid site name (Netlify requires lowercase, no spaces, limited special characters)
    const safeName = config.site_name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50); // Limit length
    
    const uniqueName = `${safeName}-${Date.now()}`;
    
    console.log('Creating Netlify site with name:', uniqueName);
    
    // Simplified site creation payload - avoid optional fields that might cause 422 errors
    const sitePayload: any = {
      name: uniqueName
    };
    
    // Only add custom domain if it's provided and valid
    if (config.custom_domain && config.custom_domain.trim() !== '') {
      sitePayload.custom_domain = config.custom_domain;
    }
    
    console.log('Netlify site creation payload:', sitePayload);
    
    const data = await this.request('/sites', {
      method: 'POST',
      body: JSON.stringify(sitePayload),
    });

    console.log('Netlify site created successfully:', data.id);
    
    return {
      site_id: data.id,
      deploy_url: data.url,
    };
  }

  async deploySite(siteId: string, files: Record<string, string>): Promise<NetlifyDeployment> {
    // Prepare files for Netlify deployment
    const fileMap: Record<string, string> = {};
    const fileHashes: Record<string, string> = {};
    
    for (const [filePath, content] of Object.entries(files)) {
      const hash = await this.generateFileHash(content);
      fileMap[filePath] = hash;
      fileHashes[hash] = content;
    }

    // Create deployment with file manifest
    console.log('Creating deployment with file manifest:', fileMap);
    const deployment = await this.request(`/sites/${siteId}/deploys`, {
      method: 'POST',
      body: JSON.stringify({
        files: fileMap,
      }),
    });

    console.log('Deployment created:', { id: deployment.id, required: deployment.required });

    // Upload required files
    if (deployment.required && deployment.required.length > 0) {
      console.log(`Uploading ${deployment.required.length} required files`);
      for (const hash of deployment.required) {
        const content = fileHashes[hash];
        if (content) {
          console.log(`Uploading file with hash: ${hash}`);
          await this.uploadFileByHash(deployment.id, hash, content);
        } else {
          console.warn(`No content found for hash: ${hash}`);
        }
      }
    } else {
      console.log('No files need to be uploaded (all files already exist on Netlify)');
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

  private async generateFileHash(content: string): Promise<string> {
    // Use SHA-1 hash as expected by Netlify
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async uploadFileByHash(deployId: string, hash: string, content: string): Promise<void> {
    // Upload file content by hash to Netlify
    const url = `${this.baseUrl}/deploys/${deployId}/files/${hash}`;
    console.log(`Uploading to URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', {
        deployId,
        hash,
        status: response.status,
        statusText: response.statusText,
        url,
        errorText,
        contentLength: content.length
      });
      throw new Error(`Failed to upload file with hash ${hash}: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    console.log(`Successfully uploaded file with hash: ${hash}`);
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