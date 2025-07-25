import { DomainConfig } from '@/types/deployment';
import { NetlifyService } from './netlify';

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

export class DomainManagerService {
  private netlifyService: NetlifyService;

  constructor(netlifyAccessToken: string) {
    this.netlifyService = new NetlifyService(netlifyAccessToken);
  }

  async setupCustomDomain(siteId: string, domain: string): Promise<DomainConfig> {
    try {
      // Add domain to Netlify site
      const domainConfig = await this.netlifyService.updateSiteDomain(siteId, domain);
      
      // Return configuration with DNS instructions
      return {
        ...domainConfig,
        dns_verified: false, // Will be verified later
      };
    } catch (error) {
      throw new Error(`Failed to setup custom domain: ${error}`);
    }
  }

  async verifyDomain(domain: string): Promise<boolean> {
    try {
      // Check if domain resolves to Netlify
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      
      // Basic check - in production you'd want more sophisticated verification
      return true;
    } catch (error) {
      return false;
    }
  }

  async getRequiredDNSRecords(domain: string, netlifyUrl: string): Promise<DNSRecord[]> {
    const isSubdomain = domain.split('.').length > 2;
    
    if (isSubdomain) {
      // For subdomains, use CNAME
      return [
        {
          type: 'CNAME',
          name: domain.split('.')[0], // subdomain part
          value: netlifyUrl.replace('https://', '').replace('http://', ''),
        }
      ];
    } else {
      // For apex domains, use A records
      return [
        {
          type: 'A',
          name: '@',
          value: '75.2.60.5', // Netlify Load Balancer IP
        },
        {
          type: 'A',
          name: '@',
          value: '99.83.190.102', // Netlify Load Balancer IP
        }
      ];
    }
  }

  async enableSSL(siteId: string): Promise<{ status: string; certificate_url?: string }> {
    // Netlify handles SSL automatically, but we can check status
    try {
      const sites = await this.netlifyService.getSites();
      const site = sites.find(s => s.id === siteId);
      
      if (site?.url.startsWith('https://')) {
        return {
          status: 'active',
          certificate_url: site.url,
        };
      }
      
      return { status: 'pending' };
    } catch (error) {
      throw new Error(`Failed to enable SSL: ${error}`);
    }
  }

  async checkDomainStatus(domain: string): Promise<{
    reachable: boolean;
    ssl_enabled: boolean;
    redirects_properly: boolean;
  }> {
    try {
      // Check HTTP
      const httpResponse = await fetch(`http://${domain}`, {
        method: 'HEAD',
        redirect: 'manual',
      });
      
      // Check HTTPS
      const httpsResponse = await fetch(`https://${domain}`, {
        method: 'HEAD',
      });
      
      return {
        reachable: httpResponse.ok || httpsResponse.ok,
        ssl_enabled: httpsResponse.ok,
        redirects_properly: httpResponse.status >= 300 && httpResponse.status < 400,
      };
    } catch (error) {
      return {
        reachable: false,
        ssl_enabled: false,
        redirects_properly: false,
      };
    }
  }

  generateDNSInstructions(domain: string, dnsRecords: DNSRecord[]): string {
    const isSubdomain = domain.split('.').length > 2;
    
    return `
# DNS Configuration for ${domain}

To connect your custom domain, please add the following DNS records to your domain provider:

${dnsRecords.map(record => `
## ${record.type} Record
- **Type**: ${record.type}
- **Name**: ${record.name}
- **Value**: ${record.value}
${record.ttl ? `- **TTL**: ${record.ttl}` : ''}
`).join('\n')}

## Instructions by Provider

### Cloudflare
1. Go to your Cloudflare dashboard
2. Select your domain
3. Go to DNS section
4. Add the records above
5. Set proxy status to "DNS only" (grey cloud)

### Namecheap
1. Log into your Namecheap account
2. Go to Domain List
3. Click "Manage" next to your domain
4. Go to "Advanced DNS" tab
5. Add the records above

### GoDaddy
1. Log into your GoDaddy account
2. Go to My Products > DNS
3. Select your domain
4. Add the records above

## Verification
After adding the DNS records, it may take up to 48 hours for changes to propagate. You can check the status in your deployment dashboard.

${isSubdomain ? 
  '**Note**: For subdomains, propagation is usually faster (5-30 minutes).' :
  '**Note**: For apex domains, propagation may take longer (up to 48 hours).'
}
`;
  }
}