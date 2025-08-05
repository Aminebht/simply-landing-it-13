import { useState } from 'react';
import { ReactDeploymentService } from '@/services/react-deployment-service';

export function useReactDeployment(netlifyToken: string) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const deployLandingPage = async (pageId: string) => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);

      console.log('Starting React project deployment for page:', pageId);

      const deploymentService = new ReactDeploymentService(netlifyToken);
      const result = await deploymentService.deployLandingPage(pageId);

      console.log('React project deployment completed successfully:', result);
      return result;

    } catch (error) {
      console.error('Deployment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
      setDeploymentError(errorMessage);
      throw error;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    deployLandingPage,
    isDeploying,
    deploymentError
  };
}
