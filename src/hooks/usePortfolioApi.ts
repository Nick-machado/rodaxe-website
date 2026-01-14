const API_URL = import.meta.env.VITE_PORTFOLIO_API_URL;

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  cover_image_url: string;
  cover_video_url: string | null;
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

export async function fetchPortfolioProjects(): Promise<PortfolioProject[]> {
  const response = await fetch(`${API_URL}?action=projects`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar projetos');
  }
  return response.json();
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
