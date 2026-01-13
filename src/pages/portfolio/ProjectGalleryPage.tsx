import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Download, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
}

interface PortfolioMedia {
  id: string;
  project_id: string;
  type: string;
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  sort_order: number;
}

type FilterType = "all" | "image" | "video";

const ProjectGalleryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: project } = useQuery({
    queryKey: ["portfolio-project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data as PortfolioProject;
    },
    enabled: !!slug,
  });

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["portfolio-media", project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const { data, error } = await supabase
        .from("portfolio_media")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as PortfolioMedia[];
    },
    enabled: !!project?.id,
  });

  const filteredMedia = useMemo(() => {
    if (activeFilter === "all") return media;
    return media.filter((item) => item.type === activeFilter);
  }, [media, activeFilter]);

  const imageCount = media.filter((m) => m.type === "image").length;
  const videoCount = media.filter((m) => m.type === "video").length;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredMedia.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} - Galeria | Rodaxe Portfolio</title>
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Project Title & Filters */}
              <div className="flex items-center gap-8">
                <Link
                  to={`/portfolio/${slug}`}
                  className="text-white font-display text-sm tracking-wide hover:text-primary transition-colors"
                >
                  {project.title}
                  {project.location && (
                    <span className="text-white/50"> - {project.location}</span>
                  )}
                </Link>

                <div className="hidden md:flex items-center gap-4 text-sm">
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`transition-colors ${
                      activeFilter === "all"
                        ? "text-white font-medium"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    Full Quality
                  </button>
                  {imageCount > 0 && (
                    <button
                      onClick={() => setActiveFilter("image")}
                      className={`transition-colors ${
                        activeFilter === "image"
                          ? "text-white font-medium"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Imagens ({imageCount})
                    </button>
                  )}
                  {videoCount > 0 && (
                    <button
                      onClick={() => setActiveFilter("video")}
                      className={`transition-colors ${
                        activeFilter === "video"
                          ? "text-white font-medium"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Vídeos ({videoCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <Download size={16} />
                  <span className="hidden md:inline">Download</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                  <Play size={16} />
                  <span className="hidden md:inline">Apresentação</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Gallery Grid - Masonry Style */}
        <main className="pt-14">
          {isLoading ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <p className="text-white/50">Nenhuma mídia disponível.</p>
              <Button
                onClick={() => navigate(`/portfolio/${slug}`)}
                variant="outline"
                className="mt-4 border-white/30 text-white hover:bg-white/10"
              >
                Voltar
              </Button>
            </div>
          ) : (
            <div className="p-1">
              {/* Masonry Grid using CSS columns */}
              <div className="columns-2 md:columns-3 gap-1">
                {filteredMedia.map((item, index) => (
                  <div
                    key={item.id}
                    className="break-inside-avoid mb-1 relative group cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    {item.type === "video" ? (
                      <div className="relative">
                        <img
                          src={item.thumbnail_url || item.url}
                          alt={item.title || "Video thumbnail"}
                          className="w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || "Gallery image"}
                        className="w-full object-cover transition-opacity group-hover:opacity-90"
                        loading="lazy"
                      />
                    )}

                    {/* Hover overlay with download */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.url, item.title || `media-${index}`);
                        }}
                        className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              onClick={closeLightbox}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>

              {/* Previous button */}
              {lightboxIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
                >
                  <ChevronLeft size={48} />
                </button>
              )}

              {/* Next button */}
              {lightboxIndex < filteredMedia.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white transition-colors"
                >
                  <ChevronRight size={48} />
                </button>
              )}

              {/* Media content */}
              <motion.div
                key={lightboxIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {filteredMedia[lightboxIndex].type === "video" ? (
                  <video
                    src={filteredMedia[lightboxIndex].url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[90vh]"
                  />
                ) : (
                  <img
                    src={filteredMedia[lightboxIndex].url}
                    alt={filteredMedia[lightboxIndex].title || ""}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                )}
              </motion.div>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {lightboxIndex + 1} / {filteredMedia.length}
              </div>

              {/* Download button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(
                    filteredMedia[lightboxIndex].url,
                    filteredMedia[lightboxIndex].title || `media-${lightboxIndex}`
                  );
                }}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProjectGalleryPage;
