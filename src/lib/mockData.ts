export interface Niche {
  id: number;
  name: string;
  slug: string;
  description: string;
  featured_image_url: string;
  video_count: number;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  niches: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  video_count: number;
}

export const mockNiches: Niche[] = [
  {
    id: 1,
    name: "Casamentos",
    slug: "casamentos",
    description: "Eternize cada momento especial do seu dia com cinematografia de casamento de alto padrão",
    featured_image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    video_count: 12,
  },
  {
    id: 2,
    name: "Corporativo",
    slug: "corporativo",
    description: "Vídeos institucionais e comerciais que elevam sua marca ao próximo nível",
    featured_image_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    video_count: 8,
  },
  {
    id: 3,
    name: "Eventos",
    slug: "eventos",
    description: "Cobertura completa de eventos com qualidade cinematográfica",
    featured_image_url: "https://images.unsplash.com/photo-1540575467063-178a50e2df87?w=800&q=80",
    video_count: 15,
  },
  {
    id: 4,
    name: "Fashion",
    slug: "fashion",
    description: "Vídeos de moda com estética refinada e direção de arte impecável",
    featured_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    video_count: 6,
  },
  {
    id: 5,
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Conteúdo autêntico que conecta marcas com seu público",
    featured_image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    video_count: 10,
  },
  {
    id: 6,
    name: "Música",
    slug: "musica",
    description: "Videoclipes e documentários musicais com narrativa visual única",
    featured_image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
    video_count: 7,
  },
];

export const mockVideos: Video[] = [
  {
    id: 1,
    title: "Marina & Lucas - Wedding Film",
    description: "Um dia mágico eternizado em imagens cinematográficas",
    thumbnail_url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80",
    video_url: "https://player.vimeo.com/video/824804225",
    niches: [{ id: 1, name: "Casamentos" }],
    tags: [{ id: 1, name: "Cinematic" }, { id: 2, name: "Emotional" }],
    created_at: "2024-01-15",
  },
  {
    id: 2,
    title: "TechCorp - Institucional",
    description: "Apresentação corporativa premium para startup de tecnologia",
    thumbnail_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    video_url: "https://player.vimeo.com/video/824804225",
    niches: [{ id: 2, name: "Corporativo" }],
    tags: [{ id: 3, name: "Corporate" }, { id: 4, name: "Modern" }],
    created_at: "2024-02-20",
  },
  {
    id: 3,
    title: "Summer Fashion Week",
    description: "Highlights da semana de moda com looks exclusivos",
    thumbnail_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    video_url: "https://player.vimeo.com/video/824804225",
    niches: [{ id: 4, name: "Fashion" }],
    tags: [{ id: 5, name: "Fashion" }, { id: 4, name: "Modern" }],
    created_at: "2024-03-10",
  },
  {
    id: 4,
    title: "Ana & Pedro - Destination Wedding",
    description: "Casamento na Toscana com vistas deslumbrantes",
    thumbnail_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80",
    video_url: "https://player.vimeo.com/video/824804225",
    niches: [{ id: 1, name: "Casamentos" }],
    tags: [{ id: 1, name: "Cinematic" }, { id: 6, name: "Destination" }],
    created_at: "2024-03-25",
  },
  {
    id: 5,
    title: "Acoustic Sessions Vol. 1",
    description: "Série de performances acústicas em locações únicas",
    thumbnail_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    video_url: "https://player.vimeo.com/video/824804225",
    niches: [{ id: 6, name: "Música" }],
    tags: [{ id: 7, name: "Music" }, { id: 8, name: "Live" }],
    created_at: "2024-04-05",
  },
  {
    id: 6,
    title: "Gala de Premiação 2024",
    description: "Cobertura completa do evento mais esperado do ano",
    thumbnail_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    video_url: "https://player.vimeo.com/video/824804225",
    niches: [{ id: 3, name: "Eventos" }],
    tags: [{ id: 9, name: "Event" }, { id: 10, name: "Gala" }],
    created_at: "2024-04-18",
  },
];

export const mockTags: Tag[] = [
  { id: 1, name: "Cinematic", slug: "cinematic", video_count: 8 },
  { id: 2, name: "Emotional", slug: "emotional", video_count: 5 },
  { id: 3, name: "Corporate", slug: "corporate", video_count: 6 },
  { id: 4, name: "Modern", slug: "modern", video_count: 12 },
  { id: 5, name: "Fashion", slug: "fashion", video_count: 4 },
  { id: 6, name: "Destination", slug: "destination", video_count: 3 },
  { id: 7, name: "Music", slug: "music", video_count: 7 },
  { id: 8, name: "Live", slug: "live", video_count: 5 },
  { id: 9, name: "Event", slug: "event", video_count: 9 },
  { id: 10, name: "Gala", slug: "gala", video_count: 2 },
];

export const getVideosByNiche = (nicheSlug: string): Video[] => {
  const niche = mockNiches.find(n => n.slug === nicheSlug);
  if (!niche) return [];
  return mockVideos.filter(v => v.niches.some(n => n.id === niche.id));
};

export const getNicheBySlug = (slug: string): Niche | undefined => {
  return mockNiches.find(n => n.slug === slug);
};

export const getVideoById = (id: number): Video | undefined => {
  return mockVideos.find(v => v.id === id);
};
