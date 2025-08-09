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

  // DNS Zone Management
  async createDnsZone(siteId: string, domain: string): Promise<any> {
    return await this.request('/dns_zones', {
      method: 'POST',
      body: JSON.stringify({
        site_id: siteId,
        name: domain,
      }),
    });
  }

  async getDnsZone(zoneId: string): Promise<any> {
    return await this.request(`/dns_zones/${zoneId}`);
  }

  async getDnsZonesForSite(siteId: string): Promise<any[]> {
    return await this.request(`/sites/${siteId}/dns`);
  }

  async getAllDnsZones(): Promise<any[]> {
    return await this.request('/dns_zones');
  }

  async configureDNSForSite(siteId: string): Promise<any[]> {
    return await this.request(`/sites/${siteId}/dns`, {
      method: 'PUT',
    });
  }

  async deleteDnsZone(zoneId: string): Promise<void> {
    await this.request(`/dns_zones/${zoneId}`, {
      method: 'DELETE',
    });
  }

  // DNS Records Management
  async createDnsRecord(zoneId: string, record: {
    type: string;
    hostname: string;
    value: string;
    ttl?: number;
    priority?: number;
    weight?: number;
    port?: number;
    flag?: number;
    tag?: string;
  }): Promise<any> {
    return await this.request(`/dns_zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  async getDnsRecords(zoneId: string): Promise<any[]> {
    return await this.request(`/dns_zones/${zoneId}/dns_records`);
  }

  async getIndividualDnsRecord(zoneId: string, recordId: string): Promise<any> {
    return await this.request(`/dns_zones/${zoneId}/dns_records/${recordId}`);
  }

  async deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
    await this.request(`/dns_zones/${zoneId}/dns_records/${recordId}`, {
      method: 'DELETE',
    });
  }

  // SSL Certificate Management
  async getSslCertificate(siteId: string): Promise<any> {
    return await this.request(`/sites/${siteId}/ssl`);
  }

  async getAllCertificates(siteId: string, domain: string): Promise<any[]> {
    return await this.request(`/sites/${siteId}/ssl/certificates?domain=${encodeURIComponent(domain)}`);
  }

  async provisionSslCertificate(siteId: string, certificate?: string, key?: string, ca_certificates?: string): Promise<any> {
    const params = new URLSearchParams();
    if (certificate) params.append('certificate', certificate);
    if (key) params.append('key', key);
    if (ca_certificates) params.append('ca_certificates', ca_certificates);
    
    const queryString = params.toString();
    const endpoint = `/sites/${siteId}/ssl${queryString ? `?${queryString}` : ''}`;
    
    return await this.request(endpoint, {
      method: 'POST',
    });
  }

  // Domain Verification and Setup
  async verifyDomain(siteId: string, domain: string): Promise<{
    verified: boolean;
    ssl_enabled: boolean;
    dns_records_configured: boolean;
    certificate_issued: boolean;
  }> {
    try {
      // Get site information
      const site = await this.request(`/sites/${siteId}`);
      
      // Check SSL certificate status
      let sslStatus = null;
      try {
        sslStatus = await this.getSslCertificate(siteId);
      } catch (error) {
        console.log('SSL certificate not yet available');
      }

      // Check DNS zones for the site
      let dnsZones = [];
      try {
        dnsZones = await this.getDnsZonesForSite(siteId);
      } catch (error) {
        console.log('No DNS zones found for site');
      }

      // Check if there's a matching DNS zone for the domain
      const hasMatchingDnsZone = dnsZones.some((zone: any) => 
        zone.domain === domain || zone.name === domain
      );
      
      // Check domain aliases
      const isDomainInAliases = site.domain_aliases?.some((alias: string) => alias === domain);
      
      return {
        verified: site.custom_domain === domain || isDomainInAliases,
        ssl_enabled: !!site.ssl || !!site.ssl_url,
        dns_records_configured: hasMatchingDnsZone || site.managed_dns,
        certificate_issued: sslStatus?.state === 'ready' || !!site.ssl_url,
      };
    } catch (error) {
      console.error('Domain verification failed:', error);
      return {
        verified: false,
        ssl_enabled: false,
        dns_records_configured: false,
        certificate_issued: false,
      };
    }
  }

  async getNetlifyNameServers(domain: string, siteId: string): Promise<{
    nameservers: string[];
    dns_zone_id?: string;
    fallback_records?: {
      type: string;
      hostname: string;
      value: string;
      ttl: number;
    }[];
  }> {
    try {
      // First, try to create/get a DNS zone for this domain to get Netlify name servers
      let dnsZone;
      try {
        dnsZone = await this.createDnsZone(siteId, domain);
      } catch (error) {
        // DNS zone might already exist, try to find it
        const allZones = await this.getAllDnsZones();
        dnsZone = allZones.find((zone: any) => zone.domain === domain || zone.name === domain);
      }
      
      if (dnsZone && dnsZone.dns_servers) {
        // Return Netlify's name servers - this is the preferred method
        return {
          nameservers: dnsZone.dns_servers,
          dns_zone_id: dnsZone.id
        };
      }
      
      // Fallback: if DNS zone creation is not available, provide manual DNS records
      const isSubdomain = domain.split('.').length > 2;
      const site = await this.request(`/sites/${siteId}`);
      const netlifyDomain = site.url ? 
        site.url.replace('https://', '').replace('http://', '') :
        `${site.name}.netlify.app`;
      
      let fallbackRecords;
      if (isSubdomain) {
        const subdomain = domain.split('.')[0];
        fallbackRecords = [
          {
            type: 'CNAME',
            hostname: subdomain,
            value: netlifyDomain,
            ttl: 3600,
          }
        ];
      } else {
        fallbackRecords = [
          {
            type: 'A',
            hostname: '@',
            value: '75.2.60.5',
            ttl: 3600,
          },
          {
            type: 'A',
            hostname: '@', 
            value: '99.83.190.102',
            ttl: 3600,
          }
        ];
      }
      
      return {
        nameservers: [], // No name servers available
        fallback_records: fallbackRecords
      };
    } catch (error) {
      console.error('Failed to get Netlify name servers:', error);
      
      // Ultimate fallback
      const isSubdomain = domain.split('.').length > 2;
      let fallbackRecords;
      if (isSubdomain) {
        const subdomain = domain.split('.')[0];
        fallbackRecords = [
          {
            type: 'CNAME',
            hostname: subdomain,
            value: `${siteId}.netlify.app`,
            ttl: 3600,
          }
        ];
      } else {
        fallbackRecords = [
          {
            type: 'A',
            hostname: '@',
            value: '75.2.60.5',
            ttl: 3600,
          },
          {
            type: 'A',
            hostname: '@', 
            value: '99.83.190.102',
            ttl: 3600,
          }
        ];
      }
      
      return {
        nameservers: [],
        fallback_records: fallbackRecords
      };
    }
  }

  async getRequiredDnsRecords(domain: string, siteId: string): Promise<{
    type: string;
    hostname: string;
    value: string;
    ttl: number;
  }[]> {
    // Keep this method for backward compatibility
    const result = await this.getNetlifyNameServers(domain, siteId);
    return result.fallback_records || [];
  }

  async configureDnsForSite(siteId: string, domain: string): Promise<{
    dns_zone_id: string;
    dns_records: any[];
    verification_status: any;
  }> {
    try {
      console.log(`Configuring DNS for domain ${domain} on site ${siteId}`);
      
      // Step 1: Update site with custom domain
      console.log('Step 1: Setting custom domain on site');
      await this.updateSiteDomain(siteId, domain);
      
      // Step 2: Check if DNS zone already exists for this domain
      let dnsZone = null;
      try {
        const allZones = await this.getAllDnsZones();
        dnsZone = allZones.find((zone: any) => zone.name === domain || zone.domain === domain);
      } catch (error) {
        console.log('Could not fetch existing DNS zones, will create new one');
      }
      
      // Step 3: Create DNS zone if it doesn't exist
      if (!dnsZone) {
        console.log('Step 2: Creating DNS zone');
        try {
          dnsZone = await this.createDnsZone(siteId, domain);
          console.log('DNS zone created:', dnsZone.id);
        } catch (error) {
          console.warn('Failed to create DNS zone, attempting to use Netlify managed DNS');
          // Try to configure DNS using Netlify's managed DNS
          const managedDns = await this.configureDNSForSite(siteId);
          dnsZone = managedDns.find((zone: any) => zone.name === domain || zone.domain === domain);
          if (!dnsZone) {
            throw new Error('Could not create or configure DNS zone');
          }
        }
      } else {
        console.log('Using existing DNS zone:', dnsZone.id);
      }
      
      // Step 4: Get required DNS records
      console.log('Step 3: Getting required DNS records');
      const requiredRecords = await this.getRequiredDnsRecords(domain, siteId);
      
      // Step 5: Create DNS records if DNS zone is managed by Netlify
      const createdRecords = [];
      if (dnsZone && dnsZone.id) {
        console.log('Step 4: Creating DNS records');
        for (const record of requiredRecords) {
          try {
            // Check if record already exists
            const existingRecords = await this.getDnsRecords(dnsZone.id);
            const recordExists = existingRecords.some((existing: any) => 
              existing.type === record.type && 
              existing.hostname === record.hostname && 
              existing.value === record.value
            );
            
            if (!recordExists) {
              const createdRecord = await this.createDnsRecord(dnsZone.id, record);
              createdRecords.push(createdRecord);
              console.log(`Created DNS record: ${record.type} ${record.hostname} -> ${record.value}`);
            } else {
              console.log(`DNS record already exists: ${record.type} ${record.hostname} -> ${record.value}`);
              // Add the existing record to our list
              const existingRecord = existingRecords.find((existing: any) => 
                existing.type === record.type && 
                existing.hostname === record.hostname && 
                existing.value === record.value
              );
              if (existingRecord) {
                createdRecords.push(existingRecord);
              }
            }
          } catch (error) {
            console.warn(`Failed to create DNS record: ${record.type} ${record.hostname}`, error);
          }
        }
      }
      
      // Step 6: Provision SSL certificate
      console.log('Step 5: Provisioning SSL certificate');
      try {
        await this.provisionSslCertificate(siteId);
      } catch (error) {
        console.warn('SSL certificate provisioning failed, it may already be in progress:', error);
      }
      
      // Step 7: Verify domain setup
      console.log('Step 6: Verifying domain setup');
      const verification = await this.verifyDomain(siteId, domain);
      
      console.log('Domain configuration completed:', {
        domain,
        dnsZoneId: dnsZone?.id,
        recordsCreated: createdRecords.length,
        verification
      });
      
      return {
        dns_zone_id: dnsZone?.id || '',
        dns_records: createdRecords,
        verification_status: verification,
      };
    } catch (error) {
      console.error('DNS configuration failed:', error);
      throw new Error(`Failed to configure DNS for domain ${domain}: ${error instanceof Error ? error.message : error}`);
    }
  }

  async deleteSite(siteId: string): Promise<void> {
    await this.request(`/sites/${siteId}`, {
      method: 'DELETE',
    });
  }

  async getSites(): Promise<Array<{ id: string; name: string; url: string; custom_domain?: string; ssl_url?: string; admin_url?: string; state?: string; created_at?: string }>> {
    const data = await this.request('/sites');
    
    return data.map((site: any) => ({
      id: site.id,
      name: site.name,
      url: site.ssl_url || site.url,
      custom_domain: site.custom_domain,
      ssl_url: site.ssl_url,
      admin_url: site.admin_url,
      state: site.state,
      created_at: site.created_at,
    }));
  }

  async getSite(siteId: string): Promise<any> {
    return await this.request(`/sites/${siteId}`);
  }

  // Add domain alias management
  async addDomainAlias(siteId: string, domain: string): Promise<any> {
    const site = await this.getSite(siteId);
    const currentAliases = site.domain_aliases || [];
    
    if (!currentAliases.includes(domain)) {
      const updatedAliases = [...currentAliases, domain];
      return await this.request(`/sites/${siteId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          domain_aliases: updatedAliases,
        }),
      });
    }
    
    return site;
  }

  async removeDomainAlias(siteId: string, domain: string): Promise<any> {
    const site = await this.getSite(siteId);
    const currentAliases = site.domain_aliases || [];
    
    const updatedAliases = currentAliases.filter((alias: string) => alias !== domain);
    return await this.request(`/sites/${siteId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        domain_aliases: updatedAliases,
      }),
    });
  }

  // Enable/disable force HTTPS
  async setForceSSL(siteId: string, forceSSL: boolean): Promise<any> {
    return await this.request(`/sites/${siteId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        force_ssl: forceSSL,
      }),
    });
  }

  // Call Netlify Edge Function for Tailwind processing
  async processTailwindCSS(siteUrl: string, html: string, pageConfig: any): Promise<string> {
    try {
      console.log('Processing HTML with Tailwind Edge Function via Netlify...');
      
      const edgeFunctionUrl = `${siteUrl}/api/tailwind-processor`;
      
      const response = await fetch(edgeFunctionUrl, {
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
        throw new Error(`Netlify Edge function failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Tailwind processing failed: ${result.error}`);
      }

      console.log('Successfully processed HTML with Tailwind CSS via Netlify Edge Function');
      return result.html;
      
    } catch (error) {
      console.error('Failed to process HTML with Netlify Edge Function:', error);
      throw error;
    }
  }
}