import { DomainConfig } from '@/types/deployment';
import { NetlifyService } from './netlify';

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  hostname: string;
  value: string;
  ttl?: number;
}

export interface DomainSetupResult {
  dns_zone_id: string;
  dns_records: any[];
  verification_status: {
    verified: boolean;
    ssl_enabled: boolean;
    dns_records_configured: boolean;
    certificate_issued: boolean;
  };
  required_dns_records: DNSRecord[];
  nameservers?: string[]; // Netlify name servers (preferred method)
  setup_method: 'nameservers' | 'dns_records'; // Which method to use
}

export class DomainManagerService {
  private netlifyService: NetlifyService;

  constructor(netlifyAccessToken: string) {
    this.netlifyService = new NetlifyService(netlifyAccessToken);
  }

  async setupCustomDomain(siteId: string, domain: string): Promise<DomainSetupResult> {
    try {
      console.log(`Setting up custom domain ${domain} for site ${siteId}`);
      
      // Step 1: Validate domain format
      if (!this.isValidDomain(domain)) {
        throw new Error('Invalid domain format. Please enter a valid domain name.');
      }
      
      // Step 2: Use static Netlify name servers (same for all sites)
      const netlifyNameServers = [
        'dns1.p08.nsone.net',
        'dns2.p08.nsone.net',
        'dns3.p08.nsone.net',
        'dns4.p08.nsone.net'
      ];
      
      // Step 3: Determine setup method - prefer name servers for apex domains
      const isSubdomain = domain.split('.').length > 2;
      let setupMethod: 'nameservers' | 'dns_records' = isSubdomain ? 'dns_records' : 'nameservers';
      let nameservers: string[] = isSubdomain ? [] : netlifyNameServers;
      
      // Step 4: Generate fallback DNS records
      let requiredRecords: any[];
      if (isSubdomain) {
        const subdomain = domain.split('.')[0];
        requiredRecords = [
          {
            type: 'CNAME',
            hostname: subdomain,
            value: `${siteId}.netlify.app`,
            ttl: 3600,
          }
        ];
      } else {
        requiredRecords = [
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
      
      // Step 5: Add domain alias (background operation)
      this.netlifyService.addDomainAlias(siteId, domain).catch(error => {
        console.warn('Could not add domain alias (background):', error);
      });
      
      // Step 6: Enable SSL (background operation)
      this.netlifyService.setForceSSL(siteId, true).catch(error => {
        console.warn('Could not enable force SSL (background):', error);
      });
      
      // Return immediately with setup
      return {
        dns_zone_id: '',
        dns_records: [],
        verification_status: {
          verified: false,
          ssl_enabled: false,
          dns_records_configured: false,
          certificate_issued: false,
        },
        required_dns_records: requiredRecords.map(record => ({
          type: record.type as 'A' | 'CNAME' | 'TXT',
          hostname: record.hostname,
          value: record.value,
          ttl: record.ttl,
        })),
        nameservers: nameservers,
        setup_method: setupMethod,
      };
    } catch (error) {
      console.error('Failed to setup custom domain:', error);
      throw new Error(`Failed to setup custom domain: ${error instanceof Error ? error.message : error}`);
    }
  }

  private isValidDomain(domain: string): boolean {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.length >= 4 && domain.length <= 253;
  }

  async verifyDomain(siteId: string, domain: string): Promise<{
    reachable: boolean;
    ssl_enabled: boolean;
    redirects_properly: boolean;
    dns_configured: boolean;
    certificate_issued: boolean;
  }> {
    try {
      // Use Netlify's domain verification
      const netlifyVerification = await this.netlifyService.verifyDomain(siteId, domain);
      
      // Additional checks for domain reachability
      let reachable = false;
      let redirectsProperly = false;
      
      try {
        // Check if domain is reachable with proper timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`https://${domain}`, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'manual',
        });
        
        clearTimeout(timeoutId);
        
        reachable = response.status < 500; // Include redirects as reachable
        redirectsProperly = response.status >= 300 && response.status < 400;
        
        // Also check if it redirects to the Netlify site
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          if (location && (location.includes('netlify.app') || location.includes(domain))) {
            redirectsProperly = true;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Domain check timed out');
        } else {
          console.log('Domain not yet reachable:', error);
        }
        reachable = false;
        redirectsProperly = false;
      }
      
      return {
        reachable,
        ssl_enabled: netlifyVerification.ssl_enabled,
        redirects_properly: redirectsProperly,
        dns_configured: netlifyVerification.dns_records_configured,
        certificate_issued: netlifyVerification.certificate_issued,
      };
    } catch (error) {
      console.error('Domain verification failed:', error);
      return {
        reachable: false,
        ssl_enabled: false,
        redirects_properly: false,
        dns_configured: false,
        certificate_issued: false,
      };
    }
  }

