import { NetlifyDeployment, DeploymentConfig, DomainConfig } from '@/types/deployment';

export class NetlifyService {
  private baseUrl: string;
  private accessToken= 'nfp_PxSrwC6LMCXfjrSi28pvhSdx9rNKLKyv4a6d';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    // Use proxy in development to avoid CORS issues
    this.baseUrl = this.isLocalDevelopment() 
      ? '/api/netlify/api/v1' 
      : 'https://api.netlify.com/api/v1';
  }

  private isLocalDevelopment(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('localhost'));
  }

  private async request(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    const maxRetries = 3;
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`Making Netlify API request: ${options.method || 'GET'} ${url}`);
      
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          ...options.headers,
        },
      };
      
      // Only add Content-Type for JSON requests, not for ZIP uploads
      if (options.headers && !(options.headers as any)['Content-Type']) {
        (requestOptions.headers as any)['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to parse error response');
        console.error('Netlify API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          errorText,
          url,
          headers: response.headers,
          requestBody: typeof options.body === 'string' ? options.body.substring(0, 500) + '...' : '[Binary Data]'
        });
        
        // Retry on network errors or 5xx errors
        if ((response.status >= 500 || response.status === 0) && retryCount < maxRetries) {
          console.log(`Retrying request (${retryCount + 1}/${maxRetries}) after ${Math.pow(2, retryCount)} seconds`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          return this.request(endpoint, options, retryCount + 1);
        }
        
        throw new Error(`Netlify API error (${response.status}): ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(`Netlify API request successful: ${options.method || 'GET'} ${endpoint}`);
      return responseData;
      
    } catch (error: any) {
      console.error('Netlify API request failed:', {
        endpoint,
        url,
        error: error.message,
        retryCount
      });
      
      // Retry on network errors (CORS, network failures)
      if ((error.name === 'TypeError' || error.message.includes('Failed to fetch') || 
           error.message.includes('CORS')) && retryCount < maxRetries) {
        console.log(`Retrying request due to network error (${retryCount + 1}/${maxRetries}) after ${Math.pow(2, retryCount)} seconds`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.request(endpoint, options, retryCount + 1);
      }
      
      throw error;
    }
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
    
    // Create site for React project deployment WITH build process
    const sitePayload: any = {
      name: uniqueName,
      build_settings: {
        cmd: 'npm run build',
        dir: 'dist',
        env: {
          NODE_VERSION: '18'
        },
        // Explicitly enable builds
        skip_prs: false,
        auto_deploy_branch: 'main'
      },
      // Ensure the site is configured for source deployments
      repo: {
        provider: 'manual',
        repo_branch: 'main'
      }
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

    console.log('Netlify site created successfully with build settings:', data.id);
    
    return {
      site_id: data.id,
      deploy_url: data.url,
    };
  }

  async deploySite(siteId: string, files: Record<string, string>): Promise<NetlifyDeployment> {
    console.log('Starting React project deployment with ZIP method only');
    
    // Only use ZIP upload method for React builds
    console.log('Deploying with ZIP upload method to trigger React build');
    return await this.deployWithFormDataZip(siteId, files);
  }

  private async deployWithFormDataZip(siteId: string, files: Record<string, string>): Promise<NetlifyDeployment> {
    console.log('🚀 Deploying React project using ZIP method to force build');
    
    // Ensure site has proper build settings before deployment
    await this.updateSiteBuildSettings(siteId);
    
    // Create ZIP buffer with all source files
    console.log(`📦 Creating ZIP archive with ${Object.keys(files).length} files`);
    const zipBuffer = await this.createZipFromFiles(files);
    console.log(`📦 ZIP archive created, size: ${zipBuffer.length} bytes`);
    
    // Upload ZIP file directly to create deployment with build
    console.log('📤 Uploading ZIP to Netlify for React build...');
    const response = await fetch(`${this.baseUrl}/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/zip',
        // Add headers to indicate this is a source deployment
        'X-Netlify-Deploy-Type': 'manual-source',
      },
      body: zipBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error('❌ ZIP deployment failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        siteId,
        zipSize: zipBuffer.length
      });
      throw new Error(`ZIP deployment failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const deployment = await response.json();
    console.log('✅ ZIP deployment created successfully:', {
      id: deployment.id,
      state: deployment.state,
      deploy_url: deployment.deploy_url || deployment.deploy_ssl_url
    });

    // Wait for build completion with proper monitoring
    console.log('⏳ Waiting for React build to complete...');
    await this.waitForDeployment(deployment.id);

    const finalState = await this.getDeployment(deployment.id);
    console.log('🎉 React deployment completed:', {
      id: deployment.id,
      state: finalState.state,
      url: finalState.deploy_ssl_url || finalState.deploy_url
    });

    return {
      id: deployment.id,
      site_id: siteId,
      deploy_url: deployment.deploy_ssl_url || deployment.deploy_url,
      state: finalState.state,
      created_at: deployment.created_at,
      deploy_ssl_url: deployment.deploy_ssl_url,
      branch: deployment.branch,
      commit_ref: deployment.commit_ref,
    };
  }

  private async updateSiteBuildSettings(siteId: string): Promise<void> {
    try {
      console.log('Updating site build settings to enable builds');
      await this.request(`/sites/${siteId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          build_settings: {
            cmd: 'npm run build',
            dir: 'dist',
            env: {
              NODE_VERSION: '18',
              NPM_FLAGS: '--production=false'
            },
            // Force builds to be enabled
            skip_prs: false,
            auto_deploy_branch: 'main'
          },
          // Enable processing and builds
          processing_settings: {
            skip: false,
            css: {
              bundle: true,
              minify: true
            },
            js: {
              bundle: true,
              minify: true
            },
            images: {
              optimize: true
            }
          },
          // Explicitly set deployment type
          repo: {
            provider: 'manual',
            deployment_type: 'source'
          },
          // Force manual deployments to trigger builds
          build_image: 'ubuntu-20.04'
        }),
      });
      console.log('Site build settings updated successfully');
    } catch (error) {
      console.warn('Failed to update build settings, continuing with deployment:', error);
    }
  }

  private async createZipFromFiles(files: Record<string, string>): Promise<Uint8Array> {
    // Create a ZIP archive using JSZip
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    
    // Add each file to the ZIP
    for (const [filePath, content] of Object.entries(files)) {
      zip.file(filePath, content);
    }
    
    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    return zipBuffer;
  }

  private async waitForDeployment(deployId: string, maxWaitTime = 180000): Promise<void> {
    // Wait for deployment to complete with timeout (3 minutes for React builds)
    const startTime = Date.now();
    let consecutiveNewStates = 0;
    let hasSeenBuilding = false;
    
    console.log('⏳ Monitoring deployment progress...');
    
    while (Date.now() - startTime < maxWaitTime) {
      const deployment = await this.getDeployment(deployId);
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      // Track if we've seen the "building" state (indicates real build)
      if (deployment.state === 'building') {
        hasSeenBuilding = true;
        console.log(`🔨 Building React project... (${elapsed}s elapsed)`);
      } else {
        console.log(`📊 Deployment status: ${deployment.state} (${elapsed}s elapsed)`);
      }
      
      // Success states
      if (deployment.state === 'ready') {
        if (hasSeenBuilding) {
          console.log('🎉 React build completed successfully! Built assets deployed.');
        } else {
          console.log('✅ Deployment ready (may be static files without build)');
        }
        return;
      }
      
      // Error states
      if (deployment.state === 'error') {
        const deployUrl = deployment.deploy_url || deployment.deploy_ssl_url;
        throw new Error(`❌ Deployment failed - check build logs at: ${deployUrl}`);
      }
      
      // Handle "new" state - might be preparing for build
      if (deployment.state === 'new') {
        consecutiveNewStates++;
        
        if (consecutiveNewStates >= 8) { // 40 seconds
          console.log('⚠️ Still in "new" state after 40 seconds - this may indicate static deployment');
          
          if (consecutiveNewStates >= 16) { // 80 seconds  
            console.log('🔍 Deployment has been in "new" state for 80+ seconds');
            
            // Check if there's a valid deploy URL (static deployment completed)
            const deployUrl = deployment.deploy_url || deployment.deploy_ssl_url;
            if (deployUrl) {
              console.log('⚠️ IMPORTANT: This appears to be a static file deployment.');
              console.log('💡 Netlify may have skipped the build process because:');
              console.log('   - All files are identical to a previous deployment');
              console.log('   - No package.json or build command detected');
              console.log('   - Files are being treated as pre-built static assets');
              console.log(`📱 Site available at: ${deployUrl}`);
              return; // Accept as completed (even if no build happened)
            }
          }
        }
      } else {
        consecutiveNewStates = 0; // Reset counter when state changes
      }
      
      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Timeout handling
    const finalDeployment = await this.getDeployment(deployId);
    const deployUrl = finalDeployment.deploy_url || finalDeployment.deploy_ssl_url;
    
    if (deployUrl && finalDeployment.state !== 'error') {
      console.log('⏰ Deployment timeout reached, but site appears to be available');
      console.log(`📱 Site URL: ${deployUrl}`);
      return; // Accept as completed
    }
    
    throw new Error(`⏰ Deployment timeout: Build did not complete within ${maxWaitTime / 1000} seconds. Final state: ${finalDeployment.state}`);
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
}