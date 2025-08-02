export interface DeploymentJob {
  id: string;
  landing_page_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  job_data?: Record<string, any>;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface NetlifyDeployment {
  id: string;
  site_id: string;
  deploy_url: string;
  state: 'building' | 'ready' | 'error';
  created_at: string;
  deploy_ssl_url?: string;
  branch?: string;
  commit_ref?: string;
}

export interface DeploymentConfig {
  site_name: string;
  custom_domain?: string;
  environment_variables?: Record<string, string>;
  build_command?: string;
  publish_directory?: string;
}

export interface DomainConfig {
  domain: string;
  ssl_enabled: boolean;
  dns_verified: boolean;
  certificate_state?: string;
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
  required_dns_records: {
    type: 'A' | 'CNAME' | 'TXT';
    hostname: string;
    value: string;
    ttl?: number;
  }[];
}

export interface DomainVerificationStatus {
  reachable: boolean;
  ssl_enabled: boolean;
  redirects_properly: boolean;
  dns_configured: boolean;
  certificate_issued: boolean;
}