  async getRequiredDNSRecords(domain: string, siteId: string): Promise<DNSRecord[]> {
    try {
      const records = await this.netlifyService.getRequiredDnsRecords(domain, siteId);
      return records.map(record => ({
        type: record.type as 'A' | 'CNAME' | 'TXT',
        hostname: record.hostname,
        value: record.value,
        ttl: record.ttl,
      }));
    } catch (error) {
      console.error('Failed to get required DNS records:', error);
      // Fallback to static records
      const isSubdomain = domain.split('.').length > 2;
      
      if (isSubdomain) {
        return [
          {
            type: 'CNAME',
            hostname: domain.split('.')[0],
            value: `${siteId}.netlify.app`,
          }
        ];
      } else {
        return [
          {
            type: 'A',
            hostname: '@',
            value: '75.2.60.5',
          },
          {
            type: 'A',
            hostname: '@',
            value: '99.83.190.102',
          }
        ];
      }
    }
  }

  async enableSSL(siteId: string): Promise<{ status: string; certificate_url?: string }> {
    try {
      // Provision SSL certificate through Netlify
      const cert = await this.netlifyService.provisionSslCertificate(siteId);
      
      return {
        status: cert.state || 'provisioning',
        certificate_url: cert.domains?.[0] ? `https://${cert.domains[0]}` : undefined,
      };
    } catch (error) {
      console.error('Failed to enable SSL:', error);
      throw new Error(`Failed to enable SSL: ${error}`);
    }
  }

  async checkDomainStatus(siteId: string, domain: string): Promise<{
    reachable: boolean;
    ssl_enabled: boolean;
    redirects_properly: boolean;
  }> {
    return this.verifyDomain(siteId, domain);
  }

  generateDNSInstructions(domain: string, dnsRecords: DNSRecord[], nameservers?: string[], method: 'nameservers' | 'dns_records' = 'dns_records'): string {
    const isSubdomain = domain.split('.').length > 2;
    const rootDomain = isSubdomain ? domain.split('.').slice(1).join('.') : domain;
    
    if (method === 'nameservers' && nameservers && nameservers.length > 0) {
      // Name server method (preferred)
      let instructions = `🌐 Name Server Configuration for ${domain}\n\n`;
      instructions += `This is the recommended method to configure your domain. Here's what you need to do:\n\n`;
      instructions += `📋 Steps:\n`;
      instructions += `1. Log into your domain provider (GoDaddy, Namecheap, Cloudflare, etc.)\n`;
      instructions += `2. Go to "DNS Management" or "Name Servers" section\n`;
      instructions += `3. Replace the existing name servers with Netlify's:\n\n`;
      
      nameservers.forEach((ns, index) => {
        instructions += `   NS${index + 1}: ${ns}\n`;
      });
      
      instructions += `\n4. Save the changes\n`;
      instructions += `5. Wait 24-48 hours for DNS propagation\n\n`;

      
      return instructions;
    } else {
      // Fallback to DNS records method
      let instructions = `🌐 DNS Configuration for ${domain}\n\n`;
      instructions += `Add these DNS records to your domain provider:\n\n`;
      
      if (isSubdomain) {
        instructions += `📋 For a subdomain like ${domain}:\n`;
        instructions += `• Create a CNAME record\n`;
        instructions += `• This method preserves your other DNS records\n\n`;
      } else {
        instructions += `📋 For a root domain like ${domain}:\n`;
        instructions += `• Create the following A records\n`;
        instructions += `• Remove any existing A records for @\n\n`;
      }
      
      instructions += `⚠️  Important: Configure these records with your DNS provider\n`;
      instructions += `(GoDaddy, Namecheap, Cloudflare, etc.)\n\n`;
      
      instructions += `📞 Need help? Check your provider's documentation:\n`;
      instructions += `• GoDaddy: Support > DNS Management\n`;
      instructions += `• Namecheap: Domain List > Manage > Advanced DNS\n`;
      instructions += `• Cloudflare: Dashboard > DNS\n`;
      instructions += `• Route 53: AWS Console > Route 53`;
      
      return instructions;
    }
  }

