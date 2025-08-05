import { useState } from 'react';
import { ReactDeploymentService } from '@/services/react-deployment-service';

export function useReactDeployment(netlifyToken: string, useReactProject: boolean = false) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const deployLandingPage = async (pageId: string) => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);

      const deploymentType = useReactProject ? 'React project' : 'static HTML';
      console.log(`Starting ${deploymentType} deployment for page:`, pageId);

      const deploymentService = new ReactDeploymentService(netlifyToken, useReactProject);
      const result = await deploymentService.deployLandingPage(pageId);

      console.log(`${deploymentType} deployment completed successfully:`, result);
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
