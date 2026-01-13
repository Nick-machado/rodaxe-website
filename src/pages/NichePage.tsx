import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import VideoModal from "@/components/VideoModal";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  niches: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  created_at: string;
}

const NichePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: niche, isLoading: nicheLoading } = useQuery({
    queryKey: ["niche", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("niches")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ["niche-videos", niche?.id],
    queryFn: async () => {
      if (!niche?.id) return [];
      
      const { data, error } = await supabase
        .from("video_niches")
        .select(`
          video_id,
          videos(
            id,
            title,
            description,
            thumbnail_url,
            video_url,
            created_at,
            video_niches(niches(id, name)),
            video_tags(tags(id, name))
          )
        `)
        .eq("niche_id", niche.id);

      if (error) throw error;

      return data?.map((item: any) => ({
        ...item.videos,
        niches: item.videos.video_niches?.map((vn: any) => vn.niches) || [],
        tags: item.videos.video_tags?.map((vt: any) => vt.tags) || [],
      })) || [];
    },
    enabled: !!niche?.id,
  });

  if (nicheLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center dark">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!niche) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center dark">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            Nicho não encontrado
          </h1>
          <a href="/" className="text-primary hover:underline">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  const handleVideoSelect = (video: any) => {
    setSelectedVideo({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url,
      niches: video.niches,
      tags: video.tags,
      created_at: video.created_at,
    });
  };

  return (
    <>
      <Helmet>
        <title>{niche.name} | Rodaxe Audiovisual</title>
        <meta name="description" content={niche.description || `Vídeos de ${niche.name} - Rodaxe Audiovisual`} />
      </Helmet>

      <div className="min-h-screen bg-background dark">
        <Navbar />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[400px]">
          {niche.featured_image_url ? (
            <img
              src={niche.featured_image_url}
              alt={niche.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
          )}
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 bg-background/50" />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-20">
            <p className="cinematic-text text-sm text-primary tracking-[0.3em] mb-4 font-medium opacity-0 animate-fade-up">
              {videos.length} vídeos
            </p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 opacity-0 animate-fade-up delay-100">
              {niche.name}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl opacity-0 animate-fade-up delay-200">
              {niche.description}
            </p>
          </div>
        </section>

        {/* Videos Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            {videosLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando vídeos...
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: any) => (
                  <VideoCard
                    key={video.id}
                    video={{
                      id: video.id,
                      title: video.title,
                      description: video.description || "",
                      thumbnail_url: video.thumbnail_url || "",
                      video_url: video.video_url,
                      niches: video.niches || [],
                      tags: video.tags || [],
                      created_at: video.created_at,
                    }}
                    onClick={() => handleVideoSelect(video)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground text-lg">
                  Nenhum vídeo disponível neste nicho ainda.
                </p>
              </div>
            )}
          </div>
        </section>

        <Footer />

        {/* Video Modal */}
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </div>
    </>
  );
};

export default NichePage;