  async getDnsZoneInfo(siteId: string): Promise<any> {
    try {
      return await this.netlifyService.getDnsZonesForSite(siteId);
    } catch (error) {
      console.error('Failed to get DNS zone info:', error);
      return null;
    }
  }

  async removeDomain(siteId: string, domain: string): Promise<void> {
    try {
      console.log(`Removing domain ${domain} from site ${siteId}`);
      
      // Step 1: Remove domain from aliases
      try {
        await this.netlifyService.removeDomainAlias(siteId, domain);
      } catch (error) {
        console.warn('Could not remove domain alias:', error);
      }
      
      // Step 2: Get site info to check if this is the main custom domain
      const site = await this.netlifyService.getSite(siteId);
      if (site.custom_domain === domain) {
        // Remove custom domain from site
        await this.netlifyService.updateSiteDomain(siteId, '');
      }
      
      // Step 3: Optionally clean up DNS zones (be careful with this)
      // Only remove DNS zones if they were created specifically for this site
      try {
        const dnsZones = await this.netlifyService.getDnsZonesForSite(siteId);
        for (const zone of dnsZones) {
          if ((zone.domain === domain || zone.name === domain) && zone.site_id === siteId) {
            console.log(`Removing DNS zone for ${domain}`);
            await this.netlifyService.deleteDnsZone(zone.id);
          }
        }
      } catch (error) {
        console.warn('Could not clean up DNS zones:', error);
      }
      
      console.log(`Successfully removed domain ${domain} from site ${siteId}`);
    } catch (error) {
      console.error('Failed to remove domain:', error);
      throw new Error(`Failed to remove domain: ${error instanceof Error ? error.message : error}`);
    }
  }

  async getDomainStatus(siteId: string, domain: string): Promise<{
    status: 'not_configured' | 'dns_pending' | 'ssl_pending' | 'active' | 'error';
    details: {
      reachable: boolean;
      ssl_enabled: boolean;
      dns_configured: boolean;
      certificate_issued: boolean;
    };
    next_steps: string[];
  }> {
    try {
      const verification = await this.verifyDomain(siteId, domain);
      
      let status: 'not_configured' | 'dns_pending' | 'ssl_pending' | 'active' | 'error' = 'not_configured';
      const next_steps: string[] = [];
      
      if (verification.dns_configured && verification.certificate_issued && verification.ssl_enabled) {
        status = 'active';
      } else if (verification.dns_configured && verification.certificate_issued) {
        status = 'ssl_pending';
        next_steps.push('SSL certificate is being activated');
      } else if (verification.dns_configured) {
        status = 'ssl_pending';
        next_steps.push('SSL certificate is being provisioned');
      } else {
        status = 'dns_pending';
        next_steps.push('Configure DNS records with your domain provider');
        next_steps.push('DNS propagation can take up to 48 hours');
      }
      
      if (!verification.reachable && verification.dns_configured) {
        next_steps.push('Domain propagation is still in progress');
      }
      
      return {
        status,
        details: verification,
        next_steps,
      };
    } catch (error) {
      console.error('Failed to get domain status:', error);
      return {
        status: 'error',
        details: {
          reachable: false,
          ssl_enabled: false,
          dns_configured: false,
          certificate_issued: false,
        },
        next_steps: ['Check domain configuration and try again'],
      };
    }
  }
}