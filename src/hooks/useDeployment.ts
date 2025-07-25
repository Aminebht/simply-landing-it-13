import { useState, useCallback } from 'react';
import { DeploymentService } from '@/services/deployment';
import { DeploymentJob, NetlifyDeployment } from '@/types/deployment';
import { DomainManagerService } from '@/services/domain-manager';

export const useDeployment = (netlifyAccessToken?: string) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentJobs, setDeploymentJobs] = useState<DeploymentJob[]>([]);
  
  const deploymentService = netlifyAccessToken ? new DeploymentService(netlifyAccessToken) : null;
  const domainService = netlifyAccessToken ? new DomainManagerService(netlifyAccessToken) : null;

  const deployLandingPage = useCallback(async (
    landingPageId: string,
    customDomain?: string
  ): Promise<{ deploymentId: string; url: string } | null> => {
    if (!deploymentService) {
      setDeploymentError('Netlify access token not configured');
      return null;
    }

    setIsDeploying(true);
    setDeploymentError(null);

    try {
      const result = await deploymentService.deployLandingPage(landingPageId, customDomain);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
      setDeploymentError(errorMessage);
      return null;
    } finally {
      setIsDeploying(false);
    }
  }, [deploymentService]);

  const redeployLandingPage = useCallback(async (
    landingPageId: string
  ): Promise<{ deploymentId: string; url: string } | null> => {
    if (!deploymentService) {
      setDeploymentError('Netlify access token not configured');
      return null;
    }

    setIsDeploying(true);
    setDeploymentError(null);

    try {
      const result = await deploymentService.redeployLandingPage(landingPageId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Redeployment failed';
      setDeploymentError(errorMessage);
      return null;
    } finally {
      setIsDeploying(false);
    }
  }, [deploymentService]);

  const undeployLandingPage = useCallback(async (landingPageId: string): Promise<boolean> => {
    if (!deploymentService) {
      setDeploymentError('Netlify access token not configured');
      return false;
    }

    try {
      await deploymentService.undeployLandingPage(landingPageId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Undeployment failed';
      setDeploymentError(errorMessage);
      return false;
    }
  }, [deploymentService]);

  const getDeploymentStatus = useCallback(async (
    deploymentId: string
  ): Promise<NetlifyDeployment | null> => {
    if (!deploymentService) {
      return null;
    }

    try {
      return await deploymentService.getDeploymentStatus(deploymentId);
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      return null;
    }
  }, [deploymentService]);

  const getDeploymentHistory = useCallback(async (
    landingPageId: string
  ): Promise<DeploymentJob[]> => {
    if (!deploymentService) {
      return [];
    }

    try {
      const jobs = await deploymentService.getDeploymentHistory(landingPageId);
      setDeploymentJobs(jobs);
      return jobs;
    } catch (error) {
      console.error('Failed to get deployment history:', error);
      return [];
    }
  }, [deploymentService]);

  const previewDeployment = useCallback(async (
    landingPageId: string
  ): Promise<string | null> => {
    if (!deploymentService) {
      return null;
    }

    try {
      return await deploymentService.previewDeployment(landingPageId);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return null;
    }
  }, [deploymentService]);

  const setupCustomDomain = useCallback(async (
    siteId: string,
    domain: string
  ) => {
    if (!domainService) {
      setDeploymentError('Domain service not configured');
      return null;
    }

    try {
      const domainConfig = await domainService.setupCustomDomain(siteId, domain);
      const dnsRecords = await domainService.getRequiredDNSRecords(domain, `https://${siteId}.netlify.app`);
      const instructions = domainService.generateDNSInstructions(domain, dnsRecords);
      
      return {
        domainConfig,
        dnsRecords,
        instructions,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Domain setup failed';
      setDeploymentError(errorMessage);
      return null;
    }
  }, [domainService]);

  const verifyDomain = useCallback(async (domain: string): Promise<boolean> => {
    if (!domainService) {
      return false;
    }

    try {
      return await domainService.verifyDomain(domain);
    } catch (error) {
      console.error('Domain verification failed:', error);
      return false;
    }
  }, [domainService]);

  const checkDomainStatus = useCallback(async (domain: string) => {
    if (!domainService) {
      return null;
    }

    try {
      return await domainService.checkDomainStatus(domain);
    } catch (error) {
      console.error('Failed to check domain status:', error);
      return null;
    }
  }, [domainService]);

  return {
    // State
    isDeploying,
    deploymentError,
    deploymentJobs,
    
    // Deployment methods
    deployLandingPage,
    redeployLandingPage,
    undeployLandingPage,
    getDeploymentStatus,
    getDeploymentHistory,
    previewDeployment,
    
    // Domain methods
    setupCustomDomain,
    verifyDomain,
    checkDomainStatus,
    
    // Utility
    clearError: () => setDeploymentError(null),
  };
};