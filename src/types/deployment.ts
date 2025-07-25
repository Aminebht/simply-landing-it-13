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