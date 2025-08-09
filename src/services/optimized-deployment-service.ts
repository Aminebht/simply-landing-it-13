import { supabase } from './supabase';

export interface OptimizedDeploymentResult {
  success: boolean;
  url?: string;
  siteId?: string;
  error?: string;
  status: 'deploying' | 'success' | 'error';
}

export interface GeneratedFiles {
  html: string;
  css: string;
  js: string;
}

export interface DeploymentStatus {
  isDeployed: boolean;
  siteId?: string;
  url?: string;
  lastDeployedAt?: string;
}

export class OptimizedDeploymentService {
  
  constructor() {
    // No need to store Netlify token - it's handled server-side via Supabase secrets
  }

  /**
   * Deploy landing page using the optimized server-side edge function
   * This replaces the complex client-side deployment flow with a single request
   */
  async deployLandingPage(pageId: string, generatedFiles?: GeneratedFiles): Promise<OptimizedDeploymentResult> {
    try {
      console.log('🚀 Starting optimized deployment for page:', pageId);

      // Call the optimized Supabase Edge Function that handles everything server-side
      const { data, error } = await supabase.functions.invoke('deploy-landing-page', {
        body: {
          pageId,
          generatedFiles
          // No netlifyToken needed - it's stored as a Supabase secret
        }
      });

      if (error) {
        console.error('❌ Deployment edge function error:', error);
        throw new Error(error.message || 'Deployment failed');
      }

      if (!data.success) {
        console.error('❌ Deployment failed:', data.error);
        throw new Error(data.error || 'Deployment failed');
      }

      console.log('✅ Optimized deployment completed successfully:', {
        url: data.url,
        siteId: data.siteId
      });

      return {
        success: true,
        url: data.url,
        siteId: data.siteId,
        status: 'success'
      };

    } catch (error) {
      console.error('❌ Optimized deployment failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error',
        status: 'error'
      };
    }
  }

  /**
   * Get deployment status for a landing page
   */
  async getDeploymentStatus(pageId: string): Promise<DeploymentStatus> {
    try {
      console.log('📊 Checking deployment status for page:', pageId);

      const { data, error } = await supabase
        .from('landing_pages')
        .select('netlify_site_id, last_deployed_at, status')
        .eq('id', pageId)
        .single();

      if (error) {
        console.error('Failed to get deployment status:', error);
        return { isDeployed: false };
      }

      // Generate URL from netlify_site_id if available
      let deployedUrl: string | undefined = undefined;
      if (data.netlify_site_id) {
        // Netlify URLs follow the pattern: https://{site_id}.netlify.app
        deployedUrl = `https://${data.netlify_site_id}.netlify.app`;
      }

      return {
        isDeployed: !!data.netlify_site_id && data.status === 'published',
        siteId: data.netlify_site_id || undefined,
        url: deployedUrl,
        lastDeployedAt: data.last_deployed_at || undefined
      };

    } catch (error) {
      console.error('Failed to get deployment status:', error);
      return { isDeployed: false };
    }
  }

  /**
   * Check if a deployment is in progress
   * This can be used to show loading states
   */
  async isDeploymentInProgress(pageId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('status')
        .eq('id', pageId)
        .single();

      if (error) {
        return false;
      }

      return data.status === 'deploying';

    } catch (error) {
      return false;
    }
  }

  /**
   * Cancel a deployment (if supported by your backend)
   */
  async cancelDeployment(pageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ status: 'draft' })
        .eq('id', pageId);

      return !error;

    } catch (error) {
      console.error('Failed to cancel deployment:', error);
      return false;
    }
  }

  /**
   * Get deployment logs/history for debugging
   */
  async getDeploymentLogs(pageId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('deployment_logs')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to get deployment logs:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Failed to get deployment logs:', error);
      return [];
    }
  }
}

// Helper hook for React components
export function useOptimizedDeployment() {
  const deploymentService = new OptimizedDeploymentService();

  const deployLandingPage = async (pageId: string, generatedFiles?: GeneratedFiles): Promise<OptimizedDeploymentResult> => {
    return await deploymentService.deployLandingPage(pageId, generatedFiles);
  };

  const getDeploymentStatus = async (pageId: string): Promise<DeploymentStatus> => {
    return await deploymentService.getDeploymentStatus(pageId);
  };

  const isDeploymentInProgress = async (pageId: string): Promise<boolean> => {
    return await deploymentService.isDeploymentInProgress(pageId);
  };

  return {
    deployLandingPage,
    getDeploymentStatus,
    isDeploymentInProgress,
    cancelDeployment: deploymentService.cancelDeployment.bind(deploymentService),
    getDeploymentLogs: deploymentService.getDeploymentLogs.bind(deploymentService)
  };
}
