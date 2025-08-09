import { useState, useCallback, useEffect } from 'react';
import { OptimizedDeploymentService, OptimizedDeploymentResult, DeploymentStatus, GeneratedFiles } from '@/services/optimized-deployment-service';

interface UseOptimizedDeploymentReturn {
  // Core deployment functions
  deployLandingPage: (pageId: string, generatedFiles?: GeneratedFiles) => Promise<OptimizedDeploymentResult>;
  getDeploymentStatus: (pageId: string) => Promise<DeploymentStatus>;
  
  // State management
  isDeploying: boolean;
  deploymentError: string | null;
  lastDeploymentResult: OptimizedDeploymentResult | null;
  
  // Real-time status
  deploymentStatus: DeploymentStatus | null;
  
  // Utility functions
  cancelDeployment: (pageId: string) => Promise<boolean>;
  clearError: () => void;
  refreshStatus: (pageId: string) => Promise<void>;
}

export function useOptimizedDeployment(): UseOptimizedDeploymentReturn {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [lastDeploymentResult, setLastDeploymentResult] = useState<OptimizedDeploymentResult | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  
  const deploymentService = new OptimizedDeploymentService();

  // Clear error function
  const clearError = useCallback(() => {
    setDeploymentError(null);
  }, []);

  // Deploy landing page with state management
  const deployLandingPage = useCallback(async (pageId: string, generatedFiles?: GeneratedFiles): Promise<OptimizedDeploymentResult> => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);
      
      console.log('🚀 Starting optimized deployment...');
      
      const result = await deploymentService.deployLandingPage(pageId, generatedFiles);
      
      setLastDeploymentResult(result);
      
      if (result.success) {
        console.log('✅ Deployment successful:', result.url);
        // Refresh status after successful deployment
        await refreshStatus(pageId);
      } else {
        console.error('❌ Deployment failed:', result.error);
        setDeploymentError(result.error || 'Deployment failed');
      }
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
      console.error('❌ Deployment error:', errorMessage);
      
      setDeploymentError(errorMessage);
      setLastDeploymentResult({
        success: false,
        error: errorMessage,
        status: 'error'
      });
      
      return {
        success: false,
        error: errorMessage,
        status: 'error'
      };
    } finally {
      setIsDeploying(false);
    }
  }, [deploymentService]);

  // Get deployment status
  const getDeploymentStatus = useCallback(async (pageId: string): Promise<DeploymentStatus> => {
    try {
      const status = await deploymentService.getDeploymentStatus(pageId);
      setDeploymentStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to get deployment status:', error);
      const fallbackStatus: DeploymentStatus = { isDeployed: false };
      setDeploymentStatus(fallbackStatus);
      return fallbackStatus;
    }
  }, [deploymentService]);

  // Refresh deployment status
  const refreshStatus = useCallback(async (pageId: string): Promise<void> => {
    try {
      await getDeploymentStatus(pageId);
    } catch (error) {
      console.error('Failed to refresh deployment status:', error);
    }
  }, [getDeploymentStatus]);

  // Cancel deployment
  const cancelDeployment = useCallback(async (pageId: string): Promise<boolean> => {
    try {
      const success = await deploymentService.cancelDeployment(pageId);
      if (success) {
        setIsDeploying(false);
        await refreshStatus(pageId);
      }
      return success;
    } catch (error) {
      console.error('Failed to cancel deployment:', error);
      return false;
    }
  }, [deploymentService, refreshStatus]);

  // Auto-refresh status when deployment state changes
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isDeploying) {
      // Poll deployment status every 2 seconds while deploying
      intervalId = setInterval(async () => {
        // You could check if deployment is still in progress here
        // and stop polling when it's done
      }, 2000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isDeploying]);

  return {
    // Core functions
    deployLandingPage,
    getDeploymentStatus,
    
    // State
    isDeploying,
    deploymentError,
    lastDeploymentResult,
    deploymentStatus,
    
    // Utilities
    cancelDeployment,
    clearError,
    refreshStatus
  };
}

// Additional hook for monitoring deployment progress
export function useDeploymentMonitor(pageId: string | null) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [deploymentLogs, setDeploymentLogs] = useState<any[]>([]);
  
  const deploymentService = new OptimizedDeploymentService();
  
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);
  
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);
  
  const refreshLogs = useCallback(async () => {
    if (!pageId) return;
    
    try {
      const logs = await deploymentService.getDeploymentLogs(pageId);
      setDeploymentLogs(logs);
    } catch (error) {
      console.error('Failed to refresh deployment logs:', error);
    }
  }, [pageId, deploymentService]);
  
  // Monitor deployment status
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (isMonitoring && pageId) {
      const checkStatus = async () => {
        try {
          const status = await deploymentService.getDeploymentStatus(pageId);
          setDeploymentStatus(status);
          
          // Check if deployment is still in progress
          const inProgress = await deploymentService.isDeploymentInProgress(pageId);
          if (!inProgress) {
            setIsMonitoring(false);
          }
        } catch (error) {
          console.error('Failed to check deployment status:', error);
        }
      };
      
      // Check immediately
      checkStatus();
      
      // Then check every 3 seconds
      intervalId = setInterval(checkStatus, 3000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, pageId, deploymentService]);
  
  // Refresh logs when monitoring starts
  useEffect(() => {
    if (isMonitoring && pageId) {
      refreshLogs();
    }
  }, [isMonitoring, pageId, refreshLogs]);
  
  return {
    isMonitoring,
    deploymentStatus,
    deploymentLogs,
    startMonitoring,
    stopMonitoring,
    refreshLogs
  };
}
