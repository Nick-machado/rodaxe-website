import { useQueryClient } from '@tanstack/react-query';
import { fetchPortfolioProject, fetchPortfolioMedia } from './usePortfolioApi';

export const usePrefetchPortfolio = () => {
  const queryClient = useQueryClient();

  const prefetchProject = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['portfolio-project', slug],
      queryFn: () => fetchPortfolioProject(slug),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  const prefetchMedia = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['portfolio-media', projectId],
      queryFn: () => fetchPortfolioMedia(projectId),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  return { prefetchProject, prefetchMedia };
};

export default usePrefetchPortfolio;
