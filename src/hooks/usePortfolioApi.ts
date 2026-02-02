import { useQuery } from '@tanstack/react-query';

const API_URL = 'https://xtwzpcfglkgvwzgljiir.supabase.co/functions/v1/portfolio-api';

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  cover_image_url: string;
  main_video_url: string | null;
  project_date: string | null;
  description: string | null;
}

export interface PortfolioMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  sort_order: number;
}

// Fetch functions (for direct use and prefetching)
export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  const response = await fetch(`${API_URL}?action=projects`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar projetos');
  }
  const result = await response.json();
  // API returns { data: [...], pagination: {...} } - extract the data array
  return result.data || result;
}

export async function fetchPortfolioProject(slug: string): Promise<PortfolioProject> {
  const response = await fetch(`${API_URL}?action=project&slug=${encodeURIComponent(slug)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Projeto não encontrado');
  }
  return response.json();
}

export async function fetchPortfolioMedia(projectId: string): Promise<PortfolioMedia[]> {
  const response = await fetch(`${API_URL}?action=media&projectId=${encodeURIComponent(projectId)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar mídias');
  }
  return response.json();
}

// React Query hooks with optimized cache settings
const CACHE_CONFIG = {
  staleTime: 1000 * 60 * 30, // 30 minutes
  gcTime: 1000 * 60 * 60, // 1 hour
};

export function usePortfolioProjects() {
  return useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: fetchPortfolioProjects,
    ...CACHE_CONFIG,
  });
}

export function usePortfolioProject(slug: string) {
  return useQuery({
    queryKey: ['portfolio-project', slug],
    queryFn: () => fetchPortfolioProject(slug),
    enabled: !!slug,
    ...CACHE_CONFIG,
  });
}

export function usePortfolioMedia(projectId: string) {
  return useQuery({
    queryKey: ['portfolio-media', projectId],
    queryFn: () => fetchPortfolioMedia(projectId),
    enabled: !!projectId,
    ...CACHE_CONFIG,
  });
}
